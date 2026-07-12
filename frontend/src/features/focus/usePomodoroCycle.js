import { useState, useEffect, useRef, useCallback } from 'react';
import { savePomodoroLog } from '../../api/pomodoroApi';
import { usePersistedPomodoroSession } from './usePersistedPomodoroSession';

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

export function usePomodoroCycle({ taskId, initData, serverLogs, onTargetReached, onDiscard }) {
  const [phase, setPhase] = useState(PHASES.PROGRESS_LOADING);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [focusedMinutes, setFocusedMinutes] = useState(0);

  const [saveError, setSaveError] = useState(null);
  const [abortError, setAbortError] = useState(null);
  const [abortNotice, setAbortNotice] = useState(null);
  const [isAborting, setIsAborting] = useState(false);

  const { readSession, saveSession, clearSession } = usePersistedPomodoroSession();

  const intervalRef = useRef(null);
  const isSavingRef = useRef(false);
  const initializedTaskIdRef = useRef(null);
  const expectedEndAtRef = useRef(null);
  const clientSessionIdRef = useRef(null);
  const pendingLogRef = useRef(null);

  const targetMinutes = initData?.targetMinutes || 0;
  const remainingMinutes = Math.max(targetMinutes - focusedMinutes, 0);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const persistCurrentState = useCallback((overrides = {}) => {
    if (!taskId || !initData) return;
    saveSession({
      taskId,
      clientSessionId: overrides.clientSessionId !== undefined ? overrides.clientSessionId : clientSessionIdRef.current,
      phase: overrides.phase || phase,
      sessionDurationSeconds: overrides.sessionDurationSeconds !== undefined ? overrides.sessionDurationSeconds : totalTime,
      remainingSecondsWhenPaused: overrides.remainingSecondsWhenPaused !== undefined ? overrides.remainingSecondsWhenPaused : (expectedEndAtRef.current ? null : timeLeft),
      startedAt: overrides.startedAt || Date.now(),
      expectedEndAt: overrides.expectedEndAt !== undefined ? overrides.expectedEndAt : expectedEndAtRef.current,
      pauseCount: overrides.pauseCount !== undefined ? overrides.pauseCount : pauseCount,
      pendingLog: overrides.pendingLog !== undefined ? overrides.pendingLog : pendingLogRef.current,
      focusedMinutesSnapshot: overrides.focusedMinutesSnapshot !== undefined ? overrides.focusedMinutesSnapshot : focusedMinutes,
      targetMinutesSnapshot: overrides.targetMinutesSnapshot !== undefined ? overrides.targetMinutesSnapshot : targetMinutes
    });
  }, [taskId, initData, phase, totalTime, timeLeft, pauseCount, focusedMinutes, targetMinutes, saveSession]);

  const persistReconciliationError = useCallback((snapshot) => {
    if (!taskId || !initData) return;
    saveSession({
      taskId,
      clientSessionId: snapshot.clientSessionId,
      phase: PHASES.SESSION_SAVE_ERROR,
      sessionDurationSeconds: snapshot.sessionDurationSeconds,
      remainingSecondsWhenPaused: 0,
      startedAt: snapshot.startedAt || Date.now(),
      expectedEndAt: null,
      pauseCount: snapshot.pauseCount,
      pendingLog: snapshot.pendingLog,
      focusedMinutesSnapshot: snapshot.focusedMinutesSnapshot,
      targetMinutesSnapshot: snapshot.targetMinutesSnapshot !== undefined ? snapshot.targetMinutesSnapshot : initData.targetMinutes
    });
  }, [taskId, initData, saveSession]);

  const runTimerTick = useCallback(() => {
    clearTick();
    intervalRef.current = setInterval(() => {
      if (!expectedEndAtRef.current) return;
      const now = Date.now();
      const remaining = Math.max(Math.ceil((expectedEndAtRef.current - now) / 1000), 0);
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearTick();
      }
    }, 500);
  }, [clearTick]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && expectedEndAtRef.current) {
        const now = Date.now();
        const remaining = Math.max(Math.ceil((expectedEndAtRef.current - now) / 1000), 0);
        setTimeLeft(remaining);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const initFromScratch = useCallback(() => {
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
    clientSessionIdRef.current = null;
    expectedEndAtRef.current = null;
    pendingLogRef.current = null;
  }, [initData]);

  const handlePendingLogSuccess = useCallback((snapshot, pendingLog) => {
    pendingLogRef.current = null; // Clear pending log on success
    
    if (pendingLog.status === 'COMPLETED') {
      const newFocused = snapshot.focusedMinutesSnapshot + pendingLog.focusMinutes;
      setFocusedMinutes(newFocused);
      const newRemaining = Math.max(initData.targetMinutes - newFocused, 0);
      
      if (newRemaining <= 0) {
        clearSession();
        setPhase(PHASES.READY_FOR_QUIZ);
        onTargetReached?.();
      } else {
        setPhase(PHASES.BREAKING);
        const breakMins = initData.configuredBreakMinutes * 60;
        setTimeLeft(breakMins);
        setTotalTime(breakMins);
        clientSessionIdRef.current = null;
        expectedEndAtRef.current = Date.now() + breakMins * 1000;
        persistCurrentState({ 
          phase: PHASES.BREAKING, 
          expectedEndAt: expectedEndAtRef.current, 
          remainingSecondsWhenPaused: null, 
          clientSessionId: null,
          pendingLog: null,
          sessionDurationSeconds: breakMins,
          focusedMinutesSnapshot: newFocused
        });
        runTimerTick();
      }
    } else if (pendingLog.status === 'ABORTED') {
      setIsAborting(false);
      setAbortError(null);
      clearSession();
      setPhase(PHASES.IDLE); 
      setTimeLeft(snapshot.sessionDurationSeconds);
      setTotalTime(snapshot.sessionDurationSeconds);
      setPauseCount(0);
      clientSessionIdRef.current = null;
      expectedEndAtRef.current = null;
      setFocusedMinutes(snapshot.focusedMinutesSnapshot);
    }
  }, [initData, onTargetReached, clearSession, persistCurrentState, runTimerTick]);

  const reconcileSave = useCallback(async (snapshot) => {
    if (!snapshot.clientSessionId || !snapshot.pendingLog) {
      clearSession();
      initFromScratch();
      return;
    }

    const matchedLog = serverLogs?.find(log => log.clientSessionId === snapshot.clientSessionId);
    
    if (matchedLog) {
      if (
        matchedLog.status === snapshot.pendingLog.status &&
        matchedLog.focusMinutes === snapshot.pendingLog.focusMinutes &&
        matchedLog.breakMinutes === snapshot.pendingLog.breakMinutes &&
        matchedLog.pauseCount === snapshot.pendingLog.pauseCount
      ) {
        // Match found on server, accept it without doing another POST.
        // Also don't increment focusMinutes locally because initialFocusedMinutes already aggregates this log!
        const fakeSnapshotToAvoidDoubleCount = {
          ...snapshot,
          focusedMinutesSnapshot: initData.initialFocusedMinutes - (snapshot.pendingLog.status === 'COMPLETED' ? snapshot.pendingLog.focusMinutes : 0)
        };
        handlePendingLogSuccess(fakeSnapshotToAvoidDoubleCount, snapshot.pendingLog);
      } else {
        // Mismatch means conflict state
        setSaveError('Session conflict detected. Please discard this local session or refresh.');
        setPhase(PHASES.SESSION_SAVE_ERROR);
        setFocusedMinutes(snapshot.focusedMinutesSnapshot);
        setTimeLeft(0);
        setTotalTime(snapshot.sessionDurationSeconds);
        setPauseCount(snapshot.pauseCount);
        clientSessionIdRef.current = snapshot.clientSessionId;
        pendingLogRef.current = snapshot.pendingLog;
        persistReconciliationError(snapshot);
      }
    } else {
      // Need to save
      setPhase(PHASES.SAVING_SESSION);
      setFocusedMinutes(snapshot.focusedMinutesSnapshot);
      setTimeLeft(0);
      setTotalTime(snapshot.sessionDurationSeconds);
      setPauseCount(snapshot.pauseCount);
      clientSessionIdRef.current = snapshot.clientSessionId;
      pendingLogRef.current = snapshot.pendingLog;
      
      isSavingRef.current = true;
      try {
        await savePomodoroLog({
          taskId,
          clientSessionId: snapshot.clientSessionId,
          ...snapshot.pendingLog
        });
        isSavingRef.current = false;
        handlePendingLogSuccess(snapshot, snapshot.pendingLog);
      } catch (err) {
        isSavingRef.current = false;
        if (err?.status === 409) {
          setSaveError('Session conflict detected. Please discard this local session or refresh.');
        } else {
          setSaveError(err?.message || 'Failed to save session.');
        }
        setPhase(PHASES.SESSION_SAVE_ERROR);
        persistReconciliationError(snapshot);
      }
    }
  }, [taskId, initData, serverLogs, clearSession, initFromScratch, handlePendingLogSuccess, persistReconciliationError]);

  useEffect(() => {
    if (!taskId) {
      clearTick();
      setPhase(PHASES.PROGRESS_LOADING);
      initializedTaskIdRef.current = null;
      return;
    }

    if (!initData || initData.taskId !== taskId || !serverLogs) {
      clearTick();
      setPhase(PHASES.PROGRESS_LOADING);
      return;
    }

    if (initializedTaskIdRef.current !== taskId) {
      initializedTaskIdRef.current = taskId;
      setSaveError(null);
      setAbortError(null);
      setAbortNotice(null);
      
      const snapshot = readSession(taskId);
      if (!snapshot) {
        initFromScratch();
        return;
      }

      setTotalTime(snapshot.sessionDurationSeconds);
      setPauseCount(snapshot.pauseCount);
      clientSessionIdRef.current = snapshot.clientSessionId;
      pendingLogRef.current = snapshot.pendingLog;

      if (snapshot.phase === PHASES.FOCUS_PAUSED || snapshot.phase === PHASES.BREAK_PAUSED) {
        setPhase(snapshot.phase);
        setTimeLeft(snapshot.remainingSecondsWhenPaused);
        expectedEndAtRef.current = null;
        setFocusedMinutes(snapshot.focusedMinutesSnapshot);
      } else if (snapshot.phase === PHASES.FOCUSING || snapshot.phase === PHASES.BREAKING) {
        const now = Date.now();
        if (now < snapshot.expectedEndAt) {
          setPhase(snapshot.phase);
          expectedEndAtRef.current = snapshot.expectedEndAt;
          setTimeLeft(Math.ceil((snapshot.expectedEndAt - now) / 1000));
          setFocusedMinutes(snapshot.focusedMinutesSnapshot);
          runTimerTick();
        } else {
          if (snapshot.phase === PHASES.FOCUSING) {
            const pending = {
              focusMinutes: Math.round(snapshot.sessionDurationSeconds / 60),
              breakMinutes: 0,
              pauseCount: snapshot.pauseCount,
              status: 'COMPLETED'
            };
            reconcileSave({ ...snapshot, pendingLog: pending });
          } else {
            setPhase(PHASES.READY_FOR_NEXT_FOCUS);
            expectedEndAtRef.current = null;
            const remaining = Math.max(snapshot.targetMinutesSnapshot - snapshot.focusedMinutesSnapshot, 0);
            const nextMin = Math.min(initData.configuredFocusMinutes, remaining);
            setTimeLeft(nextMin * 60);
            setTotalTime(nextMin * 60);
            clearSession();
          }
        }
      } else if (snapshot.phase === PHASES.SAVING_SESSION) {
        reconcileSave(snapshot);
      } else if (snapshot.phase === PHASES.SESSION_SAVE_ERROR) {
        setPhase(PHASES.SESSION_SAVE_ERROR);
        setFocusedMinutes(snapshot.focusedMinutesSnapshot);
        setTimeLeft(snapshot.remainingSecondsWhenPaused || 0);
        setTotalTime(snapshot.sessionDurationSeconds);
        setPauseCount(snapshot.pauseCount);
        clientSessionIdRef.current = snapshot.clientSessionId;
        pendingLogRef.current = snapshot.pendingLog;
        expectedEndAtRef.current = null;
        isSavingRef.current = false;
        setSaveError('Failed to save session previously. Please retry or discard.');
      } else {
        initFromScratch();
      }
    }
  }, [taskId, initData, serverLogs, readSession, initFromScratch, reconcileSave, clearTick, runTimerTick, clearSession]);

  useEffect(() => {
    return () => clearTick();
  }, [clearTick]);

  const executeSave = useCallback(async (pending) => {
    if (!taskId || !initData || isSavingRef.current || !clientSessionIdRef.current) return;
    isSavingRef.current = true;
    try {
      await savePomodoroLog({
        taskId,
        clientSessionId: clientSessionIdRef.current,
        ...pending
      });
      isSavingRef.current = false;
      const snapshot = {
        focusedMinutesSnapshot: focusedMinutes,
        sessionDurationSeconds: totalTime
      };
      handlePendingLogSuccess(snapshot, pending);
    } catch (err) {
      isSavingRef.current = false;
      const isAbort = pending.status === 'ABORTED';
      if (err?.status === 409) {
        const msg = 'Session conflict detected. Please discard this local session or refresh.';
        isAbort ? setAbortError(msg) : setSaveError(msg);
      } else {
        const msg = err?.message || 'Failed to save session.';
        isAbort ? setAbortError(msg) : setSaveError(msg);
      }
      setPhase(PHASES.SESSION_SAVE_ERROR);
      persistCurrentState({ phase: PHASES.SESSION_SAVE_ERROR, expectedEndAt: null, remainingSecondsWhenPaused: timeLeft });
      if (isAbort) setIsAborting(false);
    }
  }, [taskId, initData, focusedMinutes, totalTime, timeLeft, handlePendingLogSuccess, persistCurrentState]);

  const handleFocusComplete = useCallback(() => {
    clearTick();
    expectedEndAtRef.current = null;
    setPhase(PHASES.SAVING_SESSION);
    setSaveError(null);

    const pending = {
      focusMinutes: Math.round(totalTime / 60),
      breakMinutes: 0,
      pauseCount,
      status: 'COMPLETED'
    };
    pendingLogRef.current = pending;
    
    persistCurrentState({ phase: PHASES.SAVING_SESSION, expectedEndAt: null, remainingSecondsWhenPaused: 0, pendingLog: pending });
    executeSave(pending);
  }, [clearTick, totalTime, pauseCount, persistCurrentState, executeSave]);

  useEffect(() => {
    if ((phase === PHASES.FOCUSING || phase === PHASES.BREAKING) && timeLeft === 0 && expectedEndAtRef.current) {
      if (phase === PHASES.FOCUSING) {
        handleFocusComplete();
      } else {
        clearTick();
        expectedEndAtRef.current = null;
        setPhase(PHASES.READY_FOR_NEXT_FOCUS);
        const nextMin = Math.min(initData?.configuredFocusMinutes || 25, remainingMinutes);
        setTimeLeft(nextMin * 60);
        setTotalTime(nextMin * 60);
        clearSession();
      }
    }
  }, [phase, timeLeft, handleFocusComplete, remainingMinutes, initData, clearTick, clearSession]);

  const retrySave = useCallback(() => {
    if (phase === PHASES.SESSION_SAVE_ERROR && pendingLogRef.current) {
      setPhase(PHASES.SAVING_SESSION);
      setSaveError(null);
      setAbortError(null);
      persistCurrentState({ phase: PHASES.SAVING_SESSION });
      executeSave(pendingLogRef.current);
    }
  }, [phase, executeSave, persistCurrentState]);

  const discardSession = useCallback(() => {
    clearTick();
    isSavingRef.current = false;
    initializedTaskIdRef.current = null;
    expectedEndAtRef.current = null;
    clientSessionIdRef.current = null;
    pendingLogRef.current = null;
    setIsAborting(false);
    setSaveError(null);
    setAbortError(null);
    setAbortNotice(null);
    setPhase(PHASES.PROGRESS_LOADING);
    clearSession();
    if (onDiscard) {
      onDiscard();
    } else {
      initFromScratch();
    }
  }, [clearTick, clearSession, initFromScratch, onDiscard]);

  const startFocus = useCallback(() => {
    if (!taskId || !initData || remainingMinutes <= 0) return;
    setAbortError(null);
    setAbortNotice(null);
    setPhase(PHASES.FOCUSING);
    if (!clientSessionIdRef.current) {
      clientSessionIdRef.current = crypto.randomUUID();
    }
    pendingLogRef.current = null;
    expectedEndAtRef.current = Date.now() + timeLeft * 1000;
    persistCurrentState({ phase: PHASES.FOCUSING, expectedEndAt: expectedEndAtRef.current, remainingSecondsWhenPaused: null, pendingLog: null });
    runTimerTick();
  }, [taskId, initData, remainingMinutes, timeLeft, persistCurrentState, runTimerTick]);

  const pauseFocus = useCallback(() => {
    clearTick();
    expectedEndAtRef.current = null;
    setPhase(PHASES.FOCUS_PAUSED);
    setPauseCount(prev => prev + 1);
    persistCurrentState({ phase: PHASES.FOCUS_PAUSED, expectedEndAt: null, remainingSecondsWhenPaused: timeLeft, pauseCount: pauseCount + 1 });
  }, [clearTick, timeLeft, pauseCount, persistCurrentState]);

  const suspendFocusForAbort = useCallback(() => {
    clearTick();
    expectedEndAtRef.current = null;
    setPhase(PHASES.FOCUS_PAUSED);
    persistCurrentState({ phase: PHASES.FOCUS_PAUSED, expectedEndAt: null, remainingSecondsWhenPaused: timeLeft });
  }, [clearTick, timeLeft, persistCurrentState]);

  const resumeFocus = useCallback(() => {
    setAbortError(null);
    setAbortNotice(null);
    setPhase(PHASES.FOCUSING);
    expectedEndAtRef.current = Date.now() + timeLeft * 1000;
    persistCurrentState({ phase: PHASES.FOCUSING, expectedEndAt: expectedEndAtRef.current, remainingSecondsWhenPaused: null });
    runTimerTick();
  }, [timeLeft, persistCurrentState, runTimerTick]);

  const abortFocus = useCallback(() => {
    if (!taskId || !initData || isAborting) return;
    clearTick();
    expectedEndAtRef.current = null;
    setIsAborting(true);
    setAbortError(null);
    setAbortNotice(null);
    
    const elapsedSeconds = totalTime - timeLeft;
    const elapsedMinutes = Math.max(0, Math.floor(elapsedSeconds / 60));

    if (elapsedMinutes < 1) {
      setAbortNotice("Session ended before one full minute, so it was not added to your history.");
      setIsAborting(false);
      pendingLogRef.current = null;
      clearSession();
      setPhase(PHASES.IDLE);
      setTimeLeft(totalTime);
      setPauseCount(0);
      clientSessionIdRef.current = null;
      return;
    }

    const pending = {
      focusMinutes: elapsedMinutes,
      breakMinutes: 0,
      pauseCount,
      status: 'ABORTED'
    };
    pendingLogRef.current = pending;
    persistCurrentState({ phase: PHASES.SAVING_SESSION, expectedEndAt: null, remainingSecondsWhenPaused: timeLeft, pendingLog: pending });
    executeSave(pending);
  }, [taskId, initData, clearTick, totalTime, timeLeft, pauseCount, isAborting, persistCurrentState, executeSave, clearSession]);

  const pauseBreak = useCallback(() => {
    clearTick();
    expectedEndAtRef.current = null;
    setPhase(PHASES.BREAK_PAUSED);
    persistCurrentState({ phase: PHASES.BREAK_PAUSED, expectedEndAt: null, remainingSecondsWhenPaused: timeLeft });
  }, [clearTick, timeLeft, persistCurrentState]);

  const resumeBreak = useCallback(() => {
    setPhase(PHASES.BREAKING);
    expectedEndAtRef.current = Date.now() + timeLeft * 1000;
    persistCurrentState({ phase: PHASES.BREAKING, expectedEndAt: expectedEndAtRef.current, remainingSecondsWhenPaused: null });
    runTimerTick();
  }, [timeLeft, persistCurrentState, runTimerTick]);

  const skipBreak = useCallback(() => {
    clearTick();
    expectedEndAtRef.current = null;
    pendingLogRef.current = null;
    clearSession();
    setPhase(PHASES.READY_FOR_NEXT_FOCUS);
    const nextMin = Math.min(initData?.configuredFocusMinutes || 25, remainingMinutes);
    setTimeLeft(nextMin * 60);
    setTotalTime(nextMin * 60);
  }, [clearTick, clearSession, initData, remainingMinutes]);

  const startNextFocus = useCallback(() => {
    if (!taskId || !initData || remainingMinutes <= 0) return;
    setAbortError(null);
    setAbortNotice(null);
    setPhase(PHASES.FOCUSING);
    
    const nextMin = Math.min(initData.configuredFocusMinutes, remainingMinutes);
    setTimeLeft(nextMin * 60);
    setTotalTime(nextMin * 60);
    setPauseCount(0);
    clientSessionIdRef.current = crypto.randomUUID();
    pendingLogRef.current = null;
    expectedEndAtRef.current = Date.now() + nextMin * 60 * 1000;
    persistCurrentState({ phase: PHASES.FOCUSING, expectedEndAt: expectedEndAtRef.current, remainingSecondsWhenPaused: null, pauseCount: 0, sessionDurationSeconds: nextMin * 60, pendingLog: null });
    runTimerTick();
  }, [taskId, initData, remainingMinutes, persistCurrentState, runTimerTick]);

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
    discardSession,
    
    pauseBreak,
    resumeBreak,
    skipBreak,
    startNextFocus,
  };
}
