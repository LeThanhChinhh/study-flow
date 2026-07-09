import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StudyIcon from '../../components/StudyIcon'
import { updateTask } from '../../api/taskApi'

/**
 * Status display config — aligns with CalendarTaskCard STATUS_CONFIG.
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

/** "HH:mm:ss" or "HH:mm" → "HH:mm" (input[type=time] format) */
const toTimeInput = (t) => {
  if (!t) return ''
  return t.slice(0, 5) // "HH:mm"
}

/** Build an initial form snapshot from a task object. */
const taskToForm = (task) => ({
  scheduledDate: task?.scheduledDate ?? '',
  startTime: toTimeInput(task?.startTime),
  endTime: toTimeInput(task?.endTime),
})

/** Validate date/time fields, returns error string or null. */
const validateScheduleForm = (form) => {
  if (!form.scheduledDate) return 'Date is required.'
  if (!form.startTime) return 'Start time is required.'
  if (!form.endTime) return 'End time is required.'
  if (form.startTime >= form.endTime) return 'Start time must be before end time.'
  return null
}

/** True if the form differs from the original task's schedule. */
const hasScheduleChanged = (form, task) =>
  form.scheduledDate !== (task?.scheduledDate ?? '') ||
  form.startTime !== toTimeInput(task?.startTime) ||
  form.endTime !== toTimeInput(task?.endTime)

/**
 * CalendarTaskDetailModal
 *
 * Props:
 *   task          — task object currently selected (null → modal closed)
 *   onClose       — callback to close the modal
 *   onTaskUpdated — callback(updatedTask) after a successful update
 */
const CalendarTaskDetailModal = ({ task, onClose, onTaskUpdated }) => {
  const navigate = useNavigate()

  // ── Status-only loading (Pending/In Progress/Done quick buttons)
  const [actionLoading, setActionLoading] = useState(null) // status string | null
  const [actionError,   setActionError]   = useState(null)

  // ── Schedule edit form
  const [editForm,     setEditForm]     = useState(() => taskToForm(task))
  const [isSaving,     setIsSaving]     = useState(false)
  const [formError,    setFormError]    = useState(null)
  const [saveSuccess,  setSaveSuccess]  = useState(false)

  /* ── Sync form when task changes (new task opened) ──────────────────────── */

  useEffect(() => {
    setEditForm(taskToForm(task))
    setFormError(null)
    setSaveSuccess(false)
    setActionError(null)
  }, [task?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Escape key closes modal ─────────────────────────────────────────────── */

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

  const scheduleChanged = hasScheduleChanged(editForm, task)
  const isAnyBusy = actionLoading !== null || isSaving

  /* ── Status-only quick update (Pending / In Progress / Done) ────────────── */

  const handleStatusUpdate = async (newStatus) => {
    if (!task.id) return
    if (task.status === newStatus) return
    setActionLoading(newStatus)
    setActionError(null)
    setSaveSuccess(false)
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

  /* ── Save schedule changes ───────────────────────────────────────────────── */

  const handleSaveSchedule = async () => {
    if (!task.id) return
    const err = validateScheduleForm(editForm)
    if (err) {
      setFormError(err)
      return
    }
    setFormError(null)
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const updated = await updateTask(task.id, {
        scheduledDate: editForm.scheduledDate,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
      })
      onTaskUpdated?.(updated)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } catch (err) {
      console.error('[CalendarTaskDetailModal] schedule save failed:', err)
      const msg =
        err?.data?.message || err?.message || 'Could not save changes. Please try again.'
      setFormError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  /* ── Reset edit form to current task values ─────────────────────────────── */

  const handleResetForm = () => {
    setEditForm(taskToForm(task))
    setFormError(null)
    setSaveSuccess(false)
  }

  /* ── Start Focus ─────────────────────────────────────────────────────────── */

  const handleStartFocus = () => {
    if (!task.id) return
    onClose()
    navigate(`/focus?taskId=${task.id}`)
  }

  /* ── Shared input class ──────────────────────────────────────────────────── */

  const inputCls =
    'w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-violet-300 focus:bg-white focus:ring-1 focus:ring-violet-200 transition-all'

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
        className="fixed z-50 inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[440px] max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl border border-stone-100 animate-slide-up"
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

        {/* ── Quick edit: schedule ── */}
        <div className="px-5 pt-4 pb-3 border-b border-stone-100 space-y-3">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
            Schedule
          </p>

          {/* Date */}
          <label className="block">
            <span className="text-xs text-stone-500 font-medium mb-1 flex items-center gap-1">
              <StudyIcon name="calendar" size={11} className="text-stone-400" />
              Date
            </span>
            <input
              type="date"
              className={inputCls}
              value={editForm.scheduledDate}
              onChange={(e) => {
                setEditForm((f) => ({ ...f, scheduledDate: e.target.value }))
                setFormError(null)
                setSaveSuccess(false)
              }}
              disabled={!task.id || isAnyBusy}
              aria-label="Scheduled date"
            />
          </label>

          {/* Time row */}
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-xs text-stone-500 font-medium mb-1 flex items-center gap-1">
                <StudyIcon name="clock" size={11} className="text-stone-400" />
                Start time
              </span>
              <input
                type="time"
                className={inputCls}
                value={editForm.startTime}
                onChange={(e) => {
                  setEditForm((f) => ({ ...f, startTime: e.target.value }))
                  setFormError(null)
                  setSaveSuccess(false)
                }}
                disabled={!task.id || isAnyBusy}
                aria-label="Start time"
              />
            </label>
            <label className="block">
              <span className="text-xs text-stone-500 font-medium mb-1 flex items-center gap-1">
                <StudyIcon name="clock" size={11} className="text-stone-400" />
                End time
              </span>
              <input
                type="time"
                className={inputCls}
                value={editForm.endTime}
                onChange={(e) => {
                  setEditForm((f) => ({ ...f, endTime: e.target.value }))
                  setFormError(null)
                  setSaveSuccess(false)
                }}
                disabled={!task.id || isAnyBusy}
                aria-label="End time"
              />
            </label>
          </div>

          {/* Inline form error */}
          {formError && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600">
              <StudyIcon name="alert-circle" size={12} className="text-red-400 shrink-0" />
              {formError}
            </div>
          )}

          {/* Save success */}
          {saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-600">
              <StudyIcon name="check" size={12} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
              Schedule saved.
            </div>
          )}

          {/* Save / Reset buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveSchedule}
              disabled={!task.id || isAnyBusy || !scheduleChanged}
              className={[
                'flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all',
                scheduleChanged && task.id && !isAnyBusy
                  ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed',
              ].join(' ')}
              aria-label="Save schedule changes"
            >
              {isSaving ? (
                <StudyIcon name="timer" size={12} className="animate-spin" />
              ) : (
                <StudyIcon name="check" size={12} strokeWidth={2.5} />
              )}
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>

            {scheduleChanged && (
              <button
                type="button"
                onClick={handleResetForm}
                disabled={isAnyBusy}
                className="px-3 py-2 rounded-xl bg-stone-100 text-stone-500 text-xs font-semibold hover:bg-stone-200 transition-colors"
                aria-label="Reset schedule to original values"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ── Status error ── */}
        {actionError && (
          <div className="mx-5 mt-3 px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 flex items-center gap-1.5">
            <StudyIcon name="alert-circle" size={12} className="text-red-400 shrink-0" />
            {actionError}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="px-5 pt-4 pb-5 space-y-3">

          {/* Start Focus */}
          {task.id && (
            <button
              type="button"
              onClick={handleStartFocus}
              className="w-full btn-accent justify-center py-2.5 text-sm"
              disabled={isAnyBusy}
            >
              <StudyIcon name="zap" size={14} strokeWidth={2.5} />
              Start Focus Session
            </button>
          )}

          {/* Status quick buttons */}
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
              Status
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { status: 'PENDING',     icon: 'clock', label: 'Pending',     active: 'bg-violet-50 text-violet-700 border-violet-200 ring-1 ring-violet-200' },
                { status: 'IN_PROGRESS', icon: 'zap',   label: 'In Progress', active: 'bg-violet-100 text-violet-800 border-violet-300 ring-1 ring-violet-300' },
                { status: 'COMPLETED',   icon: 'check',  label: 'Done',        active: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200' },
              ].map(({ status, icon, label, active }) => {
                const isCurrent      = task.status === status
                const isThisLoading  = actionLoading === status
                return (
                  <button
                    key={status}
                    type="button"
                    disabled={isAnyBusy || !task.id}
                    onClick={() => handleStatusUpdate(status)}
                    className={[
                      'flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-[11px] font-semibold transition-all duration-150',
                      isCurrent
                        ? active
                        : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300 hover:bg-stone-100',
                      (isAnyBusy && !isThisLoading) ? 'opacity-50 cursor-not-allowed' : '',
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
      </div>
    </>
  )
}

export default CalendarTaskDetailModal
