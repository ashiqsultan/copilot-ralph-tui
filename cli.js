#!/usr/bin/env node --import tsx
import React from 'react'
import { render } from 'ink'
import App from './src/app.jsx'

const args = process.argv.slice(2)
let projectPath = null

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--path' && args[i + 1]) {
    projectPath = args[i + 1]
    i++
  }
}

render(React.createElement(App, { initialPath: projectPath }))
