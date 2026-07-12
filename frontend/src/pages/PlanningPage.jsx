import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import StudyIcon, { IconBadge } from '../components/StudyIcon'
import AppBackground from '../components/background/AppBackground'
import { AppNav } from '../features/dashboard/DashboardSections'

import { createGoal } from '../api/goalApi'
import { createTimeSlot } from '../api/timeSlotApi'
import { uploadMaterial, getMaterialStatus } from '../api/materialApi'
import { generateSchedule } from '../api/scheduleApi'

import { STEPS, DAY_LABELS } from '../features/planning/planningConstants'
import {
  formatLocalDate,
  getDayOfWeekForDate,
  timeToMinutes,
  getCurrentMinutes,
  getNextHourSlot,
  getMatchingDatesForSlot,
  hasFutureOccurrenceForSlot,
  getSuggestedDayOfWeekForGoal,
  clonePlan,
  validateEditablePlan,
  buildPlanningDataPayload,
} from '../features/planning/planningUtils'
import PlanningStepper from '../features/planning/PlanningStepper'
import StepContent from '../features/planning/PlanningSteps'

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
    let interval = null
    let isPolling = true
    if (currentStep === 3 && jobId && !parsedMaterial && !errorMsg) {
      interval = setInterval(async () => {
        if (!isPolling) return
        try {
          const res = await getMaterialStatus(jobId)
          if (res.status === 'COMPLETED') {
            setParsedMaterial(res)
            clearInterval(interval)
          } else if (res.status === 'FAILED') {
            setErrorMsg('We could not parse this document. Try a clearer text-based PDF.')
            clearInterval(interval)
          }
        } catch (err) {
          console.error(err)
          setErrorMsg(err?.message || 'Could not check AI parsing status. Please try again.')
          clearInterval(interval)
        }
      }, 3000)
    }
    return () => {
      isPolling = false
      if (interval) clearInterval(interval)
    }
  }, [currentStep, jobId, parsedMaterial, errorMsg])

  // Initialise the editable plan once AI parsing completes.
  // Re-runs if parsedMaterial changes (e.g. user retries upload).
  useEffect(() => {
    if (parsedMaterial?.rawJson) {
      setEditablePlan(clonePlan(parsedMaterial.rawJson))
      setPlanErrors([])
    }
  }, [parsedMaterial])

  const goNext = async () => {
    const currentError = errorMsg
    setErrorMsg('')
    setIsLoading(true)
    try {
      if (currentStep === 0) {
        if (!goalForm.title || !goalForm.startDate || !goalForm.deadline)
          throw new Error('Please fill all fields')
        if (goalForm.deadline < goalForm.startDate)
          throw new Error('Deadline must be >= Start date')
        const res = await createGoal(goalForm)
        setCreatedGoal(res)

        if (
          timeSlotsForm.length === 1 &&
          timeSlotsForm[0].dayOfWeek === 1 &&
          timeSlotsForm[0].startTime === '08:00' &&
          timeSlotsForm[0].endTime === '09:00'
        ) {
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
        if (timeSlotsForm.length === 0) throw new Error('At least 1 time slot required')

        for (const slot of timeSlotsForm) {
          if (!slot.startTime || !slot.endTime || slot.startTime >= slot.endTime) {
            throw new Error('Invalid time slot: Start time must be before end time')
          }

          const matchingDates = getMatchingDatesForSlot(
            goalForm.startDate,
            goalForm.deadline,
            slot.dayOfWeek,
          )

          if (matchingDates.length === 0) {
            throw new Error(
              `${DAY_LABELS[slot.dayOfWeek]} is outside your goal date range. Choose a day between the start date and deadline.`,
            )
          }

          if (!hasFutureOccurrenceForSlot(matchingDates, slot.startTime)) {
            const today = formatLocalDate()
            const startMinutes = timeToMinutes(slot.startTime)
            const currentMinutes = getCurrentMinutes()

            if (matchingDates.includes(today) && startMinutes <= currentMinutes) {
              throw new Error('This time window already started. Choose a start time later than now.')
            }

            throw new Error(
              'Selected time slot is in the past. Choose a future time window within your goal dates.',
            )
          }
        }
        await Promise.all(timeSlotsForm.map((ts) => createTimeSlot(ts)))
      } else if (currentStep === 2) {
        if (!fileForm) throw new Error('Please select a PDF file')
        const res = await uploadMaterial(fileForm, createdGoal?.id)
        setJobId(res.jobId)
      } else if (currentStep === 3) {
        if (!parsedMaterial) {
          if (currentError) throw new Error(currentError)
          throw new Error('Wait for AI parsing to complete')
        }
      } else if (currentStep === 4) {
        if (!createdGoal?.id || !parsedMaterial?.id)
          throw new Error('Missing data to generate schedule')

        // Validate the locally-edited plan before calling the API.
        const errors = validateEditablePlan(editablePlan)
        if (errors.length > 0) {
          setPlanErrors(errors)
          // Raise a concise top-level error so the existing errorMsg banner also shows.
          throw new Error('Please fix the plan errors highlighted above before generating.')
        }
        setPlanErrors([])

        const planningData = buildPlanningDataPayload(editablePlan)

        try {
          await generateSchedule({ goalId: createdGoal.id, materialId: parsedMaterial.id, planningData })
          navigate('/dashboard')
        } catch (err) {
          const errMsg = err?.data?.message || err?.message || ''
          const normalizedErr = errMsg.toLowerCase()

          if (err?.status === 409 || normalizedErr.includes('already generated')) {
            throw new Error('Schedule was already generated for this goal.')
          }

          if (
            normalizedErr.includes('not enough available study time') ||
            normalizedErr.includes('ai estimated')
          ) {
            throw new Error(
              'Your available study time is not enough for this AI plan. Add more time slots, extend the deadline, or regenerate a lighter plan.',
            )
          }

          if (
            normalizedErr.includes('longest available time slot') ||
            normalizedErr.includes('longer than your longest available time slot')
          ) {
            throw new Error(
              'One or more tasks are longer than your available time windows. Add a longer time slot or regenerate a lighter plan.',
            )
          }

          if (normalizedErr.includes('could not fit all tasks')) {
            throw new Error(
              'Your tasks could not fit cleanly into the selected time windows. Add longer study windows, add more availability, or regenerate a lighter plan.',
            )
          }

          if (
            normalizedErr.includes('parsed') ||
            normalizedErr.includes('rawjson') ||
            normalizedErr.includes('raw json') ||
            normalizedErr.includes('material') ||
            normalizedErr.includes('document')
          ) {
            throw new Error('We could not parse this document properly. Try a clearer text-based PDF.')
          }

          if (
            normalizedErr.includes('time slot') ||
            normalizedErr.includes('availability') ||
            normalizedErr.includes('schedule') ||
            normalizedErr.includes('available')
          ) {
            throw new Error(
              'Could not generate schedule with the selected time slots. Try adding future availability.',
            )
          }

          throw new Error(errMsg || 'Failed to generate schedule.')
        }
        return
      }
      setCurrentStep((step) => step + 1)
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const goBack = () => {
    setErrorMsg('')
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
      <AppBackground variant="planning" />
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
                This UI sets up the MVP journey: create a goal, add free time, upload material, wait
                for AI parsing, and generate scheduled tasks.
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
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </aside>
          </div>
        </section>

        <PlanningStepper currentStep={currentStep} />

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
              {errorMsg.includes('already generated') && (
                <button
                  type="button"
                  className="btn-ghost mt-1 text-red-700 bg-white/50 border-red-200 hover:bg-white"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </button>
              )}
            </div>
          )}

          <StepContent stepId={activeStep.id} state={stateContext} />

          <div className="divider my-6" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              className="btn-ghost w-full sm:w-auto justify-center"
              onClick={goBack}
              disabled={isLoading}
            >
              {currentStep === 0 ? 'Cancel' : 'Previous step'}
            </button>
            <button
              type="button"
              className="btn-accent w-full sm:w-auto justify-center"
              onClick={goNext}
              disabled={
                isLoading ||
                (currentStep === 3 && !parsedMaterial) ||
                (currentStep === 4 && (!editablePlan || editablePlan.modules.length === 0))
              }
            >
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
