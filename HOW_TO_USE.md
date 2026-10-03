# Devin Workflow — How to Use

Reusable Planner → Implementer → Reviewer workflow for Devin.

This repository provides a global CLI that can be used from any Git repository without copying the workflow files into every project.

---

## 1. Architecture

The recommended directory structure is:

```text
~/dev/
├── devin-workflow/
├── project-a/
├── project-b/
└── project-c/
```

`devin-workflow` is the central workflow repository.

The other repositories do not need to contain the workflow implementation.

From any Git repository, the CLI can be executed globally:

```bash
devin-workflow feature
devin-workflow bugfix
devin-workflow refactor
```

The CLI detects the current Git repository automatically.

---

# 2. Requirements

The project requires Node.js 20 or newer and Git. Choose the credentials for the execution mode:

- Remote Devin sessions require an API key and organization ID.
- Local execution with `--local` requires Devin CLI.

Check Node.js:

```bash
node --version
```

Check Git:

```bash
git --version
```

---

# 3. Project Structure

The central repository should look like this:

```text
devin-workflow/
├── agents/
│   ├── planner.md
│   ├── implementer.md
│   └── reviewer.md
│
├── templates/
│   ├── feature.md
│   ├── bugfix.md
│   └── refactor.md
│
├── tools/
│   └── devin/
│       ├── cli.mjs
│       ├── config.mjs
│       ├── devin-cli.mjs
│       ├── devin-api.mjs
│       ├── git.mjs
│       ├── history.mjs
│       └── template.mjs
│
├── .env
├── .env.example
├── .gitignore
├── AGENTS.md
├── HOW_TO_USE.md
├── README.md
└── package.json
```

---

# 4. Install the Project

Clone the repository:

```bash
cd ~/dev
git clone <REPOSITORY_URL> devin-workflow
```

Enter the project:

```bash
cd ~/dev/devin-workflow
```

Install dependencies:

```bash
npm install
```

---

# 5. Configure Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

The file should contain:

```env
DEVIN_API_KEY=cog_xxxxxxxxxxxxxxxxx
DEVIN_ORG_ID=org-xxxxxxxxxxxxxxxxx

# Optional
DEVIN_PLAYBOOK_ID=

# Optional
# If empty, the CLI detects the repository
# from the current Git remote.
DEVIN_REPO=
```

Never commit `.env`.

The `.gitignore` should contain:

```gitignore
.env
node_modules/
.DS_Store
```

---

# 6. Validate the CLI Before Using It

Always validate the JavaScript syntax first:

```bash
node --check tools/devin/cli.mjs
```

You can also validate the supporting files:

```bash
node --check tools/devin/git.mjs
node --check tools/devin/config.mjs
node --check tools/devin/template.mjs
node --check tools/devin/devin-api.mjs
```

---

# 7. Make the CLI Globally Available

From the central repository:

```bash
npm install
npm link
```

Check that the command is available:

```bash
which devin-workflow
```

Then:

```bash
devin-workflow
```

The command should display the CLI usage information.

---

# 8. Run the CLI From a Project

Go to any Git repository:

```bash
cd ~/dev/project-a
```

Make sure it has an origin remote:

```bash
git remote -v
```

Example:

```text
origin  git@github.com:acme/project-a.git (fetch)
origin  git@github.com:acme/project-a.git (push)
```

Then run:

```bash
devin-workflow feature
```

The CLI should detect:

```text
acme/project-a
```

automatically.

---

# 9. Feature Workflow

Run:

```bash
devin-workflow feature
```

The CLI asks for:

```text
Objective
Requirements
Context
```

Example:

```text
Objective
> Add user profile editing

Requirements
> Users can edit their name and avatar
> Validate the form
> Add tests

Context
> The profile page already exists.
> The API endpoint is already available.
```

Finish each field by entering an empty line.

The CLI generates a prompt containing the complete workflow:

```text
Planner
→ Implementer
→ Reviewer
```

The workflow requires:

1. Planner analyzes the task.
2. Planner produces an implementation plan.
3. Implementer reads the plan.
4. Implementer changes the code.
5. Implementer runs tests and validation.
6. Reviewer reviews the implementation.
7. Reviewer returns either:

```text
APPROVED
```

or:

```text
CHANGES_REQUESTED
```

---

# 10. Bugfix Workflow

Run:

```bash
devin-workflow bugfix
```

The CLI asks for:

```text
Problem
Expected behavior
Current behavior
Context
```

Example:

```text
Problem
> Users are logged out after refreshing the dashboard.

Expected behavior
> Users should remain authenticated after a page refresh.

Current behavior
> The authentication state disappears after reload.

Context
> Authentication uses the existing session endpoint.
```

The workflow should require the Planner to investigate the likely root cause and define a regression test.

The Implementer should fix the root cause and add or update the regression test.

The Reviewer should verify that:

- the root cause was addressed;
- the regression test exists;
- the fix does not introduce unrelated changes;
- existing behavior remains intact.

---

# 11. Refactor Workflow

Run:

```bash
devin-workflow refactor
```

The CLI asks for:

```text
Objective
Constraints
Context
```

Example:

```text
Objective
> Extract the authentication logic into a dedicated service.

Constraints
> Do not change public behavior.
> Do not change the API contract.

Context
> Authentication logic is currently duplicated across three modules.
```

The workflow should preserve behavior and focus only on the requested refactoring.

---

# 12. Dry Run

Before creating a Devin session, use:

```bash
devin-workflow feature --dry-run
```

This is the safest way to test the workflow.

The CLI should:

1. detect the repository;
2. ask for the inputs;
3. render the final prompt;
4. print the prompt;
5. NOT create a Devin session.

Expected behavior:

```text
Devin Workflow — feature

Repository: acme/project-a

Objective
> ...

Requirements
> ...

Context
> ...

────────────────────────────────────
Generated prompt:
────────────────────────────────────

...

────────────────────────────────────

Dry run enabled. No session was created.
```

---

# 13. Explicit Repository

The repository can be specified manually:

```bash
devin-workflow feature --repo acme/project-a
```

This overrides automatic repository detection.

This is useful when:

- testing from outside the target repository;
- the Git remote cannot be detected;
- the repository is hosted somewhere that the current detection logic does not support.

---

# 14. Session Title

Specify a custom Devin session title:

```bash
devin-workflow feature \
  --title "Add profile editing"
```

The title should be sent to the Devin API as the session title.

If no title is provided, the CLI should derive one from:

1. `OBJECTIVE`;
2. `PROBLEM`;
3. the template name.

---

# 15. Playbooks

A Devin Playbook can be specified:

```bash
devin-workflow feature \
  --playbook pb_xxxxx
```

Or configured globally through:

```env
DEVIN_PLAYBOOK_ID=pb_xxxxx
```

A project-specific configuration can also define the Playbook.

---

# 16. Project-Specific Configuration

A project can contain:

```text
project-a/
└── .devin/
    └── config.json
```

Example:

```json
{
  "repository": "acme/project-a",
  "defaultBranch": "main",
  "playbookId": "pb_xxxxx"
}
```

The CLI should load this configuration automatically when executed inside the project.

---

# 17. Configuration Precedence

For repository selection, the intended precedence is:

```text
--repo
↓
.dev​​in/config.json
↓
DEVIN_REPO
↓
Git origin
```

For Playbooks:

```text
--playbook
↓
.dev​​in/config.json
↓
DEVIN_PLAYBOOK_ID
↓
none
```

This makes it possible to define defaults while still allowing explicit overrides.

---

# 18. Git Repository Detection

The CLI uses:

```bash
git remote get-url origin
```

Example:

```text
git@github.com:acme/project-a.git
```

The Git utility converts this into:

```text
acme/project-a
```

It should support at least:

```text
git@github.com:owner/repository.git
```

and:

```text
https://github.com/owner/repository.git
```

---

# 19. Important Async Rule

The Git repository detection function is asynchronous.

This means:

```js
detectRepository();
```

returns a Promise.

When calling it from another asynchronous function, use:

```js
await detectRepository();
```

Do not return the Promise where a string is expected.

Incorrect:

```js
return detectRepository();
```

Correct inside an async function:

```js
return await detectRepository();
```

Alternatively:

```js
const repository = await detectRepository();
return repository;
```

If this is not handled correctly, the CLI may print:

```text
Repository: [object Promise]
```

This is a strong indication that a Promise was returned instead of its resolved repository string.

---

# 20. Testing Repository Detection

From a Git repository:

```bash
git remote get-url origin
```

Then:

```bash
devin-workflow feature --dry-run
```

The output should contain something like:

```text
Repository: acme/project-a
```

It should NOT contain:

```text
Repository: [object Promise]
```

---

# 21. Testing the CLI Without Devin

Use:

```bash
devin-workflow feature --dry-run
```

This should not call the Devin API.

This is the recommended first test.

Only after the dry run works should you test:

```bash
devin-workflow feature
```

---

# 22. Testing the Devin API

After the dry run works:

```bash
devin-workflow feature
```

The CLI should ask:

```text
Create Devin session? [Y/n]
```

Enter:

```text
y
```

The CLI should then create the session and print:

```text
✓ Session created
Session ID: ...
URL: ...
```

If the API returns an error, the CLI should display the HTTP status and response body.

---

# 23. Development Workflow

When modifying the CLI:

```bash
cd ~/dev/devin-workflow
```

Run syntax checks:

```bash
node --check tools/devin/cli.mjs
node --check tools/devin/git.mjs
node --check tools/devin/config.mjs
node --check tools/devin/template.mjs
node --check tools/devin/devin-api.mjs
```

Then test:

```bash
devin-workflow feature --dry-run
```

---

# 24. Recommended Debugging Order

If something fails, do not immediately change multiple files.

Use this order:

### Step 1 — Syntax

```bash
node --check tools/devin/cli.mjs
```

### Step 2 — Git

```bash
git remote get-url origin
```

### Step 3 — CLI

```bash
devin-workflow feature --dry-run
```

### Step 4 — API

Only after the dry run works:

```bash
devin-workflow feature
```

### Step 5 — Devin session

Confirm that the returned session ID and URL are valid.

---

# 25. Current Workflow Model

The CLI includes the three role instruction files in one shared prompt. By default it sends that prompt to a Devin Cloud session; with `--local`, it starts Devin CLI in the current Git repository. It does not create separate sessions for Planner, Implementer, and Reviewer.

The conceptual workflow is:

```text
User
 │
 ▼
CLI
 │
 ├── Feature / Bugfix / Refactor
 │
 ├── Repository detection
 │
 ├── Template loading
 │
 ├── User input
 │
 └── Prompt rendering
 │
 ▼
Devin Cloud session or local Devin CLI
 │
 ├── Planner
 │
 ├── Implementer
 │
 └── Reviewer
 │
 ▼
APPROVED
or
CHANGES_REQUESTED
```

---

# 26. Future Architecture

A future version can orchestrate the roles as separate Devin sessions.

For example:

```text
CLI
 │
 ▼
Planner Session
 │
 ▼
Implementation Plan
 │
 ▼
Implementer Session
 │
 ▼
Code + Tests
 │
 ▼
Reviewer Session
 │
 ├── APPROVED
 │
 └── CHANGES_REQUESTED
        │
        ▼
   Implementer
        │
        ▼
     Reviewer
```

This would allow the CLI to implement an actual Planner → Implementer → Reviewer loop instead of only describing the roles in one prompt.

---

# 27. Centralized Workflow Advantage

Projects do not need to copy:

```text
agents/
templates/
tools/
```

into every repository.

Instead, all projects use the same central workflow:

```text
~/dev/devin-workflow/
```

Updating the workflow in one place makes the new behavior available to all projects using the global CLI.

---

# 28. Updating the Workflow

From the central repository:

```bash
cd ~/dev/devin-workflow
git pull
npm install
npm link
```

Because the global command points to the central package, projects using:

```bash
devin-workflow
```

will use the updated workflow.

---

# 29. Run Against Local Files

Install Devin CLI if needed:

```bash
curl -fsSL https://cli.devin.ai/install.sh | bash
```

From the target Git repository, run:

```bash
devin-workflow feature --local
devin-workflow bugfix --local
devin-workflow refactor --local
```

The CLI starts Devin in the repository's Git root and passes the selected task and all three agent instruction files. Devin's interactive permissions remain enabled. A dry run is available with `--dry-run --local` and does not launch Devin.

---

# 30. Workflow History

View remote Devin sessions and local workflow runs started by this CLI:

```bash
devin-workflow history
```

The metadata file is `~/.config/devin-workflow/history.jsonl`. It stores titles, mode, repository, status, and returned session identifiers, but not prompt contents. Devin CLI also maintains resumable local session history; use `devin list` to browse sessions for the current directory.

For Devin sessions, the CLI prints the organization ID alongside the session ID and URL. If a created session is missing from the web history, check that the Devin dashboard is showing that same organization and open the returned URL directly.

---

# 31. Troubleshooting

## `command not found: devin-workflow`

Run:

```bash
cd ~/dev/devin-workflow
npm install
npm link
```

Then:

```bash
which devin-workflow
```

---

## `Repository: [object Promise]`

The repository detection code is returning a Promise instead of the resolved repository.

Check that the call uses:

```js
await detectRepository();
```

inside an asynchronous function.

---

## `SyntaxError: Illegal return statement`

A `return` statement was placed at the top level of the ES module.

For top-level execution, use:

```js
process.exit(0);
```

instead of:

```js
return;
```

---

## `This command must be run inside a Git repository`

Check:

```bash
git rev-parse --show-toplevel
```

If it fails, run the CLI from inside a Git repository.

---

## Repository is not detected

Check:

```bash
git remote -v
```

Then:

```bash
git remote get-url origin
```

You can also explicitly specify:

```bash
devin-workflow feature --repo owner/repository
```

---

## Devin API authentication error

Check `.env`:

```env
DEVIN_API_KEY=cog_xxxxxxxxx
DEVIN_ORG_ID=org-xxxxxxxx
```

Then restart the command.

---

# 32. Recommended First Test

The safest complete test is:

```bash
cd ~/dev/devin-workflow

node --check tools/devin/cli.mjs

npm link

cd ~/dev/project-a

git remote get-url origin

devin-workflow feature --dry-run
```

Do not create a Devin session until the dry run produces the expected repository and prompt.

---

# 33. Success Criteria

The initial CLI is considered functional when all of these work:

```bash
node --check tools/devin/cli.mjs
```

```bash
devin-workflow feature --dry-run
```

```bash
devin-workflow bugfix --dry-run
```

```bash
devin-workflow refactor --dry-run
```

The CLI must:

- detect the current Git repository;
- never display `[object Promise]`;
- load the correct template;
- request the required inputs;
- render the placeholders;
- display the generated prompt;
- avoid calling Devin when `--dry-run` is used;
- create a Devin session when dry-run is disabled;
- display the session ID;
- display the session URL when returned by the API.
