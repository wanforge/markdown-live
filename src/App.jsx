import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Toolbar from './components/Toolbar';
import EditorPane from './components/EditorPane';
import PreviewPane from './components/PreviewPane';
import AiPromptGuide from './components/AiPromptGuide';
import Toast from './components/Toast';
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
import { useToast } from './hooks/useToast';
import {
  RiFileEditLine,
  RiEyeLine,
  RiCompass3Line,
  RiBarChartLine,
} from 'react-icons/ri';

const SAMPLE_MARKDOWN_PATH = '/sample.md';
const DEFAULT_EMPTY_DOCUMENT = '# MarkDown Live\n\n';

export default function App() {
  const parser = useMemo(() => createMarkdownParser(), []);
  const previewRef = useRef(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const isSyncingScrollRef = useRef(false);
  const renderCycleRef = useRef(0);

  const { toasts, toast, dismiss } = useToast();

  const [markdownText, setMarkdownText] = useState(() => {
    return localStorage.getItem('markdownContent') || DEFAULT_EMPTY_DOCUMENT;
  });
  const [tocItems, setTocItems] = useState([]);
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const [previewTheme, setPreviewTheme] = useState(
    () => localStorage.getItem('previewTheme') || 'default'
  );
  const [editorTheme, setEditorTheme] = useState(
    () => localStorage.getItem('editorTheme') || 'oneDark'
  );
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('editor');
  const [isAiGuideOpen, setIsAiGuideOpen] = useState(false);

  // PWA install prompt
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // SW update
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const swRegistrationRef = useRef(null);

  const renderedHtml = useMemo(() => {
    const raw = parser.render(markdownText || '');
    return sanitizeRenderedHtml(raw);
  }, [markdownText, parser]);

  const hasDocumentContent = useMemo(() => {
    return markdownText.trim().length > 0;
  }, [markdownText]);

  // Word count
  const wordCount = useMemo(() => {
    const text = markdownText.trim();
    if (!text) return { words: 0, chars: 0 };
    const words = text.split(/\s+/).filter(Boolean).length;
    return { words, chars: text.length };
  }, [markdownText]);

  useEffect(() => {
    localStorage.setItem('markdownContent', markdownText);
  }, [markdownText]);

  // PWA: capture install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      // Only show banner if not dismissed before
      if (!sessionStorage.getItem('pwa-install-dismissed')) {
        setShowInstallBanner(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // PWA: listen for SW update messages from main.jsx
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'SW_UPDATE_AVAILABLE') {
        swRegistrationRef.current = e.data.registration;
        setShowUpdateBanner(true);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

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

  useEffect(() => {
    localStorage.setItem('previewTheme', previewTheme);
  }, [previewTheme]);

  useEffect(() => {
    localStorage.setItem('editorTheme', editorTheme);
  }, [editorTheme]);

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
      toast(`Opened: ${file.name}`, 'success');
    } catch (error) {
      toast(`Failed to read file: ${error.message}`, 'error');
    } finally {
      event.target.value = '';
    }
  }

  function handlePrint() {
    if (!hasDocumentContent) {
      toast('No content to print. Add some markdown first.', 'warning');
      return;
    }

    const title = getDocumentTitle();
    const html = buildExportHtml({
      title,
      contentHtml: clonePreviewHtml(),
      isDark,
      previewTheme,
    });
    openPrintWindow(html);
  }

  async function handleExportPdf() {
    if (!previewRef.current || !hasDocumentContent) {
      toast('No content to export to PDF.', 'warning');
      return;
    }

    setIsExportingPdf(true);
    try {
      await exportPdfFromNode({ node: previewRef.current, title: getDocumentTitle() });
      toast('PDF exported successfully!', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('PDF export failed:', error);
      toast(
        `PDF export failed (${message}). Opening print mode as fallback.`,
        'error',
        5000
      );
      handlePrint();
    } finally {
      setIsExportingPdf(false);
    }
  }

  function handleExportHtml() {
    if (!hasDocumentContent) {
      toast('No content to export to HTML.', 'warning');
      return;
    }

    const defaultTitle = getDocumentTitle();
    const title = window.prompt('Enter document title:', defaultTitle) || defaultTitle;
    const html = buildExportHtml({
      title,
      contentHtml: clonePreviewHtml(),
      isDark,
      previewTheme,
    });

    downloadHtmlDocument({ title, html });
    toast('HTML document downloaded!', 'success');
  }

  async function handleLoadSample() {
    setIsLoadingSample(true);
    try {
      await loadSampleMarkdown();
      toast('Sample document loaded!', 'success');
    } catch (error) {
      toast(`Failed to load sample: ${error.message}`, 'error');
    } finally {
      setIsLoadingSample(false);
    }
  }

  const handleInstallPwa = useCallback(async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === 'accepted') {
      toast('App installed! You can now use it offline.', 'success', 5000);
    }
    setInstallPromptEvent(null);
    setShowInstallBanner(false);
  }, [installPromptEvent, toast]);

  const handleDismissInstall = useCallback(() => {
    sessionStorage.setItem('pwa-install-dismissed', '1');
    setShowInstallBanner(false);
  }, []);

  const handleApplyUpdate = useCallback(() => {
    const reg = swRegistrationRef.current;
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdateBanner(false);
    window.location.reload();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasDocumentContent, isDark, previewTheme]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log(`${BRAND.name} v${APP_VERSION} - Ready!`);
    console.log(`© 2026 ${BRAND.owner} (${BRAND.ownerUrl.replace('https://', '')})`);
  }, []);

  const handleEditorScroll = useCallback((e) => {
    if (isSyncingScrollRef.current) {
      isSyncingScrollRef.current = false;
      return;
    }
    const editorScroller = e.target.querySelector('.cm-scroller');
    const previewNode = previewRef.current;
    if (!editorScroller || !previewNode) return;

    isSyncingScrollRef.current = true;
    const scrollPercentage =
      editorScroller.scrollTop /
      (editorScroller.scrollHeight - editorScroller.clientHeight);
    previewNode.scrollTop =
      scrollPercentage * (previewNode.scrollHeight - previewNode.clientHeight);
  }, []);

  const handlePreviewScroll = useCallback((e) => {
    if (isSyncingScrollRef.current) {
      isSyncingScrollRef.current = false;
      return;
    }
    const previewNode = e.target;
    const editorScroller = editorRef.current?.view?.scrollDOM;
    if (!previewNode || !editorScroller) return;

    isSyncingScrollRef.current = true;
    const scrollPercentage =
      previewNode.scrollTop / (previewNode.scrollHeight - previewNode.clientHeight);
    editorScroller.scrollTop =
      scrollPercentage * (editorScroller.scrollHeight - editorScroller.clientHeight);
  }, []);

  return (
    <div className="app-shell">
      <Toolbar
        fileInputRef={fileInputRef}
        onLoadSample={handleLoadSample}
        onOpenFileClick={handleOpenFileButton}
        onToggleAiGuide={() => {
          setIsAiGuideOpen((value) => {
            const nextValue = !value;
            setActiveMobileTab(nextValue ? 'ai-guide' : 'preview');
            return nextValue;
          });
        }}
        onFileSelected={handleFileInput}
        onPrint={handlePrint}
        onExportPdf={handleExportPdf}
        onExportHtml={handleExportHtml}
        onToggleTheme={() => setIsDark((value) => !value)}
        isAiGuideOpen={isAiGuideOpen}
        isDark={isDark}
        isExportingPdf={isExportingPdf}
        isLoadingSample={isLoadingSample}
        hasDocumentContent={hasDocumentContent}
      />

      <main
        className={`layout ${isAiGuideOpen ? 'layout-with-ai-guide' : ''} ${
          activeMobileTab === 'editor'
            ? 'mobile-editor-active'
            : activeMobileTab === 'preview'
              ? 'mobile-preview-active'
              : 'mobile-ai-guide-active'
        }`}
      >
        <div
          className="mobile-tabs"
          role="tablist"
          aria-label="Editor preview and AI tips"
        >
          <button
            type="button"
            role="tab"
            className={activeMobileTab === 'editor' ? 'is-active' : ''}
            aria-selected={activeMobileTab === 'editor'}
            onClick={() => {
              setIsAiGuideOpen(false);
              setActiveMobileTab('editor');
            }}
          >
            <RiFileEditLine aria-hidden="true" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            role="tab"
            className={activeMobileTab === 'preview' ? 'is-active' : ''}
            aria-selected={activeMobileTab === 'preview'}
            onClick={() => {
              setIsAiGuideOpen(false);
              setActiveMobileTab('preview');
            }}
          >
            <RiEyeLine aria-hidden="true" />
            <span>Preview</span>
          </button>
          <button
            type="button"
            role="tab"
            className={activeMobileTab === 'ai-guide' ? 'is-active' : ''}
            aria-selected={activeMobileTab === 'ai-guide'}
            onClick={() => {
              setIsAiGuideOpen(true);
              setActiveMobileTab('ai-guide');
            }}
          >
            <RiCompass3Line aria-hidden="true" />
            <span>AI Tips</span>
          </button>
        </div>
        <EditorPane
          value={markdownText}
          onChange={setMarkdownText}
          editorRef={editorRef}
          editorTheme={editorTheme}
          onEditorThemeChange={setEditorTheme}
          onScroll={handleEditorScroll}
        />
        <PreviewPane
          previewRef={previewRef}
          tocItems={tocItems}
          previewTheme={previewTheme}
          onPreviewThemeChange={setPreviewTheme}
          onScroll={handlePreviewScroll}
        />
        {isAiGuideOpen ? <AiPromptGuide /> : null}
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
          {wordCount && wordCount.words > 0 && (
            <span className="footer-word-count">
              <RiBarChartLine aria-hidden="true" />
              {wordCount.words.toLocaleString()} words ·{' '}
              {wordCount.chars.toLocaleString()} chars
            </span>
          )}
        </div>
      </footer>

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="pwa-banner" role="complementary" aria-label="Install app">
          <span className="pwa-banner-icon" aria-hidden="true">
            📲
          </span>
          <div className="pwa-banner-text">
            <strong>Install MarkDown Live</strong>
            <span>Use offline, anytime — no browser needed.</span>
          </div>
          <div className="pwa-banner-actions">
            <button
              type="button"
              className="pwa-banner-btn"
              onClick={handleDismissInstall}
            >
              Later
            </button>
            <button
              type="button"
              className="pwa-banner-btn pwa-banner-btn-primary"
              onClick={handleInstallPwa}
            >
              Install
            </button>
          </div>
        </div>
      )}

      {/* SW Update Banner */}
      {showUpdateBanner && (
        <div
          className="pwa-banner"
          role="complementary"
          aria-label="App update available"
        >
          <span className="pwa-banner-icon" aria-hidden="true">
            🔄
          </span>
          <div className="pwa-banner-text">
            <strong>Update available</strong>
            <span>A new version of MarkDown Live is ready.</span>
          </div>
          <div className="pwa-banner-actions">
            <button
              type="button"
              className="pwa-banner-btn"
              onClick={() => setShowUpdateBanner(false)}
            >
              Later
            </button>
            <button
              type="button"
              className="pwa-banner-btn pwa-banner-btn-primary"
              onClick={handleApplyUpdate}
            >
              Reload
            </button>
          </div>
        </div>
      )}

      {/* PDF export overlay */}
      {isExportingPdf && (
        <div className="export-overlay" role="status" aria-live="polite">
          <div className="export-overlay-inner">
            <div className="export-spinner" aria-hidden="true" />
            <span>Generating PDF…</span>
          </div>
        </div>
      )}

      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
