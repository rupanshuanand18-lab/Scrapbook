import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  ChevronLeft,
  Frame,
  Grid3x3,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  RotateCw,
  Trash2,
  X,
  ZoomIn,
} from 'lucide-react'
import Button from './ui/Button'

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */
const ASPECT_RATIOS = [
  { id: 'original', label: 'Original', ratio: null, icon: ImageIcon },
  { id: '1:1', label: '1:1', ratio: 1, icon: Frame },
  { id: '4:5', label: '4:5', ratio: 4 / 5, icon: Frame },
  { id: '16:9', label: '16:9', ratio: 16 / 9, icon: Frame },
  { id: '9:16', label: '9:16', ratio: 9 / 16, icon: Frame },
]

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const OUTPUT_SIZE = 1200

/* ═══════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════ */
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const wait = (ms) => new Promise((r) => window.setTimeout(r, ms))

const createImageRecord = (fileOrUrl) => {
  let src = ''
  let name = 'image.jpg'
  let file = null
  if (typeof fileOrUrl === 'string') {
    src = fileOrUrl
  } else if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
    src = URL.createObjectURL(fileOrUrl)
    name = fileOrUrl.name || name
    file = fileOrUrl
  }
  return {
    id: Math.random().toString(36).slice(2, 11),
    src,
    name,
    file,
    naturalW: 0,
    naturalH: 0,
    naturalRatio: 1,
    zoom: 1,
    rotate: 0,
    panX: 0,
    panY: 0,
    aspectId: 'original',
  }
}

const loadImageAsset = (src, timeoutMs = 10000) =>
  new Promise((resolve) => {
    let settled = false
    const img = new Image()
    const finish = (payload) => {
      if (settled) return
      settled = true
      window.clearTimeout(timerId)
      resolve(payload)
    }
    const timerId = window.setTimeout(() => finish({ ok: false, timedOut: true, img: null }), timeoutMs)
    img.onload = () => finish({ ok: true, img })
    img.onerror = () => finish({ ok: false, error: true, img: null })
    img.decoding = 'async'
    img.crossOrigin = 'anonymous'
    img.src = src
    if (img.complete && img.naturalWidth > 0) finish({ ok: true, img })
  })

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */
export default function ImageEditorModal({
  isOpen,
  onClose,
  initialFiles = [],
  onSaveComplete,
  defaultCropMode = 'original',
}) {
  /* ── State ─────────────────────────────────── */
  const [images, setImages] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [showGrid, setShowGrid] = useState(false)
  const [activeTool, setActiveTool] = useState(null) // 'ratio' | 'zoom'
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(null) // 'render' | 'save' | 'done'
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [previewUrls, setPreviewUrls] = useState([])
  const [isImageLoading, setIsImageLoading] = useState(false)

  /* ── Refs ──────────────────────────────────── */
  const mountRef = useRef(false)
  const viewportRef = useRef(null)
  const imageRef = useRef(null)
  const fileInputRef = useRef(null)
  const gestureRef = useRef({
    active: false,
    type: null, // 'pan' | 'pinch'
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
    initialZoom: 1,
    pinchStartDist: 0,
    pinchStartZoom: 1,
  })
  const objectUrlsRef = useRef([])
  const errorTimerRef = useRef(null)
  const rafRef = useRef(null)

  const activeImage = images[activeIndex] || null

  /* ── Derived: current aspect ratio object ────── */
  const currentAspect = useMemo(() => {
    if (!activeImage) return ASPECT_RATIOS[0]
    return ASPECT_RATIOS.find((a) => a.id === activeImage.aspectId) || ASPECT_RATIOS[0]
  }, [activeImage])

  /* ── Error helper ──────────────────────────── */
  const showError = useCallback((msg) => {
    setError(msg)
    if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current)
    errorTimerRef.current = window.setTimeout(() => mountRef.current && setError(''), 4000)
  }, [])

  /* ── Frame size calculator ─────────────────── */
  const getFrameSize = useCallback(
    (maxW, maxH) => {
      const ratio = currentAspect.ratio || activeImage?.naturalRatio || 1
      let w = maxW
      let h = w / ratio
      if (h > maxH) {
        h = maxH
        w = h * ratio
      }
      return { w: Math.round(w), h: Math.round(h) }
    },
    [currentAspect, activeImage]
  )

  /* ── Pan bounds calculator ───────────────────── */
  const getPanBounds = useCallback(
    (frameW, frameH, zoom, rotate) => {
      if (!activeImage || !activeImage.naturalW) return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
      // Effective dimensions after rotation (swap if 90° or 270°)
      const isSwapped = Math.abs(rotate % 180) === 90
      const imgW = isSwapped ? activeImage.naturalH : activeImage.naturalW
      const imgH = isSwapped ? activeImage.naturalW : activeImage.naturalH

      // Base scale to cover frame
      const baseScale = Math.max(frameW / imgW, frameH / imgH)
      const totalScale = baseScale * zoom
      const displayW = imgW * totalScale
      const displayH = imgH * totalScale

      const minX = frameW / 2 - displayW / 2
      const maxX = displayW / 2 - frameW / 2
      const minY = frameH / 2 - displayH / 2
      const maxY = displayH / 2 - frameH / 2

      return { minX, maxX, minY, maxY }
    },
    [activeImage]
  )

  /* ── Clamp pan to bounds ─────────────────────── */
  const clampPan = useCallback(
    (px, py, zoom, rotate) => {
      if (!viewportRef.current || !activeImage) return { x: px, y: py }
      const rect = viewportRef.current.getBoundingClientRect()
      const { w: frameW, h: frameH } = getFrameSize(rect.width - 32, rect.height - 32)
      const { minX, maxX, minY, maxY } = getPanBounds(frameW, frameH, zoom, rotate)
      return { x: clamp(px, minX, maxX), y: clamp(py, minY, maxY) }
    },
    [activeImage, getFrameSize, getPanBounds]
  )

  /* ── Commit helpers ──────────────────────────── */
  const commitToActive = useCallback(
    (updates) => {
      setImages((prev) => prev.map((img, i) => (i === activeIndex ? { ...img, ...updates } : img)))
    },
    [activeIndex]
  )

  /* ── Effects ───────────────────────────────── */

  useEffect(() => {
    mountRef.current = true
    return () => {
      mountRef.current = false
      document.body.style.overflow = ''
      if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrlsRef.current = []
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setError('')
      setActiveTool(null)
      setShowPreview(false)
      setIsProcessing(false)
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    if (!initialFiles || initialFiles.length === 0) {
      setImages([])
      setActiveIndex(0)
      return
    }
    const next = initialFiles.map((f) => createImageRecord(f))
    // Apply defaultCropMode as aspect if valid
    const validAspect = ASPECT_RATIOS.find((a) => a.id === defaultCropMode)
    if (validAspect) {
      next.forEach((img) => (img.aspectId = defaultCropMode))
    }
    setImages(next)
    setActiveIndex(0)
    setIsImageLoading(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialFiles, defaultCropMode])

  /* ── Keyboard shortcuts ────────────────────── */
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (showPreview) { setShowPreview(false); return }
        if (activeTool) { setActiveTool(null); return }
        onClose()
        return
      }
      if (!activeImage) return
      if (e.key === 'r' || e.key === 'R') {
        if (e.metaKey || e.ctrlKey) return
        e.preventDefault()
        handleRotate()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, activeImage, activeTool, showPreview, onClose])

  /* ── Handlers ──────────────────────────────── */

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target
    if (!naturalWidth || !naturalHeight) return
    const ratio = naturalWidth / naturalHeight
    setImages((prev) =>
      prev.map((img, i) =>
        i === activeIndex
          ? { ...img, naturalW: naturalWidth, naturalH: naturalHeight, naturalRatio: ratio }
          : img
      )
    )
    setIsImageLoading(false)
  }

  const handleRotate = () => {
    if (!activeImage) return
    const nextRotate = (activeImage.rotate + 90) % 360
    // Re-clamp pan after rotation
    const nextPan = clampPan(activeImage.panX, activeImage.panY, activeImage.zoom, nextRotate)
    commitToActive({ rotate: nextRotate, panX: nextPan.x, panY: nextPan.y })
    setShowGrid(true)
    window.setTimeout(() => mountRef.current && setShowGrid(false), 900)
  }

  const handleSetAspect = (aspectId) => {
    if (!activeImage) return
    commitToActive({ aspectId })
    // Re-clamp pan for new aspect
    requestAnimationFrame(() => {
      const nextPan = clampPan(activeImage.panX, activeImage.panY, activeImage.zoom, activeImage.rotate)
      commitToActive({ panX: nextPan.x, panY: nextPan.y })
    })
    setShowGrid(true)
    window.setTimeout(() => mountRef.current && setShowGrid(false), 900)
  }

  const handleZoomChange = (nextZoom) => {
    if (!activeImage) return
    const clamped = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM)
    const nextPan = clampPan(activeImage.panX, activeImage.panY, clamped, activeImage.rotate)
    commitToActive({ zoom: clamped, panX: nextPan.x, panY: nextPan.y })
  }

  const handleReset = () => {
    if (!activeImage) return
    const nextPan = clampPan(0, 0, 1, activeImage.rotate)
    commitToActive({ zoom: 1, panX: nextPan.x, panY: nextPan.y })
    setShowGrid(true)
    window.setTimeout(() => mountRef.current && setShowGrid(false), 900)
  }

  /* ── Pointer Gestures ──────────────────────── */

  const handlePointerDown = (e) => {
    if (!activeImage) return
    const g = gestureRef.current
    g.active = true
    g.type = 'pan'
    g.startX = e.clientX
    g.startY = e.clientY
    g.initialPanX = activeImage.panX
    g.initialPanY = activeImage.panY
    g.initialZoom = activeImage.zoom
    try { e.target.setPointerCapture(e.pointerId) } catch (_) { }
    setShowGrid(true)
  }

  const handlePointerMove = (e) => {
    const g = gestureRef.current
    if (!g.active || g.type !== 'pan') return
    e.preventDefault()
    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY
    const rawX = g.initialPanX + dx
    const rawY = g.initialPanY + dy
    const clamped = clampPan(rawX, rawY, g.initialZoom, activeImage.rotate)
    if (imageRef.current) {
      imageRef.current.style.transform = buildTransform(clamped.x, clamped.y, g.initialZoom, activeImage.rotate)
    }
  }

  const handlePointerUp = (e) => {
    const g = gestureRef.current
    if (!g.active) return
    g.active = false
    try { e.target.releasePointerCapture(e.pointerId) } catch (_) { }
    // Read final transform from DOM
    const transform = imageRef.current?.style.transform || ''
    const tMatch = transform.match(/translate\\(([^p]+)px,\\s*([^p]+)px\\)/)
    const sMatch = transform.match(/scale\\(([^)]+)\\)/)
    const finalPan = {
      x: tMatch ? parseFloat(tMatch[1]) : activeImage.panX,
      y: tMatch ? parseFloat(tMatch[2]) : activeImage.panY,
    }
    const finalZoom = sMatch ? parseFloat(sMatch[1]) : activeImage.zoom
    const clamped = clampPan(finalPan.x, finalPan.y, finalZoom, activeImage.rotate)
    commitToActive({ panX: clamped.x, panY: clamped.y })
    setShowGrid(false)
  }

  /* ── Touch Pinch ───────────────────────────── */
  const handleTouchStart = (e) => {
    if (e.touches.length === 2 && activeImage) {
      e.preventDefault()
      const g = gestureRef.current
      g.type = 'pinch'
      const [t1, t2] = e.touches
      g.pinchStartDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
      g.pinchStartZoom = activeImage.zoom
    }
  }

  const handleTouchMove = (e) => {
    const g = gestureRef.current
    if (e.touches.length === 2 && g.type === 'pinch' && activeImage) {
      e.preventDefault()
      const [t1, t2] = e.touches
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
      const scale = dist / (g.pinchStartDist || 1)
      const nextZoom = clamp(g.pinchStartZoom * scale, MIN_ZOOM, MAX_ZOOM)
      const nextPan = clampPan(activeImage.panX, activeImage.panY, nextZoom, activeImage.rotate)
      if (imageRef.current) {
        imageRef.current.style.transform = buildTransform(nextPan.x, nextPan.y, nextZoom, activeImage.rotate)
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        commitToActive({ zoom: nextZoom, panX: nextPan.x, panY: nextPan.y })
      })
      setShowGrid(true)
    }
  }

  const handleTouchEnd = () => {
    const g = gestureRef.current
    if (g.type === 'pinch') {
      g.type = null
      g.active = false
      setShowGrid(false)
    }
  }

  /* ── Wheel Zoom ────────────────────────────── */
  const handleWheel = (e) => {
    e.preventDefault()
    if (!activeImage) return
    const factor = e.deltaY < 0 ? 1.06 : 0.94
    const nextZoom = clamp(activeImage.zoom * factor, MIN_ZOOM, MAX_ZOOM)
    const nextPan = clampPan(activeImage.panX, activeImage.panY, nextZoom, activeImage.rotate)
    commitToActive({ zoom: nextZoom, panX: nextPan.x, panY: nextPan.y })
    setShowGrid(true)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      setShowGrid(false)
    })
  }

  /* ── Build CSS transform string ────────────── */
  const buildTransform = (px, py, zoom, rotate) => {
    return `translate(${px}px, ${py}px) rotate(${rotate}deg) scale(${zoom})`
  }

  /* ── Filmstrip ─────────────────────────────── */
  const handleFilmDragStart = (idx) => { /* native dnd */ }
  const handleFilmDrop = (e, idx) => {
    e.preventDefault()
    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'))
    if (isNaN(fromIdx) || fromIdx === idx) return
    const reordered = [...images]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(idx, 0, moved)
    setImages(reordered)
    if (activeIndex === fromIdx) setActiveIndex(idx)
    else if (activeIndex > fromIdx && activeIndex <= idx) setActiveIndex(activeIndex - 1)
    else if (activeIndex < fromIdx && activeIndex >= idx) setActiveIndex(activeIndex + 1)
  }

  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    const valid = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    const added = []
    const rejected = []
    files.forEach((file) => {
      if (!valid.includes(file.type)) { rejected.push(file.name); return }
      if (file.size > 20 * 1024 * 1024) { rejected.push(file.name); return }
      const url = URL.createObjectURL(file)
      objectUrlsRef.current.push(url)
      added.push({ ...createImageRecord(file), src: url })
    })
    if (rejected.length) showError(`Some files were rejected. Use JPG, PNG, or WEBP under 20MB.`)
    if (!added.length) return
    setImages((prev) => [...prev, ...added])
    setActiveIndex(images.length)
  }

  const handleRemovePhoto = (idx) => {
    const filtered = images.filter((_, i) => i !== idx)
    if (!filtered.length) { onClose(); return }
    const next = Math.max(0, Math.min(activeIndex, filtered.length - 1))
    if (activeIndex === idx) setActiveIndex(next)
    else if (activeIndex > idx) setActiveIndex(activeIndex - 1)
    setImages(filtered)
  }

  /* ── Preview & Save ────────────────────────── */

  const renderPreviewForImage = async (imgObj) => {
    const loaded = await loadImageAsset(imgObj.src)
    if (!loaded.ok || !loaded.img) {
      return { id: imgObj.id, name: imgObj.name, dataUrl: imgObj.src, fallback: true }
    }
    const img = loaded.img
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('no ctx')

      const aspect = ASPECT_RATIOS.find((a) => a.id === imgObj.aspectId)
      const ratio = aspect?.ratio || imgObj.naturalRatio || 1
      const outW = OUTPUT_SIZE
      const outH = Math.round(outW / ratio)
      canvas.width = outW
      canvas.height = outH

      ctx.fillStyle = '#fdf8f0'
      ctx.fillRect(0, 0, outW, outH)
      ctx.save()
      ctx.translate(outW / 2, outH / 2)

      // Frame size in source pixels
      const isSwapped = Math.abs(imgObj.rotate % 180) === 90
      const srcW = isSwapped ? imgObj.naturalH : imgObj.naturalW
      const srcH = isSwapped ? imgObj.naturalW : imgObj.naturalH
      const baseScale = Math.max(outW / srcW, outH / srcH)
      const totalScale = baseScale * imgObj.zoom

      // Pan in output coordinates
      const panScale = outW / (outW / baseScale) // simplified: pan maps 1:1 relative to base
      const effPanX = imgObj.panX * (outW / (srcW * baseScale * imgObj.zoom)) * totalScale
      const effPanY = imgObj.panY * (outH / (srcH * baseScale * imgObj.zoom)) * totalScale

      ctx.translate(imgObj.panX * (outW / (srcW * baseScale)), imgObj.panY * (outH / (srcH * baseScale)))
      ctx.rotate((imgObj.rotate * Math.PI) / 180)

      const drawW = imgObj.naturalW * totalScale
      const drawH = imgObj.naturalH * totalScale
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
      ctx.restore()

      let dataUrl = canvas.toDataURL('image/jpeg', 0.92)
      return { id: imgObj.id, name: imgObj.name, dataUrl, fallback: false }
    } catch (err) {
      return { id: imgObj.id, name: imgObj.name, dataUrl: imgObj.src, fallback: true }
    }
  }

  const handleNext = async () => {
    if (!images.length) { showError('Add a photo first.'); return }
    setIsProcessing(true)
    setProcessingStep('render')
    setProgress(10)
    const iv = window.setInterval(() => setProgress((p) => (p >= 80 ? p : p + 10)), 200)
    try {
      const previews = await Promise.all(images.map((img) => renderPreviewForImage(img)))
      window.clearInterval(iv)
      if (!mountRef.current) return
      setPreviewUrls(previews)
      setProgress(100)
      await wait(300)
      if (!mountRef.current) return
      setIsProcessing(false)
      setProcessingStep(null)
      setShowPreview(true)
    } catch (err) {
      window.clearInterval(iv)
      if (mountRef.current) { showError('Preview failed. Try again.'); setIsProcessing(false) }
    }
  }

  const handleConfirmSave = async () => {
    if (!previewUrls.length) return
    setIsProcessing(true)
    setProcessingStep('save')
    setProgress(15)
    const iv = window.setInterval(() => setProgress((p) => (p >= 90 ? p : p + 12)), 150)
    try {
      await wait(800)
      window.clearInterval(iv)
      if (!mountRef.current) return
      setProcessingStep('done')
      setProgress(100)
      await wait(600)
      if (!mountRef.current) return
      onSaveComplete(previewUrls.map((p) => p.dataUrl))
      onClose()
    } catch (err) {
      window.clearInterval(iv)
      if (mountRef.current) { showError('Save failed.'); setIsProcessing(false) }
    }
  }

  /* ── Render guards ─────────────────────────── */
  if (!isOpen) return null

  /* ── Compute frame size for render ─────────── */
  let frameW = 300
  let frameH = 300
  if (viewportRef.current && activeImage) {
    const rect = viewportRef.current.getBoundingClientRect()
    const size = getFrameSize(rect.width - 32, rect.height - 32)
    frameW = size.w
    frameH = size.h
  } else if (activeImage) {
    const ratio = currentAspect.ratio || activeImage.naturalRatio || 1
    frameW = 300
    frameH = frameW / ratio
  }

  /* ── JSX ───────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="relative flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-paper shadow-2xl sm:h-[95dvh] sm:rounded-[24px]"
      >
        {/* ═══════ Header ═══════ */}
        <header className="flex shrink-0 items-center justify-between border-b border-beige/40 bg-paper px-4 py-3 sm:px-6">
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-beige/30 hover:text-ink"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="absolute left-1/2 -translate-x-1/2 font-display text-base font-semibold text-ink sm:text-lg">
            Crop
          </h2>
          <button
            onClick={handleNext}
            disabled={!images.length || isProcessing}
            className="text-sm font-semibold text-pink-accent transition-opacity hover:opacity-70 disabled:opacity-40 sm:text-base"
          >
            Next
          </button>
        </header>

        {/* ═══════ Error Banner ═══════ */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center justify-between gap-3 border-b border-rose-200/60 bg-rose-50 px-4 py-2 text-xs text-rose-800"
            >
              <span>{error}</span>
              <button onClick={() => setError('')} className="p-1"><X className="h-3 w-3" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════ Viewport ═══════ */}
        <div
          ref={viewportRef}
          className="relative flex flex-1 items-center justify-center overflow-hidden bg-ink/30"
          onWheel={handleWheel}
        >
          {activeImage ? (
            <>
              {/* Draggable Image Layer */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onDoubleClick={handleReset}
                style={{ touchAction: 'none', userSelect: 'none' }}
              >
                <img
                  ref={imageRef}
                  src={activeImage.src}
                  alt=""
                  draggable={false}
                  crossOrigin="anonymous"
                  onLoad={handleImageLoad}
                  className="max-w-none origin-center"
                  style={{
                    width: activeImage.naturalW || 'auto',
                    height: activeImage.naturalH || 'auto',
                    transform: buildTransform(activeImage.panX, activeImage.panY, activeImage.zoom, activeImage.rotate),
                    willChange: 'transform',
                    visibility: isImageLoading ? 'hidden' : 'visible',
                  }}
                />
              </div>

              {/* Loading */}
              {isImageLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-pink-accent/60" />
                </div>
              )}

              {/* Crop Frame Overlay */}
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: frameW,
                  height: frameH,
                  boxShadow: '0 0 0 9999px rgba(44, 40, 37, 0.52)',
                }}
              >
                {/* White border */}
                <div className="absolute inset-0 rounded-sm border-2 border-white/90" />
                {/* Grid */}
                <div className={`absolute inset-0 transition-opacity duration-300 ${showGrid ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="grid h-full w-full grid-cols-3 grid-rows-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-white/40" />
                    ))}
                  </div>
                </div>
                {/* Corner marks */}
                <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-white" />
                <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-white" />
                <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-white" />
                <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-white" />
              </div>

              {/* Zoom indicator (temporary) */}
              <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-white/20 bg-ink/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm">
                {(activeImage.zoom || 1).toFixed(1)}×
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center gap-4 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-beige/50 bg-paper text-pink-accent shadow-sm">
                <Plus className="h-6 w-6" />
              </div>
              <p className="font-display text-lg font-semibold text-white/90">Add a photo to start</p>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                Choose from library
              </Button>
            </div>
          )}
        </div>

        {/* ═══════ Bottom Toolbar ═══════ */}
        {activeImage && (
          <div className="shrink-0 border-t border-beige/40 bg-paper">
            {/* Tool Row */}
            <div className="flex items-center justify-center gap-2 px-4 py-3 sm:gap-4">
              {/* Aspect Ratio */}
              <button
                onClick={() => setActiveTool((t) => (t === 'ratio' ? null : 'ratio'))}
                className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-colors ${activeTool === 'ratio' ? 'bg-pink-accent/10 text-pink-accent' : 'text-ink-muted hover:bg-beige/30 hover:text-ink'}`}
              >
                <Frame className="h-5 w-5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Ratio</span>
              </button>

              {/* Zoom */}
              <button
                onClick={() => setActiveTool((t) => (t === 'zoom' ? null : 'zoom'))}
                className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-colors ${activeTool === 'zoom' ? 'bg-pink-accent/10 text-pink-accent' : 'text-ink-muted hover:bg-beige/30 hover:text-ink'}`}
              >
                <ZoomIn className="h-5 w-5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Zoom</span>
              </button>

              {/* Grid toggle */}
              <button
                onClick={() => setShowGrid((v) => !v)}
                className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-colors ${showGrid ? 'bg-pink-accent/10 text-pink-accent' : 'text-ink-muted hover:bg-beige/30 hover:text-ink'}`}
              >
                <Grid3x3 className="h-5 w-5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Grid</span>
              </button>

              {/* Rotate */}
              <button
                onClick={handleRotate}
                className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-ink-muted transition-colors hover:bg-beige/30 hover:text-ink"
              >
                <RotateCw className="h-5 w-5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Rotate</span>
              </button>

              {/* Reset */}
              <button
                onClick={handleReset}
                className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-ink-muted transition-colors hover:bg-beige/30 hover:text-ink"
              >
                <RefreshCw className="h-5 w-5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Reset</span>
              </button>
            </div>

            {/* Expanded Ratio Selector */}
            <AnimatePresence>
              {activeTool === 'ratio' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-beige/30 bg-parchment/40"
                >
                  <div className="flex items-center gap-3 overflow-x-auto px-4 py-3 scrollbar-thin">
                    {ASPECT_RATIOS.map((ratio) => {
                      const isActive = activeImage.aspectId === ratio.id
                      return (
                        <button
                          key={ratio.id}
                          onClick={() => handleSetAspect(ratio.id)}
                          className={`flex shrink-0 flex-col items-center gap-2 rounded-xl px-4 py-3 transition-all ${isActive
                            ? 'bg-pink-accent/10 text-pink-accent ring-1 ring-pink-accent/30'
                            : 'bg-white/50 text-ink-muted hover:bg-white hover:text-ink'
                            }`}
                        >
                          {/* Visual frame icon */}
                          <div
                            className={`rounded border-2 ${isActive ? 'border-pink-accent' : 'border-current'}`}
                            style={{
                              width: ratio.id === '9:16' ? 14 : ratio.id === '16:9' ? 28 : ratio.id === '4:5' ? 18 : 22,
                              height: ratio.id === '9:16' ? 28 : ratio.id === '16:9' ? 14 : ratio.id === '4:5' ? 22 : 22,
                            }}
                          />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">{ratio.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded Zoom Slider */}
            <AnimatePresence>
              {activeTool === 'zoom' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-beige/30 bg-parchment/40"
                >
                  <div className="flex items-center gap-3 px-5 py-3">
                    <span className="text-[10px] font-bold text-ink-muted">1×</span>
                    <input
                      type="range"
                      min={MIN_ZOOM}
                      max={MAX_ZOOM}
                      step="0.01"
                      value={activeImage.zoom}
                      onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                      className="h-1.5 flex-1 cursor-pointer rounded-full accent-pink-accent"
                    />
                    <span className="text-[10px] font-bold text-ink-muted">4×</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filmstrip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto border-t border-beige/30 bg-paper/80 px-4 py-2.5 scrollbar-thin">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={(e) => { e.dataTransfer.setData('text/plain', idx) }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleFilmDrop(e, idx)}
                    onClick={() => setActiveIndex(idx)}
                    className={`group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-14 sm:w-14 ${idx === activeIndex ? 'border-pink-accent ring-2 ring-pink-accent/20' : 'border-beige/40 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img src={img.src} alt="" className="h-full w-full object-cover" loading="lazy" />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemovePhoto(idx) }}
                      className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink/60 text-paper opacity-0 transition-opacity hover:bg-pink-accent group-hover:opacity-100"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-beige/60 text-ink-muted transition-colors hover:border-pink-accent/40 hover:text-pink-accent sm:h-14 sm:w-14"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hidden input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleAddPhotos}
        />

        {/* ═══════ Processing Overlay ═══════ */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-ink/50 px-6 backdrop-blur-sm"
            >
              <div className="w-full max-w-xs rounded-[24px] border border-beige/50 bg-paper p-6 text-center shadow-book sm:max-w-sm">
                {processingStep === 'render' && (
                  <div className="space-y-3">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin text-pink-accent" />
                    <p className="font-display text-lg font-semibold text-ink">Preparing preview…</p>
                    <div className="h-2 overflow-hidden rounded-full bg-beige/50">
                      <motion.div className="h-full rounded-full bg-pink-accent" animate={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
                {processingStep === 'save' && (
                  <div className="space-y-3">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin text-pink-accent" />
                    <p className="font-display text-lg font-semibold text-ink">Saving…</p>
                    <div className="h-2 overflow-hidden rounded-full bg-beige/50">
                      <motion.div className="h-full rounded-full bg-pink-accent" animate={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
                {processingStep === 'done' && (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-6 w-6 stroke-[3]" />
                    </div>
                    <p className="font-display text-lg font-semibold text-ink">Saved!</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════ Preview / Confirm Overlay ═══════ */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 flex items-center justify-center bg-ink/60 px-4 py-6 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.96, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 16 }}
                className="flex w-full max-w-lg max-h-[90dvh] flex-col overflow-hidden rounded-[24px] border border-beige/50 bg-paper shadow-book"
              >
                <header className="flex items-center justify-between border-b border-beige/40 px-5 py-3">
                  <h3 className="font-display text-lg font-semibold text-ink">Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-beige/30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-1 gap-4">
                    {previewUrls.map((p) => (
                      <div key={p.id} className="rounded-[18px] border border-beige/50 bg-white/60 p-2 shadow-sm">
                        <div className="flex items-center justify-center overflow-hidden rounded-[14px] bg-paper-warm">
                          <img src={p.dataUrl} alt="" className="max-h-64 w-full object-contain" loading="lazy" />
                        </div>
                        <div className="mt-2 flex items-center justify-between px-1">
                          <span className="truncate text-xs font-semibold text-ink">{p.name}</span>
                          {p.fallback && (
                            <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                              Fallback
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <footer className="flex flex-col-reverse gap-2 border-t border-beige/40 bg-white/50 px-5 py-3 sm:flex-row sm:justify-end">
                  <Button variant="secondary" onClick={() => setShowPreview(false)} className="min-h-10">
                    Back
                  </Button>
                  <Button onClick={handleConfirmSave} className="min-h-10">
                    Confirm & Save
                  </Button>
                </footer>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
