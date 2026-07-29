// Central API configuration for the mobile app.
//
// A physical device cannot reach the Rust API via "localhost" (that points at
// the phone itself), so this must be the dev machine's LAN IP. Override without
// editing code by setting EXPO_PUBLIC_API_URL in apps/mobile/.env.local:
//   EXPO_PUBLIC_API_URL=http://192.168.0.34:8080
// The fallback is the current dev machine IP; update it in ONE place here.
export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.0.34:8080";

export const LISTINGS_URL = `${API_BASE}/api/listings`;
