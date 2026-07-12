import { useState, useEffect, useRef, useCallback } from 'react';
import { savePomodoroLog } from '../../api/pomodoroApi';

// Phases of the Pomodoro cycle
export const PHASES = {
  PROGRESS_LOADING: 'PROGRESS_LOADING',
  IDLE: 'IDLE',
  FOCUSING: 'FOCUSING',
  FOCUS_PAUSED: 'FOCUS_PAUSED',
  SAVING_SESSION: 'SAVING_SESSION',
  SESSION_SAVE_ERROR: 'SESSION_SAVE_ERROR',
  BREAKING: 'BREAKING',
  BREAK_PAUSED: 'BREAK_PAUSED',
  READY_FOR_NEXT_FOCUS: 'READY_FOR_NEXT_FOCUS',
  READY_FOR_QUIZ: 'READY_FOR_QUIZ',
};

export function usePomodoroCycle({ taskId, initData, onTargetReached }) {
  const [phase, setPhase] = useState(PHASES.PROGRESS_LOADING);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [focusedMinutes, setFocusedMinutes] = useState(0);

  const [saveError, setSaveError] = useState(null);
  const [abortError, setAbortError] = useState(null);
  const [abortNotice, setAbortNotice] = useState(null);
  const [isAborting, setIsAborting] = useState(false);

  const intervalRef = useRef(null);
  const isSavingRef = useRef(false);
  const completionHandledRef = useRef(false);
  const breakCompletionHandledRef = useRef(false);
  
  const initializedTaskIdRef = useRef(null);

  const targetMinutes = initData?.targetMinutes || 0;
  const remainingMinutes = Math.max(targetMinutes - focusedMinutes, 0);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Initialize or reset when taskId changes or initData arrives
  useEffect(() => {
    if (!taskId) {
      clearTick();
      setPhase(PHASES.PROGRESS_LOADING);
      initializedTaskIdRef.current = null;
      return;
    }

    if (!initData || initData.taskId !== taskId) {
      clearTick();
      setPhase(PHASES.PROGRESS_LOADING);
      // Wait for correct data
      return;
    }

    if (initializedTaskIdRef.current !== taskId) {
      initializedTaskIdRef.current = taskId;
      setFocusedMinutes(initData.initialFocusedMinutes);
      
      const initialRemaining = Math.max(initData.targetMinutes - initData.initialFocusedMinutes, 0);
      
      if (initialRemaining <= 0) {
        setPhase(PHASES.READY_FOR_QUIZ);
        setTimeLeft(0);
        setTotalTime(0);
      } else {
        setPhase(PHASES.IDLE);
        const nextMin = Math.min(initData.configuredFocusMinutes, initialRemaining);
        setTimeLeft(nextMin * 60);
        setTotalTime(nextMin * 60);
      }
      setPauseCount(0);
      setSaveError(null);
      setAbortError(null);
      setAbortNotice(null);
      completionHandledRef.current = false;
      breakCompletionHandledRef.current = false;
    }
  }, [taskId, initData, clearTick]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => clearTick();
  }, [clearTick]);

  const startBreakTick = useCallback(() => {
    clearTick();
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTick]);

  // Handle break completion side effect
  useEffect(() => {
    if (phase === PHASES.BREAKING && timeLeft === 0 && !breakCompletionHandledRef.current) {
      breakCompletionHandledRef.current = true;
      setPhase(PHASES.READY_FOR_NEXT_FOCUS);
      // Reset timer to next session length
      const nextMin = Math.min(initData?.configuredFocusMinutes || 25, remainingMinutes);
      setTimeLeft(nextMin * 60);
      setTotalTime(nextMin * 60);
    }
  }, [phase, timeLeft, initData, remainingMinutes]);

  // Action: Complete Focus Session
  const handleFocusComplete = useCallback(async () => {
    if (!taskId || !initData || isSavingRef.current) return;
    
    clearTick();
    setPhase(PHASES.SAVING_SESSION);
    setSaveError(null);
    isSavingRef.current = true;

    // Use totalTime to calculate currentSessionMinutes because final session might be shortened
    const currentSessionMinutes = Math.round(totalTime / 60);

    try {
      await savePomodoroLog({
        taskId,
        focusMinutes: currentSessionMinutes,
        breakMinutes: 0,
        pauseCount,
        status: 'COMPLETED'
      });
      
      // Successfully saved
      isSavingRef.current = false;
      
      const newFocusedMinutes = focusedMinutes + currentSessionMinutes;
      setFocusedMinutes(newFocusedMinutes);
      
      const newRemaining = Math.max(initData.targetMinutes - newFocusedMinutes, 0);

      if (newRemaining <= 0) {
        setPhase(PHASES.READY_FOR_QUIZ);
        onTargetReached?.();
      } else {
        setPhase(PHASES.BREAKING);
        setTimeLeft(initData.configuredBreakMinutes * 60);
        setTotalTime(initData.configuredBreakMinutes * 60);
        startBreakTick();
      }
    } catch (err) {
      console.error('Failed to save completed session', err);
      isSavingRef.current = false;
      setSaveError(err?.message || 'Failed to save session.');
      setPhase(PHASES.SESSION_SAVE_ERROR);
    }
  }, [taskId, initData, pauseCount, clearTick, startBreakTick, totalTime, focusedMinutes, onTargetReached]);

  // Handle completion side effect when timer hits 0
  useEffect(() => {
    if (phase === PHASES.FOCUSING && timeLeft === 0 && !completionHandledRef.current) {
      completionHandledRef.current = true;
      handleFocusComplete();
    }
  }, [phase, timeLeft, handleFocusComplete]);

  const retrySave = useCallback(() => {
    if (phase === PHASES.SESSION_SAVE_ERROR) {
      handleFocusComplete();
    }
  }, [phase, handleFocusComplete]);

  // Focus Timer Tick
  const startFocusTick = useCallback(() => {
    clearTick();
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTick]);

  // Public Actions
  const startFocus = useCallback(() => {
    if (!taskId || !initData || remainingMinutes <= 0) return;
    
    setAbortError(null);
    setAbortNotice(null);
    completionHandledRef.current = false;
    breakCompletionHandledRef.current = false;
    setPhase(PHASES.FOCUSING);
    startFocusTick();
  }, [taskId, initData, startFocusTick, remainingMinutes]);

  const pauseFocus = useCallback(() => {
    clearTick();
    setPhase(PHASES.FOCUS_PAUSED);
    setPauseCount(prev => prev + 1);
  }, [clearTick]);

  const suspendFocusForAbort = useCallback(() => {
    clearTick();
    setPhase(PHASES.FOCUS_PAUSED);
  }, [clearTick]);

  const resumeFocus = useCallback(() => {
    setAbortError(null);
    setAbortNotice(null);
    setPhase(PHASES.FOCUSING);
    startFocusTick();
  }, [startFocusTick]);

  const abortFocus = useCallback(async () => {
    if (!taskId || !initData || isAborting) return;
    clearTick();
    setIsAborting(true);
    setAbortError(null);
    setAbortNotice(null);
    
    const elapsedSeconds = totalTime - timeLeft;
    const elapsedMinutes = Math.max(0, Math.floor(elapsedSeconds / 60));

    if (elapsedMinutes < 1) {
      setAbortNotice("Session ended before one full minute, so it was not added to your history.");
      setIsAborting(false);
      setPhase(PHASES.IDLE);
      setTimeLeft(totalTime);
      setPauseCount(0);
      return;
    }

    try {
      await savePomodoroLog({
        taskId,
        focusMinutes: elapsedMinutes,
        breakMinutes: 0,
        pauseCount,
        status: 'ABORTED'
      });
      
      setIsAborting(false);
      setPhase(PHASES.IDLE); 
      setTimeLeft(totalTime);
      setPauseCount(0);
    } catch (err) {
      console.error('Failed to log aborted session', err);
      setIsAborting(false);
      setAbortError(err?.message || 'Failed to end session.');
      setPhase(PHASES.FOCUS_PAUSED);
    }
  }, [taskId, initData, clearTick, totalTime, timeLeft, pauseCount, isAborting]);

  const pauseBreak = useCallback(() => {
    clearTick();
    setPhase(PHASES.BREAK_PAUSED);
  }, [clearTick]);

  const resumeBreak = useCallback(() => {
    setPhase(PHASES.BREAKING);
    startBreakTick();
  }, [startBreakTick]);

  const skipBreak = useCallback(() => {
    clearTick();
    setPhase(PHASES.READY_FOR_NEXT_FOCUS);
    const nextMin = Math.min(initData?.configuredFocusMinutes || 25, remainingMinutes);
    setTimeLeft(nextMin * 60);
    setTotalTime(nextMin * 60);
  }, [clearTick, initData, remainingMinutes]);

  const startNextFocus = useCallback(() => {
    if (!taskId || !initData || remainingMinutes <= 0) return;
    setAbortError(null);
    setAbortNotice(null);
    completionHandledRef.current = false;
    breakCompletionHandledRef.current = false;
    setPhase(PHASES.FOCUSING);
    
    const nextMin = Math.min(initData.configuredFocusMinutes, remainingMinutes);
    setTimeLeft(nextMin * 60);
    setTotalTime(nextMin * 60);
    setPauseCount(0);
    startFocusTick();
  }, [taskId, initData, remainingMinutes, startFocusTick]);

  return {
    phase,
    timeLeft,
    totalTime,
    saveError,
    abortError,
    abortNotice,
    isAborting,
    
    focusedMinutes,
    remainingMinutes,
    targetMinutes,
    
    startFocus,
    pauseFocus,
    suspendFocusForAbort,
    resumeFocus,
    abortFocus,
    retrySave,
    
    pauseBreak,
    resumeBreak,
    skipBreak,
    startNextFocus,
  };
}
