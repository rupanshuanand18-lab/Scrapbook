// File: ImageCanvas.jsx
import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Upload, Trash2, Plus, Camera, ImagePlus, Crop, AlertCircle,
  X, RotateCw
} from 'lucide-react'
import ImageEditorModal from './ImageEditorModal'
import ImageCarousel from './ImageCarousel'

// --- Camera Capture Modal (unchanged) ---
function CameraCaptureModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [facingMode, setFacingMode] = useState('environment')
  const [flash, setFlash] = useState(false)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    stopCamera()
    setLoading(true)
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
      setError('Unable to access camera.')
    }
  }, [facingMode, stopCamera])

  useEffect(() => {
    if (isOpen) startCamera()
    else stopCamera()
    return () => stopCamera()
  }, [isOpen, startCamera, stopCamera])

  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  const capture = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/png')
    setFlash(true)
    setTimeout(() => setFlash(false), 150)
    onCapture(dataUrl)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-black rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative aspect-video bg-black">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
              Loading camera...
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm">
              {error}
            </div>
          )}
          <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
          {flash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
              className="absolute inset-0 bg-white pointer-events-none"
            />
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={flipCamera}
            className="absolute top-3 left-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 flex justify-center">
          <button
            onClick={capture}
            disabled={loading || !!error}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition disabled:opacity-50"
          >
            <Camera className="w-8 h-8 text-black" />
          </button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}

// --- Main ImageCanvas component ---
export default function ImageCanvas({
  images = [],
  onImagesChange,
  multiple = false,
  aspect = '4/3',
  emptyLabel = 'Drop your photo here',
  emptyHint = 'or click to browse',
  variant = 'polaroid',
  onEditorOpenChange,
  editorSecondaryActionLabel,
  editorSecondaryAction,
}) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingFiles, setEditingFiles] = useState([])
  const [editIndex, setEditIndex] = useState(null)
  const [validationError, setValidationError] = useState('')
  const [cameraOpen, setCameraOpen] = useState(false)

  let cropAspectRatio = undefined
  if (variant === 'avatar') cropAspectRatio = 1
  else if (variant === 'cover') cropAspectRatio = 3 / 1
  else if (aspect === '3/4') cropAspectRatio = 3 / 4
  else if (aspect === '3/1') cropAspectRatio = 3 / 1
  else if (aspect === '4/3') cropAspectRatio = 4 / 3
  const showPreserveMemory = images.length > 0

  const openEditor = () => {
    setEditorOpen(true)
    onEditorOpenChange?.(true)
  }

  const closeEditor = () => {
    setEditorOpen(false)
    onEditorOpenChange?.(false)
  }

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
      setValidationError(
        `Unsupported file type(s): ${rejectedFiles.join(', ')}. Use PNG, JPG, or WEBP.`
      )
      return
    }
    if (acceptedFiles.length === 0) return
    setEditingFiles(acceptedFiles)
    setEditIndex(null)
    openEditor()
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

  const [draggedIdx, setDraggedIdx] = useState(null)
  const handleDragStart = (e, index) => {
    setDraggedIdx(index)
    e.dataTransfer.setData('text/plain', index)
  }
  const handleDragOver = (e) => e.preventDefault()
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

  const handleEditExisting = (index, e) => {
    e.stopPropagation()
    setEditingFiles([images[index]])
    setEditIndex(index)
    openEditor()
  }

  const handleSaveComplete = (processedUrls) => {
    if (editIndex !== null) {
      const updated = [...images]
      updated[editIndex] = processedUrls[0]
      onImagesChange(updated)
    } else {
      onImagesChange(multiple ? [...images, ...processedUrls] : [processedUrls[0]])
    }
  }

  const handleCameraCapture = (dataUrl) => {
    setCameraOpen(false)
    setEditingFiles([dataUrl])
    setEditIndex(null)
    openEditor()
  }

  const openFileInput = (e) => {
    e.stopPropagation()
    inputRef.current?.click()
  }

  const aspectClass =
    aspect === '3/4'
      ? 'aspect-[3/4.2]'
      : aspect === '3/1'
        ? 'aspect-[3/1]'
        : 'aspect-[4/3]'

  // ---- Avatar variant ----
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
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative h-32 w-32 rounded-full border-4 bg-cream-dark shadow-xl cursor-pointer overflow-hidden transition-all duration-300 ${dragOver
            ? 'border-pink-accent scale-105 ring-4 ring-pink-accent/20'
            : 'border-paper group-hover:border-pink-accent/30'
            }`}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="w-full h-full bg-cream-dark flex items-center justify-center text-ink-muted">
              <Camera className="w-8 h-8 opacity-40" />
            </div>
          )}
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
                  onClick={openFileInput}
                  className="p-1.5 rounded-full bg-paper hover:bg-pink-accent hover:text-white text-ink transition-all shadow-sm"
                  title="Replace Photo"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCameraOpen(true)
                  }}
                  className="p-1.5 rounded-full bg-paper hover:bg-pink-accent hover:text-white text-ink transition-all shadow-sm"
                  title="Capture Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openFileInput}
                  className="text-[10px] text-white font-bold uppercase tracking-wider bg-black/30 px-2 py-1 rounded-full"
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCameraOpen(true)
                  }}
                  className="text-[10px] text-white font-bold uppercase tracking-wider bg-black/30 px-2 py-1 rounded-full"
                >
                  Capture
                </button>
              </div>
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
          onClose={closeEditor}
          initialFiles={editingFiles}
          onSaveComplete={handleSaveComplete}
          aspectRatio={cropAspectRatio}
          secondaryActionLabel={showPreserveMemory ? 'Preserve Memory' : null}
          onSecondaryAction={showPreserveMemory ? closeEditor : null}
        />
        <CameraCaptureModal
          isOpen={cameraOpen}
          onClose={() => setCameraOpen(false)}
          onCapture={handleCameraCapture}
        />
      </div>
    )
  }

  // ---- Cover variant ----
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
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative w-full aspect-[3/1] min-h-44 overflow-hidden bg-cream-dark cursor-pointer transition-all duration-400 border-2 border-dashed ${dragOver
            ? 'border-pink-accent bg-soft-pink/15 scale-[1.01]'
            : 'border-transparent'
            }`}
        >
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="h-full w-full object-cover" />
          ) : (
            <div className="w-full h-full bg-cream-dark flex flex-col items-center justify-center text-ink-muted gap-2">
              <ImagePlus className="w-8 h-8 opacity-45 text-pink-accent" />
              <span className="text-xs font-semibold">Drag or click to choose cover</span>
            </div>
          )}
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
                  onClick={openFileInput}
                  className="px-3.5 py-1.5 rounded-full bg-paper/95 text-ink text-xs font-semibold shadow-card cursor-pointer hover:bg-pink-accent hover:text-white transition-all flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" /> Replace
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCameraOpen(true)
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-paper/95 text-ink text-xs font-semibold shadow-card cursor-pointer hover:bg-pink-accent hover:text-white transition-all flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" /> Capture
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
          onClose={closeEditor}
          initialFiles={editingFiles}
          onSaveComplete={handleSaveComplete}
          aspectRatio={cropAspectRatio}
          secondaryActionLabel={showPreserveMemory ? 'Preserve Memory' : null}
          onSecondaryAction={showPreserveMemory ? closeEditor : null}
        />
        <CameraCaptureModal
          isOpen={cameraOpen}
          onClose={() => setCameraOpen(false)}
          onCapture={handleCameraCapture}
        />
      </div>
    )
  }

  // ---- Polaroid / default: Empty state ----
  if (images.length === 0) {
    return (
      <div className="relative w-full">
        {validationError && (
          <p className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] text-rose-500 bg-paper px-3 py-1 rounded-full border border-rose-200 shadow-sm flex items-center gap-1 z-10 animate-bounce">
            <AlertCircle className="w-3 h-3" /> {validationError}
          </p>
        )}
        <motion.div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          whileHover={{ scale: 1.005 }}
          className={`${aspectClass} w-full rounded-2xl cursor-pointer border-2 border-dashed transition-all duration-400 flex flex-col items-center justify-center gap-4 p-8 text-center ${dragOver
            ? 'border-pink-accent bg-soft-pink/12 scale-[1.01] shadow-card'
            : 'border-beige/80 bg-cream-dark/25 hover:border-pink-accent/50 hover:bg-cream-dark/40 shadow-inner-sm'
            }`}
          style={{ rotate: '-0.3deg' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-paper-warm flex items-center justify-center text-brown-light shadow-card border border-beige/35">
              <Upload className="w-5 h-5 opacity-65" />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setCameraOpen(true)
              }}
              className="w-14 h-14 rounded-full bg-paper-warm flex items-center justify-center text-brown-light shadow-card border border-beige/35 hover:bg-pink-accent hover:text-white transition-colors"
              title="Capture with camera"
            >
              <Camera className="w-5 h-5" />
            </button>
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
          onClose={closeEditor}
          initialFiles={editingFiles}
          onSaveComplete={handleSaveComplete}
          aspectRatio={cropAspectRatio}
          secondaryActionLabel={showPreserveMemory ? 'Preserve Memory' : null}
          onSecondaryAction={showPreserveMemory ? closeEditor : null}
        />
        <CameraCaptureModal
          isOpen={cameraOpen}
          onClose={() => setCameraOpen(false)}
          onCapture={handleCameraCapture}
        />
      </div>
    )
  }

  // ---- Polaroid / default: Single image ----
  if (!multiple || images.length === 1) {
    return (
      <div className="relative w-full">
        {validationError && (
          <p className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] text-rose-500 bg-paper px-3 py-1 rounded-full border border-rose-200 shadow-sm flex items-center gap-1 z-10 animate-bounce">
            <AlertCircle className="w-3 h-3" /> {validationError}
          </p>
        )}
        <div
          className={`relative ${aspectClass} w-full rounded-2xl overflow-hidden polaroid-frame border border-beige/40 group p-2.5 pb-10`}
          style={{ rotate: '0.5deg' }}
        >
          <img
            src={images[0]}
            alt=""
            className="w-full h-full object-cover rounded-lg border border-beige/25"
          />
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
              onClick={openFileInput}
              className="px-3.5 py-1.5 rounded-full bg-paper/95 text-ink text-xs font-semibold shadow-card cursor-pointer hover:bg-paper transition-all"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={(e) => setCameraOpen(true)}
              className="w-8 h-8 rounded-full bg-paper/95 text-ink flex items-center justify-center cursor-pointer hover:bg-pink-accent hover:text-white transition-all shadow-card"
              title="Capture Photo"
            >
              <Camera className="w-4 h-4" />
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
          onClose={closeEditor}
          initialFiles={editingFiles}
          onSaveComplete={handleSaveComplete}
          aspectRatio={cropAspectRatio}
          secondaryActionLabel={showPreserveMemory ? 'Preserve Memory' : null}
          onSecondaryAction={showPreserveMemory ? closeEditor : null}
        />
        <CameraCaptureModal
          isOpen={cameraOpen}
          onClose={() => setCameraOpen(false)}
          onCapture={handleCameraCapture}
        />
      </div>
    )
  }

  // ---- Polaroid / default: Multiple images (CAROUSEL) ----
  return (
    <div className="space-y-5">
      {validationError && (
        <p className="text-[10px] text-rose-500 bg-paper px-3 py-1.5 rounded-full border border-rose-200 shadow-sm flex items-center gap-1 w-max mx-auto">
          <AlertCircle className="w-3 h-3" /> {validationError}
        </p>
      )}

      {/* Main carousel preview */}
      <div
        className={`relative ${aspectClass} w-full rounded-2xl overflow-hidden polaroid-frame border border-beige/40 p-2.5 pb-10`}
        style={{ rotate: '-0.5deg' }}
      >
        <ImageCarousel
          images={images}
          aspect={aspect === '3/4' ? '3/4' : aspect === '3/1' ? '3/1' : '4/3'}
          rounded="rounded-lg"
          showCounter={true}
          showDots={false}           // no dots, only counter
          counterPosition="bottom-right"
          arrowVariant="modern"
          className="cursor-pointer"
        />
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-16 h-5 washi-tape pointer-events-none z-10" />

        {/* Action buttons */}
        <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button
            type="button"
            onClick={openFileInput}
            className="px-3.5 py-1.5 rounded-full bg-paper/95 text-ink text-xs font-semibold shadow-card cursor-pointer hover:bg-pink-accent hover:text-white transition-all flex items-center gap-1"
          >
            <Upload className="w-3.5 h-3.5" /> Add
          </button>
          <button
            type="button"
            onClick={(e) => setCameraOpen(true)}
            className="w-8 h-8 rounded-full bg-paper/95 text-ink flex items-center justify-center cursor-pointer hover:bg-pink-accent hover:text-white transition-all shadow-card"
            title="Capture Photo"
          >
            <Camera className="w-4 h-4" />
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
      </div>

      {/* Thumbnails strip with drag & drop reordering */}
      <div className="flex gap-3 overflow-x-auto pb-2 pl-0.5 scrollbar-thin">
        {images.map((src, i) => (
          <div
            key={i}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={(e) => handleDragOver(e)}
            onDrop={(e) => handleDropReorder(e, i)}
            className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 group border shadow-sm transition-all cursor-move ${draggedIdx === i
              ? 'border-pink-accent opacity-30 scale-95'
              : 'border-beige/40 hover:border-pink-accent/40'
              }`}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
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
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openFileInput}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-beige/80 bg-cream-dark/20 flex items-center justify-center text-ink-muted hover:border-pink-accent hover:text-pink-accent transition-all cursor-pointer flex-shrink-0"
            title="Add photo"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setCameraOpen(true)}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-beige/80 bg-cream-dark/20 flex items-center justify-center text-ink-muted hover:border-pink-accent hover:text-pink-accent transition-all cursor-pointer flex-shrink-0"
            title="Capture photo"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </div>

      <ImageEditorModal
        isOpen={editorOpen}
        onClose={closeEditor}
        initialFiles={editingFiles}
        onSaveComplete={handleSaveComplete}
        aspectRatio={cropAspectRatio}
        secondaryActionLabel={showPreserveMemory ? (editorSecondaryActionLabel || 'Preserve Memory') : null}
        onSecondaryAction={showPreserveMemory ? (editorSecondaryAction || closeEditor) : null}
        multiple
      />
      <CameraCaptureModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  )
}
