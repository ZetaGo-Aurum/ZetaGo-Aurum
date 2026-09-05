'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  X,
  List,
  Sparkles,
  Type,
  Sun,
  Moon,
  Compass,
  Bookmark,
  Award,
} from 'lucide-react'
import { aiBookData, aiBookPages, type BookPage } from '@/data/ai-book'
import { useLanguage } from '@/components/language-provider'
import { cn } from '@/lib/utils'

export function InteractiveBook() {
  const { t } = useLanguage()

  // Mode: 'closed' (3D closed book) | 'open' (physical 3D open book spread)
  const [bookState, setBookState] = React.useState<'closed' | 'open'>('closed')
  const [currentPage, setCurrentPage] = React.useState<number>(0)
  const [flipDirection, setFlipDirection] = React.useState<'next' | 'prev' | null>(null)
  const [paperTheme, setPaperTheme] = React.useState<'ivory' | 'dark'>('ivory')
  const [fontSize, setFontSize] = React.useState<'normal' | 'large'>('normal')
  const [tocOpen, setTocOpen] = React.useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false)

  // 3D Angles for Closed Mode inspection
  const [rotX, setRotX] = React.useState<number>(12)
  const [rotY, setRotY] = React.useState<number>(-24)
  const [isDragging, setIsDragging] = React.useState<boolean>(false)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const dragStartRef = React.useRef<{ x: number; y: number; rotX: number; rotY: number }>({
    x: 0,
    y: 0,
    rotX: 12,
    rotY: -24,
  })
  const velocityRef = React.useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 })
  const lastPointerRef = React.useRef<{ x: number; y: number; time: number }>({
    x: 0,
    y: 0,
    time: 0,
  })
  const reqAnimRef = React.useRef<number | null>(null)

  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen()
        } else {
          setIsFullscreen(true)
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        }
      }
    } catch {
      setIsFullscreen((prev) => !prev)
    }
  }

  React.useEffect(() => {
    if (bookState !== 'closed') return

    let lastTime = performance.now()
    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time

      if (!isDragging) {
        if (Math.abs(velocityRef.current.vx) > 0.001 || Math.abs(velocityRef.current.vy) > 0.001) {
          setRotY((y) => y + velocityRef.current.vx * dt * 60)
          setRotX((x) => Math.max(-45, Math.min(45, x + velocityRef.current.vy * dt * 60)))

          velocityRef.current.vx *= 0.92
          velocityRef.current.vy *= 0.92
        } else {
          const sway = Math.sin(time * 0.001) * 0.08
          setRotY((y) => y + sway)
        }
      }

      reqAnimRef.current = requestAnimationFrame(loop)
    }

    reqAnimRef.current = requestAnimationFrame(loop)
    return () => {
      if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current)
    }
  }, [bookState, isDragging])

  const onPointerDown = (e: React.PointerEvent) => {
    if (bookState !== 'closed') return
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY, rotX, rotY }
    lastPointerRef.current = { x: e.clientX, y: e.clientY, time: performance.now() }
    velocityRef.current = { vx: 0, vy: 0 }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || bookState !== 'closed') return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    const now = performance.now()
    const dt = Math.max(now - lastPointerRef.current.time, 1)
    velocityRef.current = {
      vx: ((e.clientX - lastPointerRef.current.x) / dt) * 14,
      vy: -((e.clientY - lastPointerRef.current.y) / dt) * 12,
    }
    lastPointerRef.current = { x: e.clientX, y: e.clientY, time: now }
    setRotY(dragStartRef.current.rotY + dx * 0.4)
    setRotX(Math.max(-45, Math.min(45, dragStartRef.current.rotX - dy * 0.3)))
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    try {
      if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
      }
    } catch {}
  }

  const reset3D = () => {
    setRotX(12)
    setRotY(-24)
    velocityRef.current = { vx: 0, vy: 0 }
  }

  const pageStep = isMobile ? 1 : 2
  const totalPages = aiBookPages.length

  const flipNext = () => {
    if (flipDirection !== null) return
    if (currentPage + pageStep < totalPages) {
      setFlipDirection('next')
      setTimeout(() => {
        setCurrentPage((p) => Math.min(totalPages - 1, p + pageStep))
        setFlipDirection(null)
      }, 550)
    }
  }

  const flipPrev = () => {
    if (flipDirection !== null) return
    if (currentPage > 0) {
      setFlipDirection('prev')
      setTimeout(() => {
        setCurrentPage((p) => Math.max(0, p - pageStep))
        setFlipDirection(null)
      }, 550)
    }
  }

  const jumpToChapter = (chapterIdx: number) => {
    const targetPage = aiBookPages.findIndex((p) => p.chapterIndex === chapterIdx)
    if (targetPage !== -1) {
      const aligned = isMobile ? targetPage : targetPage - (targetPage % 2)
      setCurrentPage(Math.max(0, aligned))
      setTocOpen(false)
    }
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (bookState === 'open') {
        if (e.key === 'ArrowRight') flipNext()
        if (e.key === 'ArrowLeft') flipPrev()
        if (e.key === 'Escape') {
          if (tocOpen) setTocOpen(false)
          else setBookState('closed')
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [bookState, currentPage, flipDirection, tocOpen, isMobile])

  const touchStartXRef = React.useRef<number>(0)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) flipNext()
      else flipPrev()
    }
  }

  const leftPage: BookPage | undefined = aiBookPages[currentPage]
  const rightPage: BookPage | undefined = !isMobile ? aiBookPages[currentPage + 1] : undefined

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative mx-auto flex w-full flex-col items-center overflow-hidden transition-all duration-300',
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen w-screen rounded-none bg-[#050608] p-0'
          : 'max-w-6xl rounded-3xl'
      )}
    >
      <AnimatePresence mode="wait">
        {bookState === 'closed' ? (
          /* =========================================================================
             1. CLOSED 3D PHYSICAL BOOK VIEW (SAMPUL EMAS & HITAM)
             ========================================================================= */
          <motion.div
            key="closed-book"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="relative flex min-h-[580px] sm:min-h-[660px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-[oklch(0.55_0.1_80_/_0.3)] bg-[#090b10] p-4 py-8 shadow-2xl dark:border-border/70 sm:p-8"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div className="h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-[oklch(0.72_0.13_80_/_0.18)] via-[#c87046]/10 to-transparent blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(rgba(200,112,70,0.1)_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
            </div>

            <div className="relative z-10 mb-5 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.72_0.13_80_/_0.4)] bg-[oklch(0.72_0.13_80_/_0.1)] px-3.5 py-1 text-xs font-semibold text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>BUKU FISIK 3D · MONOGRAF RESMI</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md">
                <Bookmark className="h-3 w-3 text-[oklch(0.72_0.13_80)]" />
                <span>158 Halaman · Sampul Emas & Hitam</span>
              </span>
            </div>

            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{ touchAction: 'none' }}
              className="relative flex h-[440px] w-full max-w-[400px] cursor-grab select-none items-center justify-center active:cursor-grabbing sm:h-[480px]"
            >
              <div
                style={{
                  perspective: 1200,
                  perspectiveOrigin: '50% 50%',
                }}
                className="relative flex items-center justify-center"
              >
                <div
                  style={{
                    width: 270,
                    height: 390,
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  }}
                  className="relative will-change-transform"
                >
                  {/* FRONT COVER */}
                  <div
                    onClick={() => setBookState('open')}
                    style={{
                      transform: 'translateZ(22px)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                    className="group absolute inset-0 flex flex-col justify-between overflow-hidden rounded-r-xl rounded-l-sm border-2 border-[oklch(0.72_0.13_80_/_0.85)] bg-[#0a0c10] p-5 shadow-2xl cursor-pointer"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1c1f28] via-[#0b0d12] to-[#040507]" />
                    <div className="pointer-events-none absolute inset-1 rounded-lg border border-[oklch(0.85_0.14_90_/_0.35)]" />
                    <div className="pointer-events-none absolute inset-2 rounded-md border border-dashed border-[oklch(0.72_0.13_80_/_0.25)]" />

                    <div className="pointer-events-none absolute top-2 left-2 text-[10px] text-[oklch(0.72_0.13_80)]">✦</div>
                    <div className="pointer-events-none absolute top-2 right-2 text-[10px] text-[oklch(0.72_0.13_80)]">✦</div>
                    <div className="pointer-events-none absolute bottom-2 left-2 text-[10px] text-[oklch(0.72_0.13_80)]">✦</div>
                    <div className="pointer-events-none absolute bottom-2 right-2 text-[10px] text-[oklch(0.72_0.13_80)]">✦</div>

                    <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/60 to-transparent" />

                    <div className="relative z-10 text-center">
                      <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-[oklch(0.72_0.13_80)]">
                        MONOGRAF AKADEMIK
                      </p>
                      <p className="mt-0.5 text-[7.5px] tracking-widest text-neutral-400 uppercase">
                        Buku Referensi Teknis
                      </p>
                    </div>

                    <div className="relative z-10 my-auto flex flex-col items-center py-2">
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-[oklch(0.72_0.13_80)] bg-gradient-to-tr from-[oklch(0.72_0.13_80_/_0.3)] via-[#151720] to-[#0a0c10] shadow-lg shadow-[oklch(0.72_0.13_80_/_0.2)] group-hover:scale-105 transition-transform duration-300">
                        <div className="absolute inset-1 rounded-full border border-dashed border-[oklch(0.85_0.14_90_/_0.5)]" />
                        <span className="font-serif text-2xl font-bold tracking-tight text-[oklch(0.85_0.14_90)] drop-shadow-md">
                          Z
                        </span>
                      </div>

                      <h3 className="mt-3 font-serif text-lg font-bold tracking-tight text-white leading-tight text-center">
                        <span className="block bg-gradient-to-r from-[#ffd875] via-[#f5d061] to-[#c59228] bg-clip-text text-transparent">
                          KECERDASAN
                        </span>
                        <span className="block bg-gradient-to-r from-[#f5d061] via-[#ffd875] to-[#c59228] bg-clip-text text-transparent">
                          BUATAN
                        </span>
                      </h3>

                      <div className="mt-1.5 h-[1px] w-24 bg-gradient-to-r from-transparent via-[oklch(0.72_0.13_80)] to-transparent" />

                      <p className="mt-2 max-w-[200px] text-center text-[8.5px] font-medium leading-tight text-neutral-300">
                        Fundamental · Sejarah · Metrik Pertumbuhan · Model Generatif
                      </p>
                    </div>

                    <div className="relative z-10 border-t border-[oklch(0.72_0.13_80_/_0.3)] pt-1.5 text-center flex items-center justify-between text-[7.5px]">
                      <span className="font-mono font-semibold tracking-wider text-[oklch(0.72_0.13_80)]">
                        ZETAGO-AURUM
                      </span>
                      <span className="text-neutral-400 uppercase tracking-wider">
                        2026 · Edisi I
                      </span>
                    </div>
                  </div>

                  {/* BACK COVER */}
                  <div
                    style={{
                      transform: 'rotateY(180deg) translateZ(22px)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                    className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-l-xl rounded-r-sm border-2 border-[oklch(0.72_0.13_80_/_0.85)] bg-[#090b10] p-5 text-left shadow-2xl"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#181a22] via-[#0b0c10] to-[#040507]" />
                    <div className="pointer-events-none absolute inset-1 rounded-lg border border-[oklch(0.85_0.14_90_/_0.3)]" />

                    <div className="relative z-10">
                      <div className="flex items-center gap-1 text-[8px] font-semibold uppercase tracking-wider text-[oklch(0.72_0.13_80)]">
                        <Award className="h-3 w-3" />
                        <span>Monograf Referensi Ilmiah</span>
                      </div>
                      <p className="mt-2 font-serif text-[10px] font-semibold text-white leading-snug">
                        Kajian Komprehensif Arsitektur AI, Jaringan Saraf, Transformer, & PyTorch.
                      </p>
                      <p className="mt-1.5 text-[7.5px] text-neutral-400 leading-relaxed">
                        Menghubungkan fondasi matematika kalkulus & probabilitas hingga siklus pelatihan skala besar (Pre-training, SFT, RLHF, DPO, Reasoning).
                      </p>
                    </div>

                    <div className="relative z-10 my-auto rounded-lg border border-[oklch(0.72_0.13_80_/_0.3)] bg-black/40 p-2.5 text-center">
                      <p className="font-serif text-[8.5px] italic text-[oklch(0.85_0.14_90)]">
                        "Melangkah maju, terus berinovasi, menghasilkan karya yang indah seperti emas."
                      </p>
                      <p className="mt-0.5 text-[7px] uppercase tracking-wider text-neutral-400">
                        - Falsafah ZetaGo-Aurum
                      </p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between border-t border-[oklch(0.72_0.13_80_/_0.3)] pt-1.5 text-[7.5px] text-neutral-400">
                      <span>ISBN: ZGA-AI-2026-01</span>
                      <span className="font-mono text-[oklch(0.72_0.13_80)]">ZetaGo-Aurum</span>
                    </div>
                  </div>

                  {/* SPINE FACE */}
                  <div
                    style={{
                      width: 44,
                      height: 390,
                      left: '50%',
                      marginLeft: -22,
                      transform: 'rotateY(-90deg) translateZ(135px)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                    className="absolute inset-y-0 flex flex-col items-center justify-between border-y-2 border-l-2 border-[oklch(0.72_0.13_80_/_0.85)] bg-gradient-to-b from-[#181a22] via-[#0b0c10] to-[#181a22] py-4 text-center shadow-lg"
                  >
                    <div className="w-full">
                      <div className="mx-auto h-[2px] w-6 bg-[oklch(0.72_0.13_80)]" />
                      <div className="mx-auto mt-1 h-[2px] w-6 bg-[oklch(0.72_0.13_80)]" />
                    </div>

                    <div
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      className="my-auto font-serif text-[9px] font-bold tracking-widest text-[oklch(0.85_0.14_90)]"
                    >
                      ZETAGO-AURUM · KECERDASAN BUATAN · 2026
                    </div>

                    <div className="w-full">
                      <div className="mx-auto h-[2px] w-6 bg-[oklch(0.72_0.13_80)]" />
                      <div className="mx-auto mt-1 h-[2px] w-6 bg-[oklch(0.72_0.13_80)]" />
                    </div>
                  </div>

                  {/* GILDED EDGES */}
                  <div
                    style={{
                      width: 44,
                      height: 390,
                      left: '50%',
                      marginLeft: -22,
                      transform: 'rotateY(90deg) translateZ(135px)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      backgroundImage:
                        'repeating-linear-gradient(to bottom, #d4af37 0px, #aa8218 1px, #f5d77f 2px, #8d6f30 3px)',
                    }}
                    className="absolute inset-y-0 rounded-r-sm border-y-2 border-r-2 border-[oklch(0.72_0.13_80_/_0.7)] shadow-inner"
                  />
                  <div
                    style={{
                      width: 270,
                      height: 44,
                      top: '50%',
                      marginTop: -22,
                      transform: 'rotateX(90deg) translateZ(195px)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      backgroundImage:
                        'repeating-linear-gradient(to right, #d4af37 0px, #aa8218 1px, #f5d77f 2px, #8d6f30 3px)',
                    }}
                    className="absolute inset-x-0 border-x-2 border-t-2 border-[oklch(0.72_0.13_80_/_0.7)] shadow-inner"
                  />
                  <div
                    style={{
                      width: 270,
                      height: 44,
                      top: '50%',
                      marginTop: -22,
                      transform: 'rotateX(-90deg) translateZ(195px)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      backgroundImage:
                        'repeating-linear-gradient(to right, #d4af37 0px, #aa8218 1px, #f5d77f 2px, #8d6f30 3px)',
                    }}
                    className="absolute inset-x-0 border-x-2 border-b-2 border-[oklch(0.72_0.13_80_/_0.7)] shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div
              aria-hidden
              className="pointer-events-none -mt-4 h-6 w-60 rounded-full bg-[oklch(0.72_0.13_80_/_0.2)] blur-xl"
            />

            <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setBookState('open')}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[oklch(0.72_0.13_80)] via-[oklch(0.85_0.14_90)] to-[oklch(0.72_0.13_80)] px-6 py-3 text-sm font-semibold text-neutral-950 shadow-xl shadow-[oklch(0.72_0.13_80_/_0.35)] transition-all hover:scale-105 active:scale-95"
              >
                <BookOpen className="h-4 w-4" />
                <span>{t('shelf.openBook')}</span>
              </button>

              <button
                onClick={reset3D}
                title="Reset Angle"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/70 px-4 py-3 text-xs font-medium text-foreground backdrop-blur-md transition-all hover:border-[oklch(0.72_0.13_80_/_0.5)] hover:text-[oklch(0.72_0.13_80)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('shelf.reset3d')}</span>
              </button>

              <button
                onClick={toggleFullscreen}
                title="Fullscreen Mode"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/70 px-4 py-3 text-xs font-medium text-foreground backdrop-blur-md transition-all hover:border-[oklch(0.72_0.13_80_/_0.5)] hover:text-[oklch(0.72_0.13_80)]"
              >
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">
                  {isFullscreen ? t('shelf.exitFullscreen') : t('shelf.fullscreen')}
                </span>
              </button>
            </div>

            <p className="relative z-10 mt-4 text-center text-xs text-muted-foreground">
              <Compass className="inline-block h-3.5 w-3.5 text-[oklch(0.72_0.13_80)] mr-1 align-sub" />
              {t('shelf.hint')}
            </p>
          </motion.div>
        ) : (
          /* =========================================================================
             2. OPEN PHYSICAL 3D BOOK SPREAD VIEW (MEMBACA LANGSUNG DARI BUKU 3D)
             ========================================================================= */
          <motion.div
            key="open-book"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className={cn(
              'relative flex w-full flex-col overflow-hidden bg-[#07090e] border border-[oklch(0.55_0.1_80_/_0.3)] shadow-2xl dark:border-border/70',
              isFullscreen
                ? 'h-screen w-screen rounded-none p-2 sm:p-6'
                : 'min-h-[720px] sm:min-h-[800px] rounded-3xl p-3 sm:p-8'
            )}
          >
            {/* Header Control Bar */}
            <div className="relative z-20 mb-4 flex items-center justify-between border-b border-border/60 pb-3 px-2 sm:px-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTocOpen(!tocOpen)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.72_0.13_80_/_0.4)] bg-[oklch(0.72_0.13_80_/_0.1)] px-3 py-1.5 text-xs font-semibold text-[oklch(0.72_0.13_80)] transition-all hover:bg-[oklch(0.72_0.13_80_/_0.2)]"
                >
                  <List className="h-3.5 w-3.5" />
                  <span>{t('shelf.tableOfContents')}</span>
                </button>

                <div className="hidden md:flex flex-col text-left ml-2">
                  <span className="font-serif text-xs font-bold text-foreground line-clamp-1">
                    Kecerdasan Buatan (AI)
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    ZetaGo-Aurum · Monograf Fisik 3D
                  </span>
                </div>
              </div>

              <div className="text-center text-xs font-mono text-muted-foreground">
                {isMobile ? (
                  <span>Halaman {currentPage + 1} dari {totalPages}</span>
                ) : (
                  <span>
                    Halaman {currentPage + 1} - {Math.min(totalPages, currentPage + 2)} dari {totalPages}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setPaperTheme((th) => (th === 'ivory' ? 'dark' : 'ivory'))}
                  title="Ubah Tema Kertas"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 text-muted-foreground hover:text-foreground"
                >
                  {paperTheme === 'ivory' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                </button>

                <button
                  onClick={() => setFontSize((s) => (s === 'normal' ? 'large' : 'normal'))}
                  title="Ubah Ukuran Huruf"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 text-muted-foreground hover:text-foreground"
                >
                  <Type className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={toggleFullscreen}
                  title="Layar Penuh"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 text-muted-foreground hover:text-foreground"
                >
                  {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>

                <button
                  onClick={() => setBookState('closed')}
                  className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-[oklch(0.72_0.13_80)]"
                >
                  <X className="h-3.5 w-3.5 text-[oklch(0.72_0.13_80)]" />
                  <span className="hidden sm:inline">{t('shelf.closeBook')}</span>
                </button>
              </div>
            </div>

            {/* Table of Contents Drawer */}
            <AnimatePresence>
              {tocOpen && (
                <motion.aside
                  initial={{ x: -320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -320, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-y-0 left-0 z-40 w-72 sm:w-80 border-r border-border/80 bg-[#0b0d13]/98 p-4 shadow-2xl backdrop-blur-2xl flex flex-col"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <span className="font-serif text-sm font-bold text-[oklch(0.72_0.13_80)]">
                      {t('shelf.tableOfContents')}
                    </span>
                    <button
                      onClick={() => setTocOpen(false)}
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <nav className="mt-3 flex-1 overflow-y-auto space-y-1 pr-1">
                    {aiBookData.sections.map((sec, sIdx) => {
                      const firstPageOfSec = aiBookPages.findIndex((p) => p.chapterIndex === sIdx)
                      const isCurrent =
                        leftPage?.chapterIndex === sIdx || rightPage?.chapterIndex === sIdx
                      return (
                        <button
                          key={sec.id}
                          onClick={() => jumpToChapter(sIdx)}
                          className={cn(
                            'flex w-full items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors',
                            isCurrent
                              ? 'bg-[oklch(0.72_0.13_80_/_0.15)] font-semibold text-[oklch(0.72_0.13_80)] border border-[oklch(0.72_0.13_80_/_0.3)]'
                              : 'text-neutral-400 hover:bg-card/60 hover:text-foreground'
                          )}
                        >
                          <span className="line-clamp-2 leading-relaxed">{sec.title}</span>
                          <span className="shrink-0 font-mono text-[10px] text-muted-foreground mt-0.5">
                            Hal. {firstPageOfSec + 1}
                          </span>
                        </button>
                      )
                    })}
                  </nav>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* =========================================================================
                THE 3D OPEN PHYSICAL BOOK RIG
               ========================================================================= */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative my-auto flex flex-1 items-center justify-center py-2 select-none"
              style={{
                perspective: 1600,
                perspectiveOrigin: '50% 50%',
              }}
            >
              {/* Outer Hardback Leather Cover Backing (Open Flat in 3D) */}
              <div
                className="relative flex items-center justify-center rounded-xl p-1.5 sm:p-3 shadow-2xl"
                style={{
                  background: 'radial-gradient(ellipse at center, #1b1e28 0%, #0c0e14 70%, #050609 100%)',
                  border: '2px solid oklch(0.72 0.13 80 / 0.6)',
                  boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 35px oklch(0.72 0.13 80 / 0.15)',
                }}
              >
                {/* Book Spine Seam & Silk Bookmark Ribbon */}
                <div className="pointer-events-none absolute inset-y-0 left-1/2 -ml-[2px] z-30 w-[4px] bg-gradient-to-r from-black/80 via-black/40 to-black/80" />

                {/* Silk Ribbon Bookmark hanging from center seam */}
                <div
                  onClick={() => setTocOpen(!tocOpen)}
                  title="Pita Pembatas Buku (Daftar Isi)"
                  className="cursor-pointer absolute top-0 left-1/2 -ml-2 z-35 flex flex-col items-center group"
                >
                  <div className="h-24 sm:h-32 w-4 bg-gradient-to-b from-[#d4af37] via-[#f5d061] to-[#aa8218] shadow-md group-hover:brightness-110 transition-all rounded-b-sm border-x border-[#aa8218]" />
                  <div className="w-0 h-0 border-x-[8px] border-x-transparent border-t-[8px] border-t-[#aa8218] -mt-1" />
                </div>

                {/* THE PHYSICAL SPREAD CONTAINER */}
                <div
                  className="relative flex items-stretch overflow-hidden rounded-lg shadow-inner"
                  style={{
                    width: isMobile ? 320 : 760,
                    maxWidth: '92vw',
                    height: isMobile ? 480 : 560,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* --- LEFT PAGE --- */}
                  <div
                    onClick={flipPrev}
                    className={cn(
                      'relative flex flex-col justify-between overflow-hidden p-4 sm:p-7 text-left transition-colors cursor-pointer',
                      isMobile ? 'w-full' : 'w-1/2',
                      paperTheme === 'ivory'
                        ? 'bg-[#fbf9f4] text-[#1c1f26]'
                        : 'bg-[#11141c] text-[#e0e3eb]'
                    )}
                    style={{
                      boxShadow: isMobile
                        ? 'inset 0 0 20px rgba(0,0,0,0.06)'
                        : 'inset -18px 0 25px -8px rgba(0,0,0,0.18), inset 0 0 10px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-1.5 text-[9px] sm:text-[10px] font-serif italic text-muted-foreground border-border/40">
                      <span>ZetaGo-Aurum · Monograf AI</span>
                      <span className="truncate max-w-[120px]">{leftPage?.shortTitle}</span>
                    </div>

                    {/* Page Content */}
                    <div
                      className={cn(
                        'flex-1 overflow-y-auto my-2 pr-1 space-y-3 font-serif leading-relaxed text-justify',
                        fontSize === 'normal' ? 'text-[11px] sm:text-[12.5px]' : 'text-[12.5px] sm:text-[14px]'
                      )}
                    >
                      {leftPage ? (
                        leftPage.paragraphs.map((p, pIdx) => {
                          const isKajian = p.startsWith('Kajian Khusus:')
                          const isHeading =
                            p.startsWith('BAB ') ||
                            p.startsWith('Kata Pengantar:') ||
                            p.startsWith('Ringkasan Eksekutif') ||
                            p.startsWith('Daftar Isi Lengkap') ||
                            p.startsWith('LAMPIRAN:')

                          if (isKajian) {
                            return (
                              <div
                                key={pIdx}
                                className="my-2 rounded-lg border border-[oklch(0.72_0.13_80_/_0.4)] bg-[oklch(0.72_0.13_80_/_0.08)] p-2.5 text-[10.5px] sm:text-[11.5px] shadow-sm"
                              >
                                <div className="font-sans text-[9px] font-bold uppercase tracking-wider text-[oklch(0.72_0.13_80)] mb-1">
                                  ✦ Kajian Khusus
                                </div>
                                <p className="leading-relaxed">{p.replace(/^Kajian Khusus:\s*/, '')}</p>
                              </div>
                            )
                          }

                          if (isHeading) {
                            return (
                              <h3
                                key={pIdx}
                                className="pt-2 font-serif text-sm sm:text-base font-bold text-[oklch(0.72_0.13_80)] border-b pb-1 border-border/30"
                              >
                                {p}
                              </h3>
                            )
                          }

                          return (
                            <p key={pIdx} className="leading-relaxed indent-3">
                              {p}
                            </p>
                          )
                        })
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          Halaman Kosong
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t pt-1.5 text-[9px] sm:text-[10px] font-mono text-muted-foreground border-border/40">
                      <span>Hal. {leftPage?.pageNumber || currentPage + 1}</span>
                      <span className="text-[8px] uppercase tracking-wider">ZetaGo-Aurum · 2026</span>
                    </div>

                    {!isMobile && (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/25 via-black/08 to-transparent"
                      />
                    )}
                  </div>

                  {/* --- RIGHT PAGE (Desktop Only) --- */}
                  {!isMobile && (
                    <div
                      onClick={flipNext}
                      className={cn(
                        'relative flex flex-col justify-between overflow-hidden p-4 sm:p-7 text-left transition-colors cursor-pointer w-1/2',
                        paperTheme === 'ivory'
                          ? 'bg-[#fbf9f4] text-[#1c1f26]'
                          : 'bg-[#11141c] text-[#e0e3eb]'
                      )}
                      style={{
                        boxShadow:
                          'inset 18px 0 25px -8px rgba(0,0,0,0.18), inset 0 0 10px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/25 via-black/08 to-transparent"
                      />

                      {/* Header */}
                      <div className="flex items-center justify-between border-b pb-1.5 text-[9px] sm:text-[10px] font-serif italic text-muted-foreground border-border/40">
                        <span className="truncate max-w-[150px]">{rightPage?.chapterTitle || 'Monograf'}</span>
                        <span>{rightPage?.shortTitle}</span>
                      </div>

                      {/* Page Content */}
                      <div
                        className={cn(
                          'flex-1 overflow-y-auto my-2 pr-1 space-y-3 font-serif leading-relaxed text-justify',
                          fontSize === 'normal' ? 'text-[11px] sm:text-[12.5px]' : 'text-[12.5px] sm:text-[14px]'
                        )}
                      >
                        {rightPage ? (
                          rightPage.paragraphs.map((p, pIdx) => {
                            const isKajian = p.startsWith('Kajian Khusus:')
                            const isHeading =
                              p.startsWith('BAB ') ||
                              p.startsWith('Kata Pengantar:') ||
                              p.startsWith('Ringkasan Eksekutif') ||
                              p.startsWith('Daftar Isi Lengkap') ||
                              p.startsWith('LAMPIRAN:')

                            if (isKajian) {
                              return (
                                <div
                                  key={pIdx}
                                  className="my-2 rounded-lg border border-[oklch(0.72_0.13_80_/_0.4)] bg-[oklch(0.72_0.13_80_/_0.08)] p-2.5 text-[10.5px] sm:text-[11.5px] shadow-sm"
                                >
                                  <div className="font-sans text-[9px] font-bold uppercase tracking-wider text-[oklch(0.72_0.13_80)] mb-1">
                                    ✦ Kajian Khusus
                                  </div>
                                  <p className="leading-relaxed">{p.replace(/^Kajian Khusus:\s*/, '')}</p>
                                </div>
                              )
                            }

                            if (isHeading) {
                              return (
                                <h3
                                  key={pIdx}
                                  className="pt-2 font-serif text-sm sm:text-base font-bold text-[oklch(0.72_0.13_80)] border-b pb-1 border-border/30"
                                >
                                  {p}
                                </h3>
                              )
                            }

                            return (
                              <p key={pIdx} className="leading-relaxed indent-3">
                                {p}
                              </p>
                            )
                          })
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            Akhir Naskah Monograf
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t pt-1.5 text-[9px] sm:text-[10px] font-mono text-muted-foreground border-border/40">
                        <span className="text-[8px] uppercase tracking-wider">Kecerdasan Buatan</span>
                        <span>Hal. {rightPage?.pageNumber || currentPage + 2}</span>
                      </div>
                    </div>
                  )}

                  {/* 3D TURNING PAGE LEAF ANIMATION */}
                  <AnimatePresence>
                    {flipDirection === 'next' && (
                      <motion.div
                        key="flip-leaf-next"
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: -180 }}
                        transition={{ duration: 0.55, ease: [0.645, 0.045, 0.355, 1] }}
                        style={{
                          transformOrigin: isMobile ? 'left center' : 'left center',
                          transformStyle: 'preserve-3d',
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: isMobile ? 0 : '50%',
                          width: isMobile ? '100%' : '50%',
                          zIndex: 30,
                        }}
                        className={cn(
                          'overflow-hidden shadow-2xl',
                          paperTheme === 'ivory' ? 'bg-[#fbf9f4]' : 'bg-[#11141c]'
                        )}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent" />
                      </motion.div>
                    )}

                    {flipDirection === 'prev' && (
                      <motion.div
                        key="flip-leaf-prev"
                        initial={{ rotateY: -180 }}
                        animate={{ rotateY: 0 }}
                        transition={{ duration: 0.55, ease: [0.645, 0.045, 0.355, 1] }}
                        style={{
                          transformOrigin: isMobile ? 'left center' : 'right center',
                          transformStyle: 'preserve-3d',
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: isMobile ? 0 : 0,
                          width: isMobile ? '100%' : '50%',
                          zIndex: 30,
                        }}
                        className={cn(
                          'overflow-hidden shadow-2xl',
                          paperTheme === 'ivory' ? 'bg-[#fbf9f4]' : 'bg-[#11141c]'
                        )}
                      >
                        <div className="absolute inset-0 bg-gradient-to-l from-black/30 via-black/10 to-transparent" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-20 mt-3 flex items-center justify-between border-t border-border/60 pt-3 px-2 sm:px-4">
              <button
                onClick={flipPrev}
                disabled={currentPage === 0 || flipDirection !== null}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/70 px-4 py-2 text-xs font-medium text-foreground disabled:opacity-25 disabled:pointer-events-none hover:border-[oklch(0.72_0.13_80)] active:scale-95 transition-all"
              >
                <ChevronLeft className="h-4 w-4 text-[oklch(0.72_0.13_80)]" />
                <span>Buka Lembar Sebelumnya</span>
              </button>

              <p className="hidden sm:block text-xs text-muted-foreground text-center">
                Klik lembar halaman atau tombol untuk membalik halaman fisik 3D
              </p>

              <button
                onClick={flipNext}
                disabled={currentPage + pageStep >= totalPages || flipDirection !== null}
                className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.72_0.13_80_/_0.5)] bg-[oklch(0.72_0.13_80_/_0.15)] px-4 py-2 text-xs font-semibold text-[oklch(0.72_0.13_80)] disabled:opacity-25 disabled:pointer-events-none hover:bg-[oklch(0.72_0.13_80_/_0.3)] active:scale-95 transition-all"
              >
                <span>Buka Lembar Selanjutnya</span>
                <ChevronRight className="h-4 w-4 text-[oklch(0.72_0.13_80)]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
