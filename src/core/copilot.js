import { CopilotClient } from '@github/copilot-sdk'
import { findCopilotPath } from '../helpers/findCopilotPath.js'
import { getConfigValue } from './config.js'

let client = null
let cachedCopilotPath = null

export function getCopilotPath() {
  // Check config first, then auto-detect
  const storedPath = getConfigValue('copilotPath')
  if (storedPath) return storedPath
  if (!cachedCopilotPath) {
    cachedCopilotPath = findCopilotPath()
  }
  return cachedCopilotPath
}

export async function getCopilotClient(cliPath) {
  if (!client) {
    client = new CopilotClient({
      cliPath: cliPath,
      autoStart: false
    })
  }
  return client
}

export async function checkCopilotStatus() {
  try {
    const cliPath = getCopilotPath()
    if (!cliPath || cliPath === 'copilot') {
      return {
        success: false,
        message: 'GitHub Copilot CLI not found. Please ensure it is installed and available in your PATH.'
      }
    }
    const copilotClient = await getCopilotClient(cliPath)
    const state = copilotClient.getState()
    if (state !== 'connected') {
      await copilotClient.start()
    }
    await copilotClient.ping('status-check')
    return { success: true, message: 'GitHub Copilot is connected' }
  } catch (error) {
    return {
      success: false,
      message: `GitHub Copilot is not authenticated or CLI is not available: ${error.message}`
    }
  }
}

export async function getAvailableModels() {
  try {
    const cliPath = getCopilotPath()
    if (!cliPath || cliPath === 'copilot') {
      return { success: false, message: 'GitHub Copilot CLI not found.' }
    }
    const copilotClient = await getCopilotClient(cliPath)
    const state = copilotClient.getState()
    if (state !== 'connected') {
      await copilotClient.start()
    }
    const models = await copilotClient.listModels()
    return { success: true, models }
  } catch (error) {
    return { success: false, message: `Failed to get models: ${error.message}` }
  }
}

export async function cleanupCopilotClient() {
  if (client) {
    try {
      await client.stop()
    } catch {}
    client = null
  }
}
