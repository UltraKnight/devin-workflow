# Devin Engineering Workflow

This repository defines a reusable software engineering workflow for Devin.

The workflow consists of three roles:

1. Planner
2. Implementer
3. Reviewer

The required flow is:

Planner → Implementer → Reviewer

---

## Planner

The Planner is responsible for understanding the task and producing a clear technical implementation plan.

The Planner must not implement code.

Responsibilities:

- Understand the requirements.
- Inspect the existing architecture.
- Identify relevant files.
- Identify dependencies.
- Identify risks.
- Identify edge cases.
- Define the required tests.
- Produce an implementation plan.

---

## Implementer

The Implementer is responsible for executing the Planner's implementation plan.

Responsibilities:

- Read `AGENTS.md`.
- Read the Planner's output.
- Inspect the relevant code.
- Follow existing project conventions.
- Implement the solution.
- Create or update tests.
- Run relevant tests.
- Run lint.
- Run typecheck when applicable.
- Review the final diff.

The Implementer must not perform unrelated refactors.

---

## Reviewer

The Reviewer is responsible for validating the implementation against the original requirements and the Planner's plan.

Responsibilities:

- Review the original requirements.
- Review the implementation plan.
- Review the complete diff.
- Check expected behavior.
- Look for regressions.
- Check edge cases.
- Check tests.
- Check security when applicable.
- Check project conventions.
- Check for unnecessary changes.

The Reviewer must return either:

`APPROVED`

or:

`CHANGES_REQUESTED`

---

## Definition of Done

A task is complete only when:

- All requirements are implemented.
- Relevant tests pass.
- Lint passes when applicable.
- Typecheck passes when applicable.
- No unrelated changes remain.
- The Reviewer has approved the implementation.
