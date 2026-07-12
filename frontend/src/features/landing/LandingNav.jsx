import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import StudyIcon from '../../components/StudyIcon'
import { NAV_LINKS } from './landingData'

export const LandingAuthAction = ({ cta, className = '', showArrow = true, ariaLabel }) => {
  if (!cta.ready) {
    return (
      <button
        type="button"
        className={`${className} landing-auth-action is-loading`}
        disabled
        aria-busy="true"
        aria-label="Checking sign-in status"
      >
        <span className="landing-cta-skeleton" aria-hidden="true" />
      </button>
    )
  }

  return (
    <Link className={`${className} landing-auth-action`} to={cta.to} aria-label={ariaLabel}>
      <span>{cta.label}</span>
      {showArrow && <StudyIcon name="arrow-right" size={15} strokeWidth={2.3} />}
    </Link>
  )
}

const LandingNav = ({ cta, isAuthenticated }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef(null)

  useEffect(() => {
    if (!isMenuOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="landing-nav-shell" data-landing-nav>
      <nav className="landing-nav" aria-label="Primary navigation">
        <a href="#main-content" className="landing-brand" onClick={closeMenu}>
          <span><StudyIcon name="layers" size={16} /></span>
          <strong>StudyFlow</strong>
        </a>

        <div className="landing-nav-links" aria-label="Landing sections">
          {NAV_LINKS.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </div>

        <div className="landing-nav-actions">
          {cta.ready && !isAuthenticated && <Link to="/login" className="landing-sign-in">Sign in</Link>}
          <LandingAuthAction cta={cta} className="landing-nav-cta" />
          <button
            ref={menuButtonRef}
            type="button"
            className="landing-menu-button"
            aria-expanded={isMenuOpen}
            aria-controls="landing-mobile-menu"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <StudyIcon name={isMenuOpen ? 'x' : 'menu'} size={19} />
          </button>
        </div>

        <div
          id="landing-mobile-menu"
          className={`landing-mobile-menu ${isMenuOpen ? 'is-open' : ''}`}
          aria-hidden={!isMenuOpen}
        >
          {NAV_LINKS.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>{item.label}</a>
          ))}
          {cta.ready && !isAuthenticated && (
            <Link to="/login" onClick={closeMenu}>Sign in</Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export default LandingNav
