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
  title: task?.title ?? '',
  scheduledDate: task?.scheduledDate ?? '',
  startTime: toTimeInput(task?.startTime),
  endTime: toTimeInput(task?.endTime),
})

/** Validate date/time fields, returns error string or null. */
const validateForm = (form, isManualTask) => {
  if (isManualTask) {
    const trimmed = form.title.trim()
    if (!trimmed) return 'Task title is required.'
    if (trimmed.length > 255) return 'Task title must be 255 characters or fewer.'
  }
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
import { deleteTask } from '../../api/taskApi'

const CalendarTaskDetailModal = ({ task, onClose, onTaskUpdated, onTaskDeleted }) => {
  const navigate = useNavigate()

  // ── Status-only loading (Pending/In Progress/Done quick buttons)
  const [actionLoading, setActionLoading] = useState(null) // status string | null
  const [actionError,   setActionError]   = useState(null)

  // ── Schedule edit form
  const [editForm,     setEditForm]     = useState(() => taskToForm(task))
  const [isSaving,     setIsSaving]     = useState(false)
  const [formError,    setFormError]    = useState(null)
  const [saveSuccess,  setSaveSuccess]  = useState(false)

  const [isDeleting,          setIsDeleting]          = useState(false)
  const [showConfirmDelete,   setShowConfirmDelete]   = useState(false)

  const isManualTask = task?.isAiGenerated === false
  const isAnyBusy = actionLoading !== null || isSaving

  /* ── Sync form when task changes (new task opened) ──────────────────────── */

  useEffect(() => {
    setEditForm(taskToForm(task))
    setFormError(null)
    setSaveSuccess(false)
    setActionError(null)
    setShowConfirmDelete(false)
    setIsDeleting(false)
  }, [task?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Escape key closes modal ─────────────────────────────────────────────── */

  useEffect(() => {
    if (!task) return undefined

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isAnyBusy && !isDeleting) onClose?.()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [task, onClose, isAnyBusy, isDeleting])

  if (!task) return null

  const cfg = getStatusCfg(task.status)

  const timeRange =
    task.startTime && task.endTime
      ? `${fmt12(task.startTime)} – ${fmt12(task.endTime)}`
      : task.startTime
      ? fmt12(task.startTime)
      : null

  const scheduleChanged = hasScheduleChanged(editForm, task)
  const titleChanged = isManualTask && editForm.title.trim() !== (task?.title ?? '').trim()
  const hasAnyChanges = scheduleChanged || titleChanged

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
    const err = validateForm(editForm, isManualTask)
    if (err) {
      setFormError(err)
      return
    }
    setFormError(null)
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const payload = {}
      if (titleChanged) payload.title = editForm.title.trim()
      if (scheduleChanged) {
        payload.scheduledDate = editForm.scheduledDate
        payload.startTime = editForm.startTime
        payload.endTime = editForm.endTime
      }
      const updated = await updateTask(task.id, payload)
      onTaskUpdated?.(updated)
      setEditForm(taskToForm(updated))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } catch (err) {
      console.error('[CalendarTaskDetailModal] schedule save failed:', err)
      const msg =
        err?.response?.data?.message || err?.data?.message || err?.message || 'Could not save changes. Please try again.'
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

  /* ── Delete task ─────────────────────────────────────────────────────────── */

  const handleDeleteTask = async () => {
    if (!task.id || !isManualTask) return
    setIsDeleting(true)
    try {
      await deleteTask(task.id)
      onTaskDeleted?.(task.id)
      onClose?.()
    } catch (err) {
      console.error('[CalendarTaskDetailModal] delete failed:', err)
      const msg = err?.data?.message || err?.response?.data?.message || err?.message || 'Could not delete task.'
      setActionError(msg)
      setShowConfirmDelete(false)
    } finally {
      setIsDeleting(false)
    }
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
        className="fixed inset-0 z-40 bg-black/30"
        onClick={() => { if (!isAnyBusy && !isDeleting) onClose?.() }}
        aria-hidden="true"
      />

      {/* ── Centered Modal Wrapper ── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        {/* ── Modal panel ── */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-detail-title"
          className="pointer-events-auto w-full max-w-[440px] max-h-[88vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-stone-100"
        >
          {/* Top drag-hint bar (mobile) */}
          <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 bg-stone-200 rounded-full" />
          </div>

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 px-5 pt-3 pb-2 border-b border-stone-100 shrink-0">
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

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* ── Quick edit: schedule ── */}
          {isManualTask && (
            <div className="px-5 pt-4 border-b border-stone-100 space-y-3 pb-3">
              <label className="block">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    Task title
                  </span>
                  <span className="text-[10px] text-stone-400">{editForm.title.length}/255</span>
                </div>
                <input
                  type="text"
                  className={inputCls}
                  value={editForm.title}
                  onChange={(e) => {
                    setEditForm(f => ({ ...f, title: e.target.value.slice(0, 255) }))
                    setFormError(null)
                    setSaveSuccess(false)
                  }}
                  disabled={!task.id || isAnyBusy || isDeleting}
                  required
                  maxLength={255}
                />
              </label>
            </div>
          )}

          <div className="px-5 pt-3 pb-3 border-b border-stone-100 space-y-3">
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
              disabled={!task.id || isAnyBusy || isDeleting}
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
                disabled={!task.id || isAnyBusy || isDeleting}
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
                disabled={!task.id || isAnyBusy || isDeleting}
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
              Changes saved.
            </div>
          )}

          {/* Save / Reset buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveSchedule}
              disabled={!task.id || isAnyBusy || isDeleting || !hasAnyChanges}
              className={[
                'flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all',
                hasAnyChanges && task.id && !isAnyBusy && !isDeleting
                  ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed',
              ].join(' ')}
              aria-label="Save changes"
            >
              {isSaving ? (
                <StudyIcon name="timer" size={12} className="animate-spin" />
              ) : (
                <StudyIcon name="check" size={12} strokeWidth={2.5} />
              )}
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>

            {hasAnyChanges && (
              <button
                type="button"
                onClick={handleResetForm}
                disabled={isAnyBusy || isDeleting}
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
          <div className="px-5 pt-3 pb-4 space-y-3">

            {/* Start Focus */}
            {task.id && (
              <button
                type="button"
                onClick={handleStartFocus}
                className="w-full btn-accent justify-center py-2.5 text-sm"
                disabled={isAnyBusy || isDeleting}
              >
                <StudyIcon name="zap" size={14} strokeWidth={2.5} />
                Start Focus Session
              </button>
            )}

            {/* Status quick buttons */}
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
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
                      disabled={isAnyBusy || isDeleting || !task.id}
                      onClick={() => handleStatusUpdate(status)}
                      className={[
                        'flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-[11px] font-semibold transition-all duration-150',
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
          {/* ── Danger Section ── */}
          {isManualTask && (
            <div className="px-5 pt-3 pb-4">

              {!showConfirmDelete ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  disabled={isAnyBusy || isDeleting}
                  className="w-full py-2.5 rounded-xl border border-red-100 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <StudyIcon name="trash-2" size={14} className="inline-block mr-1.5 -mt-0.5" />
                  Delete task
                </button>
              ) : (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex flex-col gap-3">
                  <div>
                    <p className="text-sm font-bold text-red-700">Delete this task?</p>
                    <p className="text-xs text-red-600/80">This action cannot be undone.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(false)}
                      disabled={isDeleting}
                      className="flex-1 py-2 rounded-lg bg-white border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteTask}
                      disabled={isDeleting}
                      className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isDeleting ? <StudyIcon name="timer" size={12} className="animate-spin" /> : null}
                      {isDeleting ? 'Deleting…' : 'Confirm delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CalendarTaskDetailModal
