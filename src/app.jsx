import React, { useState } from 'react'
import { Box } from 'ink'
import ProjectSelect from './screens/ProjectSelect.jsx'
import Dashboard from './screens/Dashboard.jsx'

export default function App({ initialPath }) {
  const [projectPath, setProjectPath] = useState(initialPath || null)

  if (!projectPath) {
    return (
      <Box flexDirection="column" height="100%">
        <ProjectSelect onSelect={setProjectPath} />
      </Box>
    )
  }

  return (
    <Box flexDirection="column" height="100%">
      <Dashboard projectPath={projectPath} />
    </Box>
  )
}
