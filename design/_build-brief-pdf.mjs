/**
 * DESIGN_BRIEF.md → print-ready HTML → PDF via Chrome.
 *
 * Prerequisites: Google Chrome (macOS path below), and `marked`:
 *   npm install marked
 *   node _build-brief-pdf.mjs
 */
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mdPath = join(__dirname, "DESIGN_BRIEF.md");
const htmlPath = join(__dirname, "_brief-print.html");
const pdfPath = join(
  __dirname,
  "Design-Brief-Social-Media-Management.pdf",
);

const raw = readFileSync(mdPath, "utf8");
// Strip YAML frontmatter for body rendering
const bodyMd = raw.replace(/^---[\s\S]*?---\n+/, "");
const bodyHtml = marked.parse(bodyMd, { gfm: true });

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8" />
<title>Design Brief — Social Media Management</title>
<style>
  @page {
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
  }
  :root {
    --ink: #1a1f24;
    --muted: #5c6670;
    --line: #d8dee4;
    --surface: #f4f6f8;
    --accent: #0f3d4c;
  }
  * { box-sizing: border-box; }
  body {
    font-family: "IBM Plex Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    color: var(--ink);
    font-size: 10.5pt;
    line-height: 1.45;
    margin: 0;
  }
  h1 {
    font-size: 22pt;
    font-weight: 650;
    letter-spacing: -0.02em;
    color: var(--accent);
    margin: 0 0 0.4em;
    page-break-after: avoid;
  }
  h2 {
    font-size: 14pt;
    color: var(--accent);
    border-bottom: 1.5px solid var(--line);
    padding-bottom: 0.25em;
    margin: 1.6em 0 0.7em;
    page-break-after: avoid;
  }
  h3 {
    font-size: 11.5pt;
    margin: 1.2em 0 0.45em;
    page-break-after: avoid;
  }
  h4 {
    font-size: 10.5pt;
    margin: 1em 0 0.35em;
    page-break-after: avoid;
  }
  p { margin: 0.45em 0; }
  ul, ol { margin: 0.4em 0 0.6em; padding-left: 1.25em; }
  li { margin: 0.2em 0; }
  strong { font-weight: 650; }
  hr {
    border: none;
    border-top: 1px solid var(--line);
    margin: 1.4em 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0.6em 0 1em;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid var(--line);
    padding: 0.35em 0.5em;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: var(--surface);
    font-weight: 650;
  }
  tr:nth-child(even) td { background: #fafbfc; }
  pre, code {
    font-family: "IBM Plex Mono", "SF Mono", Menlo, Consolas, monospace;
    font-size: 8.5pt;
  }
  pre {
    background: var(--surface);
    border: 1px solid var(--line);
    padding: 0.75em 0.9em;
    overflow-x: auto;
    white-space: pre-wrap;
    page-break-inside: avoid;
  }
  code {
    background: var(--surface);
    padding: 0.05em 0.25em;
    border-radius: 2px;
  }
  pre code { background: none; padding: 0; }
  blockquote {
    margin: 0.6em 0;
    padding: 0.4em 0.8em;
    border-left: 3px solid var(--accent);
    color: var(--muted);
  }
  /* Cover polish: first h1 + following table */
  body > h1:first-of-type {
    font-size: 28pt;
    margin-top: 0.2em;
  }
  em { color: var(--muted); }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

writeFileSync(htmlPath, html, "utf8");

const chrome =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

execFileSync(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${pdfPath}`,
    `file://${htmlPath}`,
  ],
  { stdio: "inherit" },
);

unlinkSync(htmlPath);
console.log(`Wrote ${pdfPath}`);
