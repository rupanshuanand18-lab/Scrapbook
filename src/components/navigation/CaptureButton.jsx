import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CaptureButton({ active, onClick }) {
  return (
    <motion.div
      className="relative flex justify-center"
      whileHover={{ y: -2 }}
    >
      {active && (
        <motion.span
          layoutId="capture-glow"
          className="absolute inset-0 rounded-full bg-pink-accent/20 blur-xl"
          transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        />
      )}
      <Link
        to="/capture"
        onClick={onClick}
        aria-label="Start capturing a memory"
        aria-current={active ? 'page' : undefined}
        className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-pink-accent/20 bg-gradient-to-br from-pink-accent to-gold text-white shadow-[0_16px_34px_rgba(201,123,130,0.32),0_4px_10px_rgba(122,92,72,0.16)] outline-none transition-transform focus-visible:ring-2 focus-visible:ring-pink-accent/40"
      >
        <motion.span
          whileTap={{ scale: 0.9 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/14 backdrop-blur-sm"
        >
          <Camera className="h-5 w-5" aria-hidden="true" />
        </motion.span>
      </Link>
    </motion.div>
  )
}
