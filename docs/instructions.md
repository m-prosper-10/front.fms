# Developer Setup & Playbook

Project: **fms_frontend**
Stack: **react-vite**
Profile: **production**

## Setup Commands

- npm install

## Development / Execution

- npm run dev

## Verification

- npm test

## Project Inventory

- `src/main.tsx` composes root providers.
- `src/routes.tsx` defines routing when routing is enabled.
- `src/lib/` holds query or state helpers.
- `src/components/` contains reusable UI primitives.

## Change Protocol

- Before adding a new file, confirm that an existing file is not already responsible.
- When behavior changes, update tests or sample verification in the same change.
- Do not introduce new dependencies without checking existing tools first.
- When adding data access, keep API code out of presentational components.
- When changing UI structure, preserve the existing provider and routing composition.

## Selected Scaffold Choices

- Project profile: production
- App type: frontend
- Stack: react-vite
- Testing: vitest
- Routing: react-router
- Styling: tailwind
- UI add-on: shadcn-ui
- State management: context
- Data fetching: fetch