import { spawn } from 'node:child_process';

export function runDevinLocal({ prompt, cwd, command = 'devin' }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, ['--', prompt], {
      cwd,
      stdio: 'inherit',
    });

    child.once('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(
          new Error(
            'Devin CLI was not found. Install it with `curl -fsSL https://cli.devin.ai/install.sh | bash`.',
          ),
        );
        return;
      }

      reject(error);
    });

    child.once('close', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          signal
            ? `Devin CLI was stopped by signal ${signal}.`
            : `Devin CLI exited with code ${code}.`,
        ),
      );
    });
  });
}
