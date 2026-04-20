import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const DEFAULT_EXPORT_NAME = 'markdown-live-document';

const REMOVE_DIACRITICS_RE = /[\u0300-\u036f]/g;
const INVALID_FILENAME_CHARS_RE = /[^a-z0-9-]+/g;
const MULTI_DASH_RE = /-{2,}/g;

export function normalizeFilename(input, fallback = DEFAULT_EXPORT_NAME) {
  const normalized = String(input ?? '')
    .normalize('NFKD')
    .replace(REMOVE_DIACRITICS_RE, '')
    .toLowerCase()
    .replace(INVALID_FILENAME_CHARS_RE, '-')
    .replace(MULTI_DASH_RE, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || fallback;
}

function createExportFilename(title, extension) {
  return `${normalizeFilename(title)}-${Date.now()}.${extension}`;
}

function collectInlineStyles() {
  const chunks = [];

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = Array.from(sheet.cssRules ?? []);
      if (!rules.length) continue;
      chunks.push(rules.map((rule) => rule.cssText).join('\n'));
    } catch {
      // Ignore cross-origin stylesheets and keep exporting with available styles.
    }
  }

  return chunks.join('\n');
}

function stripExportUiElements(root) {
  root.querySelectorAll('.code-copy, .header-anchor').forEach((node) => node.remove());
}

function sanitizeCloneForPdf(root) {
  const isSvgNode = (node) => node.namespaceURI === 'http://www.w3.org/2000/svg';
  const hasUnsupportedColorFunction = (value) => /color\s*\(|color-mix\s*\(/i.test(value);

  if (!isSvgNode(root)) {
    root.removeAttribute('class');
    const styleValue = root.getAttribute('style') ?? '';
    if (hasUnsupportedColorFunction(styleValue)) {
      root.removeAttribute('style');
    }
  }

  for (const element of root.querySelectorAll('*')) {
    if (!isSvgNode(element)) {
      element.removeAttribute('class');
      const styleValue = element.getAttribute('style') ?? '';
      if (hasUnsupportedColorFunction(styleValue)) {
        element.removeAttribute('style');
      }
    }
  }
}

function createPdfSafeStyles() {
  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; }
    article {
      width: 100%;
      color: #111111;
      background: #ffffff;
      font-family: Inter, Segoe UI, sans-serif;
      line-height: 1.6;
      overflow: visible;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    pre {
      background: #f4f4f4;
      border: 1px solid #cfcfcf;
      border-radius: 6px;
      padding: 10px;
      overflow: visible;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 12px 0;
      table-layout: fixed;
    }
    th, td {
      border: 1px solid #cfcfcf;
      padding: 8px;
      text-align: left;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    th { background: #f2f6ff; }
    img, svg {
      max-width: 100%;
      height: auto;
    }
    blockquote {
      margin: 14px 0;
      padding: 10px 14px;
      border-left: 4px solid #003d99;
      background: #f5f9ff;
      color: #333333;
    }
  `;
  return style;
}

async function renderCanvasWithRetries(node, preferredScale = 2) {
  const scales = [preferredScale, 1.5, 1].filter(
    (value, index, arr) => value > 0 && arr.indexOf(value) === index
  );

  let lastError;

  for (const scale of scales) {
    try {
      const canvas = await html2canvas(node, {
        scale,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 15000,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: Math.max(1, node.clientWidth),
        windowHeight: Math.max(1, node.scrollHeight),
        scrollX: 0,
        scrollY: 0,
      });

      if (!canvas.width || !canvas.height) {
        throw new Error('Rendered canvas has invalid dimensions.');
      }

      return canvas;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Failed to render document canvas for PDF export.');
}

function buildSandboxClone(node) {
  const sandbox = document.createElement('div');
  sandbox.style.position = 'fixed';
  sandbox.style.left = '-100000px';
  sandbox.style.top = '0';
  sandbox.style.zIndex = '-1';
  sandbox.style.background = '#ffffff';
  sandbox.style.pointerEvents = 'none';

  const clone = node.cloneNode(true);
  stripExportUiElements(clone);
  sanitizeCloneForPdf(clone);
  clone.style.height = 'auto';
  clone.style.maxHeight = 'none';
  clone.style.overflow = 'visible';
  clone.style.width = `${Math.max(1, node.clientWidth)}px`;
  clone.style.background = '#ffffff';
  clone.style.color = '#111111';

  const exportStylesNode = createPdfSafeStyles();
  sandbox.appendChild(exportStylesNode);

  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  return { sandbox, clone };
}

function disposeSandbox(sandbox) {
  if (sandbox?.parentNode) {
    sandbox.parentNode.removeChild(sandbox);
  }
}

async function exportPdfViaHtmlRenderer({ node, filename }) {
  const { sandbox, clone } = buildSandboxClone(node);

  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    await new Promise((resolve, reject) => {
      try {
        pdf.html(clone, {
          x: 10,
          y: 10,
          margin: [10, 10, 10, 10],
          autoPaging: 'text',
          html2canvas: {
            scale: 1,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            imageTimeout: 15000,
          },
          callback: () => resolve(),
        });
      } catch (error) {
        reject(error);
      }
    });

    pdf.save(filename);
  } finally {
    disposeSandbox(sandbox);
  }
}

function exportStyles() {
  return `
    <style>
      :root {
        --text: #111111;
        --muted: #666666;
        --border: #cfcfcf;
        --code-bg: #f4f4f4;
      }
      html, body {
        min-height: 100%;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: var(--text);
        background: #ffffff;
        font-family: Inter, Segoe UI, sans-serif;
        line-height: 1.6;
      }
      article {
        max-width: 210mm;
        margin: 0 auto;
      }
      pre {
        background: var(--code-bg);
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 10px;
        overflow-x: auto;
      }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 12px 0;
      }
      th, td {
        border: 1px solid var(--border);
        padding: 8px;
        text-align: left;
      }
      th { background: #f2f6ff; }
      .code-copy, .header-anchor { display: none !important; }
      @media print {
        body {
          margin: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        article {
          max-width: none;
          padding: 0;
        }
      }
    </style>
  `;
}

export function buildExportHtml({ title, contentHtml, isDark = false }) {
  const runtimeStyles = collectInlineStyles();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${title} - generated with MarkDown Live" />
    <meta name="author" content="MarkDown Live" />
    <title>${title}</title>
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <link rel="alternate icon" type="image/png" href="/icon.png" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/atom-one-light.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css" />
    <style>${runtimeStyles}</style>
    ${exportStyles()}
  </head>
  <body class="${isDark ? 'dark' : ''}">
    <article class="markdown-body">${contentHtml}</article>
  </body>
</html>`;
}

export function downloadHtmlDocument({ title, html }) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = createExportFilename(title, 'html');

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  const objectUrl = link.href;
  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);
}

export function openPrintWindow(html) {
  const printWithIframeFallback = () => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    const cleanup = () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    iframe.addEventListener('load', () => {
      const frameWindow = iframe.contentWindow;
      const frameDocument = iframe.contentDocument;
      if (!frameWindow || !frameDocument) {
        cleanup();
        alert('Print could not be started. Please try again.');
        return;
      }

      const doPrint = () => {
        try {
          frameWindow.focus();
          frameWindow.print();
        } finally {
          setTimeout(cleanup, 1200);
        }
      };

      const fontsReady = frameDocument.fonts?.ready;
      if (fontsReady) {
        fontsReady.then(doPrint).catch(doPrint);
        return;
      }

      doPrint();
    });

    document.body.appendChild(iframe);
    const frameDocument = iframe.contentDocument;
    if (!frameDocument) {
      cleanup();
      alert('Print could not be started. Please try again.');
      return;
    }

    frameDocument.open();
    frameDocument.write(html);
    frameDocument.close();
  };

  try {
    const win = window.open('', '_blank');
    if (!win) {
      printWithIframeFallback();
      return;
    }

    win.document.open();
    win.document.write(html);
    win.document.close();

    const triggerPrint = () => {
      try {
        win.focus();
        win.print();
      } catch {
        printWithIframeFallback();
      }
    };

    win.addEventListener('load', triggerPrint, { once: true });
    setTimeout(triggerPrint, 500);
  } catch {
    printWithIframeFallback();
  }
}

export async function exportPdfFromNode({ node, title }) {
  const filename = createExportFilename(title, 'pdf');

  try {
    const { sandbox, clone } = buildSandboxClone(node);

    let canvas;
    try {
      const fontsReady = document.fonts?.ready;
      if (fontsReady) {
        await fontsReady.catch(() => undefined);
      }

      const maxCanvasPixels = 40_000_000;
      const basePixels = Math.max(1, clone.clientWidth * clone.scrollHeight);
      const autoScaleCap = Math.min(2, Math.sqrt(maxCanvasPixels / basePixels));

      canvas = await renderCanvasWithRetries(clone, autoScaleCap);
    } finally {
      disposeSandbox(sandbox);
    }

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    const pageHeightPx = Math.floor((usableHeight * canvas.width) / usableWidth);
    const overlapPx = Math.max(8, Math.floor(pageHeightPx * 0.015));

    let offsetPx = 0;
    let pageIndex = 0;

    while (offsetPx < canvas.height) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - offsetPx);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const pageContext = pageCanvas.getContext('2d');
      if (!pageContext) {
        throw new Error('Cannot create 2D canvas context for PDF page rendering.');
      }
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

      const image = pageCanvas.toDataURL('image/png');
      const renderHeightMm = (sliceHeight * usableWidth) / canvas.width;

      if (pageIndex > 0) pdf.addPage('a4', 'portrait');

      pdf.addImage(
        image,
        'PNG',
        margin,
        margin,
        usableWidth,
        renderHeightMm,
        undefined,
        'FAST'
      );

      pageIndex += 1;
      if (offsetPx + sliceHeight >= canvas.height) break;

      offsetPx += Math.max(1, sliceHeight - overlapPx);
    }

    pdf.save(filename);
  } catch (primaryError) {
    console.error(
      'Primary PDF export pipeline failed, trying jsPDF.html fallback.',
      primaryError
    );

    await exportPdfViaHtmlRenderer({ node, filename });
  }
}
