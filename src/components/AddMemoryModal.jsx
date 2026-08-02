import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Smile } from 'lucide-react'
import VisualEditorShell from './VisualEditorShell'
import ImageCanvas from './ImageCanvas'
import { moods } from '../data/mockData'

export default function AddMemoryModal({ isOpen, onClose, onSave, bookId }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [mood, setMood] = useState('happy')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])

  const reset = () => {
    setTitle('')
    setDate(new Date().toISOString().split('T')[0])
    setMood('happy')
    setDescription('')
    setImages([])
  }

  const handleSave = () => {
    const memoryTitle = title.trim() || 'Untitled Memory'
    onSave({
      bookId,
      title: memoryTitle,
      date,
      mood,
      description: description.trim(),
      images: images.length > 0
        ? images
        : ['https://images.unsplash.com/photo-1493612276216-ee3925520721?w=600&h=400&fit=crop'],
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
      title="Capture a Moment"
      onSave={handleSave}
      saveLabel="Preserve Memory"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Photo collage attachment container */}
        <div>
          <p className="text-[9px] font-semibold text-ink-muted uppercase tracking-[0.15em] mb-2 pl-0.5 font-sans">Attach Photo(s)</p>
          <ImageCanvas
            images={images}
            onImagesChange={setImages}
            multiple
            emptyLabel="Drop your polaroid here"
            emptyHint="A photo that holds the feeling of this moment"
          />
        </div>

        {/* Lined journal sheet editor form fields */}
        <div className="bg-paper/30 p-4 sm:p-6 rounded-xl border border-beige/95 shadow-[inset_0_1.5px_3px_rgba(50,38,31,0.03)] space-y-4 font-sans">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you call this moment?"
            className="
              w-full bg-transparent border-none outline-none
              font-display text-2xl font-bold text-ink italic
              placeholder:text-brown-light/45
            "
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell the story — what made this day unforgettable?"
            rows={4}
            className="
              w-full bg-transparent border-none outline-none resize-none
              text-ink-muted text-xs sm:text-sm leading-relaxed
              placeholder:text-brown-light/45
            "
          />

          <div className="w-full h-px bg-beige/35 my-4" />

          {/* Mood selection and Calendar date selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold tracking-widest text-ink-muted pl-0.5 flex items-center gap-1.5 font-sans">
                <Smile className="w-3.5 h-3.5" /> How did it feel?
              </span>
              <div className="flex flex-wrap gap-2">
                {moods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMood(m.id)}
                    title={m.label}
                    className={`
                      w-9 h-9 rounded-full flex items-center justify-center text-lg
                      transition-all cursor-pointer border
                      ${mood === m.id
                        ? 'ring-2 ring-pink-accent/50 ring-offset-2 scale-110 border-transparent shadow-sm'
                        : 'hover:scale-105 opacity-65 hover:opacity-100 border-beige bg-paper'
                      }
                    `}
                    style={{ backgroundColor: mood === m.id ? m.color : undefined }}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Date selection tag */}
            <div className="self-start sm:self-end">
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-paper border border-beige/95 text-[10px] font-bold uppercase tracking-wider text-ink-muted cursor-pointer hover:text-ink hover:border-pink-accent/35 transition-colors">
                <Calendar className="w-3.5 h-3.5 text-brown-light" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer text-[10px] font-bold uppercase"
                />
              </label>
            </div>
          </div>
        </div>

      </motion.div>
    </VisualEditorShell>
  )
}
