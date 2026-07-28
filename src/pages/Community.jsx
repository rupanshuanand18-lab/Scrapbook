import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import {
  Search,
  BookOpen,
  Sparkles,
  SmilePlus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Share2,
  X,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Community() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { openUserProfile, allUsers } = useApp()

  const handleUserClick = (username) => {
    let mappedUsername = username
    if (username === 'priyawrites') mappedUsername = 'priyasharma'
    if (username === 'rahulnotes') mappedUsername = 'rahulkapoor'
    
    const matchedUser = allUsers.find(
      (u) => u.username.toLowerCase() === mappedUsername.toLowerCase()
    )
    if (matchedUser) {
      openUserProfile(matchedUser.id)
    }
  }

  // -----------------------------
  // COMMUNITY STATE
  // -----------------------------
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const activeTab = useMemo(() => {
    const queryTab = searchParams.get('tab')
    return queryTab === 'Discover' ? 'Discover' : 'Following'
  }, [searchParams])
  const [carouselIndexes, setCarouselIndexes] = useState({})
  const [expandedDescriptions, setExpandedDescriptions] = useState({})
  const [gallery, setGallery] = useState(null)
  const [relativeTimeNow] = useState(() => Date.now())

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
  const categories = useMemo(() => [
    'All',
    'Travel',
    'Nature',
    'Family',
    'College',
    'Food',
    'Art',
  ], [])

  // -----------------------------
  // SAMPLE COMMUNITY DATA
  // -----------------------------
  const sharedVolumes = useMemo(() => [
    {
      id: 1,
      title: 'Summer in Goa',
      author: 'Ayush',
      username: 'ayushjournals',
      timestamp: '2026-07-25T14:20:00+05:30',
      category: 'Travel',
      followed: true,
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1200&q=80',
      ],
      description:
        'A week filled with sunsets, beaches and unforgettable memories, from quiet breakfast tables to long walks near the water after dark.',
      memories: 18,
    },
    {
      id: 2,
      title: 'My First College Days',
      author: 'Priya',
      username: 'priyawrites',
      timestamp: '2026-07-24T09:10:00+05:30',
      category: 'College',
      followed: true,
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
      images: [],
      description:
        'New faces, new classrooms and memories that changed everything.',
      memories: 12,
    },
    {
      id: 3,
      title: 'Morning Walk',
      author: 'Rahul',
      username: 'rahulnotes',
      timestamp: '2026-07-23T07:35:00+05:30',
      category: 'Nature',
      followed: false,
      avatar:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
      images: [
        'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Some mornings deserve to be remembered forever.',
      memories: 9,
    },
    {
      id: 4,
      title: 'Family Reunion',
      author: 'Sneha',
      username: 'snehashelf',
      timestamp: '2026-07-22T20:45:00+05:30',
      category: 'Family',
      followed: false,
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      images: [
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1519671282429-b44660ead0a7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80',
      ],
      description:
        'A weekend filled with laughter, food and people I missed. Every corner of the house had a tiny story waiting to be tucked into the album.',
      memories: 24,
    },
    {
      id: 5,
      title: 'A Quiet Evening',
      author: 'Aarav',
      username: 'aaravsketches',
      timestamp: '2026-07-21T18:15:00+05:30',
      category: 'Art',
      followed: true,
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      images: [
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1456086272160-b28b0645b729?auto=format&fit=crop&w=1200&q=80',
      ],
      description:
        'A simple evening spent creating something without rushing.',
      memories: 7,
    },
  ], [])

  const trendingCategories = useMemo(() => {
    return categories
      .filter((category) => category !== 'All')
      .map((category) => ({
        name: category,
        count: sharedVolumes.filter((volume) => volume.category === category)
          .length,
      }))
      .filter((category) => category.count > 0)
  }, [categories, sharedVolumes])

  const suggestedCreators = useMemo(() => {
    return sharedVolumes.filter((volume) => !volume.followed).slice(0, 3)
  }, [sharedVolumes])

  // -----------------------------
  // FILTER COMMUNITY VOLUMES
  // -----------------------------
  const filteredVolumes = useMemo(() => {
    return sharedVolumes.filter((volume) => {
      const matchesTab =
        activeTab === 'Following' ? volume.followed : true

      const matchesCategory =
        activeCategory === 'All' || volume.category === activeCategory

      const searchText = search.toLowerCase()

      const matchesSearch =
        volume.title.toLowerCase().includes(searchText) ||
        volume.author.toLowerCase().includes(searchText) ||
        volume.username.toLowerCase().includes(searchText) ||
        volume.category.toLowerCase().includes(searchText)

      return matchesTab && matchesCategory && matchesSearch
    })
  }, [search, activeCategory, activeTab, sharedVolumes])

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

  const getVolumeImages = (volume) => volume.images?.length ? volume.images : volume.image ? [volume.image] : []

  const getRelativeTime = (timestamp) => {
    const diffInSeconds = Math.max(
      1,
      Math.floor((relativeTimeNow - new Date(timestamp).getTime()) / 1000),
    )
    const units = [
      ['year', 31536000],
      ['month', 2592000],
      ['week', 604800],
      ['day', 86400],
      ['hour', 3600],
      ['minute', 60],
    ]
    const match = units.find(([, seconds]) => diffInSeconds >= seconds)

    if (!match) return 'just now'

    const [unit, seconds] = match
    const value = Math.floor(diffInSeconds / seconds)
    return `${value} ${unit}${value > 1 ? 's' : ''} ago`
  }

  const updateCarousel = (event, volumeId, imageCount, direction) => {
    event.stopPropagation()
    setCarouselIndexes((prev) => {
      const current = prev[volumeId] ?? 0
      const next = (current + direction + imageCount) % imageCount
      return { ...prev, [volumeId]: next }
    })
  }

  const openGallery = (event, volume, index = 0) => {
    event.stopPropagation()
    const images = getVolumeImages(volume)
    if (!images.length) return
    setGallery({ volume, images, index })
  }

  const moveGallery = (direction) => {
    setGallery((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        index: (prev.index + direction + prev.images.length) % prev.images.length,
      }
    })
  }

  const handleShare = async (event, volume) => {
    event.stopPropagation()

    const shareUrl = `${window.location.origin}/volume/${volume.id}`
    const shareData = {
      title: volume.title,
      text: volume.description,
      url: shareUrl,
    }

    if (navigator.share) {
      await navigator.share(shareData)
      return
    }

    await navigator.clipboard?.writeText(shareUrl)
  }

  return (
    <div className="min-h-screen bg-paper text-ink transition-colors duration-300">
      <Navbar />

      {/* MAIN COMMUNITY CONTENT */}
      <main className="pt-28 sm:pt-32 pb-32 sm:pb-24">
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
            className="relative mb-4"
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

          {/* FEED TABS */}
          <div className="mb-7 flex w-full max-w-sm rounded-2xl border border-beige bg-paper-warm p-1">
            {['Following', 'Discover'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(searchParams)
                  next.set('tab', tab)
                  setSearchParams(next, { replace: true })
                }}
                className={`relative h-11 flex-1 rounded-xl text-sm font-medium transition-colors duration-300 cursor-pointer
                  ${activeTab === tab ? 'text-white' : 'text-ink-muted hover:text-ink'}
                `}
              >
                {activeTab === tab && (
                  <motion.span
                    layoutId="community-tab"
                    className="absolute inset-0 rounded-xl bg-pink-accent shadow-sm"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>

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
                  ${activeCategory === category
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

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_19rem] gap-10 items-start">
            {/* COMMUNITY FEED */}
            <div className="space-y-10">
              <AnimatePresence mode="popLayout">
                {filteredVolumes.length > 0 ? (
                  filteredVolumes.map((volume, index) => {
                    const activeEmoji = userReactions[volume.id]
                    const isSliderOpen = openReactionSlider === volume.id
                    const isExpanded = expandedDescriptions[volume.id]
                    const images = getVolumeImages(volume)
                    const heroIndex = carouselIndexes[volume.id] ?? 0
                    const heroImage = images[heroIndex]
                    const remainingImages = images.filter((_, imageIndex) => imageIndex !== heroIndex)
                    const visibleThumbnails = remainingImages.slice(0, 3)
                    const hiddenImageCount = Math.max(0, remainingImages.length - visibleThumbnails.length)
                    const hasLongDescription = volume.description.length > 92

                    return (
                      <motion.article
                        key={`${activeTab}-${volume.id}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => openVolume(volume)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            openVolume(volume)
                          }
                        }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        whileHover={{ y: -4 }}
                        transition={{
                          delay: index * 0.06,
                          duration: 0.45,
                        }}
                        className="
                          overflow-hidden
                          rounded-3xl
                          border
                          border-beige
                          bg-paper
                          shadow-[0_12px_40px_rgba(44,40,37,0.06)]
                          transition-shadow
                          duration-300
                          cursor-pointer
                          focus:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-pink-accent
                          hover:shadow-[0_20px_54px_rgba(44,40,37,0.11)]
                        "
                      >
                        <div className="p-5 sm:p-6">
                          {/* SOCIAL PROFILE HEADER */}
                          <div className="flex items-center justify-between gap-4 mb-5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleUserClick(volume.username)
                              }}
                              className="flex items-center gap-3 min-w-0 hover:opacity-85 text-left cursor-pointer transition-opacity"
                            >
                              <img
                                src={volume.avatar}
                                alt={`${volume.author} profile`}
                                loading="lazy"
                                className="h-11 w-11 rounded-full object-cover border border-beige bg-cream-dark"
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-ink truncate">
                                  @{volume.username}
                                </p>
                                <p className="text-xs text-ink-muted">
                                  {getRelativeTime(volume.timestamp)}
                                </p>
                              </div>
                            </button>

                            <span className="px-3 py-1.5 rounded-full bg-paper-warm border border-beige text-xs font-medium text-ink">
                              {volume.category}
                            </span>
                          </div>

                          {/* VOLUME COVER */}
                          <div className="
                            relative
                            w-full
                            aspect-[4/3]
                            overflow-hidden
                            rounded-2xl
                            bg-cream-dark
                          ">
                            {heroImage ? (
                              <AnimatePresence mode="wait">
                                <motion.img
                                  key={heroImage}
                                  src={heroImage}
                                  alt={volume.title}
                                  loading={index < 2 ? 'eager' : 'lazy'}
                                  decoding="async"
                                  initial={{ opacity: 0, scale: 1.02 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.98 }}
                                  transition={{ duration: 0.32, ease: 'easeOut' }}
                                  onClick={(event) => openGallery(event, volume, heroIndex)}
                                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                                />
                              </AnimatePresence>
                            ) : (
                              <div className=" w-full h-full flex items-center justify-center bg-gradient-to-br from-cream via-paper to-beige/40">
                                <div className="text-center px-6">
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

                            {images.length > 1 && (
                              <>
                                <button
                                  type="button"
                                  aria-label="Previous image"
                                  onClick={(event) => updateCarousel(event, volume.id, images.length, -1)}
                                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-paper/90 border border-beige text-ink flex items-center justify-center shadow-sm backdrop-blur-sm transition-all hover:bg-paper cursor-pointer"
                                >
                                  <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Next image"
                                  onClick={(event) => updateCarousel(event, volume.id, images.length, 1)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-paper/90 border border-beige text-ink flex items-center justify-center shadow-sm backdrop-blur-sm transition-all hover:bg-paper cursor-pointer"
                                >
                                  <ChevronRight className="h-5 w-5" />
                                </button>
                                <div className="absolute bottom-4 right-4 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                  {heroIndex + 1}/{images.length}
                                </div>
                              </>
                            )}
                          </div>

                          {remainingImages.length > 0 && (
                            <div
                              className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-thin"
                              onClick={(event) => event.stopPropagation()}
                            >
                              {visibleThumbnails.map((image, thumbnailIndex) => {
                                const realIndex = images.indexOf(image)
                                const showHiddenCount =
                                  thumbnailIndex === visibleThumbnails.length - 1 &&
                                  hiddenImageCount > 0

                                return (
                                  <button
                                    key={image}
                                    type="button"
                                    onClick={(event) => openGallery(event, volume, realIndex)}
                                    className="relative h-24 min-w-32 overflow-hidden rounded-xl border border-beige bg-cream-dark cursor-pointer"
                                    aria-label={`Open image ${realIndex + 1}`}
                                  >
                                    <img
                                      src={image}
                                      alt=""
                                      loading="lazy"
                                      decoding="async"
                                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                    {showHiddenCount && (
                                      <span className="absolute inset-0 flex items-center justify-center bg-ink/55 text-lg font-semibold text-white">
                                        +{hiddenImageCount}
                                      </span>
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          )}

                          {/* VOLUME CONTENT */}
                          <div className="pt-5">
                            <h3 className="
                              font-display
                              text-3xl
                              sm:text-4xl
                              leading-tight
                              text-ink
                            ">
                              {volume.title}
                            </h3>

                            {/* DESCRIPTION */}
                            <div className="mt-3 flex items-start gap-2">
                              <motion.p
                                layout
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl"
                                style={
                                  isExpanded
                                    ? undefined
                                    : {
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }
                                }
                              >
                                {volume.description}
                              </motion.p>

                              {hasLongDescription && (
                                <button
                                  type="button"
                                  aria-label={isExpanded ? 'Collapse description' : 'Expand description'}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    setExpandedDescriptions((prev) => ({
                                      ...prev,
                                      [volume.id]: !prev[volume.id],
                                    }))
                                  }}
                                  className="mt-1 h-8 w-8 flex-shrink-0 rounded-full border border-beige text-ink-muted flex items-center justify-center hover:text-pink-accent hover:border-pink-accent transition-all cursor-pointer"
                                >
                                  <motion.span
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.25 }}
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </motion.span>
                                </button>
                              )}
                            </div>

                            {/* ACTIONS */}
                            <div className="relative mt-6 pt-5 border-t border-beige/50">
                              <div className="flex flex-wrap items-center justify-between gap-3 overflow-hidden py-1">
                                {/* SLIDING EMOJI REACTION SECTION */}
                                <div className="flex items-center gap-3 overflow-hidden">
                                  {/* REACT BUTTON */}
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      toggleReactionSlider(volume.id)
                                    }}
                                    className={` h-12 px-5 rounded-2xl border flex items-center gap-2.5 font-medium text-sm transition-all duration-300 flex-shrink-0 cursor-pointer
                                      ${activeEmoji
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
                                        className=" flex items-center gap-1.5 p-1.5 rounded-2xl border border-beige bg-paper shadow-sm origin-left"
                                        onClick={(event) => event.stopPropagation()}
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
                                              onClick={(event) => {
                                                event.stopPropagation()
                                                handleSelectEmoji(volume.id, emoji)
                                              }}
                                              className={` h-9 w-9 sm:h-10 sm:w-10 rounded-xl text-lg flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-90
                                                ${isSelected
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

                                <button
                                  type="button"
                                  onClick={(event) => handleShare(event, volume)}
                                  className="h-12 px-5 rounded-2xl border border-beige bg-paper text-ink flex items-center gap-2.5 font-medium text-sm hover:border-pink-accent/60 hover:text-pink-accent transition-all duration-300 cursor-pointer"
                                >
                                  <Share2 className="h-5 w-5" />
                                  <span>Share</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    )
                  })
                ) : (
                  /* EMPTY SEARCH RESULT */
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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
                        const next = new URLSearchParams(searchParams)
                        next.set('tab', 'Discover')
                        setSearchParams(next, { replace: true })
                      }}
                      className="mt-6 text-sm font-medium text-pink-accent hover:underline cursor-pointer"
                    >
                      Clear filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="hidden lg:block sticky top-28 space-y-6">
              <section className="rounded-3xl border border-beige bg-paper p-6 shadow-[0_12px_40px_rgba(44,40,37,0.05)]">
                <h3 className="font-display text-2xl text-ink">
                  Trending Categories
                </h3>
                <div className="mt-5 space-y-3">
                  {trendingCategories.map((category) => (
                    <button
                      key={category.name}
                      type="button"
                      onClick={() => setActiveCategory(category.name)}
                      className="w-full flex items-center justify-between rounded-2xl border border-beige bg-paper-warm px-4 py-3 text-left transition-all hover:border-pink-accent hover:text-pink-accent cursor-pointer"
                    >
                      <span className="font-medium">{category.name}</span>
                      <span className="text-xs text-ink-muted">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-beige bg-paper p-6 shadow-[0_12px_40px_rgba(44,40,37,0.05)]">
                <h3 className="font-display text-2xl text-ink">
                  Suggested Creators
                </h3>
                <div className="mt-5 space-y-4">
                  {suggestedCreators.map((creator) => (
                    <button
                      key={creator.id}
                      type="button"
                      onClick={() => handleUserClick(creator.username)}
                      className="w-full flex items-center gap-3 text-left rounded-2xl transition-colors hover:bg-paper-warm cursor-pointer p-2"
                    >
                      <img
                        src={creator.avatar}
                        alt={`${creator.author} profile`}
                        loading="lazy"
                        className="h-10 w-10 rounded-full object-cover border border-beige"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">
                          @{creator.username}
                        </p>
                        <p className="text-xs text-ink-muted truncate">
                          {creator.category} memories
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      {/* FULLSCREEN GALLERY */}
      <AnimatePresence>
        {gallery && (
          <motion.div
            className="fixed inset-0 z-50 bg-ink/90 text-white flex items-center justify-center p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${gallery.volume.title} gallery`}
            onClick={() => setGallery(null)}
          >
            <button
              type="button"
              aria-label="Close gallery"
              onClick={() => setGallery(null)}
              className="absolute right-5 top-5 h-11 w-11 rounded-full border border-white/20 bg-paper/10 backdrop-blur-md flex items-center justify-center hover:bg-paper/20 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {gallery.images.length > 1 && (
              <button
                type="button"
                aria-label="Previous gallery image"
                onClick={(event) => {
                  event.stopPropagation()
                  moveGallery(-1)
                }}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full border border-white/20 bg-paper/10 backdrop-blur-md flex items-center justify-center hover:bg-paper/20 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <motion.img
              key={gallery.images[gallery.index]}
              src={gallery.images[gallery.index]}
              alt={gallery.volume.title}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.28 }}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[82vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
            />

            {gallery.images.length > 1 && (
              <button
                type="button"
                aria-label="Next gallery image"
                onClick={(event) => {
                  event.stopPropagation()
                  moveGallery(1)
                }}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full border border-white/20 bg-paper/10 backdrop-blur-md flex items-center justify-center hover:bg-paper/20 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-paper/10 px-4 py-2 text-sm backdrop-blur-md">
              {gallery.index + 1}/{gallery.images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
