import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function NavItem({
  icon: Icon,
  label,
  to,
  active,
  compact = false,
  onClick,
  className = '',
}) {
  const baseClasses = compact
    ? 'group flex w-full flex-col items-center gap-1.5 rounded-2xl px-3 py-2 text-[11px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-pink-accent/45'
    : 'group flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-pink-accent/45'

  const content = (
    <>
      {active && (
        <motion.span
          layoutId={compact ? 'mobile-nav-active' : 'desktop-nav-active'}
          className="absolute inset-0 rounded-2xl bg-paper-warm border border-beige/70 shadow-[0_10px_24px_rgba(44,40,37,0.08)]"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      )}
      <motion.span
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.96 }}
        className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${active
          ? 'border-pink-accent/25 bg-pink-accent/10 text-pink-accent'
          : 'border-transparent bg-cream-dark/35 text-ink-muted group-hover:bg-cream-dark/60 group-hover:text-ink'
          }`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </motion.span>
      <span className={`relative z-10 ${active ? 'text-ink' : 'text-ink-muted group-hover:text-ink'}`}>
        {label}
      </span>
    </>
  )

  return (
    <Link
      to={to}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`${baseClasses} ${active ? 'text-ink' : 'text-ink-muted hover:text-ink'} relative overflow-hidden ${className}`}
    >
      {content}
    </Link>
  )
}
