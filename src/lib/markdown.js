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
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11.14.0/+esm';
import renderMathInElement from 'katex/contrib/auto-render';
import { PALETTE } from '../utils/constants';

const escapeHtml = (() => {
  const parser = new MarkdownIt();
  return (value) => parser.utils.escapeHtml(value);
})();

export function createMarkdownParser() {
  return new MarkdownIt({
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
  })
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
    .use(markdownItSup);
}

export function sanitizeRenderedHtml(rawHtml) {
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
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

export async function enrichPreviewContent(previewElement, isDark) {
  if (!previewElement) return;

  previewElement.querySelectorAll('pre code').forEach((block) => {
    if (!isMermaidCodeBlock(block)) {
      hljs.highlightElement(block);
    }
  });

  const mermaidCodes = Array.from(previewElement.querySelectorAll('pre code')).filter(
    isMermaidCodeBlock
  );

  mermaidCodes.forEach((node, index) => {
    const pre = node.parentElement;
    if (!pre) return;

    const container = document.createElement('div');
    container.className = 'mermaid';
    container.id = `mermaid-${Date.now()}-${index}`;
    container.textContent = node.textContent || '';
    pre.replaceWith(container);
  });

  mermaid.initialize(getMermaidConfig(isDark));
  await mermaid.run({ nodes: previewElement.querySelectorAll('.mermaid') });

  renderMathInElement(previewElement, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true },
    ],
    throwOnError: false,
    errorColor: '#ef4444',
  });

  addCopyButtons(previewElement);
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
        await navigator.clipboard.writeText(code.innerText);
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
