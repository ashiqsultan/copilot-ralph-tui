import { execSync } from 'node:child_process'
import { findGitPath } from '../helpers/findGitPath.js'
import { getShellPath } from '../helpers/getShellPath.js'

export async function commitRequirementChanges(folderPath, requirement) {
  const gitPath = findGitPath()
  const shellPath = getShellPath()

  if (!gitPath) {
    return { success: false, error: "Can't find git executable" }
  }

  const execOptions = {
    cwd: folderPath,
    encoding: 'utf8',
    env: { ...process.env, PATH: shellPath },
    timeout: 30000
  }

  try {
    // Ensure git repo exists
    try {
      execSync(`"${gitPath}" rev-parse --git-dir`, execOptions)
    } catch {
      execSync(`"${gitPath}" init`, execOptions)
    }

    // Stage all changes
    execSync(`"${gitPath}" add -A`, execOptions)

    // Check if there are staged changes
    try {
      execSync(`"${gitPath}" diff --cached --quiet`, execOptions)
      return { success: true, message: 'No changes to commit' }
    } catch {
      // There are changes to commit
    }

    const commitMessage = `[${requirement.id}] ${requirement.title}`
    execSync(`"${gitPath}" commit -m "${commitMessage}"`, execOptions)
    return { success: true, message: `Committed: ${commitMessage}` }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
