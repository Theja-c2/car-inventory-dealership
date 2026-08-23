# Dealership Lot — Car Dealership Inventory System

A full-stack car dealership inventory system built as a TDD kata: a
Node.js/TypeScript/Express/SQLite REST API with JWT auth, and a React +
TypeScript + Tailwind single-page app on top of it.

```
car-dealership/
├── backend/     Express + TypeScript API, SQLite, Jest/Supertest tests
├── frontend/    React + TypeScript + Tailwind v4 SPA (Vite)
└── README.md    You are here
```

## Live demo credentials (after seeding — see below)

| Role     | Email                     | Password        |
|----------|----------------------------|------------------|
| Admin    | admin@dealership.com       | AdminPass123     |
| Customer | customer@dealership.com    | CustomerPass123  |

## Design

Rather than a generic admin-panel look, the UI is grounded in the actual
subject — a car lot: charcoal/amber/racing-green palette, a condensed
display face (Oswald) that reads like dealership signage, and two signature
details lifted from a real car lot: each vehicle card carries a **window-
sticker price tag** and a **fuel-gauge-style stock indicator** instead of a
plain "Qty: N" label. Admin-only controls (Edit/Restock/Delete) are hidden
entirely for non-admin users, not just disabled.

---

## Setup & running locally

### Prerequisites
- Node.js **22.5+** (uses the built-in `node:sqlite` module — no native
  compiler/build toolchain required on any OS, unlike drivers such as
  `better-sqlite3` or `sqlite3` that need node-gyp)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed     # creates demo admin/customer + 8 sample vehicles
npm run dev       # starts the API on http://localhost:4000
```

Run the test suite:

```bash
npm test          # runs all 36 tests with coverage
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev        # starts the SPA on http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to `http://localhost:4000`
(see `frontend/vite.config.ts`), so no CORS configuration is needed locally.
Open **http://localhost:5173** and log in with one of the demo accounts
above (or register a new customer account).

### 3. Production build

clean `tsc` type-check and production build.

**To add screenshots:** run both dev servers as described above, open
`http://localhost:5173`, and save screenshots of the login page, the
vehicle dashboard (as both a customer and admin), the add/edit vehicle
modal, and the search/filter bar into an `screenshots/` folder, then
reference them here, e.g.:

```markdown
![Dashboard](screenshots/dashboard.png)
```

---

