import React from 'react'
import { Box, Text } from 'ink'

export default function StatusBar({ status, activeRequirement, model, projectPath }) {
  const statusColors = {
    idle: 'green',
    running: 'yellow',
    planning: 'blue',
    error: 'red'
  }

  const statusLabels = {
    idle: '● Idle',
    running: '◉ Running',
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
          <Text color={statusColors[status] || 'white'}>
            {statusLabels[status] || status}
          </Text>
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
