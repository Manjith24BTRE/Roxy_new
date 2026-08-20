# VEYTRIX — Architecture Overview

## Principles
- Clean Architecture
- Feature-Based Modular Architecture
- SOLID Principles
- Strict TypeScript boundaries
- Dependency separation (UI ↔ services ↔ domain ↔ infrastructure)
- Long-term scalability & maintainability

## High-Level Layers

### Frontend (React + TS + Vite)
- `app/`         — application composition root
- `routes/`      — routing declarations only
- `pages/`       — top-level route pages
- `layouts/`     — page shells
- `features/`    — isolated feature modules (landing, editor, templates, ...)
- `components/`  — shared/common presentational components
- `hooks/`       — cross-cutting reusable hooks
- `contexts/`    — cross-cutting React contexts
- `providers/`   — provider composition
- `services/`    — API/gateway clients (placeholders only)
- `store/`       — global state slices (placeholders only)
- `types/`, `interfaces/` — shared contracts
- `constants/`, `config/`, `theme/`, `styles/`, `icons/`, `assets/`, `lib/`, `utils/`

### Backend (Node + TS)
- `api/controllers` — HTTP orchestration
- `api/routes`      — route wiring
- `services`        — application/business services
- `repositories`    — persistence abstractions
- `models`          — domain entities
- `schemas`         — validation schemas
- `dto`             — data transfer objects
- `interfaces`      — contracts
- `middleware`      — request middleware
- `database`, `config`, `events`, `workers`, `queue`, `storage`, `logger`, `utils`, `types`, `constants`

## Reserved Modules
- **AI Command Engine** — Reserved for future implementation. Not built in this scaffold.
