import React from 'react'
import { Box, Text, useInput } from 'ink'

export default function RequirementList({
  requirements,
  selectedIndex,
  onSelect,
  focused
}) {
  useInput(
    (input, key) => {
      if (!focused) return
      if (key.upArrow && selectedIndex > 0) {
        onSelect(selectedIndex - 1)
      }
      if (key.downArrow && selectedIndex < requirements.length - 1) {
        onSelect(selectedIndex + 1)
      }
    },
    { isActive: focused }
  )

  if (requirements.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold>Requirements</Text>
        <Text dimColor>No requirements yet. Press [a] to add one.</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Requirements ({requirements.length})</Text>
      </Box>
      {requirements.map((req, index) => {
        const isSelected = index === selectedIndex
        const statusIcon = req.isDone ? '✓' : '○'
        const statusColor = req.isDone ? 'green' : 'yellow'

        return (
          <Box key={req.id}>
            <Text color={isSelected && focused ? 'cyan' : undefined}>
              {isSelected ? '▸ ' : '  '}
            </Text>
            <Text color={statusColor}>{statusIcon} </Text>
            <Text
              color={isSelected && focused ? 'cyan' : undefined}
              bold={isSelected && focused}
              strikethrough={req.isDone}
            >
              {req.id}. {req.title}
            </Text>
          </Box>
        )
      })}
      {requirements[selectedIndex] && (
        <Box flexDirection="column" marginTop={1} paddingX={2}>
          <Text dimColor>
            {requirements[selectedIndex].description || 'No description'}
          </Text>
          {requirements[selectedIndex].plan && (
            <Box marginTop={1} flexDirection="column">
              <Text color="blue" bold>Plan:</Text>
              <Text dimColor>{requirements[selectedIndex].plan}</Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
