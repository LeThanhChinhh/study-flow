import calendarImage from '../../assets/landing/calendar.webp'
import calendarDragDropImage from '../../assets/landing/calendar-drag-drop.webp'
import dashboardImage from '../../assets/landing/dashboard.webp'
import focusRunningImage from '../../assets/landing/focus-running.webp'
import planningReviewImage from '../../assets/landing/planning-review.webp'
import quizImage from '../../assets/landing/quiz.webp'
import quizResultsImage from '../../assets/landing/quiz-results.webp'

export const LANDING_SCREENSHOTS = {
  dashboard: {
    src: dashboardImage,
    width: 1296,
    height: 812,
    title: 'Learning dashboard',
    alt: 'StudyFlow learning dashboard showing today’s tasks, a focus session card, learning progress, and the static study-themed background.',
  },
  planning: {
    src: planningReviewImage,
    width: 1297,
    height: 809,
    title: 'Editable AI plan',
    alt: 'StudyFlow planning review showing a five-step PDF planning flow, five modules, twenty tasks, estimated hours, and editable curriculum rows.',
  },
  calendar: {
    src: calendarImage,
    width: 1299,
    height: 812,
    title: 'Learning calendar',
    alt: 'StudyFlow weekly learning calendar with study tasks distributed across seven days and grouped by learning goal.',
  },
  calendarDragDrop: {
    src: calendarDragDropImage,
    width: 1901,
    height: 912,
    title: 'Calendar drag and drop',
    alt: 'StudyFlow calendar while a scheduled task is being dragged to a new day and time.',
  },
  focus: {
    src: focusRunningImage,
    width: 1918,
    height: 915,
    title: 'Deep Focus session',
    alt: 'StudyFlow Deep Focus workspace with an active Pomodoro timer, current task, session intentions, focus tip, and Active Recall reminder.',
  },
  quiz: {
    src: quizImage,
    width: 1296,
    height: 810,
    title: 'Quick Recall quiz',
    alt: 'StudyFlow Quick Recall modal with two AI-generated multiple-choice questions ready to submit.',
  },
  quizResults: {
    src: quizResultsImage,
    width: 1301,
    height: 811,
    title: 'Recall results',
    alt: 'StudyFlow Session Results modal showing quiz score and a review of correct and incorrect answers.',
  },
}
