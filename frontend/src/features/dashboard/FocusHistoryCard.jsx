import { useMemo } from 'react'
import StudyIcon, { IconBadge } from '../../components/StudyIcon'

const formatDuration = (mins) => {
  if (!Number.isFinite(mins) || mins < 0) return '0 min'
  if (mins >= 60) {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }
  return `${mins} min`
}

const getStartOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const formatDateTime = (timestamp) => {
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return 'Invalid date'

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  if (isToday) return `Today, ${timeStr}`
  if (isYesterday) return `Yesterday, ${timeStr}`

  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${dateStr}, ${timeStr}`
}

const mapStatusLabel = (status) => {
  if (status === 'COMPLETED') return 'Completed'
  if (status === 'ABORTED') return 'Aborted'
  if (status === 'IN_PROGRESS') return 'In progress'
  return status || 'Unknown'
}

const mapStatusColor = (status) => {
  if (status === 'COMPLETED') return 'bg-emerald-100 text-emerald-600'
  if (status === 'ABORTED') return 'bg-red-100 text-red-600'
  if (status === 'IN_PROGRESS') return 'bg-violet-100 text-violet-600'
  return 'bg-stone-100 text-stone-500'
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const FocusHistoryCard = ({
  logs = [],
  tasks = [],
  isLoading = false,
  error = null,
  onRetry
}) => {
  const { summary, chartData, recentLogs, hasLogs, insight, insightType } = useMemo(() => {
    if (!Array.isArray(logs)) {
      return {
        summary: { totalFocusMinutes: 0, completedSessions: 0, focusedTaskCount: 0 },
        chartData: DAYS.map((d, i) => ({ day: d, fullDay: FULL_DAYS[i], minutes: 0 })),
        recentLogs: [],
        hasLogs: false,
        insight: '',
        insightType: 'neutral'
      }
    }

    const taskMap = new Map(tasks.map(t => [t.id, t.title]))

    const now = new Date()
    const startOfWeek = getStartOfWeek(now)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 7)

    const startOfLastWeek = new Date(startOfWeek)
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

    let totalMins = 0
    let completedCountThisWeek = 0
    let completedCountLastWeek = 0
    const uniqueTasks = new Set()

    const weekChart = DAYS.map((d, i) => ({ day: d, fullDay: FULL_DAYS[i], minutes: 0 }))

    const mappedLogs = logs
      .filter(log => log.status === 'COMPLETED')
      .map(log => {
        const ts = log.endTime || log.startTime || log.createdAt
        return {
          ...log,
          timestamp: ts ? new Date(ts).getTime() : 0,
          taskTitle: taskMap.get(log.taskId) || (log.taskId ? 'Deleted task' : 'Study session')
        }
      })
      .filter(log => log.timestamp > 0)

    // Deduplicate by clientSessionId, fallback to id
    const dedupedMap = new Map()
    for (const log of mappedLogs) {
      const key = log.clientSessionId || log.id
      if (!dedupedMap.has(key)) {
        dedupedMap.set(key, log)
      } else {
        // Keep the newest timestamp if duplicate
        if (log.timestamp > dedupedMap.get(key).timestamp) {
          dedupedMap.set(key, log)
        }
      }
    }

    const validLogs = Array.from(dedupedMap.values()).sort((a, b) => {
      if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
      return (b.id || '').localeCompare(a.id || '');
    });

    for (const log of validLogs) {
      const focusMins = Number.isFinite(log.focusMinutes) && log.focusMinutes > 0 ? log.focusMinutes : 0

      // This week
      if (log.timestamp >= startOfWeek.getTime() && log.timestamp < endOfWeek.getTime()) {
        completedCountThisWeek++
        totalMins += focusMins
        if (log.taskId) {
          uniqueTasks.add(log.taskId)
        }
        const logDate = new Date(log.timestamp)
        const dayIndex = (logDate.getDay() + 6) % 7 // Mon=0, Sun=6
        weekChart[dayIndex].minutes += focusMins
      }

      // Last week
      if (log.timestamp >= startOfLastWeek.getTime() && log.timestamp < startOfWeek.getTime()) {
        completedCountLastWeek++
      }
    }

    const recent = validLogs.slice(0, 5)

    let insightText = 'Same rhythm as last week'
    let type = 'neutral'
    const diff = completedCountThisWeek - completedCountLastWeek
    if (diff > 0) {
      insightText = `${diff} more session${diff > 1 ? 's' : ''} than last week`
      type = 'up'
    } else if (diff < 0) {
      insightText = `${Math.abs(diff)} fewer session${Math.abs(diff) > 1 ? 's' : ''} than last week`
      type = 'down'
    }

    return {
      summary: {
        totalFocusMinutes: totalMins,
        completedSessions: completedCountThisWeek,
        focusedTaskCount: uniqueTasks.size
      },
      chartData: weekChart,
      recentLogs: recent,
      hasLogs: validLogs.length > 0,
      insight: insightText,
      insightType: type
    }
  }, [logs, tasks])

  const maxChartMins = useMemo(() => {
    const max = Math.max(...chartData.map(d => d.minutes))
    return max > 0 ? max : 60 // fallback scale if all 0
  }, [chartData])

  const getInsightStyle = (type) => {
    if (type === 'up') return { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'flame' }
    if (type === 'down') return { bg: 'bg-rose-50', text: 'text-rose-700', icon: 'alert-circle' }
    return { bg: 'bg-stone-100', text: 'text-stone-600', icon: 'check' }
  }
  const insightStyle = getInsightStyle(insightType)

  return (
    <section className="card card-hover p-6 relative overflow-hidden flex flex-col gap-6">

      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 100% 0%, rgba(139,92,246,0.03) 0%, transparent 60%)' }}
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/50 to-transparent" />


      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <IconBadge name="timer" bg="bg-violet-50" icon="text-violet-600" badgeSize="w-9 h-9" />
          <div>
            <h2 className="text-sm font-semibold text-stone-800">Focus History</h2>
            <p className="text-xs text-stone-400 mt-0.5">Your study rhythm over the last 7 days</p>
          </div>
        </div>
        {!isLoading && !error && hasLogs && (
          <span className="badge bg-violet-100 text-violet-700 font-medium shrink-0">
            {summary.completedSessions} sessions this week
          </span>
        )}
      </div>

      {isLoading && (
        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
             {[1, 2, 3].map(i => (
               <div key={i} className="p-3.5 rounded-xl bg-stone-50/50 border border-stone-100 animate-pulse">
                  <div className="h-3 w-16 bg-stone-100 rounded mb-3" />
                  <div className="h-6 w-20 bg-stone-200 rounded" />
               </div>
             ))}
          </div>
          <div className="h-32 bg-stone-50/50 rounded-xl border border-stone-100 animate-pulse" />
          <div className="space-y-3 mt-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="flex gap-3 bg-stone-50/30 p-3 rounded-xl border border-stone-100/50 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-stone-100" />
                  <div className="flex-1">
                    <div className="h-4 w-1/3 bg-stone-200 rounded mb-2" />
                    <div className="h-3 w-1/4 bg-stone-100 rounded" />
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center text-center py-10 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
            <StudyIcon name="alert-circle" size={24} className="text-red-400" />
          </div>
          <p className="text-sm font-semibold text-stone-700 mb-1">{error}</p>
          {onRetry && (
            <button onClick={onRetry} className="btn-ghost text-xs px-4 py-2 mt-2">
              <StudyIcon name="refresh-cw" size={12} />
              Retry
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && !hasLogs && (
        <div className="flex flex-col items-center justify-center text-center py-10 relative z-10">
           <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mb-3">
              <StudyIcon name="timer" size={24} className="text-stone-300" />
           </div>
           <p className="text-sm font-semibold text-stone-700 mb-1">No focus sessions yet</p>
           <p className="text-xs text-stone-400">Complete a focus session to see your study history here.</p>
        </div>
      )}

      {!isLoading && !error && hasLogs && (
        <div className="flex flex-col gap-6 relative z-10">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-violet-50/60 border border-violet-100/60 flex flex-col justify-center relative">
              <div className="absolute top-3 right-3 text-violet-300">
                <StudyIcon name="clock" size={14} />
              </div>
              <p className="text-xs text-violet-500/80 font-semibold uppercase tracking-wider mb-1">Focused time</p>
              <p className="text-xl font-bold text-violet-700 tracking-tight">
                {formatDuration(summary.totalFocusMinutes)}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100/80 flex flex-col justify-center relative">
              <div className="absolute top-3 right-3 text-stone-300">
                <StudyIcon name="check-circle" size={14} />
              </div>
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-1">Sessions</p>
              <p className="text-xl font-bold text-stone-700">{summary.completedSessions}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100/80 flex flex-col justify-center relative">
              <div className="absolute top-3 right-3 text-stone-300">
                <StudyIcon name="layers" size={14} />
              </div>
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-1">Focused tasks</p>
              <p className="text-xl font-bold text-stone-700">{summary.focusedTaskCount}</p>
            </div>
          </div>


          <div className="bg-stone-50/50 rounded-xl border border-stone-100/80 p-5 relative overflow-hidden">

            <div className="absolute inset-x-5 top-8 border-t border-dashed border-stone-200" />
            <div className="absolute inset-x-5 top-[4.5rem] border-t border-dashed border-stone-200" />

            <div className="flex items-end justify-between h-24 gap-2 mb-4 relative z-10">
              {chartData.map(d => {
                const heightPct = Math.max(0, (d.minutes / maxChartMins) * 100)
                const isZero = d.minutes === 0
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group relative">
                    <div
                      className={`w-full max-w-[28px] transition-all duration-300 ${isZero ? 'rounded-sm bg-stone-100' : 'rounded-t-md bg-violet-400/85 group-hover:bg-violet-500'}`}
                      style={{ height: isZero ? '6px' : `${heightPct}%`, minHeight: isZero ? '6px' : '12px' }}
                      title={`${d.fullDay}: ${formatDuration(d.minutes)}`}
                    />
                    <span className={`text-[10px] font-medium ${isZero ? 'text-stone-300' : 'text-stone-500'}`}>
                      {d.day}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-stone-100/60">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${insightStyle.bg} ${insightStyle.text}`}>
                <StudyIcon name={insightStyle.icon} size={12} strokeWidth={2.5} />
                <span className="text-xs font-semibold">{insight}</span>
              </div>
            </div>
          </div>


          <div>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3 px-1">Recent sessions</h3>
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-stone-100 hover:bg-violet-50/40 hover:border-violet-200 hover:shadow-sm transition-all group">
                  <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center shrink-0 text-violet-500">
                    <StudyIcon name="timer" size={14} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-700 truncate" title={log.taskTitle}>
                      {log.taskTitle}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5 truncate">
                      {formatDateTime(log.timestamp)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-md">
                      {formatDuration(log.focusMinutes)}
                    </span>
                    <span className={`badge ${mapStatusColor(log.status)}`}>
                      {mapStatusLabel(log.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default FocusHistoryCard
