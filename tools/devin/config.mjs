import fs from "node:fs/promises";
import path from "node:path";

export async function loadProjectConfig(
  gitRoot,
) {
  if (!gitRoot) {
    return {};
  }

  const configPath = path.join(
    gitRoot,
    ".devin",
    "config.json",
  );

  try {
    const content =
      await fs.readFile(
        configPath,
        "utf8",
      );

    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }

    throw new Error(
      `Failed to read ${configPath}: ${error.message}`,
    );
  }
}

export function resolveConfig(
  projectConfig,
) {
  return {
    repository:
      projectConfig.repository ?? "auto",

    defaultBranch:
      projectConfig.defaultBranch ?? null,

    playbookId:
      projectConfig.playbookId ??
      process.env.DEVIN_PLAYBOOK_ID ??
      null,
  };
}
