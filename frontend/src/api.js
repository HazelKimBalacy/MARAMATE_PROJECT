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

  const text = await res.text().catch(() => '')
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }
  if (!res.ok) {
    const fallback = text?.trim()
      ? `Server error (${res.status}): ${text.trim()}`
      : `Server error (${res.status}).`
    throw new ApiError(data?.message || fallback, res.status, data?.fieldErrors || {})
  }
  return data
}
