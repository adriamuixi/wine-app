const localeFiles = import.meta.glob('./locales/*/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export type Locale = 'es' | 'ca' | 'en'
export type PublicMessages = {
  about: {
    eyebrow: string
    title: string
    intro: string
    membersAria: string
    statsAria: string
    members: {
      tat: {
        fullName: string
        role: string
        bio: string
        photoAlt: string
      }
      rosset: {
        fullName: string
        role: string
        bio: string
        photoAlt: string
      }
    }
    stats: {
      totalWines: string
      totalReviews: string
      tatAverage: string
      rossetAverage: string
      syncIndex: string
    }
  }
  card: {
    avgScore: string
    priceFrom: string
    reward: string
    noReward: string
    region: string
    vintage: string
    points: string
    featured90: string
    viewDetails: string
    viewProfile: string
    manufacturing: string
    grapeVarieties: string
  }
  common: {
    appName: string
    title: string
    subtitle: string
    searchPlaceholder: string
    countries: Record<string, string>
    agingType: Record<string, string>
    galleryPhotoLabels: {
      bottle: string
      front: string
      back: string
      context: string
    }
    catalogEyebrow: string
    meta: {
      siteName: string
      sectionDoMap: string
      sectionAbout: string
      sectionCatalog: string
      descriptionDoMap: string
      descriptionAbout: string
      descriptionCatalog: string
    }
    doShort: string
    doLabel: string
    wineInfoTitle: string
    notAvailableShort: string
    removeAction: string
    autonomousCommunity: string
    wineInfoAria: string
    mobileCardLayoutAria: string
    mobileListLayoutAria: string
    reviewSummaryAria: string
    brandAlt: string
  }
  doMap: {
    eyebrow: string
    title: string
    subtitle: string
    tip: string
    listTitle: string
    worldMapLabel: string
    openCatalog: string
    filterCountry: string
    chooseDo: string
    chooseCountryFirst: string
    chooseDoPlaceholder: string
    closeSelector: string
    allWorld: string
    fullscreenOpen: string
    fullscreenClose: string
    allWorldShort: string
    loadError: string
    noCoordinates: string
  }
  filters: {
    title: string
    search: string
    type: string
    country: string
    region: string
    grape: string
    minScore: string
    sort: string
    allTypes: string
    allCountries: string
    allRegions: string
    anyScore: string
    clear: string
    doSearchPlaceholder: string
    allGrapes: string
    activeSuffix: string
    activeFiltersAria: string
  }
  icons: Record<string, string>
  modal: {
    close: string
    gallery: string
    details: string
    winery: string
    origin: string
    style: string
    grapes: string
    aging: string
    alcohol: string
    tastedAt: string
    month: string
    place: string
    mariaScore: string
    adriaScore: string
    tasting: string
    tags: string
    rewardNone: string
  }
  sort: {
    score_desc: string
    price_asc: string
    price_desc: string
    latest: string
    tasting_date_desc: string
    tasting_date_asc: string
  }
  topbar: {
    resultCount: string
    dark: string
    light: string
    language: string
    menu: string
    navigation: string
    winesCatalog: string
    doMap: string
    whoWeAre: string
    backoffice: string
    openFilters: string
    closeFilters: string
    switchToList: string
    switchToCards: string
    listView: string
    cardView: string
  }
  wineType: {
    red: string
    white: string
    rose: string
    sparkling: string
  }
}

export const localeLabels: Record<Locale, string> = {
  es: 'ES',
  ca: 'CA',
  en: 'EN',
}

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonObject
type JsonObject = { [key: string]: JsonValue }

function isJsonObject(value: unknown): value is JsonObject {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function deepMerge(target: JsonObject, source: JsonObject): JsonObject {
  const next = { ...target }
  for (const [key, value] of Object.entries(source)) {
    const existing = next[key]
    if (isJsonObject(value) && isJsonObject(existing)) {
      next[key] = deepMerge(existing, value)
    } else {
      next[key] = value
    }
  }
  return next
}

function parseScalar(value: string): JsonPrimitive {
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

function parseYamlObject(raw: string): JsonObject {
  const root: JsonObject = {}
  const stack: Array<{ indent: number; obj: JsonObject }> = [{ indent: -1, obj: root }]
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
      const nested: JsonObject = {}
      parent[key] = nested
      stack.push({ indent, obj: nested })
    } else {
      parent[key] = parseScalar(valuePart)
    }
  }

  return root
}

function readLocaleMessages(locale: Locale): PublicMessages {
  const order = ['common', 'about', 'doMap', 'toolbar', 'main'] as const
  const sectionOrder: Record<string, number> = Object.fromEntries(order.map((name, index) => [name, index]))
  const files = Object.entries(localeFiles)
    .filter(([filePath]) => filePath.endsWith(`/${locale}.yaml`))
    .sort(([a], [b]) => {
      const sectionA = a.split('/')[2] ?? ''
      const sectionB = b.split('/')[2] ?? ''
      const bySection = (sectionOrder[sectionA] ?? Number.MAX_SAFE_INTEGER) - (sectionOrder[sectionB] ?? Number.MAX_SAFE_INTEGER)
      if (bySection !== 0) return bySection
      return a.localeCompare(b)
    })

  const merged = files.reduce<JsonObject>((acc, [, raw]) => {
    const parsed = parseYamlObject(raw)
    return deepMerge(acc, parsed)
  }, {})

  return merged as unknown as PublicMessages
}

export const messages: Record<Locale, PublicMessages> = {
  es: readLocaleMessages('es'),
  ca: readLocaleMessages('ca'),
  en: readLocaleMessages('en'),
}
