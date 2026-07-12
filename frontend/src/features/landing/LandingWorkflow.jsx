import StudyIcon from '../../components/StudyIcon'
import { WORKFLOW_NODES } from './landingData'

const LandingWorkflow = () => (
  <section id="workflow" className="landing-workflow landing-section" aria-labelledby="landing-workflow-title">
    <div className="landing-workflow-heading" data-landing-reveal-group>
      <div className="landing-section-kicker" data-landing-reveal><span>04</span><p>The loop</p></div>
      <h2 id="landing-workflow-title" data-landing-reveal>Progress is a flow, not a pile of tasks.</h2>
      <p data-landing-reveal>Move through the loop, see what changed, and begin the next session with context.</p>
    </div>

    <div className="landing-workflow-map" data-landing-workflow-map>
      <svg className="landing-workflow-path" viewBox="0 0 1000 180" preserveAspectRatio="none" aria-hidden="true">
        <path data-landing-workflow-path d="M70 94 C170 94 180 46 280 46 S390 142 500 142 S610 46 720 46 S825 94 930 94" />
      </svg>
      <div className="landing-workflow-nodes">
        {WORKFLOW_NODES.map((node, index) => (
          <div key={node.label} className="landing-workflow-node" data-landing-workflow-node>
            <span><StudyIcon name={node.icon} size={17} /></span>
            <small>0{index + 1}</small>
            <strong>{node.label}</strong>
          </div>
        ))}
      </div>
      <div className="landing-workflow-return" aria-hidden="true">
        <StudyIcon name="arrow-right" size={13} />
        <span>Keep moving</span>
      </div>
    </div>
  </section>
)

export default LandingWorkflow
