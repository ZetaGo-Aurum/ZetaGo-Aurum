'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'
import { InteractiveBook } from '@/components/book-3d/InteractiveBook'

export function ShelfSection() {
  const { t } = useLanguage()
  const reduce = useReducedMotion()

  return (
    <section id="shelf" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center sm:mb-12"
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

        {/* Dedicated Single 3D Book & Immersive Reader */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mx-auto flex w-full max-w-6xl flex-col items-center"
        >
          <InteractiveBook />
        </motion.div>
      </div>
    </section>
  )
}
