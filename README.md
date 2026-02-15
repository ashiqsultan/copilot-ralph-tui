# copilot-ralph-tui

A TUI (Terminal User Interface) for vibe coding with GitHub Copilot CLI. Manage PRD requirements, generate plans, and execute them autonomously — all from your terminal.

## Prerequisites

- **Node.js** v18+
- **GitHub Copilot CLI** installed and authenticated (`copilot` command available in PATH)

## How to use

**1. Install globally using**

```bash
npm i -g copilot-ralph
```

**2. cd to any folder and run**

```bash
copilot-ralph
```

to open that folder in ralph mode 

**3. Optional you can also use path flag**
```bash
copilot-ralph --path /User/xxx/project_folder
```

## Local Install & Run

```bash
# Clone and install
cd copilot-ralph-tui
npm install

# Run with a project path
npm start -- --path /path/to/your/project

# Or run interactively (will prompt for path)
npm start
```

## Keybindings

| Key   | Action                               |
| ----- | ------------------------------------ |
| `r`   | Run executor on all requirements     |
| `i`   | Run executor on selected requirement |
| `p`   | Run planner on all requirements      |
| `n`   | Add new requirement                  |
| `e`   | Edit selected requirement            |
| `d`   | Delete selected requirement          |
| `s`   | Open settings (status check, model)  |
| `m`   | Open model selector                  |
| `x`   | Abort running process                |
| `q`   | Quit                                 |
| `↑/↓` | Navigate requirement list            |

## How It Works

1. **Select a project folder** — point to any codebase
2. **Add requirements** — define what you want built (stored in `.copilot_ralph/prd.json`)
3. **Generate plans** — AI analyzes your codebase and creates implementation plans
4. **Execute** — Copilot CLI autonomously implements each requirement
5. **Auto-commit** — each completed requirement is committed to git

## Configuration

Settings are stored in `~/.copilot-ralph-tui/config.json`:

## License

MIT

This is a lightweight alternative to the [copilot ralph desktop app](https://github.com/AshiqSultan/copilot-ralph)
