'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { works } from '@/lib/site-data'
import { useLanguage } from '@/components/language-provider'
import { cn } from '@/lib/utils'

const accentBorder: Record<string, string> = {
  gold: 'hover:border-[oklch(0.72_0.13_80_/_0.6)] dark:hover:border-[oklch(0.82_0.14_85_/_0.6)]',
  soft: 'hover:border-[oklch(0.72_0.13_80_/_0.4)] dark:hover:border-[oklch(0.82_0.14_85_/_0.4)]',
  bright: 'hover:border-[oklch(0.85_0.14_90_/_0.6)] dark:hover:border-[oklch(0.88_0.13_88_/_0.6)]',
}

const accentDot: Record<string, string> = {
  gold: 'bg-[oklch(0.72_0.13_80)]',
  soft: 'bg-muted-foreground/60',
  bright: 'bg-[oklch(0.85_0.14_90)]',
}

export function WorksSection() {
  const { t, lang } = useLanguage()
  const reduce = useReducedMotion()

  return (
    <section id="works" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]">
              ✦ Portfolio
            </p>
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {t('works.title')}
            </h2>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">
              {t('works.subtitle')}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((work, i) => (
            <motion.a
              key={work.id}
              href={work.href}
              target={work.external ? '_blank' : undefined}
              rel={work.external ? 'noopener noreferrer' : undefined}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className={cn(
                'group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300',
                'hover:shadow-xl hover:shadow-[oklch(0.72_0.13_80_/_0.12)] hover:-translate-y-1',
                accentBorder[work.accent] ?? accentBorder.gold
              )}
            >
              {/* Top row: category + year */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn('h-1.5 w-1.5 rounded-full', accentDot[work.accent])} />
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {work.category[lang]}
                  </span>
                </div>
                <span className="font-serif text-xs italic text-muted-foreground">{work.year}</span>
              </div>

              {/* Title */}
              <h3 className="font-serif text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                {work.title}
              </h3>

              {/* Description */}
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {work.description[lang]}
              </p>

              {/* Tags */}
              <div className="mt-5 flex flex-wrap gap-1.5">
                {work.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Explore link */}
              <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]">
                <span>{t('works.explore')}</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
              </div>

              {/* Decorative corner mark */}
              <span
                aria-hidden
                className="pointer-events-none absolute right-5 top-5 h-px w-8 bg-gradient-to-r from-transparent to-[oklch(0.72_0.13_80_/_0.4)] opacity-0 transition-opacity group-hover:opacity-100"
              />
            </motion.a>
          ))}
        </div>

        {/* See all link */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex justify-center"
        >
          <a
            href="#connect"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-[oklch(0.72_0.13_80)] dark:hover:text-[oklch(0.85_0.14_85)]"
          >
            <span className="border-b border-dashed border-current pb-0.5">
              {t('works.viewAll')}
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
