import StudyIcon from '../../components/StudyIcon'
import { formatTime } from './calendarUtils'

/**
 * STATUS_CONFIG maps raw task status → visual tokens.
 * PENDING     → neutral violet-tinted
 * IN_PROGRESS → vibrant violet (standout)
 * COMPLETED   → emerald muted, line-through title
 */
const STATUS_CONFIG = {
  PENDING: {
    dot:   'bg-violet-300',
    badge: 'bg-violet-50 text-violet-500 border border-violet-100',
    label: 'Pending',
    card:  'bg-white/95 border-stone-100 hover:border-violet-200',
    title: 'text-stone-700',
  },
  IN_PROGRESS: {
    dot:   'bg-violet-500 animate-pulse',
    badge: 'bg-violet-100 text-violet-700 border border-violet-200',
    label: 'In progress',
    card:  'bg-violet-50/80 border-violet-200 hover:border-violet-300 ring-1 ring-violet-100',
    title: 'text-violet-800 font-semibold',
  },
  COMPLETED: {
    dot:   'bg-emerald-400',
    badge: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    label: 'Done',
    card:  'bg-stone-50/80 border-stone-100 hover:border-stone-200 opacity-80',
    title: 'text-stone-400 line-through',
  },
}

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || STATUS_CONFIG.PENDING

/**
 * CalendarTaskCard
 *
 * @param {Object}   task          - Raw task object from API
 * @param {Function} onClick       - Called with task when user clicks the card
 */
const CalendarTaskCard = ({ task, onClick }) => {
  const cfg       = getStatusConfig(task.status)
  const isCompleted = task.status === 'COMPLETED'
  const isClickable = !isCompleted && Boolean(task.id)

  const timeRange =
    task.startTime && task.endTime
      ? `${formatTime(task.startTime)} – ${formatTime(task.endTime)}`
      : task.startTime
      ? formatTime(task.startTime)
      : null

  return (
    <button
      type="button"
      onClick={() => {
        if (isClickable) onClick?.(task)
      }}
      disabled={!isClickable}
      className={[
        'w-full text-left px-2.5 py-2 rounded-lg border overflow-hidden',
        'transition-all duration-150',
        isClickable ? 'cursor-pointer' : 'cursor-default',
        'focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-1',
        cfg.card,
      ].join(' ')}
      aria-label={`Open focus session for: ${task.title}`}
    >
      {/* Title row */}
      <div className="flex items-start gap-1.5 min-w-0">
        {/* Status dot */}
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 mt-[5px] ${cfg.dot}`}
          aria-hidden="true"
        />
        <p 
          className={`text-xs leading-snug truncate flex-1 min-w-0 ${cfg.title}`}
          title={task.title}
        >
          {task.title}
        </p>
      </div>

      {/* Time range + badge row */}
      <div className="flex items-center gap-1 mt-1 pl-3 min-w-0 flex-wrap">
        {timeRange ? (
          <span className="text-[10px] text-stone-400 tabular-nums shrink-0 flex items-center gap-0.5 max-w-full">
            <StudyIcon name="clock" size={9} className="text-stone-300 shrink-0" />
            <span className="truncate">{timeRange}</span>
          </span>
        ) : (
          <span />
        )}
        <span className={`badge text-[9px] px-1.5 py-px shrink-0 whitespace-nowrap max-w-full truncate ${cfg.badge}`}>
          {task.status === 'IN_PROGRESS' ? (
            <StudyIcon name="zap" size={8} className="text-violet-500" />
          ) : task.status === 'COMPLETED' ? (
            <StudyIcon name="check" size={8} className="text-emerald-500" strokeWidth={2.5} />
          ) : null}
          {cfg.label}
        </span>
      </div>
    </button>
  )
}

export default CalendarTaskCard
