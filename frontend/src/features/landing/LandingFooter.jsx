import { Link } from 'react-router-dom'

const LandingFooter = ({ isAuthenticated, isAuthReady }) => (
  <footer className="landing-footer">
    <div className="landing-footer-brand">
      <img src="/studyflow_logo.png" alt="StudyFlow" className="h-6 w-6 object-contain" />
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
