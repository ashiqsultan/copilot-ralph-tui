import { execSync } from 'node:child_process'

export async function commitRequirementChanges(folderPath, requirement) {
  const execOptions = {
    cwd: folderPath,
    encoding: 'utf8',
    env: process.env,
    timeout: 30000
  }

  try {
    // Ensure git repo exists
    try {
      execSync('git rev-parse --git-dir', execOptions)
    } catch {
      execSync('git init', execOptions)
    }

    // Stage all changes
    execSync('git add -A', execOptions)

    // Check if there are staged changes
    try {
      execSync('git diff --cached --quiet', execOptions)
      return { success: true, message: 'No changes to commit' }
    } catch {
      // There are changes to commit
    }

    const commitMessage = `[${requirement.id}] ${requirement.title}`
    execSync(`git commit -m "${commitMessage}"`, execOptions)
    return { success: true, message: `Committed: ${commitMessage}` }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
