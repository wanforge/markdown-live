import { useRef, useState } from 'react';
import {
  RiBold,
  RiCodeBoxLine,
  RiDoubleQuotesL,
  RiH1,
  RiH2,
  RiH3,
  RiItalic,
  RiLink,
  RiListCheck2,
  RiListOrdered2,
  RiListUnordered,
  RiSeparator,
  RiStrikethrough,
  RiTableLine,
} from 'react-icons/ri';

const INLINE_ACTIONS = [
  { key: 'bold', label: 'Bold', icon: RiBold },
  { key: 'italic', label: 'Italic', icon: RiItalic },
  { key: 'strike', label: 'Strike', icon: RiStrikethrough },
  { key: 'link', label: 'Link', icon: RiLink },
  { key: 'code', label: 'Code', icon: RiCodeBoxLine },
];

const BLOCK_ACTIONS = [
  { key: 'h1', label: 'H1', icon: RiH1 },
  { key: 'h2', label: 'H2', icon: RiH2 },
  { key: 'h3', label: 'H3', icon: RiH3 },
  { key: 'quote', label: 'Quote', icon: RiDoubleQuotesL },
  { key: 'unordered-list', label: 'Bullets', icon: RiListUnordered },
  { key: 'ordered-list', label: 'Numbered', icon: RiListOrdered2 },
  { key: 'task-list', label: 'Checklist', icon: RiListCheck2 },
  { key: 'hr', label: 'Divider', icon: RiSeparator },
  { key: 'table', label: 'Table', icon: RiTableLine },
];

export default function EditorPane({ value, onChange }) {
  const textareaRef = useRef(null);
  const [blockPreset, setBlockPreset] = useState('');

  function updateSelection(nextValue, selectionStart, selectionEnd) {
    onChange(nextValue);
    window.requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  }

  function wrapSelection(prefix, suffix, fallback) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const content = selected || fallback;
    const replacement = `${prefix}${content}${suffix}`;
    const nextValue = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
    const cursorStart = start + prefix.length;
    const cursorEnd = cursorStart + content.length;

    updateSelection(nextValue, cursorStart, cursorEnd);
  }

  function insertTextAtSelection(snippet, cursorOffset = snippet.length) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
    const cursor = start + cursorOffset;
    updateSelection(nextValue, cursor, cursor);
  }

  function prefixEachSelectedLine(prefix, fallback) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || fallback;
    const replacement = selected
      .split('\n')
      .map((line) => `${prefix}${line}`)
      .join('\n');

    const nextValue = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
    updateSelection(nextValue, start, start + replacement.length);
  }

  function insertHeading(level = 2) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end).trim();
    const headingText = selected || 'Section Title';
    const replacement = `${'#'.repeat(level)} ${headingText}`;
    const nextValue = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
    updateSelection(nextValue, start + level + 1, start + replacement.length);
  }

  function insertCode() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);

    if (selected.includes('\n')) {
      wrapSelection('```\n', '\n```', 'code block');
      return;
    }

    wrapSelection('`', '`', 'inline code');
  }

  function applyAction(actionKey) {
    switch (actionKey) {
      case 'h1':
        insertHeading(1);
        return;
      case 'h2':
        insertHeading(2);
        return;
      case 'h3':
        insertHeading(3);
        return;
      case 'bold':
        wrapSelection('**', '**', 'bold text');
        return;
      case 'italic':
        wrapSelection('*', '*', 'italic text');
        return;
      case 'strike':
        wrapSelection('~~', '~~', 'strikethrough text');
        return;
      case 'link':
        wrapSelection('[', '](https://example.com)', 'link text');
        return;
      case 'code':
        insertCode();
        return;
      case 'unordered-list':
        prefixEachSelectedLine('- ', 'List item');
        return;
      case 'ordered-list': {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = value.slice(start, end) || 'List item';
        const replacement = selected
          .split('\n')
          .map((line, index) => `${index + 1}. ${line}`)
          .join('\n');
        const nextValue = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
        updateSelection(nextValue, start, start + replacement.length);
        return;
      }
      case 'task-list':
        prefixEachSelectedLine('- [ ] ', 'Task item');
        return;
      case 'quote':
        prefixEachSelectedLine('> ', 'Quoted text');
        return;
      case 'hr':
        insertTextAtSelection('\n\n---\n\n', 5);
        return;
      case 'table':
        insertTextAtSelection(
          '\n\n| Column 1 | Column 2 |\n| --- | --- |\n| Value A | Value B |\n\n',
          14
        );
        return;
      default:
    }
  }

  function handleBlockPresetChange(event) {
    const nextValue = event.target.value;
    setBlockPreset(nextValue);
    if (nextValue) {
      applyAction(nextValue);
      setBlockPreset('');
    }
  }

  return (
    <section className="pane editor-pane">
      <div className="pane-header">
        <div className="pane-title">Markdown Editor</div>
        <div className="editor-toolbar" role="toolbar" aria-label="Editor toolbar">
          <div className="editor-tool-group">
            {INLINE_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.key}
                  type="button"
                  className="editor-tool-button"
                  onClick={() => applyAction(action.key)}
                  aria-label={`Apply ${action.label}`}
                  title={action.label}
                >
                  <Icon size={16} aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <div className="editor-tool-group">
            <label className="sr-only" htmlFor="editor-block-preset">
              Insert block preset
            </label>
            <select
              id="editor-block-preset"
              className="editor-tool-select"
              value={blockPreset}
              onChange={handleBlockPresetChange}
            >
              <option value="">Blocks</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="quote">Quote</option>
              <option value="unordered-list">Bulleted List</option>
              <option value="ordered-list">Numbered List</option>
              <option value="task-list">Checklist</option>
              <option value="table">Table</option>
              <option value="hr">Divider</option>
            </select>
          </div>

          <div className="editor-tool-group editor-tool-group-blocks">
            {BLOCK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.key}
                  type="button"
                  className="editor-tool-button"
                  onClick={() => applyAction(action.key)}
                  aria-label={`Insert ${action.label}`}
                  title={action.label}
                >
                  <Icon size={16} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        id="editor"
        spellCheck="false"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  );
}
