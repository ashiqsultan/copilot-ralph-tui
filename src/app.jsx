import React, { useState } from 'react'
import ProjectSelect from './screens/ProjectSelect.jsx'
import Dashboard from './screens/Dashboard.jsx'

export default function App({ initialPath }) {
  const [projectPath, setProjectPath] = useState(initialPath || null)

  if (!projectPath) {
    return <ProjectSelect onSelect={setProjectPath} />
  }

  return <Dashboard projectPath={projectPath} />
}
