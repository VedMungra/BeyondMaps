import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path ? { fontWeight: 600, borderBottom: '2px solid var(--text-primary)', paddingBottom: '0.2rem' } : { fontWeight: 500 }

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem('userToken'))
    }

    // Check on initial load
    checkLogin()

    // Listen for custom login event from UserLogin page
    window.addEventListener('userLoginStateChanged', checkLogin)
    return () => window.removeEventListener('userLoginStateChanged', checkLogin)
  }, [])

  return (
    <nav className="navbar" style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>

        {/* Left: Logo */}
        <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Beyond Maps Logo" style={{ height: '50px', objectFit: 'contain', transform: 'scale(1.5)', transformOrigin: 'left center' }} />
        </Link>

        <div className="navbar-links" style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center' }}>
          <Link to="/tour-packages" className="nav-link" style={{ color: 'var(--text-primary)', textDecoration: 'none', ...isActive('/tour-packages') }}>Tour Packages</Link>
          <Link to="/group-trips" className="nav-link" style={{ color: 'var(--text-primary)', textDecoration: 'none', ...isActive('/group-trips') }}>Group Trips</Link>
        </div>

        {/* Right: Login Icon */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link to={isLoggedIn ? "/account" : "/login"} style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border-light)', textDecoration: 'none', transition: 'all 0.2s ease' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
        </div>

      </div>
    </nav>
  )
}
