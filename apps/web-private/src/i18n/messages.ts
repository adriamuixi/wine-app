import { parse } from 'yaml'

const localeFiles = import.meta.glob('./locales/*/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export type Locale = 'es' | 'ca' | 'en'

export const localeLabels: Record<Locale, string> = {
  es: 'Español',
  ca: 'Català',
  en: 'English',
}

type LocaleMessageObject = Record<string, unknown>

function isPlainObject(value: unknown): value is LocaleMessageObject {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function deepMerge(target: LocaleMessageObject, source: LocaleMessageObject): LocaleMessageObject {
  const next = { ...target }

  for (const [key, value] of Object.entries(source)) {
    const existing = next[key]
    if (isPlainObject(value) && isPlainObject(existing)) {
      next[key] = deepMerge(existing, value)
    } else {
      next[key] = value
    }
  }

  return next
}

function readLocaleMessages(locale: Locale): LocaleMessageObject {
  const localePrefix = `./locales/${locale}/`
  const files = Object.entries(localeFiles)
    .filter(([path]) => path.startsWith(localePrefix))
    .sort(([a], [b]) => a.localeCompare(b))

  return files.reduce<LocaleMessageObject>((acc, [, raw]) => {
    const parsed = parse(raw) as LocaleMessageObject
    return deepMerge(acc, parsed)
  }, {})
}

export const messages: Record<Locale, LocaleMessageObject> = {
  es: readLocaleMessages('es'),
  ca: readLocaleMessages('ca'),
  en: readLocaleMessages('en'),
}
