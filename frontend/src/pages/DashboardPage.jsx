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
  QuickActionsBar,
  FocusHistoryCard
} from '../features/dashboard/DashboardSections'
import TimeSlotEditorModal from '../features/dashboard/TimeSlotEditorModal'
import GoalOverviewModal from '../features/dashboard/GoalOverviewModal'
import ProfileSettingsModal from '../features/profile/ProfileSettingsModal'
import { getTasks } from '../api/taskApi'
import { getPomodoroLogs } from '../api/pomodoroApi'

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
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [isTasksLoading, setIsTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const [focusLogs, setFocusLogs] = useState([])
  const [isFocusHistoryLoading, setIsFocusHistoryLoading] = useState(true)
  const [focusHistoryError, setFocusHistoryError] = useState(null)
  const [focusHistoryRetryCount, setFocusHistoryRetryCount] = useState(0)

  useEffect(() => {
    const fetchTodayTasks = async () => {
      try {
        setIsTasksLoading(true)
        setTasksError(null)
        const today = formatLocalDate()
        const fetchedTasks = await getTasks() // fetch all
        
        let mappedTasks = fetchedTasks.map(t => {
          return {
            id: t.id,
            title: t.title,
            module: t.moduleTitle || t.moduleName || t.goalName || 'Study Task',
            mins: calculateDurationMinutes(t.startTime, t.endTime),
            status: mapTaskStatus(t.status),
            orderIndex: t.orderIndex || 0,
            startTime: t.startTime,
            scheduledDate: t.scheduledDate || today
          }
        })
        const todayTasks = mappedTasks.filter(t => t.scheduledDate === today)
        const futureTasks = mappedTasks.filter(t => t.scheduledDate > today && t.status !== 'done')

        todayTasks.sort((a, b) => {
          if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex
          if (a.startTime && b.startTime) {
            return a.startTime.localeCompare(b.startTime)
          }
          return 0
        })

        futureTasks.sort((a, b) => {
          const dateCmp = a.scheduledDate.localeCompare(b.scheduledDate)
          if (dateCmp !== 0) return dateCmp
          if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex
          if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime)
          return 0
        })

        setTasks(todayTasks)
        setUpcomingTasks(futureTasks.slice(0, 3))
        setAllTasks(mappedTasks)
      } catch (err) {
        console.error('Failed to fetch tasks:', err)
        setTasks([])
        setUpcomingTasks([])
        setAllTasks([])
        setTasksError('Could not load tasks.')
      } finally {
        setIsTasksLoading(false)
      }
    }

    if (user) {
      fetchTodayTasks()
    } else {
      setIsTasksLoading(false)
    }
  }, [user, retryCount])

  useEffect(() => {
    const fetchFocusHistory = async () => {
      try {
        setIsFocusHistoryLoading(true)
        setFocusHistoryError(null)

        const data = await getPomodoroLogs()
        setFocusLogs(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('[DashboardPage] Failed to fetch focus history:', error)
        setFocusLogs([])
        setFocusHistoryError('Could not load focus history.')
      } finally {
        setIsFocusHistoryLoading(false)
      }
    }

    if (user) {
      fetchFocusHistory()
    } else {
      setFocusLogs([])
      setIsFocusHistoryLoading(false)
    }
  }, [user, focusHistoryRetryCount])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleRetry = () => {
    setRetryCount(c => c + 1)
  }

  const handleFocusHistoryRetry = () => {
    setFocusHistoryRetryCount(count => count + 1)
  }

  const remainingTasksCount = tasks.filter(t => t.status !== 'done').length
  const hasIncompleteTasks = allTasks.some(t => t.status !== 'done')
  const nextFocusTask =
    tasks.find(t => t.status === 'active') ||
    tasks.find(t => t.status === 'pending') ||
    upcomingTasks.find(t => t.status === 'active') ||
    upcomingTasks.find(t => t.status === 'pending')

  const handleStartFocus = () => {
    if (nextFocusTask?.id) {
      navigate(`/focus?taskId=${nextFocusTask.id}`)
      return
    }

    navigate('/planning')
  }

  const handleOpenPlanning = () => {
    navigate('/planning')
  }

  return (
    <div className="min-h-screen">
      <StudyOrbitBackdrop />

      <AppNav user={user} onLogout={handleLogout} onOpenProfile={() => setShowProfileModal(true)} />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-6">
        <GreetingSection
          user={user}
          onStartFocus={handleStartFocus}
          onCreateGoal={handleOpenPlanning}
          remainingTasks={remainingTasksCount}
          hasActiveTask={!!nextFocusTask}
          isLoading={isTasksLoading}
        />

        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-card-rise items-start"
          style={{ animationDelay: '0.08s' }}
        >
          <div className="lg:col-span-3">
            <TodayFlowCard 
              tasks={tasks} 
              upcomingTasks={upcomingTasks} 
              isLoading={isTasksLoading} 
              error={tasksError}
              hasAnyTasks={allTasks.length > 0}
              hasIncompleteTasks={hasIncompleteTasks}
              onTaskClick={(taskId) => navigate(`/focus?taskId=${taskId}`)}
              onRetry={handleRetry}
              onCreatePlan={handleOpenPlanning}
            />
          </div>
          <div className="lg:col-span-2"><FocusSessionCard onStartFocus={handleStartFocus} onCreateGoal={handleOpenPlanning} activeTask={nextFocusTask} /></div>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-card-rise"
          style={{ animationDelay: '0.18s' }}
        >
          <div className="lg:col-span-2"><StudyStreakCard user={user} /></div>
          <div className="lg:col-span-3"><LearningProgressCard user={user} tasks={allTasks} todayTasks={tasks} onCreateGoal={handleOpenPlanning} /></div>
        </div>

        <div className="animate-card-rise" style={{ animationDelay: '0.28s' }}>
          <FocusHistoryCard
            logs={focusLogs}
            tasks={allTasks}
            isLoading={isFocusHistoryLoading}
            error={focusHistoryError}
            onRetry={handleFocusHistoryRetry}
          />
        </div>

        <QuickActionsBar
          onOpenGoals={() => setShowGoalModal(true)}
          onUploadPdf={handleOpenPlanning}
          onOpenWorkspace={() => navigate('/focus')}
          onEditAvailability={() => setShowTimeSlotModal(true)}
          onViewSchedule={() => navigate('/calendar')}
        />
      </main>

      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="border-t border-stone-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-stone-400">© 2026 StudyFlow</p>
          <p className="text-xs text-stone-300">v0.1.0</p>
        </div>
      </footer>

      {showTimeSlotModal && (
        <TimeSlotEditorModal onClose={() => setShowTimeSlotModal(false)} />
      )}
      
      {showGoalModal && (
        <GoalOverviewModal onClose={() => setShowGoalModal(false)} />
      )}
      
      {showProfileModal && (
        <ProfileSettingsModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  )
}

export default DashboardPage

