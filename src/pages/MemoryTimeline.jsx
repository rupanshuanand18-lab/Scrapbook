import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Calendar, Smile } from 'lucide-react'
import Navbar from '../components/Navbar'
import MemoryCard from '../components/MemoryCard'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import AddMemoryModal from '../components/AddMemoryModal'
import { useApp } from '../context/AppContext'
import { moods } from '../data/mockData'

export default function MemoryTimeline() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const { books, addMemory, getBookMemories } = useApp()
  const [showAddMemory, setShowAddMemory] = useState(false)
  const [selectedMood, setSelectedMood] = useState('all')

  const book = books.find((b) => b.id === bookId)
  const bookMemories = getBookMemories(bookId)

  if (!book) {
    return (
      <div className="min-h-screen paper-texture flex items-center justify-center px-5">
        <div className="text-center scrapbook-card p-10 rounded-3xl max-w-sm">
          <p className="text-ink-muted mb-6 font-sans">This volume seems to have wandered off the shelf.</p>
          <Button onClick={() => navigate('/dashboard')}>Return to Bookshelf</Button>
        </div>
      </div>
    )
  }

  const filteredMemories = bookMemories.filter((m) => {
    return selectedMood === 'all' || m.mood === selectedMood
  })

  return (
    <div className="min-h-screen paper-texture">
      <Navbar />

      <main className="max-w-4xl mx-auto px-5 sm:px-8 pt-28 pb-32 sm:pb-24">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <Link
            to={`/books/${bookId}`}
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-pink-accent hover:underline mb-6 font-sans"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to {book.title}
          </Link>

          <p className="font-handwritten text-2xl text-pink-accent/70 mb-3">a story in moments</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-ink leading-tight mb-4">
            Memory Timeline
          </h1>
          <p className="text-ink-muted text-sm sm:text-base font-sans">
            {bookMemories.length} cherished moments preserved in this volume.
          </p>

          <Button onClick={() => setShowAddMemory(true)} size="sm" className="mt-8">
            <Plus className="w-4 h-4" /> Add Moment
          </Button>
        </motion.div>

        {bookMemories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-col items-center gap-3 mb-16 font-sans"
          >
            <span className="text-[9px] uppercase font-semibold tracking-[0.2em] text-ink-muted flex items-center gap-1.5 mb-1">
              <Smile className="w-3.5 h-3.5" /> Filter by feeling
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 bg-cream-dark/30 p-2 rounded-xl border border-beige/70">
              <button
                onClick={() => setSelectedMood('all')}
                className={`
                  px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-[0.12em] cursor-pointer transition-all duration-300
                  ${selectedMood === 'all'
                    ? 'bg-paper-warm text-ink shadow-sm border border-beige/60'
                    : 'text-ink-muted hover:text-ink'
                  }
                `}
              >
                ✨ Every Moment
              </button>
              {moods.map((m) => {
                const count = bookMemories.filter((mem) => mem.mood === m.id).length
                if (count === 0) return null

                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMood(m.id)}
                    className={`
                      px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-[0.12em] cursor-pointer transition-all duration-300 flex items-center gap-1.5
                      ${selectedMood === m.id
                        ? 'bg-paper-warm text-ink shadow-sm border border-beige/60'
                        : 'text-ink-muted hover:text-ink'
                      }
                    `}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-cream-dark/60 opacity-70 font-sans">{count}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {bookMemories.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="A blank page awaits"
            description="Every great story begins with a single moment. Capture your first memory — a photo, a feeling, a day you'll never forget."
            actionLabel="Capture a Memory"
            onAction={() => setShowAddMemory(true)}
          />
        ) : filteredMemories.length === 0 ? (
          <div className="text-center py-20 scrapbook-card rounded-3xl border border-beige/40 flex flex-col items-center" style={{ rotate: '-0.3deg' }}>
            <span className="text-4xl mb-5 select-none">🔍</span>
            <p className="text-ink-muted text-sm sm:text-base font-medium font-sans">No moments match this feeling yet.</p>
            <Button onClick={() => setSelectedMood('all')} variant="secondary" size="sm" className="mt-5">Show All Moments</Button>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-1/2 top-6 bottom-10 w-[2px] stitch-line hidden sm:block -translate-x-1/2 opacity-50" />

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredMemories.map((memory, i) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.4 }}
                    layout
                  >
                    <MemoryCard memory={memory} index={i} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center pt-16"
            >
              <span className="text-3xl select-none">✨</span>
              <p className="font-handwritten text-2xl sm:text-3xl font-bold text-ink-muted/70 mt-3 select-none">...and the story continues</p>
            </motion.div>
          </div>
        )}
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
