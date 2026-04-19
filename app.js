import MarkdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14/+esm';
import markdownItAnchor from 'https://cdn.jsdelivr.net/npm/markdown-it-anchor@9/+esm';
import markdownItTaskLists from 'https://cdn.jsdelivr.net/npm/markdown-it-task-lists@2/+esm';
import markdownItFootnote from 'https://cdn.jsdelivr.net/npm/markdown-it-footnote@3/+esm';
import markdownItDeflist from 'https://cdn.jsdelivr.net/npm/markdown-it-deflist@2/+esm';
import markdownItMark from 'https://cdn.jsdelivr.net/npm/markdown-it-mark@4/+esm';
import markdownItSub from 'https://cdn.jsdelivr.net/npm/markdown-it-sub@2/+esm';
import markdownItSup from 'https://cdn.jsdelivr.net/npm/markdown-it-sup@2/+esm';
import hljs from 'https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/+esm';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.2.6/+esm';
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11.12.0/+esm';
import renderMathInElement from 'https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/contrib/auto-render.mjs';

const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const toc = document.getElementById('toc');
const fileInput = document.getElementById('fileInput');
const btnSample = document.getElementById('btnSample');
const btnOpen = document.getElementById('btnOpen');
const btnExport = document.getElementById('btnExport');
const btnTheme = document.getElementById('btnTheme');

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return `<pre><code class="hljs language-${lang}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
    }

    return `<pre><code class="hljs">${markdown.utils.escapeHtml(str)}</code></pre>`;
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

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'strict',
  fontFamily: 'Fira Sans, sans-serif',
});

const sampleMarkdown = `# Markdown Renderer Lengkap

Renderer ini support fitur umum dan lanjutan:

- GFM (table, checklist, strikethrough)
- Syntax highlighting
- Mermaid diagram
- Footnote, definition list
- Math KaTeX inline: $E = mc^2$
- Math block:

$$
\\int_0^1 x^2 \\; dx = \\frac{1}{3}
$$

## Checklist

- [x] Bisa render markdown
- [x] Bisa highlight code
- [x] Bisa Mermaid
- [ ] Tinggal pakai di workflow harian

## Code Example

\`\`\`js
function greet(name) {
  return "Halo, " + name + "!";
}

console.log(greet("WanForge"));
\`\`\`

## Mermaid Example

\`\`\`mermaid
flowchart LR
  A[User Tulis Markdown] --> B[Parser]
  B --> C[Sanitizer]
  C --> D[Preview]
\`\`\`

## Table

| Fitur | Status |
|---|---|
| HTML | Aktif |
| Mermaid | Aktif |
| Highlight | Aktif |

## Footnote

Lihat catatan ini.[^1]

[^1]: Ini contoh footnote yang sudah didukung.
`;

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function buildToc() {
  const headings = preview.querySelectorAll('h1, h2, h3');
  if (!headings.length) {
    toc.innerHTML = '';
    return;
  }

  const items = [];
  headings.forEach((h, index) => {
    if (!h.id) {
      h.id = `${slugify(h.textContent || `heading-${index}`)}-${index}`;
    }

    const level = Number(h.tagName.slice(1));
    items.push(`<li data-level="${level}"><a href="#${h.id}">${h.textContent}</a></li>`);
  });

  toc.innerHTML = `<div class="toc-title">Daftar Isi</div><ul>${items.join('')}</ul>`;
}

function addCopyButtons() {
  const blocks = preview.querySelectorAll('pre > code');

  blocks.forEach((code) => {
    if (code.classList.contains('language-mermaid')) return;

    const pre = code.parentElement;
    if (!pre || pre.querySelector('.code-copy')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    btn.textContent = 'Copy';

    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.innerText);
        btn.textContent = 'Copied';
        setTimeout(() => {
          btn.textContent = 'Copy';
        }, 1200);
      } catch {
        btn.textContent = 'Failed';
        setTimeout(() => {
          btn.textContent = 'Copy';
        }, 1200);
      }
    });

    pre.appendChild(btn);
  });
}

function renderMermaidBlocks() {
  const mermaidCodes = preview.querySelectorAll('pre code.language-mermaid');

  mermaidCodes.forEach((node, index) => {
    const pre = node.parentElement;
    if (!pre) return;

    const container = document.createElement('div');
    container.className = 'mermaid';
    container.id = `mermaid-${Date.now()}-${index}`;
    container.textContent = node.textContent || '';

    pre.replaceWith(container);
  });

  const hasMermaid = preview.querySelector('.mermaid');
  if (hasMermaid) {
    mermaid.run({ nodes: preview.querySelectorAll('.mermaid') });
  }
}

function renderMath() {
  renderMathInElement(preview, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true },
    ],
    throwOnError: false,
  });
}

function render() {
  const rawHtml = markdown.render(editor.value || '');
  const safeHtml = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
  });

  preview.innerHTML = safeHtml;

  preview.querySelectorAll('pre code').forEach((block) => {
    if (!block.classList.contains('language-mermaid')) {
      hljs.highlightElement(block);
    }
  });

  renderMermaidBlocks();
  renderMath();
  addCopyButtons();
  buildToc();
}

function debounce(callback, delay = 180) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

const renderDebounced = debounce(render, 160);

editor.addEventListener('input', renderDebounced);

btnSample.addEventListener('click', () => {
  editor.value = sampleMarkdown;
  render();
});

btnOpen.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const text = await file.text();
  editor.value = text;
  render();
  fileInput.value = '';
});

btnExport.addEventListener('click', () => {
  const html = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Export Markdown</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/github.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css" />
  </head>
  <body>
    ${preview.innerHTML}
  </body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'markdown-export.html';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
});

btnTheme.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  btnTheme.textContent = document.body.classList.contains('dark') ? 'Tema Terang' : 'Tema Gelap';
  mermaid.initialize({
    startOnLoad: false,
    theme: document.body.classList.contains('dark') ? 'dark' : 'default',
    securityLevel: 'strict',
    fontFamily: 'Fira Sans, sans-serif',
  });
  render();
});

editor.value = sampleMarkdown;
render();
