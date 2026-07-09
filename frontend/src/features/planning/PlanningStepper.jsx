import StudyIcon from '../../components/StudyIcon'
import { STEPS } from './planningConstants'

/**
 * Horizontal step indicator for the planning wizard.
 * Props:
 *   currentStep: number — 0-based index of the active step
 */
const PlanningStepper = ({ currentStep }) => (
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

export default PlanningStepper
