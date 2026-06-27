import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Heart, Users, Compass, Home, Sparkles, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/ui/Button'
import ThemeCard from '../components/ThemeCard'
import { features, themes, previewBooks } from '../data/mockData'

const floatingPhotos = [
  { src: 'https://www.istockphoto.com/photo/a-view-up-into-the-trees-direction-sky-gm1317323736-404791748', x: '6%', y: '20%', delay: 0, rotate: -12 },
  { src: 'https://images.unsplash.com/photo-1522673605300-519db4893ebf?w=140&h=140&fit=crop', x: '86%', y: '14%', delay: 0.5, rotate: 9 },
  { src: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=150&h=150&fit=crop', x: '80%', y: '66%', delay: 1, rotate: -7 },
  { src: 'https://images.unsplash.com/photo-1516589178581-6ec78340e8b0?w=140&h=140&fit=crop', x: '4%', y: '60%', delay: 1.5, rotate: 14 },
]

const stickers = ['💕', '✨', '📸', '🌸', '⭐']

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

  return (
    <div className="min-h-screen paper-texture overflow-hidden">
      <Navbar transparent />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-28 pb-24 px-5 sm:px-8 lg:px-10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[15%] left-[20%] w-[550px] h-[550px] sunlight-orb rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.38, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-[20%] right-[15%] w-[450px] h-[450px] bg-lavender/15 rounded-full blur-3xl"
          />

          {floatingPhotos.map((photo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.75, rotate: photo.rotate }}
              animate={{ opacity: 0.9, scale: 1, y: [0, -14, 0] }}
              transition={{
                opacity: { delay: photo.delay, duration: 1 },
                scale: { delay: photo.delay, duration: 1 },
                y: { delay: photo.delay + 1, duration: 6 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="absolute hidden lg:block"
              style={{ left: photo.x, top: photo.y }}
            >
              <div
                className="w-28 h-36 p-2.5 pb-7 polaroid-frame rounded-sm"
                style={{ transform: `rotate(${photo.rotate}deg)` }}
              >
                <img src={photo.src} alt="" className="w-full h-full object-cover rounded-sm border border-beige/30" />
                <p className="font-handwritten text-sm text-center mt-2 text-ink-muted/70">a moment</p>
              </div>
            </motion.div>
          ))}

          {stickers.map((s, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -10, 0], rotate: [0, 6, -6, 0] }}
              transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
              className="absolute text-2xl sm:text-3xl select-none opacity-75 hidden sm:block"
              style={{ left: `${10 + i * 18}%`, top: `${26 + (i % 3) * 20}%` }}
            >
              {s}
            </motion.span>
          ))}
        </div>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-16 lg:gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-soft-pink/12 border border-pink-accent/20 text-pink-accent text-[10px] font-semibold uppercase tracking-[0.2em] mb-8 shadow-sm"
            >
              <Sparkles className="w-3 h-3" /> A place where memories belong
            </motion.span>

            <h1 className="font-display text-[2.75rem] sm:text-5xl lg:text-[3.75rem] xl:text-[4.25rem] font-semibold text-ink leading-[1.08] mb-8 tracking-tight">
              These are memories<br className="hidden sm:block" /> worth keeping forever.
            </h1>

            <p className="text-base sm:text-lg text-ink-muted leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0 font-sans">
              Not another app. A handmade digital scrapbook — where polaroids, handwritten notes, and shared stories come alive on a cozy wooden bookshelf.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" onClick={() => navigate('/signup')}>
                Open Your First Volume
              </Button>
              <Button size="lg" variant="secondary" onClick={() => document.getElementById('bookshelf')?.scrollIntoView({ behavior: 'smooth' })}>
                Wander the Bookshelf
              </Button>
            </div>

            <p className="font-handwritten text-xl text-ink-muted/60 mt-8 hidden lg:block rotate-[-2deg]">
              est. whenever your story began ✨
            </p>
          </motion.div>

          {/* 3D Scrapbook Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex justify-center perspective-[1400px]"
          >
            <motion.div
              animate={{ rotateY: [-6, 8, -6], y: [0, -8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="relative cursor-pointer group"
              style={{ transformStyle: 'preserve-3d' }}
              whileHover={{ rotateY: -18, scale: 1.02 }}
            >
              <div
                className="w-64 sm:w-[19rem] h-[22rem] sm:h-[26rem] rounded-r-2xl rounded-l shadow-book group-hover:shadow-book-hover transition-all duration-500 border-l-[12px] border-warm-brown relative overflow-hidden sunlight-glow"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${selectedPreviewTheme.gradient}`} />
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: selectedPreviewTheme.pattern === 'floral'
                      ? 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.5) 0%, transparent 50%)'
                      : selectedPreviewTheme.pattern === 'stars'
                      ? 'radial-gradient(2px 2px at 20% 30%, white 50%, transparent 50%)'
                      : 'none'
                  }}
                />

                <div className="absolute top-12 left-14 w-28 h-6 washi-tape-accent pointer-events-none opacity-85" />

                <div className="absolute bottom-10 left-10 right-10 z-10">
                  <span className="text-[9px] tracking-[0.2em] font-semibold uppercase text-ink/70 bg-paper/65 backdrop-blur-sm px-3 py-1 rounded-full border border-beige/50">
                    {selectedPreviewTheme.name}
                  </span>
                  <h3 className="font-display font-semibold text-ink text-3xl sm:text-4xl leading-tight mt-3 drop-shadow-sm">
                    Our Story
                  </h3>
                  <span className="font-handwritten text-lg text-ink/75 bg-paper/80 px-3 py-1 border border-beige/40 rounded shadow-sm rotate-[2deg] inline-block mt-3 font-bold">
                    est. 2026
                  </span>
                </div>
              </div>

              <div className="absolute -left-2 top-0 w-4 h-4 border-t-2 border-l-2 border-gold rounded-tl-sm" />
              <div className="absolute -left-2 bottom-0 w-4 h-4 border-b-2 border-l-2 border-gold rounded-bl-sm" />
              <div className="absolute -right-2 top-0 w-4 h-4 border-t-2 border-r-2 border-gold rounded-tr-sm" />
              <div className="absolute -right-2 bottom-0 w-4 h-4 border-b-2 border-r-2 border-gold rounded-br-sm" />

              <motion.div
                animate={{ rotate: [-4, 2, -4] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -top-8 -right-8 w-28 h-32 p-2 pb-7 polaroid-frame -z-10 overflow-hidden"
              >
                <img src="https://images.unsplash.com/photo-1522673605300-519db4893ebf?w=120&h=120&fit=crop" alt="" className="w-full h-full object-cover rounded-sm border border-beige/15" />
              </motion.div>
              <motion.div
                animate={{ rotate: [5, -3, 5] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute -bottom-10 -left-8 w-24 h-28 p-2 pb-7 polaroid-frame -z-10 overflow-hidden"
              >
                <img src="https://images.unsplash.com/photo-1493612276216-ee3925520721?w=100&h=100&fit=crop" alt="" className="w-full h-full object-cover rounded-sm border border-beige/15" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section-breathe px-5 sm:px-8 lg:px-10 bg-parchment/30 border-y border-beige/35">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-24"
          >
            <p className="font-handwritten text-2xl text-pink-accent/70 mb-3">every chapter of life</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink mb-6 leading-tight">
              Journals for Every Chapter of Life
            </h2>
            <p className="text-ink-muted max-w-lg mx-auto text-sm sm:text-base leading-relaxed font-sans">
              Travel keepsakes, love letters, family heirlooms, or quiet personal reflections — each volume tells a story only you can write.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12">
            {features.map((f, i) => {
              const Icon = iconMap[f.id] || Sparkles
              const rotation = (i % 2 === 0 ? -1.2 : 1.2)
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -10, rotate: rotation * 0.4 }}
                  className="scrapbook-card rounded-2xl p-9 flex flex-col items-start relative overflow-hidden paper-fold-corner"
                  style={{ rotate: `${rotation}deg` }}
                >
                  <div className="absolute top-0 right-10 w-12 h-4 washi-tape pointer-events-none opacity-70" />

                  <div className="w-12 h-12 rounded-2xl bg-cream-dark/50 flex items-center justify-center mb-7 text-pink-accent shadow-inner-sm border border-beige/30">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-ink mb-3">{f.title}</h3>
                  <p className="text-ink-muted text-sm leading-relaxed font-sans">{f.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Bookshelf Preview */}
      <section id="bookshelf" className="section-breathe px-5 sm:px-8 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-24"
          >
            <p className="font-handwritten text-2xl text-pink-accent/70 mb-3">your collection awaits</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink mb-6">
              Your Handcrafted Bookshelf
            </h2>
            <p className="text-ink-muted text-sm sm:text-base font-sans max-w-md mx-auto">
              Gently pull a volume from the shelf. Each cover holds a chapter of your favorite days.
            </p>
          </motion.div>

          <div className="bookshelf-wood rounded-[36px] p-8 sm:p-14 pt-14 sm:pt-16 relative overflow-hidden">
            <div className="absolute inset-0 bookshelf-highlight pointer-events-none" />

            <div className="flex items-end justify-center gap-5 sm:gap-10 flex-wrap relative z-10">
              {previewBooks.map((book, i) => (
                <motion.div
                  key={book.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -28, scale: 1.06, rotate: 0, zIndex: 20 }}
                  className="relative cursor-pointer perspective-[800px]"
                  style={{ rotate: `${book.rotation}deg` }}
                >
                  <div className="w-24 sm:w-36 aspect-[3/4.2] rounded-r-xl rounded-l overflow-hidden shadow-book hover:shadow-book-hover transition-all duration-400 border-l-[5px] border-black/15">
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/25 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-90" />
                    <div className="absolute bottom-3 left-3 right-3 z-10 text-center">
                      <p className="text-[10px] text-paper/95 font-semibold truncate font-sans">{book.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="h-5 mt-8 bg-gradient-to-b from-black/30 via-black/12 to-transparent rounded-b-2xl" />
          </div>
        </div>
      </section>

      {/* Themes */}
      <section id="themes" className="section-breathe px-5 sm:px-8 lg:px-10 bg-lavender-light/12 border-t border-beige/35">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <p className="font-handwritten text-2xl text-pink-accent/70 mb-3">dress your memories</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink mb-6">
              Themes That Mirror Your Heart
            </h2>
            <p className="text-ink-muted text-sm sm:text-base max-w-md mx-auto font-sans">
              Choose a palette below and watch it breathe life into the journal cover above.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-7">
            {themes.map((theme, i) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
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

      {/* CTA */}
      <section className="section-breathe px-5 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center scrapbook-card rounded-[40px] p-14 sm:p-24 relative overflow-hidden paper-clip"
          style={{ rotate: '0.3deg' }}
        >
          <div className="absolute top-0 left-0 w-24 h-1 bg-gold/60" />
          <div className="absolute top-5 left-8 washi-tape-accent w-24 h-5 opacity-80" />
          <p className="font-handwritten text-xl text-ink-muted/50 absolute bottom-6 right-8 rotate-[-6deg]">begin here →</p>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink mb-6 leading-tight">
            Begin Your Scrapbook Journey
          </h2>
          <p className="text-ink-muted text-sm sm:text-base mb-12 max-w-md mx-auto leading-relaxed font-sans">
            Invite someone you love, pin your favorite polaroids, write from the heart — and watch your bookshelf fill with moments that matter.
          </p>
          <Button size="lg" onClick={() => navigate('/signup')} className="group">
            <span>Open Your First Volume</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </motion.div>
      </section>

      <footer className="py-12 text-center text-ink-muted text-xs sm:text-sm border-t border-beige/35">
        <p className="font-handwritten text-lg text-ink-muted/60 mb-1">made with love</p>
        <p>© 2026 ScrapBook — where your memories belong.</p>
      </footer>
    </div>
  )
}
