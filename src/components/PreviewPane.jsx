const PREVIEW_THEMES = [
  { value: 'default', label: 'Live Default' },
  { value: 'official-report', label: 'Official Report' },
  { value: 'cambria-math', label: 'Cambria Math' },
  { value: 'monospace-lab', label: 'Monospace Lab' },
  { value: 'thesis-report', label: 'Thesis Report (TA)' },
];

export default function PreviewPane({
  previewRef,
  tocItems,
  previewTheme,
  onPreviewThemeChange,
  onScroll,
}) {
  return (
    <section className="pane preview-pane">
      <div className="pane-header">
        <div className="pane-title">Preview</div>
        <label className="preview-theme-picker" htmlFor="preview-theme-select">
          <span>Theme</span>
          <select
            id="preview-theme-select"
            value={previewTheme}
            onChange={(event) => onPreviewThemeChange(event.target.value)}
          >
            {PREVIEW_THEMES.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="toc">
        {tocItems.length > 0 && <div className="toc-title">Table of Contents</div>}
        <ul>
          {tocItems.map((item) => (
            <li key={item.id} data-level={item.level}>
              <a href={`#${item.id}`}>{item.text}</a>
            </li>
          ))}
        </ul>
      </div>
      <article
        ref={previewRef}
        className={`markdown-body preview-theme-${previewTheme}`}
        onScroll={onScroll}
      />
    </section>
  );
}
