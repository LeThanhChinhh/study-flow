import { useState, useEffect } from 'react'
import StudyIcon from '../../components/StudyIcon'
import { createTask } from '../../api/taskApi'

const CalendarCreateTaskModal = ({
  isOpen,
  goals,
  selectedGoalId,
  defaultDate,
  onClose,
  onTaskCreated
}) => {
  const [goalId, setGoalId] = useState('')
  const [title, setTitle] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setGoalId(selectedGoalId === 'all' ? '' : selectedGoalId)
      setTitle('')
      setScheduledDate(defaultDate || '')
      setStartTime('')
      setEndTime('')
      setError(null)
      setIsSubmitting(false)
      
      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, selectedGoalId, defaultDate, onClose])

  if (!isOpen) return null

  const selectedGoal = goals.find(g => g.id === goalId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Task title is required.')
      return
    }

    if (!goalId || !scheduledDate || !startTime || !endTime) {
      setError('Please fill out all required fields.')
      return
    }

    if (startTime >= endTime) {
      setError('Start time must be before end time.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      
      const payload = {
        goalId,
        title: trimmedTitle,
        scheduledDate,
        startTime,
        endTime,
        orderIndex: 0
      }

      const createdTask = await createTask(payload)
      onTaskCreated(createdTask)
      onClose()
    } catch (err) {
      const msg = err?.data?.message || err?.response?.data?.message || err?.message || 'Failed to create task.'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
    >
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <StudyIcon name="plus" size={14} className="text-violet-600" />
            </div>
            <h2 id="create-task-title" className="text-base font-semibold text-stone-800">Add task</h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <StudyIcon name="x" size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-stone-50/30">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm flex gap-3">
              <StudyIcon name="alert-triangle" size={16} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-700">Goal *</label>
            {selectedGoalId !== 'all' ? (
              <div className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-lg text-sm text-stone-600 truncate select-none">
                {selectedGoal?.title || 'Unknown Goal'}
              </div>
            ) : (
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full text-sm border-stone-200 rounded-lg bg-white text-stone-700 px-3 py-2 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all shadow-sm"
              >
                <option value="" disabled>Select a goal...</option>
                {goals.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-700">Task title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 255))}
              disabled={isSubmitting}
              required
              maxLength={255}
              placeholder="E.g., Read chapter 1"
              className="w-full text-sm border-stone-200 rounded-lg bg-white text-stone-700 px-3 py-2 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all shadow-sm"
            />
            <p className="text-[10px] text-stone-400 text-right">{title.length}/255</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-700">Date *</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              disabled={isSubmitting || !goalId}
              required
              min={selectedGoal?.startDate}
              max={selectedGoal?.deadline}
              className="w-full text-sm border-stone-200 rounded-lg bg-white text-stone-700 px-3 py-2 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all shadow-sm disabled:bg-stone-100 disabled:text-stone-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700">Start time *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full text-sm border-stone-200 rounded-lg bg-white text-stone-700 px-3 py-2 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700">End time *</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full text-sm border-stone-200 rounded-lg bg-white text-stone-700 px-3 py-2 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-ghost text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !goalId || !title.trim() || !scheduledDate || !startTime || !endTime}
              className="btn-primary text-xs px-4 py-2"
            >
              {isSubmitting ? (
                <>
                  <StudyIcon name="loader" size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Create task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CalendarCreateTaskModal
