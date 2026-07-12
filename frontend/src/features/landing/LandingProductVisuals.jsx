import StudyIcon from '../../components/StudyIcon'
import { LANDING_SCREENSHOTS } from './landingAssets'

const ProductScreenshot = ({
  screenshot,
  className = '',
  eager = false,
  compact = false,
  bare = false,
  caption,
}) => {
  const shot = typeof screenshot === 'string' ? LANDING_SCREENSHOTS[screenshot] : screenshot

  return (
    <figure className={`landing-product-screenshot ${compact ? 'is-compact' : ''} ${bare ? 'is-bare' : ''} ${className}`.trim()}>
      {!bare && (
        <div className="landing-product-window-bar" aria-hidden="true">
          <div className="landing-product-window-dots"><i /><i /><i /></div>
          <span>{shot.title}</span>
          <small>REAL PRODUCT UI</small>
        </div>
      )}
      <div className="landing-product-image-wrap">
        <img
          src={shot.src}
          width={shot.width}
          height={shot.height}
          alt={shot.alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          decoding="async"
        />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

export const PlanningVisual = ({ compact = false }) => (
  <ProductScreenshot
    screenshot="planning"
    compact={compact}
    className="landing-real-planning"
    caption={compact ? undefined : 'Review and edit the AI-generated curriculum before tasks are scheduled.'}
  />
)

export const CalendarVisual = ({ compact = false }) => (
  <div className={`landing-real-calendar-composition ${compact ? 'is-compact' : ''}`}>
    <ProductScreenshot
      screenshot="calendar"
      compact={compact}
      className="landing-real-calendar"
      caption={compact ? undefined : 'A complete week of study tasks, still connected to the original goal.'}
    />
    {!compact && (
      <div className="landing-real-calendar-inset">
        <ProductScreenshot screenshot="calendarDragDrop" compact bare />
        <span><StudyIcon name="arrow-right" size={13} /> Drag to a new time</span>
      </div>
    )}
  </div>
)

export const FocusVisual = ({ compact = false }) => (
  <ProductScreenshot
    screenshot="focus"
    compact={compact}
    className="landing-real-focus"
    caption={compact ? undefined : 'One task, one timer, and a clear path to the recall check.'}
  />
)

export const QuizVisual = ({ compact = false }) => (
  <div className={`landing-real-quiz-composition ${compact ? 'is-compact' : ''}`}>
    <ProductScreenshot
      screenshot="quiz"
      compact={compact}
      className="landing-real-quiz"
      caption={compact ? undefined : 'A short AI-generated quiz appears after the focus target is reached.'}
    />
    {!compact && (
      <div className="landing-real-quiz-inset">
        <ProductScreenshot screenshot="quizResults" compact bare />
        <span><StudyIcon name="bar-chart" size={13} /> Review the result</span>
      </div>
    )}
  </div>
)

export const InsightsVisual = ({ compact = false }) => (
  <ProductScreenshot
    screenshot="dashboard"
    compact={compact}
    className="landing-real-insights"
    caption={compact ? undefined : 'Today’s work, goal progress, and focus history stay in one calm overview.'}
  />
)

export const HowStepVisual = ({ stepId }) => {
  if (stepId === 'upload') {
    return (
      <ProductScreenshot
        screenshot="planning"
        compact
        className="landing-how-real-shot is-upload-step"
        caption="The uploaded PDF has moved through AI parsing and into a reviewable learning flow."
      />
    )
  }
  if (stepId === 'plan') {
    return (
      <ProductScreenshot
        screenshot="planning"
        compact
        className="landing-how-real-shot is-plan-step"
        caption="Edit module tasks and estimated minutes before generating the calendar."
      />
    )
  }
  if (stepId === 'focus') {
    return (
      <ProductScreenshot
        screenshot="focus"
        compact
        className="landing-how-real-shot is-focus-step"
        caption="Start the next scheduled task in the real Deep Focus workspace."
      />
    )
  }
  return (
    <ProductScreenshot
      screenshot="quiz"
      compact
      className="landing-how-real-shot is-recall-step"
      caption="Answer two focused questions while the material is still fresh."
    />
  )
}

export const HeroWorkspaceVisual = () => (
  <div className="landing-hero-composition landing-real-hero" aria-label="Real StudyFlow product screens">
    <div className="landing-hero-glow" aria-hidden="true" />

    <div className="landing-real-hero-main" data-landing-hero-layer data-depth="0.08">
      <ProductScreenshot screenshot="dashboard" eager />
    </div>

    <div
      className="landing-real-hero-detail landing-real-hero-plan"
      data-landing-hero-layer
      data-depth="0.15"
    >
      <ProductScreenshot screenshot="planning" compact bare />
      <span><StudyIcon name="layers" size={13} /> Editable AI plan</span>
    </div>

    <div
      className="landing-real-hero-detail landing-real-hero-focus"
      data-landing-hero-layer
      data-landing-ambient
      data-depth="0.2"
    >
      <ProductScreenshot screenshot="focus" compact bare />
      <span><StudyIcon name="timer" size={13} /> Focus workspace</span>
    </div>

    <div className="landing-real-hero-proof" data-landing-hero-layer data-depth="0.1">
      <StudyIcon name="check-circle" size={15} />
      <span>Captured from the working StudyFlow product</span>
    </div>
  </div>
)

export const ShowcaseWorkspaceVisual = () => (
  <div className="landing-showcase-window landing-real-showcase">
    <div className="landing-real-showcase-main">
      <ProductScreenshot
        screenshot="calendar"
        caption="Plan the week, then move a task when real life changes."
      />
    </div>
    <div className="landing-real-showcase-side">
      <ProductScreenshot
        screenshot="planning"
        compact
        caption="Review the AI plan"
      />
      <ProductScreenshot
        screenshot="quizResults"
        compact
        caption="Close the loop with recall"
      />
    </div>
  </div>
)
