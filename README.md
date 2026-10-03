# Devin Workflow

A reusable software engineering workflow for Devin.

The workflow provides three roles:

Planner → Implementer → Reviewer

The goal is to maintain one centralized workflow that can be reused across any Git repository without copying agents, templates, or tooling into every project.

---

## Architecture

The workflow is maintained in one central repository:

~/dev/devin-workflow

The CLI is installed globally.

You can then use it from any project:

~/dev/
├── devin-workflow/
├── project-a/
├── project-b/
└── project-c/

For example:

cd ~/dev/project-a

devin-workflow feature

The CLI automatically:

1. Detects the current Git repository.
2. Loads optional project configuration.
3. Selects the requested workflow template.
4. Collects the required inputs.
5. Generates a prompt containing the Planner, Implementer, and Reviewer instructions.
6. Creates a Devin Cloud/API session by default, or runs Devin CLI locally with `--local`.
7. Prints session details and records workflow metadata in local history.

---

# Requirements

- Node.js 20+
- Git
- Devin account, API key, and Organization ID for remote sessions
- Devin CLI for local execution with `--local`

---

# Installation

## 1. Clone the workflow repository

```bash
mkdir -p ~/dev

cd ~/dev

git clone <REPOSITORY_URL> devin-workflow
```

## 2. Install the CLI globally

From the workflow checkout, install the CLI globally:

```bash
cd ~/dev/devin-workflow
npm install -g .
```

This exposes the `devin-workflow` CLI for use from other Git repositories. Make sure npm's global bin directory is on your `PATH`. To locate the npm prefix, run:

```bash
npm config get prefix
```

The global bin directory is under that prefix (typically `<prefix>/bin`).

## Environment Configuration

The CLI reads its environment file from exactly `~/.config/devin-workflow/.env`. It does not load `.env` from the project root or `~/.config/.env`.

From the workflow repository, create the configuration directory and copy the example:

```bash
mkdir -p ~/.config/devin-workflow
cp .env.example ~/.config/devin-workflow/.env
```

Set `DEVIN_API_KEY` and `DEVIN_ORG_ID` in that file for remote Devin sessions. `DEVIN_PLAYBOOK_ID` is optional. The example sets `DEVIN_REPO=.`; clear that value (`DEVIN_REPO=`) if you want the CLI to detect the repository from the current Git remote. Any nonempty `DEVIN_REPO` value is used as a repository identifier, so `.` disables remote auto-detection.

Keep this configuration file and its credentials out of Git. Do not copy credentials into a project-root `.env` or commit them.

## Run Locally

Install Devin CLI if it is not already available:

```bash
curl -fsSL https://cli.devin.ai/install.sh | bash
```

From a Git repository, run:

```bash
devin-workflow feature --local
```

The workflow runs Devin CLI in the local repository, so Devin can work directly with the checkout. It asks for confirmation before starting and keeps Devin's normal interactive permission prompts enabled. The Planner, Implementer, and Reviewer instructions are included in both local and cloud prompts.

## Workflow History

List runs started through this CLI:

```bash
devin-workflow history
```

The CLI stores one metadata record per run in `~/.config/devin-workflow/history.jsonl`. Records include the workflow mode and template, title, repository, status, and creation time. Remote records also include the organization ID, Devin session ID, and URL; local records include the working directory. This is metadata only: it does not save the generated prompt or project state, and local records do not include a Devin session ID. `devin-workflow history` only lists those records; the wrapper has no resume or recovery feature.

To find a remote session, open its recorded URL or locate it by session ID in Devin, and check that Devin is showing the recorded organization ID. To browse local Devin CLI sessions for the current directory, use `devin list` as described in the companion usage guide; this is for browsing only and does not resume a workflow through this wrapper. To start work again from a target project, change to that project and run a workflow command such as `devin-workflow feature` (or `devin-workflow feature --local`). This starts a new workflow, not a continuation of the previous one.
