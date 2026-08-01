import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import TopHeader from './TopHeader'
import DesktopSidebar from './navigation/DesktopSidebar'
import MobileBottomNav from './navigation/MobileBottomNav'
import MobileDrawer from './navigation/MobileDrawer'

const NAV_SESSION_KEY = 'scrapbook-nav-open'

export default function Navbar() {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.sessionStorage.getItem(NAV_SESSION_KEY) === 'open'
  })
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isAuthSurface = Boolean(user)

  // Close sidebar on route change
  useEffect(() => {
    const cleanup = () => setSidebarOpen(false)
    cleanup()
  }, [location.pathname])

  // Close drawer on route change
  useEffect(() => {
    const cleanup = () => setDrawerOpen(false)
    cleanup()
  }, [location.pathname])

  useEffect(() => {
    window.sessionStorage.setItem(NAV_SESSION_KEY, sidebarOpen ? 'open' : 'closed')
  }, [sidebarOpen])

  useEffect(() => {
    if (!sidebarOpen && !drawerOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false)
        setDrawerOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, drawerOpen])

  useEffect(() => {
    if (!sidebarOpen && !drawerOpen) return undefined

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [sidebarOpen, drawerOpen])

  const closeSidebar = () => setSidebarOpen(false)
  const closeDrawer = () => setDrawerOpen(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    closeSidebar()
    closeDrawer()
  }

  const handleNavigate = () => {
    closeSidebar()
    closeDrawer()
  }

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  const toggleDrawer = () => {
    setDrawerOpen(prev => !prev)
  }

  return (
    <>
      <TopHeader
        onMenuClick={window.innerWidth >= 768 ? toggleSidebar : toggleDrawer}
        sidebarOpen={sidebarOpen}
      />
      {isAuthSurface ? (
        <>
          <DesktopSidebar
            open={sidebarOpen}
            onClose={closeSidebar}
            onLogout={handleLogout}
            user={user}
            location={location}
          />
          <MobileDrawer
            open={drawerOpen}
            onClose={closeDrawer}
            onLogout={handleLogout}
            user={user}
            location={location}
            onNavigate={handleNavigate}
          />
          <MobileBottomNav
            location={location}
            onNavigate={handleNavigate}
          />
        </>
      ) : null}
    </>
  )
}