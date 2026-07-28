import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import TopHeader from './TopHeader'
import DesktopSidebar from './navigation/DesktopSidebar'
import MobileBottomNav from './navigation/MobileBottomNav'

const NAV_SESSION_KEY = 'scrapbook-nav-open'

export default function Navbar() {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.sessionStorage.getItem(NAV_SESSION_KEY) === 'open'
  })

  const isAuthSurface = Boolean(user)

  useEffect(() => {
    window.sessionStorage.setItem(NAV_SESSION_KEY, menuOpen ? 'open' : 'closed')
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return undefined

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    closeMenu()
  }

  const handleNavigate = () => {
    closeMenu()
  }

  return (
    <>
      <TopHeader />
      {isAuthSurface ? (
        <>
          <DesktopSidebar
            open={menuOpen}
            onToggle={() => setMenuOpen((prev) => !prev)}
            onClose={closeMenu}
            onLogout={handleLogout}
            user={user}
            location={location}
          />
          <MobileBottomNav location={location} onNavigate={handleNavigate} />
        </>
      ) : null}
    </>
  )
}
