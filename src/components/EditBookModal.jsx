import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Eye, Tag, Globe, Lock, ShieldAlert, Sparkles, Check, Image as ImageIcon } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { themes, bookTypes } from '../data/mockData'
import Button from './ui/Button'

const PRESET_COVERS = [
  { name: 'Retro Journal', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=560&fit=crop' },
  { name: 'Beach Sunset', url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=560&fit=crop' },
  { name: 'Our Love Story', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=560&fit=crop' },
  { name: 'Cozy Cafe', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=560&fit=crop' },
  { name: 'Vintage Campus', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=560&fit=crop' },
]

export default function EditBookModal({ isOpen, onClose, bookId, onSaveComplete, onDeleteComplete }) {
  const { books, updateBook, deleteBook } = useApp()

  const book = books.find((b) => b.id === bookId)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('personal')
  const [themeId, setThemeId] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [coverFit, setCoverFit] = useState('cover') // 'cover' | 'contain' | 'fill'
  const [isShared, setIsShared] = useState(false)
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')

  // Sub-modal overlays
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showCoverGallery, setShowCoverGallery] = useState(false)
  const [customCoverUrl, setCustomCoverUrl] = useState('')

  // Initialize fields when modal opens/changes
  useEffect(() => {
    if (isOpen && book) {
      setTitle(book.title || '')
      setDescription(book.description || '')
      setType(book.type || 'personal')
      setThemeId(book.themeId || themes[0].id)
      setCoverImage(book.coverImage || '')
      setCoverFit(book.coverFit || 'cover')
      setIsShared(book.isShared || false)
      setTags(book.tags || [])
      setTagInput('')
      setShowDeleteConfirm(false)
      setShowPreview(false)
      setShowCoverGallery(false)
      setCustomCoverUrl('')
    }
  }, [isOpen, book])

  if (!isOpen || !book) return null

  const selectedTheme = themes.find((t) => t.id === themeId) || themes[0]

  // Tag actions
  const handleAddTag = (e) => {
    e.preventDefault()
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  // Cover image actions
  const handleDeleteCover = () => {
    setCoverImage('')
    setShowCoverGallery(false)
  }

  const handleApplyPresetCover = (url) => {
    setCoverImage(url)
    setShowCoverGallery(false)
  }

  const handleApplyCustomCover = () => {
    if (customCoverUrl.trim()) {
      setCoverImage(customCoverUrl.trim())
      setCustomCoverUrl('')
      setShowCoverGallery(false)
    }
  }

  // Visibility toggle helpers
  const handleVisibilityChange = (shared) => {
    setIsShared(shared)
    // Synchronize type: if visibility is private, type defaults to personal (or keep custom)
    if (!shared && type !== 'personal') {
      setType('personal')
    } else if (shared && type === 'personal') {
      setType('couple') // Default shared category
    }
  }

  // Save Book Handler
  const handleSave = () => {
    const updates = {
      title: title.trim() || 'Untitled Volume',
      description: description.trim(),
      type,
      themeId,
      coverImage: coverImage || null,
      coverFit,
      isShared,
      tags,
    }
    updateBook(book.id, updates)
    if (onSaveComplete) onSaveComplete(updates)
    onClose()
  }

  // Delete Book Handler
  const handleDeleteConfirmSubmit = (e) => {
    e.preventDefault()
    if (deleteConfirmTitle.trim() === book.title) {
      deleteBook(book.id)
      if (onDeleteComplete) onDeleteComplete()
      onClose()
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-6 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#2c2825]/50 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative z-10 w-full max-w-4xl bg-paper paper-texture shadow-book border border-beige/65 rounded-[32px] overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header clips */}
          <div className="absolute top-0 left-12 w-14 h-4 washi-tape opacity-85 pointer-events-none hidden md:block" />
          <div className="absolute top-0 right-16 w-20 h-4 washi-tape-accent opacity-90 pointer-events-none rotate-[2deg] hidden md:block" />

          {/* Modal Header */}
          <header className="px-6 py-5 border-b border-beige/40 flex items-center justify-between bg-paper-warm/40">
            <div>
              <h3 className="font-display font-semibold text-ink text-xl">Edit Volume Settings</h3>
              <p className="text-[10px] text-ink-muted uppercase tracking-widest font-sans mt-0.5">Customize cover, details, tags & visibility</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-beige/50 bg-cream/30 hover:bg-cream-dark/50 text-ink-muted hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </header>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 grid md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cover Preview & Management */}
            <div className="md:col-span-4 flex flex-col items-center space-y-4">
              <span className="text-[9px] uppercase font-bold text-ink-muted tracking-[0.15em] font-sans">Cover Preview</span>
              
              <div className="relative w-full max-w-[200px]">
                {/* Vintage Scrapbook Hardcover Binder Mockup */}
                <div className={`rounded-r-xl rounded-l shadow-polaroid border border-beige/40 bg-cream aspect-[3/4.2] overflow-hidden relative border-l-[10px] border-l-warm-brown`}>
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt=""
                      className={`w-full h-full object-${coverFit}`}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${selectedTheme.gradient} flex flex-col items-center justify-center p-4`}>
                      <ImageIcon className="w-10 h-10 text-ink/20 mb-3" />
                      <span className="text-[9px] text-ink/40 font-bold uppercase tracking-wider text-center select-none font-sans">
                        Theme Color Cover
                      </span>
                    </div>
                  )}
                  {/* Binder edge simulation */}
                  <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-black/25 z-10" />
                  
                  {/* Cover title bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10">
                    <p className="font-display font-bold text-white text-xs leading-tight truncate italic">
                      {title || 'Book Title'}
                    </p>
                  </div>
                </div>

                {/* Cover corners decoration */}
                <div className="absolute -left-1 top-0 w-2.5 h-2.5 border-t-2 border-l-2 border-gold rounded-tl-sm pointer-events-none" />
                <div className="absolute -left-1 bottom-0 w-2.5 h-2.5 border-b-2 border-l-2 border-gold rounded-bl-sm pointer-events-none" />
                <div className="absolute -right-1.5 top-0 w-2.5 h-2.5 border-t-2 border-r-2 border-gold rounded-tr-sm pointer-events-none" />
                <div className="absolute -right-1.5 bottom-0 w-2.5 h-2.5 border-b-2 border-r-2 border-gold rounded-br-sm pointer-events-none" />
              </div>

              {/* Cover Fit Selectors */}
              {coverImage && (
                <div className="w-full space-y-1.5 text-center">
                  <span className="text-[9px] uppercase font-bold text-ink-muted tracking-wider font-sans">Cover Image Fit</span>
                  <div className="flex bg-cream-dark/30 p-1 rounded-xl border border-beige/40 text-[9px] uppercase tracking-wider font-bold">
                    {['cover', 'contain', 'fill'].map((fit) => (
                      <button
                        key={fit}
                        type="button"
                        onClick={() => setCoverFit(fit)}
                        className={`flex-1 py-1.5 rounded-lg cursor-pointer transition-all ${
                          coverFit === fit
                            ? 'bg-paper text-ink shadow-xs border border-beige/45'
                            : 'text-ink-muted hover:text-ink'
                        }`}
                      >
                        {fit === 'cover' ? 'Crop' : fit === 'contain' ? 'Resize' : 'Fit'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover Image Actions */}
              <div className="w-full flex flex-col gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCoverGallery(true)}
                  className="w-full text-xs font-semibold justify-center py-2 h-auto"
                >
                  <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                  Change Cover Photo
                </Button>
                
                {coverImage && (
                  <button
                    onClick={handleDeleteCover}
                    className="w-full text-[10px] font-bold uppercase tracking-wider text-rose-muted hover:text-red-500 py-1.5 rounded-xl border border-dashed border-beige/60 hover:border-red-400 transition-colors cursor-pointer"
                  >
                    Delete Cover Photo
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Editable Fields */}
            <div className="md:col-span-8 space-y-5">
              
              {/* Row: Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-ink-muted tracking-[0.12em] font-sans block pl-0.5">
                  Book Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Our Summer in Goa"
                  required
                  className="w-full px-4 py-2.5 border border-beige/85 rounded-xl bg-paper focus:outline-none focus:ring-1 focus:ring-pink-accent/50 text-sm font-sans font-semibold text-ink shadow-inner-sm"
                />
              </div>

              {/* Row: Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-ink-muted tracking-[0.12em] font-sans block pl-0.5">
                  Volume Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Capture the vibe of this memory book..."
                  className="w-full px-4 py-2.5 border border-beige/85 rounded-xl bg-paper focus:outline-none focus:ring-1 focus:ring-pink-accent/50 text-sm font-sans text-ink shadow-inner-sm resize-none"
                />
              </div>

              {/* Grid: Theme and Category */}
              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* Category/Type Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-ink-muted tracking-[0.12em] font-sans block pl-0.5">
                    Category Type
                  </label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => {
                        setType(e.target.value)
                        // Auto-toggle isShared based on choice
                        if (e.target.value === 'personal') {
                          setIsShared(false)
                        } else {
                          setIsShared(true)
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-beige/85 rounded-xl bg-paper focus:outline-none focus:ring-1 focus:ring-pink-accent/50 text-sm font-sans text-ink shadow-inner-sm appearance-none cursor-pointer font-medium pr-10"
                    >
                      {bookTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.icon} {t.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink-muted/65">
                      <X className="w-4 h-4 rotate-45" />
                    </div>
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-ink-muted tracking-[0.12em] font-sans block pl-0.5">
                    Visual Theme
                  </label>
                  <div className="relative">
                    <select
                      value={themeId}
                      onChange={(e) => setThemeId(e.target.value)}
                      className="w-full px-4 py-2.5 border border-beige/85 rounded-xl bg-paper focus:outline-none focus:ring-1 focus:ring-pink-accent/50 text-sm font-sans text-ink shadow-inner-sm appearance-none cursor-pointer font-medium pr-10"
                    >
                      {themes.map((t) => (
                        <option key={t.id} value={t.id}>
                          🎨 {t.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink-muted/65">
                      <X className="w-4 h-4 rotate-45" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row: Visibility Toggle */}
              <div className="space-y-2 bg-cream-dark/25 p-3 rounded-2xl border border-beige/40">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                      {isShared ? <Globe className="w-3.5 h-3.5 text-pink-accent" /> : <Lock className="w-3.5 h-3.5 text-warm-brown" />}
                      Visibility: {isShared ? 'Public Feed' : 'Private Journal'}
                    </span>
                    <p className="text-[10px] text-ink-muted mt-0.5">
                      {isShared
                        ? 'Collaborators can view/add. Pages appear in community feed.'
                        : 'Only visible to you. Quiet and completely private.'}
                    </p>
                  </div>

                  <div className="flex bg-cream-dark/40 p-0.5 rounded-lg border border-beige/50 text-[10px] uppercase font-bold tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleVisibilityChange(false)}
                      className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                        !isShared ? 'bg-paper text-ink shadow-inner-sm' : 'text-ink-muted hover:text-ink'
                      }`}
                    >
                      Private
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVisibilityChange(true)}
                      className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                        isShared ? 'bg-paper text-ink shadow-inner-sm' : 'text-ink-muted hover:text-ink'
                      }`}
                    >
                      Public
                    </button>
                  </div>
                </div>
              </div>

              {/* Row: Tags pill manager */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-ink-muted tracking-[0.12em] font-sans block pl-0.5">
                  Volume Tags
                </label>
                
                {/* Pill list */}
                <div className="flex flex-wrap gap-2 mb-2 min-h-[32px] p-2 bg-cream-dark/15 border border-beige/45 rounded-xl">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper border border-beige text-[10px] font-semibold text-ink font-sans shadow-xs"
                      >
                        <Tag className="w-2.5 h-2.5 text-pink-accent" />
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="w-3.5 h-3.5 rounded-full hover:bg-cream-dark flex items-center justify-center text-ink-muted hover:text-ink transition-colors cursor-pointer ml-1"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-ink-muted/50 italic self-center pl-1 font-sans">No tags added yet. Enter below to add.</span>
                  )}
                </div>

                {/* Tag Input */}
                <form onSubmit={handleAddTag} className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Type tag (e.g. wanderlust) and press Enter"
                    className="flex-1 px-4 py-2 border border-beige/80 rounded-xl bg-paper focus:outline-none focus:ring-1 focus:ring-pink-accent/50 text-xs font-sans text-ink placeholder-ink-muted/30 shadow-inner-sm"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    className="h-[36px]"
                  >
                    + Add Tag
                  </Button>
                </form>
              </div>

            </div>
          </div>

          {/* Modal Footer */}
          <footer className="px-6 py-4 border-t border-beige/40 bg-paper-warm/40 flex flex-wrap items-center justify-between gap-3">
            {/* Delete Option */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-rose-muted hover:text-red-500 text-xs font-semibold flex items-center gap-1.5 cursor-pointer py-2 px-3 border border-transparent hover:border-red-200 hover:bg-red-500/5 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete Volume
            </button>

            {/* Save, Preview, Cancel actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-ink-muted hover:text-ink hover:bg-cream-dark/30 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-1.5 text-xs h-[38px]"
              >
                <Eye className="w-4 h-4" />
                Preview Changes
              </Button>
              <Button
                onClick={handleSave}
                className="text-xs h-[38px]"
              >
                Save Changes
              </Button>
            </div>
          </footer>

          {/* Curated Cover Photo Gallery Drawer */}
          <AnimatePresence>
            {showCoverGallery && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute inset-0 z-30 bg-paper paper-texture p-6 flex flex-col"
              >
                <header className="flex items-center justify-between border-b border-beige/40 pb-4 mb-4">
                  <div>
                    <h4 className="font-display font-semibold text-ink text-base">Select Cover Image</h4>
                    <p className="text-[10px] text-ink-muted font-sans font-medium uppercase tracking-wider">Choose preset or paste direct url</p>
                  </div>
                  <button
                    onClick={() => setShowCoverGallery(false)}
                    className="w-7 h-7 rounded-full border border-beige/50 bg-cream/30 hover:bg-cream-dark/50 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-ink-muted" />
                  </button>
                </header>

                <div className="flex-1 overflow-y-auto space-y-6">
                  {/* Preset covers grid */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block font-sans">Curated presets</span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {PRESET_COVERS.map((cov) => (
                        <button
                          key={cov.name}
                          onClick={() => handleApplyPresetCover(cov.url)}
                          className="group relative aspect-[3/4.2] rounded-lg overflow-hidden border border-beige/45 hover:border-pink-accent hover:shadow-md transition-all cursor-pointer bg-cream-dark"
                        >
                          <img
                            src={cov.url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[10px] text-white font-bold text-center px-1 font-sans">{cov.name}</span>
                          </div>
                          {coverImage === cov.url && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-pink-accent text-white rounded-full flex items-center justify-center shadow">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom URL Input */}
                  <div className="space-y-2 border-t border-beige/35 pt-4">
                    <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block font-sans">Paste Custom Cover URL</span>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={customCoverUrl}
                        onChange={(e) => setCustomCoverUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 px-4 py-2 border border-beige/80 rounded-xl bg-paper focus:outline-none focus:ring-1 focus:ring-pink-accent/50 text-xs font-sans text-ink shadow-inner-sm"
                      />
                      <Button
                        onClick={handleApplyCustomCover}
                        disabled={!customCoverUrl.trim()}
                        variant="secondary"
                        size="sm"
                        className="h-[36px]"
                      >
                        Apply Photo
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pre-save Preview Drawer */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-[#2c2825]/45 backdrop-blur-xs flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 15 }}
                  className="bg-paper paper-texture max-w-md w-full rounded-[28px] border border-beige/60 shadow-book p-6 relative flex flex-col overflow-hidden max-h-full"
                >
                  <header className="flex items-center justify-between border-b border-beige/35 pb-3.5 mb-4">
                    <span className="font-display font-semibold text-ink text-base">Scrapbook Shelf Preview</span>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="w-7 h-7 rounded-full border border-beige/50 bg-cream/30 hover:bg-cream-dark/50 flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 text-ink-muted" />
                    </button>
                  </header>

                  <div className="flex-1 overflow-y-auto space-y-5 pb-2 text-center flex flex-col items-center">
                    
                    {/* Mock Book mockup */}
                    <div className="relative w-40">
                      <div className={`rounded-r-xl rounded-l shadow-polaroid border border-beige/30 bg-cream aspect-[3/4.2] overflow-hidden relative border-l-[8px] border-l-warm-brown`}>
                        {coverImage ? (
                          <img
                            src={coverImage}
                            alt=""
                            className={`w-full h-full object-${coverFit}`}
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${selectedTheme.gradient} flex flex-col items-center justify-center p-3`}>
                            <ImageIcon className="w-7 h-7 text-ink/15 mb-2" />
                            <span className="text-[8px] text-ink/30 font-bold uppercase tracking-wider text-center select-none font-sans">
                              {selectedTheme.name}
                            </span>
                          </div>
                        )}
                        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-black/25 z-10" />
                        <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10">
                          <p className="font-display font-bold text-white text-[10px] leading-tight truncate italic">
                            {title || 'Untitled Volume'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-display font-bold text-xl text-ink leading-tight">
                        {title || 'Untitled Volume'}
                      </h4>
                      <div className="flex flex-wrap items-center justify-center gap-2 text-[9px] uppercase font-bold tracking-wider text-ink-muted mt-1.5 font-sans">
                        <span className="bg-cream-dark/40 px-2 py-0.5 rounded border border-beige/45">{type}</span>
                        <span>•</span>
                        <span className="bg-cream-dark/40 px-2 py-0.5 rounded border border-beige/45">{isShared ? 'Public' : 'Private'}</span>
                        <span>•</span>
                        <span className="bg-pink-accent/10 text-pink-accent px-2 py-0.5 rounded border border-pink-accent/15">🎨 {selectedTheme.name}</span>
                      </div>
                    </div>

                    {description && (
                      <p className="text-xs text-ink-muted leading-relaxed font-sans max-w-sm italic">
                        "{description}"
                      </p>
                    )}

                    {tags.length > 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded bg-cream-dark/25 border border-beige/35 text-[9px] text-ink-muted font-sans font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <footer className="border-t border-beige/35 pt-4 flex gap-2 mt-4 text-xs font-semibold">
                    <Button
                      variant="outline"
                      onClick={() => setShowPreview(false)}
                      className="flex-1 justify-center py-2 h-auto text-xs"
                    >
                      Keep Editing
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="flex-1 justify-center py-2 h-auto text-xs flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Save Volume
                    </Button>
                  </footer>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Strict Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-[#2c2825]/55 backdrop-blur-xs flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 15 }}
                  className="bg-paper paper-texture max-w-sm w-full rounded-[24px] border-2 border-rose-muted/40 shadow-book p-6 relative"
                >
                  <header className="flex items-center gap-2 pb-3 border-b border-beige/30 mb-4">
                    <ShieldAlert className="w-5 h-5 text-rose-muted" />
                    <span className="font-display font-semibold text-ink text-base">Archiving Hazard Warning</span>
                  </header>

                  <div className="space-y-3 pb-4">
                    <p className="text-xs text-ink leading-relaxed font-sans">
                      You are about to delete <strong className="text-pink-accent font-semibold">"{book.title}"</strong>. This permanently archives the volume cover, structural folders, and collaborator bindings.
                    </p>
                    <p className="text-xs text-ink-muted font-sans bg-rose-muted/5 border border-rose-muted/20 p-2 rounded-lg leading-normal">
                      To confirm deletion, please type the title of the book in the input box below:
                    </p>
                  </div>

                  <form onSubmit={handleDeleteConfirmSubmit} className="space-y-4">
                    <input
                      type="text"
                      value={deleteConfirmTitle}
                      onChange={(e) => setDeleteConfirmTitle(e.target.value)}
                      placeholder={`Type "${book.title}"`}
                      className="w-full px-4.5 py-2.5 border border-rose-muted/50 rounded-xl bg-paper focus:outline-none focus:ring-1 focus:ring-rose-muted text-xs font-sans font-bold text-ink shadow-inner-sm text-center"
                    />

                    <div className="flex gap-2 pt-2 text-xs font-semibold">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeleteConfirmTitle('')
                        }}
                        className="flex-1 justify-center py-2 h-auto text-xs"
                      >
                        Keep Volume
                      </Button>
                      <Button
                        type="submit"
                        disabled={deleteConfirmTitle !== book.title}
                        className="flex-1 justify-center py-2 h-auto text-xs bg-rose-muted border-rose-muted hover:bg-red-500 text-white font-bold disabled:opacity-40"
                      >
                        Delete Permanently
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
