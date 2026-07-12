import { useState, useEffect, useRef, useCallback } from 'react';
import { savePomodoroLog } from '../../api/pomodoroApi';
import { getUserSettings } from '../../api/userSettingsApi';

// Phases of the Pomodoro cycle
export const PHASES = {
  LOADING_SETTINGS: 'LOADING_SETTINGS',
  IDLE: 'IDLE',
  FOCUSING: 'FOCUSING',
  FOCUS_PAUSED: 'FOCUS_PAUSED',
  SAVING_SESSION: 'SAVING_SESSION',
  SESSION_SAVE_ERROR: 'SESSION_SAVE_ERROR',
  BREAKING: 'BREAKING',
  BREAK_PAUSED: 'BREAK_PAUSED',
  READY_FOR_NEXT_FOCUS: 'READY_FOR_NEXT_FOCUS',
};

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

export function usePomodoroCycle(taskId) {
  const [phase, setPhase] = useState(PHASES.LOADING_SETTINGS);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_MINUTES * 60);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_MINUTES * 60);
  const [pauseCount, setPauseCount] = useState(0);
  
  const [saveError, setSaveError] = useState(null);
  const [abortError, setAbortError] = useState(null);
  const [abortNotice, setAbortNotice] = useState(null);
  const [isAborting, setIsAborting] = useState(false);

  const intervalRef = useRef(null);
  const isSavingRef = useRef(false);
  const completionHandledRef = useRef(false);
  const breakCompletionHandledRef = useRef(false);

  // Clear any running interval
  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Fetch settings on mount
  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const settings = await getUserSettings();
        if (!isMounted) return;
        
        const focusMins = settings?.pomodoroDuration ?? DEFAULT_FOCUS_MINUTES;
        const breakMins = settings?.shortBreakDuration ?? DEFAULT_BREAK_MINUTES;

        setFocusDuration(focusMins * 60);
        setBreakDuration(breakMins * 60);
        
        setTimeLeft(focusMins * 60);
        setTotalTime(focusMins * 60);
        setPhase(PHASES.IDLE);
      } catch (error) {
        console.error('Failed to load user settings, using defaults.', error);
        if (isMounted) {
          setFocusDuration(DEFAULT_FOCUS_MINUTES * 60);
          setBreakDuration(DEFAULT_BREAK_MINUTES * 60);
          setTimeLeft(DEFAULT_FOCUS_MINUTES * 60);
          setTotalTime(DEFAULT_FOCUS_MINUTES * 60);
          setPhase(PHASES.IDLE);
        }
      }
    };
    fetchSettings();
    return () => {
      isMounted = false;
      clearTick();
    };
  }, [clearTick]);

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
    }
  }, [phase, timeLeft]);

  // Action: Complete Focus Session
  const handleFocusComplete = useCallback(async () => {
    if (!taskId || isSavingRef.current) return;
    
    clearTick();
    setPhase(PHASES.SAVING_SESSION);
    setSaveError(null);
    isSavingRef.current = true;

    try {
      // NOTE: backend limitation for Commit 2: passing breakMinutes as 0
      await savePomodoroLog({
        taskId,
        focusMinutes: Math.round(focusDuration / 60),
        breakMinutes: 0,
        pauseCount,
        status: 'COMPLETED'
      });
      
      // Successfully saved -> transition to break
      isSavingRef.current = false;
      setPhase(PHASES.BREAKING);
      setTimeLeft(breakDuration);
      setTotalTime(breakDuration);
      startBreakTick();
    } catch (err) {
      console.error('Failed to save completed session', err);
      isSavingRef.current = false;
      setSaveError(err?.message || 'Failed to save session.');
      setPhase(PHASES.SESSION_SAVE_ERROR);
    }
  }, [taskId, focusDuration, pauseCount, breakDuration, clearTick, startBreakTick]);

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
    if (!taskId) return;
    setAbortError(null);
    setAbortNotice(null);
    completionHandledRef.current = false;
    breakCompletionHandledRef.current = false;
    setPhase(PHASES.FOCUSING);
    startFocusTick();
  }, [taskId, startFocusTick]);

  const pauseFocus = useCallback(() => {
    clearTick();
    setPhase(PHASES.FOCUS_PAUSED);
    setPauseCount(prev => prev + 1);
  }, [clearTick]);

  const suspendFocusForAbort = useCallback(() => {
    clearTick();
    setPhase(PHASES.FOCUS_PAUSED);
    // Does NOT increment pauseCount
  }, [clearTick]);

  const resumeFocus = useCallback(() => {
    setAbortError(null);
    setAbortNotice(null);
    setPhase(PHASES.FOCUSING);
    startFocusTick();
  }, [startFocusTick]);

  const abortFocus = useCallback(async () => {
    if (!taskId || isAborting) return;
    clearTick();
    setIsAborting(true);
    setAbortError(null);
    setAbortNotice(null);
    
    // Calculate actual elapsed minutes for the ABORTED log
    const elapsedSeconds = focusDuration - timeLeft;
    const elapsedMinutes = Math.max(0, Math.floor(elapsedSeconds / 60));

    if (elapsedMinutes < 1) {
      setAbortNotice("Session ended before one full minute, so it was not added to your history.");
      setIsAborting(false);
      setPhase(PHASES.IDLE);
      setTimeLeft(focusDuration);
      setTotalTime(focusDuration);
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
      // Reset to ready
      setPhase(PHASES.IDLE); // IDLE state resets timer in effect below
      setTimeLeft(focusDuration);
      setTotalTime(focusDuration);
      setPauseCount(0);
    } catch (err) {
      console.error('Failed to log aborted session', err);
      setIsAborting(false);
      setAbortError(err?.message || 'Failed to end session.');
      // Stay in FOCUS_PAUSED so user can retry or resume
      setPhase(PHASES.FOCUS_PAUSED);
    }
  }, [taskId, clearTick, focusDuration, timeLeft, pauseCount, isAborting]);

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
  }, [clearTick]);

  const startNextFocus = useCallback(() => {
    if (!taskId) return;
    setAbortError(null);
    setAbortNotice(null);
    completionHandledRef.current = false;
    breakCompletionHandledRef.current = false;
    setPhase(PHASES.FOCUSING);
    setTimeLeft(focusDuration);
    setTotalTime(focusDuration);
    setPauseCount(0);
    startFocusTick();
  }, [taskId, focusDuration, startFocusTick]);
  
  // When switching task in UI while IDLE or READY, we might want to reset
  useEffect(() => {
    if (phase === PHASES.IDLE || phase === PHASES.READY_FOR_NEXT_FOCUS) {
        setTimeLeft(focusDuration);
        setTotalTime(focusDuration);
        setPauseCount(0);
        completionHandledRef.current = false;
        breakCompletionHandledRef.current = false;
    }
  }, [taskId, phase, focusDuration]);

  return {
    phase,
    timeLeft,
    totalTime,
    saveError,
    abortError,
    abortNotice,
    isAborting,
    
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
