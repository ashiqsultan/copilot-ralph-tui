import path from 'node:path'
import fs from 'node:fs/promises'

function getPrdPath(folderPath) {
  return path.join(folderPath, '.copilot_ralph', 'prd.json')
}

export async function readPrd(folderPath) {
  try {
    const prdPath = getPrdPath(folderPath)
    const content = await fs.readFile(prdPath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

export async function writePrd(folderPath, prdContent) {
  const copilotDir = path.join(folderPath, '.copilot_ralph')
  await fs.mkdir(copilotDir, { recursive: true })
  const prdPath = getPrdPath(folderPath)
  await fs.writeFile(prdPath, JSON.stringify(prdContent, null, 2), 'utf-8')
}

export async function addRequirement(folderPath, { title, description = '' }) {
  const prd = await readPrd(folderPath)
  const maxId = prd.length > 0 ? Math.max(...prd.map((r) => r.id)) : -1
  const newReq = {
    id: maxId + 1,
    title,
    description,
    plan: '',
    isDone: false
  }
  prd.push(newReq)
  await writePrd(folderPath, prd)
  return newReq
}

export async function updateRequirement(folderPath, id, updates) {
  const prd = await readPrd(folderPath)
  const index = prd.findIndex((r) => r.id === id)
  if (index === -1) return null
  prd[index] = { ...prd[index], ...updates }
  await writePrd(folderPath, prd)
  return prd[index]
}

export async function deleteRequirement(folderPath, id) {
  const prd = await readPrd(folderPath)
  const index = prd.findIndex((r) => r.id === id)
  if (index === -1) return false
  prd.splice(index, 1)
  await writePrd(folderPath, prd)
  return true
}

export async function getRequirementById(folderPath, id) {
  const prd = await readPrd(folderPath)
  return prd.find((r) => r.id === id) || null
}

export async function getNextIncomplete(folderPath) {
  const prd = await readPrd(folderPath)
  return prd.find((r) => r.isDone === false) || null
}

export async function markDone(folderPath, id) {
  return updateRequirement(folderPath, id, { isDone: true })
}
