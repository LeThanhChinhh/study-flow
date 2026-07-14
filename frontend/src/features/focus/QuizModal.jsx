import { useState } from 'react'
import StudyIcon from '../../components/StudyIcon'
import QuizReviewQuestion from '../quiz/QuizReviewQuestion'

// Sub components

const getQuizId = (quiz) => quiz?.id || quiz?.quizId
const getOptionId = (option) => option?.id || option?.optionId || option?.selectedOptionId

/**
 * Single quiz question card with option buttons.
 * Calls onSelect(quizId, optionId) when user picks an answer.
 */
const QuizQuestion = ({ quiz, index, selectedOptionId, onSelect }) => {
  const quizId = getQuizId(quiz)
  return (
    <div
      className="relative rounded-2xl border border-stone-200/80 bg-white/70 p-5 flex flex-col gap-4"
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Subtle violet top accent */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-violet-300/50 to-transparent"
      />

      {/* Question header */}
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 shrink-0 rounded-xl bg-violet-100 flex items-center justify-center">
          <span className="text-xs font-bold text-violet-700">{index + 1}</span>
        </div>
        <p className="text-sm font-semibold text-stone-800 leading-snug pt-0.5">
          {quiz.questionText || quiz.question || quiz.title || 'Question'}
        </p>
      </div>


      <div className="flex flex-col gap-2 pl-10" role="radiogroup" aria-label={`Question ${index + 1} options`}>
        {quiz.options.map((opt, optIdx) => {
          const optId = getOptionId(opt)
          const isSelected = selectedOptionId === optId
          return (
            <button
              key={optId || optIdx}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(quizId, optId)}
              className={`
                w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium
                transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-1
                ${isSelected
                  ? 'border-violet-400 bg-violet-50 text-violet-800 shadow-sm'
                  : 'border-stone-200 bg-white/60 text-stone-600 hover:border-violet-200 hover:bg-violet-50/50 hover:text-stone-800'
                }
              `}
            >
              <span className="flex items-center gap-2.5">
                {/* Radio indicator */}
                <span
                  className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                    transition-colors duration-150
                    ${isSelected ? 'border-violet-500' : 'border-stone-300'}
                  `}
                >
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-violet-500" />
                  )}
                </span>
                {opt.optionText || opt.text || opt.label || 'Untitled option'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Result screen shown after quiz is submitted.
 */
const QuizResult = ({ result, onBackToDashboard }) => {
  const { totalQuestions, correctAnswers, scorePercent, results } = result
  const isPerfect   = scorePercent === 100
  const isPassing   = scorePercent >= 60
  const scoreColor  = isPerfect ? 'text-emerald-600' : isPassing ? 'text-violet-600' : 'text-rose-500'
  const ringColor   = isPerfect
    ? 'bg-emerald-500'
    : isPassing
    ? 'bg-gradient-to-br from-violet-500 to-violet-400'
    : 'bg-rose-400'

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Score ring */}
      <div
        className={`w-24 h-24 rounded-full ${ringColor} flex items-center justify-center shadow-lg relative`}
      >
        <span className="text-2xl font-bold text-white tabular-nums">
          {scorePercent}%
        </span>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-stone-100">
          {isPerfect ? (
            <StudyIcon name="trophy" size={16} className="text-emerald-500" />
          ) : isPassing ? (
            <StudyIcon name="check-circle" size={16} className="text-violet-500" />
          ) : (
            <StudyIcon name="bar-chart" size={16} className="text-rose-500" />
          )}
        </div>
      </div>

      {/* Message */}
      <div className="text-center">
        <h3 className={`text-xl font-bold ${scoreColor}`}>
          {isPerfect ? 'Great recall!' : isPassing ? 'Good job!' : 'Good start — review this task once more.'}
        </h3>
        <p className="text-sm text-stone-500 mt-1">
          You got{' '}
          <span className="font-semibold text-stone-700">{correctAnswers}</span>
          {' '}out of{' '}
          <span className="font-semibold text-stone-700">{totalQuestions}</span>
          {' '}questions correct.
        </p>
      </div>

      {/* Stats chips */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <span className="badge bg-emerald-50 text-emerald-700">
          <StudyIcon name="check" size={11} className="text-emerald-500" />
          {correctAnswers} correct
        </span>
        <span className="badge bg-rose-50 text-rose-600">
          <StudyIcon name="x" size={11} className="text-rose-400" />
          {totalQuestions - correctAnswers} wrong
        </span>
        {isPassing && (
          <span className="badge bg-violet-50 text-violet-700">
            <StudyIcon name="zap" size={11} className="text-violet-500" />
            Task completed
          </span>
        )}
      </div>

      {/* Review Questions */}
      {results && results.length > 0 && (
        <div className="w-full text-left mt-4 flex flex-col gap-4">
          <h4 className="text-sm font-bold text-stone-700 px-1 border-b border-stone-100 pb-2">Review Answers</h4>
          {results.map((item, idx) => (
            <QuizReviewQuestion key={item.quizId} item={item} index={idx} />
          ))}
        </div>
      )}

      {/* CTA */}
      <button
        id="quiz-back-to-dashboard"
        onClick={onBackToDashboard}
        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white font-semibold text-sm rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 transition-colors duration-150"
      >
        <StudyIcon name="layers" size={14} />
        Back to Dashboard
      </button>
    </div>
  )
}

// Main component

const QuizModal = ({
  isOpen,
  quizzes = [],
  isSubmitting = false,
  error = null,
  result = null,
  onSubmit,
  onClose,
  onBackToDashboard,
}) => {
  // answers: { [quizId]: selectedOptionId }
  const [answers, setAnswers] = useState({})

  const handleSelect = (quizId, optionId) => {
    if (!quizId) return
    setAnswers((prev) => ({ ...prev, [quizId]: optionId }))
  }

  const answeredCount  = quizzes.filter(q => answers[getQuizId(q)]).length
  const totalQuestions = quizzes.length
  const allAnswered    = answeredCount === totalQuestions && totalQuestions > 0
  const canSubmit      = allAnswered && !isSubmitting

  const handleSubmit = () => {
    if (!canSubmit) return
    const payload = quizzes.map((q) => {
      const qId = getQuizId(q)
      return {
        quizId: qId,
        selectedOptionId: answers[qId],
      }
    })
    onSubmit?.(payload)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        key="quiz-overlay"
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(15, 10, 30, 0.42)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-modal-title"
      >
        <div
          key="quiz-panel"
          className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(252, 250, 247, 0.92)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(124, 58, 237, 0.14)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {/* Violet top edge highlight */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent"
          />


          <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <StudyIcon name="zap" size={17} className="text-violet-600" />
              </div>
              <div>
                <h2
                  id="quiz-modal-title"
                  className="text-base font-bold text-stone-800 leading-snug"
                >
                  {result ? 'Session Results' : 'Quick Recall'}
                </h2>
                {!result && (
                  <p className="text-xs text-stone-500 mt-0.5">
                    Answer these questions to lock in what you studied.
                  </p>
                )}
              </div>
            </div>

            {/* Close only shown before result */}
            {!result && (
              <button
                id="quiz-modal-close"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-300"
                aria-label="Close quiz"
                disabled={isSubmitting}
              >
                <StudyIcon name="x" size={14} />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="mx-6 h-px bg-stone-100" />


          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {result ? (
              <QuizResult result={result} onBackToDashboard={onBackToDashboard} />
            ) : (
              <>
                {/* Progress indicator */}
                {totalQuestions > 0 && (
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-stone-500">
                      {answeredCount} / {totalQuestions} answered
                    </span>
                    <div className="flex items-center gap-1.5">
                      {quizzes.map((q, index) => {
                        const qId = getQuizId(q)

                        return (
                          <div
                            key={qId || index}
                            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                              qId && answers[qId] ? 'bg-violet-500' : 'bg-stone-200'
                            }`}
                          />
                        )
                      })}
                    </div>
                  </div>
                )}


                {totalQuestions === 0 && !error && (
                  <div className="flex flex-col items-center gap-3 py-8 text-stone-400">
                    <StudyIcon name="timer" size={28} className="animate-spin text-violet-400" />
                    <p className="text-sm">Loading questions…</p>
                  </div>
                )}

                {/* Error banner */}
                {error && (
                  <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200">
                    <StudyIcon name="alert-circle" size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-700 leading-snug">{error}</p>
                  </div>
                )}

                {/* Questions */}
                {quizzes.map((quiz, i) => {
                  const qId = getQuizId(quiz)
                  return (
                    <QuizQuestion
                      key={qId || i}
                      quiz={quiz}
                      index={i}
                      selectedOptionId={qId ? answers[qId] : null}
                      onSelect={handleSelect}
                    />
                  )
                })}
              </>
            )}
          </div>

          {/* Footer (hidden when showing result) */}
          {!result && (
            <>
              <div className="mx-6 h-px bg-stone-100" />
              <div className="px-6 py-4 shrink-0 flex items-center justify-between gap-3">
                {/* Helper text / Close */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors focus:outline-none"
                  >
                    Close
                  </button>
                  <p className="text-xs text-stone-400 hidden sm:block">
                    {allAnswered
                      ? 'All questions answered — ready to submit!'
                      : `${totalQuestions - answeredCount} question${totalQuestions - answeredCount !== 1 ? 's' : ''} remaining`}
                  </p>
                </div>

                {/* Submit button */}
                <button
                  id="quiz-submit-btn"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-2xl font-semibold text-sm
                    transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2
                    ${canSubmit
                      ? 'bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white shadow-md'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    }
                  `}
                  aria-disabled={!canSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <StudyIcon name="timer" size={14} className="animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <StudyIcon name="arrow-right" size={14} />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default QuizModal
