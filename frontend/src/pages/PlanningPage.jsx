import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import StudyIcon, { IconBadge } from '../components/StudyIcon'
import { StudyOrbitBackdrop } from '../features/dashboard/DashboardDecor'
import { AppNav } from '../features/dashboard/DashboardSections'

import { createGoal } from '../api/goalApi'
import { createTimeSlot } from '../api/timeSlotApi'
import { uploadMaterial, getMaterialStatus } from '../api/materialApi'
import { generateSchedule } from '../api/scheduleApi'

const formatTime12Hour = (time) => {
  if (!time) return ''
  const [hourRaw, minute = '00'] = time.split(':')
  const hour = Number(hourRaw)
  if (Number.isNaN(hour)) return time
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minute} ${period}`
}

const DAY_LABELS = {
  1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday'
}

const formatLocalDate = () => {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const getDayOfWeekForDate = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00`)
  const day = date.getDay()
  return day === 0 ? 7 : day
}

const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

const getCurrentMinutes = () => {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

const padTime = (value) => String(value).padStart(2, '0')

const getNextHourSlot = () => {
  const now = new Date()
  const nextHour = Math.min(now.getHours() + 1, 23)
  const endHour = Math.min(nextHour + 1, 23)

  return {
    startTime: `${padTime(nextHour)}:00`,
    endTime: `${padTime(endHour)}:00`,
  }
}

const addDays = (date, days) => {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

const toLocalDateString = (date) => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const getMatchingDatesForSlot = (startDate, deadline, dayOfWeek) => {
  const dates = []
  let cursor = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${deadline}T00:00:00`)
  const targetDay = Number(dayOfWeek)

  while (cursor <= end) {
    const dateStr = toLocalDateString(cursor)
    if (getDayOfWeekForDate(dateStr) === targetDay) {
      dates.push(dateStr)
    }
    cursor = addDays(cursor, 1)
  }

  return dates
}

const hasFutureOccurrenceForSlot = (matchingDates, startTime) => {
  const today = formatLocalDate()
  const currentMinutes = getCurrentMinutes()
  const startMinutes = timeToMinutes(startTime)

  return matchingDates.some(dateStr => {
    if (dateStr > today) return true
    if (dateStr === today && startMinutes > currentMinutes) return true
    return false
  })
}

const getSuggestedDayOfWeekForGoal = (startDate, deadline) => {
  const today = formatLocalDate()
  const effectiveStart = startDate < today ? today : startDate
  if (effectiveStart > deadline) return getDayOfWeekForDate(startDate)
  return getDayOfWeekForDate(effectiveStart)
}

const STEPS = [
  {
    id: 'goal',
    title: 'Create Goal',
    eyebrow: 'Step 1',
    icon: 'target',
    description: 'Name your learning goal and choose the date range StudyFlow should plan around.',
  },
  {
    id: 'slots',
    title: 'Time Slots',
    eyebrow: 'Step 2',
    icon: 'calendar',
    description: 'Tell StudyFlow when you are free. The scheduler will place tasks inside these windows.',
  },
  {
    id: 'upload',
    title: 'Upload PDF',
    eyebrow: 'Step 3',
    icon: 'upload',
    description: 'Upload the learning material.',
  },
  {
    id: 'polling',
    title: 'Polling AI',
    eyebrow: 'Step 4',
    icon: 'timer',
    description: 'Show progress while the backend parses the material and returns structured modules.',
  },
  {
    id: 'schedule',
    title: 'Generate Schedule',
    eyebrow: 'Step 5',
    icon: 'layers',
    description: 'Preview generated modules and create real tasks for the dashboard.',
  },
]


/**
 * Deep-clone rawJson into a local editable plan structure.
 * Each module and task gets a stable `_id` (index-based) so React keys remain stable during edits.
 */
const clonePlan = (rawJson) => {
  if (!rawJson || !Array.isArray(rawJson.modules)) return { modules: [] };
  return {
    modules: rawJson.modules.map((mod, mIdx) => ({
      _id: mIdx,
      title: mod.title || `Module ${mIdx + 1}`,
      tasks: Array.isArray(mod.tasks)
        ? mod.tasks.map((task, tIdx) => ({
            _id: `${mIdx}-${tIdx}`,
            title: task.title || '',
            estimatedMinutes: task.estimatedMinutes ?? 25,
          }))
        : [],
    })),
  };
};

/**
 * Validate the local editable plan before calling generateSchedule.
 * Returns an array of error strings (empty = valid).
 */
const validateEditablePlan = (plan) => {
  const errors = [];
  if (!plan || !Array.isArray(plan.modules) || plan.modules.length === 0) {
    errors.push('Plan must have at least 1 module.');
    return errors;
  }
  const hasTasks = plan.modules.some(m => Array.isArray(m.tasks) && m.tasks.length > 0);
  if (!hasTasks) errors.push('Plan must have at least 1 task across all modules.');
  plan.modules.forEach((mod, mIdx) => {
    if (!mod.title || !mod.title.trim()) {
      errors.push(`Module ${mIdx + 1}: Title must not be empty.`);
    }
    if (!Array.isArray(mod.tasks) || mod.tasks.length === 0) return;
    mod.tasks.forEach((task, tIdx) => {
      if (!task.title || !task.title.trim()) {
        errors.push(`Module ${mIdx + 1} › Task ${tIdx + 1}: Title must not be empty.`);
      }
      const mins = Number(task.estimatedMinutes);
      if (Number.isNaN(mins) || mins < 5 || mins > 180) {
        errors.push(`Module ${mIdx + 1} › Task ${tIdx + 1}: Duration must be between 5 and 180 minutes.`);
      }
    });
  });
  return errors;
};

const Stepper = ({ currentStep }) => (
  <div className="card p-4">
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
      {STEPS.map((step, index) => {
        const isActive = index === currentStep
        const isDone = index < currentStep
        return (
          <div
            key={step.id}
            className={`rounded-2xl border px-3 py-3 transition-all duration-300 ${
              isActive
                ? 'bg-violet-50 border-violet-200 shadow-sm scale-[1.02]'
                : isDone
                  ? 'bg-emerald-50 border-emerald-100'
                  : 'bg-white/70 border-stone-100 opacity-60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm'
                    : isDone
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-400'
                }`}
              >
                <StudyIcon name={isDone ? 'check' : step.icon} size={13} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-0.5">
                  {step.eyebrow}
                </p>
                <p className={`text-xs font-bold truncate ${isActive ? 'text-violet-700' : 'text-stone-700'}`}>
                  {step.title}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  </div>
)

const GoalStep = ({ goalForm, setGoalForm }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    <label className="block md:col-span-2">
      <span className="label-overline block mb-1.5">Goal title</span>
      <input className="input-field" placeholder="e.g., Learn React Basics" value={goalForm.title} onChange={e => setGoalForm({...goalForm, title: e.target.value})} />
      <p className="text-[11px] text-stone-400 mt-1.5 font-medium">A clear goal helps AI organize your learning path.</p>
    </label>
    <label className="block">
      <span className="label-overline block mb-1.5">Start date</span>
      <input className="input-field" type="date" value={goalForm.startDate} onChange={e => setGoalForm({...goalForm, startDate: e.target.value})} />
    </label>
    <label className="block">
      <span className="label-overline block mb-1.5">Deadline</span>
      <input className="input-field" type="date" value={goalForm.deadline} onChange={e => setGoalForm({...goalForm, deadline: e.target.value})} />
    </label>
  </div>
)

const TimeSlotsStep = ({ timeSlotsForm, setTimeSlotsForm, goalForm }) => {
  const addSlot = () => setTimeSlotsForm([...timeSlotsForm, { dayOfWeek: 1, startTime: '08:00', endTime: '09:00' }])
  
  const updateSlot = (index, field, value) => {
    const newSlots = [...timeSlotsForm]
    if (field === 'dayOfWeek') newSlots[index][field] = Number(value)
    else newSlots[index][field] = value
    setTimeSlotsForm(newSlots)
  }

  const removeSlot = (index) => {
    setTimeSlotsForm(timeSlotsForm.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500 mb-4">Add the time windows you usually use for studying. AI will schedule tasks within these slots.</p>
      {timeSlotsForm.map((slot, i) => {
        const today = formatLocalDate()
        const todayDayOfWeek = getDayOfWeekForDate(today)
        const isTodaySlot = Number(slot.dayOfWeek) === todayDayOfWeek && goalForm?.startDate <= today && goalForm?.deadline >= today
        
        return (
        <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl bg-stone-50/50 border border-stone-100 relative">
          <div className="flex flex-wrap md:flex-nowrap items-end gap-3">
            <label className="block flex-1 min-w-[120px]">
              <span className="label-overline block mb-1.5">Day</span>
              <select className="input-field py-2.5" value={slot.dayOfWeek} onChange={e => updateSlot(i, 'dayOfWeek', e.target.value)}>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
                <option value="7">Sunday</option>
              </select>
            </label>
            <label className="block min-w-[140px]">
              <span className="label-overline block mb-1.5">Start</span>
              <input className="input-field py-2.5" type="time" value={slot.startTime} onChange={e => updateSlot(i, 'startTime', e.target.value)} />
            </label>
            <label className="block min-w-[140px]">
              <span className="label-overline block mb-1.5">End</span>
              <input className="input-field py-2.5" type="time" value={slot.endTime} onChange={e => updateSlot(i, 'endTime', e.target.value)} />
            </label>
            <button type="button" className="w-[42px] h-[42px] rounded-xl bg-white border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0" onClick={() => removeSlot(i)} aria-label="Remove slot">
              <StudyIcon name="x" size={16} />
            </button>
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium ml-1">
              {DAY_LABELS[slot.dayOfWeek]} · {formatTime12Hour(slot.startTime)} – {formatTime12Hour(slot.endTime)}
            </p>
            {isTodaySlot && (
              <p className="text-[11px] text-stone-400 ml-1 mt-0.5">
                For today, choose a start time later than now.
              </p>
            )}
          </div>
        </div>
      )})}
      <button type="button" className="btn-ghost text-sm w-full border border-dashed border-stone-200 hover:border-stone-300 py-3 rounded-2xl mt-2" onClick={addSlot}>
        <StudyIcon name="plus" size={14} /> Add Time Slot
      </button>
    </div>
  )
}

const UploadStep = ({ fileForm, setFileForm }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const validateAndSetFile = (file) => {
    setLocalError('')
    if (!file) return

    const isValidPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isValidPdf) {
      setLocalError('Please upload a PDF file.')
      setFileForm(null)
      return
    }
    setFileForm(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    validateAndSetFile(file)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    validateAndSetFile(file)
    e.target.value = ''
  }

  const removeFile = () => {
    setFileForm(null)
    setLocalError('')
  }

  return (
    <div 
      className={`rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
        isDragging 
          ? 'border-violet-400 bg-violet-50/70 scale-[1.01]' 
          : 'border-violet-200 bg-violet-50/30 hover:bg-violet-50/60'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-violet-100">
        <StudyIcon name="upload" size={24} className="text-violet-600" />
      </div>
      <h3 className="text-base font-semibold text-stone-800">
        {isDragging ? 'Drop it here!' : 'Drop your PDF here'}
      </h3>
      <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
        {fileForm ? (
          <span className="font-medium text-violet-700 flex items-center justify-center gap-1.5 mt-2">
            <StudyIcon name="file-text" size={14} />
            {fileForm.name} {fileForm.size ? `(${(fileForm.size / 1024 / 1024).toFixed(2)} MB)` : ''}
          </span>
        ) : 'Upload your textbook, notes, or syllabus. We will extract the study tasks for you.'}
      </p>

      {localError && (
        <p className="text-sm text-red-500 mt-3 font-medium bg-red-50 py-1.5 px-3 rounded-lg inline-block">
          {localError}
        </p>
      )}

      {fileForm ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          <label className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm hover:bg-stone-50 transition-colors cursor-pointer">
            <StudyIcon name="file-text" size={14} />
            Choose a different file
            <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
          </label>
          <button 
            type="button" 
            onClick={removeFile}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 text-red-600 px-4 py-2.5 text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            <StudyIcon name="x" size={14} />
            Remove file
          </button>
        </div>
      ) : (
        <label className="mt-6 mx-auto inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors cursor-pointer">
          <StudyIcon name="file-text" size={14} />
          Browse files
          <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
        </label>
      )}
    </div>
  )
}

const PollingStep = ({ parsedMaterial, errorMsg }) => (
  <div className="space-y-4">
    <div className={`rounded-2xl border p-5 ${parsedMaterial ? 'bg-emerald-50/50 border-emerald-100' : errorMsg ? 'bg-red-50/50 border-red-100' : 'bg-stone-50/80 border-stone-100'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${parsedMaterial ? 'bg-emerald-100 text-emerald-600' : errorMsg ? 'bg-red-100 text-red-600' : 'bg-white text-violet-600 border border-violet-100'}`}>
          <StudyIcon name={parsedMaterial ? "check" : errorMsg ? "alert-circle" : "timer"} size={18} className={!parsedMaterial && !errorMsg ? 'animate-pulse' : ''} />
        </div>
        <div>
          <h3 className={`text-sm font-semibold ${parsedMaterial ? 'text-emerald-800' : errorMsg ? 'text-red-800' : 'text-stone-800'}`}>
            {parsedMaterial ? 'AI parsing completed' : errorMsg ? 'Parsing Failed' : 'Analyzing your document...'}
          </h3>
          <p className={`text-xs mt-0.5 ${parsedMaterial ? 'text-emerald-600' : errorMsg ? 'text-red-600' : 'text-stone-500'}`}>
            {parsedMaterial ? 'Material parsed successfully. Ready to generate schedule.' : errorMsg ? 'We could not parse this document. Try a clearer text-based PDF.' : 'Gemini is reading your PDF and building a study plan. This may take 30–90 seconds depending on the file size.'}
          </p>
        </div>
      </div>
    </div>
    <p className="text-xs text-stone-400 flex items-center justify-center gap-1.5 mt-4">
      <StudyIcon name="timer" size={12} className={!parsedMaterial && !errorMsg ? 'animate-spin' : 'hidden'} />
      {parsedMaterial ? 'You can now proceed to the next step.' : errorMsg ? 'Please go back and try another file.' : 'Please wait...'}
    </p>
  </div>
)

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
          We could not extract any study tasks from this document. Try uploading a clearer, text-based PDF.
        </p>
      </div>
    );
  }

  const allTasks = editablePlan.modules.flatMap(m => m.tasks || []);
  const totalMins = allTasks.reduce((sum, t) => sum + (Number(t.estimatedMinutes) || 25), 0);
  const totalHoursLabel = totalMins < 60 ? '<1' : (totalMins / 60).toFixed(1).replace('.0', '');

  // ---------- module-level helpers ----------
  const updateModuleTitle = (mIdx, newTitle) => {
    setEditablePlan(prev => ({
      ...prev,
      modules: prev.modules.map((mod, i) =>
        i === mIdx ? { ...mod, title: newTitle } : mod
      ),
    }));
  };

  const removeModule = (mIdx) => {
    setEditablePlan(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== mIdx),
    }));
  };

  // ---------- task-level helpers ----------
  const updateTaskField = (mIdx, tIdx, field, value) => {
    setEditablePlan(prev => ({
      ...prev,
      modules: prev.modules.map((mod, i) => {
        if (i !== mIdx) return mod;
        return {
          ...mod,
          tasks: mod.tasks.map((task, j) =>
            j !== tIdx ? task : { ...task, [field]: value }
          ),
        };
      }),
    }));
  };

  const removeTask = (mIdx, tIdx) => {
  setEditablePlan(prev => ({
    ...prev,
    modules: prev.modules
      .map((mod, i) => {
        if (i !== mIdx) return mod;
        const nextTasks = mod.tasks.filter((_, j) => j !== tIdx);
        return { ...mod, tasks: nextTasks };
      })
      .filter(mod => Array.isArray(mod.tasks) && mod.tasks.length > 0),
  }));
};

  const addTask = (mIdx) => {
    const newTask = {
      _id: `${mIdx}-new-${Date.now()}`,
      title: '',
      estimatedMinutes: 25,
    };
    setEditablePlan(prev => ({
      ...prev,
      modules: prev.modules.map((mod, i) => {
        if (i !== mIdx) return mod;
        return { ...mod, tasks: [...mod.tasks, newTask] };
      }),
    }));
  };

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
          <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1.5">Please fix before generating:</p>
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
            <p className="text-xs text-stone-500">Edit titles, durations, or add / remove tasks before generating.</p>
          </div>
        </div>

        <div className="space-y-5 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
          {editablePlan.modules.map((mod, mIdx) => (
            <div key={mod._id ?? mIdx} className="rounded-xl border border-stone-200 bg-white p-3 space-y-3 shadow-sm">
              {/* Module header row */}
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 text-xs font-bold text-stone-700 uppercase tracking-wider bg-transparent border-b border-transparent hover:border-stone-200 focus:border-violet-300 focus:outline-none px-0.5 py-0.5 transition-colors"
                  value={mod.title}
                  placeholder={`Module ${mIdx + 1}`}
                  onChange={e => updateModuleTitle(mIdx, e.target.value)}
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
                  <div key={task._id ?? tIdx} className="flex items-center gap-2 rounded-xl bg-stone-50 border border-stone-100 px-2.5 py-2 hover:border-violet-200 transition-colors group">
                    <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {tIdx + 1}
                    </span>

                    {/* Task title */}
                    <input
                      className="flex-1 text-sm font-medium text-stone-700 bg-transparent border-b border-transparent hover:border-stone-200 focus:border-violet-300 focus:outline-none px-0.5 py-0.5 min-w-0 transition-colors"
                      value={task.title}
                      placeholder="Task title"
                      onChange={e => updateTaskField(mIdx, tIdx, 'title', e.target.value)}
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
                        onChange={e => updateTaskField(mIdx, tIdx, 'estimatedMinutes', e.target.value === '' ? '' : Number(e.target.value))}
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
  );
}

const StepContent = ({ stepId, state }) => {
  if (stepId === 'goal') return <GoalStep goalForm={state.goalForm} setGoalForm={state.setGoalForm} />
  if (stepId === 'slots') return <TimeSlotsStep timeSlotsForm={state.timeSlotsForm} setTimeSlotsForm={state.setTimeSlotsForm} goalForm={state.goalForm} />
  if (stepId === 'upload') return <UploadStep fileForm={state.fileForm} setFileForm={state.setFileForm} />
  if (stepId === 'polling') return <PollingStep parsedMaterial={state.parsedMaterial} errorMsg={state.errorMsg} />
  return (
    <EditablePlanStep
      editablePlan={state.editablePlan}
      setEditablePlan={state.setEditablePlan}
      planErrors={state.planErrors}
    />
  );
}

const PlanningPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)

  // API State
  const [goalForm, setGoalForm] = useState({ title: '', startDate: '', deadline: '' })
  const [timeSlotsForm, setTimeSlotsForm] = useState([{ dayOfWeek: 1, startTime: '08:00', endTime: '09:00' }])
  const [fileForm, setFileForm] = useState(null)

  const [createdGoal, setCreatedGoal] = useState(null)
  const [jobId, setJobId] = useState(null)
  const [parsedMaterial, setParsedMaterial] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Local editable plan — initialised from parsedMaterial.rawJson once AI parsing completes.
  // TODO(next-commit): pass editablePlan (as editedRawJson) to generateSchedule instead of relying solely on materialId.
  const [editablePlan, setEditablePlan] = useState(null)
  // Inline validation errors for the editable plan (shown in EditablePlanStep without alert()).
  const [planErrors, setPlanErrors] = useState([])

  const activeStep = STEPS[currentStep]
  const progress = useMemo(() => Math.round(((currentStep + 1) / STEPS.length) * 100), [currentStep])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Polling Step 4
  useEffect(() => {
    let interval = null;
    let isPolling = true;
    if (currentStep === 3 && jobId && !parsedMaterial && !errorMsg) {
      interval = setInterval(async () => {
        if (!isPolling) return;
        try {
          const res = await getMaterialStatus(jobId);
          if (res.status === 'COMPLETED') {
            setParsedMaterial(res);
            clearInterval(interval);
          } else if (res.status === 'FAILED') {
            setErrorMsg('We could not parse this document. Try a clearer text-based PDF.');
            clearInterval(interval);
          }
        } catch (err) {
          console.error(err);
          setErrorMsg(err?.message || 'Could not check AI parsing status. Please try again.');
          clearInterval(interval);
        }
      }, 3000);
    }
    return () => {
      isPolling = false;
      if (interval) clearInterval(interval);
    };
  }, [currentStep, jobId, parsedMaterial, errorMsg]);

  // Initialise the editable plan once AI parsing completes.
  // Re-runs if parsedMaterial changes (e.g. user retries upload).
  useEffect(() => {
    if (parsedMaterial?.rawJson) {
      setEditablePlan(clonePlan(parsedMaterial.rawJson));
      setPlanErrors([]);
    }
  }, [parsedMaterial]);

  const goNext = async () => {
    const currentError = errorMsg;
    setErrorMsg('');
    setIsLoading(true);
    try {
      if (currentStep === 0) {
        if (!goalForm.title || !goalForm.startDate || !goalForm.deadline) throw new Error("Please fill all fields");
        if (goalForm.deadline < goalForm.startDate) throw new Error("Deadline must be >= Start date");
        const res = await createGoal(goalForm);
        setCreatedGoal(res);
        
        if (timeSlotsForm.length === 1 && timeSlotsForm[0].dayOfWeek === 1 && timeSlotsForm[0].startTime === '08:00' && timeSlotsForm[0].endTime === '09:00') {
          const suggestedDay = getSuggestedDayOfWeekForGoal(goalForm.startDate, goalForm.deadline)
          let defaultStart = '08:00'
          let defaultEnd = '09:00'
          
          const today = formatLocalDate()
          const todayDayOfWeek = getDayOfWeekForDate(today)
          const effectiveStart = goalForm.startDate < today ? today : goalForm.startDate
          
          if (suggestedDay === todayDayOfWeek && effectiveStart === today) {
            const nextSlot = getNextHourSlot()
            defaultStart = nextSlot.startTime
            defaultEnd = nextSlot.endTime
          }

          setTimeSlotsForm([{ dayOfWeek: suggestedDay, startTime: defaultStart, endTime: defaultEnd }])
        }
      } else if (currentStep === 1) {
        if (timeSlotsForm.length === 0) throw new Error("At least 1 time slot required");

        for (const slot of timeSlotsForm) {
          if (!slot.startTime || !slot.endTime || slot.startTime >= slot.endTime) {
            throw new Error("Invalid time slot: Start time must be before end time");
          }

          const matchingDates = getMatchingDatesForSlot(
            goalForm.startDate,
            goalForm.deadline,
            slot.dayOfWeek
          )

          if (matchingDates.length === 0) {
            throw new Error(
              `${DAY_LABELS[slot.dayOfWeek]} is outside your goal date range. Choose a day between the start date and deadline.`
            )
          }

          if (!hasFutureOccurrenceForSlot(matchingDates, slot.startTime)) {
            const today = formatLocalDate()
            const startMinutes = timeToMinutes(slot.startTime)
            const currentMinutes = getCurrentMinutes()
            
            if (matchingDates.includes(today) && startMinutes <= currentMinutes) {
              throw new Error("This time window already started. Choose a start time later than now.")
            }

            throw new Error(
              "Selected time slot is in the past. Choose a future time window within your goal dates."
            )
          }
        }
        await Promise.all(timeSlotsForm.map(ts => createTimeSlot(ts)));
      } else if (currentStep === 2) {
        if (!fileForm) throw new Error("Please select a PDF file");
        const res = await uploadMaterial(fileForm, createdGoal?.id);
        setJobId(res.jobId);
      } else if (currentStep === 3) {
        if (!parsedMaterial) {
          if (currentError) throw new Error(currentError);
          throw new Error("Wait for AI parsing to complete");
        }
      } else if (currentStep === 4) {
        if (!createdGoal?.id || !parsedMaterial?.id) throw new Error("Missing data to generate schedule");

        // Validate the locally-edited plan before calling the API.
        const errors = validateEditablePlan(editablePlan);
        if (errors.length > 0) {
          setPlanErrors(errors);
          // Raise a concise top-level error so the existing errorMsg banner also shows.
          throw new Error("Please fix the plan errors highlighted above before generating.");
        }
        setPlanErrors([]);

        // TODO(next-commit): pass editablePlan (editedRawJson) to generateSchedule so the
        // backend uses the user-edited modules/tasks instead of re-parsing from materialId.
        // For now we still call the original API signature (goalId + materialId only).
        try {
          await generateSchedule({ goalId: createdGoal.id, materialId: parsedMaterial.id });
          navigate('/dashboard');
        } catch (err) {
          const errMsg = err?.data?.message || err?.message || "";
          const normalizedErr = errMsg.toLowerCase();

          if (err?.status === 409 || normalizedErr.includes('already generated')) {
            throw new Error("Schedule was already generated for this goal.");
          }

          if (
            normalizedErr.includes('not enough available study time') || 
            normalizedErr.includes('ai estimated')
          ) {
            throw new Error("Your available study time is not enough for this AI plan. Add more time slots, extend the deadline, or regenerate a lighter plan.");
          }

          if (
            normalizedErr.includes('longest available time slot') || 
            normalizedErr.includes('longer than your longest available time slot')
          ) {
            throw new Error("One or more tasks are longer than your available time windows. Add a longer time slot or regenerate a lighter plan.");
          }

          if (normalizedErr.includes('could not fit all tasks')) {
            throw new Error("Your tasks could not fit cleanly into the selected time windows. Add longer study windows, add more availability, or regenerate a lighter plan.");
          }

          if (
            normalizedErr.includes('parsed') ||
            normalizedErr.includes('rawjson') ||
            normalizedErr.includes('raw json') ||
            normalizedErr.includes('material') ||
            normalizedErr.includes('document')
          ) {
            throw new Error("We could not parse this document properly. Try a clearer text-based PDF.");
          }

          if (
            normalizedErr.includes('time slot') ||
            normalizedErr.includes('availability') ||
            normalizedErr.includes('schedule') ||
            normalizedErr.includes('available')
          ) {
            throw new Error("Could not generate schedule with the selected time slots. Try adding future availability.");
          }

          throw new Error(errMsg || "Failed to generate schedule.");
        }
        return;
      }
      setCurrentStep((step) => step + 1);
    } catch (err) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  const goBack = () => {
    setErrorMsg('');
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1)
      return
    }
    navigate('/dashboard')
  }

  const stateContext = {
    goalForm, setGoalForm,
    timeSlotsForm, setTimeSlotsForm,
    fileForm, setFileForm,
    parsedMaterial, errorMsg,
    editablePlan, setEditablePlan,
    planErrors,
  }

  return (
    <div className="min-h-screen">
      <StudyOrbitBackdrop />
      <AppNav user={user} onLogout={handleLogout} />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-6">
        <section className="animate-slide-up">
          <button
            type="button"
            className="btn-ghost mb-5"
            onClick={() => navigate('/dashboard')}
          >
            <StudyIcon name="chevron-right" size={14} className="rotate-180" />
            Back to dashboard
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
            <div className="lg:col-span-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-violet-100 shadow-sm mb-4">
                <StudyIcon name="lightbulb" size={13} className="text-violet-500" />
                <p className="text-xs text-violet-700 font-medium">Planning flow</p>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 tracking-tight mb-3 leading-tight">
                Build a learning path from your PDF.
              </h1>
              <p className="text-stone-500 text-sm max-w-xl leading-relaxed">
                This UI sets up the MVP journey: create a goal, add free time, upload material, wait for AI parsing, and generate scheduled tasks.
              </p>
            </div>

            <aside className="lg:col-span-2 card p-5 relative overflow-hidden">
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/60 to-transparent" />
              <p className="label-overline mb-2">Current step</p>
              <div className="flex items-center gap-3">
                <IconBadge name={activeStep.icon} bg="bg-violet-100" icon="text-violet-600" badgeSize="w-10 h-10" />
                <div>
                  <h2 className="text-sm font-semibold text-stone-800">{activeStep.title}</h2>
                  <p className="text-xs text-stone-400 mt-0.5">{progress}% ready</p>
                </div>
              </div>
              <div className="mt-4 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </aside>
          </div>
        </section>

        <Stepper currentStep={currentStep} />

        <section className="card card-hover p-6 animate-card-rise" style={{ animationDelay: '0.08s' }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
              <IconBadge name={activeStep.icon} bg="bg-violet-50" icon="text-violet-600" badgeSize="w-10 h-10" />
              <div>
                <p className="label-overline mb-1">{activeStep.eyebrow}</p>
                <h2 className="text-xl font-bold text-stone-800 tracking-tight">{activeStep.title}</h2>
                <p className="text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">{activeStep.description}</p>
              </div>
            </div>
            <span className="badge bg-stone-100 text-stone-500 shrink-0">
              {currentStep + 1} / {STEPS.length}
            </span>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex flex-col items-start gap-2">
              <p>{errorMsg}</p>
              {errorMsg.includes("already generated") && (
                <button type="button" className="btn-ghost mt-1 text-red-700 bg-white/50 border-red-200 hover:bg-white" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </button>
              )}
            </div>
          )}

          <StepContent stepId={activeStep.id} state={stateContext} />

          <div className="divider my-6" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button type="button" className="btn-ghost w-full sm:w-auto justify-center" onClick={goBack} disabled={isLoading}>
              {currentStep === 0 ? 'Cancel' : 'Previous step'}
            </button>
            <button type="button" className="btn-accent w-full sm:w-auto justify-center" onClick={goNext} disabled={isLoading || (currentStep === 3 && !parsedMaterial) || (currentStep === 4 && (!editablePlan || editablePlan.modules.length === 0))}>
              {isLoading && currentStep === STEPS.length - 1 ? (
                <>
                  <StudyIcon name="timer" size={14} className="animate-spin" /> Generating schedule...
                </>
              ) : isLoading ? (
                <>
                  <StudyIcon name="timer" size={14} className="animate-spin" /> Loading...
                </>
              ) : currentStep === STEPS.length - 1 ? (
                <>
                  Generate schedule & go to dashboard <StudyIcon name="arrow-right" size={14} strokeWidth={2.5} />
                </>
              ) : (
                <>
                  Continue <StudyIcon name="arrow-right" size={14} strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default PlanningPage
