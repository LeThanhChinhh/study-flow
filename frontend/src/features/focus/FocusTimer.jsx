import { motion, AnimatePresence } from 'motion/react'
import StudyIcon from '../../components/StudyIcon'
import { POMODORO_SECONDS } from './focusData'

// Timer ring dimensions
const RING_RADIUS = 108
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

// Format seconds into MM:SS display string
const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Map timer status to human-readable label
const STATUS_LABELS = {
  ready:    'Ready to Focus',
  focusing: 'Focusing',
  paused:   'Paused',
  complete: 'Session Complete',
}

// Map timer status to ring stroke color (via SVG gradient id or plain color)
const STATUS_RING_COLOR = {
  ready:    'url(#focusGradReady)',
  focusing: 'url(#focusGradActive)',
  paused:   'url(#focusGradPaused)',
  complete: 'url(#focusGradDone)',
}

// FocusTimer owns the countdown state and exposes control handlers
const FocusTimer = ({ secondsLeft, status, onStart, onPause, onResume, onReset }) => {
  const progress = secondsLeft / POMODORO_SECONDS
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress)
  const isFocusing = status === 'focusing'
  const isComplete = status === 'complete'
  const isReady    = status === 'ready'
  const isPaused   = status === 'paused'

  return (
    <div className="flex flex-col items-center gap-8">

      {/* Ring + time display */}
      <div
        className={`relative flex items-center justify-center ${isFocusing ? 'animate-timer-breathe' : ''}`}
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
            {/* Complete — emerald */}
            <linearGradient id="focusGradDone" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#34d399"/>
              <stop offset="100%" stopColor="#10b981"/>
            </linearGradient>
            {/* Soft shadow filter for the ring */}
            <filter id="ringShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#7c3aed" floodOpacity="0.18"/>
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
            stroke={STATUS_RING_COLOR[status]}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="focus-ring-progress"
            filter={isFocusing ? 'url(#ringShadow)' : undefined}
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

          {/* Animated status icon — changes with state */}
          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="complete-icon"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center mb-2 shadow-sm"
              >
                <StudyIcon name="check" size={16} className="text-white" strokeWidth={3}/>
              </motion.div>
            ) : (
              <motion.div
                key="timer-icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-2"
              >
                <StudyIcon
                  name="timer"
                  size={22}
                  className={
                    isFocusing ? 'text-violet-500' :
                    isPaused   ? 'text-amber-400' :
                    'text-stone-300'
                  }
                  strokeWidth={1.5}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Countdown display */}
          <AnimatePresence mode="wait">
            <motion.span
              key={isComplete ? 'done' : 'counting'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className={`font-mono tabular-nums font-bold leading-none tracking-tight select-none ${
                isComplete ? 'text-3xl text-emerald-600' : 'text-5xl text-stone-800'
              }`}
            >
              {isComplete ? 'Done!' : formatTime(secondsLeft)}
            </motion.span>
          </AnimatePresence>

          {/* Status label */}
          <AnimatePresence mode="wait">
            <motion.span
              key={status}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className={`text-xs font-semibold mt-2 tracking-wide uppercase ${
                isFocusing ? 'text-violet-500' :
                isPaused   ? 'text-amber-500' :
                isComplete ? 'text-emerald-600' :
                'text-stone-400'
              }`}
            >
              {STATUS_LABELS[status]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-3" role="group" aria-label="Timer controls">

        {/* Start / Resume (shown when ready or paused) */}
        {(isReady || isPaused) && (
          <motion.button
            id="focus-timer-start"
            onClick={isReady ? onStart : onResume}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white font-semibold text-sm rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 transition-colors duration-150"
            aria-label={isReady ? 'Start focus session' : 'Resume focus session'}
          >
            <StudyIcon name="play" size={14} strokeWidth={2.5}/>
            {isReady ? 'Start' : 'Resume'}
          </motion.button>
        )}

        {/* Pause (shown when focusing) */}
        {isFocusing && (
          <motion.button
            id="focus-timer-pause"
            onClick={onPause}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex items-center gap-2 px-7 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-sm rounded-2xl border border-amber-200 hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 transition-colors duration-150"
            aria-label="Pause focus session"
          >
            <StudyIcon name="pause" size={14} strokeWidth={2.5}/>
            Pause
          </motion.button>
        )}

        {/* Reset (hidden when ready — no point resetting before starting) */}
        {!isReady && (
          <motion.button
            id="focus-timer-reset"
            onClick={onReset}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex items-center gap-2 px-4 py-3 bg-white/80 hover:bg-stone-50 text-stone-500 hover:text-stone-700 font-medium text-sm rounded-2xl border border-stone-200 hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:ring-offset-2 transition-colors duration-150"
            aria-label="Reset timer to 25 minutes"
          >
            <StudyIcon name="clock" size={14}/>
            Reset
          </motion.button>
        )}
      </div>

      {/* Pomodoro label */}
      <p className="text-xs text-stone-400 -mt-4">
        Pomodoro · {POMODORO_SECONDS / 60} min session
      </p>
    </div>
  )
}

export default FocusTimer
