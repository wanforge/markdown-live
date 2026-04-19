export default function PreviewPane({ previewRef, tocItems }) {
  return (
    <section className="pane preview-pane">
      <div className="pane-title">Preview</div>
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
      <article ref={previewRef} className="markdown-body" />
    </section>
  );
}
