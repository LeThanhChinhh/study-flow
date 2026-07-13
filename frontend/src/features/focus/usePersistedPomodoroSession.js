import { useCallback } from 'react';

const STORAGE_KEY = 'studyflow_focus_session';
const CURRENT_VERSION = 1;
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const VALID_PHASES = [
  'FOCUSING',
  'FOCUS_PAUSED',
  'SAVING_SESSION',
  'SESSION_SAVE_ERROR',
  'BREAKING',
  'BREAK_PAUSED'
];

const validateSessionPayload = (parsed) => {
  if (!parsed || parsed.version !== CURRENT_VERSION) return false;
  if (!VALID_PHASES.includes(parsed.phase)) return false;
  
  if (typeof parsed.taskId !== 'string' || parsed.taskId.trim() === '') return false;
  if (typeof parsed.startedAt !== 'number' || !Number.isFinite(parsed.startedAt)) return false;
  
  if (typeof parsed.savedAt !== 'number' || !Number.isFinite(parsed.savedAt)) return false;
  const now = Date.now();
  if (now - parsed.savedAt > TTL_MS) return false;
  if (parsed.savedAt > now + 60000) return false; // Reject far future

  if (typeof parsed.sessionDurationSeconds !== 'number' || !Number.isFinite(parsed.sessionDurationSeconds) || parsed.sessionDurationSeconds <= 0) return false;
  if (typeof parsed.pauseCount !== 'number' || !Number.isInteger(parsed.pauseCount) || parsed.pauseCount < 0) return false;
  if (typeof parsed.focusedMinutesSnapshot !== 'number' || !Number.isFinite(parsed.focusedMinutesSnapshot) || parsed.focusedMinutesSnapshot < 0) return false;
  if (typeof parsed.targetMinutesSnapshot !== 'number' || !Number.isFinite(parsed.targetMinutesSnapshot) || parsed.targetMinutesSnapshot < 0) return false;

  const isFocusing = parsed.phase === 'FOCUSING' || parsed.phase === 'BREAKING';
  if (isFocusing) {
    if (typeof parsed.expectedEndAt !== 'number' || !Number.isFinite(parsed.expectedEndAt)) return false;
  }

  const isPaused = parsed.phase === 'FOCUS_PAUSED' || parsed.phase === 'BREAK_PAUSED';
  if (isPaused) {
    if (typeof parsed.remainingSecondsWhenPaused !== 'number' || !Number.isFinite(parsed.remainingSecondsWhenPaused) || parsed.remainingSecondsWhenPaused < 0) return false;
  }

  const isSaving = parsed.phase === 'SAVING_SESSION' || parsed.phase === 'SESSION_SAVE_ERROR';
  if (isSaving) {
    if (!parsed.pendingLog) return false;
    if (parsed.pendingLog.status !== 'COMPLETED' && parsed.pendingLog.status !== 'ABORTED') return false;
    if (typeof parsed.pendingLog.focusMinutes !== 'number' || !Number.isInteger(parsed.pendingLog.focusMinutes) || parsed.pendingLog.focusMinutes <= 0) return false;
    if (typeof parsed.pendingLog.breakMinutes !== 'number' || !Number.isInteger(parsed.pendingLog.breakMinutes) || parsed.pendingLog.breakMinutes < 0) return false;
    if (typeof parsed.pendingLog.pauseCount !== 'number' || !Number.isInteger(parsed.pendingLog.pauseCount) || parsed.pendingLog.pauseCount < 0) return false;
  }

  const isBreakPhase = ['BREAKING', 'BREAK_PAUSED'].includes(parsed.phase);
  if (isBreakPhase) {
    if (parsed.clientSessionId !== null && parsed.clientSessionId !== undefined) return false;
    if (parsed.pendingLog !== null && parsed.pendingLog !== undefined) return false;
  }

  const isFocusOrSavePhase = ['FOCUSING', 'FOCUS_PAUSED', 'SAVING_SESSION', 'SESSION_SAVE_ERROR'].includes(parsed.phase);
  if (isFocusOrSavePhase && (!parsed.clientSessionId || typeof parsed.clientSessionId !== 'string' || parsed.clientSessionId.trim() === '')) {
    return false;
  }

  return true;
};

export function usePersistedPomodoroSession() {
  const readSession = useCallback((taskId) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      if (!validateSessionPayload(parsed)) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      if (parsed.taskId !== taskId) {
        return null; // Don't clear, it might belong to another task
      }

      return parsed;
    } catch (e) {
      console.warn('Failed to parse persisted pomodoro session', e);
      return null;
    }
  }, []);

  const saveSession = useCallback((state) => {
    try {
      const payload = {
        ...state,
        version: CURRENT_VERSION,
        savedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to persist pomodoro session', e);
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const hasActiveSessionForOtherTask = useCallback((currentTaskId) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
      
      if (!validateSessionPayload(parsed)) {
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }

      if (parsed.taskId !== currentTaskId) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return { readSession, saveSession, clearSession, hasActiveSessionForOtherTask };
}
