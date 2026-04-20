const PROMPT_BLOCKS = [
  {
    title: 'Foundation Prompt (Publish-Ready Document)',
    prompt:
      'Write a publish-ready markdown document. Use H1-H3 heading structure, concise paragraphs, and bullet lists only when needed. Return markdown only with no extra commentary.',
  },
  {
    title: 'Math + Explanation Prompt',
    prompt:
      'Explain [TOPIC] in markdown. Use inline formulas with $...$ and display formulas with $$...$$. You may also use \\(...\\) and \\[...\\]. Include one short numeric example.',
  },
  {
    title: 'Mermaid Diagram Prompt',
    prompt:
      'Create a process summary for [PROCESS] in markdown and include one Mermaid diagram using a fenced ```mermaid block. Keep node labels short and readable.',
  },
  {
    title: 'Structured Report Prompt',
    prompt:
      'Create a markdown report with these sections: Executive Summary, Findings, Risks, Recommendations, and Next Steps. Use tables for data and task lists for action items.',
  },
];

const READY_TO_PASTE_TEMPLATE = `# Document Title

## Summary
- Key point 1
- Key point 2

## Analysis
Short and structured explanation.

### Formula
Inline: $E = mc^2$

$$
\\int_0^1 x^2 \\, dx = \\frac{1}{3}
$$

### Diagram
\`\`\`mermaid
flowchart LR
  A[Input] --> B[Process]
  B --> C[Output]
\`\`\`

## Checklist
- [x] Draft completed
- [ ] Final review

## References
Reference note.[^1]

[^1]: Add source here.`;

export default function AiPromptGuide({ onBack }) {
  return (
    <section className="pane ai-guide-pane" aria-label="AI Prompt Guide">
      <div className="pane-title">AI Prompt Guide</div>
      <div className="ai-guide-content">
        <div className="ai-guide-header">
          <div>
            <h2>AI Tips & Tricks Prompting</h2>
            <p>
              Prompt recipes designed for copy-paste-ready output in MarkDown Live with
              minimal cleanup.
            </p>
          </div>
          {onBack ? (
            <button type="button" onClick={onBack}>
              Back to Preview
            </button>
          ) : null}
        </div>

        <div className="ai-guide-grid">
          {PROMPT_BLOCKS.map((item) => (
            <article key={item.title} className="ai-guide-card">
              <h3>{item.title}</h3>
              <pre>
                <code>{item.prompt}</code>
              </pre>
            </article>
          ))}
        </div>

        <article className="ai-guide-card ai-guide-template">
          <h3>Ready-to-Paste Output Template</h3>
          <p>
            Use this template when asking AI for markdown that works directly with live
            preview, TOC, KaTeX, and Mermaid.
          </p>
          <pre>
            <code>{READY_TO_PASTE_TEMPLATE}</code>
          </pre>
        </article>

        <article className="ai-guide-card">
          <h3>Prompt Quality Checklist</h3>
          <ul>
            <li>Declare output format: &quot;Markdown only&quot;.</li>
            <li>Specify heading structure: H1-H3.</li>
            <li>List required elements: table, checklist, formulas, or diagrams.</li>
            <li>Set section length limits to keep the result concise.</li>
            <li>Avoid raw HTML unless truly necessary.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
