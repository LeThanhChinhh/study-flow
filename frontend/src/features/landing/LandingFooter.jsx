import { Link } from 'react-router-dom'
import StudyIcon from '../../components/StudyIcon'

const LandingFooter = ({ isAuthenticated, isAuthReady }) => (
  <footer className="landing-footer">
    <div className="landing-footer-brand">
      <span><StudyIcon name="layers" size={15} /></span>
      <div><strong>StudyFlow</strong><p>Built for focused learning.</p></div>
    </div>

    <div className="landing-footer-links" aria-label="Footer navigation">
      <a href="#product">Product</a>
      {isAuthReady && (
        isAuthenticated
          ? <Link to="/dashboard">Dashboard</Link>
          : <>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create account</Link>
            </>
      )}
    </div>

    <p className="landing-footer-copy">© 2026 StudyFlow</p>
  </footer>
)

export default LandingFooter
