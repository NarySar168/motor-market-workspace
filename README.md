# motor-market-workspace

Cross-platform monorepo for the Motor Market application. Houses all shared frontend components, the Next.js web application, the React Native mobile application, and the high-performance Rust backend API.

## Architecture

```text
motor-market-workspace
├── turbo.json          # Monorepo build pipeline and task orchestration
├── apps/
│   ├── api/            # Rust Axum backend (Port 8080)
│   ├── web/            # Next.js web portal (Port 3000)
│   └── mobile/         # React Native / Expo iOS & Android app
└── packages/
    ├── ui/             # Shared React component library
    ├── eslint-config/  # Shared linting rules
    └── typescript-config/# Shared TS config

```

## Core Resources

| Resource | Type | Purpose |
| --- | --- | --- |
| **PostgreSQL** | Database | Primary relational data store (Local Docker container) |
| **Axum API** | Rust Server | High-performance API layer consumed by frontends |
| **Cloudinary** | Cloud Storage | Unsigned direct-to-cloud asset and image hosting |
| **Turborepo** | Build System | Orchestrates local dev servers and shared packages |

The API server connects to the database via `sqlx`, verifying SQL queries at compile time.

## REST API Routes

```http
GET  /api/hello       # Health check
GET  /api/users       # Fetches database directory
POST /api/users       # Creates new user (Requires: email, first_name, last_name)

GET  /api/listings    # Fetches live shopping feed (Includes seller emails & images)
GET  /api/listings/:id# Fetches a single vehicle's details and image gallery
POST /api/listings    # Posts vehicle (Requires: user_id, make, model, year, price)

```

## Product Architecture Strategy

Currently structured using a **Phase 1 / Phase 2** rollout approach:

**Phase 1: Exclusive Admin Portal**
The application acts as a private management tool. Internal admin users can add, edit, and manage vehicle listings via the web dashboard or mobile app. Images are uploaded directly to Cloudinary.

**Phase 2: Multi-Seller Marketplace**
The database is strictly relational (vehicles map to a `user_id` foreign key). This natively supports scaling into a consumer-facing app with buyer accounts, role-based access, and external seller onboarding without altering the core database schema.

## Database Schema (PostgreSQL)

The primary data structures mapping the marketplace:

* **`users`**: Tracks users and role-based accounts (`id`, `email`, `first_name`, `last_name`).
* **`listings`**: Stores inventory details (`id`, `user_id`, `make`, `model`, `year`, `price` in cents, `description`).
* **`listing_images`**: Relational gallery storing Cloudinary URLs (`id`, `listing_id`, `image_url`).

## 🚀 Getting Started (Local Development)

### Prerequisites

* Node.js & npm
* Rust & Cargo (`rustup`)
* Docker (for running the local PostgreSQL container)
* A Cloudinary account (for image upload credentials)

### Environment Variables

Create a `.env` file in the root of the `apps/api` directory:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/motor_market

```

Create a `.env.local` file in the root of the `apps/web` directory:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=motor_market_cars

```

### Running the App

Boot the entire workspace (Rust API, Next.js web app, and Expo mobile bundler) simultaneously:

```bash
npm install
npm run dev

```

Requires a local PostgreSQL database running. Database schema changes require running `cargo sqlx migrate run` inside the `apps/api` directory.

