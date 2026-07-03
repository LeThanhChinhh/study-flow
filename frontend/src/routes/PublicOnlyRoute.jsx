import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import StudyIcon from '../components/StudyIcon'

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center shadow-sm">
            <StudyIcon name="layers" size={24} className="text-white" />
          </div>
          <p className="text-sm font-medium text-stone-500 tracking-wide">Preparing your study space...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children ? children : <Outlet />
}

export default PublicOnlyRoute
