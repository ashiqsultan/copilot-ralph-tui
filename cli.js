#!/usr/bin/env -S npx tsx
import React from 'react'
import { render } from 'ink'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import App from './src/app.jsx'

const args = process.argv.slice(2)
let projectPath = process.cwd()

for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--path' || args[i] === '-p') && args[i + 1]) {
    projectPath = resolve(args[i + 1])
    i++
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
  copilot-ralph - A TUI for Copilot to vibe code in Ralph mode

  Usage:
    copilot-ralph [options]

  Options:
    -p, --path <dir>  Open a specific project folder (default: current directory)
    -v, --version     Show version number
    -h, --help        Show this help message
`)
    process.exit(0)
  } else if (args[i] === '--version' || args[i] === '-v') {
    const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))
    console.log(pkg.version)
    process.exit(0)
  }
}

render(React.createElement(App, { initialPath: projectPath }), {
  exitOnCtrlC: true,
  patchConsole: false
})
