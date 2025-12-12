// Build API URL from environment variables
// Priority: VITE_API_URL > VITE_API_HOST + VITE_API_PORT > default
export function getApiBaseUrl(): string {
  // If full URL is provided, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Otherwise, build from host and port
  const host = import.meta.env.VITE_API_HOST || 'localhost'
  const port = import.meta.env.VITE_API_PORT || '3000'
  const protocol = import.meta.env.VITE_API_PROTOCOL || 'http'
  
  return `${protocol}://${host}:${port}/api`
}

