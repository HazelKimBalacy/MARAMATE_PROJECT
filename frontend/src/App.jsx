import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Home from './pages/Home.jsx'

function RequireAuth({ children }) {
  const { token, user, loading } = useAuth()
  if (loading) return <p className="page-status">Loading your account…</p>
  if (!token || !user) return <Navigate to="/login" replace />
  return children
}

// Logged-in users skip the login and signup pages.
function GuestOnly({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/home" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/signup" element={<GuestOnly><Signup /></GuestOnly>} />
      <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
