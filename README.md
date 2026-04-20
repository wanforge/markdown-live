<div align="center">
  <img src="./public/icon.svg" alt="MarkDown Live Logo" width="120" />

  <h1>MarkDown Live</h1>

  <p><em>Privacy-first markdown editor for turning raw markdown and AI output into professional, print-ready documents.</em></p>

[![Version](https://img.shields.io/github/v/tag/wanforge/markdown-live?label=version&color=003D99&logo=github)](https://github.com/wanforge/markdown-live/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-003D99?logo=opensourceinitiative&logoColor=white)](./LICENSE)
[![CI](https://github.com/wanforge/markdown-live/actions/workflows/ci.yml/badge.svg)](https://github.com/wanforge/markdown-live/actions/workflows/ci.yml)
[![CodeQL](https://github.com/wanforge/markdown-live/actions/workflows/codeql.yml/badge.svg)](https://github.com/wanforge/markdown-live/actions/workflows/codeql.yml)
[![Deploy Pages](https://github.com/wanforge/markdown-live/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/wanforge/markdown-live/actions/workflows/deploy-pages.yml)

[![Node Support](https://img.shields.io/badge/node-%3E%3D20-003D99?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Linter](https://img.shields.io/badge/eslint-v9-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)

<img src="./public/preview.png" alt="MarkDown Live Screenshot" width="100%" />
</div>

---

**MarkDown Live** is a privacy-first, open-source markdown editor designed to transform raw markdown and AI-generated content into professional, print-ready documents. It features robust support for LaTeX mathematics (KaTeX), technical diagrams (Mermaid), and advanced formatting, all with zero tracking and a lightning-fast live preview.

## Highlights

- Live preview while typing
- Auto-save to localStorage (editor content + light/dark mode)
- Built-in sample loader from `public/sample.md`
- Open local `.md`, `.markdown`, or `.txt` files
- Table of Contents generated from headings
- Print-ready output
- Export to PDF (with print fallback)
- Export to standalone HTML document
- Mermaid diagram rendering with light/dark theme adaptation
- KaTeX formula rendering with robust delimiter normalization
- Security-focused rendered HTML sanitization via DOMPurify

## Quick Start

### Requirements

- Node.js `>=20`

### Install and Run

```bash
npm install
npm run dev
```

### Build and Preview Production

```bash
npm run build
npm run preview
```

### Quality Checks

```bash
npm run lint
npm run check
```

## How To Use

1. Write markdown in the **Editor** pane.
2. See formatted output in the **Preview** pane.
3. Use **Sample** to load the full demo document from `public/sample.md`.
4. Use **Open** to import your own markdown file.
5. Export via **Print**, **PDF**, or **HTML** in the top toolbar.

On mobile width, switch between editor and preview using the tab buttons.

## Supported Markdown Features

- Headings, lists, quotes, links, images
- Tables, task lists, footnotes, definition lists
- Highlight (`==text==`), subscript (`H~2~O`), superscript (`x^2^`)
- Fenced code blocks with Highlight.js syntax coloring
- Mermaid in fenced blocks (` ```mermaid `)
- KaTeX math:
  - Inline: `$ ... $` or `\( ... \)`
  - Block: `$$ ... $$` or `\[ ... \]`

> Note: `\(...\)` and `\[...\]` are normalized internally to dollar delimiters before parsing, so AI-generated math is more tolerant to formatting variation.

## AI Prompt Tips

Use these prompt instructions if you generate markdown from AI:

- "Output clean Markdown only, no extra explanation text."
- "Use heading hierarchy H1-H3 and keep sections print-ready."
- "Use fenced Mermaid blocks for diagrams."
- "Use KaTeX delimiters (`$...$`, `$$...$$`, `\\(...\\)`, `\\[...\\]`)."
- "Use GFM tables, tasks, and footnotes when needed."

## Project Structure

```text
markdown-live/
├── public/
│   ├── icon.svg
│   └── sample.md
├── src/
│   ├── components/
│   │   ├── EditorPane.jsx
│   │   ├── PreviewPane.jsx
│   │   └── Toolbar.jsx
│   ├── lib/
│   │   └── markdown.js
│   ├── styles/
│   │   └── app.css
│   ├── utils/
│   │   ├── constants.js
│   │   └── exporters.js
│   ├── App.jsx
│   └── main.jsx
├── CHANGELOG.md
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js
```

## Tech Stack

React 19, Vite 8, markdown-it (+ plugins), KaTeX, Mermaid, Highlight.js, DOMPurify, html2canvas, jsPDF, react-icons.

Brand colors (from `icon.svg`):

- Primary: `#003D99`
- Accent: `#80B3FF`
- White: `#FFFFFF`

## Release Workflow

Version bump helpers:

```bash
npm run tag:patch
npm run tag:minor
npm run tag:major
```

Then push commit and tag:

```bash
git push origin main --follow-tags
```

## License

Licensed under MIT. See [LICENSE](./LICENSE).

---

&copy; 2026 WanForge ([wanforge.asia](https://wanforge.asia))
