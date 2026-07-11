import { useState, useEffect } from 'react';
import StudyIcon from '../../components/StudyIcon';
import { useAuth } from '../../auth/AuthContext';
import { getUserSettings, updateUserSettings } from '../../api/userSettingsApi';

const FOCUS_PRESETS = [15, 25, 45, 50];
const BREAK_PRESETS = [3, 5, 10, 15];

const ProfileSettingsModal = ({ onClose }) => {
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
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
        setError('Could not load preferences. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const hasChanges = initialSettings && (
    focusDuration !== initialSettings.pomodoroDuration ||
    shortBreakDuration !== initialSettings.shortBreakDuration
  );

  const isValid = 
    focusDuration >= 5 && focusDuration <= 90 &&
    shortBreakDuration >= 1 && shortBreakDuration <= 30;

  const handleSave = async () => {
    if (!hasChanges || !isValid || isSaving) return;
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);
      
      const updated = await updateUserSettings({
        pomodoroDuration: focusDuration,
        shortBreakDuration: shortBreakDuration
      });
      
      setInitialSettings(updated);
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error('Failed to save settings:', err);
      let errorMsg = 'Could not save preferences. Please check your inputs and try again.';
      if (err.errors && Object.values(err.errors).length > 0) {
        errorMsg = Object.values(err.errors)[0];
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'S';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/35">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-7 py-6 border-b border-stone-100/60 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center border border-violet-100 shadow-sm shrink-0">
              <StudyIcon name="user" size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-800 tracking-tight">Profile & Focus Preferences</h2>
              <p className="text-xs text-stone-500 mt-0.5 font-medium">Adjust your study rhythm and session defaults</p>
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

        {/* Content */}
        <div className="p-7 overflow-y-auto max-h-[80vh] custom-scrollbar space-y-8">
          
          {/* Profile Section */}
          <section>
            <div className="flex items-center gap-5 p-5 rounded-2xl border border-stone-100/60 bg-gradient-to-r from-violet-50/80 via-white to-rose-50/50 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-sm ring-4 ring-white uppercase select-none shrink-0">
                {getInitials(user?.username || user?.name)}
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-base text-stone-800 font-bold truncate tracking-tight">
                  {user?.username || user?.name || 'Student'}
                </p>
                <p className="text-sm text-stone-500 font-medium truncate mt-0.5">
                  {user?.email || 'Not available'}
                </p>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section>
            {isLoading ? (
              <div className="space-y-5 animate-pulse">
                <div className="h-32 bg-stone-50 rounded-2xl w-full border border-stone-100"></div>
                <div className="h-32 bg-stone-50 rounded-2xl w-full border border-stone-100"></div>
              </div>
            ) : (
              <div className="space-y-5">
                
                {/* Focus Duration Card */}
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
                    {FOCUS_PRESETS.map(preset => (
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

                {/* Short Break Card */}
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
                    {BREAK_PRESETS.map(preset => (
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
            
            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-sm">
                <StudyIcon name="alert-circle" size={16} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            {/* Success Message */}
            {success && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-emerald-700 text-sm">
                <StudyIcon name="check-circle" size={16} className="shrink-0" />
                <p>Preferences saved successfully.</p>
              </div>
            )}

          </section>
        </div>

        {/* Footer Actions */}
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
            className={`flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl transition-all shadow-sm
              ${(!hasChanges || !isValid || isSaving || isLoading) 
                ? 'bg-stone-300 cursor-not-allowed opacity-80' 
                : 'bg-violet-600 hover:bg-violet-700 hover:shadow-md'
              }
            `}
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
