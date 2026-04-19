/**
 * WanForge Markdown Renderer - Complete Professional Version
 * Copyright © 2024-2026 WanForge (wanforge.asia)
 * 
 * Features:
 * - Full Markdown Support (GFM, Extended Syntax)
 * - Mermaid Diagram Support
 * - Syntax Highlighting (Highlight.js)
 * - KaTeX Mathematical Expressions
 * - Footnotes, Definition Lists, Task Lists
 * - Professional Navy & Amber Theme
 * - Dark Mode Support
 * - Print/PDF Export
 * - Live Preview with TOC
 * - Code Copy Functionality
 */

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

// ========== DOM Elements ==========
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const toc = document.getElementById('toc');
const fileInput = document.getElementById('fileInput');
const btnSample = document.getElementById('btnSample');
const btnOpen = document.getElementById('btnOpen');
const btnPrint = document.getElementById('btnPrint');
const btnExport = document.getElementById('btnExport');
const btnTheme = document.getElementById('btnTheme');

// ========== Configuration ==========
const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="hljs language-${lang}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch (e) {
        console.warn(`Highlight.js error for language ${lang}:`, e);
      }
    }
    return `<pre><code class="hljs">${markdown.utils.escapeHtml(str)}</code></pre>`;
  },
})
  .use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      symbol: '🔗',
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
  fontFamily: 'Segoe UI, Tahoma, sans-serif',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
  },
});

// ========== Sample Markdown Content ==========
const sampleMarkdown = `# WanForge Markdown Renderer

> Renderer Markdown profesional dengan fitur lengkap untuk dokumen kantor.

## 🎯 Fitur Utama

- **GFM Support** - Tabel, checklist, strikethrough, dan lainnya
- **Syntax Highlighting** - Highlight.js untuk 200+ bahasa pemrograman
- **Mermaid Diagram** - Flowchart, sequence, state, class, dan lainnya
- **KaTeX Math** - Rumus matematika inline dan block
- **Footnotes** - Catatan kaki yang profesional
- **Definition List** - Daftar definisi terstruktur
- **Task List** - Daftar tugas dengan checkbox
- **Dark Mode** - Tema gelap profesional dengan palet Navy & Amber

## 📋 Checklist

- [x] Bisa render markdown dengan sempurna
- [x] Syntax highlighting untuk code
- [x] Support Mermaid diagram
- [x] Dukungan KaTeX untuk rumus
- [x] Tema profesional Navy & Amber
- [x] Responsive design untuk semua ukuran layar
- [x] Print dan export ke HTML
- [ ] Kolaborasi real-time (fitur mendatang)

## 💻 Code Example

JavaScript:
\`\`\`js
// Contoh function WanForge
function greetWanForge(name) {
  return \`Selamat datang di WanForge, \${name}!\`;
}

console.log(greetWanForge('Developer'));
\`\`\`

Python:
\`\`\`python
def greet_wanforge(name):
    return f"Selamat datang di WanForge, {name}!"

print(greet_wanforge("Developer"))
\`\`\`

## 📊 Mermaid Diagram

\`\`\`mermaid
flowchart TD
    A[User Input Markdown] --> B[Parser]
    B --> C[Sanitizer]
    C --> D[Renderer]
    D --> E[Live Preview]
    E --> F[Export/Print]
\`\`\`

## 📐 Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    User->>Editor: Tulis markdown
    Editor->>Parser: Parse content
    Parser->>Renderer: Render HTML
    Renderer->>Preview: Update preview
    Preview->>User: Tampilkan hasil
\`\`\`

## 📑 Tabel Data

| Fitur | Status | Level Support | Keterangan |
|:------|:------:|:---------|-----------|
| Markdown Dasar | ✅ | Penuh | H1-H6, paragraf, list, bold, italic |
| GFM Extended | ✅ | Penuh | Tabel, strikethrough, task list, footnote |
| Code Highlight | ✅ | 200+ bahasa | Highlight.js v11 |
| Mermaid Diagram | ✅ | Lengkap | Flowchart, sequence, class, state, git |
| KaTeX Math | ✅ | Penuh | Inline & block math |
| Dark Mode | ✅ | Profesional | Navy & Amber palette |
| Export/Print | ✅ | HTML & PDF | Menggunakan browser print |

## 📝 Catatan (Footnotes)

WanForge adalah platform untuk dokumentasi dan rendering markdown profesional.[^1] Anda dapat membuat dokumen kantor dengan formatting sempurna.[^2]

[^1]: Platform ini menggunakan teknologi terkini seperti markdown-it, Mermaid, dan KaTeX.
[^2]: Cocok untuk laporan, presentasi, dan dokumentasi proyek.

## 📖 Definition List

Markdown
:   Format teks ringan untuk menulis konten terstruktur dengan syntax sederhana.

Renderer
:   Proses konversi markdown menjadi HTML yang dapat ditampilkan di browser.

Mermaid
:   Syntax untuk membuat diagram dan visualisasi langsung dari teks.

## ➕ Teks Spesial

Teks dengan ==highlight==, dan text dengan^super^script serta~sub~script.

Persamaan inline: $E = mc^2$

Persamaan block:
$$\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}$$

## 🔗 Links & Images

[Kunjungi WanForge](https://wanforge.asia)

---

**© 2024-2026 WanForge** | Professional Markdown Renderer | [wanforge.asia](https://wanforge.asia)
`;

// ========== Utility Functions ==========

/**
 * Convert text to URL-friendly slug
 */
function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Build Table of Contents
 */
function buildToc() {
  const headings = preview.querySelectorAll('h1, h2, h3');
  if (!headings.length) {
    toc.innerHTML = '';
    return;
  }

  const items = [];
  const tocItems = [];

  headings.forEach((h, index) => {
    if (!h.id) {
      h.id = `${slugify(h.textContent || `heading-${index}`)}-${index}`;
    }

    const level = Number(h.tagName.slice(1));
    const text = h.textContent.replace(/🔗$/, '').trim();
    
    items.push(`<li data-level="${level}"><a href="#${h.id}">${text}</a></li>`);
    tocItems.push({ level, text, id: h.id });
  });

  if (tocItems.length > 0) {
    toc.innerHTML = `<div class="toc-title">📑 Daftar Isi</div><ul>${items.join('')}</ul>`;
  } else {
    toc.innerHTML = '';
  }
}

/**
 * Add copy buttons to code blocks
 */
function addCopyButtons() {
  const blocks = preview.querySelectorAll('pre > code');

  blocks.forEach((code) => {
    if (code.classList.contains('language-mermaid')) return;

    const pre = code.parentElement;
    if (!pre || pre.querySelector('.code-copy')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    btn.textContent = '📋 Copy';

    btn.addEventListener('click', async () => {
      try {
        const text = code.innerText;
        await navigator.clipboard.writeText(text);
        btn.textContent = '✓ Copied';
        setTimeout(() => {
          btn.textContent = '📋 Copy';
        }, 1500);
      } catch (err) {
        console.error('Failed to copy:', err);
        btn.textContent = '✗ Error';
        setTimeout(() => {
          btn.textContent = '📋 Copy';
        }, 1500);
      }
    });

    pre.style.position = 'relative';
    pre.appendChild(btn);
  });
}

/**
 * Render Mermaid diagrams
 */
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
    try {
      mermaid.run({ nodes: preview.querySelectorAll('.mermaid') });
    } catch (e) {
      console.warn('Mermaid rendering error:', e);
    }
  }
}

/**
 * Render math expressions with KaTeX
 */
function renderMath() {
  try {
    renderMathInElement(preview, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\\\(', right: '\\\\)', display: false },
        { left: '\\\\[', right: '\\\\]', display: true },
      ],
      throwOnError: false,
      errorColor: '#ef4444',
    });
  } catch (e) {
    console.warn('KaTeX rendering error:', e);
  }
}

/**
 * Main render function
 */
function render() {
  try {
    const rawHtml = markdown.render(editor.value || '');
    const safeHtml = DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true },
      KEEP_CONTENT: true,
    });

    preview.innerHTML = safeHtml;

    // Highlight code blocks
    preview.querySelectorAll('pre code').forEach((block) => {
      if (!block.classList.contains('language-mermaid')) {
        try {
          hljs.highlightElement(block);
        } catch (e) {
          console.warn('Highlight error:', e);
        }
      }
    });

    // Render special content
    renderMermaidBlocks();
    renderMath();
    addCopyButtons();
    buildToc();

  } catch (error) {
    console.error('Render error:', error);
    preview.innerHTML = `<div style="color: #ef4444; padding: 20px;"><strong>Error:</strong> ${error.message}</div>`;
  }
}

/**
 * Debounce function for performance
 */
function debounce(callback, delay = 180) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

const renderDebounced = debounce(render, 180);

// ========== Event Listeners ==========

editor.addEventListener('input', renderDebounced);

btnSample.addEventListener('click', () => {
  editor.value = sampleMarkdown;
  render();
  editor.focus();
});

btnOpen.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    editor.value = text;
    render();
    fileInput.value = '';
  } catch (err) {
    alert('Error reading file: ' + err.message);
  }
});

btnPrint.addEventListener('click', () => {
  window.print();
});

btnExport.addEventListener('click', () => {
  const title = prompt('Enter document title:', 'Export Markdown') || 'Export Markdown';
  
  const styles = `
    <style>
      :root {
        --primary: #001a4d;
        --accent: #f59e0b;
        --bg: #f8fafc;
        --panel: #ffffff;
        --text: #0f172a;
        --text-secondary: #64748b;
        --border: #cbd5e1;
        --code-bg: #f1f5f9;
        --code-text: #001a4d;
      }
      
      * {
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, sans-serif;
        color: var(--text);
        background: var(--bg);
        line-height: 1.7;
        margin: 0;
        padding: 20px;
      }
      
      article {
        max-width: 900px;
        margin: 0 auto;
      }
      
      h1, h2, h3, h4, h5, h6 {
        color: var(--primary);
        font-weight: 700;
      }
      
      h1 {
        border-bottom: 3px solid var(--accent);
        padding-bottom: 10px;
      }
      
      h2 {
        border-left: 4px solid var(--accent);
        padding-left: 12px;
      }
      
      pre {
        background: var(--code-bg);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 12px;
        overflow-x: auto;
      }
      
      code {
        font-family: 'JetBrains Mono', 'Courier New', monospace;
        font-size: 0.9em;
      }
      
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 16px 0;
      }
      
      th, td {
        border: 1px solid var(--border);
        padding: 12px;
        text-align: left;
      }
      
      th {
        background: #f1f5f9;
        color: var(--primary);
        font-weight: 700;
      }
      
      blockquote {
        border-left: 4px solid var(--accent);
        padding-left: 16px;
        margin-left: 0;
        color: var(--text-secondary);
      }
      
      img {
        max-width: 100%;
        height: auto;
      }
      
      a {
        color: var(--accent);
        text-decoration: none;
      }
      
      .code-copy {
        display: none;
      }
      
      footer {
        margin-top: 32px;
        padding-top: 16px;
        border-top: 2px solid var(--border);
        text-align: center;
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
    </style>
  `;

  const footer = `
    <footer>
      <p>&copy; 2024-2026 <strong>WanForge</strong> | <a href="https://wanforge.asia">wanforge.asia</a></p>
      <p>Professional Markdown Renderer | Export Date: ${new Date().toLocaleDateString('id-ID')}</p>
    </footer>
  `;

  const html = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="author" content="WanForge" />
    <title>${title}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/atom-one-light.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css" />
    ${styles}
  </head>
  <body>
    <article>
      ${preview.innerHTML}
    </article>
    ${footer}
  </body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${title.replace(/\\s+/g, '-')}-${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
});

btnTheme.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  btnTheme.textContent = isDark ? '☀️ Terang' : '🌙 Gelap';
  
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'dark' : 'default',
    securityLevel: 'strict',
    fontFamily: 'Segoe UI, Tahoma, sans-serif',
  });
  
  render();
  
  // Save theme preference
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// ========== Initialization ==========

// Load saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark');
  btnTheme.textContent = '☀️ Terang';
} else {
  btnTheme.textContent = '🌙 Gelap';
}

// Load saved content if exists
const savedContent = localStorage.getItem('markdownContent');
if (savedContent) {
  editor.value = savedContent;
} else {
  editor.value = sampleMarkdown;
}

// Save content on every change
editor.addEventListener('change', () => {
  localStorage.setItem('markdownContent', editor.value);
});

// Initial render
render();

console.log('✨ WanForge Markdown Renderer v1.0 - Ready!');
console.log('© 2024-2026 WanForge | wanforge.asia');
