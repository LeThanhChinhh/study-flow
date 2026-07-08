import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import StudyIcon from '../../components/StudyIcon'
import {
  TODAY_TIP,
  RECALL_HINT,
  BREAK_SUGGESTION,
} from './focusData'

// Stagger animation variant shared across panels
const panelVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

const DASHBOARD_CTA_CLASS = "inline-flex items-center justify-center px-4 py-2 mt-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors"

// Current Task panel — shown on the left column
export const CurrentTaskPanel = ({ currentTask, isTaskLoading, taskError }) => {
  const calculateDurationMinutes = (startTime, endTime) => {
    if (!startTime || !endTime) return 25
    try {
      const [h1, m1] = startTime.split(':').map(Number)
      const [h2, m2] = endTime.split(':').map(Number)
      let diff = (h2 * 60 + m2) - (h1 * 60 + m1)
      if (diff < 0) diff += 24 * 60
      return diff
    } catch (e) {
      return 25
    }
  }

  if (isTaskLoading) {
    return (
      <motion.section
        variants={panelVariants}
        aria-label="Current task loading"
        className="card p-6 flex flex-col gap-5 relative overflow-hidden"
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/60 to-transparent"/>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-stone-100 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-stone-100 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </motion.section>
    )
  }

  if (taskError) {
    return (
      <motion.section
        variants={panelVariants}
        className="card p-6 flex flex-col gap-5 items-center text-center relative overflow-hidden"
      >
        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-2">
          <StudyIcon name="alert-circle" size={24} className="text-rose-400"/>
        </div>
        <h2 className="text-sm font-bold text-stone-800">Failed to load task</h2>
        <p className="text-xs text-stone-500">{taskError}</p>
        <Link to="/dashboard" className={DASHBOARD_CTA_CLASS}>
          Back to dashboard
        </Link>
      </motion.section>
    )
  }

  if (!currentTask) {
    return (
      <motion.section
        variants={panelVariants}
        className="card p-6 flex flex-col gap-5 items-center text-center relative overflow-hidden"
      >
        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-2">
          <StudyIcon name="target" size={24} className="text-stone-400"/>
        </div>
        <h2 className="text-sm font-bold text-stone-800">No focus task selected</h2>
        <p className="text-xs text-stone-500">Choose a task from your dashboard to start a session.</p>
        <Link to="/dashboard" className={DASHBOARD_CTA_CLASS}>
          Back to dashboard
        </Link>
      </motion.section>
    )
  }

  if (currentTask.status === 'COMPLETED' || currentTask.status === 'done') {
    return (
      <motion.section
        variants={panelVariants}
        className="card p-6 flex flex-col gap-5 items-center text-center relative overflow-hidden"
      >
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
          <StudyIcon name="check-circle" size={24} className="text-emerald-500"/>
        </div>
        <h2 className="text-sm font-bold text-stone-800">Task Completed</h2>
        <p className="text-xs text-stone-500">This task is already completed.</p>
        <Link to="/dashboard" className={DASHBOARD_CTA_CLASS}>
          Back to dashboard
        </Link>
      </motion.section>
    )
  }

  const title = currentTask.title
  const subject = currentTask.goalName || 'Study Goal'
  const module = currentTask.moduleTitle || currentTask.moduleName || 'Scheduled Task'
  const estimatedMins = calculateDurationMinutes(currentTask.startTime, currentTask.endTime)
  const intentions = [
    `Focus on: ${title}`,
    'Complete one Pomodoro session',
    'Finish the recall quiz after the timer'
  ]

  return (
    <motion.section
      variants={panelVariants}
      aria-label="Current task"
      className="card p-6 flex flex-col gap-5 relative overflow-hidden"
    >
      {/* Subtle violet top edge highlight */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/60 to-transparent"/>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
          <StudyIcon name="book-open" size={17} className="text-violet-600"/>
        </div>
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">
            Current Task
          </p>
          <h2 className="text-sm font-bold text-stone-800 leading-snug">{title}</h2>
        </div>
      </div>

      {/* Subject + duration chips */}
      <div className="flex flex-wrap gap-2">
        <span className="badge bg-violet-100 text-violet-700">
          <StudyIcon name="target" size={11} className="text-violet-500"/>
          {subject}
        </span>
        <span className="badge bg-stone-100 text-stone-600 max-w-full truncate" title={module}>
          {module}
        </span>
        <span className="badge bg-rose-50 text-rose-600">
          <StudyIcon name="timer" size={11} className="text-rose-400"/>
          {estimatedMins} min
        </span>
        {currentTask.scheduledDate && (
          <span className="badge bg-stone-100 text-stone-500">
            <StudyIcon name="calendar" size={11} className="text-stone-400" />
            {currentTask.scheduledDate} {currentTask.startTime ? `· ${currentTask.startTime}` : ''}
          </span>
        )}
        {currentTask.status === 'IN_PROGRESS' && (
          <span className="badge bg-violet-100 text-violet-600 shrink-0">In progress</span>
        )}
        {(currentTask.status === 'PENDING' || !currentTask.status) && (
          <span className="badge bg-stone-100 text-stone-400 shrink-0">Pending</span>
        )}
      </div>

      {/* Session intentions */}
      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-stone-400 mb-3">
          Session Intentions
        </p>
        <ul className="space-y-2.5" role="list">
          {intentions.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full border-2 border-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-300"/>
              </div>
              <span className="text-sm text-stone-600 leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  )
}

// Support panel — shown on the right column
export const SupportPanel = () => {
  return (
    <motion.section
      variants={panelVariants}
      aria-label="Session support info"
      className="flex flex-col gap-4"
    >
      {/* Focus tip */}
      <div className="card p-5 flex flex-col gap-3 relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent"/>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <StudyIcon name="lightbulb" size={15} className="text-amber-500"/>
          </div>
          <p className="text-sm font-semibold text-stone-800">Focus Tip</p>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed">{TODAY_TIP}</p>

        <p className="text-xs text-stone-400 italic">{BREAK_SUGGESTION}</p>
      </div>

      {/* Active Recall hint */}
      <div className="card p-5 flex flex-col gap-3 relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-200/50 to-transparent"/>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
            <StudyIcon name="zap" size={15} className="text-rose-500"/>
          </div>
          <p className="text-sm font-semibold text-stone-800">Active Recall</p>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed">{RECALL_HINT}</p>

        <span className="badge bg-rose-50 text-rose-600 self-start">
          After session
        </span>
      </div>
    </motion.section>
  )
}
