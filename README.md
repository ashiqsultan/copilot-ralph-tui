# copilot-ralph-tui

A TUI (Terminal User Interface) for vibe coding with GitHub Copilot CLI. Manage PRD requirements, generate plans, and execute them autonomously — all from your terminal.

This is a lightweight alternative to the [copilot-ralph](https://github.com/AshiqSultan/copilot-ralph) Electron desktop app.

## Prerequisites

- **Node.js** v18+
- **GitHub Copilot CLI** installed and authenticated (`copilot` command available in PATH)

## Install & Run

```bash
# Clone and install
cd copilot-ralph-tui
npm install

# Run with a project path
npm start -- --path /path/to/your/project

# Or run interactively (will prompt for path)
npm start
```

### Global Install

```bash
npm install -g .
copilot-ralph-tui --path /path/to/your/project
```

## Keybindings

| Key | Action |
|-----|--------|
| `r` | Run executor on all requirements |
| `i` | Run executor on selected requirement |
| `p` | Run planner on all requirements |
| `n` | Add new requirement |
| `e` | Edit selected requirement |
| `d` | Delete selected requirement |
| `s` | Open settings (status check, model) |
| `m` | Open model selector |
| `x` | Abort running process |
| `q` | Quit |
| `↑/↓` | Navigate requirement list |

## How It Works

1. **Select a project folder** — point to any codebase
2. **Add requirements** — define what you want built (stored in `.copilot_ralph/prd.json`)
3. **Generate plans** — AI analyzes your codebase and creates implementation plans
4. **Execute** — Copilot CLI autonomously implements each requirement
5. **Auto-commit** — each completed requirement is committed to git

## Project Structure

```
copilot-ralph-tui/
├── cli.js                    # Entry point
├── src/
│   ├── app.jsx               # Root component
│   ├── screens/
│   │   ├── ProjectSelect.jsx # Folder path input
│   │   ├── Dashboard.jsx     # Main screen
│   │   ├── RequirementForm.jsx # Add/edit requirements
│   │   └── Settings.jsx      # Copilot status & model config
│   ├── components/
│   │   ├── RequirementList.jsx
│   │   ├── ExecutionConsole.jsx
│   │   ├── StatusBar.jsx
│   │   └── ModelSelector.jsx
│   ├── core/                 # Business logic (no UI deps)
│   │   ├── prd.js            # CRUD for prd.json
│   │   ├── executor.js       # Copilot CLI execution
│   │   ├── planner.js        # Plan generation
│   │   ├── git.js            # Auto-commit
│   │   ├── progress.js       # Progress tracking
│   │   ├── config.js         # Settings persistence
│   │   └── copilot.js        # Copilot SDK client
│   ├── prompts/              # LLM prompt templates
│   └── helpers/              # Path resolution utilities
```

## Configuration

Settings are stored in `~/.copilot-ralph-tui/config.json`:

- **model** — Selected AI model for execution

## License

MIT
