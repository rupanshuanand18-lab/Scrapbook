// BookCard.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, Book } from 'lucide-react'
import { getThemeById } from '../data/mockData'

export default function BookCard({ book, index = 0, shelf = false }) {
  const theme = getThemeById(book.themeId)
  const shelfRotation = shelf ? (index % 3 === 0 ? -1.2 : index % 3 === 1 ? 0.8 : -0.4) : 0

  return (
    <Link to={`/books/${book.id}`} className="block h-full w-full">
      <motion.div
        initial={{ opacity: 0, y: 28, rotate: shelfRotation }}
        animate={{ opacity: 1, y: 0, rotate: shelfRotation }}
        transition={{ delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full font-sans [transform-style:preserve-3d]"
      >
        {/* Single hover source (CSS group-hover) — no more conflicting motion whileHover.
            Fluid sizing: fills its shelf cell on the shelf, self-sizes standalone. */}
        <div
          className={`group relative cursor-pointer [transform-style:preserve-3d] transition-transform duration-500 ease-out hover:[transform:rotateY(-18deg)_rotateX(2deg)_translateY(-12px)_scale(1.02)] ${
            shelf ? 'aspect-[3/4.2] w-full' : 'mx-auto aspect-[3/4.2] w-full max-w-[180px]'
          }`}
        >
          {/* Ground shadow — anchors the book to the shelf and responds to hover */}
          <div className="absolute -bottom-3 left-1/2 z-0 h-3 w-4/5 -translate-x-1/2 rounded-[50%] bg-black/25 blur-[5px] transition-all duration-500 group-hover:w-3/5 group-hover:bg-black/20" />

          {/* Page block on the right edge — size-independent replacement for the old
              fixed translateZ(202px) edge, which only worked at 210px width */}
          <div className="absolute -right-1.5 bottom-1 top-1 z-0 w-2 rounded-r-sm bg-[repeating-linear-gradient(to_bottom,#f8f4e9_0px,#f8f4e9_2px,#ddd5c3_3px)] shadow-[inset_-2px_0_3px_rgba(0,0,0,0.15)]" />

          {/* Cover */}
          <div className="absolute inset-0 z-10 overflow-hidden rounded-r-xl rounded-l-[3px] border border-black/15 bg-white shadow-[8px_12px_24px_rgba(0,0,0,0.28)] transition-shadow duration-500 group-hover:shadow-[16px_22px_40px_rgba(0,0,0,0.36)]">
            <img
              src={book.coverImage}
              alt={book.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />

            {/* Spine shading */}
            <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-[12px] bg-gradient-to-r from-black/30 via-white/5 to-transparent" />
            <div className="pointer-events-none absolute bottom-0 left-[12px] top-0 z-10 w-[2px] bg-black/10" />
            <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-[4px] bg-beige/50" />

            {/* Gold corner ticks */}
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-2.5 w-2.5 rounded-tl-[2px] border-l border-t border-gold/80" />
            <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-2.5 w-2.5 rounded-bl-[2px] border-b border-l border-gold/80" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-2.5 w-2.5 rounded-tr-[2px] border-r border-t border-gold/80" />
            <div className="pointer-events-none absolute bottom-0 right-0 z-10 h-2.5 w-2.5 rounded-br-[2px] border-b border-r border-gold/80" />

            {/* Legibility gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-75 transition-opacity duration-500 group-hover:opacity-90" />

            {/* Shared / Personal badge */}
            <div className="absolute right-2 top-2 z-20 sm:right-3 sm:top-3">
              {book.isShared ? (
                <span className="flex items-center gap-1 rounded-[3px] border border-beige/50 bg-paper/90 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-ink shadow-sm backdrop-blur-[2px]">
                  <Users className="h-2.5 w-2.5 text-pink-accent" />
                  <span>Shared</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-[3px] border border-beige/50 bg-paper/90 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-ink shadow-sm backdrop-blur-[2px]">
                  <Book className="h-2.5 w-2.5 text-brown-light" />
                  <span>Personal</span>
                </span>
              )}
            </div>

            {/* Title + theme — type scales with screen size */}
            <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-end p-3 sm:p-4">
              <p className="line-clamp-2 font-display text-[13px] font-semibold leading-tight text-paper drop-shadow-md sm:text-sm lg:text-base">
                {book.title}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5 opacity-90">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: theme.colors[0] }}
                />
                <span className="truncate text-[9px] font-semibold uppercase tracking-[0.15em] text-paper/85">
                  {theme.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
