---
tracker:
  kind: linear
  project_slug: "symphony-demo-865e11c5a117"
  active_states:
    - Todo
    - In Progress
    - Rework
  terminal_states:
    - Closed
    - Cancelled
    - Canceled
    - Duplicate
    - Done

polling:
  interval_ms: 3000

workspace:
  root: ~/Projects/symphony/workspaces

hooks:
  after_create: |
    git clone git@github.com:al-turner/todo-symphony-demo.git .
    npm install

agent:
  max_concurrent_agents: 1
  max_turns: 12

codex:
  command: codex --config shell_environment_policy.inherit=all --config 'model="gpt-5.4-mini"' --config model_reasoning_effort=medium app-server
  approval_policy: never
  thread_sandbox: workspace-write
  turn_sandbox_policy:
    type: workspaceWrite
---

You are working on Linear ticket `{{ issue.identifier }}`.

Issue context:

Identifier: {{ issue.identifier }}
Title: {{ issue.title }}
Current status: {{ issue.state }}
Labels: {{ issue.labels }}
URL: {{ issue.url }}

Description:

{% if issue.description %}
{{ issue.description }}
{% else %}
No description provided.
{% endif %}

## Goal

Implement the Linear ticket in this repository copy.

This is a small TODO app trial used to evaluate Symphony + Codex orchestration.

## Rules

- Work only inside the provided repository copy.
- Keep the diff small and focused.
- Do not add dependencies unless the ticket explicitly asks for one.
- Do not rewrite the whole app.
- Follow the existing project style.
- Prefer simple, readable implementation over clever abstractions.
- Do not touch files outside the workspace.
- Do not mark the Linear issue Done.
- Do not merge anything.

## Status handling

- If the issue is `Todo`, move it to `In Progress` before starting.
- If the issue is `In Progress`, continue working.
- If the issue is `Rework`, address the requested changes.
- If the issue is `Done`, `Closed`, `Cancelled`, `Canceled`, or `Duplicate`, do nothing.

## Work process

1. Inspect the repository.
2. Read the issue carefully.
3. Identify the smallest safe implementation.
4. Create a branch named `codex/{{ issue.identifier | downcase }}`.
5. Implement the change.
6. Run relevant checks:
   - `npm run build`
   - `npm run lint` if available
   - `npm test` if available
7. Commit the changes.
8. Push the branch if credentials are available.
9. Open a pull request if possible.
10. Move the Linear issue to `Human Review` only when:
    - the implementation is complete,
    - checks have passed or failures are clearly explained,
    - the branch/PR is available or the blocker is documented.

## Final response

Report only:

- summary of changes
- files changed
- checks run
- branch name
- PR URL, if created
- blockers, if any
