import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import AppBackground from '../components/background/AppBackground'
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
import { getTasks, updateTask } from '../api/taskApi'
import { getGoals } from '../api/goalApi'
import CalendarTaskDetailModal from '../features/calendar/CalendarTaskDetailModal'
import CalendarCreateTaskModal from '../features/calendar/CalendarCreateTaskModal'
import CalendarTaskCard from '../features/calendar/CalendarTaskCard'

/*  CalendarPage  */

const CalendarPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // weekAnchor: a Date in the displayed week (we derive Mon–Sun from it)
  const [weekAnchor, setWeekAnchor] = useState(() => new Date())
  const [tasks,      setTasks]      = useState([])
  const [goals,      setGoals]      = useState([])
  const [isLoading,  setIsLoading]  = useState(true)
  const [error,      setError]      = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)

  // Drag-drop state
  const [movingTaskId,    setMovingTaskId]    = useState(null)
  const [moveError,       setMoveError]       = useState(null)
  const [activeDragTask,  setActiveDragTask]  = useState(null)
  const [dragOverlayWidth, setDragOverlayWidth] = useState(160)

  // Snapshot captured at drag-start for rollback — avoids tasks closure in handleDragEnd
  const dragSnapshotRef = useRef(null)

  // Suppress opening modal immediately after a drag ends
  const suppressTaskClickRef      = useRef(false)
  const suppressTaskClickTimerRef = useRef(null)

  // Cleanup suppression timer on unmount
  useEffect(() => {
    return () => {
      if (suppressTaskClickTimerRef.current) {
        clearTimeout(suppressTaskClickTimerRef.current)
      }
    }
  }, [])

  /*  dnd-kit sensors  */

  // PointerSensor with 5px activation distance prevents accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  /*  Data fetching  */

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [tasksData, goalsData] = await Promise.all([
        getTasks(),
        getGoals()
      ])
      setTasks(Array.isArray(tasksData) ? tasksData : [])
      setGoals(Array.isArray(goalsData) ? goalsData : [])
    } catch (err) {
      console.error('[CalendarPage] Failed to fetch data:', err)
      setError('Could not load your calendar.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /*  Derived data  */

  const requestedGoalId = searchParams.get('goalId')
  const selectedGoalId = requestedGoalId || 'all'

  // Clean up invalid goalId from URL
 useEffect(() => {
  if (isLoading || !requestedGoalId) return

  const exists = goals.some(goal => goal.id === requestedGoalId)

  if (!exists) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.delete('goalId')
      return next
    }, { replace: true })
  }
}, [isLoading, goals, requestedGoalId, setSearchParams])

  const filteredTasks = useMemo(() => {
    if (selectedGoalId === 'all') return tasks
    return tasks.filter(t => t.goalId === selectedGoalId)
  }, [tasks, selectedGoalId])

  const goalTitleById = useMemo(
    () => new Map(goals.map(goal => [goal.id, goal.title])),
    [goals]
  )

  const displayTasks = useMemo(() => {
    return filteredTasks.map(task => ({
      ...task,
      goalTitle: task.goalId ? goalTitleById.get(task.goalId) ?? null : null
    }))
  }, [filteredTasks, goalTitleById])

  const weekDays    = useMemo(() => getWeekDays(weekAnchor), [weekAnchor])
  const weekStart   = weekDays[0]
  const todayStr    = useMemo(() => formatLocalDate(new Date()), [])
  const { byDate, unscheduled } = useMemo(() => groupTasksByDate(displayTasks), [displayTasks])

  // Count tasks that fall in the current week view
  const weekTaskCount = useMemo(() => {
    return weekDays.reduce((sum, d) => {
      const ds = formatLocalDate(d)
      return sum + (byDate[ds]?.length ?? 0)
    }, 0)
  }, [weekDays, byDate])

  /*  Navigation handlers  */

  const goToPrevWeek = () => setWeekAnchor(prev => addDays(getStartOfWeek(prev), -7))
  const goToNextWeek = () => setWeekAnchor(prev => addDays(getStartOfWeek(prev), 7))
  const goToToday    = () => setWeekAnchor(new Date())

  const defaultDate = useMemo(() => {
    const today = new Date()
    const isTodayInWeek = weekDays.some(d => formatLocalDate(d) === todayStr)
    return isTodayInWeek ? todayStr : formatLocalDate(weekStart)
  }, [weekDays, todayStr, weekStart])

  /*  Task click → open detail modal  */

  const handleTaskClick = (task) => {
    if (suppressTaskClickRef.current) return
    setSelectedTask(task)
  }

  /*  Task updated (status change from modal)  */

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

  const handleTaskDeleted = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    setSelectedTask(prev => prev?.id === taskId ? null : prev)
  }

  /*  Drag-drop suppress click helpers  */

  const releaseTaskClickSuppression = useCallback(() => {
    if (suppressTaskClickTimerRef.current) {
      clearTimeout(suppressTaskClickTimerRef.current)
    }
    suppressTaskClickTimerRef.current = setTimeout(() => {
      suppressTaskClickRef.current = false
    }, 120)
  }, [])

  const handleDragStart = useCallback(({ active }) => {
    suppressTaskClickRef.current = true
    const task = active.data.current?.task
    if (task) {
      setActiveDragTask(task)
      // Capture the element's actual width so DragOverlay matches the original card size
      // — this keeps the cursor at the same relative position within the card during drag
      const initialWidth = active.rect.current?.initial?.width
      if (initialWidth) setDragOverlayWidth(initialWidth)
      // Capture rollback snapshot at drag-start so handleDragEnd has no tasks dependency
      setTasks(current => {
        dragSnapshotRef.current = current
        return current
      })
    }
  }, [])

  const handleDragCancel = useCallback(() => {
    setActiveDragTask(null)
    dragSnapshotRef.current = null
    releaseTaskClickSuppression()
  }, [releaseTaskClickSuppression])

  /*  Drag-drop handler  */

  const handleDragEnd = useCallback(async ({ active, over }) => {
    try {
      setActiveDragTask(null)

      // No valid drop target
      if (!over) return

      const draggedTask = active.data.current?.task
      if (!draggedTask) return

      const targetDate = over.id // YYYY-MM-DD string (droppable id = dateStr)

      // No-op: dropped on the same date
      if (draggedTask.scheduledDate === targetDate) return

      // Use snapshot captured at drag-start (no tasks closure needed)
      const snapshot = dragSnapshotRef.current

      // Optimistic update
      setTasks(prev =>
        prev.map(t =>
          t.id === draggedTask.id ? { ...t, scheduledDate: targetDate } : t
        )
      )
      setMovingTaskId(draggedTask.id)
      setMoveError(null)

      try {
        const updated = await updateTask(draggedTask.id, {
          scheduledDate: targetDate,
          startTime: draggedTask.startTime,
          endTime: draggedTask.endTime,
        })

        // Merge response, preserving moduleTitle if backend omits it
        setTasks(prev =>
          prev.map(t => {
            if (t.id !== draggedTask.id) return t
            return { ...t, ...updated, moduleTitle: updated.moduleTitle ?? t.moduleTitle }
          })
        )
      } catch (err) {
        // Rollback to snapshot
        if (snapshot) setTasks(snapshot)

        // Extract backend error message if available
        const msg =
          err?.data?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Could not move task. Please try again.'
        setMoveError(msg)

        // Auto-dismiss after 5 seconds
        setTimeout(() => setMoveError(null), 5000)
      } finally {
        setMovingTaskId(null)
        dragSnapshotRef.current = null
      }
    } finally {
      releaseTaskClickSuppression()
    }
  }, [releaseTaskClickSuppression])  // tasks removed from deps — snapshot via ref

  /*  Render helpers  */

  const hasAnyTasks = tasks.length > 0
  const hasAnyGoals = goals.length > 0
  const isGoalFiltered = selectedGoalId !== 'all'
  const showGoalBadges = selectedGoalId === 'all'

  return (
    <div className="min-h-screen">
      <AppBackground variant="calendar" />

      {/*  Top navigation bar  */}
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

      {/*  Main content  */}
      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/*  Drag-drop error banner  */}
        {moveError && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700"
          >
            <StudyIcon name="zap" size={13} className="text-rose-400 shrink-0" />
            <span className="flex-1">{moveError}</span>
            <button
              onClick={() => setMoveError(null)}
              className="text-rose-400 hover:text-rose-600 transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <StudyIcon name="x" size={13} />
            </button>
          </div>
        )}

        {/*  Error state  */}
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
              <button onClick={fetchData} className="btn-accent text-xs px-4 py-2">
                <StudyIcon name="zap" size={12} />
                Retry
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn-ghost text-xs px-4 py-2">
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/*  Global empty state (no tasks at all)  */}
        {!isLoading && !error && !hasAnyTasks && !hasAnyGoals && !isGoalFiltered && (
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

        {/*  Calendar content  */}
        {!error && (isLoading || hasAnyTasks || hasAnyGoals || isGoalFiltered) && (
          <div className="space-y-5">

            {/* Week navigation header */}
            <div className="card p-4">
              <WeekNavHeader
                weekStart={weekStart}
                onPrev={goToPrevWeek}
                onNext={goToNextWeek}
                onToday={goToToday}
                goals={goals}
                selectedGoalId={selectedGoalId}
                onGoalChange={(newId) => {
                  setSearchParams(prev => {
                    const next = new URLSearchParams(prev)
                    if (newId === 'all') {
                      next.delete('goalId')
                    } else {
                      next.set('goalId', newId)
                    }
                    return next
                  })
                }}
                onAddTask={() => setIsCreateTaskOpen(true)}
                canAddTask={goals.length > 0}
              />
            </div>

            {/* 7-column week grid — wrapped in DndContext */}
            <div className="card p-4 relative">
              {/* Subtle gradient separator */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/50 to-transparent rounded-t-2xl"
              />

              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <div className="overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
                  <div className="grid grid-cols-7 gap-2 min-w-[1180px] xl:min-w-0">
                  {isLoading
                    ? Array.from({ length: 7 }).map((_, i) => <SkeletonColumn key={i} />)
                    : weekTaskCount === 0
                    ? (
                      <EmptyWeek
                        onCreatePlan={() => navigate('/planning')}
                        onToday={goToToday}
                        isGoalFiltered={isGoalFiltered}
                        onClearGoalFilter={() => {
                          setSearchParams(prev => {
                            const next = new URLSearchParams(prev)
                            next.delete('goalId')
                            return next
                          })
                        }}
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
                            isMovingTaskId={movingTaskId}
                            showGoalBadge={showGoalBadges}
                          />
                        )
                      })
                  }
                  </div>
                </div>

                {/* DragOverlay renders the floating card above overflow-hidden columns */}
                <DragOverlay dropAnimation={null}>
                  {activeDragTask ? (
                    <div style={{
                      width: dragOverlayWidth,
                      boxShadow: '0 8px 24px rgba(109,40,217,0.15)',
                      borderRadius: '0.5rem',
                      cursor: 'grabbing',
                    }}>
                      <CalendarTaskCard
                        task={activeDragTask}
                        onClick={() => {}}
                        isMoving={false}
                        enableDrag={false}
                        showGoalBadge={showGoalBadges}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>

            {/* When loaded + has tasks in week, still show unscheduled below */}
            {!isLoading && (
              <UnscheduledSection
                tasks={unscheduled}
                onTaskClick={handleTaskClick}
                showGoalBadge={showGoalBadges}
              />
            )}

          </div>
        )}

      </main>

      {/*  Footer  */}
      <footer className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-t border-stone-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-stone-400">© 2026 StudyFlow</p>
          <p className="text-xs text-stone-300">v0.1.0</p>
        </div>
      </footer>
      {/*  Task Detail Modal  */}
      <CalendarTaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />

      {/*  Create Task Modal  */}
      <CalendarCreateTaskModal
        isOpen={isCreateTaskOpen}
        goals={goals}
        selectedGoalId={selectedGoalId}
        defaultDate={defaultDate}
        onClose={() => setIsCreateTaskOpen(false)}
        onTaskCreated={(createdTask) => {
          setTasks(prev => [...prev, createdTask])
        }}
      />
    </div>
  )
}

export default CalendarPage
