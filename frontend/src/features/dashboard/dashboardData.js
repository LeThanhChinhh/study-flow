export const MOCK_USER     = { name: 'Alex', initials: 'A', goal: 'CS Fundamentals' }
export const MOCK_STREAK   = { current: 5, best: 12, week: [true, true, true, true, true, false, false] }
export const MOCK_SESSIONS = { today: 1, focusMinutesToday: 25 }

export const MOCK_TASKS = [
  { id: 1, title: 'Chapter 3 — Sorting Algorithms', status: 'done',    module: 'Data Structures', mins: 25 },
  { id: 2, title: 'Problem Set 2: Binary Trees',    status: 'active',  module: 'Algorithms',      mins: 25 },
  { id: 3, title: 'Review Lecture Notes',           status: 'pending', module: 'Data Structures', mins: 25 },
  { id: 4, title: 'Practice Graph Problems',        status: 'pending', module: 'Advanced Topics', mins: 50 },
]

export const MOCK_MODULES = [
  { id: 1, name: 'Data Structures',     done: 8,  total: 12, progress: 68, color: 'violet'  },
  { id: 2, name: 'Algorithms',          done: 4,  total: 10, progress: 42, color: 'amber'   },
  { id: 3, name: 'Dynamic Programming', done: 2,  total: 10, progress: 20, color: 'emerald' },
]

export const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return { word: 'Good morning',  icon: 'sun'  }
  if (h < 17) return { word: 'Good afternoon', icon: 'sun'  }
  return            { word: 'Good evening',   icon: 'moon' }
}

export const TODAY_STR = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})

export const MODULE_COLORS = {
  violet:  { bar: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700' },
  amber:   { bar: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700'   },
  emerald: { bar: 'bg-emerald-500',badge: 'bg-emerald-100 text-emerald-700' },
}

export const REMAINING_TASKS = MOCK_TASKS.filter(t => t.status !== 'done').length
export const ACTIVE_TASK     = MOCK_TASKS.find(t => t.status === 'active')
