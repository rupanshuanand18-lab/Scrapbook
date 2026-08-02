import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import MoodBadge from './MoodBadge'
import ImageCarousel from './ImageCarousel'

export default function MemoryCard({ memory, index = 0, onEdit, onDelete }) {
  const isLeft = index % 2 === 0
  const rotationDegrees = index % 2 === 0 ? -1.8 : 1.6

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -50 : 50, y: 35 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex w-full mb-20 sm:mb-24 ${isLeft ? 'justify-start' : 'justify-end'
        }`}
    >
      <div
        className={`w-full max-w-lg ${isLeft ? 'pr-8 sm:pr-24' : 'pl-8 sm:pl-24'
          }`}
      >
        <motion.div
          whileHover={{ y: -8, rotate: rotationDegrees * 0.4, scale: 1.012 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative polaroid-frame p-5 pb-10 rounded-sm flex flex-col paper-fold-corner"
          style={{ rotate: `${rotationDegrees}deg` }}
        >
          {/* Edit/Delete buttons - visible on all screen sizes */}
          <div className="absolute top-3 right-3 z-30 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.()
              }}
              className="p-2 bg-paper/90 hover:bg-pink-accent/90 rounded-full shadow-md backdrop-blur-sm transition-colors"
              title="Edit memory"
              aria-label="Edit memory"
            >
              <Pencil className="w-4 h-4 text-ink" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.()
              }}
              className="p-2 bg-paper/90 hover:bg-red-500/90 rounded-full shadow-md backdrop-blur-sm transition-colors"
              title="Delete memory"
              aria-label="Delete memory"
            >
              <Trash2 className="w-4 h-4 text-ink" />
            </button>
          </div>

          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-5 washi-tape-accent z-20 pointer-events-none rotate-[1.5deg] opacity-85" />

          {/* Image Carousel */}
          {memory.images?.length > 0 && (
            <div className="rounded-xs overflow-hidden border border-beige/35">
              <ImageCarousel
                images={memory.images}
                aspect="4/3"
                rounded="rounded-2xl"
                showCounter={true}
                showDots={false}
                counterPosition="bottom-right"
                arrowVariant="modern"
                className="cursor-pointer"
              />
            </div>
          )}

          <div className="pt-6 pb-1 flex flex-col flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-beige/35 font-sans">
              <div className="date-stamp text-base font-bold bg-pink-accent/6 shadow-[0_1px_3px_rgba(201,123,130,0.06)]">
                {new Date(memory.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <MoodBadge moodId={memory.mood} size="sm" />
            </div>
            <h3 className="font-display text-2xl sm:text-[1.65rem] font-semibold text-ink leading-tight mb-3">
              {memory.title}
            </h3>
            <p className="text-ink-muted text-sm leading-relaxed font-sans">
              {memory.description}
            </p>
          </div>
        </motion.div>
      </div>

      <div
        className={`
          absolute top-12 w-4 h-4 rounded-full bg-pink-accent border-[3px] border-cream
          shadow-[0_2px_8px_rgba(201,123,130,0.35)] z-20 hidden sm:block transition-all duration-300
          hover:scale-130
          ${isLeft ? 'right-1/2 translate-x-1/2' : 'left-1/2 -translate-x-1/2'}
        `}
      />
    </motion.div>
  )
}
