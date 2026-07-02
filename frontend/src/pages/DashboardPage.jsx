import { Link, useNavigate } from 'react-router-dom'
import StudyIcon, { IconBadge } from '../components/StudyIcon'
import { useAuth } from '../auth/AuthContext'

/* MOCK DATA */
const MOCK_USER        = { name: 'Alex', initials: 'A', goal: 'CS Fundamentals' }
const MOCK_STREAK      = { current: 5, best: 12, week: [true, true, true, true, true, false, false] }
const MOCK_SESSIONS    = { today: 1, focusMinutesToday: 25 }

const MOCK_TASKS = [
  { id: 1, title: 'Chapter 3 — Sorting Algorithms', status: 'done',    module: 'Data Structures', mins: 25 },
  { id: 2, title: 'Problem Set 2: Binary Trees',    status: 'active',  module: 'Algorithms',      mins: 25 },
  { id: 3, title: 'Review Lecture Notes',           status: 'pending', module: 'Data Structures', mins: 25 },
  { id: 4, title: 'Practice Graph Problems',        status: 'pending', module: 'Advanced Topics', mins: 50 },
]

const MOCK_MODULES = [
  { id: 1, name: 'Data Structures',     done: 8,  total: 12, progress: 68, color: 'violet'  },
  { id: 2, name: 'Algorithms',          done: 4,  total: 10, progress: 42, color: 'amber'   },
  { id: 3, name: 'Dynamic Programming', done: 2,  total: 10, progress: 20, color: 'emerald' },
]

/*  helper: time-of-day greeting */
const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return { word: 'Good morning',  icon: 'sun'  }
  if (h < 17) return { word: 'Good afternoon', icon: 'sun'  }
  return            { word: 'Good evening',   icon: 'moon' }
}

const TODAY_STR = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})

/*  color maps  */
const MODULE_COLORS = {
  violet:  { bar: 'bg-violet-500', bg: 'bg-violet-50',  text: 'text-violet-700',  badge: 'bg-violet-100 text-violet-700'  },
  amber:   { bar: 'bg-amber-500',  bg: 'bg-amber-50',   text: 'text-amber-700',   badge: 'bg-amber-100 text-amber-700'   },
  emerald: { bar: 'bg-emerald-500',bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
}

const REMAINING_TASKS = MOCK_TASKS.filter((t) => t.status !== 'done').length
const ACTIVE_TASK     = MOCK_TASKS.find((t) => t.status === 'active')

/*SUB-COMPONENTS*/

/*  App navigation  */
const AppNav = ({ user, onLogout }) => (
  <nav id="dashboard-nav" className="bg-white border-b border-stone-100 sticky top-0 z-20">
    <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">

      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
          <StudyIcon name="layers" size={16} className="text-white" />
        </div>
        <span className="text-stone-800 text-base font-bold">StudyFlow</span>
      </div>

      {/* Current goal chip */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 rounded-full border border-violet-100">
        <StudyIcon name="target" size={13} className="text-violet-500" />
        <span className="text-xs font-medium text-violet-700">{user?.goal || MOCK_USER.goal}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pl-3 border-l border-stone-100">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold select-none uppercase"
            aria-label={`${user?.username || MOCK_USER.name}'s avatar`}
          >
            {user?.username ? user.username.charAt(0) : MOCK_USER.initials}
          </div>
          <span className="hidden sm:block text-sm font-medium text-stone-700">
            {user?.username || MOCK_USER.name}
          </span>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors"
          aria-label="Sign out"
        >
          <StudyIcon name="log-out" size={14} />
          <span className="hidden sm:block">Sign out</span>
        </button>
      </div>
    </div>
  </nav>
)

/*  Greeting section  */
const GreetingSection = ({ user }) => {
  const { word, icon } = getGreeting()
  return (
    <header className="mb-8 animate-slide-up">
      <div className="flex items-center gap-2 mb-1">
        <StudyIcon name={icon} size={18} className="text-amber-400" strokeWidth={1.5} />
        <p className="text-sm text-stone-500 font-medium">{TODAY_STR}</p>
      </div>
      <h1 className="text-3xl font-bold text-stone-800 tracking-tight mb-1.5">
        {word}, {user?.username || MOCK_USER.name}.
      </h1>
      <p className="text-stone-500 text-sm mb-6">
        {REMAINING_TASKS} {REMAINING_TASKS === 1 ? 'task' : 'tasks'} left today.
        {' '}Keep the momentum going.
      </p>
      {/* Hero CTAs */}
      <div className="flex flex-wrap items-center gap-3">
        <button id="cta-start-focus" className="btn-accent">
          <StudyIcon name="play" size={15} strokeWidth={2.5} />
          Start focus session
        </button>
        <button id="cta-new-goal" className="btn-ghost">
          <StudyIcon name="plus" size={15} />
          New learning goal
        </button>
      </div>
    </header>
  )
}

/*  Task status dot (reused in timeline)  */
const TaskDot = ({ status }) => {
  if (status === 'done') return (
    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
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

/*  Today's Flow card  */
const TodayFlowCard = () => {
  const doneCount = MOCK_TASKS.filter((t) => t.status === 'done').length

  return (
    <section aria-label="Today's learning flow" className="card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <IconBadge name="book-open" bg="bg-violet-100" icon="text-violet-600" badgeSize="w-9 h-9" />
          <div>
            <h2 className="text-sm font-semibold text-stone-800">Today's Flow</h2>
            <p className="text-xs text-stone-400 mt-0.5">{TODAY_STR}</p>
          </div>
        </div>
        <span className="badge bg-stone-100 text-stone-500">
          {doneCount} / {MOCK_TASKS.length} done
        </span>
      </div>

      {/* Task timeline */}
      <ul className="space-y-0" role="list">
        {MOCK_TASKS.map((task, idx) => {
          const isLast = idx === MOCK_TASKS.length - 1
          return (
            <li key={task.id} className="flex gap-3">
              {/* Connector */}
              <div className="flex flex-col items-center">
                <TaskDot status={task.status} />
                {!isLast && <div className="w-px flex-1 mt-1.5 bg-stone-100" />}
              </div>
              {/* Row content */}
              <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-3'}`}>
                <div className={`flex items-start justify-between gap-2 px-3 py-2 rounded-xl ${
                  task.status === 'active' ? 'bg-violet-50' : ''
                }`}>
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
                    <span className="badge bg-violet-100 text-violet-600 shrink-0">
                      In progress
                    </span>
                  )}
                  {task.status === 'done' && (
                    <span className="badge bg-emerald-100 text-emerald-600 shrink-0">
                      Done
                    </span>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Total progress bar */}
      <div>
        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all"
            style={{ width: `${(MOCK_TASKS.filter(t => t.status === 'done').length / MOCK_TASKS.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-stone-400 mt-1.5">
          {Math.round((MOCK_TASKS.filter(t => t.status === 'done').length / MOCK_TASKS.length) * 100)}% of today's plan complete
        </p>
      </div>
    </section>
  )
}

/*  Pomodoro ring SVG */
const PomodoroRing = () => {
  const r = 50
  const c = 2 * Math.PI * r  // ≈ 314.16 — full circle
  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg viewBox="0 0 120 120" width="144" height="144" className="-rotate-90" aria-hidden="true">
        {/* Track */}
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f5f5f4" strokeWidth="8" />
        {/* Progress — full = ready to start */}
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke="#fb7185"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={0}
        />
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

/*  Focus Session card  */
const FocusSessionCard = () => (
  <section aria-label="Focus session" className="card p-6 flex flex-col items-center gap-5 text-center">
    <div className="flex items-center gap-3 w-full">
      <IconBadge name="timer" bg="bg-rose-50" icon="text-rose-500" badgeSize="w-9 h-9" />
      <div className="text-left">
        <h2 className="text-sm font-semibold text-stone-800">Focus Session</h2>
        <p className="text-xs text-stone-400 mt-0.5">Pomodoro · 25 min</p>
      </div>
    </div>

    <PomodoroRing />

    {/* Next task */}
    {ACTIVE_TASK && (
      <div className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-100 text-left">
        <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wider mb-1">
          Ready to focus
        </p>
        <p className="text-sm font-medium text-stone-700 leading-snug">{ACTIVE_TASK.title}</p>
        <p className="text-xs text-stone-400 mt-0.5">{ACTIVE_TASK.module} · {ACTIVE_TASK.mins} min</p>
      </div>
    )}

    <button id="focus-start-btn" className="btn-accent w-full justify-center">
      <StudyIcon name="play" size={15} strokeWidth={2.5} />
      Start session
    </button>

    <p className="text-xs text-stone-400">
      {MOCK_SESSIONS.today} session today · {MOCK_SESSIONS.focusMinutesToday} min focused
    </p>
  </section>
)

/*  Study Streak card */
const StudyStreakCard = () => {
  const { current, best, week } = MOCK_STREAK
  const weekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <section aria-label="Study streak" className="card p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <IconBadge name="flame" bg="bg-amber-50" icon="text-amber-500" badgeSize="w-9 h-9" />
        <div>
          <h2 className="text-sm font-semibold text-stone-800">Study Streak</h2>
          <p className="text-xs text-stone-400 mt-0.5">Best: {best} days</p>
        </div>
      </div>

      {/* Big number */}
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-bold text-stone-800 tracking-tight">{current}</span>
        <span className="text-base font-medium text-stone-500">days</span>
      </div>

      {/* Week heatmap */}
      <div>
        <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wider mb-3">
          This week
        </p>
        <div className="flex gap-2 items-end">
          {weekLabels.map((label, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <div className={`w-full rounded-lg flex items-center justify-center ${
                week[i]
                  ? 'h-8 bg-amber-400'
                  : 'h-6 bg-stone-100'
              }`}>
                {week[i] && (
                  <StudyIcon name="flame" size={12} className="text-white" strokeWidth={2} />
                )}
              </div>
              <span className="text-[10px] text-stone-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-stone-400 pt-1 border-t border-stone-100">
        You studied {week.filter(Boolean).length} of 7 days this week. Great work!
      </p>
    </section>
  )
}

/*  Learning Progress card  */
const LearningProgressCard = () => (
  <section aria-label="Learning progress" className="card p-6 flex flex-col gap-5">
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
              <div className="flex items-center gap-2">
                <span className={`badge ${c.badge}`}>{mod.name}</span>
              </div>
              <span className="text-xs text-stone-400 tabular-nums">
                {mod.done} / {mod.total} tasks
              </span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${c.bar} rounded-full transition-all duration-500`}
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
      <p className="text-xs text-stone-400">Overall: {Math.round((8+4+2)/(12+10+10)*100)}% through goal</p>
      <button className="text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors flex items-center gap-1">
        View all
        <StudyIcon name="chevron-right" size={13} strokeWidth={2.5} />
      </button>
    </div>
  </section>
)

/*  Quick Actions bar  */
const QuickActionsBar = () => (
  <section aria-label="Quick actions" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
    <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
      Quick Actions
    </h2>
    <div className="flex flex-wrap gap-3">
      {[
        { id: 'qa-upload',   icon: 'upload',    label: 'Upload PDF',        cls: 'bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100' },
        { id: 'qa-kanban',   icon: 'layers',    label: 'Open Workspace',    cls: 'bg-stone-50  text-stone-600  border-stone-100  hover:bg-stone-100'  },
        { id: 'qa-notes',    icon: 'pencil',    label: 'Review my notes',   cls: 'bg-stone-50  text-stone-600  border-stone-100  hover:bg-stone-100'  },
        { id: 'qa-calendar', icon: 'calendar',  label: 'View schedule',     cls: 'bg-stone-50  text-stone-600  border-stone-100  hover:bg-stone-100'  },
      ].map((a) => (
        <button
          key={a.id}
          id={a.id}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${a.cls}`}
        >
          <StudyIcon name={a.icon} size={15} />
          {a.label}
        </button>
      ))}
    </div>
  </section>
)

/* PAGE */
const DashboardPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <AppNav user={user} onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <GreetingSection user={user} />

      {/* Row 1 — Today's Flow + Focus Session */}
      <div
        className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-fade-in"
        style={{ animationDelay: '0.1s' }}
      >
        <div className="lg:col-span-3"><TodayFlowCard /></div>
        <div className="lg:col-span-2"><FocusSessionCard /></div>
      </div>

      {/* Row 2 — Streak + Progress */}
      <div
        className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-fade-in"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="lg:col-span-2"><StudyStreakCard /></div>
        <div className="lg:col-span-3"><LearningProgressCard /></div>
      </div>

      {/* Quick actions */}
      <QuickActionsBar />
    </main>

    <footer className="max-w-6xl mx-auto px-6 py-8">
      <div className="border-t border-stone-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-stone-400">© 2026 StudyFlow</p>
        <p className="text-xs text-stone-300">v0.1.0</p>
      </div>
      </footer>
    </div>
  )
}

export default DashboardPage
