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

const formatLocalDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const shiftLocalDateKey = (dateKey, days) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return formatLocalDateKey(date)
}

/**
 * Calculates study streaks from completed Pomodoro logs.
 *
 * MVP rule: one or more completed focus sessions in a local calendar day counts
 * as one study day. A streak remains active when the latest study day is today
 * or yesterday, so users have the full current day to continue it.
 */
export const calculateStudyStreak = (logs = [], now = new Date()) => {
  const studyDays = new Set()

  for (const log of Array.isArray(logs) ? logs : []) {
    if (log?.status !== 'COMPLETED' || Number(log?.focusMinutes) <= 0) continue

    const timestamp = log.endTime || log.startTime || log.createdAt
    if (!timestamp) continue

    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) continue

    studyDays.add(formatLocalDateKey(date))
  }

  if (studyDays.size === 0) {
    return {
      currentStreak: 0,
      highestStreak: 0,
      studiedToday: false,
      totalStudyDays: 0,
    }
  }

  const sortedDays = Array.from(studyDays).sort()
  let highestStreak = 1
  let runningStreak = 1

  for (let index = 1; index < sortedDays.length; index += 1) {
    const previousDay = sortedDays[index - 1]
    const currentDay = sortedDays[index]

    if (currentDay === shiftLocalDateKey(previousDay, 1)) {
      runningStreak += 1
      highestStreak = Math.max(highestStreak, runningStreak)
    } else {
      runningStreak = 1
    }
  }

  const todayKey = formatLocalDateKey(now)
  const yesterdayKey = shiftLocalDateKey(todayKey, -1)
  const latestStudyDay = sortedDays[sortedDays.length - 1]
  const studiedToday = studyDays.has(todayKey)

  let currentStreak = 0
  if (latestStudyDay === todayKey || latestStudyDay === yesterdayKey) {
    currentStreak = 1
    let cursor = latestStudyDay

    while (studyDays.has(shiftLocalDateKey(cursor, -1))) {
      currentStreak += 1
      cursor = shiftLocalDateKey(cursor, -1)
    }
  }

  return {
    currentStreak,
    highestStreak,
    studiedToday,
    totalStudyDays: studyDays.size,
  }
}
