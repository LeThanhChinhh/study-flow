import { motion } from 'motion/react'
import StudyIcon from '../../components/StudyIcon'
import {
  FOCUS_TASK,
  FOCUS_PROGRESS,
  TODAY_TIP,
  RECALL_HINT,
  BREAK_SUGGESTION,
} from './focusData'

// Stagger animation variant shared across panels
const panelVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

// Current Task panel — shown on the left column
export const CurrentTaskPanel = () => {
  const { title, subject, module, estimatedMins, intentions } = FOCUS_TASK

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
        <span className="badge bg-stone-100 text-stone-600">
          {module}
        </span>
        <span className="badge bg-rose-50 text-rose-600">
          <StudyIcon name="timer" size={11} className="text-rose-400"/>
          {estimatedMins} min
        </span>
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

      {/* Session counter badge */}
      <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
        <span className="text-xs text-stone-400">
          Session {FOCUS_PROGRESS.sessionsToday + 1} of {FOCUS_PROGRESS.sessionGoal} today
        </span>
        <span className="badge bg-emerald-50 text-emerald-700">
          <StudyIcon name="zap" size={11} className="text-emerald-500"/>
          On track
        </span>
      </div>
    </motion.section>
  )
}

// Support panel — shown on the right column
export const SupportPanel = () => {
  const { sessionsToday, minutesToday, sessionGoal, minuteGoal } = FOCUS_PROGRESS
  const sessionPct = Math.round((sessionsToday / sessionGoal) * 100)
  const minutePct  = Math.round((minutesToday  / minuteGoal)  * 100)

  return (
    <motion.section
      variants={panelVariants}
      aria-label="Session support info"
      className="flex flex-col gap-4"
    >
      {/* Today's focus progress */}
      <div className="card p-5 flex flex-col gap-4 relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent"/>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <StudyIcon name="bar-chart" size={15} className="text-emerald-600"/>
          </div>
          <p className="text-sm font-semibold text-stone-800">Today's Focus</p>
        </div>

        <div className="space-y-3">
          {/* Sessions progress */}
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-stone-500">Sessions</span>
              <span className="text-xs font-medium text-stone-700 tabular-nums">
                {sessionsToday} / {sessionGoal}
              </span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full progress-fill"
                style={{ width: `${sessionPct}%` }}
                role="progressbar"
                aria-valuenow={sessionPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Sessions: ${sessionPct}%`}
              />
            </div>
          </div>

          {/* Minutes progress */}
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-stone-500">Focus minutes</span>
              <span className="text-xs font-medium text-stone-700 tabular-nums">
                {minutesToday} / {minuteGoal} min
              </span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full progress-fill"
                style={{ width: `${minutePct}%` }}
                role="progressbar"
                aria-valuenow={minutePct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Minutes: ${minutePct}%`}
              />
            </div>
          </div>
        </div>
      </div>

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
