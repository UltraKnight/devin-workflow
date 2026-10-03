import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export const HISTORY_PATH = path.join(
  os.homedir(),
  '.config',
  'devin-workflow',
  'history.jsonl',
);

export async function saveHistoryEntry(entry, historyPath = HISTORY_PATH) {
  await fs.mkdir(path.dirname(historyPath), {
    recursive: true,
    mode: 0o700,
  });
  await fs.appendFile(
    historyPath,
    `${JSON.stringify({
      ...entry,
      createdAt: new Date().toISOString(),
    })}\n`,
    { encoding: 'utf8', mode: 0o600 },
  );
}

export async function readHistory(historyPath = HISTORY_PATH) {
  let content;

  try {
    content = await fs.readFile(historyPath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }

  return content
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}
