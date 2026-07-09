import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StudyIcon from '../../components/StudyIcon'
import { updateTask } from '../../api/taskApi'

/**
 * Status display config for the modal — aligns with CalendarTaskCard STATUS_CONFIG.
 */
const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    dot: 'bg-violet-300',
    badge: 'bg-violet-50 text-violet-600 border border-violet-100',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    dot: 'bg-violet-500 animate-pulse',
    badge: 'bg-violet-100 text-violet-700 border border-violet-200',
  },
  COMPLETED: {
    label: 'Completed',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  },
}

const getStatusCfg = (status) => STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING

/** Format "HH:mm" → "h:mm AM/PM" */
const fmt12 = (t) => {
  if (!t) return null
  const [hRaw, m = '00'] = t.split(':')
  const h = Number(hRaw)
  if (Number.isNaN(h)) return t
  const period = h >= 12 ? 'PM' : 'AM'
  const display = h % 12 || 12
  return `${display}:${m} ${period}`
}

/** Format "YYYY-MM-DD" → "Mon, Jan 1 2026" */
const fmtDate = (d) => {
  if (!d) return null
  const date = new Date(`${d}T00:00:00`)
  return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * CalendarTaskDetailModal
 *
 * Props:
 *   task          — task object currently selected (null → modal closed)
 *   onClose       — callback to close the modal
 *   onTaskUpdated — callback(updatedTask) after a successful status change
 */
const CalendarTaskDetailModal = ({ task, onClose, onTaskUpdated }) => {
  const navigate = useNavigate()
  const [actionLoading, setActionLoading] = useState(null) // 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | null
  const [actionError, setActionError] = useState(null)

  /* ── Escape key closes modal ────────────────────────────────────────────── */

  useEffect(() => {
    if (!task) return undefined

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [task, onClose])

  if (!task) return null

  const cfg = getStatusCfg(task.status)
  const timeRange =
    task.startTime && task.endTime
      ? `${fmt12(task.startTime)} – ${fmt12(task.endTime)}`
      : task.startTime
      ? fmt12(task.startTime)
      : null

  /* ── Status update ─────────────────────────────────────────────────────── */

  const handleStatusUpdate = async (newStatus) => {
    if (!task.id) return
    if (task.status === newStatus) return // no-op
    setActionLoading(newStatus)
    setActionError(null)
    try {
      const updated = await updateTask(task.id, { status: newStatus })
      onTaskUpdated?.(updated)
    } catch (err) {
      console.error('[CalendarTaskDetailModal] status update failed:', err)
      setActionError('Could not update status. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  /* ── Start Focus ───────────────────────────────────────────────────────── */

  const handleStartFocus = () => {
    if (!task.id) return
    onClose()
    navigate(`/focus?taskId=${task.id}`)
  }

  const isActionBusy = actionLoading !== null

  return (
    <>
      {/* ── Overlay ── */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Modal panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
        className="fixed z-50 inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[420px] max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl border border-stone-100 animate-slide-up"
      >
        {/* Top drag-hint bar (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-stone-100">
          <div className="flex-1 min-w-0">
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 ${cfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} aria-hidden="true" />
              {cfg.label}
            </span>

            {/* Task title */}
            <h2
              id="task-detail-title"
              className={`text-base font-bold text-stone-800 leading-snug break-words ${
                task.status === 'COMPLETED' ? 'line-through text-stone-400' : ''
              }`}
            >
              {task.title}
            </h2>

            {/* Module title */}
            {task.moduleTitle && (
              <p className="text-xs text-violet-600 font-medium mt-1 flex items-center gap-1">
                <StudyIcon name="layers" size={11} className="text-violet-400 shrink-0" />
                {task.moduleTitle}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task detail"
            className="w-8 h-8 rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700 flex items-center justify-center transition-colors shrink-0"
          >
            <StudyIcon name="x" size={14} />
          </button>
        </div>

        {/* ── Meta info ── */}
        <div className="px-5 py-4 space-y-2.5 border-b border-stone-100">
          {task.scheduledDate && (
            <div className="flex items-center gap-2.5 text-xs text-stone-600">
              <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                <StudyIcon name="calendar" size={12} className="text-stone-400" />
              </div>
              <span>{fmtDate(task.scheduledDate)}</span>
            </div>
          )}

          {timeRange && (
            <div className="flex items-center gap-2.5 text-xs text-stone-600">
              <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                <StudyIcon name="clock" size={12} className="text-stone-400" />
              </div>
              <span className="tabular-nums">{timeRange}</span>
            </div>
          )}
        </div>

        {/* ── Error message ── */}
        {actionError && (
          <div className="mx-5 mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600 flex items-center gap-1.5">
            <StudyIcon name="alert-circle" size={12} className="text-red-400 shrink-0" />
            {actionError}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="px-5 pt-4 pb-5 space-y-3">

          {/* Start Focus — always first */}
          {task.id && (
            <button
              type="button"
              onClick={handleStartFocus}
              className="w-full btn-accent justify-center py-2.5 text-sm"
              disabled={isActionBusy}
            >
              <StudyIcon name="zap" size={14} strokeWidth={2.5} />
              Start Focus Session
            </button>
          )}

          {/* Status change buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { status: 'PENDING',     icon: 'clock',  label: 'Pending',     active: 'bg-violet-50 text-violet-700 border-violet-200 ring-1 ring-violet-200' },
              { status: 'IN_PROGRESS', icon: 'zap',    label: 'In Progress', active: 'bg-violet-100 text-violet-800 border-violet-300 ring-1 ring-violet-300' },
              { status: 'COMPLETED',   icon: 'check',  label: 'Done',        active: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200' },
            ].map(({ status, icon, label, active }) => {
              const isCurrent = task.status === status
              const isThisLoading = actionLoading === status
              return (
                <button
                  key={status}
                  type="button"
                  disabled={isActionBusy || !task.id}
                  onClick={() => handleStatusUpdate(status)}
                  className={[
                    'flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-[11px] font-semibold transition-all duration-150',
                    isCurrent
                      ? active
                      : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300 hover:bg-stone-100',
                    (isActionBusy && !isThisLoading) ? 'opacity-50 cursor-not-allowed' : '',
                  ].join(' ')}
                  aria-pressed={isCurrent}
                >
                  {isThisLoading ? (
                    <StudyIcon name="timer" size={14} className="animate-spin text-current" />
                  ) : (
                    <StudyIcon name={icon} size={14} className="text-current" strokeWidth={isCurrent ? 2.5 : 2} />
                  )}
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default CalendarTaskDetailModal
