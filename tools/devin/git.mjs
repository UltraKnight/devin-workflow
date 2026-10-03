import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function git(...args) {
  const { stdout } = await execFileAsync(
    "git",
    args,
    {
      cwd: process.cwd(),
    },
  );

  return stdout.trim();
}

export async function getGitRoot() {
  try {
    return await git(
      "rev-parse",
      "--show-toplevel",
    );
  } catch {
    return null;
  }
}

export async function getGitRemote() {
  try {
    return await git(
      "remote",
      "get-url",
      "origin",
    );
  } catch {
    return null;
  }
}

export function remoteToRepository(remote) {
  if (!remote) {
    return null;
  }

  let value = remote.trim();

  value = value.replace(
    /^git@github\.com:/,
    "",
  );

  value = value.replace(
    /^https?:\/\/github\.com\//,
    "",
  );

  value = value.replace(/\.git$/, "");

  return value;
}

export async function detectRepository() {
  const remote = await getGitRemote();

  return remoteToRepository(remote);
}
