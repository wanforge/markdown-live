# MarkDown Live

![MarkDown Live Logo](./public/icon.svg)

[![Version](https://img.shields.io/badge/version-0.1.0-003D99)](https://github.com/wanforge/markdown-live)
[![License: MIT](https://img.shields.io/badge/license-MIT-80B3FF.svg)](./LICENSE)
[![CI](https://github.com/wanforge/markdown-live/actions/workflows/ci.yml/badge.svg)](https://github.com/wanforge/markdown-live/actions/workflows/ci.yml)
[![Deploy Pages](https://github.com/wanforge/markdown-live/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/wanforge/markdown-live/actions/workflows/deploy-pages.yml)
[![CodeQL](https://github.com/wanforge/markdown-live/actions/workflows/codeql.yml/badge.svg)](https://github.com/wanforge/markdown-live/actions/workflows/codeql.yml)

Open source tool to convert markdown and AI output into polished documents.

MarkDown Live helps you:

- Write or paste AI-generated markdown.
- Render Mermaid diagrams and KaTeX formulas correctly.
- Export to HTML/PDF for reports, docs, and sharing.
- Stay privacy-first: no analytics, no telemetry.

## What Is New in v0.1.0

- Migrated to a React + Vite framework architecture.
- Introduced a structured directory for long-term scalability.
- Added GitHub Actions for CI, Pages deploy, and CodeQL.
- Added MIT license and refreshed documentation.
- Unified theme colors using icon.svg palette.

## Tech Stack

- React 18
- Vite 5
- markdown-it + plugins
- Mermaid
- KaTeX
- Highlight.js
- DOMPurify
- html2canvas + jsPDF

## Color System

Primary brand colors come directly from icon.svg:

- Primary: #003D99
- Accent: #80B3FF
- Neutral: #FFFFFF

## Structured Directory

```text
markdown-live/
├── .github/workflows/      CI, deploy, security workflows
├── public/                 Static assets (icon.svg, icon.png)
├── src/
│   ├── components/         UI components
│   ├── lib/                Markdown rendering engine
│   ├── styles/             App styles
│   ├── utils/              Constants, exporters, sample markdown
│   ├── App.jsx             App shell
│   └── main.jsx            Entry point
├── CNAME
├── CHANGELOG.md
├── LICENSE
├── index.html
├── package.json
└── vite.config.js
```

## Run Locally

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

## AI Prompt Tips (Important)

Use these prompt keywords so AI output is fully compatible with MarkDown Live.

### 1) Math with KaTeX

Prompt tip:

- "Write formulas using KaTeX delimiters. Inline with $...$ and block with $$...$$."

Example expected output:

```markdown
Inline: $E = mc^2$

$$
\int_0^1 x^2 dx = \frac{1}{3}
$$
```

### 2) Flowcharts with Mermaid

Prompt tip:

- "Generate diagrams in Mermaid fenced code blocks using ```mermaid."

Example expected output:

```markdown
\`\`\`mermaid
flowchart TD
A[Input] --> B[Process]
B --> C[Output]
\`\`\`
```

### 3) Tables, tasks, references

Prompt tip:

- "Use GFM markdown tables, task lists (- [ ] / - [x]), and footnotes ([^1])."

Example expected output:

```markdown
| Item  | Status |
| ----- | ------ |
| Draft | Done   |

- [x] Write section
- [ ] Review section

Reference text.[^1]

[^1]: Source note.
```

### 4) Document-ready AI output

Prompt tip:

- "Output only clean markdown, use heading hierarchy (H1-H3), avoid HTML unless needed, and keep sections print-ready."

## How To Introduce This Tool

Use this short pitch when presenting MarkDown Live:

"MarkDown Live is an open source markdown-to-document tool. You can paste AI output, render formulas with KaTeX, render diagrams with Mermaid, and export clean docs to HTML or PDF in minutes. It is free forever and has no analytics tracking."

## GitHub Actions

- CI: lint + build on push and pull request.
- Deploy Pages: auto deploy to GitHub Pages from main branch.
- CodeQL: automated JavaScript security scanning.

## Changelog Policy

Changelog entries should be created from commit history (commit-first), then grouped by release version.

## License

MIT. See [LICENSE](./LICENSE).

---

© 2026 WanForge (wanforge.asia)
