import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'

export default function RequirementForm({ initial, onSubmit, onCancel }) {
  const isEdit = !!initial
  const [step, setStep] = useState('title')
  const [title, setTitle] = useState(initial?.title || '')
  const [description, setDescription] = useState(initial?.description || '')

  useInput((input, key) => {
    if (key.escape) {
      onCancel()
    }
  })

  const handleTitleSubmit = () => {
    if (!title.trim()) return
    setStep('description')
  }

  const handleDescriptionSubmit = () => {
    onSubmit({ title: title.trim(), description: description.trim() })
  }

  return (
    <Box flexDirection="column" padding={1} borderStyle="round" borderColor="cyan">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          {isEdit ? 'Edit Requirement' : 'Add Requirement'}
        </Text>
      </Box>

      {step === 'title' && (
        <Box flexDirection="column">
          <Text>Title:</Text>
          <Box>
            <Text color="green">❯ </Text>
            <TextInput value={title} onChange={setTitle} onSubmit={handleTitleSubmit} />
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Enter to continue • Esc to cancel</Text>
          </Box>
        </Box>
      )}

      {step === 'description' && (
        <Box flexDirection="column">
          <Text dimColor>Title: {title}</Text>
          <Box marginTop={1}>
            <Text>Description (press Enter to {isEdit ? 'save' : 'create'}):</Text>
          </Box>
          <Box>
            <Text color="green">❯ </Text>
            <TextInput
              value={description}
              onChange={setDescription}
              onSubmit={handleDescriptionSubmit}
            />
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Enter to {isEdit ? 'save' : 'create'} • Esc to cancel</Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}
