import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItTaskLists from 'markdown-it-task-lists';
import markdownItFootnote from 'markdown-it-footnote';
import markdownItDeflist from 'markdown-it-deflist';
import markdownItMark from 'markdown-it-mark';
import markdownItSub from 'markdown-it-sub';
import markdownItSup from 'markdown-it-sup';
import markdownItTexmath from 'markdown-it-texmath';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import katex from 'katex';
import { PALETTE } from '../utils/constants';

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Escapes HTML using markdown-it's built-in utility. Lazily initialised. */
const escapeHtml = (() => {
  let utils;
  return (value) => {
    utils ??= new MarkdownIt().utils;
    return utils.escapeHtml(value);
  };
})();

/** Generates a unique ID suitable for DOM element IDs. */
const uid = (prefix = 'id') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ---------------------------------------------------------------------------
// DOMPurify config
// ---------------------------------------------------------------------------

const DOMPURIFY_CONFIG = {
  // KaTeX / MathML requires these tags and attributes.
  ADD_TAGS: [
    'math',
    'semantics',
    'annotation',
    'eq',
    'eqn',
    'menclose',
    'mfrac',
    'msup',
    'msub',
    'msubsup',
    'mover',
    'munder',
    'munderover',
    'mtable',
    'mtr',
    'mtd',
    'mtext',
    'mspace',
    'mi',
    'mn',
    'mo',
    'mstyle',
    'msqrt',
    'mroot',
    'mfenced',
  ],
  ADD_ATTR: [
    'encoding',
    'display',
    'style',
    'class',
    'aria-hidden',
    'mathvariant',
    'mathsize',
    'mathcolor',
    'mathbackground',
    'notation',
    'stretchy',
    'linethickness',
  ],
  USE_PROFILES: { html: true, svg: true, mathMl: true },
  KEEP_CONTENT: true,
};

// ---------------------------------------------------------------------------
// Mermaid helpers
// ---------------------------------------------------------------------------

const MERMAID_CLASS_RE = /\blang(?:uage)?-mermaid\b/i;

const isMermaidBlock = (code) => MERMAID_CLASS_RE.test(code.className ?? '');

const makeMermaidTheme = (isDark) =>
  isDark
    ? {
        primaryColor: '#0B2E6D',
        primaryTextColor: '#EAF2FF',
        primaryBorderColor: PALETTE.accent,
        lineColor: PALETTE.accent,
        secondaryColor: '#133C85',
        tertiaryColor: '#0A234F',
        background: '#071833',
        mainBkg: '#0B2E6D',
        nodeBorder: PALETTE.accent,
        edgeLabelBackground: '#133C85',
      }
    : {
        primaryColor: '#DCEAFF',
        primaryTextColor: '#0B2E6D',
        primaryBorderColor: PALETTE.primary,
        lineColor: PALETTE.primary,
        secondaryColor: '#EAF2FF',
        tertiaryColor: '#F5F9FF',
        background: '#FFFFFF',
        mainBkg: '#DCEAFF',
        nodeBorder: PALETTE.primary,
        edgeLabelBackground: '#EAF2FF',
      };

export const getMermaidConfig = (isDark) => ({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'strict',
  fontFamily: 'Inter, Segoe UI, sans-serif',
  flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'linear' },
  themeVariables: makeMermaidTheme(isDark),
});

// ---------------------------------------------------------------------------
// Markdown parser factory
// ---------------------------------------------------------------------------

export function createMarkdownParser() {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
    highlight: highlightCode,
  });

  // Normalise LaTeX bracket delimiters before markdown-it escapes them.
  md.core.ruler.before('normalize', 'math_normalize', normalizeMathDelimiters);

  return md
    .use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.ariaHidden({
        symbol: '#',
        placement: 'after',
      }),
    })
    .use(markdownItTaskLists, { enabled: true })
    .use(markdownItFootnote)
    .use(markdownItDeflist)
    .use(markdownItMark)
    .use(markdownItSub)
    .use(markdownItSup)
    .use(markdownItTexmath, {
      engine: katex,
      delimiters: 'dollars',
      katexOptions: { throwOnError: false },
    });
}

/** Core rule: convert `\[…\]` and `\(…\)` delimiters to dollar-sign equivalents. */
function normalizeMathDelimiters(state) {
  state.src = state.src
    .replace(/\\\[/g, '$$$$')
    .replace(/\\\]/g, '$$$$')
    .replace(/\\\(/g, '$$')
    .replace(/\\\)/g, '$$');
  return true;
}

/** highlight.js code block renderer used by markdown-it. */
function highlightCode(str, lang) {
  if (lang?.toLowerCase() === 'mermaid') {
    return `<pre><code class="language-mermaid">${escapeHtml(str)}</code></pre>`;
  }

  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(str, {
        language: lang,
        ignoreIllegals: true,
      }).value;
      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
    } catch {
      // Fall through to plain escaped rendering.
    }
  }

  return `<pre><code class="hljs language-${lang || 'text'}">${escapeHtml(str)}</code></pre>`;
}

// ---------------------------------------------------------------------------
// HTML sanitisation
// ---------------------------------------------------------------------------

export const sanitizeRenderedHtml = (rawHtml) =>
  DOMPurify.sanitize(rawHtml, DOMPURIFY_CONFIG);

// ---------------------------------------------------------------------------
// Preview enrichment
// ---------------------------------------------------------------------------

/**
 * Enriches a rendered preview element with syntax highlighting, Mermaid
 * diagrams, and copy buttons.
 *
 * @param {Element} previewElement
 * @param {boolean} isDark
 * @param {() => boolean} [shouldAbort]
 */
export async function enrichPreviewContent(
  previewElement,
  isDark,
  shouldAbort = () => false
) {
  if (!previewElement || shouldAbort()) return;

  highlightCodeBlocks(previewElement);

  if (shouldAbort()) return;

  await renderMermaidDiagrams(previewElement, isDark, shouldAbort);

  if (shouldAbort()) return;

  addCopyButtons(previewElement);
}

/** Applies highlight.js to all non-Mermaid code blocks. */
function highlightCodeBlocks(previewElement) {
  for (const block of previewElement.querySelectorAll('pre code')) {
    if (isMermaidBlock(block)) continue;
    try {
      hljs.highlightElement(block);
    } catch {
      // Leave unhighlighted — progressive enhancement only.
    }
  }
}

/** Replaces Mermaid `<pre><code>` blocks with rendered SVG diagrams. */
async function renderMermaidDiagrams(previewElement, isDark, shouldAbort) {
  const codeBlocks = Array.from(previewElement.querySelectorAll('pre code')).filter(
    isMermaidBlock
  );
  if (!codeBlocks.length) return;

  // Swap <pre><code> elements with placeholder <div class="mermaid"> containers.
  const containers = codeBlocks.map((node, index) => {
    const container = Object.assign(document.createElement('div'), {
      className: 'mermaid',
      id: uid(`mermaid-${index}`),
      textContent: node.textContent ?? '',
    });
    node.parentElement?.replaceWith(container);
    return container;
  });

  if (shouldAbort()) return;

  try {
    const { default: mermaid } = await import('mermaid');
    mermaid.initialize(getMermaidConfig(isDark));

    for (const container of containers) {
      if (shouldAbort()) return;

      const source = container.textContent?.trim();
      if (!source) continue;

      try {
        const { svg, bindFunctions } = await mermaid.render(
          uid('mermaid-render'),
          source
        );
        if (shouldAbort()) return;
        container.innerHTML = svg;
        bindFunctions?.(container);
      } catch {
        renderMermaidError(container, source);
      }
    }
  } catch {
    containers.forEach((c) => renderMermaidError(c, c.textContent?.trim() ?? ''));
  }
}

const renderMermaidError = (container, source) => {
  container.innerHTML =
    `<pre class="mermaid-error"><code>${escapeHtml(source)}</code></pre>` +
    '<p class="mermaid-error-message">Mermaid diagram failed to render.</p>';
};

/** Appends a "Copy" button to every non-Mermaid `<pre><code>` block. */
function addCopyButtons(previewElement) {
  for (const code of previewElement.querySelectorAll('pre > code')) {
    if (isMermaidBlock(code)) continue;

    const pre = code.parentElement;
    if (!pre || pre.querySelector('.code-copy')) continue;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.textContent = 'Copy';
    button.addEventListener('click', () => handleCopyClick(button, code));

    pre.style.position = 'relative';
    pre.appendChild(button);
  }
}

async function handleCopyClick(button, code) {
  const text = code.innerText ?? code.textContent ?? '';
  const [label, resetDelay] = await navigator.clipboard
    .writeText(text)
    .then(() => ['Copied', 1500])
    .catch(() => ['Error', 1500]);

  button.textContent = label;
  setTimeout(() => {
    button.textContent = 'Copy';
  }, resetDelay);
}

// ---------------------------------------------------------------------------
// Table of contents
// ---------------------------------------------------------------------------

/**
 * Builds a flat TOC descriptor array from the headings in a rendered element.
 *
 * @param {Element|null} previewElement
 * @returns {{ id: string; text: string; level: number }[]}
 */
export function buildTocItems(previewElement) {
  if (!previewElement) return [];

  return Array.from(previewElement.querySelectorAll('h1, h2, h3')).map(
    (heading, index) => {
      heading.id ||= slugify(heading.textContent ?? `heading-${index}`);
      return {
        id: heading.id,
        text: (heading.textContent ?? '').replace(/#$/, '').trim(),
        level: Number(heading.tagName[1]),
      };
    }
  );
}

const slugify = (text) =>
  text
    .replace(/#$/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-');
