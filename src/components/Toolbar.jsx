import { BRAND } from '../utils/constants';

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
      </div>

      <div className="actions">
        <a
          className="github-link"
          href={BRAND.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contribute on GitHub"
          title="Contribute on GitHub"
        >
          GitHub
        </a>
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
        <button type="button" onClick={onToggleTheme}>
          {isDark ? 'Light' : 'Dark'}
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
