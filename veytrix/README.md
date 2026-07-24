# VEYTRIX Website — Enterprise Scaffold

Production-grade architectural scaffold for the VEYTRIX Website.

> ⚠️ **Scaffold only.** This folder contains architecture, documentation, and placeholder modules. It does **not** contain the live UI implementation.
>
> The live frontend is built in the root TanStack Start project under `/src/` (routes, components, styles, and the editor workspace). The `frontend/` and `backend/` folders here are preserved as the enterprise architecture reference.

## Layout

```
/
├── frontend/   React + TypeScript + Vite (enterprise modular scaffold)
├── backend/    Node + TypeScript (scalable service architecture scaffold)
└── docs/       Architecture, folder guide, contribution, standards
```

## Live Implementation
- Frontend UI: `src/` (TanStack Start, React 19, Tailwind CSS)
- Backend services: `src/routes/api/` and server functions under `src/lib/`

## Reserved
- **AI Command Engine** — Reserved for future implementation.
  See `frontend/src/reserved/ai-command-engine/README.md`
  and `backend/src/reserved/ai-command-engine/README.md`.

## Docs
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Folder Structure Guide](docs/FOLDER_STRUCTURE.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Contribution Guide](docs/CONTRIBUTING.md)
- [Coding Standards](docs/CODING_STANDARDS.md)
- [Module Responsibilities](docs/MODULES.md)
- [Future Implementation Notes](docs/FUTURE_IMPLEMENTATION.md)
