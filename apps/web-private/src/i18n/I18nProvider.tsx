import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import type { TFunction } from 'i18next'
import { i18n } from './i18n'
import { localeLabels, messages, type Locale } from './messages'

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  labels: (typeof messages)[Locale]
  localeLabels: typeof localeLabels
  t: TFunction
}

const STORAGE_KEY = 'wine-web-private-locale'

const I18nContext = createContext<I18nContextValue | null>(null)

function isLocale(value: string): value is Locale {
  return value === 'es' || value === 'ca'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && isLocale(stored)) {
      return stored
    }

    return 'es'
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
    void i18n.changeLanguage(locale)
  }, [locale])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      labels: messages[locale],
      localeLabels,
      t: i18n.t.bind(i18n),
    }),
    [locale],
  )

  return (
    <I18nextProvider i18n={i18n}>
      <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
    </I18nextProvider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }

  return context
}
