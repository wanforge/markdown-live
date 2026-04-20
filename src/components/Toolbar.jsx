import { BRAND, APP_VERSION } from '../utils/constants';
import {
  RiCompass3Line,
  RiFilePaper2Line,
  RiFilePdf2Line,
  RiFileUploadLine,
  RiGithubFill,
  RiHtml5Line,
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
  hasDocumentContent,
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <img
          className="brand-icon"
          src="/icon.svg"
          width="24"
          height="24"
          alt="MarkDown Live logo"
        />
        <span>{BRAND.name}</span>
        <span className="version-badge">v{APP_VERSION}</span>
        <div className="brand-icons">
          <a
            className="icon-button github-icon"
            href={BRAND.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on GitHub"
            title="View on GitHub"
          >
            <RiGithubFill size={20} />
          </a>
          <button
            className="icon-button theme-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <RiSunFill size={20} /> : <RiMoonFill size={20} />}
          </button>
        </div>
      </div>

      <div className="actions">
        <div className="action-group">
          <span className="action-group-label">Source</span>
          <div className="action-group-buttons">
            <button type="button" onClick={onLoadSample}>
              <RiFilePaper2Line size={16} aria-hidden="true" />
              <span>Sample</span>
            </button>
            <button type="button" onClick={onOpenFileClick}>
              <RiFileUploadLine size={16} aria-hidden="true" />
              <span>Open</span>
            </button>
            <button type="button" onClick={onToggleAiGuide}>
              <RiCompass3Line size={16} aria-hidden="true" />
              <span>{isAiGuideOpen ? 'Preview' : 'AI Tips'}</span>
            </button>
          </div>
        </div>

        <div className="action-group">
          <span className="action-group-label">Export</span>
          <div className="action-group-buttons">
            <button type="button" onClick={onPrint} disabled={!hasDocumentContent}>
              <RiPrinterLine size={16} aria-hidden="true" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onExportPdf}
              disabled={isExportingPdf || !hasDocumentContent}
            >
              <RiFilePdf2Line size={16} aria-hidden="true" />
              <span>{isExportingPdf ? 'Saving...' : 'PDF'}</span>
            </button>
            <button type="button" onClick={onExportHtml} disabled={!hasDocumentContent}>
              <RiHtml5Line size={16} aria-hidden="true" />
              <span>HTML</span>
            </button>
          </div>
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
