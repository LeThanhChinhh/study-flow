//  Date / time helpers 

export const formatTime12Hour = (time) => {
  if (!time) return ''
  const [hourRaw, minute = '00'] = time.split(':')
  const hour = Number(hourRaw)
  if (Number.isNaN(hour)) return time
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minute} ${period}`
}

export const formatLocalDate = () => {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const getDayOfWeekForDate = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00`)
  const day = date.getDay()
  return day === 0 ? 7 : day
}

export const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export const getCurrentMinutes = () => {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

const padTime = (value) => String(value).padStart(2, '0')

export const getNextHourSlot = () => {
  const now = new Date()
  const nextHour = Math.min(now.getHours() + 1, 23)
  const endHour = Math.min(nextHour + 1, 23)
  return {
    startTime: `${padTime(nextHour)}:00`,
    endTime: `${padTime(endHour)}:00`,
  }
}

const addDays = (date, days) => {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

const toLocalDateString = (date) => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const getMatchingDatesForSlot = (startDate, deadline, dayOfWeek) => {
  const dates = []
  let cursor = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${deadline}T00:00:00`)
  const targetDay = Number(dayOfWeek)

  while (cursor <= end) {
    const dateStr = toLocalDateString(cursor)
    if (getDayOfWeekForDate(dateStr) === targetDay) {
      dates.push(dateStr)
    }
    cursor = addDays(cursor, 1)
  }

  return dates
}

export const hasFutureOccurrenceForSlot = (matchingDates, startTime) => {
  const today = formatLocalDate()
  const currentMinutes = getCurrentMinutes()
  const startMinutes = timeToMinutes(startTime)

  return matchingDates.some((dateStr) => {
    if (dateStr > today) return true
    if (dateStr === today && startMinutes > currentMinutes) return true
    return false
  })
}

export const getSuggestedDayOfWeekForGoal = (startDate, deadline) => {
  const today = formatLocalDate()
  const effectiveStart = startDate < today ? today : startDate
  if (effectiveStart > deadline) return getDayOfWeekForDate(startDate)
  return getDayOfWeekForDate(effectiveStart)
}

//  Editable-plan helpers 

/**
 * Deep-clone rawJson into a local editable plan structure.
 * Each module and task gets a stable `_id` (index-based) so React keys remain
 * stable during edits.
 */
export const clonePlan = (rawJson) => {
  if (!rawJson || !Array.isArray(rawJson.modules)) return { modules: [] }
  return {
    modules: rawJson.modules.map((mod, mIdx) => ({
      _id: mIdx,
      title: mod.title || `Module ${mIdx + 1}`,
      tasks: Array.isArray(mod.tasks)
        ? mod.tasks.map((task, tIdx) => ({
            _id: `${mIdx}-${tIdx}`,
            title: task.title || '',
            estimatedMinutes: task.estimatedMinutes ?? 25,
          }))
        : [],
    })),
  }
}

/**
 * Validate the local editable plan before calling generateSchedule.
 * Returns an array of error strings (empty array = valid).
 */
export const validateEditablePlan = (plan) => {
  const errors = []
  if (!plan || !Array.isArray(plan.modules) || plan.modules.length === 0) {
    errors.push('Plan must have at least 1 module.')
    return errors
  }
  const hasTasks = plan.modules.some(
    (m) => Array.isArray(m.tasks) && m.tasks.length > 0,
  )
  if (!hasTasks) errors.push('Plan must have at least 1 task across all modules.')
  plan.modules.forEach((mod, mIdx) => {
    if (!mod.title || !mod.title.trim()) {
      errors.push(`Module ${mIdx + 1}: Title must not be empty.`)
    }
    if (!Array.isArray(mod.tasks) || mod.tasks.length === 0) return
    mod.tasks.forEach((task, tIdx) => {
      if (!task.title || !task.title.trim()) {
        errors.push(`Module ${mIdx + 1} › Task ${tIdx + 1}: Title must not be empty.`)
      }
      const mins = Number(task.estimatedMinutes)
      if (Number.isNaN(mins) || mins < 5 || mins > 180) {
        errors.push(
          `Module ${mIdx + 1} › Task ${tIdx + 1}: Duration must be between 5 and 180 minutes.`,
        )
      }
    })
  })
  return errors
}

export const buildPlanningDataPayload = (plan) => ({
  modules: plan.modules.map((mod, mIdx) => ({
    title: mod.title.trim(),
    orderIndex: mIdx,
    tasks: mod.tasks.map((task, tIdx) => ({
      title: task.title.trim(),
      estimatedMinutes: Number(task.estimatedMinutes),
      orderIndex: tIdx,
    })),
  })),
})
