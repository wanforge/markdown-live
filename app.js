/**
 * WanForge Markdown Renderer - Complete Professional Version
 * Copyright © 2026 WanForge (wanforge.asia)
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
const btnPdf = document.getElementById('btnPdf');
const btnExport = document.getElementById('btnExport');
const btnTheme = document.getElementById('btnTheme');

function getMermaidConfig(isDark) {
  if (isDark) {
    return {
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'strict',
      fontFamily: 'Segoe UI, Tahoma, sans-serif',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'linear',
      },
      themeVariables: {
        primaryColor: '#284a79',
        primaryTextColor: '#e9eff9',
        primaryBorderColor: '#8fb7f0',
        lineColor: '#8fb7f0',
        secondaryColor: '#1f3556',
        tertiaryColor: '#152238',
        background: '#1a2a42',
        mainBkg: '#284a79',
        nodeBorder: '#8fb7f0',
        clusterBkg: '#152238',
        clusterBorder: '#7ea5dd',
        edgeLabelBackground: '#1f3556',
      },
    };
  }

  return {
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'strict',
    fontFamily: 'Segoe UI, Tahoma, sans-serif',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'linear',
    },
    themeVariables: {
      primaryColor: '#dbe8fb',
      primaryTextColor: '#1f4175',
      primaryBorderColor: '#2b579a',
      lineColor: '#2b579a',
      secondaryColor: '#e7effa',
      tertiaryColor: '#f5f8fd',
      background: '#ffffff',
      mainBkg: '#dbe8fb',
      nodeBorder: '#2b579a',
      clusterBkg: '#edf3fb',
      clusterBorder: '#7aa1da',
      edgeLabelBackground: '#e7effa',
    },
  };
}

// ========== Configuration ==========
const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight(str, lang) {
    if (lang && lang.toLowerCase() === 'mermaid') {
      return `<pre><code class="language-mermaid">${markdown.utils.escapeHtml(str)}</code></pre>`;
    }

    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="hljs language-${lang}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch (e) {
        console.warn(`Highlight.js error for language ${lang}:`, e);
      }
    }

    if (lang) {
      return `<pre><code class="hljs language-${lang}">${markdown.utils.escapeHtml(str)}</code></pre>`;
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

mermaid.initialize(getMermaidConfig(false));

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

**© 2026 WanForge** | Professional Markdown Renderer | [wanforge.asia](https://wanforge.asia)
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
    if (isMermaidCodeBlock(code)) return;

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

function isMermaidCodeBlock(codeNode) {
  const className = (codeNode.className || '').toLowerCase();
  return (
    className.includes('language-mermaid') || className.includes('lang-mermaid')
  );
}

/**
 * Render Mermaid diagrams
 */
function renderMermaidBlocks() {
  const mermaidCodes = Array.from(preview.querySelectorAll('pre code')).filter(
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

function buildExportStyles() {
  return `
    <style>
      :root {
        --text: #111111;
        --muted: #666666;
        --border: #cfcfcf;
        --code-bg: #f4f4f4;
      }

      * {
        box-sizing: border-box;
      }

      body {
        font-family: Calibri, 'Segoe UI', Tahoma, sans-serif;
        color: var(--text);
        background: #ffffff;
        line-height: 1.6;
        margin: 0;
      }

      article {
        max-width: 210mm;
        margin: 0 auto;
        padding: 0;
      }

      h1, h2, h3, h4, h5, h6 {
        color: #111111;
        font-weight: 700;
        margin-top: 20px;
        margin-bottom: 10px;
      }

      p, li, td, th {
        font-size: 12pt;
      }

      pre {
        background: var(--code-bg);
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 10px;
        overflow-x: auto;
      }

      code {
        font-family: Consolas, 'Courier New', monospace;
      }

      table {
        border-collapse: collapse;
        width: 100%;
        margin: 12px 0;
      }

      th, td {
        border: 1px solid var(--border);
        padding: 8px 10px;
        text-align: left;
      }

      th {
        background: #f0f0f0;
      }

      blockquote {
        margin: 12px 0;
        border-left: 3px solid #b7b7b7;
        padding-left: 10px;
        color: var(--muted);
      }

      .mermaid {
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 10px;
        overflow: auto;
        background: #ffffff;
      }

      .code-copy,
      .header-anchor {
        display: none !important;
      }

      @media print {
        @page {
          size: A4;
          margin: 20mm 18mm;
        }

        h1, h2, h3,
        table, pre, blockquote,
        .mermaid, .katex-display {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      }
    </style>
  `;
}

function getDocumentTitle() {
  const h1 = preview.querySelector('h1');
  if (h1?.textContent?.trim()) {
    return h1.textContent.trim();
  }

  return 'Dokumen Markdown';
}

function getExportContentHtml() {
  const cloned = preview.cloneNode(true);
  cloned
    .querySelectorAll('.code-copy, .header-anchor')
    .forEach(node => node.remove());
  return cloned.innerHTML;
}

function buildExportHtml(title) {
  const styles = buildExportStyles();
  const contentHtml = getExportContentHtml();

  return `<!doctype html>
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
      ${contentHtml}
    </article>
  </body>
</html>`;
}

function openPrintWindow(title) {
  const html = buildExportHtml(title);
  const printWindow = window.open('', '_blank', 'noopener,noreferrer');

  if (!printWindow) {
    alert('Popup diblokir browser. Izinkan popup untuk melanjutkan cetak/PDF.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.addEventListener('load', () => {
    printWindow.focus();
    printWindow.print();
  });
}

async function exportPdfFile(title) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm'),
    import('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/+esm'),
  ]);

  const contentHtml = getExportContentHtml();
  const tempHost = document.createElement('div');
  tempHost.style.position = 'fixed';
  tempHost.style.left = '-100000px';
  tempHost.style.top = '0';
  tempHost.style.width = '794px';
  tempHost.style.background = '#ffffff';
  tempHost.style.zIndex = '-1';
  tempHost.innerHTML = `
    ${buildExportStyles()}
    <article>${contentHtml}</article>
  `;

  document.body.appendChild(tempHost);

  try {
    const docNode = tempHost.querySelector('article');
    const canvas = await html2canvas(docNode, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    // Convert the A4 printable height from mm to canvas pixels,
    // then slice the rendered content page-by-page to prevent missing text at cut points.
    const pageHeightPx = Math.floor(
      (usableHeight * canvas.width) / usableWidth
    );
    const overlapPx = Math.max(8, Math.floor(pageHeightPx * 0.015));
    let offsetPx = 0;
    let pageIndex = 0;

    while (offsetPx < canvas.height) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - offsetPx);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const pageContext = pageCanvas.getContext('2d');
      pageContext.drawImage(
        canvas,
        0,
        offsetPx,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );

      const pageImgData = pageCanvas.toDataURL('image/png');
      const renderHeightMm = (sliceHeight * usableWidth) / canvas.width;

      if (pageIndex > 0) {
        pdf.addPage('a4', 'portrait');
      }

      pdf.addImage(
        pageImgData,
        'PNG',
        margin,
        margin,
        usableWidth,
        renderHeightMm,
        undefined,
        'FAST'
      );

      pageIndex += 1;

      if (offsetPx + sliceHeight >= canvas.height) {
        break;
      }

      offsetPx += Math.max(1, sliceHeight - overlapPx);
    }

    const fileName = `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
    pdf.save(fileName);
  } finally {
    tempHost.remove();
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
      if (!isMermaidCodeBlock(block)) {
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
  openPrintWindow(getDocumentTitle());
});

btnPdf.addEventListener('click', async () => {
  const oldText = btnPdf.textContent;
  btnPdf.disabled = true;
  btnPdf.textContent = 'Memproses...';

  try {
    await exportPdfFile(getDocumentTitle());
  } catch (error) {
    console.error('PDF export error:', error);
    alert(
      'Export PDF gagal. Browser akan membuka mode print sebagai fallback.'
    );
    openPrintWindow(getDocumentTitle());
  } finally {
    btnPdf.disabled = false;
    btnPdf.textContent = oldText;
  }
});

btnExport.addEventListener('click', () => {
  const title =
    prompt('Enter document title:', getDocumentTitle()) || getDocumentTitle();
  const html = buildExportHtml(title);

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

  mermaid.initialize(getMermaidConfig(isDark));
  
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
console.log('© 2026 WanForge | wanforge.asia');
