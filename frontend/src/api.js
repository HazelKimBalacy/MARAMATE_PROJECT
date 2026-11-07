// Small fetch wrapper. Errors carry the API's { message, fieldErrors } shape.
export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export async function api(path, { method = 'GET', body, token } = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Cannot reach the MaraMate server. Check that the backend is running on port 8080.', 0)
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(data?.message || 'Something went wrong. Try again.', res.status, data?.fieldErrors || {})
  }
  return data
}
