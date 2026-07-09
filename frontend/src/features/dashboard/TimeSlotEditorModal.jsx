import React, { useState, useEffect } from 'react';
import StudyIcon from '../../components/StudyIcon';
import { getTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot } from '../../api/timeSlotApi';

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

const toTimeInput = (time) => (time ? time.slice(0, 5) : '');

const TimeSlotEditorModal = ({ onClose }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [formState, setFormState] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00'
  });
  const [formError, setFormError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Inline delete state
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getTimeSlots();
      
      // Sort: dayOfWeek ascending, then startTime ascending
      const sorted = [...(data || [])].sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
        return a.startTime.localeCompare(b.startTime);
      });
      setTimeSlots(sorted);
    } catch (err) {
      console.error('Failed to fetch time slots', err);
      setError('Could not load time slots. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (slot) => {
    setEditingId(slot.id);
    setFormState({
      dayOfWeek: slot.dayOfWeek,
      startTime: toTimeInput(slot.startTime),
      endTime: toTimeInput(slot.endTime)
    });
    setFormError(null);
    setPendingDeleteId(null);
    setDeleteError(null);
  };

  const handleInitiateDelete = (id) => {
    setPendingDeleteId(id);
    setDeleteError(null);
  };

  const handleCancelDelete = () => {
    setPendingDeleteId(null);
    setDeleteError(null);
  };

  const executeDelete = async (id) => {
    try {
      setDeletingId(id);
      setDeleteError(null);
      await deleteTimeSlot(id);
      setPendingDeleteId(null);
      await fetchSlots();
    } catch (err) {
      console.error('Failed to delete time slot', err);
      const msg = err?.data?.message || err?.response?.data?.message || err?.message || 'Could not delete time slot.';
      setDeleteError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormState({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });
    setFormError(null);
    setPendingDeleteId(null);
    setDeleteError(null);
  };

  const validateForm = () => {
    if (!formState.dayOfWeek || !formState.startTime || !formState.endTime) {
      return 'All fields are required.';
    }
    if (formState.startTime >= formState.endTime) {
      return 'Start time must be before end time.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }

    try {
      setIsSaving(true);
      setFormError(null);
      if (editingId) {
        await updateTimeSlot(editingId, formState);
      } else {
        await createTimeSlot(formState);
      }
      await fetchSlots();
      resetForm();
    } catch (err) {
      console.error('Failed to save time slot', err);
      const msg = err?.response?.data?.message || err?.data?.message || 'Failed to save time slot.';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <StudyIcon name="clock" size={14} className="text-violet-600" />
            </div>
            <h2 className="text-base font-semibold text-stone-800">Edit Availability</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <StudyIcon name="x" size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-stone-200">
          
          <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-xl text-sm flex gap-3">
            <StudyIcon name="info" size={16} className="shrink-0 mt-0.5" />
            <p>
              Changing availability affects future planning and calendar drag/drop validation. 
              <strong> Existing tasks will not be moved automatically.</strong>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-medium text-stone-700">{editingId ? 'Edit Time Slot' : 'Add Time Slot'}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-500">Day of Week</label>
                <select 
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none"
                  value={formState.dayOfWeek}
                  onChange={e => setFormState({...formState, dayOfWeek: parseInt(e.target.value)})}
                >
                  {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-500">Start Time</label>
                <input 
                  type="time" 
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none"
                  value={formState.startTime}
                  onChange={e => setFormState({...formState, startTime: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-500">End Time</label>
                <input 
                  type="time" 
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none"
                  value={formState.endTime}
                  onChange={e => setFormState({...formState, endTime: e.target.value})}
                />
              </div>
            </div>
            
            {formError && (
              <p className="text-xs text-rose-500 font-medium">{formError}</p>
            )}

            <div className="flex gap-2 justify-end pt-2">
              {editingId && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="btn-ghost text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" 
                disabled={isSaving}
                className="btn-primary text-xs px-4 py-1.5"
              >
                {isSaving ? 'Saving...' : (editingId ? 'Update' : 'Add')}
              </button>
            </div>
          </form>

          {/* List */}
          <div>
            <h3 className="text-sm font-medium text-stone-700 mb-3">Current Availability</h3>
            {isLoading ? (
              <p className="text-sm text-stone-500">Loading...</p>
            ) : error ? (
              <p className="text-sm text-rose-500">{error}</p>
            ) : timeSlots.length === 0 ? (
              <p className="text-sm text-stone-500 italic">No time slots configured.</p>
            ) : (
              <div className="space-y-2">
                {timeSlots.map(slot => {
                  const isPendingDelete = pendingDeleteId === slot.id;
                  const isDeleting = deletingId === slot.id;

                  return (
                    <div key={slot.id} className="flex flex-col p-3 rounded-xl border border-stone-100 bg-white shadow-sm hover:border-violet-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-semibold text-xs">
                            {DAYS.find(d => d.value === slot.dayOfWeek)?.label.substring(0, 3)}
                          </div>
                          <div className="text-sm text-stone-700 font-medium">
                            {toTimeInput(slot.startTime)} – {toTimeInput(slot.endTime)}
                          </div>
                        </div>
                        
                        {!isPendingDelete && (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEdit(slot)}
                              className="px-2 py-1.5 text-xs font-medium text-stone-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                              <StudyIcon name="pencil" size={12} />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleInitiateDelete(slot.id)}
                              className="px-2 py-1.5 text-xs font-medium text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                              <StudyIcon name="trash" size={12} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Inline Delete Confirmation */}
                      {isPendingDelete && (
                        <div className="mt-3 pt-3 border-t border-rose-100 flex flex-col gap-2 bg-rose-50/50 -mx-3 -mb-3 p-3 rounded-b-xl">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-rose-700">Delete this slot?</span>
                            <div className="flex gap-2">
                              <button
                                onClick={handleCancelDelete}
                                disabled={isDeleting}
                                className="btn-ghost text-xs px-3 py-1 bg-white hover:bg-stone-50 border border-stone-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => executeDelete(slot.id)}
                                disabled={isDeleting}
                                className="btn-primary text-xs px-3 py-1 bg-rose-500 hover:bg-rose-600 border-none text-white"
                              >
                                {isDeleting ? 'Deleting...' : 'Confirm'}
                              </button>
                            </div>
                          </div>
                          {deleteError && (
                            <p className="text-[10px] text-rose-500 font-medium">{deleteError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default TimeSlotEditorModal;
