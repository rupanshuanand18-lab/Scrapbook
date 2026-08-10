import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Button from './ui/Button'

export default function VisualEditorShell({
  isOpen,
  onClose,
  title,
  onSave,
  saveLabel = 'Save',
  saveDisabled = false,
  children,
  showHeader = true,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[50] flex flex-col bg-cream/60 backdrop-blur-sm"
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] sunlight-orb rounded-full blur-3xl animate-glow" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-lavender/8 rounded-full blur-3xl" />
          </div>

          {showHeader && (
            <header className="relative z-50 shrink-0 flex items-center justify-between px-5 sm:px-8 py-4 border-b border-beige/45 glass-panel">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-ink-muted hover:text-pink-accent transition-colors cursor-pointer px-3 py-2 rounded-xl hover:bg-cream-dark/50 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] font-sans"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Go Back</span>
              </button>

              <h2 className="font-display text-base sm:text-xl font-semibold text-ink absolute left-1/2 -translate-x-1/2 leading-tight">
                {title}
              </h2>

              <Button size="sm" onClick={onSave} disabled={saveDisabled}>
                {saveLabel}
              </Button>
            </header>
          )}

          <div className="relative z-10 flex-1 min-h-0 overflow-y-auto py-8 sm:py-12 px-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-4xl mx-auto grid md:grid-cols-12 items-stretch scrapbook-card rounded-[32px] overflow-hidden min-h-[520px] sunlight-glow"
            >
              <div className="hidden md:flex md:col-span-1 border-r border-beige/40 bg-parchment/60 flex-col items-center justify-around py-10 relative">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="relative w-full flex justify-end pr-3">
                    <div className="w-9 h-5 rounded-full border-t-[3px] border-b-[3px] border-l-[3px] border-gold/70 bg-transparent rotate-12 shadow-[0_1px_3px_rgba(201,168,76,0.2)]" />
                    <div className="absolute right-1 top-1 w-2.5 h-2.5 rounded-full bg-stone-800/25 shadow-inner-sm" />
                  </div>
                ))}
              </div>

              <div className="col-span-12 md:col-span-11 p-6 sm:p-10 md:p-12 notebook-paper-lined">
                {children}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
