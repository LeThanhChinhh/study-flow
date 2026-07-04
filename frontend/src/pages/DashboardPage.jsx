import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { StudyOrbitBackdrop } from '../features/dashboard/DashboardDecor'
import {
  AppNav,
  GreetingSection,
  TodayFlowCard,
  FocusSessionCard,
  StudyStreakCard,
  LearningProgressCard,
  QuickActionsBar
} from '../features/dashboard/DashboardSections'

const DashboardPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <StudyOrbitBackdrop />

      <AppNav user={user} onLogout={handleLogout} />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-6">
        <GreetingSection user={user} />

        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-card-rise"
          style={{ animationDelay: '0.08s' }}
        >
          <div className="lg:col-span-3"><TodayFlowCard /></div>
          <div className="lg:col-span-2"><FocusSessionCard /></div>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-card-rise"
          style={{ animationDelay: '0.18s' }}
        >
          <div className="lg:col-span-2"><StudyStreakCard /></div>
          <div className="lg:col-span-3"><LearningProgressCard /></div>
        </div>

        <QuickActionsBar />
      </main>

      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="border-t border-stone-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-stone-400">© 2026 StudyFlow</p>
          <p className="text-xs text-stone-300">v0.1.0</p>
        </div>
      </footer>
    </div>
  )
}

export default DashboardPage
