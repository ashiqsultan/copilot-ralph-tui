import path from 'node:path'
import fs from 'node:fs/promises'

function getProgressFilePath(folderPath) {
  return path.join(folderPath, '.copilot_ralph', 'progress.txt')
}

export async function readProgressFile(folderPath) {
  try {
    const progressPath = getProgressFilePath(folderPath)
    const content = await fs.readFile(progressPath, 'utf-8')
    return content
  } catch (error) {
    if (error.code === 'ENOENT') {
      return ''
    }
    return ''
  }
}

export async function createProgressFile(folderPath, initialContent = '') {
  try {
    const copilotRalphDir = path.join(folderPath, '.copilot_ralph')
    await fs.mkdir(copilotRalphDir, { recursive: true })
    const progressPath = getProgressFilePath(folderPath)
    await fs.writeFile(progressPath, initialContent, { flag: 'wx', encoding: 'utf-8' })
    return { success: true }
  } catch (error) {
    if (error.code === 'EEXIST') {
      return { success: true, message: 'File already exists' }
    }
    return { success: false, error: error.message }
  }
}

export async function appendToProgressFile(folderPath, content) {
  try {
    const copilotRalphDir = path.join(folderPath, '.copilot_ralph')
    await fs.mkdir(copilotRalphDir, { recursive: true })
    const progressPath = getProgressFilePath(folderPath)
    const timestamp = new Date().toISOString()
    const formattedContent = `\n---\n[${timestamp}]\n${content}\n`
    await fs.appendFile(progressPath, formattedContent, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function clearProgressFile(folderPath) {
  try {
    const copilotRalphDir = path.join(folderPath, '.copilot_ralph')
    await fs.mkdir(copilotRalphDir, { recursive: true })
    const progressPath = getProgressFilePath(folderPath)
    await fs.writeFile(progressPath, '', 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function progressFileExists(folderPath) {
  try {
    const progressPath = getProgressFilePath(folderPath)
    await fs.access(progressPath)
    return true
  } catch {
    return false
  }
}
