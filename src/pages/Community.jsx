import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  BookOpen,
  Sparkles,
  X,
  Heart,
  PenLine,
  ArrowRight,
  Send,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Community() {
  const navigate = useNavigate()

  // -----------------------------
  // COMMUNITY STATE
  // -----------------------------
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  // Notes notebook state
  const [notesOpen, setNotesOpen] = useState(false)
  const [selectedVolume, setSelectedVolume] = useState(null)

  // Appreciate state (Simple bookmark/like toggle, no public count)
  const [appreciated, setAppreciated] = useState([])

  // New Note (Comment) form state
  const [newNoteAuthor, setNewNoteAuthor] = useState('')
  const [newNoteText, setNewNoteText] = useState('')

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && notesOpen) {
        closeNotes()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [notesOpen])

  // -----------------------------
  // CATEGORIES
  // -----------------------------
  const categories = [
    'All',
    'Travel',
    'Nature',
    'Family',
    'College',
    'Food',
    'Art',
  ]

  // -----------------------------
  // SAMPLE COMMUNITY DATA (Notes as comments with usernames)
  // -----------------------------
  const [sharedVolumes, setSharedVolumes] = useState([
    {
      id: 1,
      title: 'Summer in Goa',
      author: 'Ayush',
      category: 'Travel',
      image:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      description:
        'A week filled with sunsets, beaches and unforgettable memories.',
      memories: 18,
      notes: [
        {
          id: 101,
          author: 'Priya',
          text: 'The sunset by the beach looked magical! Reminded me of my trip.',
        },
        {
          id: 102,
          author: 'Rahul',
          text: 'Which café did you visit near the sea?',
        },
        {
          id: 103,
          author: 'Sneha',
          text: 'The last photo memory was my absolute favourite.',
        },
      ],
    },
    {
      id: 2,
      title: 'My First College Days',
      author: 'Priya',
      category: 'College',
      image: null,
      description:
        'New faces, new classrooms and memories that changed everything.',
      memories: 12,
      notes: [
        {
          id: 201,
          author: 'Aarav',
          text: 'First days are always nerve-wracking but memorable!',
        },
        {
          id: 202,
          author: 'Ayush',
          text: 'Glad you met such wonderful people.',
        },
      ],
    },
    {
      id: 3,
      title: 'Morning Walk',
      author: 'Rahul',
      category: 'Nature',
      image:
        'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80',
      description: 'Some mornings deserve to be remembered forever.',
      memories: 9,
      notes: [
        {
          id: 301,
          author: 'Neha',
          text: 'Walking by the river in early morning is peaceful.',
        },
      ],
    },
    {
      id: 4,
      title: 'Family Reunion',
      author: 'Sneha',
      category: 'Family',
      image:
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
      description:
        'A weekend filled with laughter, food and people I missed.',
      memories: 24,
      notes: [
        {
          id: 401,
          author: 'Rohan',
          text: 'Family time is always the best time.',
        },
        {
          id: 402,
          author: 'Priya',
          text: 'Old stories shared over dinner are priceless.',
        },
      ],
    },
    {
      id: 5,
      title: 'A Quiet Evening',
      author: 'Aarav',
      category: 'Art',
      image:
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
      description:
        'A simple evening spent creating something without rushing.',
      memories: 7,
      notes: [
        {
          id: 501,
          author: 'Kavya',
          text: 'Creating art in silence is so healing.',
        },
      ],
    },
  ])

  // -----------------------------
  // FILTER COMMUNITY VOLUMES
  // -----------------------------
  const filteredVolumes = useMemo(() => {
    return sharedVolumes.filter((volume) => {
      const matchesCategory =
        activeCategory === 'All' || volume.category === activeCategory

      const searchText = search.toLowerCase()

      const matchesSearch =
        volume.title.toLowerCase().includes(searchText) ||
        volume.author.toLowerCase().includes(searchText) ||
        volume.category.toLowerCase().includes(searchText)

      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory, sharedVolumes])

  // -----------------------------
  // APPRECIATE HANDLER
  // -----------------------------
  const handleAppreciate = (volumeId) => {
    setAppreciated((previous) => {
      if (previous.includes(volumeId)) {
        return previous.filter((id) => id !== volumeId)
      }
      return [...previous, volumeId]
    })
  }

  // -----------------------------
  // NOTES (COMMENTS) HANDLERS
  // -----------------------------
  const openNotes = (volume) => {
    setSelectedVolume(volume)
    setNotesOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeNotes = () => {
    setNotesOpen(false)
    setSelectedVolume(null)
    setNewNoteText('')
    setNewNoteAuthor('')
    document.body.style.overflow = ''
  }

  const handleAddNote = (e) => {
    e.preventDefault()
    if (!newNoteText.trim() || !selectedVolume) return

    const newNote = {
      id: Date.now(),
      author: newNoteAuthor.trim() || 'Guest',
      text: newNoteText.trim(),
    }

    // Update shared volumes list
    setSharedVolumes((prev) =>
      prev.map((vol) =>
        vol.id === selectedVolume.id
          ? { ...vol, notes: [...vol.notes, newNote] }
          : vol
      )
    )

    // Update active selected volume in modal
    setSelectedVolume((prev) => ({
      ...prev,
      notes: [...prev.notes, newNote],
    }))

    setNewNoteText('')
  }

  // -----------------------------
  // OPEN VOLUME
  // -----------------------------
  const openVolume = (volume) => {
    navigate(`/volume/${volume.id}`)
  }

  return (
    <div className="min-h-screen bg-paper text-ink transition-colors duration-300">
      <Navbar />

      {/* MAIN COMMUNITY CONTENT */}
      <main className="pt-28 sm:pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

          {/* COMMUNITY HEADER */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-pink-accent" />
                <span className="font-handwritten text-lg text-pink-accent">
                  A place for memories
                </span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
                Community
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-ink-muted leading-relaxed max-w-2xl">
                Discover beautiful memories shared by people around the world.
                No trends. No algorithm. Just genuine stories.
              </p>
            </div>
          </motion.section>

          {/* SEARCH */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="relative mb-7"
          >
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search books or creators..."
              className="
                w-full
                h-16
                pl-14
                pr-5
                rounded-2xl
                border
                border-beige
                bg-paper
                text-ink
                placeholder:text-ink-muted/60
                outline-none
                focus:border-pink-accent
                transition-colors
                font-sans
              "
            />
          </motion.div>

          {/* CATEGORY FILTERS */}
          <div className="flex gap-3 flex-wrap mb-14">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`
                  px-6
                  py-3
                  rounded-full
                  border
                  text-sm
                  font-medium
                  transition-all
                  duration-300
                  cursor-pointer
                  ${
                    activeCategory === category
                      ? 'bg-pink-accent text-white border-pink-accent shadow-md'
                      : 'bg-paper text-ink border-beige hover:border-pink-accent hover:text-pink-accent'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>

          {/* SHARED VOLUMES HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-pink-accent" />
              <h2 className="font-display text-3xl sm:text-4xl">
                Shared Volumes
              </h2>
            </div>

            <span className="text-sm text-ink-muted">
              {filteredVolumes.length}{' '}
              {filteredVolumes.length === 1 ? 'story' : 'stories'}
            </span>
          </motion.div>

          {/* SINGLE COLUMN COMMUNITY FEED */}
          <div className="max-w-4xl mx-auto space-y-10">
            {filteredVolumes.length > 0 ? (
              filteredVolumes.map((volume, index) => {
                const isAppreciated = appreciated.includes(volume.id)

                return (
                  <motion.article
                    key={volume.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.08,
                      duration: 0.55,
                    }}
                    className="
                      overflow-hidden
                      rounded-3xl
                      border
                      border-beige
                      bg-paper
                      shadow-[0_12px_40px_rgba(44,40,37,0.06)]
                    "
                  >
                    {/* VOLUME COVER */}
                    <div className="
                      relative
                      w-full
                      aspect-[16/7]
                      overflow-hidden
                      bg-cream-dark
                    ">
                      {volume.image ? (
                        <img
                          src={volume.image}
                          alt={volume.title}
                          className="
                            w-full
                            h-full
                            object-cover
                            transition-transform
                            duration-700
                            hover:scale-[1.03]
                          "
                        />
                      ) : (
                        <div className="
                          w-full
                          h-full
                          flex
                          items-center
                          justify-center
                          bg-gradient-to-br
                          from-cream
                          via-paper
                          to-beige/40
                        ">
                          <div className="text-center">
                            <BookOpen className="
                              w-10
                              h-10
                              mx-auto
                              mb-3
                              text-pink-accent/70
                            " />
                            <p className="
                              font-display
                              text-2xl
                              text-ink-muted
                            ">
                              {volume.title}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* CATEGORY BADGE */}
                      <div className="
                        absolute
                        top-5
                        left-5
                        px-4
                        py-2
                        rounded-full
                        bg-paper/95
                        backdrop-blur-sm
                        text-sm
                        font-medium
                        text-ink
                        shadow-sm
                      ">
                        {volume.category}
                      </div>
                    </div>

                    {/* VOLUME CONTENT */}
                    <div className="p-7 sm:p-9">
                      {/* TITLE */}
                      <div className="flex items-start justify-between gap-6">
                        <div>
                          <h3 className="
                            font-display
                            text-3xl
                            sm:text-4xl
                            leading-tight
                            text-ink
                          ">
                            {volume.title}
                          </h3>

                          <p className="mt-2 text-base text-ink-muted">
                            Shared by{' '}
                            <span className="font-semibold text-ink">
                              {volume.author}
                            </span>
                          </p>
                        </div>

                        <BookOpen className="w-7 h-7 flex-shrink-0 text-pink-accent" />
                      </div>

                      {/* DESCRIPTION */}
                      <p className="mt-7 text-lg text-ink-muted leading-relaxed max-w-2xl">
                        {volume.description}
                      </p>

                      {/* STATS (NO PUBLIC APPRECIATION COUNT) */}
                      <div className="flex items-center gap-10 mt-8 pt-6 border-t border-beige/70">
                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-ink-muted">
                            Memories
                          </p>
                          <p className="mt-1 text-xl font-semibold text-ink">
                            {volume.memories}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-ink-muted">
                            Notes
                          </p>
                          <p className="mt-1 text-xl font-semibold text-ink">
                            {volume.notes.length}
                          </p>
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                        {/* APPRECIATE BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleAppreciate(volume.id)}
                          className={`
                            h-14
                            rounded-2xl
                            border
                            flex
                            items-center
                            justify-center
                            gap-2
                            font-medium
                            transition-all
                            duration-300
                            cursor-pointer
                            ${
                              isAppreciated
                                ? 'bg-pink-accent text-white border-pink-accent shadow-md'
                                : 'bg-pink-accent/90 text-white border-pink-accent hover:bg-pink-accent hover:shadow-md'
                            }
                          `}
                        >
                          <Heart
                            className="w-5 h-5 transition-transform active:scale-125"
                            fill={isAppreciated ? 'currentColor' : 'none'}
                          />
                          {isAppreciated ? 'Appreciated' : 'Appreciate'}
                        </button>

                        {/* NOTES BUTTON */}
                        <button
                          type="button"
                          onClick={() => openNotes(volume)}
                          className="
                            h-14
                            rounded-2xl
                            border
                            border-beige
                            bg-paper
                            text-ink
                            flex
                            items-center
                            justify-center
                            gap-2
                            font-medium
                            hover:border-pink-accent
                            hover:text-pink-accent
                            transition-all
                            duration-300
                            cursor-pointer
                          "
                        >
                          <PenLine className="w-5 h-5" />
                          Notes ({volume.notes.length})
                        </button>
                      </div>

                      {/* OPEN VOLUME BUTTON */}
                      <button
                        type="button"
                        onClick={() => openVolume(volume)}
                        className="
                          w-full
                          h-14
                          mt-3
                          rounded-2xl
                          border
                          border-beige
                          bg-transparent
                          text-ink
                          flex
                          items-center
                          justify-center
                          gap-2
                          font-medium
                          hover:bg-cream
                          hover:border-ink-muted
                          transition-all
                          duration-300
                          cursor-pointer
                        "
                      >
                        Open Volume
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.article>
                )
              })
            ) : (
              /* EMPTY SEARCH RESULT */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 text-center border border-dashed border-beige rounded-3xl"
              >
                <BookOpen className="w-10 h-10 mx-auto mb-5 text-ink-muted/50" />
                <h3 className="font-display text-2xl text-ink">
                  No stories found
                </h3>
                <p className="mt-2 text-ink-muted">
                  Try searching for another memory or creator.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setActiveCategory('All')
                  }}
                  className="mt-6 text-sm font-medium text-pink-accent hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* NOTEBOOK OVERLAY (COMMENTS SECTION) */}
      <AnimatePresence>
        {notesOpen && selectedVolume && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
              fixed
              inset-0
              z-[100]
              bg-ink/40
              backdrop-blur-sm
              flex
              items-center
              justify-center
              p-4
              sm:p-6
            "
            onClick={closeNotes}
          >
            {/* NOTEBOOK CARD */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
              className="
                relative
                w-full
                max-w-2xl
                max-h-[88vh]
                overflow-hidden
                rounded-[28px]
                bg-[#fffdf8]
                shadow-2xl
                border
                border-beige/70
                flex
                flex-col
              "
            >
              {/* NOTEBOOK HEADER */}
              <div className="
                flex
                items-center
                justify-between
                px-6
                sm:px-8
                py-5
                border-b
                border-beige/60
                bg-[#fffdf8]
                flex-shrink-0
              ">
                <div className="flex items-center gap-3">
                  <div className="
                    w-10
                    h-10
                    rounded-xl
                    bg-pink-accent/10
                    flex
                    items-center
                    justify-center
                  ">
                    <PenLine className="w-5 h-5 text-pink-accent" />
                  </div>

                  <div>
                    <h2 className="font-display text-xl sm:text-2xl text-ink">
                      Notes
                    </h2>
                    <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
                      {selectedVolume.title}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeNotes}
                  aria-label="Close notes"
                  className="
                    w-10
                    h-10
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-ink-muted
                    hover:text-ink
                    hover:bg-cream
                    transition-colors
                    cursor-pointer
                  "
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* NOTEBOOK CONTENT */}
              <div className="relative overflow-y-auto px-6 sm:px-10 py-8">
                <div className="text-center mb-8">
                  <div className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-full
                    bg-pink-accent/10
                    text-pink-accent
                    text-xs
                    uppercase
                    tracking-[0.15em]
                    font-semibold
                  ">
                    <BookOpen className="w-3.5 h-3.5" />
                    Shared Notes
                  </div>

                  <h3 className="font-display text-3xl sm:text-4xl text-ink mt-4">
                    {selectedVolume.title}
                  </h3>

                  <p className="text-sm text-ink-muted mt-1">
                    Notes for {selectedVolume.author}'s volume
                  </p>
                </div>

                {/* NOTE ENTRIES (COMMENTS LIST) */}
                <div className="relative">
                  {/* Notebook vertical line */}
                  <div className="absolute left-[19px] top-2 bottom-2 w-px bg-beige" />

                  <div className="space-y-6">
                    {selectedVolume.notes.map((noteItem, index) => (
                      <motion.div
                        key={noteItem.id || index}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="relative pl-12"
                      >
                        {/* Notebook pin dot */}
                        <div className="
                          absolute
                          left-0
                          top-1
                          w-10
                          h-10
                          rounded-full
                          bg-[#fffdf8]
                          border
                          border-beige
                          flex
                          items-center
                          justify-center
                          z-10
                        ">
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-accent" />
                        </div>

                        {/* Note Comment Card */}
                        <div className="
                          relative
                          rounded-2xl
                          border
                          border-beige/70
                          bg-[#fffdf8]
                          px-5
                          py-4
                          shadow-xs
                        ">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-sm text-ink">
                              {noteItem.author}
                            </span>
                          </div>
                          <p className="
                            font-handwritten
                            text-xl
                            sm:text-2xl
                            leading-relaxed
                            text-ink-muted
                          ">
                            {noteItem.text}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* ADD A NEW NOTE FORM */}
                <form
                  onSubmit={handleAddNote}
                  className="mt-10 pt-6 border-t border-beige/60"
                >
                  <label className="block text-xs uppercase tracking-[0.15em] text-ink-muted mb-3 font-semibold">
                    Leave a Note
                  </label>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={newNoteAuthor}
                      onChange={(e) => setNewNoteAuthor(e.target.value)}
                      placeholder="Your name..."
                      className="
                        w-full
                        px-4
                        py-2.5
                        rounded-xl
                        border
                        border-beige
                        bg-paper
                        text-ink
                        placeholder:text-ink-muted/50
                        text-sm
                        outline-none
                        focus:border-pink-accent
                        transition-colors
                      "
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Write a note..."
                        className="
                          flex-1
                          px-4
                          py-3
                          rounded-xl
                          border
                          border-beige
                          bg-paper
                          text-ink
                          placeholder:text-ink-muted/50
                          text-sm
                          outline-none
                          focus:border-pink-accent
                          transition-colors
                        "
                      />
                      <button
                        type="submit"
                        disabled={!newNoteText.trim()}
                        className="
                          px-5
                          py-3
                          rounded-xl
                          bg-pink-accent
                          text-white
                          font-medium
                          text-sm
                          hover:opacity-90
                          transition-opacity
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                          flex
                          items-center
                          gap-2
                          cursor-pointer
                        "
                      >
                        <span>Post</span>
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </form>

                {/* NOTEBOOK FOOTER */}
                <div className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  mt-8
                  pt-6
                  border-t
                  border-beige/60
                  text-center
                ">
                  <PenLine className="w-5 h-5 text-pink-accent mb-2" />
                  <p className="font-handwritten text-xl text-ink-muted">
                    Every memory has a story behind it.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}