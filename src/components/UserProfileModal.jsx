import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, UserPlus, UserMinus, Flame, Compass } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function UserProfileModal({ isOpen, onClose, userId }) {
  const {
    allUsers,
    user: currentUser,
    books,
    getFollowers,
    getFollowing,
    isFollowing,
    followUser,
    unfollowUser,
    openFollowersModal,
  } = useApp()

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

  // Find target user
  const targetUser = allUsers.find((u) => u.id === userId)
  if (!targetUser) return null

  const isOwnProfile = targetUser.id === currentUser.id
  const isFlipped = isFollowing(currentUser.id, targetUser.id)

  // Get books associated with this user
  const userBooks = books.filter(
    (b) =>
      b.isShared &&
      (b.ownerId === targetUser.id || b.collaboratorIds?.includes(targetUser.id))
  )

  // Counts
  const followersCount = getFollowers(targetUser.id).length
  const followingCount = getFollowing(targetUser.id).length

  const handleFollowToggle = () => {
    if (isFlipped) {
      unfollowUser(currentUser.id, targetUser.id)
    } else {
      followUser(currentUser.id, targetUser.id)
    }
  }

  const handleOpenNetwork = (tab) => {
    openFollowersModal(targetUser.id, tab)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#2c2825]/45 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative z-10 w-full h-full md:h-auto md:max-w-2xl md:rounded-[32px] bg-paper paper-texture md:shadow-book border-t md:border border-beige/60 flex flex-col overflow-hidden max-h-[100vh] md:max-h-[90vh]"
        >
          {/* Header clips or tapes */}
          <div className="absolute top-0 left-1/3 -translate-x-1/2 w-20 h-5 washi-tape z-20 pointer-events-none opacity-80 hidden md:block" />
          <div className="absolute top-0 right-1/4 w-14 h-5 washi-tape-accent z-20 pointer-events-none opacity-85 rotate-[6deg] hidden md:block" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close profile"
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full border border-beige/50 bg-cream/40 hover:bg-cream-dark/60 text-ink-muted hover:text-ink flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 md:p-8 overflow-y-auto flex-1">
            {/* Top section: Avatar, Username, Name, Follow button */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 pb-6 border-b border-beige/40 mt-4 md:mt-2">
              <img
                src={targetUser.avatar}
                alt=""
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover ring-4 ring-pink-accent/20 shadow-lg border border-beige"
              />

              <div className="flex-1 text-center md:text-left space-y-3">
                <div>
                  <h3 className="font-display font-bold text-2xl text-ink leading-tight">
                    {targetUser.name}
                  </h3>
                  <p className="text-sm text-ink-muted font-sans font-medium">
                    @{targetUser.username}
                  </p>
                </div>

                <p className="text-sm text-ink font-sans leading-relaxed max-w-md mx-auto md:mx-0">
                  {targetUser.bio || 'Keeper of small moments and large dreams. Preservation of life is key.'}
                </p>

                {/* Network numbers & buttons */}
                <div className="flex items-center justify-center md:justify-start gap-6 pt-1 text-sm">
                  <button
                    onClick={() => handleOpenNetwork('followers')}
                    className="font-sans text-ink hover:text-pink-accent transition-colors font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span className="font-bold text-base text-pink-accent">{followersCount}</span>
                    <span className="text-ink-muted text-xs font-normal">Followers</span>
                  </button>
                  <span className="text-beige select-none">•</span>
                  <button
                    onClick={() => handleOpenNetwork('following')}
                    className="font-sans text-ink hover:text-pink-accent transition-colors font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span className="font-bold text-base text-pink-accent">{followingCount}</span>
                    <span className="text-ink-muted text-xs font-normal">Following</span>
                  </button>
                </div>

                {/* Follow Button */}
                <div className="pt-2">
                  {isOwnProfile ? (
                    <span className="inline-block px-4 py-1.5 rounded-full bg-pink-accent/10 border border-pink-accent/20 text-xs font-bold uppercase tracking-wider text-pink-accent">
                      This is you
                    </span>
                  ) : (
                    <button
                      onClick={handleFollowToggle}
                      className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-sm flex items-center gap-1.5 mx-auto md:mx-0 cursor-pointer border ${
                        isFlipped
                          ? 'border-beige bg-cream/30 hover:bg-cream-dark/50 hover:border-rose-muted text-ink-muted hover:text-rose-muted'
                          : 'bg-pink-accent text-white hover:bg-pink-accent/90 border-pink-accent'
                      }`}
                    >
                      {isFlipped ? (
                        <>
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Follow Creator</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom section: Volumes Grid */}
            <div className="pt-6">
              <h4 className="font-display font-semibold text-lg text-ink flex items-center gap-2 mb-4">
                <Compass className="w-4 h-4 text-pink-accent" /> Shared Volumes
              </h4>

              {userBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
                  {userBooks.map((book) => (
                    <div
                      key={book.id}
                      className="p-3 bg-paper-warm/40 border border-beige/40 rounded-2xl hover:bg-paper-warm/80 hover:shadow-md transition-all group flex flex-col h-full cursor-pointer"
                    >
                      <div className="aspect-[3/4] rounded-xl overflow-hidden border border-beige/35 bg-cream-dark mb-2.5 relative">
                        <img
                          src={book.coverImage}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-ink/75 backdrop-blur-xs text-[8px] font-bold text-white uppercase tracking-wider">
                          {book.type}
                        </div>
                      </div>
                      <h5 className="font-display font-bold text-ink text-sm leading-snug group-hover:text-pink-accent transition-colors truncate">
                        {book.title}
                      </h5>
                      <p className="text-[10px] text-ink-muted font-sans mt-0.5">
                        {book.memoryCount} moments
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-beige/60 rounded-2xl py-12 px-4 text-center">
                  <BookOpen className="w-8 h-8 text-beige mx-auto mb-2" />
                  <p className="font-handwritten text-lg text-ink-muted">No shared volumes yet</p>
                  <p className="text-xs text-ink-muted/70 max-w-xs mx-auto mt-1 leading-normal font-sans">
                    {targetUser.name} hasn't published any shared memories to the community feed yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
