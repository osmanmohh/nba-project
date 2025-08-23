// Get the API base URL from environment variable or fallback to localhost
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001";

// Helper function to build API URLs
export function buildApiUrl(endpoint) {
  return `${API_BASE_URL}${endpoint}`;
}
