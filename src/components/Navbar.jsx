import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, LogOut, Menu, X, Compass, Layers, Heart, Camera, UserRound } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from './ui/Button'


export default function Navbar({ transparent = false }) {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isLanding = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-40 transition-all duration-500
        ${transparent && isLanding && !scrolled
          ? 'bg-transparent py-6 sm:py-7 border-b border-transparent'
          : 'glass-panel border-b border-beige/50 shadow-[0_2px_16px_rgba(44,40,37,0.04)] py-3.5 sm:py-4'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
              <BookOpen className="w-5 h-5 text-pink-accent" />
            </motion.div>
            <span className="font-display text-2xl font-semibold tracking-tight text-ink">
              ScrapBook
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-9">
            {isLanding && (
              <>
                <a href="#features" className="text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-muted hover:text-pink-accent transition-colors duration-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" /> Chapters
                </a>
                <a href="#bookshelf" className="text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-muted hover:text-pink-accent transition-colors duration-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Bookshelf
                </a>
                <a href="#themes" className="text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-muted hover:text-pink-accent transition-colors duration-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> Themes
                </a>
              </>
            )}
            {user ? (
              <>
                <Link to="/dashboard" className="text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-muted hover:text-ink transition-colors duration-300">
                  My Bookshelf
                </Link>

                <Link
                  to="/capture"
                  className="text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-muted hover:text-ink transition-colors duration-300 flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Capture
                </Link>

                <Link
                  to="/community"
                  className="text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-muted hover:text-ink transition-colors duration-300 flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Community
                </Link>

                <Link
                  to="/edit-profile"
                  className="text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-muted hover:text-ink transition-colors duration-300 flex items-center gap-1.5"
                >
                  <UserRound className="w-3.5 h-3.5" />
                  Edit Profile
                </Link>
                <div className="flex items-center gap-4 pl-5 border-l border-beige/60">
                  <Link to="/edit-profile" className="flex items-center gap-2.5 group cursor-pointer">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-accent/30 group-hover:ring-pink-accent/60 transition-all duration-300 shadow-sm" />
                    <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-ink-muted group-hover:text-ink transition-colors">{user.name.split(' ')[0]}</span>
                  </Link>
                  <button onClick={handleLogout} title="Log out" className="text-ink-muted hover:text-pink-accent cursor-pointer transition-colors p-2 rounded-xl hover:bg-cream-dark/50">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-muted hover:text-ink transition-colors duration-300">Sign In</Link>
                <Button size="sm" onClick={() => navigate('/signup')}>Begin Your Story</Button>
              </>
            )}
          </div>

          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-cream-dark/40 hover:bg-cream-dark/70 cursor-pointer text-ink transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden glass-panel border-b border-beige/40 overflow-hidden"
          >
            <div className="px-5 py-6 flex flex-col gap-4">
              {isLanding && (
                <>
                  <a href="#features" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium text-ink-muted hover:text-pink-accent transition-colors flex items-center gap-2">
                    <Compass className="w-4 h-4" /> Chapters
                  </a>
                  <a href="#bookshelf" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium text-ink-muted hover:text-pink-accent transition-colors flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Bookshelf
                  </a>
                  <a href="#themes" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium text-ink-muted hover:text-pink-accent transition-colors flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Themes
                  </a>
                </>
              )}
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium text-ink hover:text-pink-accent transition-colors">
                    My Bookshelf
                  </Link>
                  <Link to="/capture" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium text-ink hover:text-pink-accent transition-colors flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Capture
                  </Link>
                  <Link to="/community" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium text-ink hover:text-pink-accent transition-colors flex items-center gap-2">
                    <Compass className="w-4 h-4" /> Community
                  </Link>
                  <Link to="/edit-profile" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium text-ink hover:text-pink-accent transition-colors flex items-center gap-2">
                    <UserRound className="w-4 h-4" /> Edit Profile
                  </Link>
                  <div className="h-px bg-beige/40 my-1" />
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2.5">
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-accent/25" />
                      <span className="text-sm font-medium text-ink">{user.name}</span>
                    </div>
                    <button onClick={handleLogout} className="text-sm font-medium text-pink-accent flex items-center gap-1.5 cursor-pointer">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium text-ink hover:text-pink-accent transition-colors">Sign In</Link>
                  <Button size="sm" onClick={() => { navigate('/signup'); setMenuOpen(false) }} className="w-full">
                    Begin Your Story
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
