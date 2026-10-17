# Graph Report - icon-composer-v2  (2026-10-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 122 nodes · 129 edges · 10 communities (8 shown, 2 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- package.json
- fetch-fixtures.mjs
- render-artboards.py
- lint-ui.mjs
- ui/package.json
- devDependencies
- components.js
- scripts
- icon-composer/package.json
- template-icon-builder/package.json

## God Nodes (most connected - your core abstractions)
1. `scripts` - 9 edges
2. `main()` - 6 edges
3. `exports` - 5 edges
4. `walk()` - 3 edges
5. `engines` - 3 edges
6. `@playwright/test` - 3 edges
7. `vite` - 3 edges
8. `vite-plugin-singlefile` - 3 edges
9. `vitest` - 3 edges
10. `scripts` - 3 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (10 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.09
Nodes (17): engines, node, npm, name, private, type, version, workspaces (+9 more)

### Community 1 - "fetch-fixtures.mjs"
Cohesion: 0.16
Nodes (9): NAMES, out, builds, dist, root, files, outputDir, root (+1 more)

### Community 3 - "lint-ui.mjs"
Cohesion: 0.15
Nodes (11): COMPONENTS, DATA_COLOR_OK, defined, EXT, GENERATED, problems, ROOT, RULES (+3 more)

### Community 4 - "ui/package.json"
Cohesion: 0.18
Nodes (10): description, exports, ./components.css, ./components.js, ./icons.js, ./tokens.css, files, name (+2 more)

### Community 5 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, @playwright/test, prettier, vite (+2 more)

### Community 7 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, fixtures:fetch, format:check, lint, lint:ui, test, test:e2e (+1 more)

### Community 8 - "icon-composer/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 9 - "template-icon-builder/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

## Knowledge Gaps
- **2 isolated node(s):** `eslint`, `prettier`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 85 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **What connects `eslint`, `prettier` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09333333333333334 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._