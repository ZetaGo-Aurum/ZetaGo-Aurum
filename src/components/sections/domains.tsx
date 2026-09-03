'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Globe, Circle } from 'lucide-react'
import { domains } from '@/lib/site-data'
import { useLanguage } from '@/components/language-provider'
import { cn } from '@/lib/utils'

const statusColor: Record<string, { dot: string; text: string }> = {
  live: {
    dot: 'bg-emerald-500 dark:bg-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  coming: {
    dot: 'bg-[oklch(0.72_0.13_80)] dark:bg-[oklch(0.85_0.14_85)]',
    text: 'text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]',
  },
  concept: {
    dot: 'bg-muted-foreground/50',
    text: 'text-muted-foreground',
  },
}

const accentLine: Record<string, string> = {
  gold: 'from-[oklch(0.72_0.13_80_/_0.6)] to-transparent',
  soft: 'from-[oklch(0.72_0.13_80_/_0.3)] to-transparent',
  bright: 'from-[oklch(0.85_0.14_90_/_0.6)] to-transparent',
}

export function DomainsSection() {
  const { t, lang } = useLanguage()
  const reduce = useReducedMotion()

  return (
    <section id="domains" className="relative scroll-mt-24 py-16 sm:py-24">
      {/* Soft background separator */}
      <div className="gold-divider mx-auto mb-16 max-w-7xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]">
            ✦ Estates
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t('domains.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
            {t('domains.subtitle')}
          </p>
        </motion.div>

        <div className="mx-auto max-w-3xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {domains.map((domain, i) => {
            const status = statusColor[domain.status]
            return (
              <motion.a
                key={domain.id}
                href={domain.href}
                target={domain.href.startsWith('http') ? '_blank' : undefined}
                rel={domain.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={reduce ? false : { opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group relative flex items-center gap-4 px-5 py-5 transition-colors hover:bg-accent/40 sm:px-7 sm:py-6"
              >
                {/* Gold accent line on hover */}
                <span
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b opacity-0 transition-opacity group-hover:opacity-100',
                    accentLine[domain.accent]
                  )}
                />

                {/* Icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background/60 text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]">
                  <Globe className="h-4.5 w-4.5" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="font-serif text-base font-semibold tracking-tight sm:text-lg">
                      {domain.name}
                    </h3>
                    <span className={cn('flex items-center gap-1 text-[10px] uppercase tracking-[0.15em]', status.text)}>
                      <Circle className="h-1.5 w-1.5 fill-current" />
                      {domain.status === 'live'
                        ? t('domains.active')
                        : domain.status === 'coming'
                          ? 'Coming'
                          : 'Concept'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {domain.purpose[lang]}
                  </p>
                </div>

                {/* Action */}
                <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]">
                  <span className="hidden sm:inline">{t('domains.visit')}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
                </div>
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
