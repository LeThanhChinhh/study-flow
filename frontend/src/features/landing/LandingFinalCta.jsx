import StudyIcon from '../../components/StudyIcon'
import { LandingAuthAction } from './LandingNav'

const LandingFinalCta = ({ cta }) => (
  <section className="landing-final-cta landing-section" aria-labelledby="landing-final-title" data-landing-final>
    <div className="landing-final-orbit" aria-hidden="true">
      <svg viewBox="0 0 900 380" preserveAspectRatio="none">
        <path d="M-70 350 C180 10 640 10 970 330" />
        <path d="M30 380 C270 80 590 74 890 360" />
      </svg>
      <span /><span />
    </div>
    <div className="landing-final-copy">
      <div className="landing-eyebrow" data-landing-final-item>
        <span><StudyIcon name="target" size={13} /></span>
        A calmer way to begin
      </div>
      <h2 id="landing-final-title" data-landing-final-item>Your study plan should not be another task.</h2>
      <p data-landing-final-item>Let StudyFlow shape the work, so you can spend your energy learning.</p>
      <div data-landing-final-item>
        <LandingAuthAction cta={cta} className="landing-primary-cta landing-final-button" />
      </div>
    </div>
  </section>
)

export default LandingFinalCta
