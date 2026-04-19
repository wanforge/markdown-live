import { useEffect, useMemo, useRef, useState } from 'react';
import Toolbar from './components/Toolbar';
import EditorPane from './components/EditorPane';
import PreviewPane from './components/PreviewPane';
import {
  buildTocItems,
  createMarkdownParser,
  enrichPreviewContent,
  sanitizeRenderedHtml,
} from './lib/markdown';
import { buildExportHtml, exportPdfFromNode, openPrintWindow } from './utils/exporters';
import { APP_VERSION, BRAND } from './utils/constants';
import { sampleMarkdown } from './utils/sampleMarkdown';

export default function App() {
  const parser = useMemo(() => createMarkdownParser(), []);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  const [markdownText, setMarkdownText] = useState(() => {
    return localStorage.getItem('markdownContent') || sampleMarkdown;
  });
  const [tocItems, setTocItems] = useState([]);
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const renderedHtml = useMemo(() => {
    const raw = parser.render(markdownText || '');
    return sanitizeRenderedHtml(raw);
  }, [markdownText, parser]);

  useEffect(() => {
    localStorage.setItem('markdownContent', markdownText);
  }, [markdownText]);

  useEffect(() => {
    const previewNode = previewRef.current;
    if (!previewNode) return;

    previewNode.innerHTML = renderedHtml;

    enrichPreviewContent(previewNode, isDark)
      .then(() => {
        setTocItems(buildTocItems(previewNode));
      })
      .catch((error) => {
        previewNode.innerHTML = `<div style="color:#ef4444;padding:16px;"><strong>Error:</strong> ${error.message}</div>`;
      });
  }, [renderedHtml, isDark]);

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  function getDocumentTitle() {
    const h1 = previewRef.current?.querySelector('h1');
    return h1?.textContent?.trim() || 'MarkDown Live Document';
  }

  function clonePreviewHtml() {
    const cloned = previewRef.current?.cloneNode(true);
    if (!cloned) return '';
    cloned
      .querySelectorAll('.code-copy, .header-anchor')
      .forEach((node) => node.remove());
    return cloned.innerHTML;
  }

  function handleOpenFileButton() {
    fileInputRef.current?.click();
  }

  async function handleFileInput(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setMarkdownText(text);
    } catch (error) {
      alert(`Failed to read file: ${error.message}`);
    } finally {
      event.target.value = '';
    }
  }

  function handlePrint() {
    const title = getDocumentTitle();
    const html = buildExportHtml({ title, contentHtml: clonePreviewHtml() });
    openPrintWindow(html);
  }

  async function handleExportPdf() {
    if (!previewRef.current) return;

    setIsExportingPdf(true);
    try {
      await exportPdfFromNode({ node: previewRef.current, title: getDocumentTitle() });
    } catch {
      alert('PDF export failed. The browser will open print mode as a fallback.');
      handlePrint();
    } finally {
      setIsExportingPdf(false);
    }
  }

  function handleExportHtml() {
    const title =
      window.prompt('Enter document title:', getDocumentTitle()) || getDocumentTitle();
    const html = buildExportHtml({ title, contentHtml: clonePreviewHtml() });

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  useEffect(() => {
    console.log(`${BRAND.name} v${APP_VERSION} - Ready!`);
    console.log(`© 2026 ${BRAND.owner} (${BRAND.ownerUrl.replace('https://', '')})`);
  }, []);

  return (
    <>
      <Toolbar
        fileInputRef={fileInputRef}
        onLoadSample={() => setMarkdownText(sampleMarkdown)}
        onOpenFileClick={handleOpenFileButton}
        onFileSelected={handleFileInput}
        onPrint={handlePrint}
        onExportPdf={handleExportPdf}
        onExportHtml={handleExportHtml}
        onToggleTheme={() => setIsDark((value) => !value)}
        isDark={isDark}
        isExportingPdf={isExportingPdf}
      />

      <main className="layout">
        <EditorPane value={markdownText} onChange={setMarkdownText} />
        <PreviewPane previewRef={previewRef} tocItems={tocItems} />
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>
            © 2026 <strong>{BRAND.owner}</strong> (
            <a href={BRAND.ownerUrl} target="_blank" rel="noopener noreferrer">
              {BRAND.ownerUrl.replace('https://', '')}
            </a>
            )
          </p>
          <p className="footer-subtitle">{BRAND.slogan}</p>
        </div>
      </footer>
    </>
  );
}
