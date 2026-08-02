import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Edit3, Eye, Plus, Palette, Trash2, Pencil } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/ui/Button'
import AddMemoryModal from '../components/AddMemoryModal'
import EditMemoryModal from '../components/EditMemoryModal'
import EditBookModal from '../components/EditBookModal'
import ImageCarousel from '../components/ImageCarousel'
import { useApp } from '../context/AppContext'
import { getThemeById, getUserById } from '../data/mockData'

export default function BookDetail() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const { books, addMemory, getBookMemories, updateMemory, deleteMemory } = useApp()
  const [showAddMemory, setShowAddMemory] = useState(false)
  const [showEditBook, setShowEditBook] = useState(false)
  const [showEditMemory, setShowEditMemory] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedMemory, setSelectedMemory] = useState(null)

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

  const book = books.find((b) => b.id === bookId)

  if (!book) {
    return (
      <div className="min-h-screen paper-texture flex items-center justify-center px-5">
        <div className="text-center scrapbook-card p-10 rounded-3xl max-w-sm" style={{ rotate: '-0.5deg' }}>
          <p className="text-ink-muted mb-6 font-sans">This volume seems to have wandered off the shelf.</p>
          <Button onClick={() => navigate('/dashboard')}>Return to Bookshelf</Button>
        </div>
      </div>
    )
  }

  const theme = getThemeById(book.themeId)
  const owner = getUserById(book.ownerId)
  const collaborators = book.collaboratorIds.map(getUserById).filter(Boolean)
  const bookMemories = getBookMemories(bookId)

  // Remove unused variables warning - they may be used in future features
  void owner
  void collaborators

  return (
    <div className="min-h-screen paper-texture">
      <Navbar />

      <section className="relative pt-16">
        <div className="h-60 sm:h-[19rem] lg:h-[21rem] overflow-hidden relative">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover blur-[3px] scale-105 opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/40 to-ink/15" />
        </div>

        <div className="max-w-4xl mx-auto px-5 sm:px-8 -mt-40 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="scrapbook-card rounded-[36px] p-7 sm:p-10 relative paper-clip paper-fold-corner sunlight-glow"
            style={{ rotate: '0.2deg' }}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-28 h-44 sm:w-36 sm:h-52 rounded-r-xl rounded-l-sm overflow-hidden shadow-book flex-shrink-0 -mt-20 sm:-mt-28 border-4 border-paper border-l-[10px] border-l-warm-brown mx-auto md:mx-0 z-20 relative">
                <img src={book.coverImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-black/25" />
                <div className="absolute left-0 top-0 w-2.5 h-2.5 border-t border-l border-gold/80 rounded-tl-xs" />
                <div className="absolute left-0 bottom-0 w-2.5 h-2.5 border-b border-l border-gold/80 rounded-bl-xs" />
                <div className="absolute right-0 top-0 w-2.5 h-2.5 border-t border-r border-gold/80 rounded-tr-xs" />
                <div className="absolute right-0 bottom-0 w-2.5 h-2.5 border-b border-r border-gold/80 rounded-br-xs" />
              </div>

              <div className="flex-1 text-center md:text-left space-y-5 font-sans">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="px-3 py-1 rounded-full bg-cream-dark/50 text-[9px] font-semibold uppercase tracking-[0.15em] text-ink border border-beige/60">
                    {book.type}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-soft-pink/12 text-[9px] font-semibold uppercase tracking-[0.15em] text-pink-accent border border-pink-accent/20 flex items-center gap-1.5">
                    <Palette className="w-3 h-3" /> {theme.name}
                  </span>
                </div>

                <div>
                  <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink leading-tight">
                    {book.title}
                  </h1>
                  <p className="text-ink-muted text-sm sm:text-base mt-3 max-w-xl leading-relaxed">{book.description}</p>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-3 text-[10px] text-brown-light font-semibold uppercase tracking-[0.15em]">
                  <span>{book.memoryCount} moments preserved</span>
                  <span>·</span>
                  <span>Opened {new Date(book.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
                  <Button onClick={() => setShowAddMemory(true)} size="sm">
                    <Plus className="w-4 h-4" /> Add Moment
                  </Button>
                  <Link to={`/books/${bookId}/timeline`}>
                    <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> View Timeline
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditBook(true)}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" /> Edit Volume
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-16 pb-32 md:pb-24 gap-10 items-start">

        <div className=" space-y-7">
          <div className="flex items-center justify-between border-b border-beige/35 pb-4">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink leading-tight">Recent Pages</h2>
            <Link to={`/books/${bookId}/timeline`} className="text-[10px] font-semibold uppercase tracking-[0.15em] text-pink-accent hover:underline flex items-center gap-1 font-sans">
              Full Timeline →
            </Link>
          </div>

          {bookMemories.length === 0 ? (
            <div className="text-center py-24 scrapbook-card rounded-[36px] border border-beige/40 flex flex-col items-center relative overflow-hidden" style={{ rotate: '-0.3deg' }}>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-5 washi-tape-accent pointer-events-none opacity-80" />
              <span className="text-5xl mb-5 select-none">📸</span>
              <p className="text-ink-muted text-base mb-8 font-display font-semibold">This volume awaits its first moment.</p>
              <Button onClick={() => setShowAddMemory(true)} size="sm">Capture a Memory</Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-8">
              {bookMemories.slice(0, 4).map((memory, index) => {
                const rotation = index % 2 === 0 ? -1.5 : 1.4
                return (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -8, rotate: rotation * 0.4, scale: 1.012 }}
                    className="polaroid-frame p-3.5 pb-9 rounded-sm relative overflow-hidden group"
                    style={{ rotate: `${rotation}deg` }}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4.5 washi-tape pointer-events-none opacity-85 z-20 rotate-[1deg]" />

                    {/* Edit/Delete buttons on hover */}
                    <div className="absolute top-2 right-2 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditMemory(memory)
                        }}
                        className="p-2 bg-paper/90 hover:bg-pink-accent/90 rounded-full shadow-md backdrop-blur-sm transition-colors"
                        title="Edit memory"
                      >
                        <Pencil className="w-3.5 h-3.5 text-ink" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteMemory(memory)
                        }}
                        className="p-2 bg-paper/90 hover:bg-red-500/90 rounded-full shadow-md backdrop-blur-sm transition-colors"
                        title="Delete memory"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-ink" />
                      </button>
                    </div>

                    {memory.images?.length > 0 && (
                      <div className="aspect-square overflow-hidden rounded-xs border border-beige/30">
                        <ImageCarousel
                          images={memory.images}
                          aspect="1/1"
                          rounded="rounded-none"
                          showCounter={true}
                          showDots={false}
                          counterPosition="bottom-right"
                          arrowVariant="modern"
                          className="h-full"
                        />
                      </div>
                    )}
                    <div className="pt-5 font-sans">
                      <div className="flex items-center gap-2 text-[9px] text-brown-light/80 font-semibold uppercase tracking-[0.12em]">
                        <Calendar className="w-3 h-3" />
                        <time>{new Date(memory.date).toLocaleDateString()}</time>
                      </div>
                      <h3 className="font-display font-semibold text-ink text-lg line-clamp-1 leading-tight mt-2">
                        {memory.title}
                      </h3>
                      <p className="text-ink-muted text-xs line-clamp-2 mt-2 leading-relaxed">
                        {memory.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
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

      <EditBookModal
        isOpen={showEditBook}
        onClose={() => setShowEditBook(false)}
        bookId={bookId}
        onDeleteComplete={() => navigate('/dashboard')}
      />
    </div>
  )
}
