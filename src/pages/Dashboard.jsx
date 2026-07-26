import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Sparkles, Activity, Plus, Flame, FolderOpen } from 'lucide-react'
import Navbar from '../components/Navbar'
import BookCard from '../components/BookCard'
import SearchBar from '../components/ui/SearchBar'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import CreateBookModal from '../components/CreateBookModal'
import Profile from '../components/Profile'
import { useApp } from '../context/AppContext'
import { activityFeed, getUserById } from '../data/mockData'

const filters = [
  { id: 'all', label: 'Every Volume' },
  { id: 'personal', label: 'Personal' },
  { id: 'shared', label: 'Shared' },
]

export default function Dashboard() {
  const { books, addBook, user } = useApp()
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
  const totalMemories = books.reduce((acc, curr) => acc + (curr.memoryCount || 0), 0)

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
            className="lg:col-span-8 space-y-7"
          >
            <Profile />
          </motion.div>

          {/* Stats and Activity Grid */}

          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="lg:col-span-4 space-y-7"
          >
            <div className="scrapbook-card rounded-2xl p-7 border border-beige/40 space-y-5" style={{ rotate: '0.3deg' }}>
              <h3 className="font-display font-semibold text-ink text-base flex items-center gap-2">
                <Flame className="w-4 h-4 text-pink-accent" /> Your Story So Far
              </h3>

              <div className="space-y-4 font-sans">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-muted font-medium">Personal volumes</span>
                  <span className="font-semibold text-ink">{personalCount}</span>
                </div>
                <div className="w-full bg-cream rounded-full h-2 overflow-hidden border border-beige/20 shadow-inner-sm">
                  <div
                    className="bg-brown-light h-2 rounded-full transition-all duration-700"
                    style={{ width: `${(personalCount / Math.max(books.length, 1)) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs pt-1">
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
          {/*
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
                  description={search ? "We couldn't find a volume matching your search. Try a different title — every story has a name." : "Your bookshelf is ready for its first volume. Open a new scrapbook and begin preserving the moments that matter."}
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
                className="bookshelf-wood rounded-[36px] p-8 sm:p-12 pt-14 relative overflow-hidden"
              >
                <div className="absolute inset-0 bookshelf-highlight pointer-events-none rounded-[36px]" />

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-7 sm:gap-10 items-end relative z-10">
                  {filtered.map((book, i) => (
                    <BookCard key={book.id} book={book} index={i} shelf />
                  ))}
                </div>

                <div className="h-5 mt-8 bg-gradient-to-b from-black/30 via-black/12 to-transparent rounded-b-2xl" />
              </motion.div>
              
            )}
          </AnimatePresence>
          */}


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
                className="bg-[#fdfbf7] space-y-12 sm:space-y-16"
              >
                {/* Map over the chunks to create each floating capsule shelf unit matching your reference */}
                {chunkedBooks.map((shelf, shelfIndex) => (
                  <div
                    key={shelfIndex}
                    className="relative bg-gradient-to-b from-[#e8e2d5] via-[#d5ccbc] to-[#bfb5a2] rounded-[50px] sm:rounded-[70px] p-4 sm:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(255,255,255,0.7)] border-[6px] sm:border-[8px] border-[#a89d89] overflow-hidden"
                  >
                    {/* Continuous Warm Yellow Neon Glow around the inner perimeter (Top, Bottom, Left, Right) */}
                    <div className="absolute inset-3 sm:inset-4 rounded-[40px] sm:rounded-[55px] border-[2px] border-yellow-200/80 shadow-[inset_0_0_15px_rgba(253,224,71,0.6),0_0_15px_rgba(250,204,21,0.5)] pointer-events-none z-30" />

                    {/* Inner Wood Cavity Background */}
                    <div className="absolute inset-4 sm:inset-5 bg-gradient-to-r from-[#e3dbcc] via-[#ede6d8] to-[#e3dbcc] rounded-[38px] sm:rounded-[50px] shadow-[inset_0_5px_15px_rgba(0,0,0,0.12)] -z-10" />

                    {/* Book Grid resting inside the capsule cavity */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-16 items-end px-6 sm:px-16 lg:px-24 relative z-20 py-6 max-w-5xl mx-auto [perspective:1400px]">
                      {shelf.map((book, i) => (
                        <div key={book.id} className="flex justify-center group cursor-pointer">
                          <div className="relative w-[210px] h-[280px] transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(-22deg)_translateY(-10px)_rotateX(2deg)] group-hover:scale-105">

                            {/* Unified Hardcover Wrapper */}
                            <div className="absolute inset-0 w-full h-full rounded-r-2xl rounded-l-md shadow-[15px_20px_35px_rgba(0,0,0,0.35)] overflow-hidden border-t border-r border-b border-beige/40 bg-white">
                              {/* Realistic spine hinge crease shadow overlay */}
                              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/30 via-black/10 to-transparent pointer-events-none z-20" />

                              {/* The original BookCard fills the entire container seamlessly */}
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

                  </div>
                ))}

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