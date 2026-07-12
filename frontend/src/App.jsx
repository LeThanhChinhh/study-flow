import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import FocusWorkspacePage from './pages/FocusWorkspacePage'
import PlanningPage from './pages/PlanningPage'
import CalendarPage from './pages/CalendarPage'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicOnlyRoute from './routes/PublicOnlyRoute'
import StudyIcon from './components/StudyIcon'
import { useAuth } from './auth/AuthContext'

const LandingPage = lazy(() => import('./pages/LandingPage'))

const AppRouteLoader = () => (
  <div className="min-h-screen bg-[#faf9f7] flex flex-col items-center justify-center p-4">
    <div className="flex flex-col items-center gap-4 animate-pulse">
      <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center shadow-sm">
        <StudyIcon name="layers" size={24} className="text-white" />
      </div>
      <p className="text-sm font-medium text-stone-500 tracking-wide">Preparing StudyFlow...</p>
    </div>
  </div>
)

const CatchAllRedirect = () => {
  const { isAuthenticated, isInitializing } = useAuth()
  if (isInitializing) return <AppRouteLoader />
  return <Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing route — authenticated users may still visit it. */}
        <Route
          path="/"
          element={
            <Suspense fallback={<AppRouteLoader />}>
              <LandingPage />
            </Suspense>
          }
        />

        {/* Auth routes */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* App routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/planning" element={<PlanningPage />} />
          <Route path="/focus" element={<FocusWorkspacePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Route>

        {/* Unknown routes return to the most useful entry point for the auth state. */}
        <Route path="*" element={<CatchAllRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
