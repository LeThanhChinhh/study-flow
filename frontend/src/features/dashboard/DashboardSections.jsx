import StudyIcon, { IconBadge } from '../../components/StudyIcon'
import {
  MOCK_USER, MOCK_STREAK, MOCK_SESSIONS, MOCK_MODULES,
  getGreeting, TODAY_STR, MODULE_COLORS, ACTIVE_TASK
} from './dashboardData'

/* App navigation */
export const AppNav = ({ user, onLogout }) => (
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
          {user?.goal || MOCK_USER.goal}
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold select-none uppercase shadow-sm ring-2 ring-white"
            aria-label={`${user?.username || MOCK_USER.name}'s avatar`}
          >
            {user?.username ? user.username.charAt(0) : MOCK_USER.initials}
          </div>
          <span className="hidden sm:block text-sm font-medium text-stone-700">
            {user?.username || MOCK_USER.name}
          </span>
        </div>

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
export const GreetingSection = ({ user, onStartFocus, onCreateGoal, remainingTasks = 0, hasActiveTask = true }) => {
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
        {word}, {user?.username || MOCK_USER.name}.
      </h1>

      {/* Sub-line with remaining tasks */}
      <p className="text-stone-500 text-sm mb-6 max-w-md leading-relaxed">
        You have{' '}
        <span className="font-semibold text-stone-700">
          {remainingTasks} {remainingTasks === 1 ? 'task' : 'tasks'}
        </span>{' '}
        remaining today. Keep the momentum going.
      </p>

      {/* Hero CTAs */}
      <div className="flex flex-wrap items-center gap-3">
        <button id="cta-start-focus" className="btn-accent" onClick={onStartFocus}>
          <StudyIcon name="play" size={14} strokeWidth={2.5} />
          {hasActiveTask ? 'Start focus session' : 'Open focus studio'}
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
  return <div className="w-5 h-5 rounded-full border-2 border-stone-200 shrink-0 mt-0.5" />
}

/* Today's Flow card */
export const TodayFlowCard = ({ tasks = [], upcomingTasks = [], isLoading = false, error = null }) => {
  const doneCount = tasks.filter(t => t.status === 'done').length
  const pct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0

  return (
    <section
      aria-label="Today's learning flow"
      className="card card-hover p-6 flex flex-col gap-5 relative overflow-hidden h-full"
    >
      {/* Subtle inner highlight */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/60 to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <IconBadge name="book-open" bg="bg-violet-100" icon="text-violet-600" badgeSize="w-9 h-9" />
          <div>
            <h2 className="text-sm font-semibold text-stone-800">Today's Flow</h2>
            <p className="text-xs text-stone-400 mt-0.5">{TODAY_STR}</p>
          </div>
        </div>
        <span className="badge bg-stone-100 text-stone-500 shrink-0">
          {doneCount} / {tasks.length} done
        </span>
      </div>

      {/* States */}
      <div className="flex-1 flex flex-col justify-center">
        {isLoading && (
          <div className="space-y-4 py-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-stone-100 shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-stone-100 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-stone-50 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <StudyIcon name="alert-circle" size={24} className="text-stone-300 mb-2" />
            <p className="text-sm text-stone-500">{error}</p>
          </div>
        )}

        {!isLoading && !error && tasks.length === 0 && upcomingTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <StudyIcon name="check-circle" size={24} className="text-stone-300 mb-2" />
            <p className="text-sm text-stone-500">No tasks scheduled for today.</p>
          </div>
        )}

        {!isLoading && !error && tasks.length === 0 && upcomingTasks.length > 0 && (
          <div className="flex flex-col w-full">
            <div className="flex flex-col items-center justify-center py-4 text-center mb-2">
              <StudyIcon name="calendar" size={24} className="text-stone-300 mb-2" />
              <p className="text-sm text-stone-500">No tasks scheduled for today.</p>
            </div>
            
            <div className="bg-stone-50/50 rounded-xl p-4 border border-stone-100">
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Upcoming tasks</h3>
              <ul className="space-y-3">
                {upcomingTasks.map(task => (
                  <li key={task.id} className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-stone-700 leading-snug">{task.title}</p>
                    <p className="text-xs text-stone-400">
                      {task.scheduledDate} {task.startTime ? `· ${task.startTime}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!isLoading && !error && tasks.length > 0 && (
          <ul className="space-y-0" role="list">
            {tasks.map((task, idx) => {
              const isLast = idx === tasks.length - 1
              return (
                <li key={task.id} className="flex gap-3">
                  {/* Connector */}
                  <div className="flex flex-col items-center">
                    <TaskDot status={task.status} />
                    {!isLast && <div className="w-px flex-1 mt-1.5 bg-stone-100" />}
                  </div>

                  {/* Row content */}
                  <div className={`task-row ${isLast ? 'pb-0' : 'pb-3'}`}>
                    <div
                      className={`task-row-inner${task.status === 'active' ? ' is-active' : ''}`}
                    >
                      <div className="min-w-0">
                        <p className={`text-sm leading-snug ${
                          task.status === 'done'   ? 'line-through text-stone-400' :
                          task.status === 'active' ? 'text-violet-700 font-semibold' :
                          'text-stone-700 font-medium'
                        }`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {task.module} · {task.mins} min
                        </p>
                      </div>
                      {task.status === 'active' && (
                        <span className="badge bg-violet-100 text-violet-600 shrink-0">In progress</span>
                      )}
                      {task.status === 'done' && (
                        <span className="badge bg-emerald-100 text-emerald-600 shrink-0">Done</span>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-auto pt-5">
        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full progress-fill transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-stone-400 mt-1.5">{pct}% of today's plan complete</p>
      </div>
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
export const FocusSessionCard = ({ onStartFocus, activeTask }) => (
  <section
    aria-label="Focus session"
    className="card card-hover p-6 flex flex-col items-center gap-5 text-center relative overflow-hidden"
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
      <div className="w-full px-4 py-3 bg-stone-50/80 rounded-xl border border-stone-100 text-left">
        <p className="label-overline mb-1">Ready to focus</p>
        <p className="text-sm font-medium text-stone-700 leading-snug">{activeTask.title}</p>
        <p className="text-xs text-stone-400 mt-0.5">{activeTask.module} · {activeTask.mins} min</p>
      </div>
    ) : (
      <div className="w-full px-4 py-3 bg-stone-50/80 rounded-xl border border-stone-100 text-left">
        <p className="label-overline mb-1">No task selected</p>
        <p className="text-sm font-medium text-stone-700 leading-snug">Create or schedule a task to start a guided focus session.</p>
      </div>
    )}

    <button id="focus-start-btn" className="btn-accent w-full justify-center" onClick={onStartFocus}>
      <StudyIcon name="play" size={14} strokeWidth={2.5} />
      Start session
    </button>

    <p className="text-xs text-stone-400">
      {MOCK_SESSIONS.today} session today · {MOCK_SESSIONS.focusMinutesToday} min focused
    </p>
  </section>
)

/* Study Streak card */
export const StudyStreakCard = () => {
  const { current, best, week } = MOCK_STREAK
  const weekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <section aria-label="Study streak" className="card card-hover p-6 flex flex-col gap-5 relative overflow-hidden">
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
          <p className="text-xs text-stone-400 mt-0.5">Best: {best} days</p>
        </div>
      </div>

      {/* Big streak number */}
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-bold text-stone-800 tracking-tight">{current}</span>
        <span className="text-base font-medium text-stone-500">day streak</span>
      </div>

      {/* Week heatmap */}
      <div>
        <p className="label-overline mb-3">This week</p>
        <div className="flex gap-2 items-end" role="list" aria-label="Weekly study days">
          {weekLabels.map((label, i) => (
            <div key={i} role="listitem" className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`streak-bar w-full rounded-lg flex items-center justify-center ${
                  week[i]
                    ? 'h-8 bg-gradient-to-t from-amber-400 to-amber-300 is-done shadow-sm'
                    : 'h-5 bg-stone-100'
                }`}
                aria-label={`${label}: ${week[i] ? 'studied' : 'not studied'}`}
              >
                {week[i] && (
                  <StudyIcon name="flame" size={11} className="text-white/90" strokeWidth={2} />
                )}
              </div>
              <span className={`text-[10px] font-medium ${week[i] ? 'text-amber-500' : 'text-stone-300'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-stone-400 pt-2 border-t border-stone-100">
        Studied {week.filter(Boolean).length} of 7 days this week — great consistency!
      </p>
    </section>
  )
}

/* Learning Progress card */
export const LearningProgressCard = () => (
  <section aria-label="Learning progress" className="card card-hover p-6 flex flex-col gap-5 relative overflow-hidden">
    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent" />

    <div className="flex items-center gap-3">
      <IconBadge name="bar-chart" bg="bg-emerald-50" icon="text-emerald-600" badgeSize="w-9 h-9" />
      <div>
        <h2 className="text-sm font-semibold text-stone-800">Learning Progress</h2>
        <p className="text-xs text-stone-400 mt-0.5">{MOCK_USER.goal}</p>
      </div>
    </div>

    <div className="space-y-5">
      {MOCK_MODULES.map((mod) => {
        const c = MODULE_COLORS[mod.color]
        return (
          <div key={mod.id}>
            <div className="flex items-center justify-between mb-2">
              <span className={`badge ${c.badge}`}>{mod.name}</span>
              <span className="text-xs text-stone-400 tabular-nums">
                {mod.done} / {mod.total} tasks
              </span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${c.bar} rounded-full progress-fill`}
                style={{ width: `${mod.progress}%` }}
                role="progressbar"
                aria-valuenow={mod.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${mod.name}: ${mod.progress}%`}
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">{mod.progress}% complete</p>
          </div>
        )
      })}
    </div>

    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
      <p className="text-xs text-stone-400">
        Overall: {Math.round((8 + 4 + 2) / (12 + 10 + 10) * 100)}% through goal
      </p>
      <button
        className="text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors flex items-center gap-1 hover:gap-1.5"
        aria-label="View all learning progress"
      >
        View all
        <StudyIcon name="chevron-right" size={12} strokeWidth={2.5} />
      </button>
    </div>
  </section>
)

/* Quick Actions bar */
const QUICK_ACTIONS = [
  {
    id:  'qa-upload',
    icon: 'upload',
    label: 'Upload PDF',
    cls: 'bg-violet-50 text-violet-700 border-violet-100/80 hover:bg-violet-100 hover:border-violet-200',
  },
  {
    id:  'qa-kanban',
    icon: 'layers',
    label: 'Open Workspace',
    cls: 'bg-white/80 text-stone-600 border-stone-100 hover:bg-white hover:border-stone-200',
  },
  {
    id:  'qa-notes',
    icon: 'pencil',
    label: 'Review notes',
    cls: 'bg-white/80 text-stone-600 border-stone-100 hover:bg-white hover:border-stone-200',
  },
  {
    id:  'qa-calendar',
    icon: 'calendar',
    label: 'View schedule',
    cls: 'bg-white/80 text-stone-600 border-stone-100 hover:bg-white hover:border-stone-200',
  },
]

export const QuickActionsBar = ({ onUploadPdf, onOpenWorkspace, onReviewNotes, onViewSchedule }) => (
  <section aria-label="Quick actions" className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
    <h2 className="label-overline mb-3">Quick Actions</h2>
    <div className="flex flex-wrap gap-2.5">
      {QUICK_ACTIONS.map(a => (
        <button
          key={a.id}
          id={a.id}
          onClick={
            a.id === 'qa-upload' ? onUploadPdf :
            a.id === 'qa-kanban' ? onOpenWorkspace :
            a.id === 'qa-notes' ? onReviewNotes :
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
