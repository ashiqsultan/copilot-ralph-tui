import { spawn } from 'node:child_process'
import { getCopilotPath } from './copilot.js'
import { getShellPath } from '../helpers/getShellPath.js'
import { getConfigValue } from './config.js'
import { getRequirementById, getNextIncomplete, markDone } from './prd.js'
import {
  readProgressFile,
  createProgressFile,
  appendToProgressFile,
  progressFileExists
} from './progress.js'
import { commitRequirementChanges } from './git.js'
import buildPrompt from '../prompts/buildPrompt.js'

let currentProcess = null

function extractSummary(outputBuffer) {
  const summaryMatch = outputBuffer.match(/<summary>([\s\S]*?)<\/summary>/i)
  if (summaryMatch && summaryMatch[1]) {
    return summaryMatch[1].trim()
  }
  return null
}

/**
 * Execute a requirement using copilot CLI
 * @param {string} folderPath - Project folder path
 * @param {number|null} requirementId - Requirement ID or null for next incomplete
 * @param {object} callbacks - { onStdout, onStderr, onComplete, onDone, onSummary, onCommit }
 */
export async function executeRequirement(requirementId, folderPath, callbacks = {}) {
  const { onStdout, onStderr, onComplete, onDone, onSummary, onCommit } = callbacks

  let requirement
  if (requirementId !== null && requirementId !== undefined) {
    requirement = await getRequirementById(folderPath, requirementId)
  } else {
    requirement = await getNextIncomplete(folderPath)
  }

  if (!requirement) {
    return { success: false, error: 'No requirement found' }
  }

  // Ensure progress.txt exists
  const progressExists = await progressFileExists(folderPath)
  if (!progressExists) {
    await createProgressFile(folderPath, '')
  }
  const progressTxt = await readProgressFile(folderPath)

  const prompt = buildPrompt(
    requirement.id,
    requirement.title,
    requirement.description,
    requirement.plan,
    progressTxt
  )

  const copilotPath = getCopilotPath()
  const shellPath = getShellPath()
  const selectedModel = getConfigValue('model')

  if (!selectedModel) {
    return { success: false, error: 'No model selected. Configure a model in settings first.' }
  }

  const args = ['--yolo', '--no-auto-update', '--model', selectedModel]

  const child = spawn(copilotPath, args, {
    shell: true,
    cwd: folderPath,
    env: { ...process.env, PATH: shellPath }
  })

  child.stdin.write(prompt)
  child.stdin.end()

  currentProcess = {
    child,
    requirementId: requirement.id,
    folderPath,
    startTime: Date.now()
  }

  let outputBuffer = ''
  let hasMarkedDone = false
  let hasSavedSummary = false

  child.stdout.on('data', async (data) => {
    const text = data.toString()
    outputBuffer += text
    onStdout?.(text)

    // Detect completion
    if (!hasMarkedDone && outputBuffer.includes('<status>done</status>')) {
      hasMarkedDone = true
      await markDone(folderPath, requirement.id)
      onDone?.(requirement.id)

      const commitResult = await commitRequirementChanges(folderPath, requirement)
      onCommit?.(commitResult)
    }

    // Extract and save summary
    if (!hasSavedSummary && outputBuffer.includes('</summary>')) {
      const summary = extractSummary(outputBuffer)
      if (summary) {
        hasSavedSummary = true
        const summaryWithContext = `[${requirement.id}] ${requirement.title}\n${summary}`
        await appendToProgressFile(folderPath, summaryWithContext)
        onSummary?.(summary)
      }
    }
  })

  child.stderr.on('data', (data) => {
    onStderr?.(data.toString())
  })

  child.on('close', (code, signal) => {
    if (currentProcess?.child === child) {
      currentProcess = null
    }
    onComplete?.({ code, signal })
  })

  child.on('error', (error) => {
    if (currentProcess?.child === child) {
      currentProcess = null
    }
    onStderr?.(`Spawn error: ${error.message}`)
    onComplete?.({ code: 1, error: error.message })
  })

  return { success: true, requirementId: requirement.id }
}

export function abortCurrentProcess() {
  if (!currentProcess) {
    return { success: false, error: 'No process is currently running' }
  }

  const { child } = currentProcess
  if (!child || child.killed) {
    currentProcess = null
    return { success: false, error: 'Process already terminated' }
  }

  const killed = child.kill('SIGTERM')
  if (!killed) {
    child.kill('SIGKILL')
  }
  currentProcess = null
  return { success: true, message: 'Process aborted' }
}

export function isProcessRunning() {
  return currentProcess !== null && currentProcess.child && !currentProcess.child.killed
}

export function getCurrentProcessInfo() {
  if (!currentProcess) return null
  return {
    requirementId: currentProcess.requirementId,
    folderPath: currentProcess.folderPath,
    startTime: currentProcess.startTime,
    running: !currentProcess.child.killed,
    pid: currentProcess.child.pid
  }
}
