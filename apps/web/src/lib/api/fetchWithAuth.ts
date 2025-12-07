/**
 * Helper function to handle fetch requests with authentication
 * This is a shared utility used by all API clients
 */
export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
  handleEmptyResponse = false
): Promise<T> {
  // Get token from localStorage for Authorization header
  const token = localStorage.getItem('auth_token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // Add existing headers if they exist
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value
      })
    } else if (Array.isArray(options.headers)) {
      // Handle array format [['key', 'value'], ...]
      options.headers.forEach(([key, value]) => {
        headers[key] = value
      })
    } else {
      // Handle object format
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value
        }
      })
    }
  }

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Still include for cookie fallback
    headers
  })

  if (!response.ok) {
    let errorMessage = 'Request failed'
    try {
      // Try to parse as JSON first
      const errorData = await response.json()
      errorMessage = errorData.message || JSON.stringify(errorData)
    } catch {
      // If JSON parsing fails, try to get text
      try {
        errorMessage = await response.text()
      } catch {
        errorMessage = `Request failed with status ${response.status}`
      }
    }

    if (typeof window !== 'undefined' && response.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
    }
    throw new Error(errorMessage)
  }

  // Handle 204 No Content or empty responses when requested
  if (handleEmptyResponse) {
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as unknown as T
    }
  }

  return response.json()
}
