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

function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const next = { ...target }

  for (const [key, value] of Object.entries(source)) {
    const existing = next[key]
    if (
      value != null
      && typeof value === 'object'
      && !Array.isArray(value)
      && existing != null
      && typeof existing === 'object'
      && !Array.isArray(existing)
    ) {
      next[key] = deepMerge(existing as Record<string, any>, value as Record<string, any>)
    } else {
      next[key] = value
    }
  }

  return next
}

function readLocaleMessages(locale: Locale): Record<string, any> {
  const localePrefix = `./locales/${locale}/`
  const files = Object.entries(localeFiles)
    .filter(([path]) => path.startsWith(localePrefix))
    .sort(([a], [b]) => a.localeCompare(b))

  return files.reduce<Record<string, any>>((acc, [, raw]) => {
    const parsed = parse(raw) as Record<string, any>
    return deepMerge(acc, parsed)
  }, {})
}

export const messages: Record<Locale, Record<string, any>> = {
  es: readLocaleMessages('es'),
  ca: readLocaleMessages('ca'),
  en: readLocaleMessages('en'),
}
