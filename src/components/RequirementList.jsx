import React from 'react'
import { Box, Text, useInput } from 'ink'

// selectedIndex: 0 = Console, 1..N = requirements[index - 1]
export default function RequirementList({
  requirements,
  selectedIndex,
  onSelect,
  focused
}) {
  const totalItems = requirements.length + 1 // +1 for Console

  useInput(
    (input, key) => {
      if (!focused) return
      if (key.upArrow && selectedIndex > 0) {
        onSelect(selectedIndex - 1)
      }
      if (key.downArrow && selectedIndex < totalItems - 1) {
        onSelect(selectedIndex + 1)
      }
    },
    { isActive: focused }
  )

  const isConsoleSelected = selectedIndex === 0

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Navigation</Text>
      </Box>

      {/* Fixed Console item */}
      <Box>
        <Text color={isConsoleSelected && focused ? 'cyan' : undefined}>
          {isConsoleSelected ? '▸ ' : '  '}
        </Text>
        <Text color="magenta">▣ </Text>
        <Text
          color={isConsoleSelected && focused ? 'cyan' : undefined}
          bold={isConsoleSelected && focused}
        >
          Console
        </Text>
      </Box>

      {/* Separator */}
      {requirements.length > 0 && (
        <Box marginTop={1} marginBottom={1}>
          <Text bold>Requirements ({requirements.length})</Text>
        </Box>
      )}

      {requirements.length === 0 && (
        <Box marginTop={1}>
          <Text dimColor>No requirements yet. Press [a] to add one.</Text>
        </Box>
      )}

      {requirements.map((req, index) => {
        const listIndex = index + 1
        const isSelected = listIndex === selectedIndex
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
    </Box>
  )
}
