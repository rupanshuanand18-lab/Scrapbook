import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Edit3, Eye, Plus, Palette } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/ui/Button'
import ThemeCard from '../components/ThemeCard'
import AddMemoryModal from '../components/AddMemoryModal'
import { useApp } from '../context/AppContext'
import { getThemeById, getUserById, activityFeed } from '../data/mockData'

export default function BookDetail() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const { books, addMemory, getBookMemories } = useApp()
  const [showAddMemory, setShowAddMemory] = useState(false)

  const book = books.find((b) => b.id === bookId)

  if (!book) {
    return (
      <div className="min-h-screen paper-texture flex items-center justify-center px-5">
        <div className="text-center scrapbook-card p-10 rounded-3xl max-w-sm" style={{ rotate: '-0.5deg' }}>
          <p className="text-ink-muted mb-6 font-sans">This volume seems to have wandered off the shelf.</p>
          <Button onClick={() => navigate('/dashboard')}>Return to Bookshelf</Button>
        </div>
      </div>
    )
  }

  const theme = getThemeById(book.themeId)
  const owner = getUserById(book.ownerId)
  const collaborators = book.collaboratorIds.map(getUserById).filter(Boolean)
  const bookMemories = getBookMemories(bookId)

  return (
    <div className="min-h-screen paper-texture">
      <Navbar />

      <section className="relative pt-16">
        <div className="h-60 sm:h-[19rem] lg:h-[21rem] overflow-hidden relative">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover blur-[3px] scale-105 opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/40 to-ink/15" />
        </div>

        <div className="max-w-4xl mx-auto px-5 sm:px-8 -mt-40 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="scrapbook-card rounded-[36px] p-7 sm:p-10 relative paper-clip paper-fold-corner sunlight-glow"
            style={{ rotate: '0.2deg' }}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-28 h-44 sm:w-36 sm:h-52 rounded-r-xl rounded-l-sm overflow-hidden shadow-book flex-shrink-0 -mt-20 sm:-mt-28 border-4 border-paper border-l-[10px] border-l-warm-brown mx-auto md:mx-0 z-20 relative">
                <img src={book.coverImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-black/25" />
                <div className="absolute left-0 top-0 w-2.5 h-2.5 border-t border-l border-gold/80 rounded-tl-xs" />
                <div className="absolute left-0 bottom-0 w-2.5 h-2.5 border-b border-l border-gold/80 rounded-bl-xs" />
                <div className="absolute right-0 top-0 w-2.5 h-2.5 border-t border-r border-gold/80 rounded-tr-xs" />
                <div className="absolute right-0 bottom-0 w-2.5 h-2.5 border-b border-r border-gold/80 rounded-br-xs" />
              </div>

              <div className="flex-1 text-center md:text-left space-y-5 font-sans">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="px-3 py-1 rounded-full bg-cream-dark/50 text-[9px] font-semibold uppercase tracking-[0.15em] text-ink border border-beige/60">
                    {book.type}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-soft-pink/12 text-[9px] font-semibold uppercase tracking-[0.15em] text-pink-accent border border-pink-accent/20 flex items-center gap-1.5">
                    <Palette className="w-3 h-3" /> {theme.name}
                  </span>
                </div>

                <div>
                  <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink leading-tight">
                    {book.title}
                  </h1>
                  <p className="text-ink-muted text-sm sm:text-base mt-3 max-w-xl leading-relaxed">{book.description}</p>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-3 text-[10px] text-brown-light font-semibold uppercase tracking-[0.15em]">
                  <span>{book.memoryCount} moments preserved</span>
                  <span>·</span>
                  <span>Opened {new Date(book.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
                  <Button onClick={() => setShowAddMemory(true)} size="sm">
                    <Plus className="w-4 h-4" /> Add Moment
                  </Button>
                  <Link to={`/books/${bookId}/timeline`}>
                    <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> View Timeline
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4" /> Edit Volume
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-16 grid md:grid-cols-12 gap-10 items-start">

        <div className="md:col-span-4 space-y-7">
          <div className="scrapbook-card rounded-2xl p-6 border border-beige/40 space-y-4 font-sans" style={{ rotate: '-0.3deg' }}>
            <h3 className="font-display font-semibold text-ink text-base pl-0.5">Cover Theme</h3>
            <ThemeCard theme={theme} selected compact onClick={() => {}} />
          </div>

          {book.isShared && (
            <div className="scrapbook-card rounded-2xl p-6 border border-beige/40 space-y-6 font-sans" style={{ rotate: '0.4deg' }}>
              <div className="flex items-center justify-between border-b border-beige/30 pb-4">
                <div>
                  <h3 className="font-display font-semibold text-ink text-base leading-tight">Shared Story</h3>
                  <p className="text-[9px] uppercase tracking-[0.15em] font-semibold text-ink-muted mt-1.5">Curated by {owner?.name.split(' ')[0]}</p>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-[10px] px-2.5 rounded-lg">+ Invite</Button>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-[10px] uppercase font-semibold tracking-[0.12em] text-ink-muted">Together:</span>
                <div className="flex -space-x-2.5 overflow-hidden">
                  {collaborators.map((c) => (
                    <img
                      key={c.id}
                      src={c.avatar}
                      alt={c.name}
                      title={c.name}
                      className="inline-block w-8 h-8 rounded-full ring-2 ring-paper object-cover border border-beige/35 shadow-sm"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-1">
                <h4 className="font-display font-semibold text-ink text-sm">Shared Moments</h4>
                <div className="space-y-4 relative pl-4 border-l border-beige/50">
                  {activityFeed.slice(0, 3).map((item) => {
                    const activityUser = getUserById(item.userId)
                    return (
                      <div key={item.id} className="text-xs relative">
                        <div className="absolute -left-[21px] top-2 w-1.5 h-1.5 rounded-full bg-pink-accent/75 border-2 border-paper" />
                        <p className="text-ink-muted leading-relaxed font-sans">
                          <span className="font-semibold text-ink">{activityUser?.name.split(' ')[0]}</span>{' '}
                          {item.action}{' '}
                          <span className="font-medium text-ink italic">"{item.target.split(' ').slice(0, 2).join(' ')}..."</span>
                        </p>
                        <span className="font-handwritten text-sm text-brown-light/80 mt-1 block">{item.time}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-8 space-y-7">
          <div className="flex items-center justify-between border-b border-beige/35 pb-4">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink leading-tight">Recent Pages</h2>
            <Link to={`/books/${bookId}/timeline`} className="text-[10px] font-semibold uppercase tracking-[0.15em] text-pink-accent hover:underline flex items-center gap-1 font-sans">
              Full Timeline →
            </Link>
          </div>

          {bookMemories.length === 0 ? (
            <div className="text-center py-24 scrapbook-card rounded-[36px] border border-beige/40 flex flex-col items-center relative overflow-hidden" style={{ rotate: '-0.3deg' }}>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-5 washi-tape-accent pointer-events-none opacity-80" />
              <span className="text-5xl mb-5 select-none">📸</span>
              <p className="text-ink-muted text-base mb-8 font-display font-semibold">This volume awaits its first moment.</p>
              <Button onClick={() => setShowAddMemory(true)} size="sm">Capture a Memory</Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-8">
              {bookMemories.slice(0, 4).map((memory, index) => {
                const rotation = index % 2 === 0 ? -1.5 : 1.4
                return (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -8, rotate: rotation * 0.4, scale: 1.012 }}
                    className="polaroid-frame p-3.5 pb-9 rounded-sm relative overflow-hidden"
                    style={{ rotate: `${rotation}deg` }}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4.5 washi-tape pointer-events-none opacity-85 z-20 rotate-[1deg]" />

                    {memory.images?.[0] && (
                      <div className="aspect-square overflow-hidden rounded-xs border border-beige/30">
                        <img src={memory.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="pt-5 font-sans">
                      <div className="flex items-center gap-2 text-[9px] text-brown-light/80 font-semibold uppercase tracking-[0.12em]">
                        <Calendar className="w-3 h-3" />
                        <time>{new Date(memory.date).toLocaleDateString()}</time>
                      </div>
                      <h3 className="font-display font-semibold text-ink text-lg line-clamp-1 leading-tight mt-2">
                        {memory.title}
                      </h3>
                      <p className="text-ink-muted text-xs line-clamp-2 mt-2 leading-relaxed">
                        {memory.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <AddMemoryModal
        isOpen={showAddMemory}
        onClose={() => setShowAddMemory(false)}
        onSave={addMemory}
        bookId={bookId}
      />
    </div>
  )
}
