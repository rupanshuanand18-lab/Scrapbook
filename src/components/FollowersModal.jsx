/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, UserMinus, UserPlus, UserX, Loader2 } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function FollowersModal({ isOpen, onClose, userId, initialTab = 'followers' }) {
  const {
    allUsers,
    user: currentUser,
    getFollowers,
    getFollowing,
    isFollowing,
    followUser,
    unfollowUser,
    removeFollower,
    openUserProfile,
  } = useApp()

  const [activeTab, setActiveTab] = useState(initialTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(6)
  const [loadingMore, setLoadingMore] = useState(false)
  const listRef = useRef(null)

  // Reset search and visible counts when tab changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      setSearchQuery('')
      setVisibleCount(6)
      setLoadingMore(false)
    }
  }, [initialTab, isOpen])

  useEffect(() => {
    setSearchQuery('')
    setVisibleCount(6)
    setLoadingMore(false)
  }, [activeTab])

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !currentUser) return null

  // Resolve which profile we are viewing
  const targetUser = allUsers.find((u) => u.id === userId) || currentUser
  const isOwnProfile = targetUser.id === currentUser.id

  // Retrieve raw list
  const rawList = activeTab === 'followers' ? getFollowers(targetUser.id) : getFollowing(targetUser.id)

  // Filter list by username or display name
  const filteredUsers = rawList.filter((u) => {
    const term = searchQuery.toLowerCase()
    return (
      u.username.toLowerCase().includes(term) ||
      u.name.toLowerCase().includes(term)
    )
  })

  // Slice list for infinite scroll simulation
  const visibleUsers = filteredUsers.slice(0, visibleCount)

  // Handle scrolling for infinite load trigger
  const handleScroll = () => {
    if (!listRef.current || loadingMore) return
    const { scrollTop, scrollHeight, clientHeight } = listRef.current
    // Trigger when scrolled to within 15px of the bottom
    if (scrollHeight - scrollTop <= clientHeight + 15) {
      if (visibleCount < filteredUsers.length) {
        setLoadingMore(true)
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + 4, filteredUsers.length))
          setLoadingMore(false)
        }, 850)
      }
    }
  }

  // Handle row actions
  const handleFollowToggle = (e, rowUser) => {
    e.stopPropagation()
    if (isFollowing(currentUser.id, rowUser.id)) {
      unfollowUser(currentUser.id, rowUser.id)
    } else {
      followUser(currentUser.id, rowUser.id)
    }
  }

  const handleRemoveFollowerAction = (e, rowUser) => {
    e.stopPropagation()
    removeFollower(currentUser.id, rowUser.id)
  }

  const handleUnfollowAction = (e, rowUser) => {
    e.stopPropagation()
    unfollowUser(currentUser.id, rowUser.id)
  }

  const handleRowClick = (rowUser) => {
    // Open their profile modal
    openUserProfile(rowUser.id)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#2c2825]/45 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Sheet container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative z-10 w-full h-full md:h-[620px] md:max-w-md md:rounded-[28px] bg-paper paper-texture md:shadow-book border-t md:border border-beige/60 flex flex-col overflow-hidden"
        >
          {/* Header washi tape decorative touch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 washi-tape-accent z-20 pointer-events-none opacity-90 hidden md:block" />

          {/* Header section */}
          <div className="pt-6 sm:pt-8 px-5 pb-4 border-b border-beige/40 flex flex-col gap-4 relative bg-paper-warm/80 backdrop-blur-xs">
            {/* Title and Close Button */}
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-ink text-lg md:text-xl">
                {isOwnProfile ? 'Your Network' : `${targetUser.name}'s Network`}
              </h3>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full border border-beige/50 bg-cream/30 hover:bg-cream-dark/50 text-ink-muted hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Swapper Header */}
            <div className="flex bg-cream-dark/30 p-1 rounded-xl border border-beige/40">
              <button
                onClick={() => setActiveTab('followers')}
                className={`flex-1 py-2 text-xs font-semibold tracking-wider uppercase rounded-lg transition-all cursor-pointer relative z-10 ${
                  activeTab === 'followers' ? 'text-ink' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {activeTab === 'followers' && (
                  <motion.div
                    layoutId="activeModalTab"
                    className="absolute inset-0 bg-paper border border-beige/50 rounded-lg shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                Followers ({getFollowers(targetUser.id).length})
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`flex-1 py-2 text-xs font-semibold tracking-wider uppercase rounded-lg transition-all cursor-pointer relative z-10 ${
                  activeTab === 'following' ? 'text-ink' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {activeTab === 'following' && (
                  <motion.div
                    layoutId="activeModalTab"
                    className="absolute inset-0 bg-paper border border-beige/50 rounded-lg shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                Following ({getFollowing(targetUser.id).length})
              </button>
            </div>

            {/* Live Search Bar */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-ink-muted/50" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search @username or name...`}
                className="w-full pl-9 pr-4 py-2 border border-beige/70 rounded-xl bg-paper focus:outline-none focus:ring-1 focus:ring-pink-accent/50 text-sm font-sans text-ink placeholder-ink-muted/40 shadow-inner-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-muted/50 hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List section */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-beige/25"
          >
            {visibleUsers.length > 0 ? (
              <div className="space-y-0.5">
                {visibleUsers.map((rowUser) => {
                  const isRowSelf = rowUser.id === currentUser.id
                  const isFlipped = isFollowing(currentUser.id, rowUser.id)

                  return (
                    <motion.div
                      key={rowUser.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between py-3 hover:bg-cream-dark/15 px-2 rounded-xl transition-all cursor-pointer group"
                      onClick={() => handleRowClick(rowUser)}
                    >
                      {/* Left: Avatar & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <img
                            src={rowUser.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-beige bg-cream-dark shadow-sm group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink leading-tight truncate">
                            {rowUser.name}
                          </p>
                          <p className="text-xs text-ink-muted truncate font-sans">
                            @{rowUser.username}
                          </p>
                        </div>
                      </div>

                      {/* Right: Dynamic Actions */}
                      <div className="flex items-center">
                        {isRowSelf ? (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-pink-accent/60 bg-pink-accent/5 px-2 py-1 rounded border border-pink-accent/15">
                            You
                          </span>
                        ) : isOwnProfile ? (
                          activeTab === 'followers' ? (
                            <button
                              onClick={(e) => handleRemoveFollowerAction(e, rowUser)}
                              className="px-3 py-1.5 rounded-lg border border-rose-muted/40 hover:border-rose-muted text-[10px] font-bold tracking-wider text-rose-muted hover:bg-rose-muted/5 uppercase transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <UserMinus className="w-3.5 h-3.5 mr-1 inline" />
                              <span>Remove</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleUnfollowAction(e, rowUser)}
                              className="px-3 py-1.5 rounded-lg border border-beige hover:border-ink-muted text-[10px] font-bold tracking-wider text-ink-muted hover:text-ink hover:bg-cream-dark/30 uppercase transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <UserMinus className="w-3.5 h-3.5 mr-1 inline" />
                              <span>Unfollow</span>
                            </button>
                          )
                        ) : (
                          <button
                            onClick={(e) => handleFollowToggle(e, rowUser)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer ${
                              isFlipped
                                ? 'border border-beige hover:border-rose-muted text-ink-muted hover:text-rose-muted hover:bg-rose-muted/5'
                                : 'bg-pink-accent text-white hover:bg-pink-accent/90 shadow-sm shadow-pink-accent/10 border border-pink-accent'
                            }`}
                          >
                            {isFlipped ? (
                              <>
                                <UserMinus className="w-3.5 h-3.5 mr-1 inline" />
                                <span>Following</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5 mr-1 inline" />
                                <span>Follow</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}

                {/* Loading state indicator */}
                {loadingMore && (
                  <div className="flex items-center justify-center gap-2 py-4 text-ink-muted text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-pink-accent" />
                    <span className="font-handwritten text-sm">Turning the page...</span>
                  </div>
                )}
              </div>
            ) : (
              /* Attractive Scrapbook Empty State */
              <div className="flex flex-col items-center justify-center py-14 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-cream-dark/20 border-2 border-dashed border-beige flex items-center justify-center mb-4 text-beige">
                  <UserX className="w-7 h-7" />
                </div>
                <h4 className="font-display font-semibold text-ink text-base">
                  {searchQuery ? 'No creators found' : activeTab === 'followers' ? 'No Followers Yet' : 'Not Following Anyone'}
                </h4>
                <p className="text-xs text-ink-muted max-w-xs mt-2 leading-relaxed font-sans">
                  {searchQuery
                    ? `We couldn't find anyone matching "${searchQuery}". Check the spelling and try again.`
                    : activeTab === 'followers'
                    ? "Every beautiful diary starts with a single writer. Your circle of readers will grow soon! ✨"
                    : "Discover inspiring stories in the community feed and connect with other keepers of memory."}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
