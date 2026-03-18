const localeFiles = import.meta.glob('./locales/*/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export type Locale = 'es' | 'ca' | 'en'

export const localeLabels: Record<Locale, string> = {
  es: 'ES',
  ca: 'CA',
  en: 'EN',
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

function parseScalar(value: string): any {
  const trimmed = value.trim()
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    const content = trimmed.slice(1, -1)
    return content
      .replace(/\\\\/g, '\\')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
  }
  if (trimmed === 'null') return null
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed)
  return trimmed
}

function parseYamlObject(raw: string): Record<string, any> {
  const root: Record<string, any> = {}
  const stack: Array<{ indent: number; obj: Record<string, any> }> = [{ indent: -1, obj: root }]
  const lines = raw.replace(/\r/g, '').split('\n')

  for (const line of lines) {
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue
    const match = line.match(/^(\s*)([^:#]+):(.*)$/)
    if (!match) continue

    const indent = match[1].length
    const key = match[2].trim()
    const valuePart = match[3]

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop()
    }

    const parent = stack[stack.length - 1].obj
    if (valuePart.trim() === '') {
      const nested: Record<string, any> = {}
      parent[key] = nested
      stack.push({ indent, obj: nested })
    } else {
      parent[key] = parseScalar(valuePart)
    }
  }

  return root
}

function readLocaleMessages(locale: Locale): Record<string, any> {
  const prefix = `./locales/${locale}/`
  const files = Object.entries(localeFiles)
    .filter(([filePath]) => filePath.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b))

  return files.reduce<Record<string, any>>((acc, [, raw]) => {
    const parsed = parseYamlObject(raw)
    return deepMerge(acc, parsed)
  }, {})
}

export const messages: Record<Locale, Record<string, any>> = {
  es: readLocaleMessages('es'),
  ca: readLocaleMessages('ca'),
  en: readLocaleMessages('en'),
}
