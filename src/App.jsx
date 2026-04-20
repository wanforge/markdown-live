import { useEffect, useMemo, useRef, useState } from 'react';
import Toolbar from './components/Toolbar';
import EditorPane from './components/EditorPane';
import PreviewPane from './components/PreviewPane';
import AiPromptGuide from './components/AiPromptGuide';
import {
  buildTocItems,
  createMarkdownParser,
  enrichPreviewContent,
  sanitizeRenderedHtml,
} from './lib/markdown';
import {
  buildExportHtml,
  downloadHtmlDocument,
  exportPdfFromNode,
  openPrintWindow,
} from './utils/exporters';
import { APP_VERSION, BRAND } from './utils/constants';

const SAMPLE_MARKDOWN_PATH = '/sample.md';
const DEFAULT_EMPTY_DOCUMENT = '# MarkDown Live\n\n';

export default function App() {
  const parser = useMemo(() => createMarkdownParser(), []);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const renderCycleRef = useRef(0);

  const [markdownText, setMarkdownText] = useState(() => {
    return localStorage.getItem('markdownContent') || DEFAULT_EMPTY_DOCUMENT;
  });
  const [tocItems, setTocItems] = useState([]);
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('editor');
  const [isAiGuideOpen, setIsAiGuideOpen] = useState(false);

  const renderedHtml = useMemo(() => {
    const raw = parser.render(markdownText || '');
    return sanitizeRenderedHtml(raw);
  }, [markdownText, parser]);

  const hasDocumentContent = useMemo(() => {
    return markdownText.trim().length > 0;
  }, [markdownText]);

  useEffect(() => {
    localStorage.setItem('markdownContent', markdownText);
  }, [markdownText]);

  async function fetchSampleMarkdown() {
    const response = await fetch(SAMPLE_MARKDOWN_PATH, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Could not load sample markdown (${response.status})`);
    }

    return response.text();
  }

  async function loadSampleMarkdown() {
    const text = await fetchSampleMarkdown();
    setMarkdownText(text);
  }

  useEffect(() => {
    if (localStorage.getItem('markdownContent')) return;

    let isCancelled = false;

    fetchSampleMarkdown()
      .then((text) => {
        if (isCancelled) return;
        setMarkdownText(text);
      })
      .catch(() => {
        // Keep default fallback content when sample file cannot be fetched.
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const previewNode = previewRef.current;
    if (!previewNode) return;

    const currentRenderCycle = ++renderCycleRef.current;
    const isStale = () => currentRenderCycle !== renderCycleRef.current;
    const renderTimer = window.setTimeout(() => {
      if (isStale()) return;

      previewNode.innerHTML = renderedHtml;

      enrichPreviewContent(previewNode, isDark, isStale)
        .then(() => {
          if (isStale()) return;
          setTocItems(buildTocItems(previewNode));
        })
        .catch((error) => {
          if (isStale()) return;
          previewNode.innerHTML = `<div style="color:#ef4444;padding:16px;"><strong>Error:</strong> ${error.message}</div>`;
        });
    }, 120);

    return () => {
      window.clearTimeout(renderTimer);
    };
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
    if (!hasDocumentContent) {
      alert('No content to print. Add some markdown first.');
      return;
    }

    const title = getDocumentTitle();
    const html = buildExportHtml({
      title,
      contentHtml: clonePreviewHtml(),
      isDark,
    });
    openPrintWindow(html);
  }

  async function handleExportPdf() {
    if (!previewRef.current || !hasDocumentContent) {
      alert('No content to export to PDF.');
      return;
    }

    setIsExportingPdf(true);
    try {
      await exportPdfFromNode({ node: previewRef.current, title: getDocumentTitle() });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('PDF export failed:', error);
      alert(
        `PDF export failed (${message}). The browser will open print mode as a fallback.`
      );
      handlePrint();
    } finally {
      setIsExportingPdf(false);
    }
  }

  function handleExportHtml() {
    if (!hasDocumentContent) {
      alert('No content to export to HTML.');
      return;
    }

    const title =
      window.prompt('Enter document title:', getDocumentTitle()) || getDocumentTitle();
    const html = buildExportHtml({
      title,
      contentHtml: clonePreviewHtml(),
      isDark,
    });

    downloadHtmlDocument({ title, html });
  }

  async function handleLoadSample() {
    try {
      await loadSampleMarkdown();
    } catch (error) {
      alert(`Failed to load sample markdown: ${error.message}`);
    }
  }

  useEffect(() => {
    console.log(`${BRAND.name} v${APP_VERSION} - Ready!`);
    console.log(`© 2026 ${BRAND.owner} (${BRAND.ownerUrl.replace('https://', '')})`);
  }, []);

  return (
    <div className="app-shell">
      <Toolbar
        fileInputRef={fileInputRef}
        onLoadSample={handleLoadSample}
        onOpenFileClick={handleOpenFileButton}
        onToggleAiGuide={() => setIsAiGuideOpen((value) => !value)}
        onFileSelected={handleFileInput}
        onPrint={handlePrint}
        onExportPdf={handleExportPdf}
        onExportHtml={handleExportHtml}
        onToggleTheme={() => setIsDark((value) => !value)}
        isAiGuideOpen={isAiGuideOpen}
        isDark={isDark}
        isExportingPdf={isExportingPdf}
        hasDocumentContent={hasDocumentContent}
      />

      <main
        className={`layout ${
          activeMobileTab === 'editor' ? 'mobile-editor-active' : 'mobile-preview-active'
        }`}
      >
        <div
          className="mobile-tabs"
          role="tablist"
          aria-label="Editor and secondary panel"
        >
          <button
            type="button"
            role="tab"
            className={activeMobileTab === 'editor' ? 'is-active' : ''}
            aria-selected={activeMobileTab === 'editor'}
            onClick={() => setActiveMobileTab('editor')}
          >
            Editor
          </button>
          <button
            type="button"
            role="tab"
            className={activeMobileTab === 'preview' ? 'is-active' : ''}
            aria-selected={activeMobileTab === 'preview'}
            onClick={() => setActiveMobileTab('preview')}
          >
            {isAiGuideOpen ? 'AI Tips' : 'Preview'}
          </button>
        </div>
        <EditorPane value={markdownText} onChange={setMarkdownText} />
        {isAiGuideOpen ? (
          <AiPromptGuide onBack={() => setIsAiGuideOpen(false)} />
        ) : (
          <PreviewPane previewRef={previewRef} tocItems={tocItems} />
        )}
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
    </div>
  );
}
