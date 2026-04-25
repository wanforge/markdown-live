import { useState, useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { nord } from '@uiw/codemirror-theme-nord';
import { solarizedLight, solarizedDark } from '@uiw/codemirror-theme-solarized';

import {
  RiBold,
  RiCodeBoxLine,
  RiItalic,
  RiLink,
  RiStrikethrough,
  RiPaletteLine,
} from 'react-icons/ri';

const EDITOR_THEMES = [
  { value: 'oneDark', label: 'One Dark', theme: oneDark },
  { value: 'githubLight', label: 'GitHub Light', theme: githubLight },
  { value: 'githubDark', label: 'GitHub Dark', theme: githubDark },
  { value: 'dracula', label: 'Dracula', theme: dracula },
  { value: 'vscodeDark', label: 'VS Code Dark', theme: vscodeDark },
  { value: 'nord', label: 'Nord', theme: nord },
  { value: 'solarizedLight', label: 'Solarized Light', theme: solarizedLight },
  { value: 'solarizedDark', label: 'Solarized Dark', theme: solarizedDark },
];

const INLINE_ACTIONS = [
  { key: 'bold', label: 'Bold', icon: RiBold },
  { key: 'italic', label: 'Italic', icon: RiItalic },
  { key: 'strike', label: 'Strike', icon: RiStrikethrough },
  { key: 'link', label: 'Link', icon: RiLink },
  { key: 'code', label: 'Code', icon: RiCodeBoxLine },
];

export default function EditorPane({
  value,
  onChange,
  onScroll,
  editorRef,
  editorTheme,
  onEditorThemeChange,
}) {
  const [blockPreset, setBlockPreset] = useState('');

  const currentTheme = useMemo(() => {
    return EDITOR_THEMES.find((t) => t.value === editorTheme)?.theme || oneDark;
  }, [editorTheme]);

  const handleEditorChange = useCallback(
    (val) => {
      onChange(val);
    },
    [onChange]
  );

  function applyAction(actionKey) {
    const view = editorRef.current?.view;
    if (!view) return;

    const selection = view.state.selection.main;
    const selectedText = view.state.sliceDoc(selection.from, selection.to);

    let replacement = '';
    let anchorOffset = 0;
    let headOffset = 0;

    switch (actionKey) {
      case 'h1':
        replacement = `# ${selectedText || 'Heading 1'}`;
        anchorOffset = 2;
        headOffset = replacement.length;
        break;
      case 'h2':
        replacement = `## ${selectedText || 'Heading 2'}`;
        anchorOffset = 3;
        headOffset = replacement.length;
        break;
      case 'h3':
        replacement = `### ${selectedText || 'Heading 3'}`;
        anchorOffset = 4;
        headOffset = replacement.length;
        break;
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        anchorOffset = 2;
        headOffset = replacement.length - 2;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        anchorOffset = 1;
        headOffset = replacement.length - 1;
        break;
      case 'strike':
        replacement = `~~${selectedText || 'strikethrough text'}~~`;
        anchorOffset = 2;
        headOffset = replacement.length - 2;
        break;
      case 'link':
        replacement = `[${selectedText || 'link text'}](https://example.com)`;
        anchorOffset = 1;
        headOffset = (selectedText || 'link text').length + 1;
        break;
      case 'code':
        if (selectedText.includes('\n')) {
          replacement = `\`\`\`\n${selectedText || 'code block'}\n\`\`\``;
          anchorOffset = 4;
          headOffset = replacement.length - 4;
        } else {
          replacement = `\`${selectedText || 'inline code'}\``;
          anchorOffset = 1;
          headOffset = replacement.length - 1;
        }
        break;
      case 'unordered-list':
        replacement = (selectedText || 'List item')
          .split('\n')
          .map((l) => `- ${l}`)
          .join('\n');
        anchorOffset = 0;
        headOffset = replacement.length;
        break;
      case 'ordered-list':
        replacement = (selectedText || 'List item')
          .split('\n')
          .map((l, i) => `${i + 1}. ${l}`)
          .join('\n');
        anchorOffset = 0;
        headOffset = replacement.length;
        break;
      case 'task-list':
        replacement = (selectedText || 'Task item')
          .split('\n')
          .map((l) => `- [ ] ${l}`)
          .join('\n');
        anchorOffset = 0;
        headOffset = replacement.length;
        break;
      case 'quote':
        replacement = (selectedText || 'Quoted text')
          .split('\n')
          .map((l) => `> ${l}`)
          .join('\n');
        anchorOffset = 0;
        headOffset = replacement.length;
        break;
      case 'hr':
        replacement = '\n\n---\n\n';
        anchorOffset = 5;
        headOffset = 5;
        break;
      case 'table':
        replacement =
          '\n\n| Column 1 | Column 2 |\n| --- | --- |\n| Value A | Value B |\n\n';
        anchorOffset = 14;
        headOffset = 24;
        break;
      default:
        return;
    }

    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: replacement },
      selection: {
        anchor: selection.from + anchorOffset,
        head: selection.from + headOffset,
      },
      scrollIntoView: true,
    });
    view.focus();
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
        <div className="pane-title">Editor</div>
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

          <div className="editor-tool-group">
            <RiPaletteLine size={16} className="editor-tool-icon" />
            <select
              className="editor-tool-select editor-theme-select"
              value={editorTheme}
              onChange={(e) => onEditorThemeChange(e.target.value)}
              title="Editor Theme"
            >
              {EDITOR_THEMES.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="editor-container" onScroll={onScroll}>
        <CodeMirror
          ref={editorRef}
          value={value}
          height="100%"
          theme={currentTheme}
          extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
          onChange={handleEditorChange}
          onCreateEditor={(view) => {
            const scroller = view.scrollDOM;
            if (scroller) {
              scroller.addEventListener('scroll', () => {
                if (onScroll) onScroll({ target: view.dom.closest('.editor-container') });
              });
            }
          }}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            bracketMatching: true,
            autocompletion: true,
            foldGutter: true,
          }}
        />
      </div>
    </section>
  );
}
