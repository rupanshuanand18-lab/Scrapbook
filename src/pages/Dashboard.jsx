import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, FolderOpen } from 'lucide-react'
import Navbar from '../components/Navbar'
import BookCard from '../components/BookCard'
import SearchBar from '../components/ui/SearchBar'
import EmptyState from '../components/ui/EmptyState'
import CreateBookModal from '../components/CreateBookModal'
import Profile from '../components/Profile'
import { useApp } from '../context/AppContext'

const filters = [
  { id: 'all', label: 'Every Volume' },
  { id: 'personal', label: 'Personal' },
  { id: 'shared', label: 'Shared' },
]

export default function Dashboard() {
  const { books, addBook } = useApp()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)

  const filtered = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'all' ||
      (filter === 'personal' && !book.isShared) ||
      (filter === 'shared' && book.isShared)
    return matchesSearch && matchesFilter
  })

  // Group books into shelves of max 3
  const chunkedBooks = []
  for (let i = 0; i < filtered.length; i += 3) {
    chunkedBooks.push(filtered.slice(i, i + 3))
  }

  const personalCount = books.filter((b) => !b.isShared).length
  const sharedCount = books.filter((b) => b.isShared).length
  return (
    <div className="min-h-screen paper-texture">
      <Navbar />

      <main className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-28 sm:pt-32 pb-24">
        <div className="grid lg:grid-cols-12 gap-10 items-start mb-10">
          {/* Profile Section - Full Width Grid */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="lg:col-span-7 space-y-7"
          >
            <Profile />
          </motion.div>

          {/* Stats and Activity Grid */}

          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="lg:col-span-5 space-y-7"
          >
            <div className="scrapbook-card rounded-2xl p-7 border border-beige/40 space-y-5" style={{ rotate: '0.3deg' }}>
              <h3 className="font-display font-semibold text-ink text-lg text-base flex items-center gap-2">
                <Flame className="w-4 h-4 text-pink-accent" /> Your Story So Far
              </h3>

              <div className="space-y-4 font-sans">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted font-medium">Personal volumes</span>
                  <span className="font-semibold text-ink">{personalCount}</span>
                </div>
                <div className="w-full bg-cream rounded-full h-2 overflow-hidden border border-beige/20 shadow-inner-sm">
                  <div
                    className="bg-brown-light h-2 rounded-full transition-all duration-700"
                    style={{ width: `${(personalCount / Math.max(books.length, 1)) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm pt-1">
                  <span className="text-ink-muted font-medium">Shared stories</span>
                  <span className="font-semibold text-ink">{sharedCount}</span>
                </div>
                <div className="w-full bg-cream rounded-full h-2 overflow-hidden border border-beige/20 shadow-inner-sm">
                  <div
                    className="bg-pink-accent h-2 rounded-full transition-all duration-700"
                    style={{ width: `${(sharedCount / Math.max(books.length, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>



          </motion.div>
        </div>

        {/* Bookshelf Section */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="space-y-7"
        >
          <div className="flex flex-col sm:flex-row gap-5 items-stretch sm:items-center justify-between font-sans">
            <SearchBar value={search} onChange={setSearch} className="flex-1 max-w-sm" />

            <div className="flex bg-cream-dark/40 p-1.5 rounded-xl border border-beige/70 self-start sm:self-auto gap-1 relative">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`
                      px-5 py-2.5 rounded-lg text-[10px] font-semibold tracking-[0.15em] uppercase transition-all cursor-pointer relative z-10
                      ${filter === f.id ? 'text-ink' : 'text-ink-muted hover:text-ink'}
                    `}
                >
                  {filter === f.id && (
                    <motion.div
                      layoutId="activeFilterTab"
                      className="absolute inset-0 bg-paper-warm border border-beige/60 rounded-lg shadow-sm -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* BOOKSHELF DISPLAY */}
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty-dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState
                  icon={FolderOpen}
                  title="No volumes found"
                  description={
                    search
                      ? "We couldn't find a volume matching your search. Try a different title — every story has a name."
                      : 'Your bookshelf is ready for its first volume. Open a new scrapbook and begin preserving the moments that matter.'
                  }
                  actionLabel="Create New Volume"
                  onAction={() => setShowCreate(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="shelf-dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="bg-[#fdfbf7]"
              >
                {/* ONE UNIFIED MASTER CABINET CONTAINER WITH MULTIPLE RACKS */}
                <div className="relative bg-gradient-to-b from-[#e8e2d5] via-[#d5ccbc] to-[#bfb5a2] rounded-[50px] sm:rounded-[70px] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1),inset_0_2px_6px_rgba(255,255,255,0.7)] border-[6px] sm:border-[8px] border-[#a89d89] overflow-hidden">

                  {/* MASTER WARM YELLOW NEON GLOW CONTAINER - Safely inset all around without crossing over content */}
                  <div className="absolute inset-4 sm:inset-6 rounded-[40px] sm:rounded-[55px] border-[2px] border-yellow-200/90 shadow-[inset_0_0_20px_rgba(253,224,71,0.5),0_0_20px_rgba(250,204,21,0.4)] pointer-events-none z-0" />

                  {/* MASTER WOOD CAVITY BACKGROUND */}
                  <div className="absolute inset-5 sm:inset-7 bg-gradient-to-r from-[#e3dbcc] via-[#ede6d8] to-[#e3dbcc] rounded-[38px] sm:rounded-[50px] shadow-[inset_0_5px_20px_rgba(0,0,0,0.15)] -z-10" />

                  {/* CONTENT WRAPPER */}
                  <div className="relative z-10 space-y-4 sm:space-y-8 py-4">
                    {chunkedBooks.map((shelf, shelfIndex) => (
                      <div key={shelfIndex} className="relative pb-8 pt-4 border-b border-[#bfae9b]/60 last:border-b-0 last:pb-2">

                        {/* Books Container */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-16 items-center px-6 sm:px-16 lg:px-24 max-w-5xl mx-auto [perspective:1400px]">
                          {shelf.map((book, i) => (
                            <div key={book.id} className="flex justify-center group cursor-pointer">
                              <div className="relative w-[210px] h-[280px] transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(-22deg)_translateY(-10px)_rotateX(2deg)] group-hover:scale-105">

                                {/* Hardcover wrapper with strict CSS rules to prevent fallback card rendering on tablet viewports */}
                                <div className="absolute inset-0 w-full h-full rounded-r-2xl rounded-l-md shadow-[15px_20px_35px_rgba(0,0,0,0.35)] overflow-hidden border-t border-r border-b border-beige/40 bg-white">
                                  <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/30 via-black/10 to-transparent pointer-events-none z-20" />

                                  <div className="w-full h-full">
                                    <BookCard book={book} index={i} shelf />
                                  </div>
                                </div>

                                {/* 3D Book Pages / Right Thickness Edge */}
                                <div className="absolute right-0 top-[4px] w-[16px] h-[calc(100%-8px)] bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-300 [transform:rotateY(90deg)_translateZ(202px)] origin-right shadow-[inset_0_0_8px_rgba(0,0,0,0.15)] rounded-r-sm" />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Physical Wooden Rack Shelf Plank Divider */}
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-[#b0a390] via-[#8c806e] to-[#6d6252] shadow-[0_6px_12px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] rounded-full mx-2 sm:mx-6" />

                      </div>
                    ))}
                  </div>

                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>

      </main>

      <CreateBookModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={addBook}
      />
    </div>
  )
}
