import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getTaskById } from '../../api/taskApi'
import { savePomodoroLog } from '../../api/pomodoroApi'
import { generateQuiz, submitQuiz } from '../../api/quizApi'
import { motion } from 'motion/react'
import StudyIcon from '../../components/StudyIcon'
import FocusDecor from './FocusDecor'
import FocusTimer from './FocusTimer'
import { CurrentTaskPanel, SupportPanel } from './FocusPanels'
import QuizModal from './QuizModal'
import { POMODORO_SECONDS } from './focusData'

// Timer status values: 'ready' | 'focusing' | 'paused' | 'complete'

// Entrance animation variants for the main content wrapper
const contentVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.12,
    },
  },
}

// Top bar slides in from above
const navVariants = {
  hidden:  { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// Timer column rises slightly slower for hero feel
const timerVariants = {
  hidden:  { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

const FocusWorkspace = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const taskId = searchParams.get('taskId')

  const [currentTask, setCurrentTask] = useState(null)
  const [isTaskLoading, setIsTaskLoading] = useState(false)
  const [taskError, setTaskError] = useState(null)

  // Completion & Quiz state
  const [isCompletingSession, setIsCompletingSession] = useState(false)
  const [quizList, setQuizList] = useState([])
  const [quizError, setQuizError] = useState(null)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false)
  const [quizResult, setQuizResult] = useState(null)
  
  const hasHandledCompletionRef = useRef(false)

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return
      try {
        setIsTaskLoading(true)
        setTaskError(null)
        const taskData = await getTaskById(taskId)
        setCurrentTask(taskData)
      } catch (err) {
        console.error('Failed to fetch task for focus session:', err)
        setTaskError('Could not load task details. Using fallback data.')
      } finally {
        setIsTaskLoading(false)
      }
    }
    fetchTask()
  }, [taskId])


  // Timer state
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_SECONDS)
  const [status, setStatus]           = useState('ready')
  const intervalRef = useRef(null)

  // Clear any running interval
  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => () => clearTick(), [clearTick])

  // Tick logic — decrements every second while focusing
  const startTick = useCallback(() => {
    clearTick()
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setStatus('complete')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTick])

  const handleStart = () => {
    setStatus('focusing')
    startTick()
  }

  const handlePause = () => {
    clearTick()
    setStatus('paused')
  }

  const handleResume = () => {
    setStatus('focusing')
    startTick()
  }

  const handleReset = () => {
    clearTick()
    setSecondsLeft(POMODORO_SECONDS)
    setStatus('ready')
    hasHandledCompletionRef.current = false
  }

  const handleTimerComplete = async () => {
    if (!currentTask?.id) {
      setQuizError('No current task found to generate quiz.')
      setIsQuizOpen(true)
      return
    }
    if (hasHandledCompletionRef.current) return
    hasHandledCompletionRef.current = true

    try {
      setIsCompletingSession(true)
      setQuizError(null)

      // 1. Save Pomodoro Log
      await savePomodoroLog({
        taskId: currentTask.id,
        focusMinutes: Math.max(1, Math.round(POMODORO_SECONDS / 60))
      })

      // 2. Generate Quiz
      const quizzes = await generateQuiz({
        taskId: currentTask.id
      })
      
      setQuizList(quizzes)
      setIsQuizOpen(true)
    } catch (err) {
      console.error('Failed to complete session:', err)
      setQuizError(err.message || 'Failed to complete session and load quiz.')
      setIsQuizOpen(true)
    } finally {
      setIsCompletingSession(false)
    }
  }

  const handleQuizSubmit = async (answers) => {
    if (isSubmittingQuiz) return
    try {
      setIsSubmittingQuiz(true)
      setQuizError(null)
      const result = await submitQuiz({
        answers,
        completeTaskAfterSubmit: true
      })
      setQuizResult(result)
    } catch (err) {
      console.error('Failed to submit quiz:', err)
      setQuizError(err.message || 'Failed to submit quiz.')
    } finally {
      setIsSubmittingQuiz(false)
    }
  }

  const handleCloseQuiz = () => setIsQuizOpen(false)
  const handleBackToDashboard = () => navigate('/dashboard')

  return (
    <div className="relative min-h-screen">
      <FocusDecor/>

      {/* Floating glass top bar — inset-x-0 so it mirrors the max-w-6xl grid below */}
      <motion.nav
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className="absolute top-4 inset-x-0 z-20 px-4 sm:px-6"
        aria-label="Focus workspace navigation"
      >
        <div className="max-w-6xl mx-auto">
          <div
            className="flex items-center justify-between gap-4 px-5 py-3"
            style={{
              background: 'rgba(252, 250, 247, 0.84)',
              backdropFilter: 'blur(14px) saturate(180%)',
              WebkitBackdropFilter: 'blur(14px) saturate(180%)',
              border: '1px solid rgba(124, 58, 237, 0.10)',
              borderRadius: '18px',
              boxShadow: '0 2px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center shadow-sm">
                <StudyIcon name="layers" size={15} className="text-white"/>
              </div>
              <span className="text-stone-800 text-base font-bold tracking-tight">StudyFlow</span>
            </div>

            {/* Mode label */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 rounded-full border border-violet-100/80">
              <StudyIcon name="timer" size={12} className="text-violet-500"/>
              <span className="text-xs font-semibold text-violet-700 tracking-wide">Deep Focus</span>
            </div>

            {/* Back to Dashboard */}
            <motion.button
              id="focus-back-btn"
              onClick={() => navigate('/dashboard')}
              whileTap={{ scale: 0.96 }}
              className="btn-ghost text-sm"
              aria-label="Return to Dashboard"
            >
              <StudyIcon name="chevron-right" size={13} className="rotate-180"/>
              Dashboard
            </motion.button>
          </div>
        </div>
      </motion.nav>


      {/* Main content — 3-column on large screens, stacked on small */}
      {/* pt-24 clears the floating header on all screen sizes */}
      <motion.main
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-10 sm:pt-28 sm:pb-14"
        aria-label="Focus workspace"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6 lg:gap-8 items-start">

          {/* Left panel — Current Task */}
          <motion.div
            variants={{
              hidden:  { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut', delay: 0.15 } },
            }}
          >
            <CurrentTaskPanel currentTask={currentTask} isTaskLoading={isTaskLoading} taskError={taskError} />
          </motion.div>

          {/* Center — Timer (hero) */}
          <motion.div
            variants={timerVariants}
            className="flex flex-col items-center justify-start gap-4"
          >
            <FocusTimer
              secondsLeft={secondsLeft}
              status={status}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onReset={handleReset}
              onComplete={handleTimerComplete}
            />

            {/* Session mode indicator (visible below the timer on all sizes) */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  status === 'focusing' ? 'bg-violet-500 animate-pulse-soft' :
                  status === 'complete' ? 'bg-emerald-500' :
                  status === 'paused'   ? 'bg-amber-400' :
                  'bg-stone-300'
                }`}/>
                <span className="text-xs text-stone-500 font-medium">
                  {isCompletingSession ? 'Saving session and preparing quiz...' :
                   status === 'focusing' ? 'Session running' :
                   status === 'complete' ? 'Great work!' :
                   status === 'paused'   ? 'Session paused' :
                   'Ready when you are'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right panel — Support */}
          <motion.div
            variants={{
              hidden:  { opacity: 0, x: 20 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut', delay: 0.2 } },
            }}
          >
            <SupportPanel/>
          </motion.div>
        </div>
      </motion.main>

      <QuizModal 
        isOpen={isQuizOpen}
        quizzes={quizList}
        isSubmitting={isSubmittingQuiz}
        error={quizError}
        result={quizResult}
        onSubmit={handleQuizSubmit}
        onClose={handleCloseQuiz}
        onBackToDashboard={handleBackToDashboard}
      />
    </div>
  )
}

export default FocusWorkspace
