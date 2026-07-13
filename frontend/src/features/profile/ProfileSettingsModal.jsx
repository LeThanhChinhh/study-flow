import { useEffect, useRef, useState } from 'react';
import StudyIcon from '../../components/StudyIcon';
import { useAuth } from '../../auth/AuthContext';
import { authApi } from '../../api/authApi';
import { getUserSettings, updateUserSettings } from '../../api/userSettingsApi';

const FOCUS_PRESETS = [15, 25, 45, 50];
const BREAK_PRESETS = [3, 5, 10, 15];
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

const getErrorMessage = (err, fallback) => {
  if (err?.errors && Object.values(err.errors).length > 0) {
    return Object.values(err.errors)[0];
  }
  return err?.message || fallback;
};

const ProfileSettingsModal = ({ onClose }) => {
  const { user, updateUser } = useAuth();
  const successTimerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [username, setUsername] = useState(user?.username || '');
  const [initialUsername, setInitialUsername] = useState(user?.username || '');
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [initialSettings, setInitialSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserSettings();
        setFocusDuration(data.pomodoroDuration ?? 25);
        setShortBreakDuration(data.shortBreakDuration ?? 5);
        setInitialSettings(data);
      } catch (err) {
        console.error('Failed to load user settings:', err);
        setError('Could not load focus preferences. Username editing is still available.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();

    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const trimmedUsername = username.trim();
  const usernameError = (() => {
    if (!trimmedUsername) return 'Username is required.';
    if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
      return 'Username must be between 3 and 50 characters.';
    }
    if (!USERNAME_PATTERN.test(trimmedUsername)) {
      return 'Use only letters, numbers, and underscores.';
    }
    return null;
  })();

  const usernameChanged = trimmedUsername !== initialUsername;
  const settingsChanged = Boolean(initialSettings) && (
    focusDuration !== initialSettings.pomodoroDuration
    || shortBreakDuration !== initialSettings.shortBreakDuration
  );
  const hasChanges = usernameChanged || settingsChanged;
  const settingsValid = (
    focusDuration >= 5 && focusDuration <= 90
    && shortBreakDuration >= 1 && shortBreakDuration <= 30
  );
  const isValid = !usernameError && settingsValid;

  const handleSave = async () => {
    if (!hasChanges || !isValid || isSaving) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      if (usernameChanged) {
        const updatedProfile = await authApi.updateUsername({ username: trimmedUsername });
        updateUser(updatedProfile);
        setUsername(updatedProfile.username);
        setInitialUsername(updatedProfile.username);
      }

      if (settingsChanged) {
        const updatedSettings = await updateUserSettings({
          pomodoroDuration: focusDuration,
          shortBreakDuration,
        });
        setInitialSettings(updatedSettings);
      }

      setSuccess(true);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile settings:', err);
      setError(getErrorMessage(err, 'Could not save changes. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : 'S');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/35">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between px-7 py-6 border-b border-stone-100/60 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center border border-violet-100 shadow-sm shrink-0">
              <StudyIcon name="user" size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-800 tracking-tight">Profile & Focus Preferences</h2>
              <p className="text-xs text-stone-500 mt-0.5 font-medium">Update your profile and study rhythm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <StudyIcon name="x" size={18} />
          </button>
        </div>

        <div className="p-7 overflow-y-auto max-h-[80vh] custom-scrollbar space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-5 p-5 rounded-2xl border border-stone-100/60 bg-gradient-to-r from-violet-50/80 via-white to-rose-50/50 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-sm ring-4 ring-white uppercase select-none shrink-0">
                {getInitials(trimmedUsername || user?.username)}
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-base text-stone-800 font-bold truncate tracking-tight">
                  {trimmedUsername || user?.username || 'Student'}
                </p>
                <p className="text-sm text-stone-500 font-medium truncate mt-0.5">
                  {user?.email || 'Not available'}
                </p>
              </div>
            </div>

            <label className="block">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-stone-700">Username</span>
                <span className="text-[11px] text-stone-400">{username.length}/50</span>
              </div>
              <div className="relative">
                <StudyIcon
                  name="user"
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value.slice(0, 50));
                    setError(null);
                    setSuccess(false);
                  }}
                  disabled={isSaving}
                  maxLength={50}
                  autoComplete="username"
                  className={`w-full rounded-xl border bg-stone-50 pl-9 pr-3 py-2.5 text-sm text-stone-800 outline-none transition-colors disabled:opacity-60 ${
                    usernameError
                      ? 'border-rose-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100'
                      : 'border-stone-200 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100'
                  }`}
                />
              </div>
              <p className={`mt-1.5 text-[11px] ${usernameError ? 'text-rose-600' : 'text-stone-400'}`}>
                {usernameError || 'Letters, numbers, and underscores only.'}
              </p>
            </label>
          </section>

          <section>
            {isLoading ? (
              <div className="space-y-5 animate-pulse">
                <div className="h-32 bg-stone-50 rounded-2xl w-full border border-stone-100" />
                <div className="h-32 bg-stone-50 rounded-2xl w-full border border-stone-100" />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="bg-violet-50/30 border border-violet-100/50 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                        <StudyIcon name="clock" size={14} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-stone-800">Focus duration</h4>
                        <p className="text-xs text-stone-500 mt-0.5">Length of each focus session, not the entire task.</p>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 bg-white border border-stone-100 rounded-lg shadow-sm shrink-0">
                      <span className="text-xs font-bold text-violet-700">{focusDuration} min</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {FOCUS_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        disabled={isSaving}
                        onClick={() => setFocusDuration(preset)}
                        className={`flex-1 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                          focusDuration === preset
                            ? 'bg-violet-500 text-white border-violet-600 shadow-[0_2px_10px_-2px_rgba(139,92,246,0.4)]'
                            : 'bg-white text-stone-600 border-stone-200/80 hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-700'
                        }`}
                      >
                        {preset}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-rose-50/30 border border-rose-100/50 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                        <StudyIcon name="pause" size={14} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-stone-800">Short break</h4>
                        <p className="text-xs text-stone-500 mt-0.5">Break time between completed focus sessions.</p>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 bg-white border border-stone-100 rounded-lg shadow-sm shrink-0">
                      <span className="text-xs font-bold text-rose-600">{shortBreakDuration} min</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {BREAK_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        disabled={isSaving}
                        onClick={() => setShortBreakDuration(preset)}
                        className={`flex-1 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                          shortBreakDuration === preset
                            ? 'bg-rose-400 text-white border-rose-500 shadow-[0_2px_10px_-2px_rgba(251,113,133,0.4)]'
                            : 'bg-white text-stone-600 border-stone-200/80 hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-600'
                        }`}
                      >
                        {preset}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-sm">
                <StudyIcon name="alert-circle" size={16} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-emerald-700 text-sm">
                <StudyIcon name="check-circle" size={16} className="shrink-0" />
                <p>Changes saved successfully.</p>
              </div>
            )}
          </section>
        </div>

        <div className="px-7 py-5 border-t border-stone-100/60 bg-stone-50/30 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || !isValid || isSaving || isLoading}
            className={`flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl transition-all shadow-sm ${
              (!hasChanges || !isValid || isSaving || isLoading)
                ? 'bg-stone-300 cursor-not-allowed opacity-80'
                : 'bg-violet-600 hover:bg-violet-700 hover:shadow-md'
            }`}
          >
            {isSaving ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 rounded-full border-2 border-white/50 border-t-white animate-spin"
                />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;
