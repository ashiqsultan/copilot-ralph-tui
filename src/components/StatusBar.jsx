import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import Spinner from 'ink-spinner'

export default function StatusBar({ status, activeRequirement, model, projectPath }) {
  const [spinnerColor, setSpinnerColor] = useState('yellow')
  const colors = ['yellow', 'cyan', 'magenta', 'green', 'blue', 'red']
  
  useEffect(() => {
    if (status !== 'running') return
    
    let colorIndex = 0
    const interval = setInterval(() => {
      colorIndex = (colorIndex + 1) % colors.length
      setSpinnerColor(colors[colorIndex])
    }, 500)
    
    return () => clearInterval(interval)
  }, [status])

  const statusColors = {
    idle: 'green',
    running: 'yellow',
    planning: 'blue',
    error: 'red'
  }

  const statusLabels = {
    idle: '● Idle',
    running: 'Running',
    planning: '◉ Planning',
    error: '✗ Error'
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
    >
      <Box justifyContent="space-between">
        <Box gap={2}>
          <Text dimColor>[tab]focus</Text>
          <Text dimColor>[r]un</Text>
          <Text dimColor>[y]run all</Text>
          <Text dimColor>[p]lan</Text>
          <Text dimColor>[a]dd</Text>
          <Text dimColor>[e]dit</Text>
          <Text dimColor>[d]elete</Text>
          <Text dimColor>[s]ettings</Text>
          <Text dimColor>[x]abort</Text>
          <Text dimColor>[q]uit</Text>
        </Box>
        <Box gap={2}>
          {status === 'running' ? (
            <Box gap={1}>
              <Text color={spinnerColor}>
                <Spinner type="dots" />
              </Text>
              <Text color={spinnerColor}>
                {statusLabels[status] || status}
              </Text>
            </Box>
          ) : (
            <Text color={statusColors[status] || 'white'}>
              {statusLabels[status] || status}
            </Text>
          )}
          {activeRequirement != null && (
            <Text dimColor>#{String(activeRequirement)}</Text>
          )}
          {model && (
            <Text color="cyan">[{model}]</Text>
          )}
        </Box>
      </Box>
    </Box>
  )
}
