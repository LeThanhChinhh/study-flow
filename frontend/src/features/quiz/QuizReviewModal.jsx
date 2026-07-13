import { useEffect } from 'react'
import StudyIcon from '../../components/StudyIcon'
import QuizReviewQuestion from './QuizReviewQuestion'

const formatAnsweredAt = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const QuizReviewModal = ({ review, onClose }) => {
  useEffect(() => {
    if (!review) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [review, onClose])

  if (!review) return null

  const answeredAt = formatAnsweredAt(review.answeredAt)
  const isPerfect = review.scorePercent === 100
  const isPassing = review.scorePercent >= 60
  const ringClass = isPerfect
    ? 'bg-emerald-500'
    : isPassing
      ? 'bg-gradient-to-br from-violet-500 to-violet-400'
      : 'bg-rose-400'

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-stone-950/45"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quiz-review-title"
          className="pointer-events-auto w-full max-w-xl max-h-[90vh] overflow-hidden rounded-3xl bg-[#fcfaf7] border border-violet-100 shadow-2xl flex flex-col"
        >
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-stone-100 shrink-0">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
                <StudyIcon name="check-circle" size={18} className="text-violet-600" />
              </div>
              <div className="min-w-0">
                <h2 id="quiz-review-title" className="text-base font-bold text-stone-800">
                  Quiz Review
                </h2>
                <p className="text-xs text-stone-500 mt-0.5 break-words">{review.taskTitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-700 transition-colors shrink-0"
              aria-label="Close quiz review"
            >
              <StudyIcon name="x" size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 rounded-2xl border border-stone-100 bg-white/70 p-5 mb-5">
              <div className={`w-20 h-20 rounded-full ${ringClass} flex items-center justify-center shadow-md shrink-0 self-center`}>
                <span className="text-xl font-bold text-white tabular-nums">{review.scorePercent}%</span>
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <p className="text-sm font-bold text-stone-800">
                  {review.correctAnswers} of {review.totalQuestions} correct
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Review your selected answers and the correct choices below.
                </p>
                {answeredAt && (
                  <p className="text-[11px] text-stone-400 mt-2">Answered {answeredAt}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {review.results.map((item, index) => (
                <QuizReviewQuestion key={item.quizId} item={item} index={index} />
              ))}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-stone-100 bg-white/60 flex justify-end shrink-0">
            <button type="button" onClick={onClose} className="btn-accent px-5 py-2 text-sm">
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default QuizReviewModal
