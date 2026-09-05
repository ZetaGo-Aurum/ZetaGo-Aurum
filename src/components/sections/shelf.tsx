'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'
import { CompleteShelfLandingPage } from "@designcodeio/threeui"
import "@designcodeio/threeui/style.css"
import { Move3d } from 'lucide-react'

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
          <div className="relative h-[620px] sm:h-[720px] lg:h-[800px] w-full overflow-hidden rounded-3xl border border-[oklch(0.55_0.1_80_/_0.3)] bg-[#0a0c10] shadow-2xl shadow-black/30 dark:border-border/70 dark:shadow-[oklch(0.72_0.13_80_/_0.06)]">
            <CompleteShelfLandingPage
              headingFont="iowan-old-style"
              bodyFont="inter"
              headingWeight="400"
              bodyWeight="400"
              primaryColor="#c87046"
              headingSize={60}
              bodySize={12}
              headingLetterSpacing={-0.055}
            />
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
