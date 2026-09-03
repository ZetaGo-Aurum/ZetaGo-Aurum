'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'

export function AboutSection() {
  const { t, lang } = useLanguage()
  const reduce = useReducedMotion()

  const content = {
    en: {
      eyebrow: '✦ Philosophy',
      title: 'Why Aurum',
      paragraphs: [
        'Aurum is the Latin word for gold: a noble element that does not tarnish, holding its luminosity across eras. The name represents a quiet commitment: to engineer architectures that endure, remaining robust and purposeful.',
        'This site operates as the central atelier. Every project, domain, and socket engine originates here. The 3D orbital constellation above is the functional map: each node represents a live terminal in the network.',
        'Engineering moves forward continuously: measured, deliberate, and rigorous. Every component is refined under deep inspection until it meets our gold standard.',
      ],
      pillars: [
        { title: 'Patience', body: 'Refinement over haste. Every single detail earns its place.' },
        { title: 'Craft', body: 'Typography, 3D interaction, protocol design, and clean code.' },
        { title: 'Permanence', body: 'Architected to last, unswayed by fleeting trends.' },
      ],
    },
    id: {
      eyebrow: '✦ Filosofi',
      title: 'Mengapa Aurum',
      paragraphs: [
        'Aurum adalah kata Latin untuk emas: elemen mulia yang tidak mudah terkorosi, menjaga cahayanya lintas zaman. Nama ini membawa komitmen nyata: membangun arsitektur digital yang tahan uji, tetap tangguh dan bermakna.',
        'Situs ini berfungsi sebagai atelier pusat. Setiap proyek, domain, dan engine socket bermula dari sini. Konstelasi orbital 3D di atas adalah peta aktif: setiap titik adalah terminal nyata dalam jaringan.',
        'Karya terus melangkah maju: terukur, teliti, dan disiplin. Setiap baris kode ditempa hingga mencapai standar mutu bernilai emas.',
      ],
      pillars: [
        { title: 'Kesabaran', body: 'Pemurnian di atas ketergesaan. Setiap detail memiliki fungsi nyata.' },
        { title: 'Kriya', body: 'Tipografi, interaksi 3D, protokol jaringan, dan kode yang bersih.' },
        { title: 'Kekekalan', body: 'Dirancang untuk keandalan jangka panjang tanpa terdistraksi tren sesaat.' },
      ],
    },
  }

  const c = content[lang]

  return (
    <section id="about" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: heading + paragraphs */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)]">
              {c.eyebrow}
            </p>
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {c.title}
              <span className="ml-2 text-gold-gradient">?</span>
            </h2>

            <div className="mt-6 space-y-4">
              {c.paragraphs.map((p, i) => (
                <p key={i} className="text-base leading-relaxed text-foreground/80 sm:text-lg">
                  {p}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Right: pillars */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="flex flex-col gap-3">
              {c.pillars.map((pillar, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors hover:border-[oklch(0.72_0.13_80_/_0.4)] dark:hover:border-[oklch(0.82_0.14_85_/_0.4)]"
                >
                  <div className="flex items-start gap-4">
                    <span className="font-serif text-2xl font-bold text-gold-gradient">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-semibold tracking-tight">
                        {pillar.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{pillar.body}</p>
                    </div>
                  </div>
                  {/* Decorative bottom line */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.72_0.13_80_/_0.4)] to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
