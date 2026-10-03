# Bugfix Task

Fix the following bug.

## Problem

{{PROBLEM}}

## Expected Behavior

{{EXPECTED_BEHAVIOR}}

## Current Behavior

{{CURRENT_BEHAVIOR}}

## Context

{{CONTEXT}}

---

# Workflow

Follow this workflow:

Planner → Implementer → Reviewer

## Planner

The Planner must:

- Understand the problem.
- Reproduce or investigate the issue when possible.
- Identify the likely root cause.
- Inspect the relevant implementation.
- Identify risks.
- Define a regression test.
- Produce an implementation plan.

Do not implement code during planning.

## Implementer

The Implementer must:

- Execute the implementation plan.
- Fix the root cause.
- Add or update a regression test.
- Run relevant tests.
- Run lint.
- Run typecheck when applicable.
- Review the final diff.

Do not simply mask the symptom.

## Reviewer

The Reviewer must verify:

- The root cause was correctly identified.
- The root cause was fixed.
- A regression test exists.
- No regressions were introduced.
- The original requirements are satisfied.

The task is complete only after the Reviewer approves it.
