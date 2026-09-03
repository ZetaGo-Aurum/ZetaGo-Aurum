'use client'

import * as React from 'react'
import { translations, type Language, type TranslationKey } from '@/lib/translations'

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  toggleLang: () => void
  t: (key: TranslationKey) => string
}

const LanguageContext = React.createContext<LanguageContextValue | undefined>(undefined)

const STORAGE_KEY = 'zetago-lang'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Language>('en')

  React.useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (saved === 'en' || saved === 'id') {
      setLangState(saved)
    }
  }, [])

  const setLang = React.useCallback((next: Language) => {
    setLangState(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next)
      document.documentElement.lang = next
    }
  }, [])

  const toggleLang = React.useCallback(() => {
    setLang(lang === 'en' ? 'id' : 'en')
  }, [lang, setLang])

  const t = React.useCallback(
    (key: TranslationKey) => {
      return translations[lang][key] ?? translations.en[key] ?? key
    },
    [lang]
  )

  const value = React.useMemo(
    () => ({ lang, setLang, toggleLang, t }),
    [lang, setLang, toggleLang, t]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}
