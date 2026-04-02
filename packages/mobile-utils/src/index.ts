import type { Country, Locale } from '@wine-app/domain-types'

const COUNTRY_LABELS: Record<Country, Record<Locale, string>> = {
  spain: { es: 'España', ca: 'Espanya', en: 'Spain' },
  france: { es: 'Francia', ca: 'Franca', en: 'France' },
  italy: { es: 'Italia', ca: 'Italia', en: 'Italy' },
  portugal: { es: 'Portugal', ca: 'Portugal', en: 'Portugal' },
  germany: { es: 'Alemania', ca: 'Alemanya', en: 'Germany' },
  argentina: { es: 'Argentina', ca: 'Argentina', en: 'Argentina' },
  chile: { es: 'Chile', ca: 'Xile', en: 'Chile' },
  united_states: { es: 'Estados Unidos', ca: 'Estats Units', en: 'United States' },
  south_africa: { es: 'Sudáfrica', ca: 'Sud-africa', en: 'South Africa' },
  australia: { es: 'Australia', ca: 'Australia', en: 'Australia' },
}

export function resolveMobileApiBaseUrl(explicitBase?: string): string {
  if (typeof explicitBase === 'string' && explicitBase.trim() !== '') {
    return explicitBase.replace(/\/$/, '')
  }

  return 'http://localhost:8080'
}

export function localeToIntl(locale: Locale): string {
  if (locale === 'ca') return 'ca-ES'
  if (locale === 'es') return 'es-ES'
  return 'en-US'
}

export function countryLabel(country: Country, locale: Locale): string {
  return COUNTRY_LABELS[country][locale]
}

export function normalizePrice(input: number): string {
  return input.toFixed(2)
}
