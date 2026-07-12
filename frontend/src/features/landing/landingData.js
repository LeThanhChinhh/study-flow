export const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Workflow', href: '#workflow' },
]

export const PROBLEM_POINTS = [
  'Too much material.',
  'Too much manual planning.',
  'Too many disconnected tools.',
]

export const HOW_STEPS = [
  {
    id: 'upload',
    number: '01',
    icon: 'upload',
    title: 'Upload',
    description: 'Bring a PDF into StudyFlow and keep the material connected to one learning goal.',
  },
  {
    id: 'plan',
    number: '02',
    icon: 'layers',
    title: 'Plan',
    description: 'Review an AI-generated plan, edit the tasks, and fit them into your available time.',
  },
  {
    id: 'focus',
    number: '03',
    icon: 'timer',
    title: 'Focus',
    description: 'Work through the next task with a timer built for real study sessions and short breaks.',
  },
  {
    id: 'recall',
    number: '04',
    icon: 'lightbulb',
    title: 'Recall',
    description: 'Finish the task target with a short AI quiz and keep your progress moving.',
  },
]

export const WORKFLOW_NODES = [
  { label: 'Plan', icon: 'layers' },
  { label: 'Schedule', icon: 'calendar' },
  { label: 'Focus', icon: 'timer' },
  { label: 'Quiz', icon: 'lightbulb' },
  { label: 'Track', icon: 'bar-chart' },
]

export const FEATURES = [
  {
    id: 'planning',
    eyebrow: 'AI Planning',
    icon: 'file-text',
    title: 'Turn a PDF into an editable plan.',
    description: 'Gemini reads the document, shapes modules and study tasks, then leaves the final plan in your hands before scheduling.',
    note: 'Review titles and estimated minutes before generating tasks.',
  },
  {
    id: 'calendar',
    eyebrow: 'Flexible Calendar',
    icon: 'calendar',
    title: 'Move study tasks when your week changes.',
    description: 'See your week clearly and drag a task to a different day or time without rebuilding the learning plan.',
    note: 'Calendar changes stay tied to the original goal.',
  },
  {
    id: 'focus',
    eyebrow: 'Deep Focus',
    icon: 'timer',
    title: 'Focus in sessions that add up.',
    description: 'Use configurable focus and short-break durations, pause when needed, and continue until the task target is reached.',
    note: 'Multiple sessions contribute to one task total.',
  },
  {
    id: 'quiz',
    eyebrow: 'Active Recall',
    icon: 'lightbulb',
    title: 'Recall what you just studied.',
    description: 'After reaching the focus target, answer a short AI-generated quiz connected to the task you completed.',
    note: 'Two focused questions keep the check-in lightweight.',
  },
  {
    id: 'insights',
    eyebrow: 'Progress Tracking',
    icon: 'bar-chart',
    title: 'See effort turn into visible progress.',
    description: 'Goal completion and focus history make the next step easier to understand without turning learning into a wall of analytics.',
    note: 'Track completed tasks and recent focus minutes together.',
  },
]
