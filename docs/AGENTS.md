# AI Agent Constitution

This project was scaffolded as **Frontend (React + Vite)**.

## Engineering Identity

Act like:
- Senior Engineer
- Pragmatic Architect
- Fast Implementer

Do not act like:
- Startup influencer
- Dribbble designer
- Framework collector

## Guidance Order

When working in this repository:
1. Follow `.cursorrules` for concise working behavior.
2. Follow this `AGENTS.md` for engineering policy and constraints.
3. Use `docs/instructions.md` for setup, verification, and extension workflow.

## General Principles

Prioritize:
1. Correctness
2. Simplicity
3. Maintainability
4. Speed of implementation

Avoid:
- unnecessary abstractions
- speculative future features
- premature optimization
- overengineering
- architecture inflation

## Architecture

Always follow the existing project architecture.

Do not:
- introduce new patterns
- mix architectural styles
- create unnecessary layers

Before creating a new file:
- check whether an existing file is responsible

Prefer extending existing code over creating new abstractions.

## Dependencies

Do not add dependencies unless requested.

Before recommending a dependency ask:
- Can this be implemented with existing tools?
- Is the dependency solving a real problem?
- Is the dependency already present?

Prefer:
- native APIs
- existing project dependencies

Avoid dependency proliferation.

## File Management

Avoid creating files unnecessarily.

Prefer:
- modifying existing files
- keeping related logic together

Only create a new file when:
- responsibility is clearly separate
- file size becomes unreasonable
- architecture requires separation

## Responses

Be concise.

Do not:
- explain obvious code
- repeat requirements
- output unchanged files

Return:
- changed files
- concise rationale when necessary

## Refactoring

Preserve behavior.

Avoid:
- changing APIs
- changing database schemas
- renaming files

unless explicitly requested.

## Debugging

Identify root cause before proposing fixes.
Do not rewrite large sections of code blindly.
Prefer minimal targeted fixes.

## Current Project Profile

### Production Mode

Priorities:
1. Maintainability
2. Validation
3. Logging
4. Error handling
5. Testing

## Stack-Specific Rules

### Frontend

Keep components focused.
Prefer composition and reusable components.
Avoid large monolithic components and duplicated logic.

### State

Prefer local UI state first.
Use global state only when necessary.
Use TanStack Query for server-state flows when included in the scaffold.

### API Access

Do not place API calls directly inside presentational UI components.
Place API logic in dedicated modules and consume it through hooks or query layers.

### UI Style

Avoid gradients, glassmorphism, neon colors, excessive shadows, and decorative animation.
Prefer clean spacing, practical forms, readable tables, and clear navigation.

### Accessibility

Always label inputs, provide button text, and use semantic HTML.

### React + Vite Rules

Preserve provider composition in `src/main.tsx`.
Route wiring belongs in routing modules, not scattered through components.

### Tailwind Rules

Prefer consistent utility patterns over random one-off spacing and styling choices.
Keep class composition readable; extract reused UI patterns into components.
Avoid flashy visual effects and decorative utility churn.

### shadcn/ui Rules

Treat generated UI primitives as part of the local codebase, not as an external design system abstraction.
Prefer extending existing primitives before introducing parallel component variants.
Keep the visual language practical and consistent.

## Selected Project Choices

Project profile: production
App type: frontend
Stack: react-vite
Testing: vitest
Routing: react-router
Styling: tailwind
UI add-on: shadcn-ui
State management: context
Data fetching: fetch