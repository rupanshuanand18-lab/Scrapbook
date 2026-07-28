import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Trash2, Plus, Camera, ImagePlus, Crop, AlertCircle } from 'lucide-react'
import ImageEditorModal from './ImageEditorModal'

export default function ImageCanvas({
  images = [], // Array of URLs / DataUrls
  onImagesChange,
  multiple = false,
  aspect = '4/3',
  emptyLabel = 'Drop your photo here',
  emptyHint = 'or click to browse',
  variant = 'polaroid' // 'polaroid' | 'avatar' | 'cover' | 'default'
}) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingFiles, setEditingFiles] = useState([])
  const [editIndex, setEditIndex] = useState(null) // If editing an existing single image
  const [validationError, setValidationError] = useState('')

  // Handle selected files
  const validateAndAddFiles = (files) => {
    setValidationError('')
    const imageFiles = Array.from(files)
    const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
    const rejectedFiles = []
    const acceptedFiles = []

    for (let f of imageFiles) {
      if (!validTypes.includes(f.type)) {
        rejectedFiles.push(f.name)
        continue
      }
      if (f.size > 20 * 1024 * 1024) {
        setValidationError(`"${f.name}" is too large. Max size is 20MB.`)
        return
      }
      acceptedFiles.push(f)
    }

    if (rejectedFiles.length > 0) {
      setValidationError(`Unsupported file type(s): ${rejectedFiles.join(', ')}. Use PNG, JPG, or WEBP.`)
      return
    }

    if (acceptedFiles.length === 0) return

    // Launch Editor modal with these files
    setEditingFiles(acceptedFiles)
    setEditIndex(null) // we are adding new files
    setEditorOpen(true)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    validateAndAddFiles(e.dataTransfer.files)
  }

  const removeAt = (index, e) => {
    if (e) e.stopPropagation()
    onImagesChange(images.filter((_, i) => i !== index))
  }

  // HTML5 Drag and Drop Reordering
  const [draggedIdx, setDraggedIdx] = useState(null)

  const handleDragStart = (e, index) => {
    setDraggedIdx(index)
    e.dataTransfer.setData('text/plain', index)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDropReorder = (e, targetIdx) => {
    e.preventDefault()
    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'))
    if (isNaN(fromIdx) || fromIdx === targetIdx) return

    const reordered = [...images]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(targetIdx, 0, moved)
    onImagesChange(reordered)
    setDraggedIdx(null)
  }

  // Edit existing image handler
  const handleEditExisting = (index, e) => {
    e.stopPropagation()
    setEditingFiles([images[index]])
    setEditIndex(index)
    setEditorOpen(true)
  }

  // Editor complete callback
  const handleSaveComplete = (processedUrls) => {
    if (editIndex !== null) {
      // Replacing or editing a specific existing image
      const updated = [...images]
      updated[editIndex] = processedUrls[0]
      onImagesChange(updated)
    } else {
      // Adding new files
      onImagesChange(multiple ? [...images, ...processedUrls] : [processedUrls[0]])
    }
  }

  const aspectClass = aspect === '3/4' ? 'aspect-[3/4.2]' : aspect === '3/1' ? 'aspect-[3/1]' : 'aspect-[4/3]'

  // Render variant styles
  if (variant === 'avatar') {
    const avatarUrl = images[0]
    return (
      <div className="relative group flex flex-col items-center">
        {validationError && (
          <p className="absolute -top-10 text-[10px] text-rose-500 bg-paper px-3 py-1 rounded-full border border-rose-200 shadow-sm flex items-center gap-1 z-10 animate-bounce">
            <AlertCircle className="w-3 h-3" /> {validationError}
          </p>
        )}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative h-32 w-32 rounded-full border-4 bg-cream-dark shadow-xl cursor-pointer overflow-hidden transition-all duration-300
            ${dragOver ? 'border-pink-accent scale-105 ring-4 ring-pink-accent/20' : 'border-paper group-hover:border-pink-accent/30'}
          `}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="w-full h-full bg-cream-dark flex items-center justify-center text-ink-muted">
              <Camera className="w-8 h-8 opacity-40" />
            </div>
          )}
          {/* Overlay controls on hover */}
          <div className="absolute inset-0 bg-ink/35 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300 gap-1.5">
            {avatarUrl ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => handleEditExisting(0, e)}
                  className="p-1.5 rounded-full bg-paper hover:bg-pink-accent hover:text-white text-ink transition-all shadow-sm"
                  title="Edit Photo"
                >
                  <Crop className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                  className="p-1.5 rounded-full bg-paper hover:bg-pink-accent hover:text-white text-ink transition-all shadow-sm"
                  title="Replace Photo"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-white font-bold uppercase tracking-wider">Upload</span>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => validateAndAddFiles(e.target.files)}
        />

        {/* Editing Modal Portal */}
        <ImageEditorModal
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          initialFiles={editingFiles}
          onSaveComplete={handleSaveComplete}
          aspectRatio="1:1"
        />
      </div>
    )
  }

  if (variant === 'cover') {
    const coverUrl = images[0]
    return (
      <div className="relative group w-full">
        {validationError && (
          <p className="absolute top-4 left-4 text-[10px] text-rose-500 bg-paper px-3 py-1 rounded-full border border-rose-200 shadow-sm flex items-center gap-1 z-10 animate-bounce">
            <AlertCircle className="w-3 h-3" /> {validationError}
          </p>
        )}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative w-full aspect-[3/1] min-h-44 overflow-hidden bg-cream-dark cursor-pointer transition-all duration-400 border-2 border-dashed
            ${dragOver ? 'border-pink-accent bg-soft-pink/15 scale-[1.01]' : 'border-transparent'}
          `}
        >
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="h-full w-full object-cover" />
          ) : (
            <div className="w-full h-full bg-cream-dark flex flex-col items-center justify-center text-ink-muted gap-2">
              <ImagePlus className="w-8 h-8 opacity-45 text-pink-accent" />
              <span className="text-xs font-semibold">Drag or click to choose cover</span>
            </div>
          )}
          {/* Controls overlay */}
          <div className="absolute inset-0 bg-ink/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4 gap-2">
            {coverUrl && (
              <>
                <button
                  type="button"
                  onClick={(e) => handleEditExisting(0, e)}
                  className="px-3.5 py-1.5 rounded-full bg-paper/95 text-ink text-xs font-semibold shadow-card cursor-pointer hover:bg-pink-accent hover:text-white transition-all flex items-center gap-1"
                >
                  <Crop className="w-3.5 h-3.5" /> Edit Cover
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                  className="px-3.5 py-1.5 rounded-full bg-paper/95 text-ink text-xs font-semibold shadow-card cursor-pointer hover:bg-pink-accent hover:text-white transition-all flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" /> Replace
                </button>
              </>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => validateAndAddFiles(e.target.files)}
        />

        <ImageEditorModal
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          initialFiles={editingFiles}
          onSaveComplete={handleSaveComplete}
          aspectRatio="16:9" // ideal aspect ratio for banner cover
        />
      </div>
    )
  }

  // Polaroid / default empty state
  if (images.length === 0) {
    return (
      <div className="relative w-full">
        {validationError && (
          <p className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] text-rose-500 bg-paper px-3 py-1 rounded-full border border-rose-200 shadow-sm flex items-center gap-1 z-10 animate-bounce">
            <AlertCircle className="w-3 h-3" /> {validationError}
          </p>
        )}
        <motion.div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          whileHover={{ scale: 1.005 }}
          className={`
            ${aspectClass} w-full rounded-2xl cursor-pointer
            border-2 border-dashed transition-all duration-400
            flex flex-col items-center justify-center gap-4 p-8 text-center
            ${dragOver
              ? 'border-pink-accent bg-soft-pink/12 scale-[1.01] shadow-card'
              : 'border-beige/80 bg-cream-dark/25 hover:border-pink-accent/50 hover:bg-cream-dark/40 shadow-inner-sm'
            }
          `}
          style={{ rotate: '-0.3deg' }}
        >
          <div className="w-14 h-14 rounded-full bg-paper-warm flex items-center justify-center text-brown-light shadow-card border border-beige/35">
            <Upload className="w-5 h-5 opacity-65" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-ink">{emptyLabel}</p>
            <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">{emptyHint}</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={(e) => validateAndAddFiles(e.target.files)}
          />
        </motion.div>

        <ImageEditorModal
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          initialFiles={editingFiles}
          onSaveComplete={handleSaveComplete}
          aspectRatio={aspect === '3/4' ? '4:5' : '16:9'}
        />
      </div>
    )
  }

  // Polaroid Single display
  if (!multiple || images.length === 1) {
    return (
      <div className="relative w-full">
        {validationError && (
          <p className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] text-rose-500 bg-paper px-3 py-1 rounded-full border border-rose-200 shadow-sm flex items-center gap-1 z-10 animate-bounce">
            <AlertCircle className="w-3 h-3" /> {validationError}
          </p>
        )}
        <div className={`relative ${aspectClass} w-full rounded-2xl overflow-hidden polaroid-frame border border-beige/40 group p-2.5 pb-10`} style={{ rotate: '0.5deg' }}>
          <img src={images[0]} alt="" className="w-full h-full object-cover rounded-lg border border-beige/25" />
          <div className="absolute inset-2.5 rounded-lg bg-black/0 group-hover:bg-black/12 transition-all duration-300" />

          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-16 h-5 washi-tape pointer-events-none z-10" />

          <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              type="button"
              onClick={(e) => handleEditExisting(0, e)}
              className="w-8 h-8 rounded-full bg-paper/95 text-ink flex items-center justify-center cursor-pointer hover:bg-pink-accent hover:text-white transition-all shadow-card"
              title="Edit Image"
            >
              <Crop className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-full bg-paper/95 text-ink text-xs font-semibold shadow-card cursor-pointer hover:bg-paper transition-all"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={(e) => removeAt(0, e)}
              className="w-8 h-8 rounded-full bg-ink/70 text-paper flex items-center justify-center cursor-pointer hover:bg-pink-accent hover:scale-105 transition-all shadow-card"
              title="Remove Photo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => validateAndAddFiles(e.target.files)}
          />
        </div>

        <ImageEditorModal
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          initialFiles={editingFiles}
          onSaveComplete={handleSaveComplete}
          aspectRatio={aspect === '3/4' ? '4:5' : '16:9'}
        />
      </div>
    )
  }

  // Polaroid Multiple display
  return (
    <div className="space-y-5">
      {validationError && (
        <p className="text-[10px] text-rose-500 bg-paper px-3 py-1.5 rounded-full border border-rose-200 shadow-sm flex items-center gap-1 w-max mx-auto">
          <AlertCircle className="w-3 h-3" /> {validationError}
        </p>
      )}

      {/* Primary active preview */}
      <div className={`relative ${aspectClass} w-full rounded-2xl overflow-hidden polaroid-frame border border-beige/40 p-2.5 pb-10`} style={{ rotate: '-0.5deg' }}>
        <img src={images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-16 h-5 washi-tape pointer-events-none z-10" />
      </div>

      {/* Thumbnails grid with HTML5 Drag & Drop reordering support */}
      <div className="flex gap-3 overflow-x-auto pb-2 pl-0.5 scrollbar-thin">
        {images.map((src, i) => (
          <div
            key={i}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDropReorder(e, i)}
            className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 group border shadow-sm transition-all cursor-move ${
              draggedIdx === i ? 'border-pink-accent opacity-30 scale-95' : 'border-beige/40 hover:border-pink-accent/40'
            }`}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
            
            {/* Action overlay */}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => handleEditExisting(i, e)}
                className="w-6 h-6 rounded-full bg-paper hover:bg-pink-accent hover:text-white flex items-center justify-center text-ink cursor-pointer transition-all"
                title="Edit Photo"
              >
                <Crop className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => removeAt(i, e)}
                className="w-6 h-6 rounded-full bg-ink hover:bg-pink-accent hover:text-white flex items-center justify-center text-paper cursor-pointer transition-all"
                title="Delete Photo"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* Plus button to add more images */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-16 h-16 rounded-xl border-2 border-dashed border-beige/80 bg-cream-dark/20 flex items-center justify-center text-ink-muted hover:border-pink-accent hover:text-pink-accent transition-all cursor-pointer flex-shrink-0"
          title="Add photo"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => validateAndAddFiles(e.target.files)}
      />

      <ImageEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        initialFiles={editingFiles}
        onSaveComplete={handleSaveComplete}
        aspectRatio={aspect === '3/4' ? '4:5' : '16:9'}
        multiple
      />
    </div>
  )
}
