import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  BookOpen,
  Sparkles,
  ArrowRight,
  SmilePlus,
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

  // Selected single emoji reaction per volume id: { [volumeId]: '❤️' }
  const [userReactions, setUserReactions] = useState({})

  // Track which reaction bar slider is open: volumeId | null
  const [openReactionSlider, setOpenReactionSlider] = useState(null)

  // -----------------------------
  // EMOJI REACTION OPTIONS (6 Emojis)
  // -----------------------------
  const reactionEmojis = ['❤️', '✨', '🥹', '🌸', '☕', '👏']

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
  // SAMPLE COMMUNITY DATA
  // -----------------------------
  const sharedVolumes = [
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
    },
  ]

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
  }, [search, activeCategory])

  // -----------------------------
  // REACTION HANDLERS
  // -----------------------------
  const toggleReactionSlider = (volumeId) => {
    setOpenReactionSlider((prev) => (prev === volumeId ? null : volumeId))
  }

  const handleSelectEmoji = (volumeId, emoji) => {
    setUserReactions((prev) => {
      // Deselect if tapping the active emoji again
      if (prev[volumeId] === emoji) {
        const next = { ...prev }
        delete next[volumeId]
        return next
      }
      // Replace previous emoji with the new one
      return { ...prev, [volumeId]: emoji }
    })

    // Automatically close the slider after picking an emoji
    setOpenReactionSlider(null)
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
                const activeEmoji = userReactions[volume.id]
                const isSliderOpen = openReactionSlider === volume.id

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

                      {/* STATS */}
                      <div className="flex items-center gap-10 mt-8 pt-6 border-t border-beige/70">
                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-ink-muted">
                            Memories
                          </p>
                          <p className="mt-1 text-xl font-semibold text-ink">
                            {volume.memories}
                          </p>
                        </div>
                      </div>

                      {/* SLIDING EMOJI REACTION SECTION */}
                      <div className="relative mt-6 pt-5 border-t border-beige/50">
                        <div className="flex items-center gap-3 overflow-hidden py-1">
                          {/* REACT BUTTON */}
                          <button
                            type="button"
                            onClick={() => toggleReactionSlider(volume.id)}
                            className={`
                              h-12
                              px-5
                              rounded-2xl
                              border
                              flex
                              items-center
                              gap-2.5
                              font-medium
                              text-sm
                              transition-all
                              duration-300
                              flex-shrink-0
                              cursor-pointer
                              ${
                                activeEmoji
                                  ? 'bg-pink-accent/10 border-pink-accent text-pink-accent'
                                  : 'bg-paper border-beige text-ink hover:border-pink-accent/60'
                              }
                            `}
                          >
                            {activeEmoji ? (
                              <span className="text-xl animate-bounce">{activeEmoji}</span>
                            ) : (
                              <SmilePlus className="w-5 h-5 text-pink-accent" />
                            )}
                            <span>{activeEmoji ? 'Reacted' : 'React'}</span>
                          </button>

                          {/* REVEAL SLIDER */}
                          <AnimatePresence>
                            {isSliderOpen && (
                              <motion.div
                                initial={{ opacity: 0, x: -30, scaleX: 0.8 }}
                                animate={{ opacity: 1, x: 0, scaleX: 1 }}
                                exit={{ opacity: 0, x: -20, scaleX: 0.9 }}
                                transition={{ duration: 0.28, ease: 'easeOut' }}
                                className="
                                  flex
                                  items-center
                                  gap-1.5
                                  p-1.5
                                  rounded-2xl
                                  border
                                  border-beige
                                  bg-paper
                                  shadow-sm
                                  origin-left
                                "
                              >
                                {reactionEmojis.map((emoji, emojiIndex) => {
                                  const isSelected = activeEmoji === emoji

                                  return (
                                    <motion.button
                                      key={emoji}
                                      type="button"
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{
                                        delay: emojiIndex * 0.03,
                                        duration: 0.2,
                                      }}
                                      onClick={() =>
                                        handleSelectEmoji(volume.id, emoji)
                                      }
                                      className={`
                                        h-9
                                        w-9
                                        sm:h-10
                                        sm:w-10
                                        rounded-xl
                                        text-lg
                                        flex
                                        items-center
                                        justify-center
                                        transition-all
                                        duration-150
                                        cursor-pointer
                                        active:scale-90
                                        ${
                                          isSelected
                                            ? 'bg-pink-accent/20 scale-110'
                                            : 'hover:bg-cream hover:scale-110'
                                        }
                                      `}
                                    >
                                      {emoji}
                                    </motion.button>
                                  )
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* OPEN VOLUME BUTTON */}
                      <button
                        type="button"
                        onClick={() => openVolume(volume)}
                        className="
                          w-full
                          h-14
                          mt-6
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
    </div>
  )
}