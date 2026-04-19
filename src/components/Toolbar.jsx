import { BRAND, APP_VERSION } from '../utils/constants';
import { RiGithubFill, RiMoonFill, RiSunFill } from 'react-icons/ri';

export default function Toolbar({
  fileInputRef,
  onLoadSample,
  onOpenFileClick,
  onFileSelected,
  onPrint,
  onExportPdf,
  onExportHtml,
  onToggleTheme,
  isDark,
  isExportingPdf,
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
      </div>

      <div className="actions">
        <button type="button" onClick={onLoadSample}>
          Sample
        </button>
        <button type="button" onClick={onOpenFileClick}>
          Open File
        </button>
        <button type="button" onClick={onPrint}>
          Print
        </button>
        <button type="button" onClick={onExportPdf} disabled={isExportingPdf}>
          {isExportingPdf ? 'Processing...' : 'Export PDF'}
        </button>
        <button type="button" onClick={onExportHtml}>
          Export HTML
        </button>
        <button
          className="icon-button theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <RiSunFill size={20} /> : <RiMoonFill size={20} />}
        </button>
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
