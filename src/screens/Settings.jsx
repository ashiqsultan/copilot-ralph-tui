import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import Spinner from 'ink-spinner'
import SelectInput from 'ink-select-input'
import { getConfigValue, setConfigValue } from '../core/config.js'
import { checkCopilotStatus, getAvailableModels } from '../core/copilot.js'

export default function Settings({ onBack }) {
  const [view, setView] = useState('menu')
  const [copilotStatus, setCopilotStatus] = useState(null)
  const [checking, setChecking] = useState(false)
  const [models, setModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [copilotPathInput, setCopilotPathInput] = useState(getConfigValue('copilotPath') || '')
  const [currentModel, setCurrentModel] = useState(getConfigValue('model') || '')
  const [message, setMessage] = useState(null)

  useInput((input, key) => {
    if (key.escape) {
      if (view === 'menu') {
        onBack()
      } else {
        setView('menu')
      }
    }
  })

  const menuItems = [
    { label: `Check Copilot Status`, value: 'check' },
    { label: `Set Copilot Path (current: ${getConfigValue('copilotPath') || 'auto-detect'})`, value: 'path' },
    { label: `Select Model (current: ${currentModel || 'none'})`, value: 'model' },
    { label: 'Back', value: 'back' }
  ]

  const handleMenuSelect = async (item) => {
    if (item.value === 'back') {
      onBack()
    } else if (item.value === 'check') {
      setChecking(true)
      const result = await checkCopilotStatus()
      setCopilotStatus(result)
      setChecking(false)
    } else if (item.value === 'path') {
      setView('path')
    } else if (item.value === 'model') {
      setLoadingModels(true)
      setView('model')
      const result = await getAvailableModels()
      if (result.success) {
        setModels(result.models || [])
      } else {
        setMessage({ type: 'error', text: result.message })
      }
      setLoadingModels(false)
    }
  }

  const handlePathSubmit = (value) => {
    const trimmed = value.trim()
    if (trimmed) {
      setConfigValue('copilotPath', trimmed)
    } else {
      setConfigValue('copilotPath', null)
    }
    setMessage({ type: 'success', text: trimmed ? `Path set to: ${trimmed}` : 'Path reset to auto-detect' })
    setView('menu')
  }

  const handleModelSelect = (item) => {
    setConfigValue('model', item.value)
    setCurrentModel(item.value)
    setMessage({ type: 'success', text: `Model set to: ${item.value}` })
    setView('menu')
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">⚙ Settings</Text>
      </Box>

      {message && (
        <Box marginBottom={1}>
          <Text color={message.type === 'error' ? 'red' : 'green'}>
            {message.type === 'error' ? '✗' : '✓'} {message.text}
          </Text>
        </Box>
      )}

      {view === 'menu' && (
        <Box flexDirection="column">
          {checking ? (
            <Box>
              <Text color="yellow"><Spinner type="dots" /> Checking Copilot status...</Text>
            </Box>
          ) : copilotStatus ? (
            <Box marginBottom={1}>
              <Text color={copilotStatus.success ? 'green' : 'red'}>
                {copilotStatus.success ? '✓' : '✗'} {copilotStatus.message}
              </Text>
            </Box>
          ) : null}
          <SelectInput items={menuItems} onSelect={handleMenuSelect} />
          <Box marginTop={1}>
            <Text dimColor>Esc to go back</Text>
          </Box>
        </Box>
      )}

      {view === 'path' && (
        <Box flexDirection="column">
          <Text>Copilot CLI path (leave empty for auto-detect):</Text>
          <Box>
            <Text color="green">❯ </Text>
            <TextInput
              value={copilotPathInput}
              onChange={setCopilotPathInput}
              onSubmit={handlePathSubmit}
            />
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Enter to save • Esc to cancel</Text>
          </Box>
        </Box>
      )}

      {view === 'model' && (
        <Box flexDirection="column">
          {loadingModels ? (
            <Box>
              <Text color="yellow"><Spinner type="dots" /> Loading models...</Text>
            </Box>
          ) : models.length > 0 ? (
            <Box flexDirection="column">
              <Text>Select a model:</Text>
              <SelectInput
                items={models.map((m) => ({
                  label: `${m.modelName || m.id || m}${m.modelName === currentModel || m.id === currentModel || m === currentModel ? ' (current)' : ''}`,
                  value: m.modelName || m.id || m
                }))}
                onSelect={handleModelSelect}
              />
            </Box>
          ) : (
            <Text color="red">No models available. Check Copilot status first.</Text>
          )}
          <Box marginTop={1}>
            <Text dimColor>Esc to go back</Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}
