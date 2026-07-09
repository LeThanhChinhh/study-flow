/**
 * CalendarPage.jsx
 *
 * Weekly calendar. Fetches tasks from getTasks() and renders them in a
 * 7-column week grid. Clicking a task card opens CalendarTaskDetailModal
 * where the user can view details, change status, or start a focus session.
 *
 * State:
 *   weekAnchor    — any date within the displayed week; used to derive weekDays
 *   tasks         — raw tasks from API
 *   isLoading     — fetch in progress
 *   error         — fetch error message
 *   selectedTask  — task currently shown in the detail modal (null = closed)
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudyOrbitBackdrop } from '../features/dashboard/DashboardDecor'
import {
  DayColumn,
  WeekNavHeader,
  UnscheduledSection,
  EmptyWeek,
  SkeletonColumn,
} from '../features/calendar/CalendarWeekView'
import {
  formatLocalDate,
  getStartOfWeek,
  getWeekDays,
  groupTasksByDate,
  addDays,
} from '../features/calendar/calendarUtils'
import StudyIcon from '../components/StudyIcon'
import { getTasks } from '../api/taskApi'
import CalendarTaskDetailModal from '../features/calendar/CalendarTaskDetailModal'

/* ─── CalendarPage ──────────────────────────────────────────────────────── */

const CalendarPage = () => {
  const navigate = useNavigate()

  // weekAnchor: a Date in the displayed week (we derive Mon–Sun from it)
  const [weekAnchor, setWeekAnchor] = useState(() => new Date())
  const [tasks,      setTasks]      = useState([])
  const [isLoading,  setIsLoading]  = useState(true)
  const [error,      setError]      = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)

  /* ── Data fetching ───────────────────────────────────────────────────── */

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getTasks()
      setTasks(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[CalendarPage] Failed to fetch tasks:', err)
      setError('Could not load your calendar.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  /* ── Derived data ────────────────────────────────────────────────────── */

  const weekDays    = getWeekDays(weekAnchor)
  const weekStart   = weekDays[0]
  const todayStr    = formatLocalDate(new Date())
  const { byDate, unscheduled } = groupTasksByDate(tasks)

  // Count tasks that fall in the current week view
  const weekTaskCount = weekDays.reduce((sum, d) => {
    const ds = formatLocalDate(d)
    return sum + (byDate[ds]?.length ?? 0)
  }, 0)

  /* ── Navigation handlers ─────────────────────────────────────────────── */

  const goToPrevWeek = () => setWeekAnchor(prev => addDays(getStartOfWeek(prev), -7))
  const goToNextWeek = () => setWeekAnchor(prev => addDays(getStartOfWeek(prev), 7))
  const goToToday    = () => setWeekAnchor(new Date())

  /* ── Task click → open detail modal ─────────────────────────────────── */

  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }

  /* ── Task updated (status change from modal) ─────────────────────────── */

  const handleTaskUpdated = (updatedTask) => {
    let mergedTask = updatedTask

    setTasks(prev =>
      prev.map(t => {
        if (t.id !== updatedTask.id) return t
        mergedTask = { ...t, ...updatedTask }
        return mergedTask
      })
    )

    setSelectedTask(prev =>
      prev && prev.id === updatedTask.id ? { ...prev, ...updatedTask } : mergedTask
    )
  }

  /* ── Render helpers ──────────────────────────────────────────────────── */

  const hasTasks = tasks.length > 0

  /* ─────────────────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen">
      <StudyOrbitBackdrop />

      {/* ── Top navigation bar ── */}
      <nav className="nav-glass sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center shadow-sm">
              <StudyIcon name="layers" size={15} className="text-white" />
            </div>
            <span className="text-stone-800 text-base font-bold tracking-tight">StudyFlow</span>
          </div>

          {/* Page label pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 rounded-full border border-violet-100/80">
            <StudyIcon name="calendar" size={12} className="text-violet-500" />
            <span className="text-xs font-medium text-violet-700">Calendar</span>
          </div>

          {/* Back to Dashboard */}
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-ghost text-xs px-3 py-[0.45rem]"
            aria-label="Back to Dashboard"
          >
            <StudyIcon name="arrow-right" size={13} className="rotate-180" />
            <span>Dashboard</span>
          </button>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Error state ── */}
        {!isLoading && error && (
          <div className="card p-10 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center">
              <StudyIcon name="calendar" size={24} className="text-rose-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-1">{error}</p>
              <p className="text-xs text-stone-400">Check your connection and try again.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchTasks} className="btn-accent text-xs px-4 py-2">
                <StudyIcon name="zap" size={12} />
                Retry
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn-ghost text-xs px-4 py-2">
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* ── Global empty state (no tasks at all) ── */}
        {!isLoading && !error && !hasTasks && (
          <div className="card p-12 flex flex-col items-center justify-center text-center gap-5">
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center">
              <StudyIcon name="calendar" size={28} className="text-violet-300" />
            </div>
            <div>
              <p className="text-base font-semibold text-stone-700 mb-2">
                No scheduled tasks yet
              </p>
              <p className="text-sm text-stone-400 max-w-xs">
                Create a learning plan to see your study calendar populate with tasks.
              </p>
            </div>
            <button
              onClick={() => navigate('/planning')}
              className="btn-accent"
            >
              <StudyIcon name="plus" size={14} strokeWidth={2.5} />
              Create learning plan
            </button>
          </div>
        )}

        {/* ── Calendar content ── */}
        {!error && (isLoading || hasTasks) && (
          <div className="space-y-5">

            {/* Week navigation header */}
            <div className="card p-4">
              <WeekNavHeader
                weekStart={weekStart}
                onPrev={goToPrevWeek}
                onNext={goToNextWeek}
                onToday={goToToday}
              />
            </div>

            {/* 7-column week grid */}
            <div className="card p-4 relative">
              {/* Subtle gradient separator */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/50 to-transparent rounded-t-2xl"
              />

              <div className="overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
                <div className="grid grid-cols-7 gap-2 min-w-[1180px] xl:min-w-0">
                {isLoading
                  ? Array.from({ length: 7 }).map((_, i) => <SkeletonColumn key={i} />)
                  : weekTaskCount === 0
                  ? (
                    <EmptyWeek
                      onCreatePlan={() => navigate('/planning')}
                      onToday={goToToday}
                    />
                  )
                  : weekDays.map(date => {
                      const ds = formatLocalDate(date)
                      return (
                        <DayColumn
                          key={ds}
                          date={date}
                          tasks={byDate[ds] ?? []}
                          isToday={ds === todayStr}
                          onTaskClick={handleTaskClick}
                        />
                      )
                    })
                }
                </div>
              </div>
            </div>

            {/* When loaded + has tasks in week, still show unscheduled below */}
            {!isLoading && (
              <UnscheduledSection
                tasks={unscheduled}
                onTaskClick={handleTaskClick}
              />
            )}

          </div>
        )}

      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-t border-stone-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-stone-400">© 2026 StudyFlow</p>
          <p className="text-xs text-stone-300">v0.1.0</p>
        </div>
      </footer>
      {/* ── Task Detail Modal ── */}
      <CalendarTaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={handleTaskUpdated}
      />

    </div>
  )
}

export default CalendarPage
