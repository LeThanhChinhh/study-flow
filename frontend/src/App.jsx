import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'

/**
 * App – Root component.
 *
 * Route map:
 *   /            → redirect to /login
 *   /login       → LoginPage
 *   /register    → RegisterPage
 *   /dashboard   → DashboardPage (placeholder for now)
 *   *            → redirect to /login (catch-all)
 *
 * NOTE: ProtectedRoute & AuthContext will be added in Step 2.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* App routes */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
