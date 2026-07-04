// Mock data for the Focus Workspace page.
// Replace with real API data in a later sprint.

export const FOCUS_TASK = {
  title: 'Problem Set 2: Binary Trees',
  subject: 'Algorithms',
  module: 'CS Fundamentals',
  estimatedMins: 25,
  intentions: [
    'Understand in-order, pre-order, post-order traversal',
    'Solve at least 3 practice problems',
    'Write out time complexity for each approach',
  ],
}

export const FOCUS_PROGRESS = {
  sessionsToday: 1,
  minutesToday: 25,
  sessionGoal: 3,
  minuteGoal: 75,
}

export const FOCUS_TIPS = [
  'Work on one problem at a time — depth beats breadth.',
  'Close every unrelated browser tab before starting.',
  'Write your solution in plain language before coding.',
  'Take notes as you go — active writing aids retention.',
  'If stuck for 10 min, move on and revisit later.',
]

export const RECALL_HINT =
  'After this session, try to explain binary tree traversal from memory before checking your notes.'

export const BREAK_SUGGESTION = 'Short break in ~24 min — stand up, stretch, hydrate.'

// Pick a consistent tip for the current session (cycles by day).
const dayIndex = new Date().getDay()
export const TODAY_TIP = FOCUS_TIPS[dayIndex % FOCUS_TIPS.length]

export const POMODORO_MINUTES = 25
export const POMODORO_SECONDS = POMODORO_MINUTES * 60
