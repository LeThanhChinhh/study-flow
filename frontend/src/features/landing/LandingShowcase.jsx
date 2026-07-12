import StudyIcon from '../../components/StudyIcon'
import { ShowcaseWorkspaceVisual } from './LandingProductVisuals'

const LandingShowcase = () => (
  <section className="landing-showcase landing-section" aria-labelledby="landing-showcase-title" data-landing-showcase>
    <div className="landing-showcase-copy" data-landing-reveal-group>
      <div className="landing-section-kicker" data-landing-reveal><span>03</span><p>The product</p></div>
      <h2 id="landing-showcase-title" data-landing-reveal>Not another collection of disconnected study tools.</h2>
      <p data-landing-reveal>
        Your plan, calendar, focus session, quiz, and progress stay connected to the same learning goal.
      </p>
      <div className="landing-showcase-note" data-landing-reveal>
        <StudyIcon name="check-circle" size={16} />
        <span>One workspace. One next step.</span>
      </div>
    </div>

    <div className="landing-showcase-visual" data-landing-showcase-visual>
      <ShowcaseWorkspaceVisual />
    </div>
  </section>
)

export default LandingShowcase
