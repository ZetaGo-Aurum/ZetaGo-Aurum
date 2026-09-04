'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCcw,
  Play,
  Pause,
  Compass,
  ArrowUpRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Info,
} from 'lucide-react'
import { orbitalNodes, type OrbitalNode } from '@/lib/site-data'
import { useLanguage } from '@/components/language-provider'
import { cn } from '@/lib/utils'

interface OrbitalNavigationProps {
  className?: string
}

type FilterCategory = 'all' | 'faction' | 'package' | 'security' | 'tool'

const filterKeys: { id: FilterCategory; labelKey: string }[] = [
  { id: 'all', labelKey: 'orbital.filter.all' },
  { id: 'faction', labelKey: 'orbital.filter.faction' },
  { id: 'package', labelKey: 'orbital.filter.packages' },
  { id: 'security', labelKey: 'orbital.filter.security' },
  { id: 'tool', labelKey: 'orbital.filter.tools' },
]

const accentBorder: Record<OrbitalNode['accent'], string> = {
  gold: 'border-[oklch(0.72_0.13_80_/_0.5)] dark:border-[oklch(0.82_0.14_85_/_0.6)] shadow-[oklch(0.72_0.13_80_/_0.2)]',
  soft: 'border-border/80 shadow-black/5',
  bright: 'border-[oklch(0.85_0.14_90_/_0.6)] dark:border-[oklch(0.88_0.13_88_/_0.6)] shadow-[oklch(0.85_0.14_90_/_0.25)]',
}

const accentGlow: Record<OrbitalNode['accent'], string> = {
  gold: 'from-[oklch(0.72_0.13_80_/_0.25)] to-transparent',
  soft: 'from-muted/20 to-transparent',
  bright: 'from-[oklch(0.85_0.14_90_/_0.3)] to-transparent',
}

const accentIconColor: Record<OrbitalNode['accent'], string> = {
  gold: 'text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.82_0.14_85)]',
  soft: 'text-muted-foreground',
  bright: 'text-[oklch(0.85_0.14_90)] dark:text-[oklch(0.9_0.12_90)]',
}

export function OrbitalNavigation({ className }: OrbitalNavigationProps) {
  const { t, lang } = useLanguage()

  // 3D Orbital Rotation & Camera State
  const [rotX, setRotX] = React.useState<number>(18) // Pitch in degrees
  const [rotY, setRotY] = React.useState<number>(0) // Yaw in degrees
  const [autoOrbit, setAutoOrbit] = React.useState<boolean>(true)
  const [activeCategory, setActiveCategory] = React.useState<FilterCategory>('all')
  const [hoveredNode, setHoveredNode] = React.useState<OrbitalNode | null>(null)
  const [selectedNode, setSelectedNode] = React.useState<OrbitalNode | null>(null)
  const [tappedNode, setTappedNode] = React.useState<OrbitalNode | null>(null) // mobile tap detail
  const [isDragging, setIsDragging] = React.useState<boolean>(false)
  const isMobile = React.useRef<boolean>(false)

  // Detect touch device on mount
  React.useEffect(() => {
    isMobile.current = window.matchMedia('(pointer: coarse)').matches
  }, [])

  // Interaction refs for gesture physics
  const containerRef = React.useRef<HTMLDivElement>(null)
  const dragStartRef = React.useRef<{ x: number; y: number; rotX: number; rotY: number }>({
    x: 0,
    y: 0,
    rotX: 18,
    rotY: 0,
  })
  const velocityRef = React.useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 })
  const lastPointerRef = React.useRef<{ x: number; y: number; time: number }>({
    x: 0,
    y: 0,
    time: 0,
  })
  const reqAnimRef = React.useRef<number | null>(null)

  // Animation Loop for Auto Orbit and Inertia Damping
  React.useEffect(() => {
    let lastTime = performance.now()

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time

      if (!isDragging) {
        // Apply inertia velocity
        if (Math.abs(velocityRef.current.vx) > 0.001 || Math.abs(velocityRef.current.vy) > 0.001) {
          setRotY((y) => (y + velocityRef.current.vx * dt * 60) % 360)
          setRotX((x) => Math.max(-65, Math.min(65, x + velocityRef.current.vy * dt * 60)))

          // Damping
          velocityRef.current.vx *= 0.94
          velocityRef.current.vy *= 0.94
        } else if (autoOrbit) {
          // Slow continuous ambient orbit
          setRotY((y) => (y + 12 * dt) % 360)
        }
      }

      reqAnimRef.current = requestAnimationFrame(loop)
    }

    reqAnimRef.current = requestAnimationFrame(loop)
    return () => {
      if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current)
    }
  }, [isDragging, autoOrbit])

  // Refs for drag vs click distinction and hover tooltip bridge
  const didDragRef = React.useRef<boolean>(false)
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const showTooltip = (node: OrbitalNode) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setHoveredNode(node)
  }

  const hideTooltipDelayed = () => {
    hoverTimeoutRef.current = setTimeout(() => setHoveredNode(null), 120)
  }

  const cancelHideTooltip = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
  }

  // Mouse wheel interaction on PC (scroll to rotate 3D constellation)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    setAutoOrbit(false)
    const delta = e.deltaY || e.deltaX
    setRotY((prev) => (prev + delta * 0.08) % 360)
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      setRotX((prev) => Math.max(-65, Math.min(65, prev + e.deltaX * 0.04)))
    }
  }

  // Pointer & Touch Events (works on both PC mouse and Android touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    setIsDragging(true)
    didDragRef.current = false
    setAutoOrbit(false)
    dragStartRef.current = { x: e.clientX, y: e.clientY, rotX, rotY }
    lastPointerRef.current = { x: e.clientX, y: e.clientY, time: performance.now() }
    velocityRef.current = { vx: 0, vy: 0 }
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y

    // Mark as actual drag only after 4px movement
    if (!didDragRef.current && Math.sqrt(dx * dx + dy * dy) > 4) {
      didDragRef.current = true
    }

    const now = performance.now()
    const dt = Math.max(now - lastPointerRef.current.time, 1)
    velocityRef.current = {
      vx: ((e.clientX - lastPointerRef.current.x) / dt) * 18,
      vy: -((e.clientY - lastPointerRef.current.y) / dt) * 14,
    }
    lastPointerRef.current = { x: e.clientX, y: e.clientY, time: now }

    setRotY((dragStartRef.current.rotY + dx * 0.45) % 360)
    setRotX(Math.max(-65, Math.min(65, dragStartRef.current.rotX - dy * 0.35)))
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false)
    if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId)
    }
  }


  // Manual Step Controls
  const rotateStep = (dir: 'left' | 'right' | 'up' | 'down') => {
    setAutoOrbit(false)
    if (dir === 'left') setRotY((y) => (y - 30) % 360)
    if (dir === 'right') setRotY((y) => (y + 30) % 360)
    if (dir === 'up') setRotX((x) => Math.min(60, x + 15))
    if (dir === 'down') setRotX((x) => Math.max(-60, x - 15))
  }

  const resetConstellation = () => {
    setRotX(18)
    setRotY(0)
    velocityRef.current = { vx: 0, vy: 0 }
    setAutoOrbit(true)
    setActiveCategory('all')
    setSelectedNode(null)
  }

  // 3D Math Projection Engine
  // Converts spherical orbital angles to real-time 3D coordinates and camera projection
  const projectedNodes = React.useMemo(() => {
    const radX = (rotX * Math.PI) / 180
    const radY = (rotY * Math.PI) / 180
    const cameraDist = 800

    return orbitalNodes.map((node) => {
      // Ring radii & inclination tilt in 3D
      let radius = 140
      let ringTilt = 0
      if (node.ring === 1) {
        radius = 145
        ringTilt = 12
      } else if (node.ring === 2) {
        radius = 225
        ringTilt = -18
      } else {
        radius = 305
        ringTilt = 28
      }

      const nodeAngleRad = (node.angle * Math.PI) / 180
      const tiltRad = (ringTilt * Math.PI) / 180

      // Coordinate on tilted orbital plane
      const rawX = radius * Math.cos(nodeAngleRad)
      const rawY = radius * Math.sin(nodeAngleRad) * Math.sin(tiltRad)
      const rawZ = radius * Math.sin(nodeAngleRad) * Math.cos(tiltRad)

      // Apply Yaw (Y-axis rotation)
      const x1 = rawX * Math.cos(radY) + rawZ * Math.sin(radY)
      const y1 = rawY
      const z1 = -rawX * Math.sin(radY) + rawZ * Math.cos(radY)

      // Apply Pitch (X-axis rotation)
      const x2 = x1
      const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX)
      const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX)

      // Perspective Projection
      const perspectiveScale = cameraDist / (cameraDist - z2)
      const screenX = x2 * perspectiveScale
      const screenY = y2 * perspectiveScale

      // Depth calculations
      const depthFactor = (z2 + 320) / 640 // normalized 0..1
      const scale = Math.max(0.68, Math.min(1.22, perspectiveScale * (0.75 + depthFactor * 0.4)))
      const opacity = Math.max(0.32, Math.min(1.0, 0.4 + depthFactor * 0.6))
      const zIndex = Math.round(z2 + 500)
      const isFront = z2 > 0
      const blur = isFront ? 0 : Math.max(0, Math.min(2.5, (-z2 / 300) * 2.5))

      const matchesCategory =
        activeCategory === 'all' ||
        (activeCategory === 'faction' && node.category === 'faction') ||
        (activeCategory === 'package' && node.category === 'package') ||
        (activeCategory === 'security' && node.category === 'security') ||
        (activeCategory === 'tool' && (node.category === 'tool' || node.category === 'core'))

      return {
        node,
        screenX,
        screenY,
        z: z2,
        scale,
        opacity: matchesCategory ? opacity : opacity * 0.22,
        zIndex: matchesCategory ? zIndex : zIndex - 100,
        blur,
        isFront,
        matchesCategory,
      }
    })
  }, [rotX, rotY, activeCategory])

  return (
    <div className={cn('relative mx-auto flex w-full max-w-6xl flex-col items-center', className)}>
      {/* Top Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 px-4">
        {filterKeys.map((item) => {
          const isActive = activeCategory === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveCategory(item.id)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200',
                isActive
                  ? 'bg-[oklch(0.72_0.13_80)] text-white shadow-md shadow-[oklch(0.72_0.13_80_/_0.35)] dark:bg-[oklch(0.82_0.14_85)] dark:text-neutral-950'
                  : 'border border-border/70 bg-card/60 text-muted-foreground hover:border-[oklch(0.72_0.13_80_/_0.5)] hover:text-foreground'
              )}
            >
              {t(item.labelKey as any)}
            </button>
          )
        })}
      </div>

      {/* 3D Interactive Viewport Container */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
        className={cn(
          'relative flex h-[520px] w-full max-w-[760px] select-none items-center justify-center overflow-hidden rounded-3xl backdrop-blur-xl',
          'border border-[oklch(0.55_0.1_80_/_0.3)] dark:border-border/70',
          'bg-[oklch(0.97_0.02_80_/_0.7)] dark:bg-card/40',
          'cursor-grab active:cursor-grabbing shadow-2xl shadow-black/8 dark:shadow-[oklch(0.72_0.13_80_/_0.06)]'
        )}
      >
        {/* Ambient Radial Lighting */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="h-[360px] w-[360px] rounded-full bg-gradient-to-tr from-[oklch(0.72_0.13_80_/_0.2)] via-[oklch(0.85_0.14_90_/_0.12)] to-transparent blur-3xl dark:from-[oklch(0.82_0.14_85_/_0.18)]" />
        </div>


        {/* 3D Coordinate Plane Grid / Orbit Rings */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{
            perspective: 800,
            perspectiveOrigin: '50% 50%',
          }}
        >
          {/* Ring 1 (Inner) */}
          <div
            className="absolute rounded-full border border-dashed border-[oklch(0.55_0.12_80_/_0.65)] dark:border-[oklch(0.82_0.14_85_/_0.45)] transition-transform duration-75"
            style={{
              width: 290,
              height: 290,
              transform: `rotateX(${rotX + 12}deg) rotateY(${rotY}deg) translateZ(0px)`,
            }}
          />

          {/* Ring 2 (Mid) */}
          <div
            className="absolute rounded-full border border-dashed border-[oklch(0.5_0.1_75_/_0.5)] dark:border-[oklch(0.82_0.14_85_/_0.35)] transition-transform duration-75"
            style={{
              width: 450,
              height: 450,
              transform: `rotateX(${rotX - 18}deg) rotateY(${rotY}deg) translateZ(0px)`,
            }}
          />

          {/* Ring 3 (Outer) */}
          <div
            className="absolute rounded-full border border-dotted border-[oklch(0.55_0.12_80_/_0.4)] dark:border-[oklch(0.82_0.14_85_/_0.28)] transition-transform duration-75"
            style={{
              width: 610,
              height: 610,
              transform: `rotateX(${rotX + 28}deg) rotateY(${rotY}deg) translateZ(0px)`,
            }}
          />
        </div>


        {/* Central Luminous Core (ZetaGo Aurum Sun) */}
        <div
          className="relative z-20 flex flex-col items-center justify-center transition-transform duration-75"
          style={{
            transform: `scale(${0.9 + (rotX / 180) * 0.1})`,
          }}
        >
          <div className="group relative flex h-24 w-24 items-center justify-center">
            {/* Pulsing Energy Waves */}
            <div className="absolute inset-0 animate-ping rounded-full bg-[oklch(0.72_0.13_80_/_0.15)] opacity-40 duration-1000" />
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-[oklch(0.72_0.13_80_/_0.3)] to-[oklch(0.85_0.14_90_/_0.1)] blur-md animate-gold-pulse" />

            {/* Gyroscope Rings */}
            <div
              className="absolute inset-[-12px] rounded-full border border-[oklch(0.72_0.13_80_/_0.4)] dark:border-[oklch(0.82_0.14_85_/_0.5)]"
              style={{
                transform: `rotateX(${rotX * 1.5}deg) rotateY(${rotY * 1.5}deg)`,
              }}
            />
            <div
              className="absolute inset-[-20px] rounded-full border border-dashed border-[oklch(0.85_0.14_90_/_0.3)]"
              style={{
                transform: `rotateX(${-rotX * 1.2}deg) rotateY(${-rotY * 1.2}deg)`,
              }}
            />

            {/* Core Golden Sphere */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.9_0.14_92)] via-[oklch(0.75_0.14_82)] to-[oklch(0.6_0.12_70)] shadow-lg shadow-[oklch(0.72_0.13_80_/_0.45)]">
              <span className="font-serif text-2xl font-bold text-white drop-shadow-md">Z</span>
            </div>
          </div>
          <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]">
            {t('orbital.center.label')}
          </span>
        </div>

        {/* 3D Projected Celestial Nodes */}
        {projectedNodes.map(
          ({ node, screenX, screenY, scale, opacity, zIndex, blur, matchesCategory }) => {
            const isHovered = hoveredNode?.id === node.id
            const isTapped = tappedNode?.id === node.id
            const showDetail = isHovered || isTapped
            const isSelected = selectedNode?.id === node.id

            return (
              <div
                key={node.id}
                className="absolute left-1/2 top-1/2 will-change-transform"
                style={{
                  transform: `translate3d(calc(${screenX}px - 50%), calc(${screenY}px - 50%), 0) scale(${
                    showDetail ? scale * 1.18 : scale
                  })`,
                  opacity,
                  zIndex: showDetail || isSelected ? 999 : zIndex,
                  filter: blur > 0 && !showDetail ? `blur(${blur}px)` : 'none',
                  transition: isDragging
                    ? 'none'
                    : 'transform 0.15s ease-out, opacity 0.15s ease-out',
                }}
                onMouseEnter={() => {
                  if (!isMobile.current) showTooltip(node)
                }}
                onMouseLeave={() => {
                  if (!isMobile.current) hideTooltipDelayed()
                }}
              >
                <a
                  href={node.href}
                  target={node.external ? '_blank' : undefined}
                  rel={node.external ? 'noopener noreferrer' : undefined}
                  onClick={(e) => {
                    // Block navigation if user was actually dragging
                    if (didDragRef.current) {
                      e.preventDefault()
                      return
                    }
                    if (isMobile.current) {
                      e.preventDefault()
                      // Mobile: tap to toggle detail card
                      setTappedNode(isTapped ? null : node)
                      setAutoOrbit(false)
                    }
                    // PC: href navigates normally in new tab
                  }}
                  className={cn(
                    'group relative flex items-center gap-2 rounded-full border bg-card/90 px-3.5 py-2 text-xs font-medium shadow-lg backdrop-blur-md transition-all duration-200',
                    accentBorder[node.accent],
                    showDetail &&
                      'ring-2 ring-[oklch(0.72_0.13_80)] shadow-xl shadow-[oklch(0.72_0.13_80_/_0.3)] scale-105',
                    !matchesCategory && 'pointer-events-none'
                  )}
                >
                  {/* Subtle Accent Radial Glow */}
                  <div
                    className={cn(
                      'pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r opacity-50',
                      accentGlow[node.accent]
                    )}
                  />

                  {/* Node Icon */}
                  <node.icon
                    className={cn('relative z-10 h-4 w-4 shrink-0', accentIconColor[node.accent])}
                    strokeWidth={2}
                  />

                  {/* Node Label */}
                  <span className="relative z-10 whitespace-nowrap font-medium text-foreground">
                    {node.label}
                  </span>

                  {/* External Indicator */}
                  {node.external && (
                    <ArrowUpRight
                      className="relative z-10 h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      strokeWidth={2}
                    />
                  )}
                </a>

                {/* Floating Detail Card */}
                <AnimatePresence>
                  {showDetail && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                      // PC: pointer-events auto so mouse can enter and click link
                      // Mobile (isTapped): pointer-events auto for tap link
                      style={{ pointerEvents: 'auto' }}
                      className="absolute left-1/2 top-full z-50 mt-2 w-60 -translate-x-1/2 rounded-xl border border-border/80 bg-popover/98 p-3.5 text-left shadow-2xl backdrop-blur-xl"
                      onMouseEnter={() => {
                        // Bridge: mouse moved into tooltip, cancel the hide timer
                        if (!isMobile.current) cancelHideTooltip()
                      }}
                      onMouseLeave={() => {
                        // Mouse left tooltip, hide immediately
                        if (!isMobile.current) setHoveredNode(null)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]">
                          {node.category}
                        </span>
                        {/* Close button for mobile tap */}
                        {isTapped && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setTappedNode(null) }}
                            className="text-[10px] text-muted-foreground hover:text-foreground px-1"
                          >
                            x
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-xs font-semibold text-foreground leading-snug">
                        {node.label}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {node.tagline[lang]}
                      </p>
                      {/* Visit link - works on both PC hover tooltip and mobile tap card */}
                      <a
                        href={node.href}
                        target={node.external ? '_blank' : undefined}
                        rel={node.external ? 'noopener noreferrer' : undefined}
                        className="mt-2.5 flex items-center gap-1 text-[10px] font-medium text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)] hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowUpRight className="h-3 w-3" />
                        <span>{node.href.replace('https://', '')}</span>
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          }
        )}

        {/* Dismiss tapped node by clicking empty space */}
        {tappedNode && (
          <div
            className="absolute inset-0 z-10"
            onClick={() => setTappedNode(null)}
          />
        )}



        {/* Onboarding Guidance Badge */}
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 py-1 backdrop-blur-md">
            <Compass className="h-3.5 w-3.5 text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]" />
            <span className="hidden sm:inline">{t('orbital.hint.pc')}</span>
            <span className="sm:hidden">{t('orbital.hint.mobile')}</span>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[10px] tracking-wider uppercase sm:flex backdrop-blur-md">
            <span>Pitch: {Math.round(rotX)}°</span>
            <span>·</span>
            <span>Yaw: {Math.round(rotY)}°</span>
          </div>
        </div>
      </div>

      {/* Manual Control Dock */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center rounded-full border border-border/70 bg-card/70 p-1 shadow-sm backdrop-blur-md">
          <button
            onClick={() => rotateStep('left')}
            aria-label="Rotate Left"
            title="Rotate Left"
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => rotateStep('right')}
            aria-label="Rotate Right"
            title="Rotate Right"
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => rotateStep('up')}
            aria-label="Tilt Up"
            title="Tilt Up"
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 hover:bg-accent hover:text-foreground"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => rotateStep('down')}
            aria-label="Tilt Down"
            title="Tilt Down"
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 hover:bg-accent hover:text-foreground"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          onClick={() => setAutoOrbit((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur-md transition-all',
            autoOrbit
              ? 'border-[oklch(0.72_0.13_80_/_0.5)] bg-[oklch(0.72_0.13_80_/_0.15)] text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]'
              : 'border-border/70 bg-card/70 text-muted-foreground hover:text-foreground'
          )}
        >
          {autoOrbit ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          <span>{t('orbital.autoOrbit')}</span>
        </button>

        <button
          onClick={resetConstellation}
          className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md hover:border-[oklch(0.72_0.13_80_/_0.5)] hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3" />
          <span>{t('orbital.reset')}</span>
        </button>
      </div>
    </div>
  )
}

