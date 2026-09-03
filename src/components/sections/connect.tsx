'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Mail } from 'lucide-react'
import { socialLinks } from '@/lib/site-data'
import { useLanguage } from '@/components/language-provider'

export function ConnectSection() {
  const { t } = useLanguage()
  const reduce = useReducedMotion()

  return (
    <section id="connect" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]">
            ✦ Open Channels
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t('connect.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
            {t('connect.subtitle')}
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {socialLinks.map((link, i) => (
            <motion.a
              key={link.id}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group relative flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-[oklch(0.72_0.13_80_/_0.5)] hover:shadow-lg hover:shadow-[oklch(0.72_0.13_80_/_0.12)] hover:-translate-y-1 dark:hover:border-[oklch(0.82_0.14_85_/_0.5)]"
            >
              <div className="flex w-full items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/60 text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]">
                  <link.icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:text-[oklch(0.72_0.13_80)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:group-hover:text-[oklch(0.85_0.14_85)]" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold tracking-tight">{link.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{link.handle}</p>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Direct email line */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-2"
        >
          <a
            href="mailto:deltaastra24@gmail.com"
            className="group inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-card/60 px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:border-[oklch(0.72_0.13_80_/_0.6)] hover:text-[oklch(0.72_0.13_80)] hover:shadow-md dark:hover:border-[oklch(0.82_0.14_85_/_0.6)] dark:hover:text-[oklch(0.85_0.14_85)]"
          >
            <Mail className="h-4 w-4 text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]" strokeWidth={1.75} />
            <span className="border-b border-dashed border-current pb-0.5 font-mono text-xs sm:text-sm">
              deltaastra24@gmail.com
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
