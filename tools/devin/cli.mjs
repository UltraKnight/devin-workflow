#!/usr/bin/env node

import dotenv from 'dotenv';
import os from 'node:os';
import path from 'node:path';

dotenv.config({
  path: path.join(os.homedir(), '.config', 'devin-workflow', '.env'),
});

import readline from 'node:readline/promises';
import process from 'node:process';

import {
  loadTemplate,
  extractPlaceholders,
  fillTemplate,
  loadAgentInstructions,
} from './template.mjs';

import { detectRepository, getGitRoot } from './git.mjs';

import { loadProjectConfig, resolveConfig } from './config.mjs';

import { createSession } from './devin-api.mjs';
import { runDevinLocal } from './devin-cli.mjs';
import { HISTORY_PATH, readHistory, saveHistoryEntry } from './history.mjs';

const args = process.argv.slice(2);
const command = args.find((arg) => !arg.startsWith('--'));
const flags = parseFlags(args);

if (command === 'history') {
  try {
    await printHistory();
  } catch (error) {
    console.error(`\n✗ ${error.message}`);
    process.exitCode = 1;
  }

  process.exit();
}

const templateName = command;

if (!templateName) {
  printUsage();
  process.exit(1);
}

const supportedTemplates = ['feature', 'bugfix', 'refactor'];

if (!supportedTemplates.includes(templateName)) {
  console.error(`Unknown template: ${templateName}`);

  console.error(`Available templates: ${supportedTemplates.join(', ')}`);

  process.exit(1);
}

const gitRoot = await getGitRoot();

if (!gitRoot) {
  console.error('This command must be run inside a Git repository.');

  process.exit(1);
}

const projectConfig = await loadProjectConfig(gitRoot);

const config = resolveConfig(projectConfig);

const repository = await resolveRepository(config, flags);

const playbookId = flags.playbook ?? config.playbookId;

const template = await loadTemplate(templateName);
const agentInstructions = await loadAgentInstructions();

const placeholders = extractPlaceholders(template);

const labels = {
  OBJECTIVE: 'Objective',
  REQUIREMENTS: 'Requirements',
  CONTEXT: 'Context',

  PROBLEM: 'Problem',
  EXPECTED_BEHAVIOR: 'Expected behavior',
  CURRENT_BEHAVIOR: 'Current behavior',

  CONSTRAINTS: 'Constraints',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

try {
  console.log('');
  console.log(`Devin Workflow — ${templateName}`);
  console.log('');

  console.log(`Repository: ${repository ?? 'not detected'}`);

  if (flags.local) {
    console.log(`Working directory: ${gitRoot}`);
  }

  if (playbookId && !flags.local) {
    console.log(`Playbook: ${playbookId}`);
  }

  console.log('');

  const values = {};

  for (const key of placeholders) {
    const label = labels[key] ?? key;

    values[key] = await askMultiline(rl, label);
  }

  const prompt = [fillTemplate(template, values), agentInstructions].join(
    '\n\n',
  );

  const title =
    flags.title ?? values.OBJECTIVE ?? values.PROBLEM ?? `${templateName} task`;

  console.log('');
  console.log('────────────────────────────────────');
  console.log('Generated prompt:');
  console.log('────────────────────────────────────');
  console.log(prompt);
  console.log('────────────────────────────────────');

  if (flags['dry-run']) {
    console.log('');
    console.log('Dry run enabled. No session was created.');
    process.exit(0);
  }

  const action = flags.local
    ? 'Run Devin locally? [Y/n] '
    : 'Create Devin session? [Y/n] ';
  const confirmation = await rl.question(`\n${action}`);

  if (confirmation.trim() && confirmation.trim().toLowerCase() !== 'y') {
    console.log('Operation cancelled.');
    process.exit(0);
  }

  rl.close();

  if (flags.local) {
    console.log('\nStarting Devin CLI in the local repository...');

    try {
      await runDevinLocal({
        prompt,
        cwd: gitRoot,
      });

      await saveHistorySafely({
        mode: 'devin-local',
        template: templateName,
        title,
        repository,
        workingDirectory: gitRoot,
        status: 'completed',
      });

      console.log(`\nLocal Devin workflow recorded in ${HISTORY_PATH}`);
    } catch (error) {
      await saveHistorySafely({
        mode: 'devin-local',
        template: templateName,
        title,
        repository,
        workingDirectory: gitRoot,
        status: 'failed',
      });

      throw error;
    }
  } else {
    console.log('\nCreating Devin session...');

    const session = await createSession({
      prompt,
      title,
      repo: repository,
      playbookId,
    });

    const sessionId = session.session_id ?? session.id ?? 'unknown';

    await saveHistorySafely({
      mode: 'devin',
      template: templateName,
      title,
      repository,
      organizationId: process.env.DEVIN_ORG_ID,
      sessionId,
      url: session.url ?? null,
      status: 'created',
    });

    console.log('');
    console.log('✓ Session created');
    console.log(`Organization ID: ${process.env.DEVIN_ORG_ID}`);
    console.log(`Session ID: ${sessionId}`);

    if (session.url) {
      console.log(`URL: ${session.url}`);
    }

    console.log(`Local history: ${HISTORY_PATH}`);
  }

  console.log('');
} catch (error) {
  console.error('');
  console.error(`✗ ${error.message}`);

  process.exitCode = 1;
} finally {
  rl.close();
}

function parseFlags(args) {
  const result = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (!arg.startsWith('--')) {
      continue;
    }

    const withoutPrefix = arg.slice(2);

    if (withoutPrefix === 'dry-run') {
      result['dry-run'] = true;
      continue;
    }

    const equalIndex = withoutPrefix.indexOf('=');

    if (equalIndex !== -1) {
      const key = withoutPrefix.slice(0, equalIndex);

      const value = withoutPrefix.slice(equalIndex + 1);

      result[key] = value;
      continue;
    }

    const next = args[i + 1];

    if (next && !next.startsWith('--')) {
      result[withoutPrefix] = next;
      i++;
    } else {
      result[withoutPrefix] = true;
    }
  }

  return result;
}

async function resolveRepository(config, flags) {
  if (flags.repo) {
    return flags.repo;
  }

  if (config.repository && config.repository !== 'auto') {
    return config.repository;
  }

  if (process.env.DEVIN_REPO) {
    return process.env.DEVIN_REPO;
  }

  return await detectRepository();
}

async function askMultiline(rl, label) {
  console.log(`\n${label}`);

  console.log('(Enter your text. An empty line finishes the input.)');

  const lines = [];

  while (true) {
    const line = await rl.question('> ');

    if (!line.trim()) {
      break;
    }

    lines.push(line);
  }

  return lines.join('\n');
}

async function saveHistorySafely(entry) {
  try {
    await saveHistoryEntry(entry);
  } catch (error) {
    console.error(`Could not save local history: ${error.message}`);
  }
}

async function printHistory() {
  const entries = await readHistory();

  console.log('\nDevin Workflow History');

  if (entries.length === 0) {
    console.log(`No workflow runs recorded in ${HISTORY_PATH}`);
    return;
  }

  for (const entry of entries.reverse()) {
    console.log(`\n${entry.createdAt} [${entry.mode}] ${entry.title}`);
    console.log(`Status: ${entry.status}`);

    if (entry.repository) {
      console.log(`Repository: ${entry.repository}`);
    }

    if (entry.workingDirectory) {
      console.log(`Working directory: ${entry.workingDirectory}`);
    }

    if (entry.organizationId) {
      console.log(`Organization ID: ${entry.organizationId}`);
    }

    if (entry.sessionId) {
      console.log(`Session ID: ${entry.sessionId}`);
    }

    if (entry.url) {
      console.log(`URL: ${entry.url}`);
    }
  }

  console.log(`\nHistory file: ${HISTORY_PATH}`);
}

function printUsage() {
  console.log(`
Devin Workflow

Usage:

  devin-workflow feature
  devin-workflow bugfix
  devin-workflow refactor
  devin-workflow history

Options:

  --dry-run
      Generate the prompt without creating a session.

  --repo owner/repository
      Explicitly define the repository.

  --playbook PLAYBOOK_ID
      Define the Devin Playbook.

  --title "Title"
      Define the Devin session title.

  --local
      Run Devin CLI in the current repository instead of creating a cloud session.

Examples:

  devin-workflow feature

  devin-workflow bugfix --dry-run

  devin-workflow feature --local

  devin-workflow feature \\
    --repo acme/my-project \\
    --playbook pb_xxxxx
`);
}
