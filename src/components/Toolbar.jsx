import { BRAND, APP_VERSION } from '../utils/constants';
import {
  RiCompass3Line,
  RiFilePaper2Line,
  RiFilePdf2Line,
  RiFileUploadLine,
  RiGithubFill,
  RiHtml5Line,
  RiLoader4Line,
  RiMoonFill,
  RiPrinterLine,
  RiSunFill,
} from 'react-icons/ri';

export default function Toolbar({
  fileInputRef,
  onLoadSample,
  onOpenFileClick,
  onToggleAiGuide,
  onFileSelected,
  onPrint,
  onExportPdf,
  onExportHtml,
  onToggleTheme,
  isAiGuideOpen,
  isDark,
  isExportingPdf,
  isLoadingSample,
  hasDocumentContent,
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand">
          <img
            className="brand-icon"
            src="/icon.svg"
            width="28"
            height="28"
            alt="MarkDown Live logo"
          />
          <span>{BRAND.name}</span>
          <span className="version-badge">v{APP_VERSION}</span>
        </div>

        <div className="topbar-icon-group">
          <a
            className="icon-btn"
            href={BRAND.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            title="GitHub"
          >
            <RiGithubFill aria-hidden="true" />
          </a>
          <button
            className="icon-btn"
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Light mode' : 'Dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? (
              <RiSunFill aria-hidden="true" />
            ) : (
              <RiMoonFill aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div className="topbar-right">
        <div className="toolbar-row">
          <button
            type="button"
            className="tool-btn"
            onClick={onLoadSample}
            disabled={isLoadingSample}
            title="Load sample document"
          >
            {isLoadingSample ? (
              <RiLoader4Line aria-hidden="true" className="spin-icon" />
            ) : (
              <RiFilePaper2Line aria-hidden="true" />
            )}
            <span>{isLoadingSample ? 'Loading…' : 'Sample'}</span>
          </button>

          <button
            type="button"
            className="tool-btn"
            onClick={onOpenFileClick}
            title="Open file"
          >
            <RiFileUploadLine aria-hidden="true" />
            <span>Open</span>
          </button>

          <button
            type="button"
            className="tool-btn tool-btn--accent toolbar-ai-btn"
            onClick={onToggleAiGuide}
            aria-pressed={isAiGuideOpen}
            title="Toggle AI Tips"
          >
            <RiCompass3Line aria-hidden="true" />
            <span>{isAiGuideOpen ? 'Close Tips' : 'AI Tips'}</span>
          </button>
        </div>

        <div className="toolbar-row">
          <button
            type="button"
            className="tool-btn"
            onClick={onPrint}
            disabled={!hasDocumentContent}
            title="Print (Ctrl+P)"
          >
            <RiPrinterLine aria-hidden="true" />
            <span>Print</span>
          </button>

          <button
            type="button"
            className="tool-btn"
            onClick={onExportPdf}
            disabled={isExportingPdf || !hasDocumentContent}
            title="Export PDF"
          >
            {isExportingPdf ? (
              <RiLoader4Line aria-hidden="true" className="spin-icon" />
            ) : (
              <RiFilePdf2Line aria-hidden="true" />
            )}
            <span>{isExportingPdf ? 'Saving…' : 'PDF'}</span>
          </button>

          <button
            type="button"
            className="tool-btn"
            onClick={onExportHtml}
            disabled={!hasDocumentContent}
            title="Export HTML"
          >
            <RiHtml5Line aria-hidden="true" />
            <span>HTML</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          hidden
          onChange={onFileSelected}
        />
      </div>
    </header>
  );
}
