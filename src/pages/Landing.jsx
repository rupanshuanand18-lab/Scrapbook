import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Heart, Users, Compass, Home, Sparkles, ChevronRight, Star } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/ui/Button'
import ThemeCard from '../components/ThemeCard'
import { features, themes, previewBooks } from '../data/mockData'

const floatingPhotos = [
  { src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=140&h=140&fit=crop', x: '4%', y: '18%', delay: 0, rotate: -12, caption: 'summer daze' },
  { src: 'https://images.unsplash.com/photo-1542242476-5a3565835a38?q=80&w=140&h=140&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', x: '85%', y: '12%', delay: 0.5, rotate: 9, caption: 'roadtrips ✨' },
  { src: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=150&h=150&fit=crop', x: '81%', y: '62%', delay: 1, rotate: -7, caption: 'late nights' },
  { src: 'https://images.unsplash.com/photo-1569360556894-15dca0c6ff1a?q=80&w=140&h=140&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', x: '6%', y: '58%', delay: 1.5, rotate: 14, caption: 'coffee & notes' },
]

const liveActivityStickers = ['💕', '✨', '📸', '🌸', '⭐', '💌', '🌿']

const iconMap = {
  personal: BookOpen,
  couple: Heart,
  friendship: Users,
  travel: Compass,
  family: Home,
  custom: Sparkles
}

export default function Landing() {
  const navigate = useNavigate()
  const [selectedPreviewTheme, setSelectedPreviewTheme] = useState(themes[2])

  // Subtle automatic rotation of theme showcase to give "alive" motion
  useEffect(() => {
    const timer = setInterval(() => {
      setSelectedPreviewTheme((prev) => {
        const currentIndex = themes.findIndex(t => t.id === prev.id)
        const nextIndex = (currentIndex + 1) % themes.length
        return themes[nextIndex]
      })
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  // Filter out the College Memory book and map remaining preview books into shelf items
  const filteredBooks = previewBooks.filter(b => b.title.toLowerCase() !== 'college memories' && !b.title.toLowerCase().includes('college'));
  const displayItems = filteredBooks.map((b, idx) => ({ ...b, id: idx }));

  const chunkedBooks = []
  for (let i = 0; i < displayItems.length; i += 3) {
    chunkedBooks.push(displayItems.slice(i, i + 3))
  }

  return (
    <div className="min-h-screen paper-texture overflow-hidden relative selection:bg-pink-accent/20">
      {/* Luxury Ambient Background Layers with Enhanced Pulse */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Dynamic Glowing Aurora Orbs */}
        <motion.div
          animate={{ opacity: [0.05, 0.12, 0.05], scale: [1, 1.08, 1], x: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[750px] h-[750px] bg-gradient-to-br from-pink-300/30 via-gold/10 to-transparent rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ opacity: [0.04, 0.1, 0.04], scale: [1.02, 0.95, 1.02], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 -right-40 w-[650px] h-[650px] bg-gradient-to-bl from-amber-200/20 via-pink-200/10 to-transparent rounded-full blur-[130px]"
        />

        {/* Floating Particles */}
        {[
          { top: '15%', left: '12%', size: '3px', duration: 12, delay: 0 },
          { top: '28%', left: '88%', size: '2px', duration: 16, delay: 2 },
          { top: '48%', left: '22%', size: '3.5px', duration: 20, delay: 1 },
          { top: '75%', left: '78%', size: '2px', duration: 14, delay: 3 },
        ].map((particle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-pink-accent/20 backdrop-blur-[1px]"
            style={{ top: particle.top, left: particle.left, width: particle.size, height: particle.size }}
            animate={{ y: [0, -35, 0], x: [0, i % 2 === 0 ? 15 : -15, 0], opacity: [0.1, 0.6, 0.1] }}
            transition={{ duration: particle.duration, repeat: Infinity, ease: 'easeInOut', delay: particle.delay }}
          />
        ))}
      </div>

      <Navbar transparent />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-28 pb-24 px-5 sm:px-8 lg:px-10 z-10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Polaroids with Interactive Hover Float */}
          {floatingPhotos.map((photo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8, rotate: photo.rotate }}
              animate={{ opacity: 1, scale: 1, y: [0, -18, 0] }}
              transition={{
                opacity: { delay: photo.delay, duration: 0.8 },
                y: { delay: photo.delay + 0.5, duration: 5 + i * 0.8, repeat: Infinity, ease: 'easeInOut' },
              }}
              whileHover={{ scale: 1.1, rotate: 0, zIndex: 50 }}
              className="absolute hidden lg:block cursor-pointer shadow-lg transition-shadow"
              style={{ left: photo.x, top: photo.y }}
            >
              <div className="w-32 h-40 p-2.5 pb-8 polaroid-frame rounded-sm bg-white">
                <img src={photo.src} alt="" className="w-full h-28 object-cover rounded-sm border border-beige/30" />
                <p className="font-handwritten text-xs text-center mt-2 text-ink-muted">{photo.caption}</p>
              </div>
            </motion.div>
          ))}

          {/* Drifting Stickers */}
          {liveActivityStickers.map((s, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -15, 0], rotate: [0, 12, -12, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
              className="absolute text-2xl sm:text-3xl select-none opacity-80 hidden sm:block pointer-events-none"
              style={{ left: `${8 + i * 13}%`, top: `${22 + (i % 3) * 22}%` }}
            >
              {s}
            </motion.span>
          ))}
        </div>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-16 lg:gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-pink-500/10 border border-pink-accent/30 text-pink-accent text-xs font-semibold uppercase tracking-[0.2em] mb-8 shadow-sm backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Scrapbooking</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
            </motion.div>

            <h1 className="font-display text-[2.75rem] sm:text-5xl lg:text-[3.75rem] xl:text-[4.25rem] font-semibold text-ink leading-[1.08] mb-8 tracking-tight">
              These are memories<br className="hidden sm:block" /> worth keeping <span className="text-pink-accent italic">forever</span>.
            </h1>

            <p className="text-base sm:text-lg text-ink-muted leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0 font-sans">
              Not another cold photo app. A warm, handmade digital sanctuary where polaroids, handwritten notes, and shared stories come alive on a cozy wooden bookshelf.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" onClick={() => navigate('/signup')} className="shadow-lg shadow-pink-accent/20 hover:scale-105 transition-transform">
                Open Your First Volume
              </Button>
              <Button size="lg" variant="secondary" onClick={() => document.getElementById('bookshelf')?.scrollIntoView({ behavior: 'smooth' })}>
                Wander the Bookshelf
              </Button>
            </div>

            {/* Live Social Proof Badge */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-xs text-ink-muted font-sans">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="User" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="User" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="User" />
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                </div>
                <p className="font-medium text-ink mt-0.5">Loved by 12,500+ memory keepers</p>
              </div>
            </div>
          </motion.div>

          {/* Interactive 3D Book Mockup with Live Theme Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex justify-center perspective-[1400px]"
          >
            <motion.div
              animate={{ rotateY: [-4, 6, -4], y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="relative cursor-pointer group"
              style={{ transformStyle: 'preserve-3d' }}
              whileHover={{ rotateY: -15, scale: 1.04 }}
            >
              <div className="w-64 sm:w-[20rem] h-[24rem] sm:h-[28rem] rounded-r-2xl rounded-l shadow-2xl group-hover:shadow-book-hover transition-all duration-500 border-l-[14px] border-warm-brown relative overflow-hidden sunlight-glow">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedPreviewTheme.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`absolute inset-0 bg-gradient-to-br ${selectedPreviewTheme.gradient}`}
                  />
                </AnimatePresence>

                <div className="absolute top-12 left-14 w-28 h-6 washi-tape-accent pointer-events-none opacity-85 shadow-sm" />

                <div className="absolute bottom-10 left-10 right-10 z-10">
                  <motion.span
                    key={selectedPreviewTheme.name}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-[10px] tracking-[0.2em] font-semibold uppercase text-ink/80 bg-paper/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-beige/60 shadow-sm inline-block"
                  >
                    Theme: {selectedPreviewTheme.name}
                  </motion.span>
                  <h3 className="font-display font-semibold text-ink text-3xl sm:text-4xl leading-tight mt-3 drop-shadow-sm">
                    Our Story
                  </h3>
                  <span className="font-handwritten text-lg text-ink/85 bg-paper/90 px-3 py-1 border border-beige/40 rounded shadow-sm rotate-[2deg] inline-block mt-3 font-bold">
                    est. 2026 ✨
                  </span>
                </div>
              </div>

              {/* Decorative Corner Accents */}
              <div className="absolute -left-3 top-0 w-5 h-5 border-t-2 border-l-2 border-gold rounded-tl-sm" />
              <div className="absolute -left-3 bottom-0 w-5 h-5 border-b-2 border-l-2 border-gold rounded-bl-sm" />
              <div className="absolute -right-3 top-0 w-5 h-5 border-t-2 border-r-2 border-gold rounded-tr-sm" />
              <div className="absolute -right-3 bottom-0 w-5 h-5 border-b-2 border-r-2 border-gold rounded-br-sm" />

              {/* Orbiting mini-cards */}
              <motion.div
                animate={{ rotate: [-6, 3, -6], y: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-10 -right-10 w-28 h-32 p-2 pb-7 polaroid-frame -z-10 bg-white shadow-lg overflow-hidden"
              >
                <img src="https://images.unsplash.com/photo-1533158307587-828f0a76ef46?q=80&w=120&h=120&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="w-full h-20 object-cover rounded-sm" />
                <p className="font-handwritten text-[10px] text-center mt-1">memories</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid with Hover Animations */}
      <section id="features" className="section-breathe px-5 sm:px-8 lg:px-10 bg-parchment/40 border-y border-beige/40 relative z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <p className="font-handwritten text-2xl text-pink-accent mb-3">every chapter of life</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink mb-6 leading-tight">
              Journals Crafted for Your World
            </h2>
            <p className="text-ink-muted max-w-lg mx-auto text-sm sm:text-base leading-relaxed font-sans">
              Travel keepsakes, love letters, family heirlooms, or quiet personal reflections — each volume tells a story only you can write.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {features.map((f, i) => {
              const Icon = iconMap[f.id] || Sparkles
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -12, scale: 1.02 }}
                  className="scrapbook-card rounded-2xl p-8 flex flex-col items-start relative overflow-hidden paper-fold-corner group shadow-md hover:shadow-xl transition-all"
                >
                  <div className="absolute top-0 right-10 w-12 h-4 washi-tape pointer-events-none opacity-80 group-hover:scale-105 transition-transform" />

                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/10 to-amber-500/10 flex items-center justify-center mb-6 text-pink-accent shadow-inner border border-beige/40 group-hover:rotate-6 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-ink mb-3 group-hover:text-pink-accent transition-colors">{f.title}</h3>
                  <p className="text-ink-muted text-sm leading-relaxed font-sans">{f.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Handcrafted Bookshelf Preview (Single Shelf Row) */}
      <section id="bookshelf" className="section-breathe px-5 sm:px-8 lg:px-10 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <p className="font-handwritten text-2xl text-pink-accent mb-3">your collection awaits</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink mb-6">
              Your Handcrafted Bookshelf
            </h2>
            <p className="text-ink-muted text-sm sm:text-base font-sans max-w-md mx-auto">
              Hover over a volume to pull it off the shelf. Each cover preserves a distinct season of your life.
            </p>
          </motion.div>

          <div >
            <div className="relative bg-gradient-to-b from-[#e8e2d5] via-[#d5ccbc] to-[#bfb5a2] rounded-[50px] sm:rounded-[70px] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1),inset_0_2px_6px_rgba(255,255,255,0.7)] border-[6px] sm:border-[8px] border-[#a89d89] overflow-hidden">

              {/* Warm glow container */}
              <div className="absolute inset-4 sm:inset-6 rounded-[40px] sm:rounded-[55px] border-[2px] border-yellow-200/90 shadow-[inset_0_0_20px_rgba(253,224,71,0.5),0_0_20px_rgba(250,204,21,0.4)] pointer-events-none z-0" />

              {/* Wood cavity background */}
              <div className="absolute inset-5 sm:inset-7 bg-gradient-to-r from-[#e3dbcc] via-[#ede6d8] to-[#e3dbcc] rounded-[38px] sm:rounded-[50px] shadow-[inset_0_5px_20px_rgba(0,0,0,0.15)] -z-10" />

              {/* Content (First shelf row only) */}
              <div className="relative z-10 space-y-4 sm:space-y-8 py-4">
                {chunkedBooks.slice(0, 1).map((shelf, shelfIndex) => (
                  <div key={shelfIndex} className="relative pb-8 pt-4 border-b-0 last:pb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-16 items-center px-6 sm:px-16 lg:px-24 max-w-5xl mx-auto [perspective:1400px]">
                      {shelf.map((book, i) => (
                        <div key={book.title} className="flex justify-center group cursor-pointer" onClick={() => navigate('/signup')}>
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            whileHover={{ y: -20, rotateY: -12, rotate: 0, z: 20, scale: 1.05 }}
                            className="relative w-[210px] h-[280px] transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(-22deg)_translateY(-10px)_rotateX(2deg)]"
                          >
                            <div className="absolute inset-0 w-full h-full rounded-r-2xl rounded-l-md shadow-[15px_20px_35px_rgba(0,0,0,0.35)] overflow-hidden border-t border-r border-b border-beige/40 bg-white">
                              <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/30 via-black/10 to-transparent pointer-events-none z-20" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90" />
                              <div className="absolute bottom-3 left-3 right-3 z-10 text-center">
                                <p className="text-xs text-paper font-semibold truncate font-sans drop-shadow">{book.title}</p>
                              </div>
                            </div>
                            <div className="absolute right-0 top-[4px] w-[16px] h-[calc(100%-8px)] bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-300 [transform:rotateY(90deg)_translateZ(202px)] origin-right shadow-[inset_0_0_8px_rgba(0,0,0,0.15)] rounded-r-sm" />
                          </motion.div>
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-[#b0a390] via-[#8c806e] to-[#6d6252] shadow-[0_6px_12px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] rounded-full mx-2 sm:mx-6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Themes Selector */}
      <section id="themes" className="section-breathe px-5 sm:px-8 lg:px-10 bg-lavender-light/15 border-t border-beige/40 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="font-handwritten text-2xl text-pink-accent mb-3">dress your memories</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink mb-6">
              Themes That Mirror Your Heart
            </h2>
            <p className="text-ink-muted text-sm sm:text-base max-w-md mx-auto font-sans">
              Click a palette below to instantly preview it live on the hero journal above.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {themes.map((theme, i) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <ThemeCard
                  theme={theme}
                  selected={selectedPreviewTheme.id === theme.id}
                  onClick={() => {
                    setSelectedPreviewTheme(theme)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="section-breathe px-5 sm:px-8 lg:px-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center scrapbook-card rounded-[40px] p-12 sm:p-20 relative overflow-hidden paper-clip shadow-2xl"
          style={{ rotate: '0.2deg' }}
        >
          <div className="absolute top-0 left-0 w-32 h-1.5 bg-gradient-to-r from-pink-accent to-gold" />
          <div className="absolute top-5 left-8 washi-tape-accent w-24 h-5 opacity-90 shadow-sm" />
          <p className="font-handwritten text-xl text-pink-accent absolute bottom-6 right-8 rotate-[-6deg]">your story starts here →</p>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink mb-6 leading-tight">
            Begin Your Scrapbook Journey Today
          </h2>
          <p className="text-ink-muted text-sm sm:text-base mb-10 max-w-md mx-auto leading-relaxed font-sans">
            Invite someone you love, pin your favorite polaroids, write from the heart — and fill your shelf with moments that matter.
          </p>
          <Button size="lg" onClick={() => navigate('/signup')} className="group shadow-xl hover:scale-105 transition-transform">
            <span>Open Your First Volume</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </motion.div>
      </section>

      <footer className="py-12 text-center text-ink-muted text-xs sm:text-sm border-t border-beige/40 relative z-10 bg-parchment/20">
        <p className="font-handwritten text-xl text-pink-accent mb-2">made with love & memories ✨</p>
        <p>© 2026 Scrapiify — where your memories belong[cite: 1].</p>
      </footer>
    </div>
  )
}