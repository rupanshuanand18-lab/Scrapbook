import { useState, useEffect, useMemo} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, FolderOpen, Plus } from 'lucide-react'
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
  const [buttonPulse, setButtonPulse] = useState(true)
  const [shelfColumns, setShelfColumns] = useState(3)

  const filtered = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'all' ||
      (filter === 'personal' && !book.isShared) ||
      (filter === 'shared' && book.isShared)
    return matchesSearch && matchesFilter
  })

  // Add a placeholder "create" item to the beginning of the filtered array
  const displayItems = [{ id: 'add-new', isCreatePlaceholder: true }, ...filtered]

  
useEffect(() => {
  const updateShelfColumns = () => setShelfColumns(window.innerWidth >= 768 ? 3 : 2)
  updateShelfColumns()
  window.addEventListener('resize', updateShelfColumns)
  return () => window.removeEventListener('resize', updateShelfColumns)
}, [])

// Group items into shelves of max 3 (including the add card)
const chunkedBooks = useMemo(() => {
  const items = [...filtered]
  if (!search) items.push({ isCreatePlaceholder: true }) // same create-card behaviour as before

  const total = items.length
  if (total === 0) return []

  // rows needed for this column count…
  let rowCount = Math.ceil(total / shelfColumns)
  // …then reduce rows so no row ends up with one lonely book
  while (rowCount > 1 && Math.floor(total / rowCount) < 2) rowCount -= 1

  // distribute evenly → rows differ by at most one book
  const base = Math.floor(total / rowCount)
  const extra = total % rowCount
  const rows = []
  let cursor = 0
  for (let r = 0; r < rowCount; r += 1) {
    const size = base + (r < extra ? 1 : 0)
    rows.push(items.slice(cursor, cursor + size))
    cursor += size
  }
  return rows
}, [filtered, search, shelfColumns])


  const personalCount = books.filter((b) => !b.isShared).length
  const sharedCount = books.filter((b) => b.isShared).length

  return (
    <div className="min-h-screen paper-texture">
      <Navbar />

      <main className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-28 sm:pt-32 pb-32 sm:pb-24">
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

            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
              {/* Filter tabs */}
              <div className="flex flex-1 bg-cream-dark/40 p-1.5 rounded-xl border border-beige/70 gap-1 overflow-x-auto scrollbar-hide">
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

              {/* ✨ Professional New Volume button */}
              <motion.button
                onClick={() => setShowCreate(true)}
                className={`
                  w-full sm:w-auto
                  flex items-center justify-center gap-2
                  px-4 sm:px-5
                  py-2.5
                  rounded-full
                  bg-gradient-to-br from-amber-600 to-amber-700
                  text-white
                  font-semibold
                  text-[10px]
                  uppercase
                  tracking-wider
                  shadow-md
                  hover:shadow-lg
                  transition-all
                  duration-200
                  hover:from-amber-700
                  hover:to-amber-800
                  active:scale-95
                  border border-amber-600/20
                  flex-shrink-0
                `}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                animate={buttonPulse ? { scale: [1, 1.04, 1] } : {}}
                transition={{ duration: 1.5, repeat: buttonPulse ? 2 : 0 }}
                onAnimationComplete={() => setButtonPulse(false)}
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span>New Volume</span>
              </motion.button>
            </div>
          </div>

          {/* BOOKSHELF DISPLAY — paste this section back into your page file (no new features, only visual/responsive fixes) */}
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
    >
      <div className="relative overflow-hidden rounded-[28px] border-[4px] border-[#a89d89] bg-gradient-to-b from-[#e8e2d5] via-[#d5ccbc] to-[#bfb5a2] p-3 shadow-[0_18px_45px_rgba(94,78,52,0.16),inset_0_2px_6px_rgba(255,255,255,0.7)] sm:rounded-[48px] sm:border-[6px] sm:p-7 lg:rounded-[64px] lg:border-[8px] lg:p-10">

        {/* Warm glow ring */}
        <div className="pointer-events-none absolute inset-2 z-0 rounded-[22px] border border-yellow-200/70 shadow-[inset_0_0_18px_rgba(253,224,71,0.4),0_0_16px_rgba(250,204,21,0.28)] sm:inset-4 sm:rounded-[40px] lg:inset-5 lg:rounded-[52px]" />

        {/* Wood cavity background */}
        <div className="pointer-events-none absolute inset-3 rounded-[20px] bg-gradient-to-r from-[#e3dbcc] via-[#ede6d8] to-[#e3dbcc] shadow-[inset_0_5px_18px_rgba(0,0,0,0.14)] sm:inset-5 sm:rounded-[36px] lg:inset-6 lg:rounded-[48px]" />

        {/* Rows */}
        <div className="relative z-10 space-y-3 py-2 sm:space-y-6 sm:py-4">
          {chunkedBooks.map((shelf, shelfIndex) => (
            <div key={shelfIndex} className="relative pb-6 pt-3 sm:pb-9 sm:pt-5">

              {/* ONE flex row = ONE shelf level.
                  Books are centered, never wrap, so whatever count this
                  row has (2, 3…), the board below always belongs to it. */}
              <div className="flex items-end justify-center gap-x-3 px-2 pb-3 [perspective:1400px] sm:gap-x-6 sm:px-8">
                {shelf.map((item, i) => {
                  /* ---------- "Add New Volume" card ---------- */
                  if (item.isCreatePlaceholder) {
                    return (
                      <div key="add-new" className="flex-1 flex justify-center">
                        <div className="w-[clamp(108px,22vw,200px)]">
                          <motion.div
                            initial={{ opacity: 0, y: 28, rotate: -1.2 }}
                            animate={{ opacity: 1, y: 0, rotate: -1.2 }}
                            transition={{ delay: shelfIndex * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            onClick={() => setShowCreate(true)}
                            className="[transform-style:preserve-3d]"
                          >
                            <div className="group relative aspect-[3/4.2] w-full cursor-pointer [transform-style:preserve-3d] transition-transform duration-500 ease-out hover:[transform:rotateY(-18deg)_rotateX(2deg)_translateY(-12px)_scale(1.02)]">
                              <div className="absolute -bottom-3 left-1/2 z-0 h-3 w-4/5 -translate-x-1/2 rounded-[50%] bg-black/25 blur-[5px] transition-all duration-500 group-hover:w-3/5 group-hover:bg-black/20" />
                              <div className="absolute -right-1.5 bottom-1 top-1 z-0 w-2 rounded-r-sm bg-[repeating-linear-gradient(to_bottom,#f8f4e9_0px,#f8f4e9_2px,#ddd5c3_3px)] shadow-[inset_-2px_0_3px_rgba(0,0,0,0.12)]" />

                              <div className="absolute inset-0 z-10 overflow-hidden rounded-r-xl rounded-l-[3px] border-2 border-dashed border-amber-400/60 bg-gradient-to-br from-amber-50/95 via-amber-100/85 to-amber-50/95 shadow-[8px_12px_24px_rgba(0,0,0,0.26)] transition-shadow duration-500 group-hover:shadow-[16px_22px_40px_rgba(0,0,0,0.34)]">
                                <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-20 w-5 bg-gradient-to-r from-amber-200/40 via-amber-100/20 to-transparent" />

                                <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center sm:p-6">
                                  <motion.div
                                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-200/50 sm:mb-4 sm:h-16 sm:w-16"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                  >
                                    <Plus className="h-5 w-5 text-white stroke-[2.5] sm:h-8 sm:w-8" />
                                  </motion.div>
                                  <h4 className="font-display text-xs font-semibold text-amber-900 sm:text-sm">New Volume</h4>
                                  <p className="mt-1 text-[10px] leading-relaxed text-amber-700/70 sm:text-xs">Start a fresh scrapbook</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    )
                  }

                  /* ---------- regular book ---------- */
                  const book = item
                  return (
                    <div key={book.id} className="flex-1 flex justify-center">
                      {/* fluid width — shrinks on phones (3 books still fit),
                          grows to 200px on desktop */}
                      <div className="w-[clamp(108px,22vw,200px)]">
                        <BookCard book={book} index={i} shelf />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Shelf board — exactly ONE per row, drawn right under that
                  row's books. No extra border lines, so you never see a line
                  without books above it. */}
              <div className="absolute bottom-0 left-1 right-1 h-3 rounded-full bg-gradient-to-b from-[#b0a390] via-[#8c806e] to-[#6d6252] shadow-[0_6px_12px_rgba(0,0,0,0.28),inset_0_1px_1px_rgba(255,255,255,0.4)] sm:left-4 sm:right-4 sm:h-4" />
              <div className="absolute -bottom-1 left-6 right-6 h-1.5 rounded-full bg-black/15 blur-[2px] sm:left-10 sm:right-10" />
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