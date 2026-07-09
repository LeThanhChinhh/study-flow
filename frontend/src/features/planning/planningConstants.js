/** Day-of-week labels (ISO: 1 = Monday … 7 = Sunday). */
export const DAY_LABELS = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
}

/** Ordered step definitions for the planning wizard. */
export const STEPS = [
  {
    id: 'goal',
    title: 'Create Goal',
    eyebrow: 'Step 1',
    icon: 'target',
    description: 'Name your learning goal and choose the date range StudyFlow should plan around.',
  },
  {
    id: 'slots',
    title: 'Time Slots',
    eyebrow: 'Step 2',
    icon: 'calendar',
    description: 'Tell StudyFlow when you are free. The scheduler will place tasks inside these windows.',
  },
  {
    id: 'upload',
    title: 'Upload PDF',
    eyebrow: 'Step 3',
    icon: 'upload',
    description: 'Upload the learning material.',
  },
  {
    id: 'polling',
    title: 'Polling AI',
    eyebrow: 'Step 4',
    icon: 'timer',
    description: 'Show progress while the backend parses the material and returns structured modules.',
  },
  {
    id: 'schedule',
    title: 'Generate Schedule',
    eyebrow: 'Step 5',
    icon: 'layers',
    description: 'Preview generated modules and create real tasks for the dashboard.',
  },
]
