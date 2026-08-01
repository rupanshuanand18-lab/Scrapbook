import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-pink-accent text-paper shadow-[0_2px_0_rgba(122,92,72,0.15),0_6px_16px_rgba(201,123,130,0.3)] hover:shadow-[0_3px_0_rgba(122,92,72,0.18),0_10px_24px_rgba(201,123,130,0.38)] hover:bg-rose-muted focus-visible:ring-2 focus-visible:ring-pink-accent/40 outline-none border border-pink-accent/25',
  secondary: 'bg-paper-warm text-ink border border-beige/80 hover:bg-cream-dark/50 shadow-[0_1px_0_rgba(221,208,192,0.6),0_4px_12px_rgba(44,40,37,0.06)] focus-visible:ring-2 focus-visible:ring-beige outline-none',
  ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-cream-dark/40 focus-visible:ring-2 focus-visible:ring-cream-dark outline-none',
  outline: 'bg-transparent border border-pink-accent/60 text-pink-accent hover:bg-pink-accent/8 focus-visible:ring-2 focus-visible:ring-pink-accent/25 outline-none',
  destructive: 'bg-red-500 text-white shadow-[0_2px_0_rgba(180,0,0,0.15),0_6px_16px_rgba(220,38,38,0.3)] hover:shadow-[0_3px_0_rgba(180,0,0,0.18),0_10px_24px_rgba(220,38,38,0.38)] hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-500/40 outline-none border border-red-500/25',
}

const sizes = {
  sm: 'px-4 py-2 text-xs rounded-xl font-semibold tracking-wide',
  md: 'px-5 py-2.5 text-sm rounded-xl font-semibold tracking-wide',
  lg: 'px-7 py-3.5 text-base rounded-2xl font-semibold tracking-wide',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileHover={disabled ? {} : { scale: 1.012, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        transition-all duration-300 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
}
