import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { loadAgentInstructions } from './template.mjs';
import { readHistory, saveHistoryEntry } from './history.mjs';
import { runDevinLocal } from './devin-cli.mjs';

test('loads the three agent roles in workflow order', async () => {
  const instructions = await loadAgentInstructions();
  const planner = instructions.indexOf('# Planner');
  const implementer = instructions.indexOf('# Implementer');
  const reviewer = instructions.indexOf('# Reviewer');

  assert.ok(planner >= 0 && planner < implementer && implementer < reviewer);
  assert.match(instructions, /Execute the implementation plan/);
  assert.match(instructions, /CHANGES_REQUESTED/);
});

test('stores workflow metadata in a readable history file', async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'devin-workflow-test-'),
  );
  const historyPath = path.join(directory, 'history.jsonl');

  try {
    await saveHistoryEntry(
      {
        mode: 'devin',
        template: 'feature',
        title: 'History test',
        sessionId: 'session-test',
        status: 'created',
      },
      historyPath,
    );

    const entries = await readHistory(historyPath);

    assert.equal(entries.length, 1);
    assert.equal(entries[0].sessionId, 'session-test');
    assert.equal(entries[0].status, 'created');
    assert.ok(entries[0].createdAt);
    assert.equal('prompt' in entries[0], false);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('explains how to install Devin CLI when it is unavailable', async () => {
  await assert.rejects(
    runDevinLocal({
      prompt: 'task',
      cwd: process.cwd(),
      command: 'devin-workflow-local-test-missing',
    }),
    /Devin CLI was not found/,
  );
});
