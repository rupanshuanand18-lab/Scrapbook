import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import logo from '../assets/logo.png'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" className="mr-1.5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useApp()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    login(email)
    navigate('/dashboard')
  }

  const handleGoogle = () => {
    login('priya@example.com')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-12 overflow-hidden paper-texture">

      <div className="hidden lg:flex lg:col-span-6 relative bg-parchment/40 border-r border-beige/40 flex-col justify-between p-14 overflow-hidden select-none">
        <div className="absolute top-16 left-16 w-[420px] h-[420px] sunlight-orb rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-16 right-16 w-[380px] h-[380px] bg-lavender/10 rounded-full blur-3xl pointer-events-none" />

        <Link to="/" className="flex items-center gap-3 z-10 self-start group">
          <img src={logo} alt="Scrapiify Logo" className="w-15 h-15" />
          <span className="font-display text-2xl font-semibold tracking-tight text-ink">Scrapiify</span>
        </Link>

        <div className="relative w-full max-w-sm mx-auto h-[400px] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, rotate: -10, scale: 0.88 }}
            animate={{ opacity: 1, rotate: -7, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-6 left-2 w-52 p-3 pb-9 polaroid-frame"
          >
            <div className="aspect-square overflow-hidden rounded-xs border border-beige/25">
              <img src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=200&h=200&fit=crop" alt="" className="w-full h-full object-cover" />
            </div>
            <p className="font-handwritten text-xl font-bold text-center mt-3 text-ink-muted">Loved 🥰</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, rotate: 12, scale: 0.88 }}
            animate={{ opacity: 1, rotate: 9, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-4 right-2 w-52 p-3 pb-9 polaroid-frame"
          >
            <div className="aspect-square overflow-hidden rounded-xs border border-beige/25">
              <img src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=200&h=200&fit=crop" alt="" className="w-full h-full object-cover" />
            </div>
            <p className="font-handwritten text-xl font-bold text-center mt-3 text-ink-muted">Wanderlust ✈️</p>
          </motion.div>
        </div>

        <div className="z-10 max-w-sm self-center text-center">
          <h2 className="font-display text-3xl font-semibold text-ink leading-[1.25] mb-4">
            "We do not remember days,<br />we remember moments."
          </h2>
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold font-sans text-brown-light">— Cesare Pavese</p>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-6 flex items-center justify-center px-6 py-14 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md space-y-10"
        >
          <div className="text-center lg:text-left">
            <Link to="/" className="inline-flex lg:hidden items-center gap-2.5 mb-8 group">
              <img src={logo} alt="Scrapiify Logo" className="w-15 h-15" />
              <span className="font-display text-2xl font-semibold text-ink">Scrapiify</span>
            </Link>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-none">Welcome back</h2>
            <p className="text-sm text-ink-muted mt-3 font-sans">Your stories are waiting. Pick up where you left off.</p>
          </div>

          <div className="scrapbook-card rounded-[32px] p-9 sm:p-11 space-y-7 relative paper-clip paper-fold-corner" style={{ rotate: '-0.3deg' }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full py-3.5">
                Return to My Scrapiify
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-beige/60" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-paper-warm text-ink-muted/80 font-semibold uppercase tracking-[0.2em] text-[9px] font-sans border border-beige/40 rounded-full">or</span>
              </div>
            </div>

            <Button variant="secondary" className="w-full py-3.5" onClick={handleGoogle}>
              <GoogleIcon />
              <span>Continue with Google</span>
            </Button>

            <p className="text-center text-sm text-ink-muted font-medium pt-1 font-sans">
              New here?{' '}
              <Link to="/signup" className="text-pink-accent font-semibold hover:underline">
                Start your story
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
