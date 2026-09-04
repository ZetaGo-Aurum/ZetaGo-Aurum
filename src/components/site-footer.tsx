'use client'

import * as React from 'react'
import { useLanguage } from '@/components/language-provider'
import { socialLinks } from '@/lib/site-data'

export function SiteFooter() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border/60 bg-background/40 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          {/* Brand */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <a href="#home" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.85_0.14_90)] via-[oklch(0.72_0.13_80)] to-[oklch(0.6_0.12_70)] shadow-md shadow-[oklch(0.72_0.13_80_/_0.3)]">
                <span className="font-serif text-sm font-bold text-white">Z</span>
              </span>
              <span className="font-serif text-base font-semibold tracking-tight">
                {t('brand.name')}
              </span>
            </a>
            <p className="font-serif text-xs italic text-muted-foreground">
              {t('footer.philosophy')}
            </p>
          </div>

          {/* Social Links - 2 rows of 4 on mobile, single row on desktop */}
          <div className="grid grid-cols-4 gap-2.5 sm:flex sm:items-center sm:gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                aria-label={link.label}
                title={link.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/70 transition-colors hover:border-[oklch(0.72_0.13_80_/_0.6)] hover:text-[oklch(0.72_0.13_80)] dark:hover:border-[oklch(0.82_0.14_85_/_0.6)] dark:hover:text-[oklch(0.85_0.14_85)]"
              >
                <link.icon className="h-4 w-4" strokeWidth={1.75} />
              </a>
            ))}
          </div>
        </div>

        <div className="gold-divider my-6" />

        <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>
            &copy; {year} {t('brand.name')}. {t('footer.rights')}
          </p>
          <p className="font-serif italic">{t('footer.built')}</p>
        </div>
      </div>
    </footer>
  )
}
