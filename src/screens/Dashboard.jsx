import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Box, Text, useInput, useApp } from 'ink'
import RequirementList from '../components/RequirementList.jsx'
import RequirementDetail from '../components/RequirementDetail.jsx'
import ExecutionConsole from '../components/ExecutionConsole.jsx'
import StatusBar from '../components/StatusBar.jsx'
import ModelSelector from '../components/ModelSelector.jsx'
import RequirementForm from './RequirementForm.jsx'
import Settings from './Settings.jsx'
import { readPrd, addRequirement, updateRequirement, deleteRequirement } from '../core/prd.js'
import { executeRequirement, abortCurrentProcess, isProcessRunning } from '../core/executor.js'
import { executePlan, abortPlanProcess, isPlanRunning } from '../core/planner.js'
import { getConfigValue } from '../core/config.js'

// selectedIndex: 0 = Console, 1..N = requirements[index - 1]
export default function Dashboard({ projectPath }) {
  const { exit } = useApp()
  const [requirements, setRequirements] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0) // 0 = Console
  const [consoleLines, setConsoleLines] = useState([])
  const [status, setStatus] = useState('idle') // idle, running, planning
  const [activeReqId, setActiveReqId] = useState(null)
  const [view, setView] = useState('dashboard') // dashboard, add, edit, settings, model-selector, confirm-delete
  const [focusPanel, setFocusPanel] = useState('list') // list, right

  const runAllAbortedRef = useRef(false)
  const model = getConfigValue('model')

  const loadRequirements = useCallback(async () => {
    const prd = await readPrd(projectPath)
    setRequirements(prd)
  }, [projectPath])

  useEffect(() => {
    loadRequirements()
  }, [loadRequirements])

  const addConsoleLine = useCallback((text, type = 'stdout') => {
    const lines = text.split('\n').filter((l) => l.length > 0)
    setConsoleLines((prev) => [...prev, ...lines.map((l) => ({ text: l, type }))])
  }, [])

  // Get the currently selected requirement (null if Console is selected)
  const getSelectedReq = useCallback(() => {
    if (selectedIndex === 0) return null
    return requirements[selectedIndex - 1] || null
  }, [selectedIndex, requirements])

  const handleRun = useCallback(async () => {
    if (isProcessRunning() || isPlanRunning()) return
    if (requirements.length === 0) {
      addConsoleLine('No requirements to run.', 'system')
      return
    }

    const selectedReq = getSelectedReq()
    if (!selectedReq) return
    if (selectedReq.isDone) {
      addConsoleLine(`Requirement #${selectedReq.id} is already done.`, 'system')
      return
    }

    setStatus('running')
    setActiveReqId(selectedReq.id)
    addConsoleLine(`--- Running requirement #${selectedReq.id}: ${selectedReq.title} ---`, 'system')

    const result = await executeRequirement(selectedReq.id, projectPath, {
      onStdout: (text) => addConsoleLine(text, 'stdout'),
      onStderr: (text) => addConsoleLine(text, 'stderr'),
      onDone: (reqId) => {
        addConsoleLine(`--- Requirement #${reqId} marked as done ---`, 'system')
        loadRequirements()
      },
      onSummary: (summary) => {
        addConsoleLine(`--- Summary saved to progress.txt ---`, 'system')
      },
      onCommit: (result) => {
        if (result.success) {
          addConsoleLine(`--- ${result.message} ---`, 'system')
        } else {
          addConsoleLine(`--- Git: ${result.error} ---`, 'stderr')
        }
      },
      onComplete: ({ code, signal }) => {
        setStatus('idle')
        setActiveReqId(null)
        addConsoleLine(`--- Process exited (code: ${code}) ---`, 'system')
      }
    })

    if (!result.success) {
      addConsoleLine(`Error: ${result.error}`, 'stderr')
      setStatus('idle')
      setActiveReqId(null)
    }
  }, [requirements, getSelectedReq, projectPath, addConsoleLine, loadRequirements])

  const runSingleRequirement = useCallback((req, folderPath) => {
    return new Promise(async (resolve) => {
      addConsoleLine(`--- Running requirement #${req.id}: ${req.title} ---`, 'system')
      setActiveReqId(req.id)

      const result = await executeRequirement(req.id, folderPath, {
        onStdout: (text) => addConsoleLine(text, 'stdout'),
        onStderr: (text) => addConsoleLine(text, 'stderr'),
        onDone: (reqId) => {
          addConsoleLine(`--- Requirement #${reqId} marked as done ---`, 'system')
          loadRequirements()
        },
        onSummary: () => {
          addConsoleLine(`--- Summary saved to progress.txt ---`, 'system')
        },
        onCommit: (commitResult) => {
          if (commitResult.success) {
            addConsoleLine(`--- ${commitResult.message} ---`, 'system')
          } else {
            addConsoleLine(`--- Git: ${commitResult.error} ---`, 'stderr')
          }
        },
        onComplete: ({ code }) => {
          addConsoleLine(`--- Process exited (code: ${code}) ---`, 'system')
          resolve({ code })
        }
      })

      if (!result.success) {
        addConsoleLine(`Error: ${result.error}`, 'stderr')
        resolve({ code: 1, error: result.error })
      }
    })
  }, [addConsoleLine, loadRequirements])

  const handleRunAll = useCallback(async () => {
    if (isProcessRunning() || isPlanRunning()) return
    const pending = requirements.filter((r) => !r.isDone)
    if (pending.length === 0) {
      addConsoleLine('No pending requirements to run.', 'system')
      return
    }

    setStatus('running')
    runAllAbortedRef.current = false
    addConsoleLine(`--- Running all ${pending.length} pending requirements ---`, 'system')

    for (const req of pending) {
      if (runAllAbortedRef.current) {
        addConsoleLine('--- Run all aborted ---', 'system')
        break
      }
      await runSingleRequirement(req, projectPath)
      await loadRequirements()
    }

    setStatus('idle')
    setActiveReqId(null)
    if (!runAllAbortedRef.current) {
      addConsoleLine('--- All requirements completed ---', 'system')
    }
  }, [requirements, projectPath, addConsoleLine, loadRequirements, runSingleRequirement])

  const handlePlan = useCallback(async () => {
    if (isProcessRunning() || isPlanRunning()) return
    if (requirements.length === 0) {
      addConsoleLine('No requirements to plan.', 'system')
      return
    }

    setStatus('planning')
    addConsoleLine('--- Running planner ---', 'system')

    const result = await executePlan(projectPath, {
      onStdout: (text) => addConsoleLine(text, 'stdout'),
      onStderr: (text) => addConsoleLine(text, 'stderr'),
      onPlansSaved: (count) => {
        addConsoleLine(`--- Plans saved to prd.json (${count} items updated) ---`, 'system')
        loadRequirements()
      },
      onComplete: ({ code }) => {
        setStatus('idle')
        addConsoleLine(`--- Planner exited (code: ${code}) ---`, 'system')
      }
    })

    if (!result.success) {
      addConsoleLine(`Error: ${result.error}`, 'stderr')
      setStatus('idle')
    }
  }, [projectPath, requirements, addConsoleLine, loadRequirements])

  const handleAbort = useCallback(() => {
    if (status === 'running') {
      const result = abortCurrentProcess()
      addConsoleLine(`--- ${result.message || result.error} ---`, 'system')
    } else if (status === 'planning') {
      const result = abortPlanProcess()
      addConsoleLine(`--- ${result.message || result.error} ---`, 'system')
    }
    runAllAbortedRef.current = true
    setStatus('idle')
    setActiveReqId(null)
  }, [status, addConsoleLine])

  const handleAdd = useCallback(
    async ({ title, description }) => {
      await addRequirement(projectPath, { title, description })
      await loadRequirements()
      setView('dashboard')
    },
    [projectPath, loadRequirements]
  )

  const handleEdit = useCallback(
    async ({ title, description }) => {
      const req = getSelectedReq()
      if (!req) return
      await updateRequirement(projectPath, req.id, { title, description })
      await loadRequirements()
      setView('dashboard')
    },
    [projectPath, getSelectedReq, loadRequirements]
  )

  const handleDelete = useCallback(async () => {
    const req = getSelectedReq()
    if (!req) return
    await deleteRequirement(projectPath, req.id)
    await loadRequirements()
    if (selectedIndex >= requirements.length && selectedIndex > 1) {
      setSelectedIndex(selectedIndex - 1)
    }
    setView('dashboard')
  }, [projectPath, getSelectedReq, selectedIndex, requirements, loadRequirements])

  useInput(
    (input, key) => {
      if (view !== 'dashboard') return
      if (status === 'running' || status === 'planning') {
        if (input === 'x') handleAbort()
        return
      }



      switch (input) {
        case 'i':
          handleRun()
          break
        case 'r':
          handleRunAll()
          break
        case 'p':
          handlePlan()
          break
        case 'n':
          setView('add')
          setFocusPanel('right')
          break
        case 'e':
          if (getSelectedReq()) {
            setView('edit')
            setFocusPanel('right')
          }
          break
        case 'd':
          if (getSelectedReq()) setView('confirm-delete')
          break
        case 's':
          setView('settings')
          break
        case 'm':
          setView('model-selector')
          break
        case 'q':
          exit()
          break
      }
    },
    { isActive: view === 'dashboard' }
  )

  // Tab handler for switching focus during form views
  useInput(
    (input, key) => {
      if (key.tab) {
        setFocusPanel((prev) => (prev === 'list' ? 'right' : 'list'))
      }
      if (key.escape) {
        setView('dashboard')
        setFocusPanel('list')
      }
    },
    { isActive: (view === 'add' || view === 'edit') && focusPanel !== 'right' }
  )

  // Confirm delete handler
  useInput(
    (input) => {
      if (view !== 'confirm-delete') return
      if (input === 'y') {
        handleDelete()
      } else {
        setView('dashboard')
      }
    },
    { isActive: view === 'confirm-delete' }
  )

  if (view === 'settings') {
    return <Settings onBack={() => { setView('dashboard'); loadRequirements() }} />
  }

  if (view === 'model-selector') {
    return (
      <ModelSelector
        onSelect={(selectedModel) => {
          addConsoleLine(`--- Model set to: ${selectedModel} ---`, 'system')
          setView('dashboard')
          setFocusPanel('list')
        }}
        onCancel={() => {
          setView('dashboard')
          setFocusPanel('list')
        }}
      />
    )
  }

  const handleFormCancel = () => {
    setView('dashboard')
    setFocusPanel('list')
  }

  const handleFormAdd = async (data) => {
    await handleAdd(data)
    setFocusPanel('list')
  }

  const handleFormEdit = async (data) => {
    await handleEdit(data)
    setFocusPanel('list')
  }

  // Determine right panel content
  const renderRightPanel = () => {
    if (view === 'add') {
      return <RequirementForm onSubmit={handleFormAdd} onCancel={handleFormCancel} />
    }
    if (view === 'edit') {
      return (
        <RequirementForm
          initial={getSelectedReq()}
          onSubmit={handleFormEdit}
          onCancel={handleFormCancel}
        />
      )
    }
    if (selectedIndex === 0) {
      return <ExecutionConsole lines={consoleLines} focused={focusPanel === 'right'} />
    }
    return <RequirementDetail requirement={getSelectedReq()} />
  }

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Box paddingX={1} justifyContent="space-between">
        <Text bold color="cyan">copilot-ralph-tui</Text>
        <Text dimColor>{projectPath}</Text>
      </Box>

      {/* Main content */}
      <Box flexGrow={1} flexDirection="row">
        {/* Left panel - Navigation */}
        <Box
          flexDirection="column"
          width="40%"
          borderStyle="single"
          borderColor={focusPanel === 'list' ? 'cyan' : 'gray'}
          paddingX={1}
        >
          <RequirementList
            requirements={requirements}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            focused={focusPanel === 'list' && (view === 'dashboard' || view === 'confirm-delete')}
            status={status}
          />
        </Box>

        {/* Right panel - Dynamic content */}
        <Box
          flexDirection="column"
          width="60%"
          borderStyle="single"
          borderColor={focusPanel === 'right' ? 'cyan' : 'gray'}
          paddingX={1}
        >
          {renderRightPanel()}
        </Box>
      </Box>

      {/* Confirm delete */}
      {view === 'confirm-delete' && getSelectedReq() && (
        <Box paddingX={1}>
          <Text color="red">
            Delete "{getSelectedReq().title}"? (y/n)
          </Text>
        </Box>
      )}

      {/* Status bar */}
      <StatusBar
        status={status}
        activeRequirement={activeReqId}
        model={model}
        projectPath={projectPath}
      />
    </Box>
  )
}
