import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  ChevronLeft,
  Globe2,
  Loader2,
  Lock,
  Save,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ImageCanvas from '../components/ImageCanvas'
import { useApp } from '../context/AppContext'

const defaultAvatar =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face'
const defaultCover =
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80'

function Spinner() {
  return <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
}

export default function EditProfile() {
  const navigate = useNavigate()
  const { user, updateUser } = useApp()

  const initialProfile = useMemo(
    () => ({
      username: user?.username || 'priyasharma',
      displayName: user?.name || 'Priya Sharma',
      bio:
        user?.bio ||
        'Memory keeper and story collector. Preserving life beautiful moments, one page at a time.',
      privacy: user?.privacy || 'public',
      avatar: user?.avatar || defaultAvatar,
      cover: user?.cover || defaultCover,
    }),
    [user],
  )

  const [displayName, setDisplayName] = useState(initialProfile.displayName)
  const [bio, setBio] = useState(initialProfile.bio)
  const [privacy, setPrivacy] = useState(initialProfile.privacy)
  const [avatarFile, setAvatarFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(initialProfile.avatar)
  const [coverPreview, setCoverPreview] = useState(initialProfile.cover)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)

  const isDirty = useMemo(() => {
    return (
      displayName !== initialProfile.displayName ||
      bio !== initialProfile.bio ||
      privacy !== initialProfile.privacy ||
      Boolean(avatarFile) ||
      Boolean(coverFile)
    )
  }, [avatarFile, bio, coverFile, displayName, initialProfile, privacy])

  useEffect(() => {
    if (!isDirty) return undefined

    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview)
      if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
    }
  }, [avatarPreview, coverPreview])

  const bioRemaining = 250 - bio.length
  const isBioWarning = bioRemaining <= 30
  const canSave =
    isDirty && !isSaving && bio.length <= 250

  const handleCancel = () => {
    if (isDirty) {
      setShowUnsavedModal(true)
      return
    }

    navigate('/dashboard')
  }

  const discardChanges = () => {
    setShowUnsavedModal(false)
    navigate('/dashboard')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSave) return

    setIsSaving(true)

    await new Promise((resolve) => window.setTimeout(resolve, 900))

    updateUser({
      username: initialProfile.username, // Keep the original username
      name: displayName.trim(),
      bio,
      privacy,
      avatar: avatarPreview,
      cover: coverPreview,
    })

    setAvatarFile(null)
    setCoverFile(null)
    setIsSaving(false)
    setToast('Profile updated beautifully.')
  }

  return (
    <div className="min-h-screen paper-texture text-ink">
      <Navbar />

      <main className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 pt-28 sm:pt-32 pb-32 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mb-8 flex items-start justify-between gap-5"
        >
          <div>
            <p className="font-handwritten text-xl text-pink-accent">Your public scrapbook cover</p>
            <h1 className="mt-2 font-display text-5xl sm:text-6xl leading-none">
              Edit Profile
            </h1>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.55, ease: 'easeOut' }}
          className="scrapbook-card rounded-3xl overflow-hidden border border-beige/50"
        >
          <section className="relative">
            <ImageCanvas
              images={coverPreview ? [coverPreview] : []}
              onImagesChange={(imgs) => {
                if (imgs.length > 0) {
                  setCoverFile(imgs[0])
                  setCoverPreview(imgs[0])
                } else {
                  setCoverFile(null)
                  setCoverPreview(defaultCover)
                }
              }}
              multiple={false}
              variant="cover"
              aspect="3/1"
            />

            <div className="absolute left-6 sm:left-10 -bottom-16 z-20">
              <ImageCanvas
                images={avatarPreview ? [avatarPreview] : []}
                onImagesChange={(imgs) => {
                  if (imgs.length > 0) {
                    setAvatarFile(imgs[0])
                    setAvatarPreview(imgs[0])
                  } else {
                    setAvatarFile(null)
                    setAvatarPreview(defaultAvatar)
                  }
                }}
                multiple={false}
                variant="avatar"
                aspect="1/1"
              />
            </div>
          </section>

          <div className="grid gap-8 px-6 pb-7 pt-24 sm:px-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-6">
              {/* Display Username as Read-Only */}
              <div className="block">
                <span className="text-sm font-semibold text-ink">Username</span>
                <div className="mt-2 h-13 w-full rounded-2xl border border-beige bg-paper-warm px-4 py-2.5 text-ink/70 flex items-center">
                  <span className="font-mono text-sm">@{initialProfile.username}</span>
                  <span className="ml-3 text-xs text-ink-muted bg-beige/30 px-2 py-0.5 rounded-full">
                    Cannot be changed
                  </span>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-ink">Display Name</span>
                  <input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="mt-2 h-13 w-full rounded-2xl border border-beige bg-paper px-4 text-ink outline-none transition-colors focus:border-pink-accent"
                    placeholder="Your name"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-ink">Bio</span>
                <textarea
                  value={bio}
                  maxLength={250}
                  onChange={(event) => setBio(event.target.value.slice(0, 250))}
                  rows={6}
                  className="mt-2 w-full resize-none rounded-2xl border border-beige bg-paper p-4 text-ink outline-none transition-colors focus:border-pink-accent"
                  placeholder="Tell people what your scrapbook is about..."
                />
                <div className="mt-2 flex justify-end">
                  <span className={`text-xs font-medium ${isBioWarning ? 'text-pink-accent' : 'text-ink-muted'}`}>
                    {bioRemaining} / 250 characters remaining
                  </span>
                </div>
              </label>
            </div>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-beige bg-paper-warm p-5">
                <p className="text-sm font-semibold text-ink">Privacy</p>
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-beige bg-paper p-1.5">
                  {[
                    { id: 'public', label: 'Public', icon: Globe2 },
                    { id: 'private', label: 'Private', icon: Lock },
                  ].map((option) => {
                    const Icon = option.icon
                    const isActive = privacy === option.id

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPrivacy(option.id)}
                        className={`relative h-12 rounded-xl text-sm font-medium transition-colors cursor-pointer ${isActive ? 'text-white' : 'text-ink-muted hover:text-ink'
                          }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="privacy-pill"
                            className="absolute inset-0 rounded-xl bg-pink-accent"
                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          />
                        )}
                        <span className="relative z-10 inline-flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-beige bg-paper p-5 shadow-inner-sm">
                <p className="text-sm font-semibold text-ink">Save Status</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {isDirty
                    ? 'You have unsaved profile changes.'
                    : 'No changes yet. The save button will wake up when you edit something.'}
                </p>
              </div>
            </aside>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-beige/60 bg-paper-warm px-6 py-5 sm:flex-row sm:justify-end sm:px-10">
            <button
              type="button"
              onClick={handleCancel}
              className="h-12 rounded-2xl border border-beige bg-paper px-6 text-sm font-semibold text-ink transition-all hover:border-ink-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-pink-accent px-6 text-sm font-semibold text-white shadow-md transition-all enabled:hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSaving ? <Spinner /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </motion.form>
      </main>

      <AnimatePresence>
        {showUnsavedModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              className="w-full max-w-md rounded-3xl border border-beige bg-paper p-6 shadow-2xl"
            >
              <h2 className="font-display text-3xl text-ink">Discard changes?</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Your profile edits have not been saved. Leaving now will discard them.
              </p>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowUnsavedModal(false)}
                  className="h-11 rounded-2xl border border-beige bg-paper px-5 text-sm font-semibold text-ink cursor-pointer"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={discardChanges}
                  className="h-11 rounded-2xl bg-pink-accent px-5 text-sm font-semibold text-white shadow-md cursor-pointer"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-beige bg-paper px-5 py-3 text-sm font-semibold text-ink shadow-xl"
          >
            <Check className="h-4 w-4 text-pink-accent" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}