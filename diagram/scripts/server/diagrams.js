// Discover and parse Mermaid (.mmd) files in a directory tree.
//
// Each file may contain one or more diagrams. Diagrams are separated by
// frontmatter blocks of the form:
//
//   ---
//   title: My Diagram
//   ---
//   flowchart LR
//     A --> B
//
// Files without frontmatter are treated as a single diagram named after the file.

const fs = require("fs");
const path = require("path");

const TITLE_FRONTMATTER = /^---\s*\ntitle:\s*(.+)\n---\s*\n/gm;

function walkMmdFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkMmdFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".mmd")) {
      out.push(full);
    }
  }
  return out.sort();
}

function parseDiagrams(baseDir, filepath, content) {
  const rel = path.relative(baseDir, filepath);
  const starts = [];
  let match;
  while ((match = TITLE_FRONTMATTER.exec(content)) !== null) {
    starts.push({
      index: match.index,
      end: match.index + match[0].length,
      name: match[1].trim(),
    });
  }

  if (starts.length === 0) {
    return [{ file: rel, name: rel.replace(/\.mmd$/, ""), source: content.trim() }];
  }

  return starts.map((start, i) => {
    const next = starts[i + 1];
    const source = content.slice(start.end, next ? next.index : content.length).trim();
    return { file: rel, name: start.name, source };
  });
}

function readAll(baseDir) {
  return walkMmdFiles(baseDir).flatMap((fp) => {
    try {
      return parseDiagrams(baseDir, fp, fs.readFileSync(fp, "utf-8"));
    } catch (e) {
      const rel = path.relative(baseDir, fp);
      return [{ file: rel, name: rel, source: `%% read error: ${e.message}` }];
    }
  });
}

module.exports = { readAll };
