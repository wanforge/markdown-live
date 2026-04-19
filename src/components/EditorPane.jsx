export default function EditorPane({ value, onChange }) {
  return (
    <section className="pane editor-pane">
      <div className="pane-title">Markdown Editor</div>
      <textarea
        id="editor"
        spellCheck="false"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  );
}
