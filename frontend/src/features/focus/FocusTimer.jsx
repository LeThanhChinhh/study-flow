import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import StudyIcon from '../../components/StudyIcon'
import { PHASES } from './usePomodoroCycle'

// Timer ring dimensions
const RING_RADIUS = 108
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

// Format seconds into MM:SS display string
const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// FocusTimer owns the countdown state and exposes control handlers
const FocusTimer = ({
  phase,
  timeLeft,
  totalTime,
  onStartFocus,
  onPauseFocus,
  onSuspendFocusForAbort,
  onResumeFocus,
  onAbortFocus,
  onPauseBreak,
  onResumeBreak,
  onSkipBreak,
  onStartNextFocus,
  disabled,
  isAborting,
  quizState,
  onStartQuizGen,
  isFinalSession,
}) => {
  const [showAbortConfirm, setShowAbortConfirm] = useState(false)
  const [wasFocusingBeforeAbort, setWasFocusingBeforeAbort] = useState(false)

  const progress = totalTime > 0 ? (timeLeft / totalTime) : 0
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress)

  const isFocusing = phase === PHASES.FOCUSING
  const isFocusPaused = phase === PHASES.FOCUS_PAUSED
  const isSaving = phase === PHASES.SAVING_SESSION || phase === PHASES.SESSION_SAVE_ERROR
  const isBreaking = phase === PHASES.BREAKING
  const isBreakPaused = phase === PHASES.BREAK_PAUSED
  const isReadyForQuiz = phase === PHASES.READY_FOR_QUIZ || quizState === 'READY'
  const isReady = phase === PHASES.IDLE || phase === PHASES.READY_FOR_NEXT_FOCUS || phase === PHASES.PROGRESS_LOADING || phase === 'LOADING_SETTINGS'

  const prevIsAborting = useRef(isAborting)
  useEffect(() => {
    if (prevIsAborting.current && !isAborting) {
      setShowAbortConfirm(false)
    }
    prevIsAborting.current = isAborting
  }, [isAborting])

  useEffect(() => {
    if (
      phase === PHASES.IDLE ||
      phase === PHASES.BREAKING ||
      phase === PHASES.READY_FOR_NEXT_FOCUS
    ) {
      setShowAbortConfirm(false)
      setWasFocusingBeforeAbort(false)
    }
  }, [phase])

  let statusLabel = 'Ready'
  let ringColor = 'url(#focusGradReady)'
  let isTimerActive = false

  if (isFocusing) {
    statusLabel = 'Focusing'
    ringColor = 'url(#focusGradActive)'
    isTimerActive = true
  } else if (isFocusPaused) {
    statusLabel = 'Paused'
    ringColor = 'url(#focusGradPaused)'
  } else if (isSaving) {
    statusLabel = phase === PHASES.SESSION_SAVE_ERROR ? 'Save Error' : 'Saving Session'
    ringColor = 'url(#focusGradPaused)'
  } else if (isBreaking) {
    statusLabel = 'Short Break'
    ringColor = 'url(#breakGradActive)'
    isTimerActive = true
  } else if (isBreakPaused) {
    statusLabel = 'Break Paused'
    ringColor = 'url(#breakGradPaused)'
  }

  const handleAbortClick = () => {
    setWasFocusingBeforeAbort(isFocusing)
    if (isFocusing) {
      onSuspendFocusForAbort?.()
    }
    setShowAbortConfirm(true)
  }

  const confirmAbort = () => {
    onAbortFocus?.()
  }

  const cancelAbort = () => {
    setShowAbortConfirm(false)
    if (wasFocusingBeforeAbort) {
      onResumeFocus?.()
    }
  }

  return (
    <div className="card p-8 flex flex-col items-center gap-8 relative overflow-hidden w-full max-w-sm mx-auto">
      {/* Subtle top highlight */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/50 to-transparent"/>

      {/* Ring + time display */}
      <div
        className={`relative flex items-center justify-center ${isTimerActive ? 'animate-timer-breathe' : ''}`}
        style={{ width: 280, height: 280 }}
      >
        <svg
          width="280"
          height="280"
          viewBox="0 0 280 280"
          className="-rotate-90"
          aria-hidden="true"
        >
          <defs>
            {/* Ready — neutral violet */}
            <linearGradient id="focusGradReady" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#c4b5fd"/>
              <stop offset="100%" stopColor="#a78bfa"/>
            </linearGradient>
            {/* Active — vibrant violet to rose */}
            <linearGradient id="focusGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#7c3aed"/>
              <stop offset="100%" stopColor="#fb7185"/>
            </linearGradient>
            {/* Paused — muted amber */}
            <linearGradient id="focusGradPaused" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#fbbf24"/>
              <stop offset="100%" stopColor="#f59e0b"/>
            </linearGradient>
            {/* Break Active — teal to emerald */}
            <linearGradient id="breakGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#14b8a6"/>
              <stop offset="100%" stopColor="#10b981"/>
            </linearGradient>
            {/* Break Paused — muted teal */}
            <linearGradient id="breakGradPaused" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#5eead4"/>
              <stop offset="100%" stopColor="#34d399"/>
            </linearGradient>
            {/* Soft shadow filter for the ring */}
            <filter id="ringShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={isBreaking ? '#14b8a6' : '#7c3aed'} floodOpacity="0.18"/>
            </filter>
          </defs>

          {/* Track */}
          <circle
            cx="140" cy="140" r={RING_RADIUS}
            fill="none"
            stroke="#e7e5e4"
            strokeWidth="10"
          />

          {/* Progress arc */}
          <circle
            cx="140" cy="140" r={RING_RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="focus-ring-progress"
            filter={isTimerActive ? 'url(#ringShadow)' : undefined}
          />

          {/* Decorative inner ring */}
          <circle
            cx="140" cy="140" r="94"
            fill="none"
            stroke="#f5f5f4"
            strokeWidth="1"
            opacity="0.7"
          />
        </svg>

        {/* Center content — overlaid on the SVG */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">

          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-2"
            >
              <StudyIcon
                name={isBreaking || isBreakPaused ? 'coffee' : 'timer'}
                size={22}
                className={
                  isFocusing ? 'text-violet-500' :
                  isFocusPaused || phase === PHASES.SESSION_SAVE_ERROR ? 'text-amber-400' :
                  isBreaking ? 'text-teal-500' :
                  isBreakPaused ? 'text-teal-300' :
                  'text-stone-300'
                }
                strokeWidth={1.5}
              />
            </motion.div>
          </AnimatePresence>

          {/* Countdown display */}
          <AnimatePresence mode="wait">
            <motion.span
              key={isSaving ? 'saving' : 'counting'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className={`font-mono tabular-nums font-bold leading-none tracking-tight select-none ${
                isSaving ? 'text-3xl text-amber-500' : 'text-5xl text-stone-800'
              }`}
            >
              {isSaving ? (phase === PHASES.SESSION_SAVE_ERROR ? 'Error' : 'Saving...') : formatTime(timeLeft)}
            </motion.span>
          </AnimatePresence>

          {/* Status label */}
          <AnimatePresence mode="wait">
            <motion.span
              key={statusLabel}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className={`text-xs font-semibold mt-2 tracking-wide uppercase ${
                isFocusing ? 'text-violet-500' :
                isFocusPaused ? 'text-amber-500' :
                isBreaking ? 'text-teal-600' :
                isBreakPaused ? 'text-teal-400' :
                isSaving ? 'text-amber-600' :
                'text-stone-400'
              }`}
            >
              {statusLabel}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center justify-center gap-3 min-h-[44px]" role="group" aria-label="Timer controls">
        {showAbortConfirm ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <span className="text-sm font-semibold text-stone-600 mr-2">
              {isAborting ? 'Ending...' : 'End session?'}
            </span>
            <button
              onClick={confirmAbort}
              disabled={isAborting}
              className={`px-4 py-2 ${isAborting ? 'bg-rose-100 text-rose-400' : 'bg-rose-50 hover:bg-rose-100 text-rose-600'} text-sm font-semibold rounded-xl transition-colors`}
            >
              Yes
            </button>
            <button
              onClick={cancelAbort}
              disabled={isAborting}
              className={`px-4 py-2 ${isAborting ? 'bg-stone-100 text-stone-400' : 'bg-stone-100 hover:bg-stone-200 text-stone-600'} text-sm font-semibold rounded-xl transition-colors`}
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <>
            {/* Start Quiz (when READY_FOR_QUIZ) */}
            {isReadyForQuiz && (
              <motion.button
                onClick={disabled ? undefined : onStartQuizGen}
                disabled={disabled}
                whileTap={!disabled ? { scale: 0.95 } : {}}
                whileHover={!disabled ? { scale: 1.03 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={`flex items-center gap-2 px-7 py-3 ${disabled ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-white'} font-semibold text-sm rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-colors duration-150`}
              >
                <StudyIcon name="zap" size={14} strokeWidth={2.5}/>
                Start recall quiz
              </motion.button>
            )}

            {/* Start Focus (when IDLE or READY) */}
            {isReady && !isReadyForQuiz && (
              <motion.button
                onClick={disabled ? undefined : (phase === PHASES.READY_FOR_NEXT_FOCUS ? onStartNextFocus : onStartFocus)}
                disabled={disabled}
                whileTap={!disabled ? { scale: 0.95 } : {}}
                whileHover={!disabled ? { scale: 1.03 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={`flex items-center gap-2 px-7 py-3 ${disabled ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white'} font-semibold text-sm rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 transition-colors duration-150`}
              >
                <StudyIcon name="play" size={14} strokeWidth={2.5}/>
                {phase === PHASES.READY_FOR_NEXT_FOCUS ? 'Start Next' : 'Start Focus'}
              </motion.button>
            )}

            {/* Pause Focus (when FOCUSING) */}
            {isFocusing && (
              <>
                <motion.button
                  onClick={onPauseFocus}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="flex items-center gap-2 px-7 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-sm rounded-2xl border border-amber-200 hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 transition-colors duration-150"
                >
                  <StudyIcon name="pause" size={14} strokeWidth={2.5}/>
                  Pause
                </motion.button>
                <motion.button
                  onClick={handleAbortClick}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-rose-50 text-stone-500 hover:text-rose-600 font-medium text-sm rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-colors duration-150"
                >
                  <StudyIcon name="square" size={14}/>
                  End
                </motion.button>
              </>
            )}

            {/* Resume / Abort Focus (when FOCUS_PAUSED) */}
            {isFocusPaused && (
              <>
                <motion.button
                  onClick={onResumeFocus}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white font-semibold text-sm rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 transition-colors duration-150"
                >
                  <StudyIcon name="play" size={14} strokeWidth={2.5}/>
                  Resume
                </motion.button>
                <motion.button
                  onClick={handleAbortClick}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-rose-50 text-stone-500 hover:text-rose-600 font-medium text-sm rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-colors duration-150"
                >
                  <StudyIcon name="square" size={14}/>
                  End
                </motion.button>
              </>
            )}

            {/* Pause Break (when BREAKING) */}
            {isBreaking && (
              <>
                <motion.button
                  onClick={onPauseBreak}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="flex items-center gap-2 px-7 py-3 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-sm rounded-2xl border border-teal-200 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 transition-colors duration-150"
                >
                  <StudyIcon name="pause" size={14} strokeWidth={2.5}/>
                  Pause Break
                </motion.button>
                <motion.button
                  onClick={onSkipBreak}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-stone-50 text-stone-500 hover:text-stone-700 font-medium text-sm rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-colors duration-150"
                >
                  <StudyIcon name="fast-forward" size={14}/>
                  Skip
                </motion.button>
              </>
            )}

            {/* Resume Break / Skip Break (when BREAK_PAUSED) */}
            {isBreakPaused && (
              <>
                <motion.button
                  onClick={onResumeBreak}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white font-semibold text-sm rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors duration-150"
                >
                  <StudyIcon name="play" size={14} strokeWidth={2.5}/>
                  Resume
                </motion.button>
                <motion.button
                  onClick={onSkipBreak}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-stone-50 text-stone-500 hover:text-stone-700 font-medium text-sm rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-colors duration-150"
                >
                  <StudyIcon name="fast-forward" size={14}/>
                  Skip
                </motion.button>
              </>
            )}
          </>
        )}
      </div>

      {/* Mode label */}
      <p className="text-xs text-stone-400 -mt-4">
        {isBreaking || isBreakPaused 
          ? `Break · ${Math.max(1, Math.round(totalTime / 60))} min session` 
          : `Pomodoro · ${Math.max(1, Math.round(totalTime / 60))} min session${isFinalSession ? ' (Final)' : ''}`}
      </p>
    </div>
  )
}

export default FocusTimer
