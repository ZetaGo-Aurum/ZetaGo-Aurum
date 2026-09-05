'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'
import { CompleteShelfLandingPage } from "@designcodeio/threeui"
import "@designcodeio/threeui/style.css"
import { Move3d, BookOpen, Layers, Cpu, Sparkles, X, ShieldCheck } from 'lucide-react'

export function ShelfSection() {
  const { t } = useLanguage()
  const reduce = useReducedMotion()
  const sectionRef = React.useRef<HTMLElement>(null)

  const [hasEnteredViewport, setHasEnteredViewport] = React.useState(false)
  const [isInViewport, setIsInViewport] = React.useState(true)
  const [isLowSpecOrTouch, setIsLowSpecOrTouch] = React.useState(false)
  const [is3DActive, setIs3DActive] = React.useState(false)

  // Hardware and viewport capability detection on mount
  React.useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const isSmallScreen = window.innerWidth < 768
    const isLowCore =
      typeof navigator !== 'undefined' && navigator.hardwareConcurrency
        ? navigator.hardwareConcurrency <= 4
        : false
    const isDataSaver =
      typeof navigator !== 'undefined' && (navigator as any).connection?.saveData === true

    if (isTouch || isSmallScreen || isLowCore || isDataSaver) {
      setIsLowSpecOrTouch(true)
      setIs3DActive(false)
    } else {
      // High-performance desktop with fine pointer: auto-activate when scrolled near
      setIsLowSpecOrTouch(false)
      setIs3DActive(true)
    }
  }, [])

  // Viewport IntersectionObserver to trigger lazy mounting & offscreen suspension
  React.useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting)
        if (entry.isIntersecting) {
          setHasEnteredViewport(true)
        }
      },
      { threshold: 0.02, rootMargin: '250px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="shelf" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center sm:mb-14"
        >
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]">
            {t('shelf.eyebrow')}
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t('shelf.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            {t('shelf.subtitle')}
          </p>
        </motion.div>

        {/* 3D Shelf Viewport Container */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mx-auto flex w-full max-w-6xl flex-col items-center"
        >
          <div className="relative h-[560px] sm:h-[680px] lg:h-[780px] w-full overflow-hidden rounded-3xl border border-[oklch(0.55_0.1_80_/_0.3)] bg-[#0a0c10] shadow-2xl shadow-black/30 dark:border-border/70 dark:shadow-[oklch(0.72_0.13_80_/_0.06)]">
            {/* Desktop Auto-Mount or Mobile Active 3D Mode */}
            {hasEnteredViewport && is3DActive ? (
              <div className="relative h-full w-full">
                <CompleteShelfLandingPage
                  suspended={!isInViewport}
                  headingFont="iowan-old-style"
                  bodyFont="inter"
                  headingWeight="400"
                  bodyWeight="400"
                  primaryColor="#c87046"
                  headingSize={60}
                  bodySize={12}
                  headingLetterSpacing={-0.055}
                />

                {/* Mobile Floating Deactivation Pill */}
                {isLowSpecOrTouch && (
                  <button
                    onClick={() => setIs3DActive(false)}
                    className="absolute top-4 right-4 z-30 flex items-center gap-1.5 rounded-full border border-[oklch(0.72_0.13_80_/_0.4)] bg-black/80 px-3.5 py-1.5 text-xs font-medium text-white shadow-xl backdrop-blur-md transition-all hover:bg-black active:scale-95"
                  >
                    <X className="h-3.5 w-3.5 text-[oklch(0.72_0.13_80)]" />
                    <span>{t('shelf.exit3d')}</span>
                  </button>
                )}
              </div>
            ) : (
              /* High-Taste Low-End / Mobile Preview Stage Card */
              <div className="relative flex h-full w-full flex-col items-center justify-center p-6 text-center sm:p-12 overflow-hidden">
                {/* Ambient Radial Background Glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                  <div className="h-[360px] w-[360px] rounded-full bg-gradient-to-tr from-[oklch(0.72_0.13_80_/_0.15)] via-[#c87046]/10 to-transparent blur-3xl" />
                </div>

                {/* Geometric Grid Accent */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(200,112,70,0.12)_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
                />

                <div className="relative z-10 flex max-w-lg flex-col items-center">
                  {/* Glowing 3D Icon Badge */}
                  <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-[oklch(0.72_0.13_80_/_0.4)] bg-[oklch(0.72_0.13_80_/_0.1)] shadow-xl shadow-[oklch(0.72_0.13_80_/_0.15)]">
                    <BookOpen className="h-9 w-9 text-[oklch(0.72_0.13_80)]" strokeWidth={1.8} />
                    <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[oklch(0.72_0.13_80)] text-[10px] font-bold text-neutral-950">
                      3D
                    </div>
                  </div>

                  {/* Feature Badges */}
                  <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-[11px] font-medium text-foreground/90 backdrop-blur-md">
                      <Layers className="h-3 w-3 text-[oklch(0.72_0.13_80)]" />
                      {t('shelf.feature.volumes')}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-[11px] font-medium text-foreground/90 backdrop-blur-md">
                      <Cpu className="h-3 w-3 text-[oklch(0.72_0.13_80)]" />
                      {t('shelf.feature.engine')}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-[11px] font-medium text-[oklch(0.72_0.13_80)] backdrop-blur-md">
                      <ShieldCheck className="h-3 w-3" />
                      {t('shelf.feature.optimized')}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
                    {t('shelf.previewTitle')}
                  </h3>

                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {t('shelf.previewDesc')}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground/75">
                    {t('shelf.deviceHint')}
                  </p>

                  {/* Primary Launch Action Button */}
                  <button
                    onClick={() => {
                      setHasEnteredViewport(true)
                      setIs3DActive(true)
                    }}
                    className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[oklch(0.72_0.13_80)] to-[oklch(0.85_0.14_90)] px-6 py-3 text-sm font-semibold text-neutral-950 shadow-lg shadow-[oklch(0.72_0.13_80_/_0.3)] transition-all hover:scale-105 active:scale-98"
                  >
                    <Move3d className="h-4 w-4" />
                    <span>{t('shelf.launch3d')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Move3d className="h-3.5 w-3.5 text-[oklch(0.72_0.13_80)]" />
              <span>{t('shelf.hint')}</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
