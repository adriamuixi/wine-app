import type { Locale } from '@wine-app/domain-types'

export type TranslationTree = Record<string, unknown>

export type TranslationDictionary = Record<Locale, TranslationTree>

export function getByPath(input: TranslationTree, path: string): unknown {
  const segments = path.split('.').filter(Boolean)
  let current: unknown = input

  for (const segment of segments) {
    if (typeof current !== 'object' || current === null || !(segment in current)) {
      return undefined
    }
    current = (current as Record<string, unknown>)[segment]
  }

  return current
}

export function createTranslator(locale: Locale, dictionary: TranslationDictionary) {
  return function t(key: string, fallback?: string): string {
    const localized = getByPath(dictionary[locale], key)
    if (typeof localized === 'string' && localized.trim() !== '') {
      return localized
    }

    const english = getByPath(dictionary.en, key)
    if (typeof english === 'string' && english.trim() !== '') {
      return english
    }

    return fallback ?? key
  }
}
