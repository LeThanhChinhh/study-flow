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

const SAMPLE_TASKS = [
  { title: 'Đọc và tóm tắt nội dung chính', duration: '25 min' },
  { title: 'Ôn tập các ý quan trọng', duration: '25 min' },
]

const Stepper = ({ currentStep }) => (
  <div className="card p-4">
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
      {STEPS.map((step, index) => {
        const isActive = index === currentStep
        const isDone = index < currentStep
        return (
          <div
            key={step.id}
            className={`rounded-2xl border px-3 py-3 transition-all duration-200 ${
              isActive
                ? 'bg-violet-50 border-violet-200 shadow-sm'
                : isDone
                  ? 'bg-emerald-50 border-emerald-100'
                  : 'bg-white/70 border-stone-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                  isActive
                    ? 'bg-violet-600 text-white'
                    : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-stone-100 text-stone-400'
                }`}
              >
                <StudyIcon name={isDone ? 'check' : step.icon} size={13} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-stone-400">
                  {step.eyebrow}
                </p>
                <p className={`text-xs font-semibold truncate ${isActive ? 'text-violet-700' : 'text-stone-700'}`}>
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
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label className="block md:col-span-2">
      <span className="label-overline block mb-2">Goal title</span>
      <input className="input-field" placeholder="Ví dụ: Ôn tập Công nghệ phần mềm" value={goalForm.title} onChange={e => setGoalForm({...goalForm, title: e.target.value})} />
    </label>
    <label className="block">
      <span className="label-overline block mb-2">Start date</span>
      <input className="input-field" type="date" value={goalForm.startDate} onChange={e => setGoalForm({...goalForm, startDate: e.target.value})} />
    </label>
    <label className="block">
      <span className="label-overline block mb-2">Deadline</span>
      <input className="input-field" type="date" value={goalForm.deadline} onChange={e => setGoalForm({...goalForm, deadline: e.target.value})} />
    </label>
  </div>
)

const TimeSlotsStep = ({ timeSlotsForm, setTimeSlotsForm }) => {
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
      {timeSlotsForm.map((slot, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <label className="block">
            <span className="label-overline block mb-2">Day</span>
            <select className="input-field" value={slot.dayOfWeek} onChange={e => updateSlot(i, 'dayOfWeek', e.target.value)}>
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
              <option value="7">Sunday</option>
            </select>
          </label>
          <label className="block">
            <span className="label-overline block mb-2">Start</span>
            <input className="input-field" type="time" value={slot.startTime} onChange={e => updateSlot(i, 'startTime', e.target.value)} />
          </label>
          <label className="block">
            <span className="label-overline block mb-2">End</span>
            <input className="input-field" type="time" value={slot.endTime} onChange={e => updateSlot(i, 'endTime', e.target.value)} />
          </label>
          <button type="button" className="btn-ghost mb-1" onClick={() => removeSlot(i)}>Remove</button>
        </div>
      ))}
      <button type="button" className="btn-ghost" onClick={addSlot}>+ Add Time Slot</button>
    </div>
  )
}

const UploadStep = ({ fileForm, setFileForm }) => (
  <div className="rounded-3xl border border-dashed border-violet-200 bg-violet-50/40 p-8 text-center">
    <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
      <StudyIcon name="upload" size={22} className="text-violet-600" />
    </div>
    <h3 className="text-base font-semibold text-stone-800">Drop your PDF here</h3>
    <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
      {fileForm ? fileForm.name : 'Select a PDF file to upload'}
    </p>
    <label className="btn-ghost mt-5 inline-flex cursor-pointer">
      <StudyIcon name="file-text" size={14} />
      Choose PDF
      <input type="file" accept=".pdf" className="hidden" onChange={e => setFileForm(e.target.files[0])} />
    </label>
  </div>
)

const PollingStep = ({ parsedMaterial, errorMsg }) => (
  <div className="space-y-4">
    <div className="rounded-2xl bg-stone-50/80 border border-stone-100 p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
          <StudyIcon name={parsedMaterial ? "check" : "timer"} size={18} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-stone-800">
            {parsedMaterial ? 'AI parsing completed' : errorMsg ? 'Parsing Failed' : 'AI parsing status'}
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            {parsedMaterial ? 'Material parsed successfully.' : 'Polling every 3 seconds...'}
          </p>
        </div>
      </div>
      {!parsedMaterial && !errorMsg && (
        <div className="mt-5 h-2 bg-white rounded-full overflow-hidden border border-stone-100">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-violet-500 to-violet-400 progress-fill animate-pulse" />
        </div>
      )}
    </div>
    <p className="text-sm text-stone-500">
      When status becomes <span className="font-semibold text-emerald-600">COMPLETED</span>, the UI will unlock schedule generation.
    </p>
  </div>
)

const ScheduleStep = ({ parsedMaterial }) => {
  const tasks = parsedMaterial?.rawJson?.modules?.[0]?.tasks || SAMPLE_TASKS;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
        <div className="flex items-center gap-3 mb-4">
          <IconBadge name="layers" bg="bg-white" icon="text-violet-600" badgeSize="w-9 h-9" />
          <div>
            <h3 className="text-sm font-semibold text-stone-800">{parsedMaterial?.rawJson?.modules?.[0]?.title || 'Tổng quan tài liệu'}</h3>
            <p className="text-xs text-stone-400">{parsedMaterial?.rawJson?.modules?.length || 1} module · {tasks.length} generated tasks</p>
          </div>
        </div>
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center justify-between gap-3 rounded-xl bg-white/80 border border-white px-3 py-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-500 flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </span>
                <p className="text-sm font-medium text-stone-700 truncate">{task.title}</p>
              </div>
              <span className="badge bg-stone-100 text-stone-500 shrink-0">{task.estimatedMinutes ? `${task.estimatedMinutes} min` : task.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const StepContent = ({ stepId, state }) => {
  if (stepId === 'goal') return <GoalStep goalForm={state.goalForm} setGoalForm={state.setGoalForm} />
  if (stepId === 'slots') return <TimeSlotsStep timeSlotsForm={state.timeSlotsForm} setTimeSlotsForm={state.setTimeSlotsForm} />
  if (stepId === 'upload') return <UploadStep fileForm={state.fileForm} setFileForm={state.setFileForm} />
  if (stepId === 'polling') return <PollingStep parsedMaterial={state.parsedMaterial} errorMsg={state.errorMsg} />
  return <ScheduleStep parsedMaterial={state.parsedMaterial} />
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
  const [createdTimeSlots, setCreatedTimeSlots] = useState([]) // eslint-disable-line no-unused-vars
  const [jobId, setJobId] = useState(null)
  const [parsedMaterial, setParsedMaterial] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const activeStep = STEPS[currentStep]
  const progress = useMemo(() => Math.round(((currentStep + 1) / STEPS.length) * 100), [currentStep])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Polling Step 4
  useEffect(() => {
    let interval = null;
    if (currentStep === 3 && jobId && !parsedMaterial) {
      interval = setInterval(async () => {
        try {
          const res = await getMaterialStatus(jobId);
          if (res.status === 'COMPLETED') {
            setParsedMaterial(res);
            clearInterval(interval);
          } else if (res.status === 'FAILED') {
            setErrorMsg('AI parsing failed. Please try again.');
            clearInterval(interval);
          }
        } catch (err) {
          console.error(err);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStep, jobId, parsedMaterial]);

  const goNext = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      if (currentStep === 0) {
        if (!goalForm.title || !goalForm.startDate || !goalForm.deadline) throw new Error("Please fill all fields");
        if (goalForm.deadline < goalForm.startDate) throw new Error("Deadline must be >= Start date");
        const res = await createGoal(goalForm);
        setCreatedGoal(res);
      } else if (currentStep === 1) {
        if (timeSlotsForm.length === 0) throw new Error("At least 1 time slot required");
        for (const slot of timeSlotsForm) {
          if (!slot.startTime || !slot.endTime || slot.startTime >= slot.endTime) {
            throw new Error("Invalid time slot: Start time must be before end time");
          }
        }
        const created = await Promise.all(timeSlotsForm.map(ts => createTimeSlot(ts)));
        setCreatedTimeSlots(created);
      } else if (currentStep === 2) {
        if (!fileForm) throw new Error("Please select a PDF file");
        const res = await uploadMaterial(fileForm, createdGoal?.id);
        setJobId(res.jobId);
      } else if (currentStep === 3) {
        if (!parsedMaterial) throw new Error("Wait for AI parsing to complete");
      } else if (currentStep === 4) {
        if (!createdGoal?.id || !parsedMaterial?.id) throw new Error("Missing data to generate schedule");
        await generateSchedule({ goalId: createdGoal.id, materialId: parsedMaterial.id });
        navigate('/dashboard');
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
    parsedMaterial, errorMsg
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
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {errorMsg}
            </div>
          )}

          <StepContent stepId={activeStep.id} state={stateContext} />

          <div className="divider my-6" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button type="button" className="btn-ghost w-full sm:w-auto justify-center" onClick={goBack} disabled={isLoading}>
              {currentStep === 0 ? 'Cancel' : 'Previous step'}
            </button>
            <button type="button" className="btn-accent w-full sm:w-auto justify-center" onClick={goNext} disabled={isLoading}>
              {isLoading ? 'Loading...' : currentStep === STEPS.length - 1 ? 'Go to dashboard' : 'Continue'}
              {!isLoading && <StudyIcon name="arrow-right" size={14} strokeWidth={2.5} />}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default PlanningPage
