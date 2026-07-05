import { useState, useEffect } from 'react'
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
import { getTasks } from '../api/taskApi'

const formatLocalDate = () => {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const calculateDurationMinutes = (startTime, endTime) => {
  if (!startTime || !endTime) return 25
  try {
    const [h1, m1] = startTime.split(':').map(Number)
    const [h2, m2] = endTime.split(':').map(Number)
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1)
    if (diff < 0) diff += 24 * 60
    return diff
  } catch (e) {
    return 25
  }
}

const mapTaskStatus = (status) => {
  if (status === 'COMPLETED') return 'done'
  if (status === 'IN_PROGRESS') return 'active'
  return 'pending'
}

const DashboardPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const [tasks, setTasks] = useState([])
  const [isTasksLoading, setIsTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState(null)

  useEffect(() => {
    const fetchTodayTasks = async () => {
      try {
        setIsTasksLoading(true)
        setTasksError(null)
        const today = formatLocalDate()
        const fetchedTasks = await getTasks({ date: today })
        
        let mappedTasks = fetchedTasks.map(t => {
          return {
            id: t.id,
            title: t.title,
            module: t.moduleName || t.goalName || 'Study Task',
            mins: calculateDurationMinutes(t.startTime, t.endTime),
            status: mapTaskStatus(t.status),
            orderIndex: t.orderIndex || 0,
            startTime: t.startTime
          }
        })
        
        mappedTasks.sort((a, b) => {
          if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex
          if (a.startTime && b.startTime) {
            return a.startTime.localeCompare(b.startTime)
          }
          return 0
        })

        setTasks(mappedTasks)
      } catch (err) {
        console.error('Failed to fetch tasks:', err)
        setTasks([])
        setTasksError('Could not load today\'s tasks.')
      } finally {
        setIsTasksLoading(false)
      }
    }

    if (user) {
      fetchTodayTasks()
    } else {
      setIsTasksLoading(false)
    }
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const remainingTasksCount = tasks.filter(t => t.status !== 'done').length
  const nextFocusTask = tasks.find(t => t.status === 'active') || tasks.find(t => t.status === 'pending')

  const handleStartFocus = () => {
    if (nextFocusTask?.id) {
      navigate(`/focus?taskId=${nextFocusTask.id}`)
    } else {
      navigate('/focus')
    }
  }

  const handleOpenPlanning = () => {
    navigate('/planning')
  }

  return (
    <div className="min-h-screen">
      <StudyOrbitBackdrop />

      <AppNav user={user} onLogout={handleLogout} />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-6">
        <GreetingSection
          user={user}
          onStartFocus={handleStartFocus}
          onCreateGoal={handleOpenPlanning}
          remainingTasks={remainingTasksCount}
          hasActiveTask={!!nextFocusTask}
        />

        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-card-rise"
          style={{ animationDelay: '0.08s' }}
        >
          <div className="lg:col-span-3">
            <TodayFlowCard tasks={tasks} isLoading={isTasksLoading} error={tasksError} />
          </div>
          <div className="lg:col-span-2"><FocusSessionCard onStartFocus={handleStartFocus} activeTask={nextFocusTask} /></div>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-card-rise"
          style={{ animationDelay: '0.18s' }}
        >
          <div className="lg:col-span-2"><StudyStreakCard /></div>
          <div className="lg:col-span-3"><LearningProgressCard /></div>
        </div>

        <QuickActionsBar
          onUploadPdf={handleOpenPlanning}
          onOpenWorkspace={() => navigate('/focus')}
          onReviewNotes={handleOpenPlanning}
          onViewSchedule={handleOpenPlanning}
        />
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

