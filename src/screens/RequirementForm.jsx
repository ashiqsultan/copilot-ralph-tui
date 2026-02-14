import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'

const FIELDS = ['title', 'description', 'save', 'cancel']

export default function RequirementForm({ initial, onSubmit, onCancel }) {
  const isEdit = !!initial
  const [activeField, setActiveField] = useState('title')
  const [title, setTitle] = useState(initial?.title || '')
  const [description, setDescription] = useState(initial?.description || '')

  useInput((input, key) => {
    if (key.tab) {
      const idx = FIELDS.indexOf(activeField)
      const next = key.shift
        ? FIELDS[(idx - 1 + FIELDS.length) % FIELDS.length]
        : FIELDS[(idx + 1) % FIELDS.length]
      setActiveField(next)
      return
    }

    if (activeField === 'save') {
      if (key.return && title.trim()) {
        onSubmit({ title: title.trim(), description: description.trim() })
      }
      return
    }

    if (activeField === 'cancel') {
      if (key.return) {
        onCancel()
      }
      return
    }

    if (key.escape) {
      onCancel()
      return
    }

    const isTitle = activeField === 'title'
    const value = isTitle ? title : description
    const setter = isTitle ? setTitle : setDescription

    if (key.backspace || key.delete) {
      setter(value.slice(0, -1))
      return
    }

    if (key.return) {
      if (!isTitle) {
        setDescription(prev => prev + '\n')
      }
      return
    }

    if (input && !key.ctrl && !key.meta) {
      setter(prev => prev + input)
    }
  })

  const descriptionLines = description ? description.split('\n') : ['']

  return (
    <Box flexDirection="column" padding={1} borderStyle="round" borderColor="cyan">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          {isEdit ? '✏ Edit Requirement' : '➕ Add Requirement'}
        </Text>
      </Box>

      {/* Title */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color={activeField === 'title' ? 'cyan' : undefined}>
          Title:
        </Text>
        <Box>
          <Text color={activeField === 'title' ? 'green' : 'gray'}>
            {activeField === 'title' ? '❯ ' : '  '}
          </Text>
          <Text>{title}</Text>
          {activeField === 'title' && <Text color="green">█</Text>}
        </Box>
      </Box>

      {/* Description (multi-line) */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color={activeField === 'description' ? 'cyan' : undefined}>
          Description:
        </Text>
        <Box flexDirection="column">
          {descriptionLines.map((line, i) => (
            <Box key={i}>
              <Text color={activeField === 'description' ? 'green' : 'gray'}>
                {i === 0 ? (activeField === 'description' ? '❯ ' : '  ') : '  '}
              </Text>
              <Text>{line}</Text>
              {activeField === 'description' && i === descriptionLines.length - 1 && (
                <Text color="green">█</Text>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Actions */}
      <Box marginTop={1} gap={2}>
        <Text 
          bold={activeField === 'save'} 
          color={activeField === 'save' ? 'green' : 'gray'}
          inverse={activeField === 'save'}
        >
          {activeField === 'save' ? '❯ ' : '  '}Save
        </Text>
        <Text 
          bold={activeField === 'cancel'} 
          color={activeField === 'cancel' ? 'red' : 'gray'}
          inverse={activeField === 'cancel'}
        >
          {activeField === 'cancel' ? '❯ ' : '  '}Cancel
        </Text>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>(Tab) to switch • (Enter) to select • (Enter) in description adds new line </Text>
      </Box>
    </Box>
  )
}
