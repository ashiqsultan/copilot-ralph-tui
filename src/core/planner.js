import path from 'node:path'
import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { getCopilotPath } from './copilot.js'
import { getShellPath } from '../helpers/getShellPath.js'
import { getConfigValue } from './config.js'
import { readPrd, writePrd } from './prd.js'
import buildPlanPrompt from '../prompts/buildPlanPrompt.js'

let currentPlanProcess = null

function extractPlanJson(outputBuffer) {
  // Try markdown code fence
  const fenceMatch = outputBuffer.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim())
    } catch {}
  }
  // Try raw JSON array
  const arrayMatch = outputBuffer.match(/\[[\s\S]*\]/)
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0])
    } catch {}
  }
  return null
}

async function updatePrdWithPlans(folderPath, plans) {
  try {
    const prdContent = await readPrd(folderPath)
    if (!Array.isArray(prdContent)) {
      return { success: false, error: 'prd.json is not an array' }
    }
    const planMap = new Map()
    for (const p of plans) {
      planMap.set(p.id, p.plan)
    }
    let updated = 0
    for (const item of prdContent) {
      if (planMap.has(item.id)) {
        item.plan = planMap.get(item.id)
        updated++
      }
    }
    await writePrd(folderPath, prdContent)
    return { success: true, updated }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Execute the planner using copilot CLI
 * @param {string} folderPath - Project folder path
 * @param {object} callbacks - { onStdout, onStderr, onComplete, onPlansSaved }
 */
export async function executePlan(folderPath, callbacks = {}) {
  const { onStdout, onStderr, onComplete, onPlansSaved } = callbacks

  const prdPath = path.join(folderPath, '.copilot_ralph', 'prd.json')
  let prdRawContent
  try {
    prdRawContent = await fs.readFile(prdPath, 'utf-8')
    JSON.parse(prdRawContent) // validate
  } catch (error) {
    return { success: false, error: `Failed to read prd.json: ${error.message}` }
  }

  const prompt = buildPlanPrompt(prdRawContent)
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

  currentPlanProcess = { child, folderPath, startTime: Date.now() }

  let outputBuffer = ''

  child.stdout.on('data', (data) => {
    const text = data.toString()
    outputBuffer += text
    onStdout?.(text)
  })

  child.stderr.on('data', (data) => {
    onStderr?.(data.toString())
  })

  child.on('close', async (code, signal) => {
    if (currentPlanProcess?.child === child) {
      currentPlanProcess = null
    }

    if (code === 0) {
      const plans = extractPlanJson(outputBuffer)
      if (Array.isArray(plans) && plans.length > 0) {
        const result = await updatePrdWithPlans(folderPath, plans)
        if (result.success) {
          onPlansSaved?.(result.updated)
        } else {
          onStderr?.(`Failed to save plans: ${result.error}`)
        }
      } else {
        onStderr?.('Could not parse plan JSON from output')
      }
    }

    onComplete?.({ code, signal })
  })

  child.on('error', (error) => {
    if (currentPlanProcess?.child === child) {
      currentPlanProcess = null
    }
    onStderr?.(`Spawn error: ${error.message}`)
    onComplete?.({ code: 1, error: error.message })
  })

  return { success: true }
}

export function abortPlanProcess() {
  if (!currentPlanProcess) {
    return { success: false, error: 'No planning process running' }
  }
  const { child } = currentPlanProcess
  if (!child || child.killed) {
    currentPlanProcess = null
    return { success: false, error: 'Process already terminated' }
  }
  const killed = child.kill('SIGTERM')
  if (!killed) {
    child.kill('SIGKILL')
  }
  currentPlanProcess = null
  return { success: true, message: 'Planning process aborted' }
}

export function isPlanRunning() {
  return currentPlanProcess !== null && currentPlanProcess.child && !currentPlanProcess.child.killed
}
