// Central API configuration for the web app.
//
// Override per environment with NEXT_PUBLIC_API_URL (e.g. in apps/web/.env.local):
//   NEXT_PUBLIC_API_URL=http://192.168.0.34:8080
// Falls back to localhost, which is correct when the browser and the Rust API
// run on the same machine.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const LISTINGS_URL = `${API_BASE}/api/listings`;
