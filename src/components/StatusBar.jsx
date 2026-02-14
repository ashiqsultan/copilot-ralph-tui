import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import Spinner from 'ink-spinner'
import chalk from 'chalk'
import { useAppStore } from '../appState.js'

export default function StatusBar({ activeRequirement, model, projectPath }) {
  const status = useAppStore((s) => s.status)
  const [spinnerColor, setSpinnerColor] = useState('yellow')
  const colors = ['yellow', 'cyan', 'magenta', 'green', 'blue', 'red']
  
  const shortcutColors = {
    new: '#2563eb',      // blue
    plan: '#16a34a',     // green
    run: '#ffdf20',      // orange
    edit: '#2563eb',     // blue
    delete: '#fb2c36',   // red
    model: '#06b6d4',    // cyan
    settings: '#d1d5db', // silver
    abort: '#fb2c36',    // red
    quit: '#fb2c36'      // red
  }
  
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
          <Text>{chalk.hex(shortcutColors.new)('[N]ew')}</Text>
          <Text>{chalk.hex(shortcutColors.plan)('[P]lan')}</Text>
          <Text>{chalk.hex(shortcutColors.run)('[R]un all')}</Text>
          <Text>{chalk.hex(shortcutColors.run)('[I]run one')}</Text>
          <Text>{chalk.hex(shortcutColors.edit)('[E]dit')}</Text>
          <Text>{chalk.hex(shortcutColors.delete)('[D]elete')}</Text>
          <Text>{chalk.hex(shortcutColors.model)('[M]odel')}</Text>
          <Text>{chalk.hex(shortcutColors.settings)('[S]ettings')}</Text>
          <Text>{chalk.hex(shortcutColors.abort)('[X]abort')}</Text>
          <Text>{chalk.hex(shortcutColors.quit)('[Q]uit')}</Text>
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
