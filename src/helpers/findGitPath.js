import { execSync } from 'node:child_process'
import { getShellPath } from './getShellPath.js'

export function findGitPath() {
  try {
    const shellPath = getShellPath()
    const command = process.platform === 'win32' ? 'where git' : 'which git'
    const result = execSync(command, {
      encoding: 'utf8',
      env: { ...process.env, PATH: shellPath },
      timeout: 5000
    }).trim()
    return process.platform === 'win32' ? result.split('\n')[0] : result
  } catch {
    return null
  }
}
