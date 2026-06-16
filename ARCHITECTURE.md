# Architecture

```text
motor-market-workspace
├── turbo.json          # Monorepo build pipeline and task orchestration
├── README.md           # Setup and local installation guide
├── ARCHITECTURE.md     # Domain logic, custom payment schemas, and i18n
├── apps/
│   ├── api/            # Rust Axum backend (Port 8080)
│   ├── web/            # Next.js web portal (Port 3000)
│   └── mobile/         # React Native / Expo iOS & Android app
└── packages/
    ├── ui/             # Shared React component library
    ├── eslint-config/  # Shared linting rules
    └── typescript-config/# Shared TS config

```

---

# System Architecture & Domain Logic

This document serves as the master blueprint for the Motor Market application. While the `README.md` covers local development setup and infrastructure, this file details the system topology, database schemas, and custom domain logic required for the Cambodian vehicle market.

## 1. System Overview & Strategy

Motor Market is a cross-platform monorepo leveraging a Rust backend for high performance and React/Next.js for the client interfaces.

### Core Resources

* **Database:** PostgreSQL (Primary relational data store).
* **Backend:** Rust Axum API (Connects to DB via `sqlx` for compile-time query verification).
* **Storage:** Cloudinary (Unsigned direct-to-cloud asset and image hosting).
* **Build System:** Turborepo (Orchestrates local dev servers and shared packages).

### Product Architecture Strategy

* **Phase 1: Exclusive Admin Portal:** The application acts as a private management tool. Internal admin users can add, edit, and manage vehicle listings via the web dashboard or mobile app.
* **Phase 2: Multi-Seller Marketplace:** The relational database supports scaling into a consumer-facing app with buyer accounts and external seller onboarding without altering the core schema.

---

## 2. Expanded Database Schema (PostgreSQL)

The database is strictly relational. To support custom payments, currency toggling, internationalization (i18n), and robust media management, the data is normalized across the following core tables.

### `users`

Tracks users, external buyers, and role-based accounts.

* `id` (UUID, PK)
* `email` (Varchar)
* `first_name` (Varchar)
* `last_name` (Varchar)

### `listings` & `listing_images`

Separates vehicle metadata from the dynamic media gallery.

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID (PK) | Unique listing identifier |
| `user_id` | UUID (FK) | References `users.id` |
| `price_amount` | Integer | Price in smallest unit (e.g., cents) |
| `currency` | Varchar | Base currency of the listing (e.g., `USD`) |
| `year` | Integer | Vehicle manufacturing year |

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID (PK) | Unique image identifier |
| `listing_id` | UUID (FK) | References `listings.id` (ON DELETE CASCADE) |
| `image_url` | Text | Secure Cloudinary URL |

### `listing_translations`

Separates universal vehicle facts from localized descriptions to support English, Khmer, and Chinese.

| Column | Type | Description |
| --- | --- | --- |
| `listing_id` | UUID (FK) | References `listings.id` |
| `language_code` | Varchar(5) | Locale code (e.g., `en`, `km`, `zh`) |
| `make` | Varchar | Translated make (e.g., Toyota) |
| `model` | Varchar | Translated model |
| `description` | Text | Translated vehicle description |
| *(Primary Key is a composite of `listing_id` + `language_code`)* |  |  |

### `orders`

Tracks the overarching purchase and selected currency.

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID (PK) | Unique order identifier |
| `buyer_id` | UUID (FK) | References `users.id` |
| `listing_id` | UUID (FK) | References `listings.id` |
| `total_amount` | Integer | Final price in smallest unit |
| `currency` | Varchar | The currency the buyer chose to pay in |
| `exchange_rate` | Numeric | The USD-to-KHR rate used at checkout |
| `status` | Varchar | Current state (e.g., `receipt_under_review`) |

### `payments`

Tracks the specific payment mechanism and the manual verification audit trail.

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID (PK) | Unique payment identifier |
| `order_id` | UUID (FK) | References `orders.id` |
| `method` | Varchar | `KHQR` or `CASH_ON_DELIVERY` |
| `receipt_url` | Varchar | Cloudinary URL of the uploaded screenshot |
| `verified_by` | UUID (FK) | References `users.id` (Admin who approved it) |
| `verified_at` | Timestamp | When the admin approved the payment |

---

## 3. Domain Logic: Custom Checkout & Payments

Motor Market bypasses traditional credit card gateways like Stripe to accommodate local purchasing habits. We support two primary methods:

1. **KHQR / Direct Bank Transfer:** Customers manually transfer funds via a banking app and upload a screenshot of the receipt.
2. **Cash on Delivery (COD):** Customers pay with physical cash upon receiving the vehicle.

### Order State Machine

Because payments are not automatically verified by an API gateway, orders move through a manual verification lifecycle:

* `draft`: The user is building their cart/checkout.
* `pending_payment`: Order placed, awaiting the user to upload a KHQR receipt (bypassed if COD).
* `receipt_under_review`: User uploaded a receipt screenshot to Cloudinary. An admin must verify the bank account.
* `payment_verified`: Admin confirmed the funds arrived.
* `processing_cod`: User selected COD; order approved for delivery without prior payment.
* `completed`: The transaction and handover are fully finished.

---

## 4. Domain Logic: Currency Handling

Vehicles are typically listed in USD, but checkout and KHQR payments frequently occur in Khmer Riel (KHR).

* **Storage Strategy:** All base prices are stored in cents/smallest units. The database explicitly tracks both the listing currency and the final checkout currency.
* **Exchange Rate:** The Rust API utilizes a stored exchange rate to calculate conversions at the exact time of checkout.
* **KHQR Generation:** When generating the Bakong KHQR string, the Rust API dynamically sets the currency code (`840` for USD, `116` for KHR) based on the buyer's UI selection, ensuring the banking app opens natively in the correct currency.

---

## 5. Domain Logic: Multi-Language & AI Translation Pipeline

To support an international buyer base, the application implements i18n across the stack.

* **Frontend:** Utilizes JSON translation files mapping to static UI elements. Locale is determined by URL routing on the web and system preferences on mobile.
* **Backend:** Uses request headers to determine user locale for system notifications.

### The Automated AI Translation Flow

User-generated vehicle descriptions are automatically translated using an AI pipeline to prevent manual translation overhead:

1. **Submit:** An admin submits a new listing in their native language via `POST /api/listings`.
2. **Core Insert:** The Rust API saves the numerical data (price, year) and the original text instantly.
3. **Async Processing:** The API spawns a background thread (`tokio::spawn`) and returns a `200 OK` to the frontend so the UI remains fast and responsive.
4. **AI API Call:** On the background thread, the server calls the **Gemini API** to seamlessly translate the title and description into the remaining supported languages (optimized for accurate Khmer localization).
5. **Translation Insert:** The translated strings are inserted as new rows into the `listing_translations` table.

```