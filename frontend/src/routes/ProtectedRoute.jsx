import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <img src="/studyflow_logo.png" alt="StudyFlow" className="h-12 w-12 object-contain" />
          <p className="text-sm font-medium text-stone-500 tracking-wide">Preparing your study space...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children ? children : <Outlet />
}

export default ProtectedRoute
