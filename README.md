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

Metadata is stored in `~/.config/devin-workflow/history.jsonl`; prompt contents are not stored. For remote sessions, the CLI prints the Devin organization ID, session ID, and URL. Check that the organization ID matches the organization selected in Devin when locating the session in its web history.
