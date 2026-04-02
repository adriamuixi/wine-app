import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Locale } from '@wine-app/domain-types'
import { createTranslator } from '@wine-app/i18n-core'

import { mobileMessages, SUPPORTED_MOBILE_LOCALES } from './messages'

const LOCALE_STORAGE_KEY = 'wine.mobile.locale'

type I18nValue = {
  locale: Locale
  setLocale: (next: Locale) => void
  cycleLocale: () => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue | null>(null)

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (params === undefined) {
    return template
  }

  let output = template
  for (const [key, value] of Object.entries(params)) {
    output = output.replaceAll(`{${key}}`, String(value))
  }

  return output
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>('ca')

  useEffect(() => {
    AsyncStorage.getItem(LOCALE_STORAGE_KEY)
      .then((stored) => {
        if (stored === 'ca' || stored === 'es' || stored === 'en') {
          setLocaleState(stored)
        }
      })
      .catch(() => {})
  }, [])

  const setLocale = (next: Locale): void => {
    setLocaleState(next)
    void AsyncStorage.setItem(LOCALE_STORAGE_KEY, next)
  }

  const cycleLocale = (): void => {
    const current = SUPPORTED_MOBILE_LOCALES.indexOf(locale)
    const next = SUPPORTED_MOBILE_LOCALES[(current + 1) % SUPPORTED_MOBILE_LOCALES.length] ?? 'ca'
    setLocale(next)
  }

  const rawT = useMemo(() => createTranslator(locale, mobileMessages), [locale])
  const t = (key: string, params?: Record<string, string | number>): string => interpolate(rawT(key), params)

  const value = useMemo<I18nValue>(() => ({
    locale,
    setLocale,
    cycleLocale,
    t,
  }), [locale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext)
  if (context === null) {
    throw new Error('useI18n must be used within I18nProvider')
  }

  return context
}

