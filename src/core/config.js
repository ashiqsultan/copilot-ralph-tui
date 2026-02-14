import path from 'node:path'
import fs from 'node:fs'

const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.copilot-ralph-tui')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')

const DEFAULTS = {
  model: null
}

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true })
  }
}

export function readConfig() {
  try {
    ensureConfigDir()
    if (!fs.existsSync(CONFIG_FILE)) {
      return { ...DEFAULTS }
    }
    const content = fs.readFileSync(CONFIG_FILE, 'utf-8')
    return { ...DEFAULTS, ...JSON.parse(content) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function writeConfig(config) {
  try {
    ensureConfigDir()
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}

export function getConfigValue(key) {
  const config = readConfig()
  return config[key] ?? null
}

export function setConfigValue(key, value) {
  const config = readConfig()
  config[key] = value
  return writeConfig(config)
}
