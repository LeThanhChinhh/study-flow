import { useState } from 'react'
import StudyIcon from '../../components/StudyIcon'
import { DAY_LABELS } from './planningConstants'
import { formatTime12Hour, formatLocalDate, getDayOfWeekForDate } from './planningUtils'
import EditablePlanStep from './EditablePlanStep'

// ─── GoalStep ────────────────────────────────────────────────────────────────

export const GoalStep = ({ goalForm, setGoalForm }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    <label className="block md:col-span-2">
      <span className="label-overline block mb-1.5">Goal title</span>
      <input
        className="input-field"
        placeholder="e.g., Learn React Basics"
        value={goalForm.title}
        onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
      />
      <p className="text-[11px] text-stone-400 mt-1.5 font-medium">
        A clear goal helps AI organize your learning path.
      </p>
    </label>
    <label className="block">
      <span className="label-overline block mb-1.5">Start date</span>
      <input
        className="input-field"
        type="date"
        value={goalForm.startDate}
        onChange={(e) => setGoalForm({ ...goalForm, startDate: e.target.value })}
      />
    </label>
    <label className="block">
      <span className="label-overline block mb-1.5">Deadline</span>
      <input
        className="input-field"
        type="date"
        value={goalForm.deadline}
        onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
      />
    </label>
  </div>
)

// ─── TimeSlotsStep ────────────────────────────────────────────────────────────

export const TimeSlotsStep = ({ timeSlotsForm, setTimeSlotsForm, goalForm }) => {
  const addSlot = () =>
    setTimeSlotsForm([...timeSlotsForm, { dayOfWeek: 1, startTime: '08:00', endTime: '09:00' }])

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
      <p className="text-sm text-stone-500 mb-4">
        Add the time windows you usually use for studying. AI will schedule tasks within these slots.
      </p>
      {timeSlotsForm.map((slot, i) => {
        const today = formatLocalDate()
        const todayDayOfWeek = getDayOfWeekForDate(today)
        const isTodaySlot =
          Number(slot.dayOfWeek) === todayDayOfWeek &&
          goalForm?.startDate <= today &&
          goalForm?.deadline >= today

        return (
          <div
            key={i}
            className="flex flex-col gap-2 p-4 rounded-2xl bg-stone-50/50 border border-stone-100 relative"
          >
            <div className="flex flex-wrap md:flex-nowrap items-end gap-3">
              <label className="block flex-1 min-w-[120px]">
                <span className="label-overline block mb-1.5">Day</span>
                <select
                  className="input-field py-2.5"
                  value={slot.dayOfWeek}
                  onChange={(e) => updateSlot(i, 'dayOfWeek', e.target.value)}
                >
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
                <input
                  className="input-field py-2.5"
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateSlot(i, 'startTime', e.target.value)}
                />
              </label>
              <label className="block min-w-[140px]">
                <span className="label-overline block mb-1.5">End</span>
                <input
                  className="input-field py-2.5"
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateSlot(i, 'endTime', e.target.value)}
                />
              </label>
              <button
                type="button"
                className="w-[42px] h-[42px] rounded-xl bg-white border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0"
                onClick={() => removeSlot(i)}
                aria-label="Remove slot"
              >
                <StudyIcon name="x" size={16} />
              </button>
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium ml-1">
                {DAY_LABELS[slot.dayOfWeek]} · {formatTime12Hour(slot.startTime)} –{' '}
                {formatTime12Hour(slot.endTime)}
              </p>
              {isTodaySlot && (
                <p className="text-[11px] text-stone-400 ml-1 mt-0.5">
                  For today, choose a start time later than now.
                </p>
              )}
            </div>
          </div>
        )
      })}
      <button
        type="button"
        className="btn-ghost text-sm w-full border border-dashed border-stone-200 hover:border-stone-300 py-3 rounded-2xl mt-2"
        onClick={addSlot}
      >
        <StudyIcon name="plus" size={14} /> Add Time Slot
      </button>
    </div>
  )
}

// ─── UploadStep ───────────────────────────────────────────────────────────────

export const UploadStep = ({ fileForm, setFileForm }) => {
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
        ) : (
          'Upload your textbook, notes, or syllabus. We will extract the study tasks for you.'
        )}
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

// ─── PollingStep ──────────────────────────────────────────────────────────────

export const PollingStep = ({ parsedMaterial, errorMsg }) => (
  <div className="space-y-4">
    <div
      className={`rounded-2xl border p-5 ${
        parsedMaterial
          ? 'bg-emerald-50/50 border-emerald-100'
          : errorMsg
            ? 'bg-red-50/50 border-red-100'
            : 'bg-stone-50/80 border-stone-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
            parsedMaterial
              ? 'bg-emerald-100 text-emerald-600'
              : errorMsg
                ? 'bg-red-100 text-red-600'
                : 'bg-white text-violet-600 border border-violet-100'
          }`}
        >
          <StudyIcon
            name={parsedMaterial ? 'check' : errorMsg ? 'alert-circle' : 'timer'}
            size={18}
            className={!parsedMaterial && !errorMsg ? 'animate-pulse' : ''}
          />
        </div>
        <div>
          <h3
            className={`text-sm font-semibold ${
              parsedMaterial ? 'text-emerald-800' : errorMsg ? 'text-red-800' : 'text-stone-800'
            }`}
          >
            {parsedMaterial
              ? 'AI parsing completed'
              : errorMsg
                ? 'Parsing Failed'
                : 'Analyzing your document...'}
          </h3>
          <p
            className={`text-xs mt-0.5 ${
              parsedMaterial ? 'text-emerald-600' : errorMsg ? 'text-red-600' : 'text-stone-500'
            }`}
          >
            {parsedMaterial
              ? 'Material parsed successfully. Ready to generate schedule.'
              : errorMsg
                ? 'We could not parse this document. Try a clearer text-based PDF.'
                : 'Gemini is reading your PDF and building a study plan. This may take 30–90 seconds depending on the file size.'}
          </p>
        </div>
      </div>
    </div>
    <p className="text-xs text-stone-400 flex items-center justify-center gap-1.5 mt-4">
      <StudyIcon
        name="timer"
        size={12}
        className={!parsedMaterial && !errorMsg ? 'animate-spin' : 'hidden'}
      />
      {parsedMaterial
        ? 'You can now proceed to the next step.'
        : errorMsg
          ? 'Please go back and try another file.'
          : 'Please wait...'}
    </p>
  </div>
)

// ─── StepContent (router) ─────────────────────────────────────────────────────

/**
 * Renders the appropriate step component based on the current step ID.
 * Receives the full stateContext object from PlanningPage.
 */
const StepContent = ({ stepId, state }) => {
  if (stepId === 'goal')
    return <GoalStep goalForm={state.goalForm} setGoalForm={state.setGoalForm} />
  if (stepId === 'slots')
    return (
      <TimeSlotsStep
        timeSlotsForm={state.timeSlotsForm}
        setTimeSlotsForm={state.setTimeSlotsForm}
        goalForm={state.goalForm}
      />
    )
  if (stepId === 'upload')
    return <UploadStep fileForm={state.fileForm} setFileForm={state.setFileForm} />
  if (stepId === 'polling')
    return <PollingStep parsedMaterial={state.parsedMaterial} errorMsg={state.errorMsg} />
  return (
    <EditablePlanStep
      editablePlan={state.editablePlan}
      setEditablePlan={state.setEditablePlan}
      planErrors={state.planErrors}
    />
  )
}

export default StepContent
