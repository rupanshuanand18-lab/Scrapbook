import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Heart, Users, Compass, Home, Sparkles } from 'lucide-react'
import VisualEditorShell from './VisualEditorShell'
import ImageCanvas from './ImageCanvas'
import { themes, bookTypes } from '../data/mockData'

const iconMap = {
  personal: BookOpen,
  couple: Heart,
  friendship: Users,
  travel: Compass,
  family: Home,
  custom: Sparkles
}

export default function CreateBookModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('personal')
  const [themeId, setThemeId] = useState(themes[0].id)
  const [coverImage, setCoverImage] = useState([])

  const selectedTheme = themes.find((t) => t.id === themeId) || themes[0]

  const reset = () => {
    setTitle('')
    setDescription('')
    setType('personal')
    setThemeId(themes[0].id)
    setCoverImage([])
  }

  const handleSave = () => {
    if (!title.trim()) return
    onCreate({
      title: title.trim(),
      description: description.trim(),
      type,
      themeId,
      coverImage: coverImage[0] || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=560&fit=crop',
      isShared: type !== 'personal',
    })
    reset()
    onClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <VisualEditorShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Design Your Volume"
      onSave={handleSave}
      saveLabel="Create Volume"
      saveDisabled={!title.trim()}
    >
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Book cover preview mockup left column */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 relative flex flex-col items-center"
        >
          <p className="text-[9px] font-semibold text-ink-muted uppercase tracking-[0.15em] mb-3 pr-2 font-sans">Cover Preview</p>
          
          <div className="relative w-full max-w-[200px]">
            {/* 3D hardcover binder mockup */}
            <div className="rounded-r-xl rounded-l shadow-[8px_12px_24px_rgba(50,38,31,0.22),-1px_0px_3px_rgba(50,38,31,0.05)] border-l-[10px] border-warm-brown relative overflow-hidden bg-cream aspect-[3/4.2] border border-beige/40">
              {coverImage[0] ? (
                <img src={coverImage[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${selectedTheme.gradient} flex flex-col items-center justify-center p-4`}>
                  <BookOpen className="w-10 h-10 text-ink/20 mb-3" />
                  <span className="text-[9px] text-ink/40 font-bold uppercase tracking-widest select-none font-sans text-center">
                    Select Cover Photo
                  </span>
                </div>
              )}
              
              {/* Cover title bar */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="font-display font-bold text-white text-xs sm:text-sm leading-tight truncate italic">
                  {title || 'Book Title'}
                </p>
              </div>
            </div>

            {/* Gold corners (All four) */}
            <div className="absolute -left-1 top-0 w-2.5 h-2.5 border-t-2 border-l-2 border-gold rounded-tl-sm" />
            <div className="absolute -left-1 bottom-0 w-2.5 h-2.5 border-b-2 border-l-2 border-gold rounded-bl-sm" />
            <div className="absolute -right-1.5 top-0 w-2.5 h-2.5 border-t-2 border-r-2 border-gold rounded-tr-sm" />
            <div className="absolute -right-1.5 bottom-0 w-2.5 h-2.5 border-b-2 border-r-2 border-gold rounded-br-sm" />
          </div>
        </motion.div>

        {/* Input fields right column */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 space-y-6"
        >
          {/* Cover photo uploader */}
          <div>
            <p className="text-[9px] font-semibold text-ink-muted uppercase tracking-[0.15em] mb-2 pl-0.5 font-sans">Cover Image</p>
            <ImageCanvas
              images={coverImage}
              onImagesChange={setCoverImage}
              multiple={false}
              aspect="3/4"
              emptyLabel="Choose a cover photo"
              emptyHint="The face of your story — PNG, JPG, or JPEG"
            />
          </div>

          {/* Book title and description */}
          <div className="bg-paper/30 p-4.5 rounded-xl border border-beige/95 shadow-[inset_0_1.5px_3px_rgba(50,38,31,0.03)] space-y-3 font-sans">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this volume a name..."
              className="
                w-full bg-transparent border-none outline-none
                font-display text-xl sm:text-2xl font-bold text-ink italic
                placeholder:text-brown-light/45
              "
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What stories will live inside these pages?"
              rows={2}
              className="
                w-full bg-transparent border-none outline-none resize-none
                text-ink-muted text-xs sm:text-sm leading-relaxed
                placeholder:text-brown-light/45
              "
            />
          </div>

          {/* Book Type pill selection */}
          <div>
            <p className="text-[9px] font-bold text-ink-muted uppercase tracking-widest mb-2 pl-0.5 font-sans">Book Type</p>
            <div className="flex flex-wrap gap-2">
              {bookTypes.map((bt) => {
                const Icon = iconMap[bt.id] || Sparkles
                return (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => setType(bt.id)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-sans border transition-all cursor-pointer
                      ${type === bt.id
                        ? 'bg-soft-pink/15 border-pink-accent/40 text-pink-accent ring-1 ring-pink-accent/10'
                        : 'bg-paper text-ink-muted border-beige/95 hover:border-pink-accent/30 hover:text-ink'
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{bt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mini Theme swatches scroll picker */}
          <div>
            <p className="text-[9px] font-bold text-ink-muted uppercase tracking-widest mb-2 pl-0.5 font-sans">Book Theme</p>
            <div className="flex gap-2.5 overflow-x-auto pb-2 pl-0.5 scrollbar-thin">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setThemeId(theme.id)}
                  className={`
                    flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden relative cursor-pointer
                    transition-all border
                    ${themeId === theme.id
                      ? 'border-pink-accent/65 border-2 scale-102'
                      : 'opacity-85 border-beige/95 hover:opacity-100'
                    }
                  `}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
                  <span className={`relative z-10 text-[9px] font-bold p-1.5 block font-display ${theme.pattern === 'stars' ? 'text-white' : 'text-ink'}`}>
                    {theme.name}
                  </span>
                  {/* Colors dots */}
                  <div className="absolute bottom-1.5 left-1.5 z-10 flex gap-0.5">
                    {theme.colors.slice(0, 3).map((c, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full border border-white/50" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </motion.div>
      </div>
    </VisualEditorShell>
  )
}
