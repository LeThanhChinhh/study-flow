import React from 'react'
import { useDraggable } from '@dnd-kit/core'
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
 * @param {boolean}  isMoving      - True when this task is being saved after drop (disables drag)
 * @param {boolean}  enableDrag    - Opt-in: only DayColumn passes true; UnscheduledSection does not
 */
const CalendarTaskCard = React.memo(({ task, onClick, isMoving, enableDrag = false, showGoalBadge = false }) => {
  const cfg       = getStatusConfig(task.status)
  const isClickable = Boolean(task.id)

  // Only allow drag if: enableDrag=true, id exists, startTime + endTime exist, not currently moving
  const canDrag = Boolean(enableDrag && task.id && task.startTime && task.endTime && !isMoving)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
    disabled: !canDrag,
  })

  // When isDragging: show ghost placeholder in original position (DragOverlay handles the floating visual)
  // When not dragging: no transform needed
  const style = isDragging ? { opacity: 0.25, pointerEvents: 'none' } : undefined

  const timeRange =
    task.startTime && task.endTime
      ? `${formatTime(task.startTime)} – ${formatTime(task.endTime)}`
      : task.startTime
      ? formatTime(task.startTime)
      : null

  const handleClick = () => {
    if (isClickable) onClick?.(task)
  }

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      onClick={handleClick}
      disabled={!isClickable}
      className={[
        'w-full text-left rounded-lg border overflow-hidden px-2.5 py-2 shrink-0',
        'transition-all duration-150',
        isClickable ? 'cursor-pointer' : 'cursor-default',
        canDrag ? 'cursor-grab active:cursor-grabbing' : '',
        isMoving ? 'opacity-50 pointer-events-none' : '',
        isDragging ? 'opacity-50 ring-2 ring-violet-400' : '',
        'focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-1',
        cfg.card,
      ].join(' ')}
      aria-label={`View details for: ${task.title}`}
      {...(canDrag ? { ...listeners, ...attributes } : {})}
    >
      {/* Title row */}
      <div className="flex flex-col items-start min-w-0 w-full">
        <div className="flex items-start gap-1.5 min-w-0 w-full">
          {/* Status dot */}
          <span
            className={`w-1.5 h-1.5 rounded-full mt-[5px] shrink-0 ${cfg.dot}`}
            aria-hidden="true"
          />
          <p 
            className={`text-xs leading-snug truncate flex-1 min-w-0 ${cfg.title}`}
            title={task.title}
          >
            {task.title}
          </p>
        </div>
        {task.moduleTitle && (
          <p className="text-[10px] text-stone-400 truncate pl-[12px] mt-0.5 w-full" title={task.moduleTitle}>
            {task.moduleTitle}
          </p>
        )}
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
        {showGoalBadge && task.goalTitle && (
          <span
            className="badge bg-stone-100 text-stone-500 text-[9px] px-1.5 py-px shrink-0 max-w-full truncate"
            title={task.goalTitle}
          >
            {task.goalTitle}
          </span>
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
})

CalendarTaskCard.displayName = 'CalendarTaskCard'

export default CalendarTaskCard
