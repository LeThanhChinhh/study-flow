import StudyIcon, { IconBadge } from '../../components/StudyIcon'
import {
  getGreeting, TODAY_STR
} from './dashboardData'

/* App navigation */
export const AppNav = ({ user, onLogout, onOpenProfile }) => (
  <nav id="dashboard-nav" className="nav-glass sticky top-0 z-20">
    <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center shadow-sm">
          <StudyIcon name="layers" size={15} className="text-white" />
        </div>
        <span className="text-stone-800 text-base font-bold tracking-tight">StudyFlow</span>
      </div>

      {/* Current goal chip */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 rounded-full border border-violet-100/80">
        <StudyIcon name="target" size={12} className="text-violet-500" />
        <span className="text-xs font-medium text-violet-700 truncate max-w-[180px]">
          {user?.goal || 'Learning dashboard'}
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 px-2 py-1.5 -mx-2 rounded-xl hover:bg-stone-50 transition-colors text-left"
          aria-label="Open profile settings"
        >
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold select-none uppercase shadow-sm ring-2 ring-white"
          >
            {(user?.username || user?.name || 'S').charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block text-sm font-medium text-stone-700">
            {user?.username || user?.name || 'Student'}
          </span>
        </button>

        <div className="nav-sep" />

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors duration-150 px-1 py-1 rounded-lg hover:bg-stone-50"
          aria-label="Sign out of StudyFlow"
        >
          <StudyIcon name="log-out" size={14} />
          <span className="hidden sm:block">Sign out</span>
        </button>
      </div>
    </div>
  </nav>
)

/* Hero greeting section */
export const GreetingSection = ({ user, onStartFocus, onCreateGoal, remainingTasks = 0, hasActiveTask = true, isLoading = false }) => {
  const { word, icon } = getGreeting()
  return (
    <header className="mb-8 animate-slide-up">

      {/* Date pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-stone-100 shadow-sm mb-4">
        <StudyIcon name={icon} size={13} className="text-amber-400" strokeWidth={1.5} />
        <p className="text-xs text-stone-500 font-medium">{TODAY_STR}</p>
      </div>

      {/* Headline */}
      <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 tracking-tight mb-2 leading-tight">
        {word}, {user?.username || user?.name || 'Student'}.
      </h1>

      {/* Sub-line with remaining tasks */}
      <p className="text-stone-500 text-sm mb-6 max-w-md leading-relaxed">
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-3 w-16 rounded bg-stone-200 animate-pulse align-middle" />
            {' '}remaining today. Keep the momentum going.
          </span>
        ) : (
          <>
            You have{' '}
            <span className="font-semibold text-stone-700">
              {remainingTasks} {remainingTasks === 1 ? 'task' : 'tasks'}
            </span>{' '}
            remaining today. Keep the momentum going.
          </>
        )}
      </p>

      {/* Hero CTAs */}
      <div className="flex flex-wrap items-center gap-3">
        <button id="cta-start-focus" className="btn-accent" onClick={onStartFocus}>
          <StudyIcon name="play" size={14} strokeWidth={2.5} />
          {hasActiveTask ? 'Start focus session' : 'Create learning plan'}
        </button>
        <button id="cta-new-goal" className="btn-ghost" onClick={onCreateGoal}>
          <StudyIcon name="plus" size={14} />
          New learning goal
        </button>
      </div>
    </header>
  )
}

/* Task status dot (timeline connector) */
export const TaskDot = ({ status }) => {
  if (status === 'done') return (
    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
      <StudyIcon name="check" size={10} className="text-white" strokeWidth={3} />
    </div>
  )
  if (status === 'active') return (
    <div className="w-5 h-5 rounded-full border-2 border-violet-400 flex items-center justify-center shrink-0 mt-0.5">
      <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse-soft" />
    </div>
  )
  // pending — subtle filled center dot
  return (
    <div className="w-5 h-5 rounded-full border-2 border-stone-200 flex items-center justify-center shrink-0 mt-0.5">
      <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
    </div>
  )
}

/* Today's Flow card */
export const TodayFlowCard = ({ tasks = [], upcomingTasks = [], isLoading = false, error = null, hasAnyTasks = false, hasIncompleteTasks = false, onTaskClick, onRetry, onCreatePlan }) => {
  const doneCount = tasks.filter(t => t.status === 'done').length
  const pct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0

  return (
    <section
      aria-label="Today's learning flow"
      className="card card-hover p-6 flex flex-col gap-5 relative overflow-hidden min-h-[420px] lg:h-[420px]"
    >
      {/* Subtle inner highlight */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/60 to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between shrink-0">
        <div className="flex items-center gap-3">
          <IconBadge name="book-open" bg="bg-violet-100" icon="text-violet-600" badgeSize="w-9 h-9" />
          <div>
            <h2 className="text-sm font-semibold text-stone-800">Today's Flow</h2>
            <p className="text-xs text-stone-400 mt-0.5">{TODAY_STR}</p>
          </div>
        </div>
        {!isLoading && !error && tasks.length > 0 && (
          <span className="badge bg-stone-100 text-stone-500 shrink-0">
            {doneCount} / {tasks.length} done
          </span>
        )}
        {isLoading && (
          <div className="h-5 w-16 rounded-full bg-stone-100 animate-pulse" />
        )}
      </div>

      {/* States */}
      <div className="flex-1 flex flex-col min-h-0">

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-stone-100 shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-stone-100 rounded w-3/4 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  <div className="h-3 bg-stone-50 rounded w-1/2 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
              <StudyIcon name="alert-circle" size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-700 mb-0.5">Couldn't load tasks</p>
              <p className="text-xs text-stone-400">Check your connection and try again.</p>
            </div>
            {onRetry && (
              <button
                id="today-flow-retry-btn"
                onClick={onRetry}
                className="btn-ghost text-xs px-3 py-1.5"
              >
                <StudyIcon name="arrow-right" size={12} className="rotate-180" />
                Retry
              </button>
            )}
          </div>
        )}

        {/* Global empty state — no tasks ever created */}
        {!isLoading && !error && !hasAnyTasks && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center">
              <StudyIcon name="book-open" size={22} className="text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-1">No learning tasks yet.</p>
              <p className="text-xs text-stone-400 max-w-[200px] mx-auto">Create a learning plan to get started.</p>
            </div>
            {onCreatePlan && (
              <button
                id="today-flow-create-plan-btn"
                onClick={onCreatePlan}
                className="btn-accent text-xs px-4 py-2 mt-2"
              >
                <StudyIcon name="plus" size={12} strokeWidth={2.5} />
                Create a learning plan
              </button>
            )}
          </div>
        )}

        {/* Today empty, but has upcoming */}
        {!isLoading && !error && hasAnyTasks && tasks.length === 0 && upcomingTasks.length > 0 && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex flex-col items-center justify-center py-2 text-center mb-4">
              <StudyIcon name="calendar" size={24} className="text-stone-300 mb-2" />
              <p className="text-sm text-stone-500">No tasks scheduled for today.</p>
            </div>
            
            <div className="bg-stone-50/50 rounded-xl p-4 border border-stone-100">
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Upcoming tasks</h3>
              <ul className="space-y-3">
                {upcomingTasks.map(task => {
                  const isDone = task.status === 'done'

                  return (
                    <li 
                      key={task.id} 
                      className={`flex flex-col gap-1 p-2 -mx-2 rounded-xl transition-colors ${
                        isDone
                          ? 'opacity-60 cursor-default'
                          : 'cursor-pointer hover:bg-stone-100/70'
                      }`}
                      onClick={() => !isDone && onTaskClick?.(task.id)}
                      aria-disabled={isDone}
                    >
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <p className={`text-sm font-medium leading-snug truncate ${isDone ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                          {task.title}
                        </p>
                        {isDone && (
                          <span className="badge bg-emerald-100 text-emerald-600 shrink-0">Done</span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 truncate">
                        {task.scheduledDate} {task.startTime ? `· ${task.startTime}` : ''}
                      </p>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}

        {/* Today empty, no upcoming either (but tasks exist on other days) */}
        {!isLoading && !error && hasAnyTasks && tasks.length === 0 && upcomingTasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {hasIncompleteTasks ? (
              <>
                <StudyIcon name="calendar" size={24} className="text-stone-300 mb-2" />
                <p className="text-sm font-semibold text-stone-700 mb-1">No tasks scheduled for today.</p>
                <p className="text-xs text-stone-400 max-w-[220px]">You still have unfinished tasks. Review your schedule or create a new plan.</p>
              </>
            ) : (
              <>
                <StudyIcon name="check-circle" size={24} className="text-emerald-400 mb-2" />
                <p className="text-sm font-semibold text-stone-700 mb-1">All caught up!</p>
                <p className="text-xs text-stone-400">No tasks scheduled for today.</p>
              </>
            )}
          </div>
        )}

        {/* Task list */}
        {!isLoading && !error && tasks.length > 0 && (
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar today-flow-scroll pr-2 min-h-0">
            <ul className="space-y-0" role="list">
            {tasks.map((task, idx) => {
              const isLast = idx === tasks.length - 1
              const isDone = task.status === 'done'
              return (
                <li 
                  key={task.id} 
                  className={`flex gap-3 group ${
                    isDone ? 'cursor-default opacity-70' : 'cursor-pointer'
                  }`}
                  onClick={() => !isDone && onTaskClick?.(task.id)}
                  aria-disabled={isDone}
                >
                  {/* Connector */}
                  <div className="flex flex-col items-center">
                    <TaskDot status={task.status} />
                    {!isLast && <div className="w-px flex-1 mt-1.5 bg-stone-100 group-hover:bg-stone-200 transition-colors" />}
                  </div>

                  {/* Row content */}
                  <div className={`task-row flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-3'}`}>
                    <div
                      className={`task-row-inner flex-1 transition-colors rounded-xl px-2 py-2 -my-1 min-w-0 ${
                        task.status === 'active' ? 'is-active' :
                        isDone ? '' :
                        'group-hover:bg-stone-50/80'
                      }`}
                    >
                      <div className="min-w-0 flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p 
                            className={`text-sm leading-snug truncate ${
                              isDone             ? 'line-through text-stone-400' :
                              task.status === 'active' ? 'text-violet-700 font-semibold' :
                              'text-stone-700 font-medium'
                            }`}
                            title={task.title}
                          >
                            {task.title}
                          </p>
                          <p className="text-xs text-stone-400 mt-0.5 truncate" title={task.module}>
                            {task.module}
                            {task.mins ? ` · ${task.mins} min` : ''}
                            {task.startTime ? ` · ${task.startTime}` : ''}
                          </p>
                        </div>
                        {/* Status badges */}
                        <div className="shrink-0 mt-0.5">
                          {task.status === 'active' && (
                            <span className="badge bg-violet-100 text-violet-600">In progress</span>
                          )}
                          {isDone && (
                            <span className="badge bg-emerald-100 text-emerald-600">Done</span>
                          )}
                          {task.status === 'pending' && (
                            <span className="badge bg-stone-100 text-stone-400">Pending</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
            </ul>
          </div>
        )}
      </div>

      {/* Progress bar — only when tasks exist */}
      {!isLoading && !error && tasks.length > 0 && (
        <div className="pt-3 border-t border-stone-100/50 shrink-0">
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full progress-fill transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-stone-400 mt-1.5">{pct}% of today's plan complete</p>
        </div>
      )}
    </section>
  )
}

/* Pomodoro ring SVG */
export const PomodoroRing = () => {
  const r = 50
  const c = 2 * Math.PI * r   // ≈ 314.16 — full circle
  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg viewBox="0 0 120 120" width="144" height="144" className="-rotate-90" aria-hidden="true">
        {/* Track */}
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke="#f5f5f4"
          strokeWidth="7"
          className="pomodoro-track"
        />
        {/* Progress ring — full = ready to start */}
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={0}
          className="pomodoro-progress"
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#f472b6" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono tabular-nums text-stone-800 leading-none">
          25:00
        </span>
        <span className="text-xs text-stone-400 mt-1.5">not started</span>
      </div>
    </div>
  )
}

/* Focus Session card */
export const FocusSessionCard = ({ onStartFocus, onCreateGoal, activeTask }) => (
  <section
    aria-label="Focus session"
    className="card card-hover p-6 flex flex-col items-center gap-5 text-center relative overflow-hidden min-h-[420px] lg:h-[420px]"
  >
    {/* Ambient rose tint at bottom */}
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(251,113,133,0.08) 0%, transparent 70%)' }}
    />
    {/* Inner top highlight */}
    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-200/50 to-transparent" />

    <div className="flex items-center gap-3 w-full">
      <IconBadge name="timer" bg="bg-rose-50" icon="text-rose-500" badgeSize="w-9 h-9" />
      <div className="text-left">
        <h2 className="text-sm font-semibold text-stone-800">Focus Session</h2>
        <p className="text-xs text-stone-400 mt-0.5">Pomodoro · 25 min</p>
      </div>
    </div>

    <PomodoroRing />

    {/* Next task */}
    {activeTask ? (
      <>
        <div className="w-full px-4 py-3 bg-stone-50/80 rounded-xl border border-stone-100 text-left">
          <p className="label-overline mb-1">Ready to focus</p>
          <p className="text-sm font-medium text-stone-700 leading-snug">{activeTask.title}</p>
          <p className="text-xs text-stone-400 mt-0.5 truncate w-full" title={activeTask.module}>{activeTask.module} · {activeTask.mins} min</p>
        </div>
        <button id="focus-start-btn" className="btn-accent w-full flex items-center justify-center gap-2" onClick={onStartFocus}>
          <StudyIcon name="play" size={14} strokeWidth={2.5} />
          Start session
        </button>
      </>
    ) : (
      <>
        <div className="w-full px-4 py-3 bg-stone-50/80 rounded-xl border border-stone-100 text-left">
          <p className="label-overline mb-1">No focus task yet</p>
          <p className="text-sm font-medium text-stone-700 leading-snug">Create a learning plan to start your first focus session.</p>
        </div>
        <button id="focus-start-btn" className="btn-primary w-full flex items-center justify-center gap-2" onClick={onCreateGoal}>
          <StudyIcon name="plus" size={14} strokeWidth={2.5} />
          Create learning plan
        </button>
      </>
    )}
  </section>
)

/* Study Streak card */
export const StudyStreakCard = ({ user }) => {
  const currentStreak = user?.currentStreak || 0
  const highestStreak = user?.highestStreak || 0
  
  return (
    <section aria-label="Study streak" className="card card-hover p-6 flex flex-col gap-5 relative overflow-hidden h-full">
      {/* Subtle amber warmth glow */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 30% 100%, rgba(251,191,36,0.10) 0%, transparent 70%)' }}
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent" />

      <div className="flex items-center gap-3">
        <IconBadge name="flame" bg="bg-amber-50" icon="text-amber-500" badgeSize="w-9 h-9" />
        <div>
          <h2 className="text-sm font-semibold text-stone-800">Study Streak</h2>
          <p className="text-xs text-stone-400 mt-0.5">Best: {highestStreak} days</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {currentStreak > 0 ? (
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-stone-800 tracking-tight">{currentStreak}</span>
            <span className="text-base font-medium text-stone-500">day streak</span>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-stone-500">Streak tracking will appear after completed focus sessions.</p>
          </div>
        )}
      </div>
    </section>
  )
}

/* Learning Progress card */
export const LearningProgressCard = ({ user, tasks = [], todayTasks = [], onCreateGoal }) => {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'done').length
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const todayTotal = todayTasks.length
  const todayDone = todayTasks.filter(t => t.status === 'done').length
  const todayRemaining = todayTotal - todayDone

  return (
    <section aria-label="Learning progress" className="card card-hover p-6 flex flex-col gap-5 relative overflow-hidden h-full">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent" />

      <div className="flex items-center gap-3">
        <IconBadge name="bar-chart" bg="bg-emerald-50" icon="text-emerald-600" badgeSize="w-9 h-9" />
        <div>
          <h2 className="text-sm font-semibold text-stone-800">Learning Progress</h2>
          <p className="text-xs text-stone-400 mt-0.5">{user?.goal || 'Overall task completion'}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {totalTasks === 0 ? (
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <StudyIcon name="bar-chart" size={18} className="text-emerald-400" />
            </div>
            <p className="text-sm text-stone-500">No learning tasks yet.</p>
            <button onClick={onCreateGoal} className="btn-ghost text-xs px-3 py-1.5">
              <StudyIcon name="plus" size={12} />
              Create a learning plan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-stone-700">All Tasks</span>
                <span className="text-xs text-stone-500 tabular-nums">
                  {completedTasks} / {totalTasks} tasks
                </span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full progress-fill transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="text-xs text-stone-500 mt-2">{progressPercent}% complete</p>
            </div>

            {/* Today stats */}
            {todayTotal > 0 && (
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <StudyIcon name="calendar" size={12} className="text-stone-400" />
                  <span className="text-xs text-stone-500">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge bg-emerald-100 text-emerald-600">
                    <StudyIcon name="check" size={10} strokeWidth={2.5} />
                    {todayDone} done
                  </span>
                  {todayRemaining > 0 && (
                    <span className="badge bg-stone-100 text-stone-500">
                      {todayRemaining} left
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

/* Quick Actions bar */
const QUICK_ACTIONS = [
  {
    id:  'qa-goals',
    icon: 'target',
    label: 'My Goals',
    cls: 'bg-violet-50 text-violet-700 border-violet-100/80 hover:bg-violet-100 hover:border-violet-200',
  },
  {
    id:  'qa-upload',
    icon: 'upload',
    label: 'Upload PDF',
    cls: 'bg-white/80 text-stone-600 border-stone-100 hover:bg-white hover:border-stone-200',
  },
  {
    id:  'qa-kanban',
    icon: 'layers',
    label: 'Open Workspace',
    cls: 'bg-white/80 text-stone-600 border-stone-100 hover:bg-white hover:border-stone-200',
  },
  {
    id:  'qa-availability',
    icon: 'clock',
    label: 'Edit availability',
    cls: 'bg-white/80 text-stone-600 border-stone-100 hover:bg-white hover:border-stone-200',
  },
  {
    id:  'qa-calendar',
    icon: 'calendar',
    label: 'View schedule',
    cls: 'bg-white/80 text-stone-600 border-stone-100 hover:bg-white hover:border-stone-200',
  },
]

export const QuickActionsBar = ({ onOpenGoals, onUploadPdf, onOpenWorkspace, onEditAvailability, onViewSchedule }) => (
  <section aria-label="Quick actions" className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
    <h2 className="label-overline mb-3">Quick Actions</h2>
    <div className="flex flex-wrap gap-2.5">
      {QUICK_ACTIONS.map(a => (
        <button
          key={a.id}
          id={a.id}
          onClick={
            a.id === 'qa-goals' ? onOpenGoals :
            a.id === 'qa-upload' ? onUploadPdf :
            a.id === 'qa-kanban' ? onOpenWorkspace :
            a.id === 'qa-availability' ? onEditAvailability :
            a.id === 'qa-calendar' ? onViewSchedule :
            undefined
          }
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium
                      transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${a.cls}`}
        >
          <StudyIcon name={a.icon} size={14} />
          {a.label}
        </button>
      ))}
    </div>
  </section>
)

export { default as FocusHistoryCard } from './FocusHistoryCard'
