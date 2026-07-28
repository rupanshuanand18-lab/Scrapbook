import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Undo,
  Redo,
  RotateCw,
  RotateCcw,
  RefreshCw,
  Check,
  X,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Eye
} from 'lucide-react'

// Default aspect ratio presets
const ASPECT_PRESETS = [
  { id: 'free', label: 'Free' },
  { id: 'original', label: 'Original' },
  { id: '1:1', label: 'Square (1:1)', value: 1 },
  { id: '4:5', label: 'Portrait (4:5)', value: 0.8 },
  { id: '9:16', label: 'Story (9:16)', value: 9 / 16 },
  { id: '16:9', label: 'Landscape (16:9)', value: 16 / 9 }
]

export default function ImageEditorModal({
  isOpen,
  onClose,
  initialFiles = [], // Array of File objects or URL strings
  onSaveComplete, // Callback receiving array of compressed image dataUrls
  aspectRatio = 'free'
}) {
  // Image list state (single source of truth for all edit states)
  const [images, setImages] = useState(() => {
    if (!initialFiles || initialFiles.length === 0) return []
    return initialFiles.map((fileOrUrl) => {
      let src = ''
      let name = 'image.jpg'
      let fileObj = null

      if (typeof fileOrUrl === 'string') {
        src = fileOrUrl
      } else if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
        src = URL.createObjectURL(fileOrUrl)
        name = fileOrUrl.name
        fileObj = fileOrUrl
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        src,
        name,
        file: fileObj,
        zoom: 1,
        rotate: 0,
        pan: { x: 0, y: 0 },
        aspect: aspectRatio,
        cropW: 300,
        cropH: 300,
        naturalRatio: 1
      }
    })
  })

  const [activeIndex, setActiveIndex] = useState(0)

  // Current active image edit states (local variables for 60fps rendering during drags/gestures)
  const [zoom, setZoom] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [activeAspect, setActiveAspect] = useState(aspectRatio)
  const [cropW, setCropW] = useState(300)
  const [cropH, setCropH] = useState(300)

  // Interaction states
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const [isResizingCrop, setIsResizingCrop] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(false)
  const gridTimeoutRef = useRef(null)

  // Undo / Redo history stacks
  const [history, setHistory] = useState(() => {
    if (!initialFiles || initialFiles.length === 0) return []
    return [
      {
        zoom: 1,
        rotate: 0,
        pan: { x: 0, y: 0 },
        cropW: 300,
        cropH: 300,
        aspect: aspectRatio
      }
    ]
  })
  const [historyIndex, setHistoryIndex] = useState(0)

  // Sub-modal overlays
  const [showSavePreview, setShowSavePreview] = useState(false)
  const [savePreviews, setSavePreviews] = useState([])
  const [processingState, setProcessingState] = useState(null) // 'compressing' | 'uploading' | 'success' | null
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  // Refs
  const viewportRef = useRef(null)
  const containerRef = useRef(null)
  const fileInputRef = useRef(null)
  const pinchStartDistRef = useRef(null)
  const pinchStartZoomRef = useRef(null)

  // Get active image edit state (source of truth)
  const activeImage = images[activeIndex] || null

  const changeActiveImage = (index, currentImages = images) => {
    setActiveIndex(index)
    const img = currentImages[index]
    if (img) {
      setZoom(img.zoom || 1)
      setRotate(img.rotate || 0)
      setPan(img.pan || { x: 0, y: 0 })
      setActiveAspect(img.aspect || aspectRatio)
      setCropW(img.cropW || 300)
      setCropH(img.cropH || 300)

      setHistory([
        {
          zoom: img.zoom || 1,
          rotate: img.rotate || 0,
          pan: img.pan ? { ...img.pan } : { x: 0, y: 0 },
          cropW: img.cropW || 300,
          cropH: img.cropH || 300,
          aspect: img.aspect || aspectRatio
        }
      ])
      setHistoryIndex(0)
    }
  }

  // Update current active image state in list and schedule history commit
  const updateActiveImageState = (updates, commit = false) => {
    setImages((prev) =>
      prev.map((img, i) => (i === activeIndex ? { ...img, ...updates } : img))
    )

    if (commit && activeImage) {
      const stateSnapshot = {
        zoom: updates.zoom !== undefined ? updates.zoom : zoom,
        rotate: updates.rotate !== undefined ? updates.rotate : rotate,
        pan: updates.pan !== undefined ? updates.pan : { ...pan },
        cropW: updates.cropW !== undefined ? updates.cropW : cropW,
        cropH: updates.cropH !== undefined ? updates.cropH : cropH,
        aspect: updates.aspect !== undefined ? updates.aspect : activeAspect
      }

      // Truncate forward history
      const newHistory = history.slice(0, historyIndex + 1)
      setHistory([...newHistory, stateSnapshot])
      setHistoryIndex(newHistory.length)
    }
  }

  // Adjust crop aspect ratio box inside viewport (Excluded activeImage to avoid layout thrashing during gestures)
  useEffect(() => {
    if (!viewportRef.current || !activeImage) return

    const rect = viewportRef.current.getBoundingClientRect()
    const maxW = rect.width - 48
    const maxH = rect.height - 48

    const setCropDimensions = (w, h) => {
      const roundedW = Math.round(w)
      const roundedH = Math.round(h)
      setCropW(roundedW)
      setCropH(roundedH)
      setImages((prev) =>
        prev.map((img, i) =>
          i === activeIndex
            ? { ...img, cropW: roundedW, cropH: roundedH }
            : img
        )
      )
    }

    if (activeAspect === 'free') {
      const currentW = Math.min(activeImage.cropW || 300, maxW)
      const currentH = Math.min(activeImage.cropH || 300, maxH)
      if (currentW !== cropW || currentH !== cropH) {
        setCropDimensions(currentW, currentH)
      }
    } else if (activeAspect === 'original') {
      const img = new Image()
      img.src = activeImage.src
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight
        let w = maxW
        let h = w / ratio
        if (h > maxH) {
          h = maxH
          w = h * ratio
        }
        if (Math.round(w) !== cropW || Math.round(h) !== cropH) {
          setCropDimensions(w, h)
        }
      }
    } else {
      const preset = ASPECT_PRESETS.find((p) => p.id === activeAspect)
      if (preset && preset.value) {
        const ratio = preset.value
        let w = maxW
        let h = w / ratio
        if (h > maxH) {
          h = maxH
          w = h * ratio
        }
        if (Math.round(w) !== cropW || Math.round(h) !== cropH) {
          setCropDimensions(w, h)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, activeAspect, activeImage?.src, aspectRatio])

  // Flash grid helper
  const triggerGridAnimation = () => {
    setShowGrid(true)
    if (gridTimeoutRef.current) clearTimeout(gridTimeoutRef.current)
    gridTimeoutRef.current = setTimeout(() => {
      setShowGrid(false)
    }, 1200)
  }

  // History operations
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1
      const state = history[prevIdx]
      setHistoryIndex(prevIdx)
      setZoom(state.zoom)
      setRotate(state.rotate)
      setPan(state.pan)
      setCropW(state.cropW)
      setCropH(state.cropH)
      setActiveAspect(state.aspect)
      setImages((prev) =>
        prev.map((img, i) => (i === activeIndex ? { ...img, ...state } : img))
      )
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1
      const state = history[nextIdx]
      setHistoryIndex(nextIdx)
      setZoom(state.zoom)
      setRotate(state.rotate)
      setPan(state.pan)
      setCropW(state.cropW)
      setCropH(state.cropH)
      setActiveAspect(state.aspect)
      setImages((prev) =>
        prev.map((img, i) => (i === activeIndex ? { ...img, ...state } : img))
      )
    }
  }

  const handleReset = () => {
    const defaultState = {
      zoom: 1,
      rotate: 0,
      pan: { x: 0, y: 0 }
    }
    setZoom(1)
    setRotate(0)
    setPan({ x: 0, y: 0 })
    updateActiveImageState(defaultState, true)
    triggerGridAnimation()
  }

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target
    const ratio = naturalWidth / naturalHeight
    setImages((prev) =>
      prev.map((img, i) => (i === activeIndex ? { ...img, naturalRatio: ratio } : img))
    )
  }

  // Rotate functions
  const handleRotateLeft = () => {
    const nextRotate = (rotate - 90) % 360
    setRotate(nextRotate)
    updateActiveImageState({ rotate: nextRotate }, true)
    triggerGridAnimation()
  }

  const handleRotateRight = () => {
    const nextRotate = (rotate + 90) % 360
    setRotate(nextRotate)
    updateActiveImageState({ rotate: nextRotate }, true)
    triggerGridAnimation()
  }

  // Drag and drop filmstrip handlers (Reordering)
  const [draggedFilmIndex, setDraggedFilmIndex] = useState(null)

  const handleFilmstripDragStart = (e, index) => {
    setDraggedFilmIndex(index)
  }

  const handleFilmstripDragOver = (e) => {
    e.preventDefault()
  }

  const handleFilmstripDrop = (e, index) => {
    e.preventDefault()
    if (draggedFilmIndex === null || draggedFilmIndex === index) return

    const reordered = [...images]
    const [draggedItem] = reordered.splice(draggedFilmIndex, 1)
    reordered.splice(index, 0, draggedItem)

    setImages(reordered)
    // Adjust active index
    let nextActiveIdx = index
    if (activeIndex === draggedFilmIndex) {
      nextActiveIdx = index
    } else if (activeIndex > draggedFilmIndex && activeIndex <= index) {
      nextActiveIdx = activeIndex - 1
    } else if (activeIndex < draggedFilmIndex && activeIndex >= index) {
      nextActiveIdx = activeIndex + 1
    }
    changeActiveImage(nextActiveIdx, reordered)
    setDraggedFilmIndex(null)
  }

  // File picker handler inside the editor
  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files)
    const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
    const added = []

    for (let f of files) {
      if (!validTypes.includes(f.type)) {
        setErrorMessage(`Unsupported format: "${f.name}". Use JPG, PNG or WEBP.`)
        continue
      }
      if (f.size > 20 * 1024 * 1024) {
        setErrorMessage(`File too large: "${f.name}". Max size is 20MB.`)
        continue
      }
      added.push({
        id: Math.random().toString(36).substr(2, 9),
        src: URL.createObjectURL(f),
        name: f.name,
        file: f,
        zoom: 1,
        rotate: 0,
        pan: { x: 0, y: 0 },
        aspect: 'free',
        cropW: 300,
        cropH: 300,
        naturalRatio: 1
      })
    }

    if (added.length > 0) {
      const nextImages = [...images, ...added]
      const nextActiveIdx = images.length
      setImages(nextImages)
      changeActiveImage(nextActiveIdx, nextImages)
    }
  }

  const handleRemovePhoto = (index, e) => {
    e.stopPropagation()
    const filtered = images.filter((_, i) => i !== index)
    if (filtered.length === 0) {
      onClose()
      return
    }
    const nextActiveIdx = Math.max(0, Math.min(activeIndex, filtered.length - 1))
    setImages(filtered)
    changeActiveImage(nextActiveIdx, filtered)
  }

  // Pointer interactions (Pan and Zoom)
  const getPointerPos = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX, y: clientY }
  }

  const handlePointerDown = (e) => {
    if (e.target.closest('.crop-resize-handle')) {
      setIsResizingCrop(true)
      const touch = e.touches ? e.touches[0] : e
      setDragStart({ x: touch.clientX, y: touch.clientY })
      return
    }

    setIsDraggingImage(true)
    const pos = getPointerPos(e)
    setDragStart({ x: pos.x - pan.x, y: pos.y - pan.y })
    setShowGrid(true)
  }

  const handlePointerMove = (e) => {
    if (isResizingCrop) {
      e.preventDefault()
      const touch = e.touches ? e.touches[0] : e
      const viewportRect = viewportRef.current.getBoundingClientRect()
      const centerX = viewportRect.left + viewportRect.width / 2
      const centerY = viewportRect.top + viewportRect.height / 2
      
      const newHalfW = Math.abs(touch.clientX - centerX)
      const newHalfH = Math.abs(touch.clientY - centerY)
      
      const maxW = viewportRect.width - 48
      const maxH = viewportRect.height - 48

      let nextW = Math.max(80, Math.min(maxW, newHalfW * 2))
      let nextH = Math.max(80, Math.min(maxH, newHalfH * 2))

      // Keep aspect ratio constraint if not free
      if (activeAspect !== 'free') {
        let ratio;
        if (activeAspect === 'original') {
          ratio = activeImage?.naturalRatio || 1
        } else {
          ratio = ASPECT_PRESETS.find((p) => p.id === activeAspect)?.value || 1
        }
        
        // Match height to width ratio
        nextH = nextW / ratio
        if (nextH > maxH) {
          nextH = maxH
          nextW = nextH * ratio
        }
      }

      setCropW(Math.round(nextW))
      setCropH(Math.round(nextH))
      return
    }

    if (!isDraggingImage) return

    const pos = getPointerPos(e)
    const nextPan = {
      x: pos.x - dragStart.x,
      y: pos.y - dragStart.y
    }
    setPan(nextPan)
    triggerGridAnimation()
  }

  const handlePointerUp = () => {
    if (isDraggingImage || isResizingCrop) {
      setIsDraggingImage(false)
      setIsResizingCrop(false)
      setShowGrid(false)
      updateActiveImageState({ pan, zoom, rotate, cropW, cropH }, true)
    }
  }

  // Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95
    const nextZoom = Math.max(0.8, Math.min(8, zoom * zoomFactor))
    setZoom(nextZoom)
    triggerGridAnimation()
    
    if (gridTimeoutRef.current) clearTimeout(gridTimeoutRef.current)
    gridTimeoutRef.current = setTimeout(() => {
      updateActiveImageState({ zoom: nextZoom }, true)
      setShowGrid(false)
    }, 400)
  }

  // Touch Pinch and Double Tap
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY)
      pinchStartDistRef.current = dist
      pinchStartZoomRef.current = zoom
      setIsDraggingImage(false)
    } else {
      handlePointerDown(e)
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      e.preventDefault()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY)
      const scale = dist / pinchStartDistRef.current
      const nextZoom = Math.max(0.8, Math.min(8, pinchStartZoomRef.current * scale))
      setZoom(nextZoom)
      triggerGridAnimation()
    } else {
      handlePointerMove(e)
    }
  }

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      pinchStartDistRef.current = null
      pinchStartZoomRef.current = null
    }
    handlePointerUp()
  }

  const lastTapRef = useRef(0)
  const handleDoubleTap = () => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      const nextZoom = zoom > 1.5 ? 1 : 2.5
      setZoom(nextZoom)
      setPan({ x: 0, y: 0 })
      updateActiveImageState({ zoom: nextZoom, pan: { x: 0, y: 0 } }, true)
      triggerGridAnimation()
    }
    lastTapRef.current = now
  }

  // Render crop preview overlay inside canvas (Applying cache-buster query parameter to bypass CORS issues)
  const generatePreviewData = () => {
    return new Promise((resolve) => {
      const renderedPreviews = []
      let loadedCount = 0

      images.forEach((imgObj) => {
        const img = new Image()
        // Cache-buster query param forces browser to perform standard cross-origin check bypass
        img.src = imgObj.src.startsWith('http')
          ? `${imgObj.src}${imgObj.src.includes('?') ? '&' : '?'}cors=${Date.now()}`
          : imgObj.src
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          const outputW = 1200
          const outputH = outputW / (imgObj.cropW / imgObj.cropH)
          
          canvas.width = outputW
          canvas.height = outputH
          
          ctx.fillStyle = '#fdf8f0'
          ctx.fillRect(0, 0, outputW, outputH)

          ctx.save()
          ctx.translate(outputW / 2, outputH / 2)

          const scaleRatio = outputW / imgObj.cropW
          ctx.translate(imgObj.pan.x * scaleRatio, imgObj.pan.y * scaleRatio)
          
          ctx.rotate((imgObj.rotate * Math.PI) / 180)

          const baseScale = Math.max(imgObj.cropW / img.naturalWidth, imgObj.cropH / img.naturalHeight)
          const renderW = img.naturalWidth * baseScale
          const renderH = img.naturalHeight * baseScale

          const drawW = renderW * imgObj.zoom * scaleRatio
          const drawH = renderH * imgObj.zoom * scaleRatio

          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
          ctx.restore()

          renderedPreviews.push({
            id: imgObj.id,
            name: imgObj.name,
            originalFile: imgObj.file,
            dataUrl: canvas.toDataURL('image/jpeg', 0.88),
            canvasObj: canvas
          })

          loadedCount++
          if (loadedCount === images.length) {
            resolve(renderedPreviews)
          }
        }
        img.onerror = () => {
          loadedCount++
          if (loadedCount === images.length) {
            resolve(renderedPreviews)
          }
        }
      })
    })
  }

  const handleOpenPreview = async () => {
    setProcessingState('compressing')
    setProgress(20)
    const previews = await generatePreviewData()
    setSavePreviews(previews)
    setProgress(100)
    setTimeout(() => {
      setProcessingState(null)
      setShowSavePreview(true)
    }, 400)
  }

  // Simulated background upload flow
  const handleConfirmUpload = async () => {
    setProcessingState('uploading')
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 150)

    await new Promise((resolve) => setTimeout(resolve, 1600))
    setProcessingState('success')
    
    const processedResults = savePreviews.map((p) => p.dataUrl)

    await new Promise((resolve) => setTimeout(resolve, 1000))
    setProcessingState(null)
    setShowSavePreview(false)
    onSaveComplete(processedResults)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Mask */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/75 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Editor Modal Window */}
      <motion.div
        initial={{ scale: 0.95, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 30, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="relative w-full max-w-5xl h-[90vh] sm:h-[85vh] bg-[#1a1715] border border-beige/10 rounded-[32px] overflow-hidden flex flex-col shadow-2xl text-white font-sans"
      >
        {/* Error notification banner */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-900/80 border-b border-rose-500/30 text-rose-100 text-xs px-6 py-2.5 flex items-center justify-between"
            >
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage('')} className="p-1 hover:bg-rose-800 rounded-full cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header */}
        <header className="px-6 py-4.5 border-b border-white/5 flex items-center justify-between bg-black/25">
          <div className="flex items-center gap-3.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-accent animate-pulse" />
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide italic text-cream">
              Scrapbook Photo Lab
            </h2>
          </div>

          {/* Top toolbar actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`p-2 rounded-full cursor-pointer transition-colors ${
                historyIndex > 0 ? 'text-white hover:bg-white/10' : 'text-white/20 cursor-not-allowed'
              }`}
              title="Undo"
              aria-label="Undo edit"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className={`p-2 rounded-full cursor-pointer transition-colors ${
                historyIndex < history.length - 1 ? 'text-white hover:bg-white/10' : 'text-white/20 cursor-not-allowed'
              }`}
              title="Redo"
              aria-label="Redo edit"
            >
              <Redo className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full cursor-pointer transition-colors ml-1.5"
              title="Reset Image"
              aria-label="Reset modifications"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-white/10 mx-2" />
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/12 text-white/80 hover:text-white cursor-pointer transition-colors"
              aria-label="Close editor"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_260px] bg-[#141211]">
          {/* Main Visual Cropping Viewport */}
          <div
            ref={viewportRef}
            className="relative flex items-center justify-center p-6 select-none bg-black/40 overflow-hidden"
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Aspect Ratio Box Mask Frame */}
            {images.length > 0 && activeImage && (
              <div
                ref={containerRef}
                className="relative overflow-hidden border border-white/10 shadow-book flex items-center justify-center cursor-move"
                style={{
                  width: `${cropW}px`,
                  height: `${cropH}px`,
                  boxShadow: '0 0 0 9999px rgba(20, 18, 17, 0.72)'
                }}
                onMouseDown={handlePointerDown}
                onTouchStart={handleTouchStart}
                onDoubleClick={handleDoubleTap}
              >
                {/* Image under CSS transform */}
                <img
                  src={activeImage.src}
                  alt="Crop Target"
                  draggable={false}
                  onWheel={handleWheel}
                  onLoad={handleImageLoad}
                  crossOrigin="anonymous" // prevent tainted canvas
                  className="max-w-none origin-center pointer-events-none select-none"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotate}deg) scale(${zoom})`,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: isDraggingImage ? 'none' : 'transform 0.15s ease-out'
                  }}
                />

                {/* 3x3 Grid Overlay */}
                <div
                  className={`absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none transition-opacity duration-300 ${
                    showGrid ? 'opacity-35' : 'opacity-0'
                  }`}
                >
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div className="w-full h-full" />
                </div>

                {/* Resizable Corner Handles (Visible only in Free Crop) */}
                {activeAspect === 'free' && (
                  <>
                    <div className="crop-resize-handle absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white cursor-nwse-resize" />
                    <div className="crop-resize-handle absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white cursor-nesw-resize" />
                    <div className="crop-resize-handle absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white cursor-nesw-resize" />
                    <div className="crop-resize-handle absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white cursor-nwse-resize" />
                  </>
                )}
              </div>
            )}

            {/* Instruction Banner */}
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-white/50 tracking-wider uppercase bg-black/40 px-3 py-1.5 rounded-full pointer-events-none text-center">
              Drag to Pan • Pinch or Scroll to Zoom • Double Tap to toggle zoom
            </p>
          </div>

          {/* Right Sidebar Control Column */}
          <aside className="border-l border-white/5 bg-[#171513] p-5 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-6">
              {/* Aspect Ratio Presets */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/55 block">
                  Crop Preset
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {ASPECT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setActiveAspect(preset.id)
                        updateActiveImageState({ aspect: preset.id }, true)
                      }}
                      className={`px-3 py-2.5 rounded-xl font-medium cursor-pointer transition-all border text-center ${
                        activeAspect === preset.id
                          ? 'bg-pink-accent border-pink-accent text-white shadow-md'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/80'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider for smooth Zoom */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-white/55">
                  <span>Zoom Level</span>
                  <span className="font-mono text-pink-accent">{zoom.toFixed(1)}x</span>
                </div>
                <div className="flex items-center gap-3">
                  <ZoomOut className="w-3.5 h-3.5 text-white/40" />
                  <input
                    type="range"
                    min="0.8"
                    max="5.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => {
                      const nextZoom = parseFloat(e.target.value)
                      setZoom(nextZoom)
                      triggerGridAnimation()
                    }}
                    onMouseUp={() => updateActiveImageState({ zoom }, true)}
                    onTouchEnd={() => updateActiveImageState({ zoom }, true)}
                    className="flex-1 h-1.5 rounded-lg bg-white/10 accent-pink-accent cursor-pointer outline-none"
                  />
                  <ZoomIn className="w-3.5 h-3.5 text-white/40" />
                </div>
              </div>

              {/* Rotation actions */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/55 block">
                  Rotation
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleRotateLeft}
                    className="flex-1 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-semibold text-center flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> -90°
                  </button>
                  <button
                    onClick={handleRotateRight}
                    className="flex-1 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-semibold text-center flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> +90°
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-white/5">
              <button
                onClick={handleOpenPreview}
                className="w-full py-3.5 bg-pink-accent hover:bg-pink-accent/90 text-white rounded-2xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" /> Save & Preview
              </button>
            </div>
          </aside>
        </div>

        {/* Filmstrip Footer */}
        {images.length > 0 && (
          <footer className="px-6 py-4.5 border-t border-white/5 bg-[#12100f] flex items-center gap-4.5 overflow-x-auto">
            {images.map((imgObj, idx) => (
              <div
                key={imgObj.id}
                draggable
                onDragStart={(e) => handleFilmstripDragStart(e, idx)}
                onDragOver={handleFilmstripDragOver}
                onDrop={(e) => handleFilmstripDrop(e, idx)}
                onClick={() => changeActiveImage(idx)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 group cursor-pointer transition-all border-2 ${
                  idx === activeIndex
                    ? 'border-pink-accent ring-2 ring-pink-accent/20 scale-105'
                    : 'border-white/10 opacity-60 hover:opacity-90'
                }`}
              >
                <img src={imgObj.src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => handleRemovePhoto(idx, e)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity"
                  title="Remove image"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}

            {/* Add photos trigger inside editor */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-xl border border-dashed border-white/20 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:border-pink-accent cursor-pointer flex-shrink-0 transition-colors"
              title="Add more photos"
            >
              <Plus className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleAddPhotos}
            />
          </footer>
        )}

        {/* Sub-modal: Processing / Progress Indicator overlay */}
        <AnimatePresence>
          {processingState && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
            >
              {processingState === 'compressing' && (
                <div className="space-y-4 max-w-sm">
                  <RefreshCw className="w-10 h-10 animate-spin text-pink-accent mx-auto" />
                  <h3 className="font-display text-xl font-bold text-cream">Optimizing Image Quality</h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Automatically compressing image size, preserving clarity and resolving details...
                  </p>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-pink-accent h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {processingState === 'uploading' && (
                <div className="space-y-4 max-w-sm">
                  <RefreshCw className="w-10 h-10 animate-spin text-pink-accent mx-auto" />
                  <h3 className="font-display text-xl font-bold text-cream">Preserving to Scrapbook</h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Saving files in background. Please do not close your browser tab...
                  </p>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-pink-accent h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {processingState === 'success' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-cream italic">Preserved Successfully</h3>
                  <p className="text-xs text-white/60">
                    Your beautiful moments have been compressed and uploaded.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sub-modal: Before Saving Preview Confirmation panel */}
        <AnimatePresence>
          {showSavePreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/90 flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-[#1c1917] max-w-2xl w-full rounded-[28px] border border-beige/10 p-6 flex flex-col max-h-[85vh] overflow-hidden shadow-2xl"
              >
                <header className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <h3 className="font-display text-lg font-semibold italic text-cream">
                    Verify Upload Preview
                  </h3>
                  <button
                    onClick={() => setShowSavePreview(false)}
                    className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-white/70" />
                  </button>
                </header>

                <div className="flex-1 overflow-y-auto space-y-6 pb-2">
                  <p className="text-xs text-white/60">
                    Here is exactly how your cropped image(s) will appear on the page. Confirm below to complete the upload.
                  </p>
                  
                  {/* Previews Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savePreviews.map((preview) => (
                      <div
                        key={preview.id}
                        className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#141211] p-1.5 flex flex-col justify-center items-center shadow-md"
                      >
                        <img
                          src={preview.dataUrl}
                          alt=""
                          className="max-h-56 object-contain rounded-xl"
                        />
                        <span className="text-[10px] text-white/45 mt-2 block font-mono truncate max-w-full px-2">
                          {preview.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <footer className="flex items-center justify-end gap-3.5 border-t border-white/5 pt-4 mt-4">
                  <button
                    onClick={() => setShowSavePreview(false)}
                    className="px-4.5 py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={handleConfirmUpload}
                    className="px-5 py-2.5 bg-pink-accent hover:bg-pink-accent/90 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md"
                  >
                    Confirm Upload
                  </button>
                </footer>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
