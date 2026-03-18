import type { Locale } from '../../i18n/messages'
import { LOCALE_KEY } from '../../app/config/constants'

export function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'ca'
  const stored = window.localStorage.getItem(LOCALE_KEY)
  return stored === 'es' || stored === 'ca' || stored === 'en' ? stored : 'ca'
}

export function localeToIntl(locale: Locale): string {
  if (locale === 'ca') return 'ca-ES'
  if (locale === 'en') return 'en-US'
  return 'es-ES'
}
