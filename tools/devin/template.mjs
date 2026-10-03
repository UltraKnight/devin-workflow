import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

export async function loadTemplate(templateName) {
  const templatePath = path.join(ROOT_DIR, 'templates', `${templateName}.md`);

  return fs.readFile(templatePath, 'utf8');
}

export async function loadAgentInstructions() {
  const roles = ['planner', 'implementer', 'reviewer'];
  const instructions = await Promise.all(
    roles.map((role) =>
      fs.readFile(path.join(ROOT_DIR, 'agents', `${role}.md`), 'utf8'),
    ),
  );

  return [
    '# Agent Instructions',
    'Follow these roles in order: Planner → Implementer → Reviewer.',
    ...instructions,
  ].join('\n\n');
}

export function extractPlaceholders(template) {
  return [...template.matchAll(/{{([A-Z0-9_]+)}}/g)]
    .map((match) => match[1])
    .filter((value, index, array) => array.indexOf(value) === index);
}

export function fillTemplate(template, values) {
  return template.replace(/{{([A-Z0-9_]+)}}/g, (_, key) => values[key] ?? '');
}
