import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import fs from 'node:fs'
import path from 'node:path'

export default function ProjectSelect({ onSelect }) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = (value) => {
    const resolved = path.resolve(value.trim())
    if (!fs.existsSync(resolved)) {
      setError(`Path does not exist: ${resolved}`)
      return
    }
    if (!fs.statSync(resolved).isDirectory()) {
      setError('Path is not a directory')
      return
    }
    onSelect(resolved)
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          ╔══════════════════════════════════════╗{'\n'}
          ║       copilot-ralph-tui              ║{'\n'}
          ╚══════════════════════════════════════╝
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text>Enter project folder path:</Text>
      </Box>

      <Box>
        <Text color="green">❯ </Text>
        <TextInput value={inputValue} onChange={setInputValue} onSubmit={handleSubmit} />
      </Box>

      {error && (
        <Box marginTop={1}>
          <Text color="red">✗ {error}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Press Enter to confirm</Text>
      </Box>
    </Box>
  )
}
