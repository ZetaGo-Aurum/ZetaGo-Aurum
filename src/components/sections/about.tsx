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
      title: 'The Name ZetaGo-Aurum',
      nameBreakdown: [
        {
          word: 'Zeta',
          meaning: 'The sixth letter of the Greek alphabet. In physics, Zeta represents impedance: the measure of resistance and reactance combined. Here it stands for precision, the ability to absorb pressure and still transmit power without distortion.',
        },
        {
          word: 'Go',
          meaning: 'Movement, momentum, and direction. Not just motion but purposeful motion: forward. It is the verb that turns potential into action, ideas into artifacts, and drafts into finished systems.',
        },
        {
          word: 'Aurum',
          meaning: 'Latin for gold. The noble element that does not corrode, does not tarnish, and holds its luminosity across millennia. A standard of quality that is non-negotiable.',
        },
      ],
      paragraphs: [
        'Together, ZetaGo-Aurum means: precise momentum, refined to a gold standard. Every repository, every track, every domain in this network carries that commitment.',
        'This site is the central atelier. Code, music, domains, and systems all originate here. The 3D orbital above is the live map: each node is a real terminal in the network.',
      ],
      pillars: [
        { title: 'Patience', body: 'Refinement over haste. Every detail earns its place.' },
        { title: 'Craft', body: 'Code, music, 3D interaction, protocol design, clean systems.' },
        { title: 'Permanence', body: 'Architected to last, unswayed by fleeting trends.' },
      ],
    },
    id: {
      eyebrow: '✦ Filosofi',
      title: 'Arti Nama ZetaGo-Aurum',
      nameBreakdown: [
        {
          word: 'Zeta',
          meaning: 'Huruf keenam alfabet Yunani. Dalam fisika, Zeta melambangkan impedansi: ukuran hambatan dan reaktansi yang berpadu. Di sini ia mewakili presisi: kemampuan menyerap tekanan dan tetap mentransmisikan daya tanpa distorsi.',
        },
        {
          word: 'Go',
          meaning: 'Gerakan, momentum, dan arah. Bukan sekedar gerak, melainkan gerak bertujuan: maju. Kata kerja yang mengubah potensi menjadi aksi, ide menjadi artefak, dan draf menjadi sistem yang selesai.',
        },
        {
          word: 'Aurum',
          meaning: 'Bahasa Latin untuk emas. Elemen mulia yang tidak berkarat, tidak pudar, dan mempertahankan kilaunya lintas milenium. Sebuah standar kualitas yang tidak bisa dikompromikan.',
        },
      ],
      paragraphs: [
        'Bersama, ZetaGo-Aurum berarti: momentum yang presisi, diperhalus hingga standar emas. Setiap repositori, setiap lagu, setiap domain dalam jaringan ini membawa komitmen itu.',
        'Situs ini adalah atelier pusat. Kode, musik, domain, dan sistem semuanya berasal dari sini. Orbital 3D di atas adalah peta aktif: setiap titik adalah terminal nyata dalam jaringan.',
      ],
      pillars: [
        { title: 'Kesabaran', body: 'Pemurnian di atas ketergesaan. Setiap detail memiliki fungsi nyata.' },
        { title: 'Kriya', body: 'Kode, musik, interaksi 3D, protokol jaringan, sistem bersih.' },
        { title: 'Kekekalan', body: 'Dirancang untuk keandalan jangka panjang tanpa terdistraksi tren sesaat.' },
      ],
    },
  }

  const c = content[lang]

  return (
    <section id="about" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: heading + name breakdown + paragraphs */}
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
            </h2>

            {/* Word-by-word name breakdown */}
            <div className="mt-8 space-y-5">
              {c.nameBreakdown.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <span className="font-serif text-xl font-bold text-[oklch(0.72_0.13_80)] dark:text-[oklch(0.85_0.14_85)] w-16 shrink-0 pt-0.5">
                    {item.word}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground/75 border-l border-[oklch(0.72_0.13_80_/_0.3)] pl-4">
                    {item.meaning}
                  </p>
                </div>
              ))}
            </div>

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
