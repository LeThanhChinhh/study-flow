import StudyIcon from '../../components/StudyIcon'
import { LandingAuthAction } from './LandingNav'
import { HeroWorkspaceVisual } from './LandingProductVisuals'

const LandingHero = ({ cta }) => (
  <section className="landing-hero" aria-labelledby="landing-hero-title" data-landing-hero>
    <div className="landing-hero-copy">
      <div className="landing-eyebrow" data-landing-hero-eyebrow>
        <span><StudyIcon name="lightbulb" size={13} /></span>
        From study material to focused action
      </div>

      <h1 id="landing-hero-title">
        <span data-landing-hero-line>Turn your study materials</span>
        <span data-landing-hero-line>into a <em>learning flow.</em></span>
      </h1>

      <p data-landing-hero-copy>
        Upload your PDF. Let Gemini shape a practical plan. Fit it into your available time,
        focus deeply, and test what you remember.
      </p>

      <div className="landing-hero-actions" data-landing-hero-actions>
        <LandingAuthAction cta={cta} className="landing-primary-cta" />
        <a href="#how-it-works" className="landing-secondary-cta">
          <span>See how it works</span>
          <StudyIcon name="arrow-right" size={15} />
        </a>
      </div>

      <div className="landing-hero-proof" data-landing-hero-copy>
        <span><StudyIcon name="file-text" size={13} /> PDF to editable plan</span>
        <span><StudyIcon name="calendar" size={13} /> Built around your time</span>
        <span><StudyIcon name="timer" size={13} /> Focus and recall</span>
      </div>
    </div>

    <div className="landing-hero-visual-wrap" id="product">
      <HeroWorkspaceVisual />
    </div>
  </section>
)

export default LandingHero
