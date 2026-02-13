import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import Spinner from 'ink-spinner'
import SelectInput from 'ink-select-input'
import { getAvailableModels } from '../core/copilot.js'
import { getConfigValue, setConfigValue } from '../core/config.js'

export default function ModelSelector({ onSelect, onCancel }) {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const currentModel = getConfigValue('model')

  useEffect(() => {
    ;(async () => {
      const result = await getAvailableModels()
      if (result.success) {
        setModels(result.models || [])
      } else {
        setError(result.message)
      }
      setLoading(false)
    })()
  }, [])

  useInput((input, key) => {
    if (key.escape) {
      onCancel()
    }
  })

  const handleSelect = (item) => {
    setConfigValue('model', item.value)
    onSelect(item.value)
  }

  if (loading) {
    return (
      <Box padding={1}>
        <Text color="yellow"><Spinner type="dots" /> Loading models...</Text>
      </Box>
    )
  }

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">✗ {error}</Text>
        <Text dimColor>Press Esc to go back</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Select Model {currentModel ? `(current: ${currentModel})` : ''}</Text>
      <SelectInput
        items={models.map((m) => ({
          label: m.modelName || m.id || String(m),
          value: m.modelName || m.id || String(m)
        }))}
        onSelect={handleSelect}
      />
      <Text dimColor>Esc to cancel</Text>
    </Box>
  )
}
