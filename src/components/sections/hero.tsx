'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, Sparkles } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'

export function HeroSection() {
  const { t } = useLanguage()
  const reduce = useReducedMotion()

  return (
    <section id="home" className="relative overflow-hidden">
      {/* Background ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[oklch(0.72_0.13_80_/_0.08)] blur-3xl dark:bg-[oklch(0.82_0.14_85_/_0.1)]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[oklch(0.85_0.14_90_/_0.06)] blur-3xl dark:bg-[oklch(0.82_0.14_85_/_0.08)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-16 lg:px-8 lg:pt-32">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-6 flex items-center gap-2 rounded-full border border-[oklch(0.72_0.13_80_/_0.3)] dark:border-[oklch(0.82_0.14_85_/_0.3)] bg-background/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] text-muted-foreground backdrop-blur-sm"
          >
            <Sparkles className="h-3 w-3 text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]" strokeWidth={1.75} />
            <span>{t('hero.eyebrow')}</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="font-serif text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            <span className="block text-foreground">{t('hero.title.line1')}</span>
            <span className="block text-gold-gradient">{t('hero.title.line2')}</span>
          </motion.h1>

          {/* Philosophy quote */}
          <motion.blockquote
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
            className="mt-8 max-w-2xl text-balance"
          >
            <p className="font-serif text-xl italic text-foreground/80 sm:text-2xl">
              <span className="text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]">&ldquo;</span>
              {t('hero.philosophy')}
              <span className="text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]">&rdquo;</span>
            </p>
          </motion.blockquote>

          {/* Subtitle */}
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
            className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: 'easeOut' }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            <a
              href="#orbital"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[oklch(0.78_0.13_82)] to-[oklch(0.65_0.12_72)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[oklch(0.72_0.13_80_/_0.35)] transition-all hover:shadow-xl hover:shadow-[oklch(0.72_0.13_80_/_0.5)] hover:-translate-y-0.5"
            >
              {t('hero.cta.explore')}
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" strokeWidth={1.75} />
            </a>
            <a
              href="#connect"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-[oklch(0.72_0.13_80_/_0.6)] hover:text-[oklch(0.72_0.13_80)] dark:hover:border-[oklch(0.82_0.14_85_/_0.6)] dark:hover:text-[oklch(0.85_0.14_85)]"
            >
              {t('hero.cta.connect')}
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
