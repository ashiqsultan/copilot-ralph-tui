import React from 'react'
import { Box, Text } from 'ink'

const MAX_LINES = 20

export default function ExecutionConsole({ lines, focused }) {
  const displayLines = lines.slice(-MAX_LINES)

  return (
    <Box flexDirection="column" minHeight={MAX_LINES + 2}>
      <Box marginBottom={1}>
        <Text bold>Console</Text>
        {focused && <Text color="cyan"> (focused)</Text>}
      </Box>
      {displayLines.length === 0 ? (
        <Text dimColor>No output yet. Press [r] to run or [p] to plan. Use Arrow keys to navigate requirements</Text>
        
      ) : (
        displayLines.map((line, i) => (
          <Text key={i} color={line.type === 'stderr' ? 'red' : line.type === 'system' ? 'green' : undefined} wrap="truncate">
            {line.text}
          </Text>
        ))
      )}
    </Box>
  )
}
