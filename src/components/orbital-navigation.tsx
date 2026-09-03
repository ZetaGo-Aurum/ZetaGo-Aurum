'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { orbitalNodes, type OrbitalNode } from '@/lib/site-data'
import { useLanguage } from '@/components/language-provider'
import { cn } from '@/lib/utils'

interface OrbitalNavigationProps {
  className?: string
}

const accentClass: Record<NonNullable<OrbitalNode['accent']>, string> = {
  gold: 'text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.82_0.14_85)]',
  soft: 'text-muted-foreground',
  bright: 'text-[oklch(0.85_0.14_90)] dark:text-[oklch(0.9_0.12_90)]',
}

const accentBg: Record<NonNullable<OrbitalNode['accent']>, string> = {
  gold:
    'bg-[oklch(0.92_0.05_85)] dark:bg-[oklch(0.3_0.06_80)] border-[oklch(0.72_0.13_80_/_0.4)] dark:border-[oklch(0.82_0.14_85_/_0.4)]',
  soft:
    'bg-card border-border hover:border-[oklch(0.72_0.13_80_/_0.5)] dark:hover:border-[oklch(0.82_0.14_85_/_0.5)]',
  bright:
    'bg-[oklch(0.95_0.06_88)] dark:bg-[oklch(0.32_0.07_82)] border-[oklch(0.82_0.14_85_/_0.5)] dark:border-[oklch(0.85_0.14_85_/_0.5)]',
}

function OrbitalNodeButton({ node, index }: { node: OrbitalNode; index: number }) {
  const { t } = useLanguage()
  const reduce = useReducedMotion()

  const label = node.id === 'orbital.center.label' ? t('orbital.center.label') : t(node.labelId)

  return (
    <motion.a
      href={node.href}
      target={node.external ? '_blank' : undefined}
      rel={node.external ? 'noopener noreferrer' : undefined}
      aria-label={node.label}
      title={node.label}
      className={cn(
        'group absolute left-1/2 top-1/2 flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium shadow-sm backdrop-blur-md transition-all duration-300',
        'hover:shadow-lg hover:shadow-[oklch(0.72_0.13_80_/_0.15)] hover:-translate-y-0.5',
        accentBg[node.accent ?? 'soft']
      )}
      initial={reduce ? false : { opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 + index * 0.06, duration: 0.5, ease: 'easeOut' }}
    >
      <node.icon
        className={cn('h-3.5 w-3.5 shrink-0', accentClass[node.accent ?? 'soft'])}
        strokeWidth={1.75}
      />
      <span className="hidden whitespace-nowrap text-foreground/80 sm:inline">{label}</span>
    </motion.a>
  )
}

export function OrbitalNavigation({ className }: OrbitalNavigationProps) {
  const { t } = useLanguage()
  const reduce = useReducedMotion()

  // Desktop: 2 rings with calculated positions
  const innerR = 130 // radius for ring 1 (px)
  const outerR = 215 // radius for ring 2 (px)

  // Mobile: smaller single ring with all nodes
  const mobileR = 130

  return (
    <div
      className={cn(
        'relative mx-auto flex flex-col items-center justify-center',
        className
      )}
    >
      {/* === DESKTOP / TABLET orbital === */}
      <div className="relative hidden h-[520px] w-[520px] sm:block">
        {/* Faint orbit rings */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[oklch(0.72_0.13_80_/_0.18)] dark:border-[oklch(0.82_0.14_85_/_0.18)]"
          style={{ width: innerR * 2, height: innerR * 2 }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[oklch(0.72_0.13_80_/_0.12)] dark:border-[oklch(0.82_0.14_85_/_0.12)]"
          style={{ width: outerR * 2, height: outerR * 2 }}
        />

        {/* Slow rotating ring decorations */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: innerR * 2, height: innerR * 2 }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[oklch(0.72_0.13_80)] dark:bg-[oklch(0.85_0.14_85)] opacity-60" />
          <div className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[oklch(0.72_0.13_80_/_0.5)]" />
        </motion.div>
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: outerR * 2, height: outerR * 2 }}
          animate={reduce ? undefined : { rotate: -360 }}
          transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute left-1/2 top-0 h-1 w-1 -translate-x-1/2 rounded-full bg-[oklch(0.85_0.14_90)] opacity-50" />
          <div className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[oklch(0.72_0.13_80_/_0.6)]" />
        </motion.div>

        {/* Inner ring nodes */}
        {orbitalNodes
          .filter((n) => n.ring === 1)
          .map((node, i) => {
            const rad = (node.angle * Math.PI) / 180
            const x = Math.cos(rad) * innerR
            const y = Math.sin(rad) * innerR
            return (
              <div
                key={node.id}
                className="absolute left-1/2 top-1/2"
                style={{ transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))` }}
              >
                <OrbitalNodeButton node={node} index={i} />
              </div>
            )
          })}

        {/* Outer ring nodes */}
        {orbitalNodes
          .filter((n) => n.ring === 2)
          .map((node, i) => {
            const rad = (node.angle * Math.PI) / 180
            const x = Math.cos(rad) * outerR
            const y = Math.sin(rad) * outerR
            return (
              <div
                key={`outer-${node.id}`}
                className="absolute left-1/2 top-1/2"
                style={{ transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))` }}
              >
                <OrbitalNodeButton node={node} index={i + 6} />
              </div>
            )
          })}

        {/* Center core */}
        <motion.div
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          initial={reduce ? false : { opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
        >
          <div className="relative flex h-28 w-28 items-center justify-center">
            {/* Pulsing halo */}
            <div className="absolute inset-0 rounded-full bg-[oklch(0.72_0.13_80_/_0.15)] dark:bg-[oklch(0.82_0.14_85_/_0.2)] animate-gold-pulse" />
            <div className="absolute inset-2 rounded-full bg-[oklch(0.72_0.13_80_/_0.1)] dark:bg-[oklch(0.82_0.14_85_/_0.12)]" />
            {/* Solid core */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.85_0.14_90)] via-[oklch(0.72_0.13_80)] to-[oklch(0.6_0.12_70)] shadow-xl shadow-[oklch(0.72_0.13_80_/_0.35)]">
              <span className="font-serif text-2xl font-bold text-white drop-shadow-sm">Z</span>
            </div>
          </div>
          <div className="mt-3 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {t('orbital.center.label')}
          </div>
        </motion.div>
      </div>

      {/* === MOBILE orbital === */}
      <div className="relative block h-[340px] w-[340px] sm:hidden">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[oklch(0.72_0.13_80_/_0.18)] dark:border-[oklch(0.82_0.14_85_/_0.18)]"
          style={{ width: mobileR * 2, height: mobileR * 2 }}
        />

        {/* Slow rotating marker */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: mobileR * 2, height: mobileR * 2 }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[oklch(0.72_0.13_80)] dark:bg-[oklch(0.85_0.14_85)] opacity-70" />
        </motion.div>

        {/* Place primary 6 nodes on the mobile ring */}
        {orbitalNodes
          .filter((n) => n.ring === 1)
          .map((node, i) => {
            const rad = (node.angle * Math.PI) / 180
            const x = Math.cos(rad) * mobileR
            const y = Math.sin(rad) * mobileR
            return (
              <div
                key={`mobile-${node.id}`}
                className="absolute left-1/2 top-1/2"
                style={{ transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))` }}
              >
                <OrbitalNodeButton node={node} index={i} />
              </div>
            )
          })}

        {/* Center core (smaller on mobile) */}
        <motion.div
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          initial={reduce ? false : { opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
        >
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[oklch(0.72_0.13_80_/_0.15)] dark:bg-[oklch(0.82_0.14_85_/_0.2)] animate-gold-pulse" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.85_0.14_90)] via-[oklch(0.72_0.13_80)] to-[oklch(0.6_0.12_70)] shadow-xl shadow-[oklch(0.72_0.13_80_/_0.35)]">
              <span className="font-serif text-xl font-bold text-white drop-shadow-sm">Z</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
