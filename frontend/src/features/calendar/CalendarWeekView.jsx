import StudyIcon from '../../components/StudyIcon'
import { useDroppable } from '@dnd-kit/core'
import CalendarTaskCard from './CalendarTaskCard'
import {
  formatLocalDate,
  sortTasksForCalendar,
  addDays,
  WEEK_DAY_NAMES_SHORT,
  MONTH_NAMES_SHORT,
} from './calendarUtils'

/*  Day Column  */

export const DayColumn = ({ date, tasks, isToday, onTaskClick, isMovingTaskId, showGoalBadge }) => {
  const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1 // 0=Mon…6=Sun
  const dayName  = WEEK_DAY_NAMES_SHORT[dayIndex]
  const dayNum   = date.getDate()
  const monthAbb = MONTH_NAMES_SHORT[date.getMonth()]
  const sorted   = sortTasksForCalendar(tasks)
  const isWeekend = date.getDay() === 0 || date.getDay() === 6

  const dateStr = formatLocalDate(date)
  const { setNodeRef, isOver } = useDroppable({ id: dateStr })

  return (
    <div
      ref={setNodeRef}
      className={[
        'flex flex-col min-w-0 rounded-xl border overflow-hidden transition-all duration-200 h-[calc(100vh-280px)] min-h-[480px]',
        isToday
          ? 'bg-violet-50/70 border-violet-200 shadow-sm'
          : isWeekend
          ? 'bg-stone-50/50 border-stone-100/70'
          : 'bg-white/80 border-stone-100',
        isOver ? 'ring-2 ring-violet-400 ring-inset' : '',
      ].join(' ')}
    >

      <div
        className={[
          'px-2 pt-2.5 pb-2 text-center border-b',
          isToday ? 'border-violet-200/60' : 'border-stone-100',
        ].join(' ')}
      >
        <p className={`text-[10px] font-semibold uppercase tracking-widest mb-0.5 ${
          isToday ? 'text-violet-500' : 'text-stone-400'
        }`}>
          {dayName}
        </p>


        <div className={[
          'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mx-auto',
          isToday
            ? 'bg-violet-600 text-white shadow-sm'
            : isWeekend
            ? 'text-stone-400'
            : 'text-stone-700',
        ].join(' ')}>
          {dayNum}
        </div>

        <p className={`text-[9px] mt-0.5 ${isToday ? 'text-violet-400' : 'text-stone-300'}`}>
          {monthAbb}
        </p>


        {tasks.length > 0 && (
          <span className={`inline-block mt-1.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
            isToday
              ? 'bg-violet-100 text-violet-600'
              : 'bg-stone-100 text-stone-500'
          }`}>
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
        )}
      </div>


      <div className="flex flex-col gap-1.5 p-2 flex-1 overflow-y-auto calendar-day-scroll">
        {sorted.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[10px] text-stone-200 select-none">—</span>
          </div>
        ) : (
          sorted.map(task => (
            <CalendarTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              isMoving={isMovingTaskId === task.id}
              enableDrag
              showGoalBadge={showGoalBadge}
            />
          ))
        )}
      </div>
    </div>
  )
}

/*  Week Navigation Header  */

export const WeekNavHeader = ({ weekStart, onPrev, onNext, onToday, goals, selectedGoalId, onGoalChange, onAddTask, canAddTask }) => {
  const weekEnd  = addDays(weekStart, 6)
  const sMonth   = MONTH_NAMES_SHORT[weekStart.getMonth()]
  const eMonth   = MONTH_NAMES_SHORT[weekEnd.getMonth()]
  const sYear    = weekStart.getFullYear()
  const eYear    = weekEnd.getFullYear()

  const rangeLabel =
    sYear !== eYear
      ? `${sMonth} ${weekStart.getDate()}, ${sYear} – ${eMonth} ${weekEnd.getDate()}, ${eYear}`
      : sMonth !== eMonth
      ? `${sMonth} ${weekStart.getDate()} – ${eMonth} ${weekEnd.getDate()}, ${sYear}`
      : `${sMonth} ${weekStart.getDate()} – ${weekEnd.getDate()}, ${sYear}`

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <StudyIcon name="calendar" size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-800 leading-tight tracking-tight">
              Learning Calendar
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">{rangeLabel}</p>
          </div>
        </div>


        {goals && goals.length > 0 && (
          <div className="flex items-center">
            <select
              value={selectedGoalId}
              onChange={(e) => onGoalChange(e.target.value)}
              aria-label="Filter calendar by goal"
              className="text-sm border-stone-200 rounded-lg bg-stone-50 text-stone-700 py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all shadow-sm"
            >
              <option value="all">All goals</option>
              {goals.map(g => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>


      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAddTask}
          disabled={!canAddTask}
          title={!canAddTask ? 'Create a learning goal first' : 'Add task'}
          className="
            btn-primary
            inline-flex flex-row items-center justify-center
            gap-1.5 whitespace-nowrap
            h-9 px-3 text-xs mr-1
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          aria-label="Add task"
        >
          <StudyIcon
            name="plus"
            size={12}
            strokeWidth={2.5}
            className="shrink-0"
          />
          <span className="shrink-0">Add task</span>
        </button>
        <button
          onClick={onToday}
          className="btn-ghost px-3 py-[0.45rem] text-xs"
          aria-label="Go to current week"
        >
          Today
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            className="w-8 h-8 rounded-lg border border-stone-200 bg-white/80 hover:bg-white hover:border-stone-300 text-stone-600 flex items-center justify-center transition-all duration-150 hover:-translate-y-px hover:shadow-sm"
            aria-label="Previous week"
          >
            <StudyIcon name="chevron-right" size={14} className="rotate-180" />
          </button>
          <button
            onClick={onNext}
            className="w-8 h-8 rounded-lg border border-stone-200 bg-white/80 hover:bg-white hover:border-stone-300 text-stone-600 flex items-center justify-center transition-all duration-150 hover:-translate-y-px hover:shadow-sm"
            aria-label="Next week"
          >
            <StudyIcon name="chevron-right" size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

/*  Unscheduled Section  */

export const UnscheduledSection = ({ tasks, onTaskClick, showGoalBadge }) => {
  if (!tasks || tasks.length === 0) return null
  const sorted = sortTasksForCalendar(tasks)

  return (
    <div className="card p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <StudyIcon name="layers" size={14} className="text-stone-400" />
        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
          Unscheduled tasks
        </h3>
        <span className="badge bg-stone-100 text-stone-400 text-[10px] px-1.5 py-px">
          {sorted.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sorted.map(task => (
          <div key={task.id} className="w-full sm:w-auto sm:min-w-[200px] sm:max-w-[280px]">
            <CalendarTaskCard task={task} onClick={() => onTaskClick(task)} showGoalBadge={showGoalBadge} />
          </div>
        ))}
      </div>
    </div>
  )
}

/*  Empty week state  */

export const EmptyWeek = ({ onCreatePlan, onToday, isGoalFiltered, onClearGoalFilter }) => (
  <div className="col-span-7 flex flex-col items-center justify-center py-14 text-center">
    <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
      <StudyIcon name="calendar" size={24} className="text-stone-300" />
    </div>
    <p className="text-sm font-medium text-stone-600 mb-1">
      {isGoalFiltered ? "No tasks for this goal this week." : "No tasks scheduled this week"}
    </p>
    <p className="text-xs text-stone-400 mb-5 max-w-xs">
      {isGoalFiltered
        ? "Try looking at another week or view all goals."
        : "Navigate to another week or create a learning plan to fill your calendar."}
    </p>
    <div className="flex items-center gap-2 flex-wrap justify-center">
      <button onClick={onToday} className="btn-ghost text-xs px-3 py-1.5">
        <StudyIcon name="clock" size={12} />
        Go to today
      </button>
      {isGoalFiltered ? (
        <button onClick={onClearGoalFilter} className="btn-accent text-xs px-3 py-1.5">
          <StudyIcon name="layers" size={12} strokeWidth={2.5} />
          Show all goals
        </button>
      ) : (
        <button onClick={onCreatePlan} className="btn-accent text-xs px-3 py-1.5">
          <StudyIcon name="plus" size={12} strokeWidth={2.5} />
          Create learning plan
        </button>
      )}
    </div>
  </div>
)

/*  Skeleton loader  */

export const SkeletonColumn = () => (
  <div className="flex flex-col rounded-xl border border-stone-100 bg-white/80 h-[calc(100vh-280px)] min-h-[480px]">
    <div className="px-2 pt-2.5 pb-2 border-b border-stone-100 text-center space-y-1.5">
      <div className="h-2.5 w-6 bg-stone-100 rounded mx-auto animate-pulse" />
      <div className="w-8 h-8 rounded-full bg-stone-100 mx-auto animate-pulse" />
      <div className="h-2 w-4 bg-stone-50 rounded mx-auto animate-pulse" />
    </div>
    <div className="p-2 space-y-2">
      {[1, 2].map(i => (
        <div key={i} className="h-12 bg-stone-50 rounded-lg animate-pulse" />
      ))}
    </div>
  </div>
)
