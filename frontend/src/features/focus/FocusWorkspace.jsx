import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getTaskById } from '../../api/taskApi'
import { getPomodoroLogsByTask } from '../../api/pomodoroApi'
import { getUserSettings } from '../../api/userSettingsApi'
import { generateQuiz, submitQuiz } from '../../api/quizApi'
import { motion } from 'motion/react'
import StudyIcon from '../../components/StudyIcon'
import FocusDecor from './FocusDecor'
import FocusTimer from './FocusTimer'
import { CurrentTaskPanel, SupportPanel } from './FocusPanels'
import QuizModal from './QuizModal'
import { usePomodoroCycle, PHASES } from './usePomodoroCycle'

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

const navVariants = {
  hidden:  { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const timerVariants = {
  hidden:  { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

export const QUIZ_STATES = {
  IDLE: 'IDLE',
  READY: 'READY',
  GENERATING: 'GENERATING',
  OPEN: 'OPEN',
  ERROR: 'ERROR',
  SUBMITTING: 'SUBMITTING',
  RESULT: 'RESULT'
}

const calculateTargetMinutes = (task, defaultFocus) => {
  if (!task?.startTime || !task?.endTime) return defaultFocus
  try {
    const [h1, m1] = task.startTime.split(':').map(Number)
    const [h2, m2] = task.endTime.split(':').map(Number)
    if (!Number.isInteger(h1) || h1 < 0 || h1 > 23 || 
        !Number.isInteger(m1) || m1 < 0 || m1 > 59 ||
        !Number.isInteger(h2) || h2 < 0 || h2 > 23 ||
        !Number.isInteger(m2) || m2 < 0 || m2 > 59) {
      return defaultFocus
    }
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1)
    return diff > 0 ? diff : defaultFocus
  } catch (e) {
    return defaultFocus
  }
}

const FocusWorkspace = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const taskId = searchParams.get('taskId')

  const [currentTask, setCurrentTask] = useState(null)
  const [isTaskLoading, setIsTaskLoading] = useState(false)
  const [taskError, setTaskError] = useState(null)
  
  const [initData, setInitData] = useState(null)

  const [quizState, setQuizState] = useState(QUIZ_STATES.IDLE)
  const [quizList, setQuizList] = useState([])
  const [quizError, setQuizError] = useState(null)
  const [quizResult, setQuizResult] = useState(null)
  
  const quizGenerationInFlightRef = useRef(false)
  const autoQuizTriggeredRef = useRef(false)
  const workspaceRequestIdRef = useRef(0)

  const handleStartQuizGen = useCallback(async () => {
    if (!taskId || quizGenerationInFlightRef.current || currentTask?.status === 'COMPLETED' || currentTask?.status === 'done') return;
    
    quizGenerationInFlightRef.current = true;
    setQuizState(QUIZ_STATES.GENERATING);
    setQuizError(null);
    
    try {
      const generated = await generateQuiz({ taskId });
      setQuizList(generated);
      setQuizState(QUIZ_STATES.OPEN);
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      setQuizError(err.message || 'Failed to generate quiz.');
      setQuizState(QUIZ_STATES.ERROR);
    } finally {
      quizGenerationInFlightRef.current = false;
    }
  }, [taskId, currentTask]);

  const handleTargetReached = useCallback(() => {
    if (quizState === QUIZ_STATES.IDLE || quizState === QUIZ_STATES.READY) {
      if (!autoQuizTriggeredRef.current) {
        autoQuizTriggeredRef.current = true;
        handleStartQuizGen();
      } else {
        setQuizState(QUIZ_STATES.READY);
      }
    }
  }, [quizState, handleStartQuizGen]);

  const cycle = usePomodoroCycle({ 
    taskId, 
    initData, 
    onTargetReached: handleTargetReached
  })

  const {
    phase, timeLeft, totalTime, saveError, abortError, abortNotice, isAborting,
    focusedMinutes, remainingMinutes, targetMinutes,
    startFocus, pauseFocus, suspendFocusForAbort, resumeFocus, abortFocus, retrySave,
    pauseBreak, resumeBreak, skipBreak, startNextFocus
  } = cycle

  useEffect(() => {
    workspaceRequestIdRef.current += 1;
    setCurrentTask(null);
    setInitData(null);
    setTaskError(null);
    quizGenerationInFlightRef.current = false;
    autoQuizTriggeredRef.current = false;
    setQuizState(QUIZ_STATES.IDLE);
    setQuizList([]);
    setQuizError(null);
    setQuizResult(null);
  }, [taskId]);

  const loadWorkspaceData = useCallback(async () => {
    if (!taskId) return
    const currentRequestId = workspaceRequestIdRef.current;
    try {
      setIsTaskLoading(true)
      setTaskError(null)
      
      const [taskData, settingsData, logsData] = await Promise.all([
        getTaskById(taskId),
        getUserSettings().catch(() => null),
        getPomodoroLogsByTask(taskId)
      ])
      
      if (currentRequestId !== workspaceRequestIdRef.current) return;
      
      setCurrentTask(taskData)
      
      const configuredFocusMinutes = settingsData?.pomodoroDuration ?? 25;
      const configuredBreakMinutes = settingsData?.shortBreakDuration ?? 5;
      
      const targetMins = calculateTargetMinutes(taskData, configuredFocusMinutes);
      
      const initialFocusedMinutes = logsData
        .filter(log => log.status === 'COMPLETED')
        .reduce((sum, log) => {
          const val = Number(log.focusMinutes);
          if (Number.isFinite(val) && val > 0) {
            return sum + val;
          }
          return sum;
        }, 0);

      setInitData({
        taskId,
        targetMinutes: targetMins,
        initialFocusedMinutes,
        configuredFocusMinutes,
        configuredBreakMinutes
      });
      
      if (initialFocusedMinutes >= targetMins && targetMins > 0) {
        setQuizState(QUIZ_STATES.READY);
        autoQuizTriggeredRef.current = true; // Prevent auto-trigger if already reached
      }

    } catch (err) {
      if (currentRequestId !== workspaceRequestIdRef.current) return;
      console.error('Failed to fetch workspace data:', err)
      setTaskError('Could not load task details. Please check your connection and try again.')
    } finally {
      if (currentRequestId === workspaceRequestIdRef.current) {
        setIsTaskLoading(false)
      }
    }
  }, [taskId]);

  useEffect(() => {
    loadWorkspaceData()
  }, [loadWorkspaceData])

  const handleQuizSubmit = async (answers) => {
    if (quizState === QUIZ_STATES.SUBMITTING) return
    try {
      setQuizState(QUIZ_STATES.SUBMITTING)
      setQuizError(null)
      const result = await submitQuiz({
        answers,
        completeTaskAfterSubmit: true
      })
      setQuizResult(result)
      setQuizState(QUIZ_STATES.RESULT)
    } catch (err) {
      console.error('Failed to submit quiz:', err)
      setQuizError(err.message || 'Failed to submit quiz.')
      setQuizState(QUIZ_STATES.OPEN)
    }
  }

  const handleCloseQuiz = () => {
    if (quizState === QUIZ_STATES.RESULT) return;
    setQuizState(QUIZ_STATES.READY);
  }
  const handleBackToDashboard = () => navigate('/dashboard')

  const isCurrentTaskCompleted = currentTask?.status === 'COMPLETED' || currentTask?.status === 'done'
  const isDataLoading = isTaskLoading || phase === PHASES.PROGRESS_LOADING;
  const isGeneratingQuiz = quizState === QUIZ_STATES.GENERATING;
  const disabled = !currentTask || isDataLoading || isCurrentTaskCompleted || phase === PHASES.SAVING_SESSION || phase === PHASES.SESSION_SAVE_ERROR || isAborting || taskError || isGeneratingQuiz;

  let statusText = 'Ready when you are'
  let statusColorClass = 'bg-stone-300'
  
  if (isDataLoading) {
    statusText = 'Loading progress...'
    statusColorClass = 'bg-stone-300'
  } else if (taskError) {
    statusText = 'Data loading failed'
    statusColorClass = 'bg-rose-500'
  } else if (isCurrentTaskCompleted) {
    statusText = 'Task completed'
    statusColorClass = 'bg-emerald-500'
  } else if (quizState === QUIZ_STATES.GENERATING) {
    statusText = 'Generating quiz...'
    statusColorClass = 'bg-blue-400 animate-pulse-soft'
  } else if (phase === PHASES.READY_FOR_QUIZ || quizState === QUIZ_STATES.READY || quizState === QUIZ_STATES.ERROR) {
    statusText = 'Target reached'
    statusColorClass = 'bg-emerald-400'
  } else if (phase === PHASES.FOCUSING) {
    statusText = 'Session running'
    statusColorClass = 'bg-violet-500 animate-pulse-soft'
  } else if (phase === PHASES.FOCUS_PAUSED) {
    statusText = 'Session paused'
    statusColorClass = 'bg-amber-400'
  } else if (phase === PHASES.SAVING_SESSION) {
    statusText = 'Saving session...'
    statusColorClass = 'bg-amber-400 animate-pulse-soft'
  } else if (phase === PHASES.SESSION_SAVE_ERROR) {
    statusText = saveError || 'Failed to save session'
    statusColorClass = 'bg-rose-500'
  } else if (phase === PHASES.BREAKING) {
    statusText = 'Taking a short break'
    statusColorClass = 'bg-teal-500 animate-pulse-soft'
  } else if (phase === PHASES.BREAK_PAUSED) {
    statusText = 'Break paused'
    statusColorClass = 'bg-teal-300'
  } else if (phase === PHASES.READY_FOR_NEXT_FOCUS) {
    statusText = 'Ready for next session'
    statusColorClass = 'bg-violet-400'
  }

  const isQuizOpen = [QUIZ_STATES.GENERATING, QUIZ_STATES.OPEN, QUIZ_STATES.SUBMITTING, QUIZ_STATES.RESULT].includes(quizState);
  const isSubmittingQuiz = quizState === QUIZ_STATES.SUBMITTING;

  return (
    <div className="relative min-h-screen">
      <FocusDecor/>

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
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center shadow-sm">
                <StudyIcon name="layers" size={15} className="text-white"/>
              </div>
              <span className="text-stone-800 text-base font-bold tracking-tight">StudyFlow</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 rounded-full border border-violet-100/80">
              <StudyIcon name="timer" size={12} className="text-violet-500"/>
              <span className="text-xs font-semibold text-violet-700 tracking-wide">Deep Focus</span>
            </div>

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

      <motion.main
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-10 sm:pt-28 sm:pb-14"
        aria-label="Focus workspace"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6 lg:gap-8 items-start">

          <motion.div
            variants={{
              hidden:  { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut', delay: 0.15 } },
            }}
          >
            <CurrentTaskPanel 
              currentTask={currentTask} 
              isTaskLoading={isDataLoading} 
              taskError={taskError} 
              focusedMinutes={focusedMinutes}
              targetMinutes={targetMinutes}
              remainingMinutes={remainingMinutes}
            />
          </motion.div>

          <motion.div
            variants={timerVariants}
            className="flex flex-col items-center justify-start gap-4"
          >
            <FocusTimer
              phase={phase}
              timeLeft={timeLeft}
              totalTime={totalTime}
              onStartFocus={startFocus}
              onPauseFocus={pauseFocus}
              onSuspendFocusForAbort={suspendFocusForAbort}
              onResumeFocus={resumeFocus}
              onAbortFocus={abortFocus}
              onPauseBreak={pauseBreak}
              onResumeBreak={resumeBreak}
              onSkipBreak={skipBreak}
              onStartNextFocus={startNextFocus}
              disabled={disabled}
              isAborting={isAborting}
              quizState={quizState}
              onStartQuizGen={handleStartQuizGen}
              isFinalSession={initData && remainingMinutes > 0 && remainingMinutes < initData.configuredFocusMinutes}
            />

            <div className="flex flex-col items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${statusColorClass}`}/>
                <span className={`text-xs font-medium ${phase === PHASES.SESSION_SAVE_ERROR ? 'text-rose-500' : 'text-stone-500'}`}>
                  {statusText}
                </span>
              </div>
              
              {quizState === QUIZ_STATES.ERROR && quizError && (
                <div className="flex flex-col items-center gap-2 mt-1">
                  <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium rounded-lg text-center max-w-xs">
                    {quizError}
                  </div>
                  <button
                    onClick={handleStartQuizGen}
                    className="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg transition-colors border border-rose-200"
                  >
                    Retry Generate Quiz
                  </button>
                </div>
              )}

              {taskError && (
                <button
                  onClick={loadWorkspaceData}
                  className="mt-1 px-4 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg transition-colors border border-rose-200"
                >
                  Retry Loading
                </button>
              )}

              {phase === PHASES.SESSION_SAVE_ERROR && (
                <button
                  onClick={retrySave}
                  className="mt-1 px-4 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg transition-colors border border-rose-200"
                >
                  Retry Saving
                </button>
              )}

              {abortError && (
                <div className="mt-1 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium rounded-lg">
                  {abortError}
                </div>
              )}

              {abortNotice && (
                <div className="mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 text-stone-500 text-xs font-medium rounded-lg text-center max-w-xs">
                  {abortNotice}
                </div>
              )}
            </div>
          </motion.div>

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
