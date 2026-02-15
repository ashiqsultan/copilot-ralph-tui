import React from "react";
import { Box, Text } from "ink";

export default function RequirementDetail({ requirement }) {
  if (!requirement) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text dimColor>No requirement selected.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Requirement #{requirement.id}
        </Text>
        <Text> </Text>
        <Box marginLeft={1}>
          <Text dimColor>{"[e] to edit"}</Text>
        </Box>
      </Box>

      <Box>
        <Text color={requirement.isDone ? "green" : "yellow"}>
          Status: {requirement.isDone ? "✓ Done" : "○ Pending"}
        </Text>
      </Box>

      <Box flexDirection="row" marginBottom={1}>
        <Text dimColor bold>
          Title:
        </Text>
        <Text>{requirement.title}</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text dimColor bold>
          Description:
        </Text>
        <Text>{requirement.description || "No description"}</Text>
      </Box>

      {requirement.plan && (
        <Box flexDirection="column" marginBottom={1}>
          <Text bold color="blue">
            Plan:
          </Text>
          <Text dimColor>{requirement.plan}</Text>
        </Box>
      )}
    </Box>
  );
}
