'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { OrbitalNavigation } from '@/components/orbital-navigation'
import { useLanguage } from '@/components/language-provider'

export function OrbitalSection() {
  const { t } = useLanguage()
  const reduce = useReducedMotion()

  return (
    <section id="orbital" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center sm:mb-14"
        >
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]">
            ✦ Navigation
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t('orbital.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            {t('orbital.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          <OrbitalNavigation />
        </motion.div>
      </div>
    </section>
  )
}
