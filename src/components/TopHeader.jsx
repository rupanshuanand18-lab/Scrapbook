import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Menu } from 'lucide-react'
import { useApp } from '../context/AppContext'
import logo from '../assets/logo.png'

function getPageTitle(pathname, search) {
  if (pathname === '/') return 'Home'
  if (pathname === '/login') return 'Sign in'
  if (pathname === '/signup') return 'Create account'
  if (pathname === '/welcome') return 'Welcome'
  if (pathname === '/dashboard') return 'Home'
  if (pathname === '/capture') return 'Capture'
  if (pathname === '/community') {
    const tab = new URLSearchParams(search).get('tab')
    return tab === 'Discover' ? 'Explore' : 'Community'
  }
  if (pathname === '/profile') return 'Profile'
  if (pathname.startsWith('/books/') && pathname.endsWith('/timeline')) return 'Timeline'
  if (pathname.startsWith('/books/')) return 'Book'
  return ''
}

export default function TopHeader({ onMenuClick, sidebarOpen }) {
  const { user } = useApp()
  const location = useLocation()

  const homeTo = user ? '/dashboard' : '/'
  const pageTitle = useMemo(
    () => getPageTitle(location.pathname, location.search),
    [location.pathname, location.search],
  )

  // Check if we're on the landing page (unauthenticated user on home page)
  const isLandingPage = !user && location.pathname === '/'

  return (
    <header className="fixed inset-x-3 top-3 z-50">
      <div className="glass-panel rounded-[1.5rem] border border-beige/55 shadow-[0_14px_34px_rgba(44,40,37,0.08)] backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-5 md:pl-5 md:pr-5">
          {/* Left side: Brand */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Brand */}
            <Link to={homeTo} className="flex items-center gap-3 group">
              <motion.span
                whileHover={{ rotate: 8, scale: 1.06 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl "
              >
                <img
                  src={logo}
                  alt="Scrapiify Logo"
                  className="h-20 w-20 object-contain"
                />
              </motion.span>
              <span className="min-w-0 font-display text-xl sm:text-2xl font-semibold tracking-tight text-ink">
                Scrapiify
              </span>
            </Link>
          </div>

          {/* Page Title (desktop only) */}
          <div className="hidden lg:flex min-w-0 flex-1 justify-center">
            {pageTitle ? (
              <span className="max-w-[18rem] truncate text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
                {pageTitle}
              </span>
            ) : null}
          </div>

          {/* Right side: Conditional rendering based on auth state */}
          <div className="flex items-center gap-3 justify-end min-w-[2.75rem] sm:min-w-[3rem]">
            {isLandingPage ? (
              // Landing page: Show Sign In and Sign Up buttons
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors rounded-lg"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-pink-accent text-white rounded-lg hover:bg-pink-accent/90 transition-colors shadow-[0_4px_12px_rgba(44,40,37,0.1)]"
                >
                  Sign up
                </Link>
              </>
            ) : (
              // Other pages: Show Menu Button + User Avatar (if authenticated)
              <>
                {/* Menu Button - Visible on both mobile AND desktop */}
                <button
                  type="button"
                  onClick={onMenuClick}
                  aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  aria-expanded={sidebarOpen}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-beige/60 bg-paper text-ink-muted transition-colors hover:border-pink-accent/35 hover:text-ink md:flex"
                >
                  <Menu className="h-5 w-5" />
                </button>

                {user ? (
                  <Link
                    to="/edit-profile"
                    aria-label="View profile"
                    className="group flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-pink-accent/40"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-10 w-10 rounded-full border border-beige/60 object-cover shadow-[0_4px_12px_rgba(44,40,37,0.08)] transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                ) : (
                  <span aria-hidden="true" className="h-10 w-10 rounded-full border border-transparent" />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}