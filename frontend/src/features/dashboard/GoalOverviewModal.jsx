import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StudyIcon from '../../components/StudyIcon';
import { getGoals } from '../../api/goalApi';
import { getTasks } from '../../api/taskApi';

const STATUS_COLORS = {
  IN_PROGRESS: 'bg-violet-100 text-violet-700 border-violet-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  ABANDONED: 'bg-stone-100 text-stone-600 border-stone-200',
};

const TASK_STATUS_COLORS = {
  PENDING: 'bg-stone-100 text-stone-600',
  IN_PROGRESS: 'bg-violet-100 text-violet-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700 line-through opacity-80',
};

const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return null;
  return date;
};

const formatDateToShort = (dateString) => {
  const date = parseLocalDate(dateString);
  if (!date) return dateString || '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getDeadlineContext = (goal) => {
  if (goal.status === 'COMPLETED') {
    return { label: 'Completed', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  }
  
  const deadlineDate = parseLocalDate(goal.deadline);
  if (!deadlineDate) {
    return { label: 'No deadline', color: 'text-stone-500 bg-stone-50 border-stone-200' };
  }

  const today = new Date();
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffTime = deadlineDate.getTime() - todayLocal.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { label: 'Due today', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  } else if (diffDays > 0) {
    return { label: `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`, color: 'text-violet-700 bg-violet-50 border-violet-200' };
  } else {
    const overdueDays = Math.abs(diffDays);
    return { label: `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`, color: 'text-rose-700 bg-rose-50 border-rose-200' };
  }
};

const GoalOverviewModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedGoalId, setExpandedGoalId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [goalsData, tasksData] = await Promise.all([
          getGoals(),
          getTasks()
        ]);
        
        setGoals(goalsData || []);
        setTasks(tasksData || []);
      } catch (err) {
        console.error('Failed to fetch goals overview data', err);
        setError('Could not load goals. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const goalsWithStats = useMemo(() => {
    return goals.map(goal => {
      const goalTasks = tasks.filter(t => t.goalId === goal.id);
      
      // Sort tasks by scheduledDate, then orderIndex/startTime
      goalTasks.sort((a, b) => {
        const dateA = a.scheduledDate || '9999-12-31';
        const dateB = b.scheduledDate || '9999-12-31';
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        if (a.orderIndex !== b.orderIndex) return (a.orderIndex || 0) - (b.orderIndex || 0);
        const timeA = a.startTime || '23:59';
        const timeB = b.startTime || '23:59';
        return timeA.localeCompare(timeB);
      });

      const totalTasks = goalTasks.length;
      const completedTasks = goalTasks.filter(t => t.status === 'COMPLETED').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...goal,
        tasks: goalTasks,
        totalTasks,
        completedTasks,
        progress
      };
    });
  }, [goals, tasks]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <StudyIcon name="target" size={14} className="text-violet-600" />
            </div>
            <h2 className="text-base font-semibold text-stone-800">My Goals</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <StudyIcon name="x" size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-stone-50/30">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-stone-400">
              <StudyIcon name="loader" size={24} className="animate-spin" />
              <p className="text-sm">Loading your goals...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm flex gap-3">
              <StudyIcon name="alert-triangle" size={16} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          ) : goalsWithStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-stone-500">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-2">
                <StudyIcon name="target" size={20} className="text-stone-400" />
              </div>
              <p className="text-sm font-medium text-stone-700">No goals found</p>
              <p className="text-xs">Create a learning plan to add goals and tasks.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goalsWithStats.map(goal => {
                const isExpanded = expandedGoalId === goal.id;
                const statusCls = STATUS_COLORS[goal.status] || STATUS_COLORS.IN_PROGRESS;

                return (
                  <div key={goal.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:border-violet-200">
                    {/* Goal Header */}
                    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Clickable main area to expand */}
                      <button 
                        className="flex-1 text-left min-w-0 focus:outline-none"
                        onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="font-semibold text-stone-800 truncate">{goal.title}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${statusCls}`}>
                            {goal.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="flex items-center gap-1.5 text-stone-500">
                            <StudyIcon name="calendar" size={12} />
                            {formatDateToShort(goal.startDate) || 'No start date'} → {formatDateToShort(goal.deadline) || 'No deadline'}
                          </span>
                          
                          {(() => {
                            const context = getDeadlineContext(goal);
                            return (
                              <span 
                                className={`flex items-center gap-1.5 px-2 py-0.5 rounded border font-medium ${context.color}`}
                                aria-label={`Deadline status: ${context.label}`}
                              >
                                <StudyIcon name="clock" size={12} />
                                <span>{context.label}</span>
                              </span>
                            );
                          })()}
                        </div>
                      </button>

                      {/* Right side controls */}
                      <div className="flex items-center gap-4 shrink-0">
                        {/* Progress */}
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700">
                            <span>{goal.progress}%</span>
                            <span className="text-stone-400 font-normal">
                              ({goal.completedTasks}/{goal.totalTasks} tasks)
                            </span>
                          </div>
                          <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-violet-500 rounded-full transition-all duration-500"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="w-px h-8 bg-stone-200 hidden sm:block"></div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              onClose();
                              navigate(`/calendar?goalId=${encodeURIComponent(goal.id)}`);
                            }}
                            className="btn-ghost text-xs px-2 py-1 text-violet-600 hover:bg-violet-50"
                            title="View schedule"
                          >
                            <StudyIcon name="calendar" size={14} />
                            <span className="hidden sm:inline ml-1">Schedule</span>
                          </button>
                          
                          <button
                            onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                            className={`text-stone-400 hover:text-stone-600 p-1 rounded transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          >
                            <StudyIcon name="chevron-down" size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Goal Tasks (Expanded) */}
                    {isExpanded && (
                      <div className="border-t border-stone-100 bg-stone-50/50 p-4">
                        <h4 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3 px-1">Tasks</h4>
                        {goal.tasks.length === 0 ? (
                          <p className="text-xs text-stone-400 italic px-1">No tasks in this goal.</p>
                        ) : (
                          <div className="space-y-2">
                            {goal.tasks.map(task => {
                              const taskStatusCls = TASK_STATUS_COLORS[task.status] || TASK_STATUS_COLORS.PENDING;
                              return (
                                <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white border border-stone-100 rounded-lg shadow-sm">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className={`text-sm font-semibold truncate ${task.status === 'COMPLETED' ? 'text-stone-500 line-through' : 'text-stone-800'}`}>
                                        {task.title}
                                      </p>
                                    </div>
                                    {task.moduleTitle && (
                                      <p className="text-xs text-stone-500 truncate mt-1 flex items-center gap-1.5">
                                        <StudyIcon name="layers" size={10} className="text-stone-400" />
                                        {task.moduleTitle}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-xs text-stone-500 flex items-center gap-1.5">
                                      {task.scheduledDate ? (
                                        <>
                                          <StudyIcon name="calendar" size={12} className="text-stone-400" />
                                          {task.scheduledDate}
                                          {task.startTime && ` • ${task.startTime.slice(0, 5)}`}
                                        </>
                                      ) : (
                                        <span className="italic text-stone-400">Unscheduled</span>
                                      )}
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${taskStatusCls}`}>
                                      {task.status === 'IN_PROGRESS' ? 'In Progress' : task.status === 'COMPLETED' ? 'Done' : 'Pending'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 flex justify-between items-center">
          <p className="text-xs text-stone-500">Read-only view</p>
          <button 
            onClick={() => { onClose(); navigate('/calendar'); }}
            className="btn-primary w-auto shrink-0 text-xs px-4 py-2 flex items-center gap-2"
          >
            <StudyIcon name="calendar" size={14} />
            <span>View all schedules</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalOverviewModal;
