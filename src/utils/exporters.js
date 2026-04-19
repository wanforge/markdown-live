import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function exportStyles() {
  return `
    <style>
      :root {
        --text: #111111;
        --muted: #666666;
        --border: #cfcfcf;
        --code-bg: #f4f4f4;
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
    </style>
  `;
}

export function buildExportHtml({ title, contentHtml }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${title} - generated with MarkDown Live" />
    <meta name="author" content="MarkDown Live Community" />
    <title>${title}</title>
    <link rel="icon" type="image/svg+xml" href="./icon.svg" />
    <link rel="alternate icon" type="image/png" href="./icon.png" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/atom-one-light.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css" />
    ${exportStyles()}
  </head>
  <body>
    <article>${contentHtml}</article>
  </body>
</html>`;
}

export function openPrintWindow(html) {
  const win = window.open('', '_blank', 'noopener,noreferrer');
  if (!win) {
    alert(
      'The browser blocked the popup. Please allow popups to continue with print/PDF.'
    );
    return;
  }

  win.document.open();
  win.document.write(html);
  win.document.close();
  win.addEventListener('load', () => {
    win.focus();
    win.print();
  });
}

export async function exportPdfFromNode({ node, title }) {
  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

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

  const filename = `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
  pdf.save(filename);
}
