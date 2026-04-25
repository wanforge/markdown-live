import { useState, useMemo } from 'react';
import {
  RiFileCopyLine,
  RiCheckLine,
  RiLightbulbFlashLine,
  RiMagicLine,
  RiLayout4Line,
} from 'react-icons/ri';

const PROMPT_BLOCKS = [
  {
    title: 'Publish-Ready Document',
    description: 'Structure for articles or technical documentations.',
    prompt:
      'Write a publish-ready markdown document about [TOPIC]. Use H1-H3 heading structure, concise paragraphs, and bullet lists. Return markdown only.',
  },
  {
    title: 'Math & Formulas',
    description: 'LaTeX formulas with step-by-step explanations.',
    prompt:
      'Explain [TOPIC] in markdown. Use inline formulas with $...$ and display formulas with $$...$$. Include a numeric example.',
  },
  {
    title: 'Mermaid Diagrams',
    description: 'Visualizing workflows or system architectures.',
    prompt:
      'Create a process summary for [TOPIC] in markdown. Include a Mermaid diagram using a fenced ```mermaid block.',
  },
  {
    title: 'Executive Report',
    description: 'Business reports with tables and task lists.',
    prompt:
      'Create a markdown report for [TOPIC]. Include: Executive Summary, Key Findings (table), and Next Steps (task list).',
  },
];

const READY_TO_PASTE_TEMPLATE = `# [Document Title]

## Summary
- Key point 1
- Key point 2

## Analysis
Detailed analysis goes here.

### Formula
$E = mc^2$

### Diagram
\`\`\`mermaid
flowchart LR
  A[Start] --> B[Process]
  B --> C[End]
\`\`\`

## Checklist
- [ ] Task 1
- [ ] Task 2`;

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      className={`copy-button ${copied ? 'is-copied' : ''}`}
      onClick={handleCopy}
    >
      {copied ? <RiCheckLine size={16} /> : <RiFileCopyLine size={16} />}
      <span>{copied ? 'Copied!' : label}</span>
    </button>
  );
}

export default function AiPromptGuide({ onBack, onInsertTemplate }) {
  const [customTopic, setCustomTopic] = useState('');

  const builtPrompt = useMemo(() => {
    const topic = customTopic.trim() || '[YOUR TOPIC]';
    return `Write a comprehensive markdown document about ${topic}. Include a title, H1-H3 headings, a summary table, and a Mermaid diagram. Return ONLY the markdown code.`;
  }, [customTopic]);

  return (
    <section className="pane ai-guide-pane" aria-label="AI Prompt Guide">
      <div className="pane-title">
        <RiLightbulbFlashLine className="pane-title-icon" />
        AI Writing Companion
      </div>
      <div className="ai-guide-content">
        <header className="ai-guide-header">
          <div className="header-text">
            <h2>AI Prompt Recipes</h2>
            <p>Optimize your AI output for MarkDown Live.</p>
          </div>
          {onBack && (
            <button type="button" className="close-btn" onClick={onBack}>
              ✕
            </button>
          )}
        </header>

        <section className="ai-guide-section">
          <div className="section-header">
            <h3>
              <RiMagicLine /> Dynamic Prompt Builder
            </h3>
            <p>Type your topic to generate a specialized prompt for AI.</p>
          </div>
          <div className="builder-card">
            <div className="builder-input-wrapper">
              <input
                type="text"
                placeholder="What are you writing about? (e.g. Solar Energy)"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
              />
            </div>
            <div className="builder-preview">
              <div className="preview-label">Generated Prompt:</div>
              <div className="preview-box">{builtPrompt}</div>
              <CopyButton text={builtPrompt} label="Copy Prompt for AI" />
            </div>
          </div>
        </section>

        <section className="ai-guide-section">
          <div className="section-header">
            <h3>
              <RiLayout4Line /> Quick Presets
            </h3>
          </div>
          <div className="ai-guide-grid">
            {PROMPT_BLOCKS.map((item) => (
              <article key={item.title} className="preset-card">
                <div className="card-top">
                  <h4>{item.title}</h4>
                  <CopyButton text={item.prompt} />
                </div>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ai-guide-section">
          <div className="section-header">
            <h3>
              <RiLayout4Line /> Structural Skeleton
            </h3>
          </div>
          <article className="skeleton-card">
            <div className="skeleton-info">
              <p>Insert a ready-to-fill skeleton directly into the editor.</p>
              <div className="skeleton-actions">
                <button
                  type="button"
                  className="action-button primary"
                  onClick={() => onInsertTemplate?.(READY_TO_PASTE_TEMPLATE)}
                >
                  Apply to Editor
                </button>
                <CopyButton text={READY_TO_PASTE_TEMPLATE} />
              </div>
            </div>
            <pre className="skeleton-preview">
              <code>{READY_TO_PASTE_TEMPLATE}</code>
            </pre>
          </article>
        </section>
      </div>
    </section>
  );
}
