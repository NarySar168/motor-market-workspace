// Shared listing/vehicle type used across the homepage components.
// Mirrors the API response shape exactly — do not add fields that
// aren't returned by the Rust API (no mileage/fuel/transmission).
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number; // integer cents
  description?: string;
  vehicle_type?: string; // 'car' | 'motorcycle'
  seller_email: string;
  image_urls: string[];
}
