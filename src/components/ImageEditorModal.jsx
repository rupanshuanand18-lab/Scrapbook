import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  ChevronLeft,
  Grid3x3,
  Plus,
  RefreshCw,
  RotateCw,
  X,
  ZoomIn,
} from 'lucide-react'

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const OUTPUT_SIZE = 1200
const BACKGROUND_COLOR = '#fdf8f0'

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

export default function ImageEditorModal({
  isOpen,
  onClose,
  initialFiles = [],
  onSaveComplete,
  aspectRatio = 1,
  secondaryActionLabel = null,
  onSecondaryAction = null,
}) {
  const [images, setImages] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [showGrid, setShowGrid] = useState(false)
  const [activeTool, setActiveTool] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [previewUrls, setPreviewUrls] = useState([])
  const [isImageLoading, setIsImageLoading] = useState(false)

  const mountRef = useRef(false)
  const viewportRef = useRef(null)
  const imageRef = useRef(null)
  const fileInputRef = useRef(null)
  const gestureRef = useRef({
    active: false,
    type: null,
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

  const showError = useCallback((msg) => {
    setError(msg)
    if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current)
    errorTimerRef.current = window.setTimeout(() => mountRef.current && setError(''), 4000)
  }, [])

  const getFrameSize = useCallback(
    (maxW, maxH, ratio = aspectRatio) => {
      let w = maxW
      let h = w / ratio
      if (h > maxH) {
        h = maxH
        w = h * ratio
      }
      return { w: Math.round(w), h: Math.round(h) }
    },
    [aspectRatio]
  )

  // Helper: compute baseScale (fit to frame) for the active image
  const getBaseScale = useCallback((img, frameW, frameH) => {
    if (!img || !img.naturalW || !img.naturalH) return 1
    const isSwapped = Math.abs(img.rotate % 180) === 90
    const srcW = isSwapped ? img.naturalH : img.naturalW
    const srcH = isSwapped ? img.naturalW : img.naturalH
    return Math.min(frameW / srcW, frameH / srcH)
  }, [])

  const getPanBounds = useCallback(
    (frameW, frameH, zoom, rotate) => {
      if (!activeImage || !activeImage.naturalW) return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
      const isSwapped = Math.abs(rotate % 180) === 90
      const imgW = isSwapped ? activeImage.naturalH : activeImage.naturalW
      const imgH = isSwapped ? activeImage.naturalW : activeImage.naturalH
      const baseScale = Math.min(frameW / imgW, frameH / imgH)
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

  const commitToActive = useCallback(
    (updates) => {
      setImages((prev) => prev.map((img, i) => (i === activeIndex ? { ...img, ...updates } : img)))
    },
    [activeIndex]
  )

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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setError('')
      setActiveTool(null)
      setShowPreview(false)
      setIsProcessing(false)

      const topBarTargets = document.querySelectorAll('header.fixed, div.absolute.top-0.left-0.right-0')
      topBarTargets.forEach((node) => {
        node.dataset.editorHidden = 'true'
        node.style.visibility = 'hidden'
        node.style.pointerEvents = 'none'
      })
    } else {
      document.body.style.overflow = ''
      document.querySelectorAll('[data-editor-hidden="true"]').forEach((node) => {
        node.style.visibility = ''
        node.style.pointerEvents = ''
        delete node.dataset.editorHidden
      })
    }

    return () => {
      document.querySelectorAll('[data-editor-hidden="true"]').forEach((node) => {
        node.style.visibility = ''
        node.style.pointerEvents = ''
        delete node.dataset.editorHidden
      })
    }
  }, [isOpen])

  // Initialize images when modal opens with files
  useEffect(() => {
    if (!isOpen) return
    if (!initialFiles || initialFiles.length === 0) {
      setImages([])
      setActiveIndex(0)
      return
    }
    const next = initialFiles.map((f) => createImageRecord(f))
    setImages(next)
    setActiveIndex(0)
    setIsImageLoading(true)
  }, [isOpen, initialFiles])

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
        handleRotateCurrent()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, activeImage, activeTool, showPreview, onClose])

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target
    if (!naturalWidth || !naturalHeight) return
    const ratio = naturalWidth / naturalHeight
    setImages((prev) =>
      prev.map((img, i) =>
        i === activeIndex
          ? { ...img, naturalW: naturalWidth, naturalH: naturalHeight, naturalRatio: ratio, zoom: 1, panX: 0, panY: 0 }
          : img
      )
    )
    setIsImageLoading(false)
  }

  const handleRotateCurrent = () => {
    if (!activeImage) return
    const nextRotate = (activeImage.rotate + 90) % 360
    const clampedZoom = Math.max(activeImage.zoom, MIN_ZOOM)
    const nextPan = clampPan(activeImage.panX, activeImage.panY, clampedZoom, nextRotate)
    commitToActive({ rotate: nextRotate, zoom: clampedZoom, panX: nextPan.x, panY: nextPan.y })
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
    const nextPan = clampPan(0, 0, MIN_ZOOM, activeImage.rotate)
    commitToActive({ zoom: MIN_ZOOM, panX: nextPan.x, panY: nextPan.y })
    setShowGrid(true)
    window.setTimeout(() => mountRef.current && setShowGrid(false), 900)
  }

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
      const rect = viewportRef.current.getBoundingClientRect()
      const { w: frameW, h: frameH } = getFrameSize(rect.width - 32, rect.height - 32)
      const baseScale = getBaseScale(activeImage, frameW, frameH)
      imageRef.current.style.transform = buildTransform(clamped.x, clamped.y, baseScale * g.initialZoom, activeImage.rotate)
    }
  }

  const handlePointerUp = (e) => {
    const g = gestureRef.current
    if (!g.active) return
    g.active = false
    try { e.target.releasePointerCapture(e.pointerId) } catch (_) { }
    const transform = imageRef.current?.style.transform || ''
    const tMatch = transform.match(/translate\(([^p]+)px,\s*([^p]+)px\)/)
    const sMatch = transform.match(/scale\(([^)]+)\)/)
    const finalPan = {
      x: tMatch ? parseFloat(tMatch[1]) : activeImage.panX,
      y: tMatch ? parseFloat(tMatch[2]) : activeImage.panY,
    }
    const finalZoom = sMatch ? parseFloat(sMatch[1]) / getBaseScale(activeImage, frameW, frameH) : activeImage.zoom // not perfect but we commit the zoom from state
    const clamped = clampPan(finalPan.x, finalPan.y, activeImage.zoom, activeImage.rotate)
    commitToActive({ panX: clamped.x, panY: clamped.y })
    setShowGrid(false)
  }

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
        const rect = viewportRef.current.getBoundingClientRect()
        const { w: frameW, h: frameH } = getFrameSize(rect.width - 32, rect.height - 32)
        const baseScale = getBaseScale(activeImage, frameW, frameH)
        imageRef.current.style.transform = buildTransform(nextPan.x, nextPan.y, baseScale * nextZoom, activeImage.rotate)
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

  // buildTransform now accepts a full scale (baseScale * zoom)
  const buildTransform = (px, py, scale, rotate) => {
    return `translate(${px}px, ${py}px) rotate(${rotate}deg) scale(${scale})`
  }

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

  // ============================================================
  // FIXED: renderPreviewForImage – WYSIWYG export
  // ============================================================
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

      const outW = OUTPUT_SIZE
      const outH = Math.round(outW / aspectRatio)
      canvas.width = outW
      canvas.height = outH

      ctx.fillStyle = BACKGROUND_COLOR
      ctx.fillRect(0, 0, outW, outH)

      const rect = viewportRef.current?.getBoundingClientRect()
      if (!rect) throw new Error('no viewport')
      const { w: frameW, h: frameH } = getFrameSize(rect.width - 32, rect.height - 32)

      // Same baseScale as in viewport
      const isSwapped = Math.abs(imgObj.rotate % 180) === 90
      const srcW = isSwapped ? imgObj.naturalH : imgObj.naturalW
      const srcH = isSwapped ? imgObj.naturalW : imgObj.naturalH
      const baseScale = Math.min(frameW / srcW, frameH / srcH)
      const viewportTotalScale = baseScale * imgObj.zoom

      // Position in viewport coordinates
      const viewportCenterX = frameW / 2 + imgObj.panX
      const viewportCenterY = frameH / 2 + imgObj.panY

      // Scale to canvas
      const scaleFactor = outW / frameW
      const canvasCenterX = viewportCenterX * scaleFactor
      const canvasCenterY = viewportCenterY * scaleFactor
      const canvasTotalScale = viewportTotalScale * scaleFactor

      ctx.save()
      ctx.translate(canvasCenterX, canvasCenterY)
      ctx.rotate((imgObj.rotate * Math.PI) / 180)

      const drawW = imgObj.naturalW * canvasTotalScale
      const drawH = imgObj.naturalH * canvasTotalScale
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

  if (!isOpen) return null

  // Calculate frame dimensions in render - this is acceptable as it's needed for layout
  let frameW = 300
  let frameH = 300
  let baseScale = 1

  // convert to a regular function, called directly during render
  const calculateFrameDimensions = () => {
    if (viewportRef.current && activeImage) {
      const rect = viewportRef.current.getBoundingClientRect()
      const size = getFrameSize(rect.width - 32, rect.height - 32)
      frameW = size.w
      frameH = size.h
      if (activeImage.naturalW && activeImage.naturalH) {
        baseScale = getBaseScale(activeImage, frameW, frameH)
      }
    } else if (activeImage) {
      const ratio = aspectRatio
      frameW = 300
      frameH = frameW / ratio
      if (activeImage.naturalW && activeImage.naturalH) {
        baseScale = getBaseScale(activeImage, frameW, frameH)
      }
    }
  }

  // now the early return is safe
  if (!isOpen) return null

  calculateFrameDimensions()

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="relative flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-paper shadow-2xl sm:h-[95dvh] sm:rounded-[24px]"
      >
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

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {secondaryActionLabel && (
              <button
                type="button"
                onClick={onSecondaryAction || onClose}
                className="rounded-full border border-beige bg-paper px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:border-pink-accent/40 hover:text-pink-accent sm:text-xs"
              >
                {secondaryActionLabel}
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!images.length || isProcessing}
              className="text-sm font-semibold text-pink-accent transition-opacity hover:opacity-70 disabled:opacity-40 sm:text-base"
            >
              Next
            </button>
          </div>
        </header>

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

        <div
          ref={viewportRef}
          className="relative flex flex-1 items-center justify-center overflow-hidden"
          style={{ backgroundColor: BACKGROUND_COLOR }}
          onWheel={handleWheel}
        >
          {activeImage ? (
            <>
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
                    transform: buildTransform(
                      activeImage.panX,
                      activeImage.panY,
                      baseScale * activeImage.zoom,
                      activeImage.rotate
                    ),
                    willChange: 'transform',
                    visibility: isImageLoading ? 'hidden' : 'visible',
                  }}
                />
              </div>

              {isImageLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-pink-accent/60" />
                </div>
              )}

              <div
                className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
                style={{ width: frameW, height: frameH }}
              >
                <div className="absolute inset-0 rounded-sm border-2 border-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.1)]" />
                <div className={`absolute inset-0 transition-opacity duration-300 ${showGrid ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="grid h-full w-full grid-cols-3 grid-rows-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-white/40" />
                    ))}
                  </div>
                </div>
                <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-white" />
                <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-white" />
                <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-white" />
                <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-white" />
              </div>

              <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-white/20 bg-ink/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm">
                {activeImage.zoom.toFixed(1)}×
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-beige/50 bg-paper text-pink-accent shadow-sm">
                <Plus className="h-6 w-6" />
              </div>
              <p className="font-display text-lg font-semibold text-white/90">Add a photo to start</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-beige bg-paper px-6 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-beige/30"
              >
                Choose from library
              </button>
            </div>
          )}
        </div>

        {activeImage && (
          <div className="shrink-0 border-t border-beige/40 bg-paper">
            <div className="flex items-center justify-center gap-2 px-4 py-3 sm:gap-4">
              <button
                onClick={() => setActiveTool((t) => (t === 'zoom' ? null : 'zoom'))}
                className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-colors ${activeTool === 'zoom' ? 'bg-pink-accent/10 text-pink-accent' : 'text-ink-muted hover:bg-beige/30 hover:text-ink'
                  }`}
              >
                <ZoomIn className="h-5 w-5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Zoom</span>
              </button>

              <button
                onClick={() => setShowGrid((v) => !v)}
                className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-colors ${showGrid ? 'bg-pink-accent/10 text-pink-accent' : 'text-ink-muted hover:bg-beige/30 hover:text-ink'
                  }`}
              >
                <Grid3x3 className="h-5 w-5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Grid</span>
              </button>

              <button
                onClick={handleRotateCurrent}
                className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-ink-muted transition-colors hover:bg-beige/30 hover:text-ink"
              >
                <RotateCw className="h-5 w-5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Rotate</span>
              </button>

              <button
                onClick={handleReset}
                className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-ink-muted transition-colors hover:bg-beige/30 hover:text-ink"
              >
                <RefreshCw className="h-5 w-5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Reset</span>
              </button>
            </div>

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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleAddPhotos}
        />

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
                        <div className="flex items-center justify-center overflow-hidden rounded-[14px]" style={{ backgroundColor: BACKGROUND_COLOR }}>
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
                  <button
                    onClick={() => setShowPreview(false)}
                    className="min-h-10 rounded-2xl border border-beige bg-paper px-5 text-sm font-semibold text-ink transition-colors hover:bg-beige/30"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmSave}
                    className="min-h-10 rounded-2xl bg-pink-accent px-5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-pink-600"
                  >
                    Confirm & Save
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