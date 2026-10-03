# Refactor Task

Perform the following refactor.

## Objective

{{OBJECTIVE}}

## Constraints

{{CONSTRAINTS}}

## Context

{{CONTEXT}}

---

# Workflow

Follow this workflow:

Planner → Implementer → Reviewer

## Planner

Identify:

- Current architecture.
- Affected code.
- Dependencies.
- Risks.
- Existing behavior that must be preserved.
- Refactoring strategy.
- Required tests.

## Implementer

The Implementer must:

- Execute the implementation plan.
- Preserve existing behavior.
- Update tests when necessary.
- Run relevant tests.
- Run lint.
- Run typecheck when applicable.
- Review the final diff.

## Reviewer

The Reviewer must verify:

- Existing behavior is preserved.
- The refactoring objective was achieved.
- No unrelated functional changes were introduced.
- Tests pass.
- The resulting code follows project conventions.

The task is complete only after the Reviewer approves it.
