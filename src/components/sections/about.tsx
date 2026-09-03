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
        'Aurum is the Latin word for gold — a metal that does not tarnish, that holds its light across centuries. The name is a quiet promise: to build things that age well, that remain useful and beautiful long after they are made.',
        'This site is the central atelier. Every project, every domain, every line of code begins here and returns here. The orbital navigation above is not decoration — it is the map. Each node is a place you can travel to, orbiting the same intention.',
        'The work moves forward, always. Patient. Polished. Refusing the rush. Each piece is treated like metal under the hammer — refined until it earns its gold.',
      ],
      pillars: [
        { title: 'Patience', body: 'Refinement over speed. Every detail earns its place.' },
        { title: 'Craft', body: 'Type, motion, color, code — treated with equal care.' },
        { title: 'Permanence', body: 'Built to age well, not to chase the trend.' },
      ],
    },
    id: {
      eyebrow: '✦ Filosofi',
      title: 'Mengapa Aurum',
      paragraphs: [
        'Aurum adalah kata Latin untuk emas — logam yang tidak ternoda, yang mempertahankan cahayanya lintas abad. Nama ini adalah janji yang tenang: membangun hal-hal yang menua dengan baik, yang tetap berguna dan indah lama setelah dibuat.',
        'Situs ini adalah atelier pusat. Setiap proyek, setiap domain, setiap baris kode dimulai di sini dan kembali ke sini. Navigasi orbital di atas bukan dekorasi — itu adalah peta. Setiap titik adalah tempat yang bisa kamu kunjungi, mengorbit niat yang sama.',
        'Karya terus maju, selalu. Sabar. Dipoles. Menolak terburu-buru. Setiap karya diperlakukan seperti logam di bawah palu — diperhalus sampai ia pantas menjadi emas.',
      ],
      pillars: [
        { title: 'Kesabaran', body: 'Pemurnian di atas kecepatan. Setiap detail mendapatkan tempatnya.' },
        { title: 'Kriya', body: 'Tipografi, gerak, warna, kode — diperlakukan dengan kepedulian yang sama.' },
        { title: 'Kekekalan', body: 'Dibangun untuk menua dengan baik, bukan mengejar tren.' },
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
