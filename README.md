# Markdown Renderer Lengkap (HTML + JS)

Renderer Markdown siap pakai berbasis browser, tanpa build step.

## Fitur

- GFM: table, task list, strikethrough, autolink
- Syntax highlighting (highlight.js)
- Mermaid diagram
- Footnote, definition list, mark, sub, sup
- Math KaTeX (inline + block)
- Sanitasi HTML (DOMPurify)
- Daftar isi otomatis (H1-H3)
- Copy button pada setiap code block
- Buka file `.md` langsung dari browser
- Export hasil preview jadi HTML

## Menjalankan

1. Buka file `index.html` langsung di browser modern, atau
2. Jalankan server statis sederhana:

```bash
python3 -m http.server 4173
```

Lalu buka `http://localhost:4173`.

## Catatan

- Mermaid dirender dari blok code berbahasa `mermaid`.
- KaTeX support delimiter: `$...$`, `$$...$$`, `\\(...\\)`, `\\[...\\]`.
- Jika browser memblokir module CDN saat buka file langsung, gunakan mode server statis
  (`python3 -m http.server`).
