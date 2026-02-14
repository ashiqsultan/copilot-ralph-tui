import React from "react";
import { Box, Text, useInput } from "ink";
import Spinner from "ink-spinner";
import { useAppStore } from "../appState.js";

// selectedIndex: 0 = Console, 1..N = requirements[index - 1]
export default function RequirementList({
  requirements,
  selectedIndex,
  onSelect,
  focused,
}) {
  const status = useAppStore((s) => s.status);
  const totalItems = requirements.length + 1; // +1 for Console
  const statusColors = {
    idle: "green",
    running: "yellow",
    planning: "blue",
    error: "red",
  };

  const statusLabels = {
    idle: "●",
    running: "",
    planning: "◉",
    error: "✗",
  };

  useInput(
    (input, key) => {
      if (!focused) return;
      if (key.upArrow && selectedIndex > 0) {
        onSelect(selectedIndex - 1);
      }
      if (key.downArrow && selectedIndex < totalItems - 1) {
        onSelect(selectedIndex + 1);
      }
    },
    { isActive: focused },
  );

  const isConsoleSelected = selectedIndex === 0;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Navigation</Text>
      </Box>

      {/* Fixed Console item */}
      <Box>
        <Text color={isConsoleSelected && focused ? "cyan" : undefined}>
          {isConsoleSelected ? "▸ " : "  "}
        </Text>
        <Text
          color={isConsoleSelected && focused ? "cyan" : undefined}
          bold={isConsoleSelected && focused}
        >
          Console
        </Text>
        <Box marginLeft={1}>
          {status === "running" ? (
            <Text color={statusColors.running}>
              <Spinner type="dots" />
            </Text>
          ) : (
            <Text color={statusColors[status] || "white"}>
              {statusLabels[status] || status}
            </Text>
          )}
        </Box>
      </Box>

      {/* Separator */}
      {requirements.length > 0 && (
        <Box marginTop={1} marginBottom={1}>
          <Text bold>Requirements ({requirements.length})</Text>
        </Box>
      )}

      {requirements.length === 0 && (
        <Box marginTop={1}>
          <Text dimColor>No requirements yet. Press [n] to add new task.</Text>
        </Box>
      )}

      {requirements.map((req, index) => {
        const listIndex = index + 1;
        const isSelected = listIndex === selectedIndex;
        const statusIcon = req.isDone ? "✓" : "○";
        const statusColor = req.isDone ? "green" : "yellow";

        return (
          <Box key={req.id}>
            <Text color={isSelected && focused ? "cyan" : undefined}>
              {isSelected ? "▸ " : "  "}
            </Text>
            <Text color={statusColor}>{statusIcon} </Text>
            <Text
              color={isSelected && focused ? "cyan" : undefined}
              bold={isSelected && focused}
              strikethrough={req.isDone}
            >
              {req.id}. {req.title}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
