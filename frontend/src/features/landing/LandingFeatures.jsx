import StudyIcon from '../../components/StudyIcon'
import { FEATURES } from './landingData'
import {
  CalendarVisual,
  FocusVisual,
  InsightsVisual,
  PlanningVisual,
  QuizVisual,
} from './LandingProductVisuals'

const FEATURE_VISUALS = {
  planning: PlanningVisual,
  calendar: CalendarVisual,
  focus: FocusVisual,
  quiz: QuizVisual,
  insights: InsightsVisual,
}

const LandingFeatures = () => (
  <section id="features" className="landing-features landing-section" aria-labelledby="landing-features-title">
    <div className="landing-feature-intro" data-landing-reveal-group>
      <div className="landing-section-kicker" data-landing-reveal><span>05</span><p>Built for the work</p></div>
      <h2 id="landing-features-title" data-landing-reveal>Each feature earns its place in the learning flow.</h2>
      <p data-landing-reveal>No inflated dashboards. No claims beyond what the product is built to do.</p>
    </div>

    <div className="landing-feature-list">
      {FEATURES.map((feature, index) => {
        const Visual = FEATURE_VISUALS[feature.id]
        return (
          <article
            key={feature.id}
            className={`landing-feature-row ${index % 2 === 1 ? 'is-reversed' : ''}`}
            data-landing-feature-row
          >
            <div className="landing-feature-copy">
              <div className="landing-feature-eyebrow">
                <span><StudyIcon name={feature.icon} size={15} /></span>
                {feature.eyebrow}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="landing-feature-note">
                <StudyIcon name="check" size={13} strokeWidth={2.5} />
                <span>{feature.note}</span>
              </div>
            </div>
            <div className="landing-feature-visual">
              <Visual />
            </div>
          </article>
        )
      })}
    </div>
  </section>
)

export default LandingFeatures
