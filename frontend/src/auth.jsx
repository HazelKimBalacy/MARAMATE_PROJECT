import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from './api.js'

const AuthContext = createContext(null)
const KEY = 'maramate.token'

// localStorage can throw (private windows, blocked storage), so every access is guarded.
const readToken = () => {
  try { return localStorage.getItem(KEY) } catch { return null }
}
const writeToken = (t) => {
  try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY) } catch { /* ignore */ }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(readToken()))

  // Restore the session after a page refresh.
  useEffect(() => {
    if (!token || user) { setLoading(false); return }
    let cancelled = false
    api('/auth/me', { token })
      .then((u) => !cancelled && setUser(u))
      .catch(() => { if (!cancelled) { writeToken(null); setToken(null) } })
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [token, user])

  const login = useCallback(async (email, password) => {
    const res = await api('/auth/login', { method: 'POST', body: { email, password } })
    writeToken(res.token)
    setToken(res.token)
    setUser(res.user)
    return res.user
  }, [])

  const logout = useCallback(() => {
    writeToken(null)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
