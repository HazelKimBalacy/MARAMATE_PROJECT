import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Profile from './pages/Profile.jsx'
import ChangePassword from './pages/ChangePassword.jsx'

function RequireAuth({ children }) {
  const { token, user, loading } = useAuth()
  if (loading) return <p className="page-status">Loading your account…</p>
  if (!token || !user) return <Navigate to="/login" replace />
  return children
}

// Logged-in users skip the login and signup pages.
function GuestOnly({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const continuation = new URLSearchParams(location.search).get('continue')
  const returnTo = continuation?.startsWith('/?movie=') && !continuation.startsWith('//')
    ? continuation
    : '/'
  if (loading) return <p className="page-status">Checking your account…</p>
  return user ? <Navigate to={returnTo} replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/signup" element={<GuestOnly><Signup /></GuestOnly>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />
      <Route path="/home" element={<RequireAuth><Landing /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
