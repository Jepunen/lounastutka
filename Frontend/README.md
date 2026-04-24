# Frontend Documentation Landing Page

The frontend is a Vite + React + TanStack Router single-page app for browsing lunch places on a map and in a list view, with authentication and restaurant management flows layered on top.

## What This Frontend Does

- Shows lunch places on an interactive Leaflet map.
- Provides a searchable and filterable restaurant list sorted by distance.
- Uses user location to compute and display distance labels.
- Supports password and passkey based authentication flows.
- Lets authenticated users preview and submit restaurant data.
- Exposes a small component playground for shared UI pieces.

## Tech Stack

- React + TypeScript
- Vite
- TanStack Router with file-based routing
- Tailwind CSS
- Leaflet and React Leaflet
- Framer Motion
- WebAuthn support via @simplewebauthn/browser

## Core Areas

- Map home view: interactive map, visible restaurant sidebar, selection sheet, and location controls.
- List view: search, type filters, distance sorting, and expandable restaurant cards.
- Settings view: login, registration, and authenticated restaurant submission tools.
- Shared UI: map pins, restaurant cards, search bar, sidebar, bottom navigation, and modal/sheet components.
- Data and services: restaurant fetchers, auth token helpers, and API wrappers.

## Project Structure

```text
Frontend/
	app/
		components/        # Shared UI, map behavior, and restaurant UI
		data/              # Local demo and typed place data
		hooks/             # Shared hooks such as usePlaces
		routes/            # Route components for /, /list, /settings, /components
		services/          # API helpers for public and protected endpoints
		utils/             # Utility functions such as distance formatting
		app.css            # Global styles
		main.tsx           # App bootstrap and router provider
		routeTree.gen.ts   # Generated TanStack Router tree
	docker/nginx/        # Nginx config used by the production container
	public/              # Static assets
	Dockerfile           # Frontend production image
```

## Routes

- `/` - Map-first home view
- `/list` - Searchable and filterable restaurant list
- `/settings` - Authentication and restaurant submission view
- `/components` - Component playground and visual demo page

## Data Flow And API Notes

- Public restaurant data is fetched through frontend helpers that call backend routes under `/api`.
- Authenticated requests attach Authorization: Bearer token when a token exists in localStorage.
- The JWT token is stored under the key jwt, and a 401 response clears it automatically.
- Frontend development works best when the frontend and backend are run together or when `/api` is proxied to the backend.

## Local Development

From Frontend/:

```bash
npm install
npm run dev
```

Default dev URL:

- http://localhost:5173

Available scripts:

- `npm run dev` - Start the Vite dev server
- `npm run build` - Create the production build in build/client
- `npm run typecheck` - Run TypeScript checks

## Recommended Full-Stack Local Run

From the repository root:

```bash
docker compose -f compose.dev.yaml up
```

This is the easiest way to run the frontend, backend, and database together with the expected routing.

## Production Build Output

- Vite output directory: build/client
- Served by Nginx in containerized deployments

## Docker Image

Build from the repository root:

```bash
docker build -t lounastutka-frontend:latest ./Frontend
```

The production image:

- Builds static assets with Node
- Serves assets with Nginx
- Uses SPA fallback routing
- Proxies /api and /auth to the backend container
