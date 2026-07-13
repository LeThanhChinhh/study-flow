const getOptionId = (option) => option?.id || option?.optionId || option?.selectedOptionId

const QuizReviewQuestion = ({ item, index }) => {
  const isCorrect = Boolean(item?.isCorrect)

  return (
    <div
      className="relative rounded-2xl border border-stone-200/80 bg-white/70 p-5 flex flex-col gap-4"
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent to-transparent ${
          isCorrect ? 'via-emerald-300/50' : 'via-rose-300/50'
        }`}
      />

      <div className="flex items-start gap-3">
        <div className={`w-7 h-7 shrink-0 rounded-xl ${isCorrect ? 'bg-emerald-100' : 'bg-rose-100'} flex items-center justify-center`}>
          <span className={`text-xs font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
            {index + 1}
          </span>
        </div>
        <p className="text-sm font-semibold text-stone-800 leading-snug pt-0.5">
          {item.questionText}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:pl-10">
        {item.options.map((option) => {
          const optionId = getOptionId(option)
          const isSelected = item.selectedOptionId === optionId
          const isCorrectOption = item.correctOptionId === optionId

          let stateClasses = 'border-stone-200 bg-white/60 text-stone-500 opacity-70'
          let indicatorBorder = 'border-stone-300'
          let label = null

          if (isCorrectOption) {
            stateClasses = 'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm'
            indicatorBorder = 'border-emerald-500'
            label = (
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-md">
                {isSelected ? 'Your Answer' : 'Correct Answer'}
              </span>
            )
          } else if (isSelected) {
            stateClasses = 'border-rose-400 bg-rose-50 text-rose-800 shadow-sm'
            indicatorBorder = 'border-rose-500'
            label = (
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100/50 px-2 py-0.5 rounded-md">
                Your Answer
              </span>
            )
          }

          return (
            <div
              key={optionId}
              className={`w-full flex items-center gap-2 text-left px-4 py-2.5 rounded-xl border text-sm font-medium ${stateClasses}`}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2.5">
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${indicatorBorder}`}>
                  {(isSelected || isCorrectOption) && (
                    <span className={`w-2 h-2 rounded-full ${isCorrectOption ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  )}
                </span>
                <span className="min-w-0 break-words">
                  {option.optionText || option.text || option.label || 'Untitled option'}
                </span>
              </span>
              {label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default QuizReviewQuestion
