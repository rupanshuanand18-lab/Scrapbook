import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { useApp } from '../context/AppContext'

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
  if (pathname === '/edit-profile') return 'Profile'
  if (pathname.startsWith('/books/') && pathname.endsWith('/timeline')) return 'Timeline'
  if (pathname.startsWith('/books/')) return 'Book'
  return ''
}

export default function TopHeader() {
  const { user } = useApp()
  const location = useLocation()

  const homeTo = user ? '/dashboard' : '/'
  const pageTitle = useMemo(
    () => getPageTitle(location.pathname, location.search),
    [location.pathname, location.search],
  )

  return (
    <header className="fixed inset-x-3 top-3 z-50">
      <div className="glass-panel rounded-[1.5rem] border border-beige/55 shadow-[0_14px_34px_rgba(44,40,37,0.08)] backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-5 md:pl-20 md:pr-5">
          <Link to={homeTo} className="flex items-center gap-3 min-w-0 group">
            <motion.span
              whileHover={{ rotate: 8, scale: 1.06 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-beige/60 bg-paper-warm text-pink-accent shadow-[0_6px_16px_rgba(44,40,37,0.06)]"
            >
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </motion.span>
            <span className="min-w-0 font-display text-xl sm:text-2xl font-semibold tracking-tight text-ink">
              ScrapBook
            </span>
          </Link>

          <div className="hidden lg:flex min-w-0 flex-1 justify-center">
            {pageTitle ? (
              <span className="max-w-[18rem] truncate text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
                {pageTitle}
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-end min-w-[2.75rem] sm:min-w-[3rem]">
            {user ? (
              <Link
                to="/edit-profile"
                aria-label="Open profile"
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
          </div>
        </div>
      </div>
    </header>
  )
}
