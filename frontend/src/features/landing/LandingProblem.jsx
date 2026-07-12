import StudyIcon from '../../components/StudyIcon'
import { PROBLEM_POINTS } from './landingData'

const LandingProblem = () => (
  <section className="landing-problem landing-section" aria-labelledby="landing-problem-title" data-landing-reveal-group>
    <div className="landing-section-kicker" data-landing-reveal>
      <span>01</span>
      <p>The friction before focus</p>
    </div>

    <div className="landing-problem-grid">
      <div className="landing-problem-list" aria-label="Common study planning problems">
        {PROBLEM_POINTS.map((point, index) => (
          <div key={point} data-landing-problem-item>
            <span>0{index + 1}</span>
            <p>{point}</p>
          </div>
        ))}
      </div>

      <div className="landing-problem-promise" data-landing-reveal>
        <div className="landing-promise-mark" aria-hidden="true">
          <StudyIcon name="arrow-right" size={20} />
        </div>
        <p className="landing-promise-overline">One connected workspace</p>
        <h2 id="landing-problem-title">One calm workflow from material to meaningful progress.</h2>
        <p>
          StudyFlow brings planning, scheduling, focus, recall, and progress into one place—so
          the work of organizing does not consume the energy meant for learning.
        </p>
      </div>
    </div>
  </section>
)

export default LandingProblem
