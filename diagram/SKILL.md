---
name: diagram
description: Live render Mermaid diagrams in a browser with auto-reload as you edit. Use this skill whenever the user wants to create, iterate on, or visualize diagrams — flowcharts, sequence diagrams, ER diagrams, state machines, class diagrams, gantt charts, mindmaps, architecture sketches, or anything else expressible in Mermaid. Trigger it even when the user doesn't say "Mermaid" explicitly: requests like "diagram the auth flow", "sketch out the system architecture", "draw a state machine for X", "visualize how this works", or "let's iterate on a diagram together" all warrant this skill. The skill spins up a local server that watches .mmd files in a directory and hot-reloads the browser view, so the user sees changes immediately as Claude edits the files. Prefer this over generating one-shot SVG when the user is iterating, exploring, or wants multiple related diagrams.
---

# Mermaid

A local Node server that watches `.mmd` files and pushes updates to a browser
tab over Server-Sent Events. No build step. No manual refresh.

## Prerequisites

- Node 20 or newer (recursive `fs.watch` is required)
- Internet access — the page loads Mermaid from a CDN

## Workflow

1. Pick a working directory

    Default to the current working directory, unless specified otherwise. All
    `.mmd` files in the directory and its subdirectories will be rendered.

2. Start the server (once per session)

    Check if the server is already running. If not, start it in the background:

    ```bash
    # Check first — don't start a second instance
    curl -sf http://localhost:3333/health > /dev/null || \
      nohup node "${SKILL_DIR}/scripts/server.js" "${WORK_DIR}" 3333 \
        > "${TMPDIR:-/tmp}/mermaid.log" 2>&1 &
    ```

    Replace `${SKILL_DIR}` with the path to this skill's directory and
    `${WORK_DIR}` with the target directory.

    Tell me the URL once it's up: `http://localhost:3333`. I'll open it and
    leave the tab open.

    If port 3333 is taken, pass a different port as the second argument and
    let me know what it is.

3. Create or edit `.mmd` files

    Every save broadcasts to the browser within ~100ms. Use the conventions below.

4. Iterate

    When I ask for changes, edit the file. Do not restart the server.

## File conventions

One file per topic. When several diagrams belong together, put them in the same
file. Use descriptive filenames like `auth-flow.mmd`, `data-model.mmd`,
`deployment.mmd`.

Frontmatter is optional for single-diagram files. Without frontmatter, the
filename (minus `.mmd`) becomes the heading:

    ```
    flowchart LR
      User --> API --> DB
    ```

Use frontmatter when the filename wouldn't make a good heading, or when the
file holds multiple diagrams (separate each with its own block):

    ```
    ---
    title: Happy path
    ---
    sequenceDiagram
      User->>API: POST /login
      API->>DB: lookup
      DB-->>API: user
      API-->>User: token

    ---
    title: Token refresh
    ---
    sequenceDiagram
      Client->>API: POST /refresh
      API-->>Client: new token
    ```

The `title:` line is the heading shown in the browser. Diagrams render in the
order they appear in the file; files render alphabetically — prefix with
numbers (`01-`, `02-`, …) to control ordering.

## What the server provides

- Recursive watch — new files and subdirectories are picked up automatically.
- Pan (drag) and zoom (scroll wheel) in the browser, plus on-screen zoom controls.
- Per-diagram error display with the offending source in a `<details>` block;
  one broken diagram doesn't break the others.
- Debounced reload (~100ms) so rapid edits don't thrash the browser.

## When NOT to use this skill

- One-off diagrams the user wants inline in chat → use the Visualizer tool instead.
- Diagrams the user wants as a downloadable file (PNG, SVG, PDF) → render once and save; don't spin up the server.
- Non-Mermaid diagram formats (Graphviz, PlantUML, D2) — this skill is Mermaid-only.

## Troubleshooting

- **Port in use.** Pass a different port: `node scripts/server.js <dir> 3334`.
- **Browser blank.** Confirm a `.mmd` file exists in the watched directory. Check
  the server log written by the `nohup` redirect above
  (default `$TMPDIR/mermaid.log`, falling back to `/tmp/mermaid.log`).
- **Stopping the server.** The startup banner prints the PID — use
  `kill <pid>` to stop just that instance. `pkill -f "scripts/server.js"`
  kills *every* running instance.
- **Diagrams not rendering at all.** Mermaid loads from `cdn.jsdelivr.net`;
  if the network blocks it, the page stays blank. Open the browser console to
  confirm.
