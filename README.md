# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Operations Setup

Copy `.env.example` to `.env` and provide the Supabase URL and publishable key. Never place service-role keys in frontend variables or commit any `.env` file.

### Local Supabase and migrations

The repository includes the Supabase CLI configuration in `supabase/config.toml`. Install Docker Desktop, start its Linux engine, then run:

```sh
npx supabase start
npx supabase db reset
```

The reset applies the migrations in `supabase/migrations/` to a clean local database. No seed data is enabled.

### Frontend, backend, and Docker

```sh
npm run dev
cd veytrix/backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

With Docker Desktop running, the application containers can be built and started with:

```sh
docker compose build
docker compose up
```

### Validation

```sh
npm run lint
npx tsc --noEmit
npm run build
```

Backend tests require Python and can be run from `veytrix/backend` with `python -m pytest`.

### Remote migrations

Remote migration status must be checked before any deployment:

```sh
npx supabase login
npx supabase link --project-ref <verified-project-ref>
npx supabase migration list
npx supabase db push --dry-run
npx supabase db push
```

Do not run the remote commands until the project reference and access are verified. Never use `db reset` against a remote project.

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
