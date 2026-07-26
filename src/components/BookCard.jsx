import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, Book } from 'lucide-react'
import { getThemeById } from '../data/mockData'

export default function BookCard({ book, index = 0, shelf = false }) {
  const theme = getThemeById(book.themeId)
  const shelfRotation = shelf ? (index % 3 === 0 ? -1.2 : index % 3 === 1 ? 0.8 : -0.4) : 0

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 28, rotate: shelfRotation }}
      animate={{ opacity: 1, y: 0, rotate: shelfRotation }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -20,
        rotateY: -12,
        rotate: 0,
        z: 20,
        transition: { duration: 0.35, ease: 'easeOut' }
      }}
      className="group cursor-pointer perspective-[1000px] font-sans"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        className={`
          relative rounded-r-xl rounded-l shadow-book
          transition-all duration-400 overflow-hidden
          group-hover:shadow-book-hover
          ${shelf ? 'w-full aspect-[3/4.2]' : 'w-full aspect-[3/4.2] max-w-[180px]'}
        `}
      >
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        <div className="absolute left-0 top-0 bottom-0 w-[12px] bg-gradient-to-r from-black/30 via-white/5 to-transparent z-10" />
        <div className="absolute left-[12px] top-0 bottom-0 w-[2px] bg-black/12 z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-beige/50 z-10" />

        <div className="absolute left-0 top-0 w-2.5 h-2.5 border-t border-l border-gold/80 rounded-tl-xs z-10" />
        <div className="absolute left-0 bottom-0 w-2.5 h-2.5 border-b border-l border-gold/80 rounded-bl-xs z-10" />
        <div className="absolute right-0 top-0 w-2.5 h-2.5 border-t border-r border-gold/80 rounded-tr-xs z-10" />
        <div className="absolute right-0 bottom-0 w-2.5 h-2.5 border-b border-r border-gold/80 rounded-br-xs z-10" />

        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-75 group-hover:opacity-90 transition-opacity duration-400" />

        <div className="absolute top-3 right-3 z-20">
          {book.isShared ? (
            <span className="flex items-center gap-1 bg-paper/92 text-ink text-[8px] uppercase tracking-[0.12em] font-semibold px-2 py-0.5 rounded-xs shadow-sm border border-beige/50">
              <Users className="w-2.5 h-2.5 text-pink-accent" />
              <span>Shared</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-paper/92 text-ink text-[8px] uppercase tracking-[0.12em] font-semibold px-2 py-0.5 rounded-xs shadow-sm border border-beige/50">
              <Book className="w-2.5 h-2.5 text-brown-light" />
              <span>Personal</span>
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col justify-end">
          <p className="font-display font-semibold text-paper text-sm sm:text-base leading-tight line-clamp-2 drop-shadow-md">
            {book.title}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 opacity-90">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.colors[0] }} />
            <span className="text-[9px] text-paper/85 font-semibold tracking-[0.15em] uppercase">
              {theme.name}
            </span>
          </div>
        </div>
      </div>


    </motion.div>
  )

  return <Link to={`/books/${book.id}`}>{content}</Link>
}
