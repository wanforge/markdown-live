import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItTaskLists from 'markdown-it-task-lists';
import markdownItFootnote from 'markdown-it-footnote';
import markdownItDeflist from 'markdown-it-deflist';
import markdownItMark from 'markdown-it-mark';
import markdownItSub from 'markdown-it-sub';
import markdownItSup from 'markdown-it-sup';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import { PALETTE } from '../utils/constants';

const escapeHtml = (() => {
  const parser = new MarkdownIt();
  return (value) => parser.utils.escapeHtml(value);
})();

export function createMarkdownParser() {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
    highlight(str, lang) {
      if (lang && lang.toLowerCase() === 'mermaid') {
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
          // Fall through to escaped rendering.
        }
      }

      return `<pre><code class="hljs language-${lang || 'text'}">${escapeHtml(str)}</code></pre>`;
    },
  });

  // Core rule to normalize LaTeX bracket delimiters into dollar delimiters.
  // This solves the issue where \[ \] and \( \) are escaped by markdown-it
  // before the texmath plugin can process them, especially when no newline is present.
  md.core.ruler.before('normalize', 'math_normalize', (state) => {
    state.src = state.src
      .replace(/\\\[/g, '$$$$')
      .replace(/\\\]/g, '$$$$')
      .replace(/\\\(/g, '$$')
      .replace(/\\\)/g, '$$');
    return true;
  });

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
    .use(texmath, {
      engine: katex,
      delimiters: 'dollars',
      katexOptions: { throwOnError: false },
    });
}

export function sanitizeRenderedHtml(rawHtml) {
  return DOMPurify.sanitize(rawHtml, {
    // KaTeX requires specific tags and attributes to render properly,
    // especially for complex commands like \boxed which use menclose and MathML.
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
  });
}

export function getMermaidConfig(isDark) {
  if (isDark) {
    return {
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'strict',
      fontFamily: 'Inter, Segoe UI, sans-serif',
      flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'linear' },
      themeVariables: {
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
      },
    };
  }

  return {
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'strict',
    fontFamily: 'Inter, Segoe UI, sans-serif',
    flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'linear' },
    themeVariables: {
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
    },
  };
}

function isMermaidCodeBlock(codeNode) {
  const className = (codeNode.className || '').toLowerCase();
  return className.includes('language-mermaid') || className.includes('lang-mermaid');
}

export async function enrichPreviewContent(
  previewElement,
  isDark,
  shouldAbort = () => false
) {
  if (!previewElement || shouldAbort()) return;

  previewElement.querySelectorAll('pre code').forEach((block) => {
    if (!isMermaidCodeBlock(block)) {
      try {
        hljs.highlightElement(block);
      } catch {
        // Leave the block unhighlighted if the language parser rejects it.
      }
    }
  });

  const mermaidCodes = Array.from(previewElement.querySelectorAll('pre code')).filter(
    isMermaidCodeBlock
  );

  if (shouldAbort()) return;

  mermaidCodes.forEach((node, index) => {
    if (shouldAbort()) return;

    const pre = node.parentElement;
    if (!pre) return;

    const container = document.createElement('div');
    container.className = 'mermaid';
    container.id = `mermaid-${Date.now()}-${index}`;
    container.textContent = node.textContent || '';
    pre.replaceWith(container);
  });

  if (mermaidCodes.length > 0) {
    try {
      if (shouldAbort()) return;

      const { default: mermaid } = await import('mermaid');
      mermaid.initialize(getMermaidConfig(isDark));

      const mermaidNodes = Array.from(previewElement.querySelectorAll('.mermaid'));

      for (const [index, node] of mermaidNodes.entries()) {
        if (shouldAbort()) return;

        const source = (node.textContent || '').trim();
        if (!source) continue;

        const renderId = `mermaid-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;

        try {
          const { svg, bindFunctions } = await mermaid.render(renderId, source);
          if (shouldAbort()) return;

          node.innerHTML = svg;
          bindFunctions?.(node);
        } catch {
          node.innerHTML =
            `<pre class="mermaid-error"><code>${escapeHtml(source)}</code></pre>` +
            '<p class="mermaid-error-message">Mermaid diagram failed to render.</p>';
        }
      }
    } catch {
      previewElement.querySelectorAll('.mermaid').forEach((node) => {
        const source = (node.textContent || '').trim();
        node.innerHTML =
          `<pre class="mermaid-error"><code>${escapeHtml(source)}</code></pre>` +
          '<p class="mermaid-error-message">Mermaid diagram failed to render.</p>';
      });
    }
  }

  if (shouldAbort()) return;

  try {
    addCopyButtons(previewElement);
  } catch {
    // Copy buttons are progressive enhancement only.
  }
}

function addCopyButtons(previewElement) {
  const blocks = previewElement.querySelectorAll('pre > code');

  blocks.forEach((code) => {
    if (isMermaidCodeBlock(code)) return;

    const pre = code.parentElement;
    if (!pre || pre.querySelector('.code-copy')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.textContent = 'Copy';

    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.innerText || code.textContent || '');
        button.textContent = 'Copied';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 1500);
      } catch {
        button.textContent = 'Error';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 1500);
      }
    });

    pre.style.position = 'relative';
    pre.appendChild(button);
  });
}

export function buildTocItems(previewElement) {
  if (!previewElement) return [];

  const headings = Array.from(previewElement.querySelectorAll('h1, h2, h3'));

  return headings.map((heading, index) => {
    if (!heading.id) {
      const raw = (heading.textContent || `heading-${index}`).replace(/#$/, '').trim();
      heading.id = raw
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    return {
      id: heading.id,
      text: (heading.textContent || '').replace(/#$/, '').trim(),
      level: Number(heading.tagName.slice(1)),
    };
  });
}
