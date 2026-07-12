import { useMemo, useRef } from 'react'
import { useAuth } from '../auth/AuthContext'
import LandingFeatures from '../features/landing/LandingFeatures'
import LandingFinalCta from '../features/landing/LandingFinalCta'
import LandingFooter from '../features/landing/LandingFooter'
import LandingHero from '../features/landing/LandingHero'
import LandingHowItWorks from '../features/landing/LandingHowItWorks'
import LandingNav from '../features/landing/LandingNav'
import LandingProblem from '../features/landing/LandingProblem'
import LandingShowcase from '../features/landing/LandingShowcase'
import LandingWorkflow from '../features/landing/LandingWorkflow'
import useLandingAnimations from '../features/landing/useLandingAnimations'
import '../features/landing/landing.css'

const LandingPage = () => {
  const rootRef = useRef(null)
  const { isAuthenticated, isInitializing } = useAuth()

  const primaryCta = useMemo(() => ({
    ready: !isInitializing,
    label: isAuthenticated ? 'Go to Dashboard' : 'Start for free',
    to: isAuthenticated ? '/dashboard' : '/register',
  }), [isAuthenticated, isInitializing])

  useLandingAnimations(rootRef)

  return (
    <div ref={rootRef} className="landing-page">
      <a className="landing-skip-link" href="#main-content">Skip to main content</a>
      <LandingNav cta={primaryCta} isAuthenticated={isAuthenticated} />

      <main id="main-content">
        <LandingHero cta={primaryCta} />
        <LandingProblem />
        <LandingHowItWorks />
        <LandingShowcase />
        <LandingWorkflow />
        <LandingFeatures />
        <LandingFinalCta
          cta={{
            ...primaryCta,
            label: isAuthenticated ? 'Go to Dashboard' : 'Build your learning flow',
          }}
        />
      </main>

      <LandingFooter isAuthenticated={isAuthenticated} isAuthReady={!isInitializing} />
    </div>
  )
}

export default LandingPage
