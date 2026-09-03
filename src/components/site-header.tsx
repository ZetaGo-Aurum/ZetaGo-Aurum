'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, Languages, Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TranslationKey } from '@/lib/translations'

const navItems: { id: TranslationKey; href: string }[] = [
  { id: 'nav.home', href: '#home' },
  { id: 'nav.works', href: '#works' },
  { id: 'nav.domains', href: '#domains' },
  { id: 'nav.connect', href: '#connect' },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden />
  }

  const isDark = theme === 'dark'
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      title="Toggle theme"
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/80 transition-colors hover:border-[oklch(0.72_0.13_80_/_0.6)] hover:text-[oklch(0.72_0.13_80)] dark:hover:border-[oklch(0.82_0.14_85_/_0.6)] dark:hover:text-[oklch(0.85_0.14_85)]"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Sun className="h-4 w-4" strokeWidth={1.75} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Moon className="h-4 w-4" strokeWidth={1.75} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

function LangToggle() {
  const { lang, toggleLang } = useLanguage()
  return (
    <button
      onClick={toggleLang}
      aria-label="Switch language"
      title="Switch language"
      className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium uppercase tracking-wider text-foreground/80 transition-colors hover:border-[oklch(0.72_0.13_80_/_0.6)] hover:text-[oklch(0.72_0.13_80)] dark:hover:border-[oklch(0.82_0.14_85_/_0.6)] dark:hover:text-[oklch(0.85_0.14_85)]"
    >
      <Languages className="h-3.5 w-3.5" strokeWidth={1.75} />
      <span>{lang === 'en' ? 'EN' : 'ID'}</span>
    </button>
  )
}

export function SiteHeader() {
  const { t } = useLanguage()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <a href="#home" className="group flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.85_0.14_90)] via-[oklch(0.72_0.13_80)] to-[oklch(0.6_0.12_70)] shadow-md shadow-[oklch(0.72_0.13_80_/_0.3)] transition-transform group-hover:scale-105">
              <span className="font-serif text-base font-bold text-white">Z</span>
            </span>
            <div className="flex flex-col leading-none">
              <span className="font-serif text-base font-semibold tracking-tight">
                {t('brand.name')}
              </span>
              <span className="hidden text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:block">
                {t('brand.tagline')}
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="relative px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                {t(item.id)}
                <span className="absolute inset-x-3 -bottom-0.5 h-px scale-x-0 bg-gradient-to-r from-transparent via-[oklch(0.72_0.13_80)] to-transparent transition-transform duration-300 hover:scale-x-100" />
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/80 md:hidden"
              aria-label={mobileOpen ? t('nav.close') : t('nav.menu')}
            >
              {mobileOpen ? (
                <X className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <Menu className="h-4 w-4" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-border/40 md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {t(item.id)}
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
