# Veytrix Control Centre

The Veytrix Control Centre is a dedicated, frontend-only application for managing Veytrix operations.

## Folder Structure

```
veytrix/command centre/
├── src/
│   ├── components/       # Reusable UI components
│   ├── layouts/          # Page layouts (Sidebar, Header, Main)
│   ├── navigation/       # Route definitions
│   ├── pages/            # Main Control Centre pages
│   ├── services/         # Mock services for data fetching
│   ├── types/            # TypeScript interfaces and types
│   ├── utils/            # Helper functions
│   ├── mock/             # Hardcoded JSON/JS mock data
│   ├── styles/           # Global CSS and theme tokens
│   └── assets/           # Images, icons, logos
├── developer/            # Developer Control Centre module
└── public/               # Public static assets
```

## Running Locally

To run the Control Centre:

```bash
cd "veytrix/command centre"
npm install
npm run dev
```

## Authentication Notice (IMPORTANT)

> **WARNING**: This is a frontend-only prototype. The current authentication is simulated using hardcoded credentials. 
> 
> **THESE ARE NOT SECURE PRODUCTION CREDENTIALS.**
> 
> Before production deployment, the mock `src/services/controlCentreAuth.ts` must be replaced with genuine server-side authentication (e.g., Supabase Auth).

### Demo Credentials

- **Email**: `official@mavrostech.in`
- **Password**: `veytrix@control.7090`

## Mock Data Architecture

Currently, all entities (users, jobs, logs, etc.) use mock data stored in `src/mock/`. The `src/services/` folder contains interfaces that simulate API responses using this mock data. 

To integrate with a real backend in the future:
1. Update the functions inside `src/services/` to perform real network requests (e.g., `fetch` or `axios`).
2. Remove or ignore the `src/mock/` data.
3. The UI components will seamlessly continue working as long as the service response matches the expected TypeScript `types`.
