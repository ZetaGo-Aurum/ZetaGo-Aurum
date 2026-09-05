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
  Compass,
  Layers,
  Award,
} from 'lucide-react'
import { aiBookData } from '@/data/ai-book'
import { useLanguage } from '@/components/language-provider'
import { cn } from '@/lib/utils'

export function InteractiveBook() {
  const { t } = useLanguage()

  const [viewMode, setViewMode] = React.useState<'3d' | 'reading'>('3d')
  const [currentSectionIdx, setCurrentSectionIdx] = React.useState<number>(0)
  const [tocOpen, setTocOpen] = React.useState<boolean>(false)
  const [fontSize, setFontSize] = React.useState<'normal' | 'large' | 'huge'>('normal')
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false)

  const [rotX, setRotX] = React.useState<number>(10)
  const [rotY, setRotY] = React.useState<number>(-22)
  const [isDragging, setIsDragging] = React.useState<boolean>(false)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const readerScrollRef = React.useRef<HTMLDivElement>(null)
  const dragStartRef = React.useRef<{ x: number; y: number; rotX: number; rotY: number }>({
    x: 0,
    y: 0,
    rotX: 10,
    rotY: -22,
  })
  const velocityRef = React.useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 })
  const lastPointerRef = React.useRef<{ x: number; y: number; time: number }>({
    x: 0,
    y: 0,
    time: 0,
  })
  const reqAnimRef = React.useRef<number | null>(null)

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
    if (viewMode !== '3d') return

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
  }, [viewMode, isDragging])

  const onPointerDown = (e: React.PointerEvent) => {
    if (viewMode !== '3d') return
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY, rotX, rotY }
    lastPointerRef.current = { x: e.clientX, y: e.clientY, time: performance.now() }
    velocityRef.current = { vx: 0, vy: 0 }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || viewMode !== '3d') return
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
    setRotX(10)
    setRotY(-22)
    velocityRef.current = { vx: 0, vy: 0 }
  }

  const nextSection = () => {
    if (currentSectionIdx < aiBookData.sections.length - 1) {
      setCurrentSectionIdx((i) => i + 1)
      readerScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevSection = () => {
    if (currentSectionIdx > 0) {
      setCurrentSectionIdx((i) => i - 1)
      readerScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const jumpToSection = (idx: number) => {
    setCurrentSectionIdx(idx)
    setTocOpen(false)
    readerScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === 'reading') {
        if (e.key === 'ArrowRight') nextSection()
        if (e.key === 'ArrowLeft') prevSection()
        if (e.key === 'Escape') {
          if (tocOpen) setTocOpen(false)
          else setViewMode('3d')
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewMode, currentSectionIdx, tocOpen])

  const touchStartXRef = React.useRef<number>(0)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current
    if (Math.abs(deltaX) > 60) {
      if (deltaX < 0) nextSection()
      else prevSection()
    }
  }

  const currentSection = aiBookData.sections[currentSectionIdx]

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative mx-auto flex w-full flex-col items-center overflow-hidden rounded-3xl transition-all duration-300',
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen w-screen rounded-none bg-[#07080c] p-0'
          : 'max-w-6xl'
      )}
    >
      <AnimatePresence mode="wait">
        {viewMode === '3d' ? (
          <motion.div
            key="view-3d"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="relative flex min-h-[580px] sm:min-h-[660px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-[oklch(0.55_0.1_80_/_0.3)] bg-[#090b10] p-4 py-8 shadow-2xl dark:border-border/70 sm:p-8"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div className="h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-[oklch(0.72_0.13_80_/_0.18)] via-[#c87046]/10 to-transparent blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(rgba(200,112,70,0.1)_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
            </div>

            <div className="relative z-10 mb-5 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.72_0.13_80_/_0.4)] bg-[oklch(0.72_0.13_80_/_0.1)] px-3.5 py-1 text-xs font-semibold text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>MONOGRAF RESMI 2026</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md">
                <Layers className="h-3 w-3" />
                <span>14 Bab · 21.500+ Kata</span>
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
                  <div
                    style={{
                      transform: 'translateZ(20px)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                    className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-r-xl rounded-l-sm border-2 border-[oklch(0.72_0.13_80_/_0.85)] bg-[#0a0c10] p-5 shadow-2xl"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1b1e26] via-[#0b0d12] to-[#040507]" />
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
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-[oklch(0.72_0.13_80)] bg-gradient-to-tr from-[oklch(0.72_0.13_80_/_0.3)] via-[#151720] to-[#0a0c10] shadow-lg shadow-[oklch(0.72_0.13_80_/_0.2)]">
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

                    <div className="relative z-10 border-t border-[oklch(0.72_0.13_80_/_0.3)] pt-1.5 text-center">
                      <p className="font-mono text-[8.5px] font-semibold tracking-wider text-[oklch(0.72_0.13_80)]">
                        ZETAGO-AURUM
                      </p>
                      <p className="text-[7px] tracking-widest text-neutral-400 uppercase">
                        Edisi Pertama · 2026
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      transform: 'rotateY(180deg) translateZ(20px)',
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

                  <div
                    style={{
                      width: 40,
                      height: 390,
                      left: '50%',
                      marginLeft: -20,
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

                  <div
                    style={{
                      width: 40,
                      height: 390,
                      left: '50%',
                      marginLeft: -20,
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
                      height: 40,
                      top: '50%',
                      marginTop: -20,
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
                      height: 40,
                      top: '50%',
                      marginTop: -20,
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
                onClick={() => setViewMode('reading')}
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
          <motion.div
            key="view-reading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className={cn(
              'relative flex w-full flex-col overflow-hidden bg-[#090b10] border border-[oklch(0.55_0.1_80_/_0.3)] shadow-2xl dark:border-border/70',
              isFullscreen
                ? 'h-screen w-screen rounded-none'
                : 'h-[720px] sm:h-[820px] rounded-3xl'
            )}
          >
            <header className="relative z-20 flex items-center justify-between border-b border-border/80 bg-[#0d1017]/95 px-4 py-3 backdrop-blur-xl sm:px-6">
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
                    {aiBookData.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    ZetaGo-Aurum (2026)
                  </span>
                </div>
              </div>

              <div className="text-center max-w-[200px] sm:max-w-md truncate px-2">
                <span className="text-xs font-medium text-foreground">
                  {currentSection.shortTitle}: {currentSection.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFontSize((s) => (s === 'normal' ? 'large' : s === 'large' ? 'huge' : 'normal'))
                  }}
                  title="Ubah Ukuran Teks"
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
                  onClick={() => setViewMode('3d')}
                  className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-[oklch(0.72_0.13_80)]"
                >
                  <X className="h-3.5 w-3.5 text-[oklch(0.72_0.13_80)]" />
                  <span className="hidden sm:inline">{t('shelf.closeBook')}</span>
                </button>
              </div>
            </header>

            <div className="relative flex flex-1 overflow-hidden">
              <AnimatePresence>
                {tocOpen && (
                  <motion.aside
                    initial={{ x: -320, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -320, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-y-0 left-0 z-30 w-72 sm:w-80 border-r border-border/80 bg-[#0b0d13]/98 p-4 shadow-2xl backdrop-blur-2xl flex flex-col"
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
                      {aiBookData.sections.map((sec, idx) => {
                        const isCurrent = idx === currentSectionIdx
                        return (
                          <button
                            key={sec.id}
                            onClick={() => jumpToSection(idx)}
                            className={cn(
                              'flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors',
                              isCurrent
                                ? 'bg-[oklch(0.72_0.13_80_/_0.15)] font-semibold text-[oklch(0.72_0.13_80)] border border-[oklch(0.72_0.13_80_/_0.3)]'
                                : 'text-neutral-400 hover:bg-card/60 hover:text-foreground'
                            )}
                          >
                            <span className="shrink-0 font-mono text-[10px] text-muted-foreground mt-0.5">
                              {idx + 1}.
                            </span>
                            <span className="line-clamp-2 leading-relaxed">{sec.title}</span>
                          </button>
                        )
                      })}
                    </nav>
                  </motion.aside>
                )}
              </AnimatePresence>

              <main
                ref={readerScrollRef}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="flex-1 overflow-y-auto px-4 py-8 sm:px-12 lg:px-20 text-foreground bg-[#0a0c11]"
              >
                <div className="mx-auto max-w-3xl">
                  <div className="mb-8 border-b border-[oklch(0.72_0.13_80_/_0.3)] pb-6 text-center">
                    <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[oklch(0.72_0.13_80)]">
                      {currentSection.shortTitle}
                    </span>
                    <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl leading-tight">
                      {currentSection.title}
                    </h1>
                    <div className="mx-auto mt-3 h-[1px] w-20 bg-[oklch(0.72_0.13_80)]" />
                  </div>

                  <div
                    className={cn(
                      'space-y-5 leading-relaxed text-neutral-300 font-sans transition-all',
                      fontSize === 'normal' && 'text-sm sm:text-base',
                      fontSize === 'large' && 'text-base sm:text-lg',
                      fontSize === 'huge' && 'text-lg sm:text-xl'
                    )}
                  >
                    {currentSection.paragraphs.map((para, pIdx) => {
                      const isKajian = para.startsWith('Kajian Khusus:')
                      const isHeading =
                        para.startsWith('BAB ') ||
                        para.startsWith('Kata Pengantar:') ||
                        para.startsWith('Ringkasan Eksekutif') ||
                        para.startsWith('Daftar Isi Lengkap') ||
                        para.startsWith('Definisi Konsensus') ||
                        para.startsWith('LAMPIRAN:')

                      if (isKajian) {
                        return (
                          <div
                            key={pIdx}
                            className="my-6 rounded-2xl border border-[oklch(0.72_0.13_80_/_0.4)] bg-[oklch(0.72_0.13_80_/_0.08)] p-5 text-foreground shadow-md backdrop-blur-sm"
                          >
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[oklch(0.72_0.13_80)]">
                              <Sparkles className="h-4 w-4" />
                              <span>{para.slice(0, 45)}</span>
                            </div>
                            <p className="mt-2 text-neutral-200 leading-relaxed">
                              {para.replace(/^Kajian Khusus:\s*/, '')}
                            </p>
                          </div>
                        )
                      }

                      if (isHeading) {
                        return (
                          <h2
                            key={pIdx}
                            className="pt-6 font-serif text-lg font-bold text-white sm:text-xl border-b border-border/50 pb-2"
                          >
                            {para}
                          </h2>
                        )
                      }

                      return (
                        <p key={pIdx} className="text-justify text-neutral-300 leading-relaxed">
                          {para}
                        </p>
                      )
                    })}
                  </div>
                </div>
              </main>
            </div>

            <footer className="relative z-20 flex items-center justify-between border-t border-border/80 bg-[#0d1017]/95 px-4 py-3 backdrop-blur-xl sm:px-6">
              <button
                onClick={prevSection}
                disabled={currentSectionIdx === 0}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/60 px-4 py-1.5 text-xs font-medium text-foreground disabled:opacity-30 disabled:pointer-events-none hover:border-[oklch(0.72_0.13_80)]"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>{t('shelf.prevChapter')}</span>
              </button>

              <div className="text-center text-xs text-muted-foreground hidden sm:block">
                Bab {currentSectionIdx + 1} dari {aiBookData.sections.length} ·{' ' }
                {Math.round(((currentSectionIdx + 1) / aiBookData.sections.length) * 100)}%
              </div>

              <button
                onClick={nextSection}
                disabled={currentSectionIdx === aiBookData.sections.length - 1}
                className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.72_0.13_80_/_0.5)] bg-[oklch(0.72_0.13_80_/_0.15)] px-4 py-1.5 text-xs font-semibold text-[oklch(0.72_0.13_80)] disabled:opacity-30 disabled:pointer-events-none hover:bg-[oklch(0.72_0.13_80_/_0.3)]"
              >
                <span>{t('shelf.nextChapter')}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
