import StudyIcon from '../../components/StudyIcon'
import { HOW_STEPS } from './landingData'
import { HowStepVisual } from './LandingProductVisuals'

const LandingHowItWorks = () => (
  <section id="how-it-works" className="landing-how landing-section" aria-labelledby="landing-how-title">
    <div className="landing-section-heading" data-landing-reveal-group>
      <div className="landing-section-kicker" data-landing-reveal><span>02</span><p>How it works</p></div>
      <h2 id="landing-how-title" data-landing-reveal>A clear path from upload to recall.</h2>
      <p data-landing-reveal>
        Each step hands useful context to the next, without asking you to rebuild the same plan in another tool.
      </p>
    </div>

    <div className="landing-how-grid">
      <div className="landing-how-sticky">
        <div className="landing-how-visual-frame">
          <div className="landing-how-frame-label">
            <span>LEARNING FLOW</span>
            <small>01 — 04</small>
          </div>
          <div className="landing-how-visual-stack">
            {HOW_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`landing-how-visual ${index === 0 ? 'is-active' : ''}`}
                data-landing-how-visual={step.id}
              >
                <HowStepVisual stepId={step.id} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="landing-how-steps">
        {HOW_STEPS.map((step, index) => (
          <article
            key={step.id}
            className={`landing-how-step ${index === 0 ? 'is-active' : ''}`}
            data-landing-how-step={step.id}
          >
            <div className="landing-how-step-copy">
              <span className="landing-how-number">{step.number}</span>
              <div className="landing-how-icon"><StudyIcon name={step.icon} size={18} /></div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
            <div className="landing-how-mobile-visual">
              <HowStepVisual stepId={step.id} />
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
)

export default LandingHowItWorks
