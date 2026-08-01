import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Calendar, Smile, Pencil, Trash2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import MemoryCard from '../components/MemoryCard'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import AddMemoryModal from '../components/AddMemoryModal'
import EditMemoryModal from '../components/EditMemoryModal'
import { useApp } from '../context/AppContext'
import { moods } from '../data/mockData'

export default function MemoryTimeline() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const { books, addMemory, getBookMemories, updateMemory, deleteMemory } = useApp()
  const [showAddMemory, setShowAddMemory] = useState(false)
  const [showEditMemory, setShowEditMemory] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedMemory, setSelectedMemory] = useState(null)
  const [selectedMood, setSelectedMood] = useState('all')

  const book = books.find((b) => b.id === bookId)
  const bookMemories = getBookMemories(bookId)

  if (!book) {
    return (
      <div className="min-h-screen paper-texture flex items-center justify-center px-5">
        <div className="text-center scrapbook-card p-10 rounded-3xl max-w-sm">
          <p className="text-ink-muted mb-6 font-sans">This volume seems to have wandered off the shelf.</p>
          <Button onClick={() => navigate('/dashboard')}>Return to Bookshelf</Button>
        </div>
      </div>
    )
  }

  const handleEditMemory = (memory) => {
    setSelectedMemory(memory)
    setShowEditMemory(true)
  }

  const handleDeleteMemory = (memory) => {
    setSelectedMemory(memory)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteMemory = () => {
    if (selectedMemory) {
      deleteMemory(selectedMemory.id, bookId)
      setShowDeleteConfirm(false)
      setSelectedMemory(null)
    }
  }

  const handleUpdateMemory = (updates) => {
    if (selectedMemory) {
      updateMemory(selectedMemory.id, updates)
      setShowEditMemory(false)
      setSelectedMemory(null)
    }
  }
  return (
    <div className="min-h-screen paper-texture">
      <Navbar />

      <main className="max-w-4xl mx-auto px-5 sm:px-8 pt-28 pb-32 sm:pb-24">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <Link
            to={`/books/${bookId}`}
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-pink-accent hover:underline mb-6 font-sans"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to {book.title}
          </Link>

          <p className="font-handwritten text-2xl text-pink-accent/70 mb-3">a story in moments</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-ink leading-tight mb-4">
            Memory Timeline
          </h1>
          <p className="text-ink-muted text-sm sm:text-base font-sans">
            {bookMemories.length} cherished moments preserved in this volume.
          </p>

          <Button onClick={() => setShowAddMemory(true)} size="sm" className="mt-8">
            <Plus className="w-4 h-4" /> Add Moment
          </Button>
        </motion.div>

        {bookMemories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-col items-center gap-3 mb-16 font-sans"
          >
          </motion.div>
        )}

        {bookMemories.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="A blank page awaits"
            description="Every great story begins with a single moment. Capture your first memory — a photo, a feeling, a day you'll never forget."
            actionLabel="Capture a Memory"
            onAction={() => setShowAddMemory(true)}
          />
        ) : (
          <div className="relative">
            <div className="absolute left-1/2 top-6 bottom-10 w-[2px] stitch-line hidden sm:block -translate-x-1/2 opacity-50" />

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {bookMemories.map((memory, i) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.4 }}
                    layout
                    className="group relative"
                  >
                    <MemoryCard memory={memory} index={i} />
                    
                    {/* Edit/Delete buttons on hover */}
                    <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 sm:hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditMemory(memory)
                        }}
                        className="p-2 bg-paper/90 hover:bg-pink-accent/90 rounded-full shadow-md backdrop-blur-sm transition-colors"
                        title="Edit memory"
                      >
                        <Pencil className="w-4 h-4 text-ink" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteMemory(memory)
                        }}
                        className="p-2 bg-paper/90 hover:bg-red-500/90 rounded-full shadow-md backdrop-blur-sm transition-colors"
                        title="Delete memory"
                      >
                        <Trash2 className="w-4 h-4 text-ink" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center pt-16"
            >
              <span className="text-3xl select-none">✨</span>
              <p className="font-handwritten text-2xl sm:text-3xl font-bold text-ink-muted/70 mt-3 select-none">...and the story continues</p>
            </motion.div>
          </div>
        )}
      </main>

      <AddMemoryModal
        isOpen={showAddMemory}
        onClose={() => setShowAddMemory(false)}
        onSave={addMemory}
        bookId={bookId}
      />

      <EditMemoryModal
        isOpen={showEditMemory}
        onClose={() => {
          setShowEditMemory(false)
          setSelectedMemory(null)
        }}
        onSave={handleUpdateMemory}
        memory={selectedMemory}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="scrapbook-card rounded-[24px] p-8 max-w-md w-full bg-paper shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-ink mb-2">Delete Memory?</h3>
              <p className="text-ink-muted text-sm">
                Are you sure you want to delete "{selectedMemory?.title}"? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setSelectedMemory(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteMemory}
              >
                Delete Memory
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
