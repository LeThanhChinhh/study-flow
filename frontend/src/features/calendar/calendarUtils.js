/**
 * calendarUtils.js
 * Pure date helpers for CalendarWeekView.
 * All functions use getFullYear/getMonth/getDate to avoid UTC timezone shift.
 */

/**
 * Format a Date object to YYYY-MM-DD using local time.
 * @param {Date} date
 * @returns {string}
 */
export const formatLocalDate = (date) => {
  const yyyy = date.getFullYear()
  const mm   = String(date.getMonth() + 1).padStart(2, '0')
  const dd   = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Return the Monday of the week containing `date`.
 * getDay() returns 0=Sun … 6=Sat; we shift so Monday=0.
 * @param {Date} date
 * @returns {Date}
 */
export const getStartOfWeek = (date) => {
  const d    = new Date(date)
  const day  = d.getDay()           // 0=Sun, 1=Mon … 6=Sat
  const diff = (day === 0) ? -6 : 1 - day  // shift to Monday
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Add `n` days to `date` (non-mutating).
 * @param {Date} date
 * @param {number} n
 * @returns {Date}
 */
export const addDays = (date, n) => {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

/**
 * Return an array of 7 Date objects: Mon → Sun for the week containing `date`.
 * @param {Date} date
 * @returns {Date[]}
 */
export const getWeekDays = (date) => {
  const monday = getStartOfWeek(date)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

/**
 * Group an array of raw task objects by their `scheduledDate` (YYYY-MM-DD).
 * Tasks without a scheduledDate are put into the "unscheduled" bucket.
 *
 * @param {Object[]} tasks  - raw tasks from getTasks()
 * @returns {{ byDate: Object.<string, Object[]>, unscheduled: Object[] }}
 */
export const groupTasksByDate = (tasks) => {
  const byDate     = {}
  const unscheduled = []

  for (const task of tasks) {
    if (task.scheduledDate) {
      if (!byDate[task.scheduledDate]) byDate[task.scheduledDate] = []
      byDate[task.scheduledDate].push(task)
    } else {
      unscheduled.push(task)
    }
  }

  return { byDate, unscheduled }
}

/**
 * Sort tasks for calendar display: by startTime first, then orderIndex.
 * Tasks without startTime are sorted to the end (by orderIndex only).
 * @param {Object[]} tasks
 * @returns {Object[]}
 */
export const sortTasksForCalendar = (tasks) => {
  return [...tasks].sort((a, b) => {
    if (a.startTime && b.startTime) {
      const cmp = a.startTime.localeCompare(b.startTime)
      if (cmp !== 0) return cmp
    } else if (a.startTime) {
      return -1 // a has startTime, b doesn't → a first
    } else if (b.startTime) {
      return 1  // b has startTime, a doesn't → b first
    }
    return (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  })
}

/**
 * Format a time string "HH:MM" → "h:MM AM/PM" for display.
 * Returns empty string if input is falsy.
 * @param {string|null} timeStr
 * @returns {string}
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return ''
  try {
    const [hStr, mStr] = timeStr.split(':')
    const h = parseInt(hStr, 10)
    const m = mStr || '00'
    const period = h >= 12 ? 'PM' : 'AM'
    const h12    = h % 12 === 0 ? 12 : h % 12
    return `${h12}:${m} ${period}`
  } catch {
    return timeStr
  }
}

/**
 * Short weekday names, Mon-indexed (index 0 = Monday).
 */
export const WEEK_DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/**
 * Full weekday names, Mon-indexed (index 0 = Monday).
 */
export const WEEK_DAY_NAMES_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/**
 * Short month names (Jan, Feb … Dec).
 */
export const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
