import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageCarousel({
    images = [],
    aspect = '4/3',
    className = '',
    rounded = 'rounded-lg',
    showCounter = true,
    showDots = false,
    counterPosition = 'bottom-right',
    arrowVariant = 'modern',
}) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const [touchStart, setTouchStart] = useState(null)

    if (!images || images.length === 0) return null

    const hasMultiple = images.length > 1

    const goNext = () => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const goPrev = () => {
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const goTo = (idx) => {
        if (idx === currentIndex) return
        setDirection(idx > currentIndex ? 1 : -1)
        setCurrentIndex(idx)
    }

    const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX)
    const handleTouchEnd = (e) => {
        if (touchStart === null) return
        const diff = touchStart - e.changedTouches[0].clientX
        if (Math.abs(diff) > 50) {
            if (diff > 0) goNext()
            else goPrev()
        }
        setTouchStart(null)
    }

    const slideVariants = {
        enter: (dir) => ({
            x: dir > 0 ? '60%' : '-60%',
            opacity: 0,
            scale: 0.96,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            zIndex: 1,
        },
        exit: (dir) => ({
            x: dir > 0 ? '-60%' : '60%',
            opacity: 0,
            scale: 0.96,
            zIndex: 0,
        }),
    }

    const aspectClass =
        aspect === '3/4'
            ? 'aspect-[3/4]'
            : aspect === '1/1'
                ? 'aspect-square'
                : aspect === '3/1'
                    ? 'aspect-[3/1]'
                    : 'aspect-[4/3]'

    // Arrow styles – always visible with opacity-80 and higher z-index
    const arrowBaseClass =
        arrowVariant === 'modern'
            ? 'w-10 h-10 rounded-full border border-beige bg-paper/90 shadow-sm backdrop-blur-sm hover:bg-paper text-ink'
            : 'w-9 h-9 rounded-full bg-paper/90 shadow-md hover:bg-pink-accent hover:text-white hover:scale-110'

    const arrowClass = `${arrowBaseClass} opacity-80 transition-all duration-300 z-20`

    const counterClasses =
        counterPosition === 'bottom-right'
            ? 'absolute bottom-4 right-4 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm z-20'
            : 'absolute top-2 right-2 px-2.5 py-1 rounded-full bg-ink/55 text-paper text-[10px] font-bold tracking-wide backdrop-blur-sm shadow-sm z-20'

    return (
        <div className={`relative group ${className}`}>
            <div
                className={`relative ${aspectClass} w-full overflow-hidden ${rounded} bg-cream-dark/25`}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.img
                        key={currentIndex}
                        src={images[currentIndex]}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: 'spring', stiffness: 300, damping: 30 },
                            opacity: { duration: 0.3 },
                            scale: { duration: 0.4 },
                        }}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt=""
                        draggable={false}
                    />
                </AnimatePresence>

                {hasMultiple && (
                    <>
                        {/* Navigation arrows – always visible */}
                        <button
                            type="button"
                            onClick={goPrev}
                            aria-label="Previous image"
                            className={`absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center ${arrowClass}`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={goNext}
                            aria-label="Next image"
                            className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center ${arrowClass}`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Optional dot indicators */}
                        {showDots && (
                            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-ink/20 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                                {images.map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => goTo(i)}
                                        aria-label={`Go to image ${i + 1}`}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex
                                                ? 'w-6 bg-paper'
                                                : 'w-1.5 bg-paper/60 hover:bg-paper/90'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Counter – always visible, with stable key */}
                        {showCounter && (
                            <div key="carousel-counter" className={counterClasses}>
                                {currentIndex + 1} / {images.length}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}