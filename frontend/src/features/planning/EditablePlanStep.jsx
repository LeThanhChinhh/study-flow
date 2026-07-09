import StudyIcon, { IconBadge } from '../../components/StudyIcon'

/**
 * EditablePlanStep — inline editable AI plan preview.
 * Props:
 *   editablePlan: { modules: [{_id, title, tasks: [{_id, title, estimatedMinutes}]}] }
 *   setEditablePlan: updater function (receives new plan object, never mutates old)
 *   planErrors: string[] — validation errors to display
 */
const EditablePlanStep = ({ editablePlan, setEditablePlan, planErrors }) => {
  if (!editablePlan || !Array.isArray(editablePlan.modules)) {
    return (
      <div className="space-y-4 text-center py-10 px-4 card bg-red-50/30 border-red-100">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
          <StudyIcon name="alert-circle" size={28} className="text-red-500" />
        </div>
        <h3 className="text-base font-semibold text-stone-800">No tasks found</h3>
        <p className="text-sm text-stone-500 max-w-sm mx-auto">
          We could not extract any study tasks from this document. Try uploading a clearer,
          text-based PDF.
        </p>
      </div>
    )
  }

  const allTasks = editablePlan.modules.flatMap((m) => m.tasks || [])
  const totalMins = allTasks.reduce((sum, t) => sum + (Number(t.estimatedMinutes) || 25), 0)
  const totalHoursLabel = totalMins < 60 ? '<1' : (totalMins / 60).toFixed(1).replace('.0', '')

  // ── module-level helpers ──────────────────────────────────────────────────

  const updateModuleTitle = (mIdx, newTitle) => {
    setEditablePlan((prev) => ({
      ...prev,
      modules: prev.modules.map((mod, i) =>
        i === mIdx ? { ...mod, title: newTitle } : mod,
      ),
    }))
  }

  const removeModule = (mIdx) => {
    setEditablePlan((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== mIdx),
    }))
  }

  // ── task-level helpers ────────────────────────────────────────────────────

  const updateTaskField = (mIdx, tIdx, field, value) => {
    setEditablePlan((prev) => ({
      ...prev,
      modules: prev.modules.map((mod, i) => {
        if (i !== mIdx) return mod
        return {
          ...mod,
          tasks: mod.tasks.map((task, j) =>
            j !== tIdx ? task : { ...task, [field]: value },
          ),
        }
      }),
    }))
  }

  const removeTask = (mIdx, tIdx) => {
    setEditablePlan((prev) => ({
      ...prev,
      modules: prev.modules
        .map((mod, i) => {
          if (i !== mIdx) return mod
          const nextTasks = mod.tasks.filter((_, j) => j !== tIdx)
          return { ...mod, tasks: nextTasks }
        })
        .filter((mod) => Array.isArray(mod.tasks) && mod.tasks.length > 0),
    }))
  }

  const addTask = (mIdx) => {
    const newTask = {
      _id: `${mIdx}-new-${Date.now()}`,
      title: '',
      estimatedMinutes: 25,
    }
    setEditablePlan((prev) => ({
      ...prev,
      modules: prev.modules.map((mod, i) => {
        if (i !== mIdx) return mod
        return { ...mod, tasks: [...mod.tasks, newTask] }
      }),
    }))
  }

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 flex flex-col items-center justify-center text-center bg-violet-50/50 border-violet-100 shadow-none">
          <span className="text-2xl font-bold text-violet-700">{editablePlan.modules.length}</span>
          <span className="text-[10px] text-violet-600 font-bold uppercase tracking-wider">Modules</span>
        </div>
        <div className="card p-3 flex flex-col items-center justify-center text-center bg-violet-50/50 border-violet-100 shadow-none">
          <span className="text-2xl font-bold text-violet-700">{allTasks.length}</span>
          <span className="text-[10px] text-violet-600 font-bold uppercase tracking-wider">Tasks</span>
        </div>
        <div className="card p-3 flex flex-col items-center justify-center text-center bg-violet-50/50 border-violet-100 shadow-none">
          <span className="text-2xl font-bold text-violet-700">~{totalHoursLabel}</span>
          <span className="text-[10px] text-violet-600 font-bold uppercase tracking-wider">Hours est.</span>
        </div>
      </div>

      {/* Validation errors */}
      {planErrors && planErrors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-1">
          <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1.5">
            Please fix before generating:
          </p>
          {planErrors.map((err, i) => (
            <p key={i} className="text-sm text-red-600 flex items-start gap-1.5">
              <StudyIcon name="alert-circle" size={13} className="text-red-500 mt-0.5 shrink-0" />
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Editable curriculum */}
      <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-5">
        <div className="flex items-center gap-3 mb-4">
          <IconBadge name="layers" bg="bg-white" icon="text-violet-600" badgeSize="w-9 h-9 shadow-sm" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-stone-800">Curriculum Preview</h3>
            <p className="text-xs text-stone-500">
              Edit titles, durations, or add / remove tasks before generating.
            </p>
          </div>
        </div>

        <div className="space-y-5 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
          {editablePlan.modules.map((mod, mIdx) => (
            <div
              key={mod._id ?? mIdx}
              className="rounded-xl border border-stone-200 bg-white p-3 space-y-3 shadow-sm"
            >
              {/* Module header row */}
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 text-xs font-bold text-stone-700 uppercase tracking-wider bg-transparent border-b border-transparent hover:border-stone-200 focus:border-violet-300 focus:outline-none px-0.5 py-0.5 transition-colors"
                  value={mod.title}
                  placeholder={`Module ${mIdx + 1}`}
                  onChange={(e) => updateModuleTitle(mIdx, e.target.value)}
                  aria-label={`Module ${mIdx + 1} title`}
                />
                <button
                  type="button"
                  title="Remove module"
                  aria-label={`Remove module ${mIdx + 1}`}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                  onClick={() => removeModule(mIdx)}
                >
                  <StudyIcon name="x" size={12} />
                </button>
              </div>

              {/* Task list */}
              <div className="space-y-2 pl-2 border-l-2 border-stone-100">
                {mod.tasks.map((task, tIdx) => (
                  <div
                    key={task._id ?? tIdx}
                    className="flex items-center gap-2 rounded-xl bg-stone-50 border border-stone-100 px-2.5 py-2 hover:border-violet-200 transition-colors group"
                  >
                    <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {tIdx + 1}
                    </span>

                    {/* Task title */}
                    <input
                      className="flex-1 text-sm font-medium text-stone-700 bg-transparent border-b border-transparent hover:border-stone-200 focus:border-violet-300 focus:outline-none px-0.5 py-0.5 min-w-0 transition-colors"
                      value={task.title}
                      placeholder="Task title"
                      onChange={(e) => updateTaskField(mIdx, tIdx, 'title', e.target.value)}
                      aria-label={`Module ${mIdx + 1} task ${tIdx + 1} title`}
                    />

                    {/* Estimated minutes */}
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min="5"
                        max="180"
                        className="w-14 text-xs text-center text-violet-700 font-semibold bg-violet-50 border border-violet-100 rounded-lg px-1 py-1 focus:outline-none focus:border-violet-300 transition-colors"
                        value={task.estimatedMinutes}
                        onChange={(e) =>
                          updateTaskField(
                            mIdx,
                            tIdx,
                            'estimatedMinutes',
                            e.target.value === '' ? '' : Number(e.target.value),
                          )
                        }
                        aria-label={`Module ${mIdx + 1} task ${tIdx + 1} duration in minutes`}
                      />
                      <span className="text-[10px] text-violet-500 font-medium">min</span>
                    </div>

                    {/* Remove task */}
                    <button
                      type="button"
                      title="Remove task"
                      aria-label={`Remove task ${tIdx + 1} from module ${mIdx + 1}`}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={() => removeTask(mIdx, tIdx)}
                    >
                      <StudyIcon name="x" size={12} />
                    </button>
                  </div>
                ))}

                {/* Add task button */}
                <button
                  type="button"
                  className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-dashed border-stone-200 text-[11px] text-stone-400 font-medium hover:border-violet-300 hover:text-violet-500 hover:bg-violet-50/50 transition-colors"
                  onClick={() => addTask(mIdx)}
                >
                  <StudyIcon name="plus" size={11} /> Add task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EditablePlanStep
