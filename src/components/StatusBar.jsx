import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import chalk from "chalk";
import { useAppStore } from "../appState.js";
import statusColors from "../helpers/statusColors.js";

export default function StatusBar({ activeRequirement, model, projectPath }) {
  const status = useAppStore((s) => s.status);

  const shortcutColors = {
    new: statusColors.idle, // blue
    plan: statusColors.planning, // green
    run: statusColors.running, // orange
    edit: statusColors.idle, // blue
    delete: "#ff6467", // red
    abort: "#ff6467", // red
    model: "#005f78", // cyan
    settings: "#005f78", // silver
  };

  const statusLabels = {
    idle: "● Idle",
    running: "Running",
    planning: "Planning",
    error: "✗ Error",
  };

  const getStatusColor = (status) => {
    if (status === "running") return shortcutColors.run;
    if (status === "planning") return shortcutColors.plan;
    if (status === "idle") return statusColors.idle;
    return undefined; // default color
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
    >
      <Box justifyContent="space-between">
        <Box gap={2}>
          <Text>{chalk.hex(shortcutColors.new)("[N]ew")}</Text>
          <Text>{chalk.hex(shortcutColors.plan)("[P]lan")}</Text>
          <Text>{chalk.hex(shortcutColors.run)("[R]un all")}</Text>
          <Text>{chalk.hex(shortcutColors.run)("[I]run one")}</Text>
          <Text>{chalk.hex(shortcutColors.edit)("[E]dit")}</Text>
          <Text>{chalk.hex(shortcutColors.delete)("[D]elete")}</Text>
          <Text>{chalk.hex(shortcutColors.abort)("[X]abort")}</Text>
          <Text>{chalk.hex(shortcutColors.model)("[M]odel")}</Text>
          <Text>{chalk.hex(shortcutColors.settings)("[S]ettings")}</Text>
        </Box>

        <Box gap={2}>
          {/* Status Indicator */}
          {status === "running" || status === "planning" ? (
            <Box gap={1}>
              <Text color={getStatusColor(status)}>
                <Spinner type="dots2" />
              </Text>
              {/* <Text>{chalk.hex(getStatusColor(status))(statusLabels[status] || status)}</Text> */}
              <Text>{status}</Text>
            </Box>
          ) : (
            <Text>
              {chalk.hex(getStatusColor(status))(
                statusLabels[status] || status,
              )}
            </Text>
          )}
          {activeRequirement != null && (
            <Text dimColor>#{String(activeRequirement)}</Text>
          )}
          {/* Model indicator */}
          {model && (
            <Text>{chalk.hex(shortcutColors.model)(`[${model}]`)}</Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}
