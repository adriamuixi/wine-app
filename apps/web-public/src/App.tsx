import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type Locale = 'ca' | 'es'
type ThemeMode = 'light' | 'dark'
type WineType = 'red' | 'white' | 'rose' | 'sparkling'
type SortKey = 'score_desc' | 'price_asc' | 'price_desc' | 'latest' | 'tasting_date_desc' | 'tasting_date_asc'
type ScoreFilterBucket = 'all' | 'lt70' | '70_80' | '80_90' | 'gte90'
const DO_MAP_ALL_WORLD_VALUE = '__all_world__'
type DoMapPoint = {
  id: number
  name: string
  countryCode: NonNullable<WineListApiItem['country']>
  country: string
  region: string
  lat: number
  lng: number
  zoom?: number
  doLogoImage?: string
  regionLogoImage?: string
  description?: string
}
type UrlCatalogState = {
  q: string
  type: 'all' | WineType
  country: string
  region: string
  grape: string
  minScore: ScoreFilterBucket
  sort: SortKey
  wineId: number | null
}

type WineCard = {
  id: number
  name: string
  winery: string
  country: string
  region: string
  type: WineType
  vintage: number
  avgScore: number
  priceFrom: number
  tastedAt: string
  month: string
  grapes: string
  aging: string
  alcohol: string
  mariaScore: number | null
  adriaScore: number | null
  place: string
  city: string
  techSheet: boolean
  reward?: {
    name: string
    score?: number
  }
  rewardBadgeImage?: string
  doLogoImage?: string
  regionLogoImage?: string
  notes: string
  tags: string[]
  image: string
  gallery: string[]
  tastingDateSortTs: number | null
}

type AwardApiName = 'penin' | 'parker' | 'wine_spectator' | 'decanter' | 'james_suckling' | 'guia_proensa'
type AwardApiValue = {
  name: AwardApiName
  score: number | null
  year: number | null
}

type WineListApiItem = {
  id: number
  name: string
  winery: string | null
  wine_type: 'red' | 'white' | 'rose' | 'sparkling' | 'sweet' | 'fortified' | null
  aging_type: 'young' | 'crianza' | 'reserve' | 'grand_reserve' | null
  country: 'spain' | 'france' | 'italy' | 'portugal' | 'germany' | 'argentina' | 'chile' | 'united_states' | 'south_africa' | 'australia' | null
  do: {
    id: number
    name: string
    do_logo: string | null
    region_logo: string | null
  } | null
  vintage_year: number | null
  avg_score: number | null
  updated_at: string
  grapes: Array<{
    id: number
    name: string
    color: 'red' | 'white' | null
    percentage: number | null
  }>
  awards: AwardApiValue[]
  reviews: Array<{
    user_id: number
    name: string
    lastname: string
    created_at: string
    score: number | null
  }>
  photos: Array<{
    type: 'front_label' | 'back_label' | 'bottle' | 'situation'
    url: string | null
  }>
}

type WineListApiResponse = {
  items: WineListApiItem[]
  pagination: {
    page: number
    limit: number
    total_items: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

type DoApiItem = {
  id: number
  name: string
  region: string
  country: NonNullable<WineListApiItem['country']>
  country_code: string
  do_logo: string | null
  region_logo: string | null
  map_data?: {
    lat: number
    lng: number
    zoom?: number | null
  } | null
}

type DoApiResponse = {
  items: DoApiItem[]
}

type DoFilterOption = {
  id: number
  name: string
  region: string
  countryCode: NonNullable<WineListApiItem['country']>
  countryLabel: string
  doLogoImage?: string
  regionLogoImage?: string
}

type WineDetailsApiResponse = {
  wine?: {
    id: number
    name: string
    winery: string | null
    wine_type: 'red' | 'white' | 'rose' | 'sparkling' | 'sweet' | 'fortified' | null
    aging_type: 'young' | 'crianza' | 'reserve' | 'grand_reserve' | null
    country: 'spain' | 'france' | 'italy' | 'portugal' | 'germany' | 'argentina' | 'chile' | 'united_states' | 'south_africa' | 'australia' | null
    do: {
      id: number
      name: string
      do_logo: string | null
      region_logo: string | null
    } | null
    vintage_year: number | null
    alcohol_percentage: number | null
    grapes: Array<{
      id: number
      name: string
      color: 'red' | 'white' | null
      percentage: number | null
    }>
    awards: Array<{
      id: number
      name: AwardApiName
      score: number | null
      year: number | null
    }>
    photos: Array<{
      id: number
      type: 'front_label' | 'back_label' | 'bottle' | 'situation' | null
      url: string
    }>
    purchases: Array<{
      id: number
      place: {
        id: number
        name: string
        city: string | null
      }
      price_paid: number
      purchased_at: string
    }>
    reviews: Array<{
      id: number
      user: {
        id: number
        name: string
        lastname: string
      }
      score: number | null
      created_at: string
    }>
  }
}

type Dictionary = {
  appName: string
  title: string
  subtitle: string
  searchPlaceholder: string
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
  }
  icons: {
    filters: string
    search: string
    type: string
    country: string
    region: string
    grape: string
    minScore: string
    sort: string
    results: string
    avgScore: string
    rewards: string
    winery: string
    origin: string
    vintage: string
    price: string
    reward: string
    details: string
    gallery: string
    tasting: string
    tags: string
  }
  sort: Record<SortKey, string>
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
  wineType: Record<WineType, string>
}

const THEME_KEY = 'wine-web-public-theme'
const LOCALE_KEY = 'wine-web-public-locale'
const MOBILE_VIEW_COOKIE_KEY = 'wine-web-public-mobile-view'
const DEFAULT_SORT: SortKey = 'score_desc'
const LEAFLET_CSS_LINK_ID = 'leaflet-css'
const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_SCRIPT_ID = 'leaflet-script'
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

type LeafletGlobal = {
  map: (container: HTMLElement, options?: Record<string, unknown>) => {
    setView: (center: [number, number], zoom: number) => unknown
    flyTo: (center: [number, number], zoom?: number, options?: Record<string, unknown>) => unknown
    fitBounds: (bounds: unknown, options?: Record<string, unknown>) => unknown
    on: (event: string, handler: () => void) => unknown
    getZoom: () => number
    invalidateSize: (options?: Record<string, unknown>) => void
    remove: () => void
  }
  tileLayer: (urlTemplate: string, options?: Record<string, unknown>) => { addTo: (map: unknown) => unknown }
  latLngBounds: (latlngs: Array<[number, number]>) => unknown
  divIcon: (options?: Record<string, unknown>) => unknown
  marker: (latlng: [number, number], options?: Record<string, unknown>) => {
    addTo: (map: unknown) => unknown
    on: (event: string, handler: () => void) => unknown
    bindTooltip: (content: string, options?: Record<string, unknown>) => unknown
    openTooltip: () => unknown
    closeTooltip: () => unknown
    getElement: () => HTMLElement | null
  }
  circleMarker: (latlng: [number, number], options?: Record<string, unknown>) => {
    addTo: (map: unknown) => unknown
    on: (event: string, handler: () => void) => unknown
    setStyle: (style: Record<string, unknown>) => unknown
    bindTooltip: (content: string, options?: Record<string, unknown>) => unknown
  }
}

declare global {
  interface Window {
    L?: LeafletGlobal
  }
}

function loadLeafletGlobal(): Promise<LeafletGlobal> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Leaflet requires a browser environment.'))
  }

  if (window.L) {
    return Promise.resolve(window.L)
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(LEAFLET_SCRIPT_ID) as HTMLScriptElement | null
    if (existing && !window.L) {
      existing.remove()
    }

    const script = document.createElement('script')
    script.id = LEAFLET_SCRIPT_ID
    script.src = LEAFLET_JS_URL
    script.async = true
    script.onload = () => {
      if (!window.L) {
        reject(new Error('Leaflet loaded but global object is missing.'))
        return
      }
      resolve(window.L)
    }
    script.onerror = () => {
      reject(new Error('Failed to load Leaflet script.'))
    }
    document.head.appendChild(script)
  })
}

const DICT: Record<Locale, Dictionary> = {
  ca: {
    appName: 'Els nostres vins',
    title: 'Catàleg de vins',
    subtitle: 'Selecció pública amb fitxes visuals, puntuació mitjana i reconeixements destacats.',
    searchPlaceholder: 'Cerca per nom, celler o regió...',
    filters: {
      title: 'Filtres',
      search: 'Cercar',
      type: 'Tipus',
      country: 'País',
      region: 'Regió / D.O.',
      grape: 'Varietat de raïm',
      minScore: 'Puntuació mínima',
      sort: 'Ordenació',
      allTypes: 'Tots els tipus',
      allCountries: 'Tots els països',
      allRegions: 'Totes les regions',
      anyScore: 'Qualsevol puntuació',
      clear: 'Neteja filtres',
    },
    topbar: {
      resultCount: 'vins',
      dark: 'Fosc',
      light: 'Clar',
      language: 'Idioma',
      menu: 'Menú',
      navigation: 'Navegació',
      winesCatalog: 'Catàleg de vins',
      doMap: 'Mapa DO',
      whoWeAre: 'Qui som',
      backoffice: 'Àrea privada',
      openFilters: 'Obre filtres',
      closeFilters: 'Tanca filtres',
    },
    doMap: {
      eyebrow: '',
      title: 'Mapa DO',
      subtitle: '',
      tip: '',
      listTitle: 'Denominacions destacades',
      worldMapLabel: 'Mapa mundi de DO',
      openCatalog: '',
      filterCountry: 'País',
      chooseDo: 'Seleccionar DO',
      chooseCountryFirst: 'Primer selecciona un país.',
      chooseDoPlaceholder: 'Escull una denominació',
      closeSelector: 'Tancar selector',
      allWorld: 'Tot el món',
      fullscreenOpen: 'Obrir mapa a pantalla completa',
      fullscreenClose: 'Tancar pantalla completa',
    },
    card: {
      avgScore: 'Punt. mitjana',
      priceFrom: 'Preu des de',
      reward: 'Reconeixement',
      noReward: 'Sense premi destacat',
      region: 'Origen',
      vintage: 'Anyada',
      points: 'punts',
      featured90: '+90 destacat',
      viewDetails: 'Veure detall',
      viewProfile: 'Veure perfil',
    },
    icons: {
      filters: '⚗',
      search: '⌕',
      type: '◈',
      country: '🌍',
      region: '🗺',
      grape: '🍇',
      minScore: '★',
      sort: '⇅',
      results: '▦',
      avgScore: '★',
      rewards: '🏅',
      winery: '🏛',
      origin: '🧭',
      vintage: '🗓',
      price: '€',
      reward: '🏆',
      details: 'ℹ',
      gallery: '🖼',
      tasting: '🍷',
      tags: '🏷',
    },
    sort: {
      score_desc: 'Puntuació (major a menor)',
      price_asc: 'Preu (menor a major)',
      price_desc: 'Preu (major a menor)',
      latest: 'Anyada més recent',
      tasting_date_desc: 'Data de la cata (desc)',
      tasting_date_asc: 'Data de la cata (asc)',
    },
    modal: {
      close: 'Tanca',
      gallery: 'Galeria',
      details: 'Detall del vi',
      winery: 'Celler',
      origin: 'Origen',
      style: 'Estil',
      grapes: 'Varietats',
      aging: 'Criança',
      alcohol: 'Alcohol',
      tastedAt: 'Data de tast',
      month: 'Mes',
      place: 'Lloc',
      mariaScore: 'Valoració Maria',
      adriaScore: 'Valoració Adrià',
      tasting: 'Nota de tast',
      tags: 'Etiquetes',
      rewardNone: 'Sense premi destacat',
    },
    wineType: {
      red: 'Negre',
      white: 'Blanc',
      rose: 'Rosat',
      sparkling: 'Escumós',
    },
  },
  es: {
    appName: 'Els nostres vins',
    title: 'Catálogo de vinos',
    subtitle: 'Selección pública con fichas visuales, puntuación media y reconocimientos destacados.',
    searchPlaceholder: 'Buscar por nombre, bodega o región...',
    filters: {
      title: 'Filtros',
      search: 'Buscar',
      type: 'Tipo',
      country: 'País',
      region: 'Región / D.O.',
      grape: 'Variedad de uva',
      minScore: 'Puntuación mínima',
      sort: 'Ordenación',
      allTypes: 'Todos los tipos',
      allCountries: 'Todos los países',
      allRegions: 'Todas las regiones',
      anyScore: 'Cualquier puntuación',
      clear: 'Limpiar filtros',
    },
    topbar: {
      resultCount: 'vinos',
      dark: 'Oscuro',
      light: 'Claro',
      language: 'Idioma',
      menu: 'Menú',
      navigation: 'Navegación',
      winesCatalog: 'Catálogo de vinos',
      doMap: 'Mapa DO',
      whoWeAre: 'Quiénes somos',
      backoffice: 'Área privada',
      openFilters: 'Abrir filtros',
      closeFilters: 'Cerrar filtros',
    },
    doMap: {
      eyebrow: '',
      title: 'Mapa DO',
      subtitle: '',
      tip: '',
      listTitle: 'Denominaciones destacadas',
      worldMapLabel: 'Mapa mundi de DO',
      openCatalog: '',
      filterCountry: 'País',
      chooseDo: 'Seleccionar DO',
      chooseCountryFirst: 'Primero selecciona un país.',
      chooseDoPlaceholder: 'Elige una denominación',
      closeSelector: 'Cerrar selector',
      allWorld: 'Todo el mundo',
      fullscreenOpen: 'Abrir mapa en pantalla completa',
      fullscreenClose: 'Cerrar pantalla completa',
    },
    card: {
      avgScore: 'Punt. media',
      priceFrom: 'Precio desde',
      reward: 'Reconocimiento',
      noReward: 'Sin premio destacado',
      region: 'Origen',
      vintage: 'Añada',
      points: 'puntos',
      featured90: '+90 destacado',
      viewDetails: 'Ver detalle',
      viewProfile: 'Ver perfil',
    },
    icons: {
      filters: '⚗',
      search: '⌕',
      type: '◈',
      country: '🌍',
      region: '🗺',
      grape: '🍇',
      minScore: '★',
      sort: '⇅',
      results: '▦',
      avgScore: '★',
      rewards: '🏅',
      winery: '🏛',
      origin: '🧭',
      vintage: '🗓',
      price: '€',
      reward: '🏆',
      details: 'ℹ',
      gallery: '🖼',
      tasting: '🍷',
      tags: '🏷',
    },
    sort: {
      score_desc: 'Puntuación (mayor a menor)',
      price_asc: 'Precio (menor a mayor)',
      price_desc: 'Precio (mayor a menor)',
      latest: 'Añada más reciente',
      tasting_date_desc: 'Fecha de la cata (desc)',
      tasting_date_asc: 'Fecha de la cata (asc)',
    },
    modal: {
      close: 'Cerrar',
      gallery: 'Galería',
      details: 'Detalle del vino',
      winery: 'Bodega',
      origin: 'Origen',
      style: 'Estilo',
      grapes: 'Variedades',
      aging: 'Crianza',
      alcohol: 'Alcohol',
      tastedAt: 'Fecha de cata',
      month: 'Mes',
      place: 'Lugar',
      mariaScore: 'Valoración Maria',
      adriaScore: 'Valoración Adrià',
      tasting: 'Nota de cata',
      tags: 'Etiquetas',
      rewardNone: 'Sin premio destacado',
    },
    wineType: {
      red: 'Tinto',
      white: 'Blanco',
      rose: 'Rosado',
      sparkling: 'Espumoso',
    },
  },
}

const DEFAULT_PUBLIC_WINE_IMAGE_LIGHT = '/images/photos/wines/no-photo.png'
const DEFAULT_PUBLIC_WINE_IMAGE_DARK = '/images/photos/wines/no-photo-dark.png'

function defaultPublicWineImageForTheme(isDark: boolean): string {
  return isDark ? DEFAULT_PUBLIC_WINE_IMAGE_DARK : DEFAULT_PUBLIC_WINE_IMAGE_LIGHT
}

function resolvePublicWineImageForTheme(src: string, isDark: boolean): string {
  if (src === DEFAULT_PUBLIC_WINE_IMAGE_LIGHT || src === DEFAULT_PUBLIC_WINE_IMAGE_DARK) {
    return defaultPublicWineImageForTheme(isDark)
  }
  return src
}

function awardLabel(name: AwardApiName): string {
  if (name === 'penin') return 'Peñín'
  if (name === 'wine_spectator') return 'Wine Spectator'
  if (name === 'james_suckling') return 'James Suckling'
  if (name === 'guia_proensa') return 'Guía Proensa'
  if (name === 'decanter') return 'Decanter'
  return 'Parker'
}

function peninBadgeImagePath(score: number | null | undefined): string | undefined {
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    return undefined
  }

  const rounded = Math.round(score)
  if (rounded < 86 || rounded > 99) {
    return undefined
  }

  return `/images/icons/awards/penin/penin-${rounded}.png`
}

function mapPrimaryAwardToReward(
  award: Pick<AwardApiValue, 'name' | 'score'> | undefined,
): { reward?: WineCard['reward']; rewardBadgeImage?: string } {
  if (!award) {
    return {}
  }

  const rewardScore = typeof award.score === 'number' && Number.isFinite(award.score)
    ? Math.round(award.score)
    : undefined
  const reward: WineCard['reward'] = {
    name: awardLabel(award.name),
    score: rewardScore,
  }

  return {
    reward,
    rewardBadgeImage: award.name === 'penin' ? peninBadgeImagePath(award.score) : undefined,
  }
}

function splitGrapeVarieties(grapes: string): string[] {
  return grapes
    .split(/[,/]/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function doLogoPathFromImageName(logoImage: string | null | undefined): string | undefined {
  if (!logoImage || logoImage.trim() === '') {
    return undefined
  }

  return `/images/icons/DO/${logoImage}`
}

function regionLogoPathFromImageName(regionLogo: string | null | undefined): string | undefined {
  if (!regionLogo || regionLogo.trim() === '') {
    return undefined
  }

  if (regionLogo === 'united_states.png') {
    return `/images/flags/country/${regionLogo}`
  }

  return `/images/flags/regions/${regionLogo}`
}

function resolveApiBaseUrl(): string {
  const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
  const fallbackBase = window.location.port.startsWith('517') ? 'http://localhost:8080' : window.location.origin
  return configuredBase && configuredBase.length > 0 ? configuredBase : fallbackBase
}

function countryFlagEmoji(country: string): string {
  const map: Record<string, string> = {
    Spain: '🇪🇸',
    France: '🇫🇷',
    Portugal: '🇵🇹',
    Italy: '🇮🇹',
    Germany: '🇩🇪',
    Argentina: '🇦🇷',
    Chile: '🇨🇱',
    USA: '🇺🇸',
    'United States': '🇺🇸',
  }

  return map[country] ?? '🏳️'
}

function countryFlagPath(country: string): string | null {
  const map: Record<string, string> = {
    Spain: '/images/flags/country/spain.png',
    France: '/images/flags/country/france.png',
    Italy: '/images/flags/country/italy.png',
    Portugal: '/images/flags/country/portugal.png',
    Germany: '/images/flags/country/germany.png',
    Argentina: '/images/flags/country/argentina.png',
    Chile: '/images/flags/country/chile.png',
    USA: '/images/flags/country/united_states.png',
    'United States': '/images/flags/country/united_states.png',
    'South Africa': '/images/flags/country/south_africa.png',
    Australia: '/images/flags/country/australia.png',
  }
  return map[country] ?? null
}

function localizedCountryName(country: string, locale: Locale): string {
  const map: Record<string, { ca: string; es: string }> = {
    Spain: { ca: 'Espanya', es: 'España' },
    France: { ca: 'França', es: 'Francia' },
    Italy: { ca: 'Itàlia', es: 'Italia' },
    Portugal: { ca: 'Portugal', es: 'Portugal' },
    Germany: { ca: 'Alemanya', es: 'Alemania' },
    Argentina: { ca: 'Argentina', es: 'Argentina' },
    Chile: { ca: 'Xile', es: 'Chile' },
    'United States': { ca: 'Estats Units', es: 'Estados Unidos' },
    'South Africa': { ca: 'Sud-àfrica', es: 'Sudáfrica' },
    Australia: { ca: 'Austràlia', es: 'Australia' },
  }

  return map[country]?.[locale] ?? country
}

function spanishAutonomousCommunity(region: string): { name: string; slug: string } | null {
  const normalizeRegionKey = (value: string): string => normalizeSearchText(value).replace(/[^a-z0-9]+/g, ' ').trim()

  const slugToCommunityName: Record<string, string> = {
    andalucia: 'Andalucía',
    aragon: 'Aragón',
    asturias: 'Asturias',
    canarias: 'Canarias',
    castilla_y_leon: 'Castilla y León',
    castilla_la_mancha: 'Castilla-La Mancha',
    cataluna: 'Cataluña',
    comunidad_valenciana: 'Comunidad Valenciana',
    extremadura: 'Extremadura',
    galicia: 'Galicia',
    baleares: 'Islas Baleares',
    la_rioja: 'La Rioja',
    madrid: 'Madrid',
    murcia: 'Murcia',
    navarra: 'Navarra',
    pais_vasco: 'País Vasco',
  }

  const regionToCommunitySlug: Record<string, keyof typeof slugToCommunityName> = {
    andalucia: 'andalucia',
    aragon: 'aragon',
    asturias: 'asturias',
    canarias: 'canarias',
    'castilla y leon': 'castilla_y_leon',
    'castilla leon': 'castilla_y_leon',
    'castilla la mancha': 'castilla_la_mancha',
    cataluna: 'cataluna',
    'comunidad valenciana': 'comunidad_valenciana',
    extremadura: 'extremadura',
    galicia: 'galicia',
    'islas baleares': 'baleares',
    baleares: 'baleares',
    'la rioja': 'la_rioja',
    madrid: 'madrid',
    murcia: 'murcia',
    navarra: 'navarra',
    'pais vasco': 'pais_vasco',
    'terra alta': 'cataluna',
    penedes: 'cataluna',
    montsant: 'cataluna',
    tarragona: 'cataluna',
    priorat: 'cataluna',
    'conca de barbera': 'cataluna',
    'pla de bages': 'cataluna',
    alella: 'cataluna',
    emporda: 'cataluna',
    'costers del segre': 'cataluna',
    rioja: 'la_rioja',
    'ribera del duero': 'castilla_y_leon',
    toro: 'castilla_y_leon',
    cigales: 'castilla_y_leon',
    arlanza: 'castilla_y_leon',
    somontano: 'aragon',
    carinena: 'aragon',
    calatayud: 'aragon',
    'rias baixas': 'galicia',
  }

  const slug = regionToCommunitySlug[normalizeRegionKey(region)]
  if (!slug) {
    return null
  }

  return {
    name: slugToCommunityName[slug],
    slug,
  }
}

function autonomousCommunityNameForRegion(region: string): string | null {
  const community = spanishAutonomousCommunity(region)
  return community?.name ?? null
}

function resolveApiAssetUrl(path: string): string {
  const trimmed = path.trim()
  if (trimmed === '') {
    return DEFAULT_PUBLIC_WINE_IMAGE_LIGHT
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  const base = resolveApiBaseUrl()
  return trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`
}

function mapApiWineType(value: WineListApiItem['wine_type']): WineType {
  if (value === 'white' || value === 'rose' || value === 'sparkling') {
    return value
  }
  return 'red'
}

function countryCodeToLabel(value: WineListApiItem['country']): string {
  const map: Record<NonNullable<WineListApiItem['country']>, string> = {
    spain: 'Spain',
    france: 'France',
    italy: 'Italy',
    portugal: 'Portugal',
    germany: 'Germany',
    argentina: 'Argentina',
    chile: 'Chile',
    united_states: 'United States',
    south_africa: 'South Africa',
    australia: 'Australia',
  }
  if (!value) return 'Spain'
  return map[value]
}

function mapAgingTypeLabel(value: WineListApiItem['aging_type'], locale: Locale): string {
  if (value === 'young') return locale === 'ca' ? 'Jove' : 'Joven'
  if (value === 'crianza') return locale === 'ca' ? 'Criança' : 'Crianza'
  if (value === 'reserve') return locale === 'ca' ? 'Reserva' : 'Reserva'
  if (value === 'grand_reserve') return locale === 'ca' ? 'Gran reserva' : 'Gran reserva'
  return 'n/d'
}

function mapWineGrapesLabel(grapes: Array<{ name: string }> | undefined): string {
  if (!Array.isArray(grapes) || grapes.length === 0) {
    return '-'
  }

  const names = grapes
    .map((grape) => grape.name.trim())
    .filter((name) => name !== '')

  return names.length > 0 ? names.join(', ') : '-'
}

function mapUserScoresFromListReviews(
  reviews: WineListApiItem['reviews'] | undefined,
): { adriaScore: number | null; mariaScore: number | null } {
  const adria = Array.isArray(reviews) ? reviews.find((review) => review.user_id === 1) : undefined
  const maria = Array.isArray(reviews) ? reviews.find((review) => review.user_id === 2) : undefined

  return {
    adriaScore: typeof adria?.score === 'number' ? adria.score : null,
    mariaScore: typeof maria?.score === 'number' ? maria.score : null,
  }
}

function mapUserScoresFromDetailReviews(
  reviews: NonNullable<WineDetailsApiResponse['wine']>['reviews'] | undefined,
): { adriaScore: number | null; mariaScore: number | null } {
  const adria = Array.isArray(reviews) ? reviews.find((review) => review.user?.id === 1) : undefined
  const maria = Array.isArray(reviews) ? reviews.find((review) => review.user?.id === 2) : undefined

  return {
    adriaScore: typeof adria?.score === 'number' ? adria.score : null,
    mariaScore: typeof maria?.score === 'number' ? maria.score : null,
  }
}

function mapWineListItemToWineCard(item: WineListApiItem, locale: Locale): WineCard {
  const byType: Record<'bottle' | 'front_label' | 'back_label' | 'situation', string> = {
    bottle: DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
    front_label: DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
    back_label: DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
    situation: DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
  }

  ;(item.photos ?? []).forEach((photo) => {
    if (!photo?.url || !photo?.type) return
    byType[photo.type] = resolveApiAssetUrl(photo.url)
  })

  const gallery = [byType.bottle, byType.front_label, byType.back_label, byType.situation]
  const avgScore = typeof item.avg_score === 'number' && Number.isFinite(item.avg_score)
    ? Math.round(item.avg_score * 10) / 10
    : 0
  const firstReviewCreatedAt = Array.isArray(item.reviews) && item.reviews.length > 0
    ? item.reviews[0]?.created_at
    : undefined
  const tastingSourceDate = typeof firstReviewCreatedAt === 'string' && firstReviewCreatedAt.trim() !== ''
    ? firstReviewCreatedAt
    : item.updated_at
  const tastingDate = new Date(tastingSourceDate)
  const dateLocale = locale === 'ca' ? 'ca-ES' : 'es-ES'
  const tastedAt = Number.isNaN(tastingDate.getTime())
    ? '-'
    : new Intl.DateTimeFormat(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(tastingDate)
  const month = Number.isNaN(tastingDate.getTime())
    ? '-'
    : new Intl.DateTimeFormat(dateLocale, { month: 'long' }).format(tastingDate)
  const region = item.do?.name?.trim() || '-'
  const type = mapApiWineType(item.wine_type)
  const { reward, rewardBadgeImage } = mapPrimaryAwardToReward(item.awards?.[0])
  const userScores = mapUserScoresFromListReviews(item.reviews)

  return {
    id: item.id,
    name: item.name?.trim() || '-',
    winery: item.winery?.trim() || '-',
    country: countryCodeToLabel(item.country),
    region,
    type,
    vintage: item.vintage_year ?? new Date().getFullYear(),
    avgScore,
    priceFrom: 0,
    tastedAt,
    month,
    grapes: mapWineGrapesLabel(item.grapes),
    aging: mapAgingTypeLabel(item.aging_type, locale),
    alcohol: 'n/d',
    mariaScore: userScores.mariaScore,
    adriaScore: userScores.adriaScore,
    place: item.winery?.trim() || '-',
    city: '-',
    techSheet: false,
    reward,
    doLogoImage: doLogoPathFromImageName(item.do?.do_logo),
    regionLogoImage: regionLogoPathFromImageName(item.do?.region_logo),
    rewardBadgeImage,
    notes: '',
    tags: [region, type],
    image: byType.bottle,
    gallery,
    tastingDateSortTs: Number.isNaN(tastingDate.getTime()) ? null : tastingDate.getTime(),
  }
}

function mergeWineCardWithDetails(card: WineCard, details: NonNullable<WineDetailsApiResponse['wine']>, locale: Locale): WineCard {
  const byType: Record<'bottle' | 'front_label' | 'back_label' | 'situation', string> = {
    bottle: card.gallery[0] ?? DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
    front_label: card.gallery[1] ?? DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
    back_label: card.gallery[2] ?? DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
    situation: card.gallery[3] ?? DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
  }

  ;(details.photos ?? []).forEach((photo) => {
    if (!photo?.type || !photo?.url) return
    byType[photo.type] = resolveApiAssetUrl(photo.url)
  })

  const gallery = [byType.bottle, byType.front_label, byType.back_label, byType.situation]
  const lastPurchase = Array.isArray(details.purchases) && details.purchases.length > 0 ? details.purchases[0] : null
  const rewardMapping = mapPrimaryAwardToReward(Array.isArray(details.awards) ? details.awards[0] : undefined)
  const userScores = mapUserScoresFromDetailReviews(details.reviews)
  const tastedDate = lastPurchase?.purchased_at ? new Date(lastPurchase.purchased_at) : null
  const dateLocale = locale === 'ca' ? 'ca-ES' : 'es-ES'

  return {
    ...card,
    name: details.name?.trim() || card.name,
    winery: details.winery?.trim() || card.winery,
    country: countryCodeToLabel(details.country) || card.country,
    region: details.do?.name?.trim() || card.region,
    type: mapApiWineType(details.wine_type),
    vintage: details.vintage_year ?? card.vintage,
    grapes: mapWineGrapesLabel(details.grapes),
    aging: mapAgingTypeLabel(details.aging_type, locale),
    mariaScore: userScores.mariaScore ?? card.mariaScore,
    adriaScore: userScores.adriaScore ?? card.adriaScore,
    alcohol: typeof details.alcohol_percentage === 'number' ? `${details.alcohol_percentage}%` : card.alcohol,
    priceFrom: typeof lastPurchase?.price_paid === 'number' ? lastPurchase.price_paid : card.priceFrom,
    tastedAt: tastedDate && !Number.isNaN(tastedDate.getTime())
      ? new Intl.DateTimeFormat(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(tastedDate)
      : card.tastedAt,
    month: tastedDate && !Number.isNaN(tastedDate.getTime())
      ? new Intl.DateTimeFormat(dateLocale, { month: 'long' }).format(tastedDate)
      : card.month,
    place: lastPurchase?.place?.name || card.place,
    city: lastPurchase?.place?.city || card.city,
    reward: rewardMapping.reward ?? card.reward,
    rewardBadgeImage: rewardMapping.rewardBadgeImage ?? card.rewardBadgeImage,
    doLogoImage: doLogoPathFromImageName(details.do?.do_logo) ?? card.doLogoImage,
    regionLogoImage: regionLogoPathFromImageName(details.do?.region_logo) ?? card.regionLogoImage,
    image: byType.bottle,
    gallery,
    tastingDateSortTs: card.tastingDateSortTs,
  }
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'ca'
  const stored = window.localStorage.getItem(LOCALE_KEY)
  return stored === 'es' || stored === 'ca' ? stored : 'ca'
}

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null
  const cookie = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${name}=`))
  if (!cookie) return null
  return decodeURIComponent(cookie.slice(name.length + 1))
}

function setCookieValue(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`
}

function clearCookieValue(name: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`
}

function parseUrlState(): UrlCatalogState {
  if (typeof window === 'undefined') {
    return {
      q: '',
      type: 'all' as 'all' | WineType,
      country: 'all',
      region: 'all',
      grape: 'all',
      minScore: 'all' as ScoreFilterBucket,
      sort: DEFAULT_SORT as SortKey,
      wineId: null,
    }
  }

  const params = new URLSearchParams(window.location.search)
  const typeParam = params.get('type')
  const minScoreParam = params.get('minScore')
  const sortParam = params.get('sort')
  const wineParam = params.get('wine')

  const validType: 'all' | WineType =
    typeParam === 'red' || typeParam === 'white' || typeParam === 'rose' || typeParam === 'sparkling' ? typeParam : 'all'
  const minScore: ScoreFilterBucket =
    minScoreParam === 'lt70' || minScoreParam === '70_80' || minScoreParam === '80_90' || minScoreParam === 'gte90'
      ? minScoreParam
      : minScoreParam === '90'
        ? 'gte90'
        : minScoreParam === '80' || minScoreParam === '85'
          ? '80_90'
          : 'all'
  const validSort: SortKey =
    sortParam === 'price_asc'
      || sortParam === 'price_desc'
      || sortParam === 'latest'
      || sortParam === 'score_desc'
      || sortParam === 'tasting_date_desc'
      || sortParam === 'tasting_date_asc'
      ? sortParam
      : DEFAULT_SORT
  const wineId = wineParam && !Number.isNaN(Number(wineParam)) ? Number(wineParam) : null

  return {
    q: params.get('q') ?? '',
    type: validType,
    country: params.get('country') ?? 'all',
    region: params.get('region') ?? 'all',
    grape: params.get('grape') ?? 'all',
    minScore,
    sort: validSort,
    wineId,
  }
}

export default function App() {
  const initialUrl = useMemo(() => parseUrlState(), [])
  const currentPath = typeof window !== 'undefined'
    ? (window.location.pathname.replace(/\/+$/, '') || '/')
    : '/'
  const isDoMapPage = currentPath === '/do-map'
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
  const [locale, setLocale] = useState<Locale>(getInitialLocale)
  const [search, setSearch] = useState(initialUrl.q)
  const [typeFilter, setTypeFilter] = useState<'all' | WineType>(initialUrl.type)
  const [countryFilter, setCountryFilter] = useState<'all' | string>(initialUrl.country)
  const [regionFilter, setRegionFilter] = useState<'all' | string>(initialUrl.region)
  const [grapeFilter, setGrapeFilter] = useState<'all' | string>(initialUrl.grape)
  const [minScoreFilter, setMinScoreFilter] = useState<ScoreFilterBucket>(initialUrl.minScore)
  const [sortKey, setSortKey] = useState<SortKey>(initialUrl.sort)
  const [selectedWineId, setSelectedWineId] = useState<number | null>(initialUrl.wineId)
  const [activeModalImageIndex, setActiveModalImageIndex] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false)
  const [mobileViewMode, setMobileViewMode] = useState<'card' | 'list'>(() => {
    const stored = getCookieValue(MOBILE_VIEW_COOKIE_KEY)
    return stored === 'card' ? 'card' : 'list'
  })
  const [isDoDropdownOpen, setIsDoDropdownOpen] = useState(false)
  const [doSearchText, setDoSearchText] = useState('')
  const [doLogoPreview, setDoLogoPreview] = useState<{ src: string; label: string } | null>(null)
  const [wines, setWines] = useState<WineCard[]>([])
  const [doOptions, setDoOptions] = useState<DoApiItem[]>([])
  const [wineDetailsById, setWineDetailsById] = useState<Record<number, WineDetailsApiResponse['wine']>>({})
  const [selectedMapDoId, setSelectedMapDoId] = useState<number | null>(null)
  const [doMapZoomLevel, setDoMapZoomLevel] = useState(3.1)
  const [doMapCountryFilter, setDoMapCountryFilter] = useState<string>(DO_MAP_ALL_WORLD_VALUE)
  const [isDoMapCountryMenuOpen, setIsDoMapCountryMenuOpen] = useState(false)
  const [isDoMapMobileDoPickerOpen, setIsDoMapMobileDoPickerOpen] = useState(false)
  const [isDoMapMobile, setIsDoMapMobile] = useState(false)
  const [canDoMapFullscreen, setCanDoMapFullscreen] = useState(false)
  const [isDoMapFullscreen, setIsDoMapFullscreen] = useState(false)
  const [doMapInitError, setDoMapInitError] = useState(false)
  const doMapCanvasRef = useRef<HTMLDivElement | null>(null)
  const doMapContainerRef = useRef<HTMLDivElement | null>(null)
  const doMapInstanceRef = useRef<{
    setView: (center: [number, number], zoom: number) => unknown
    flyTo: (center: [number, number], zoom?: number, options?: Record<string, unknown>) => unknown
    fitBounds: (bounds: unknown, options?: Record<string, unknown>) => unknown
    on: (event: string, handler: () => void) => unknown
    getZoom: () => number
    invalidateSize: (options?: Record<string, unknown>) => void
    remove: () => void
  } | null>(null)
  const doMapMarkersRef = useRef<Array<{
    id: number
    marker: { openTooltip: () => unknown; closeTooltip: () => unknown }
    setSelected: (selected: boolean, zoomBoost: boolean) => void
  }>>([])

  const t = DICT[locale]
  const isDark = theme === 'dark'
  const isCatalogPage = !isDoMapPage
  const galleryPhotoLabels = locale === 'ca'
    ? ['Ampolla', 'Etiqueta frontal', 'Etiqueta posterior', 'Context']
    : ['Botella', 'Etiqueta frontal', 'Etiqueta posterior', 'Contexto']
  const logoSrc = isDark ? 'images/brand/logo-wordmark-dark.png' : 'images/brand/logo-wordmark-light.png'
  const adminHref = useMemo(() => {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8080/admin/'
    }
    return '/admin/'
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = locale
    window.localStorage.setItem(LOCALE_KEY, locale)
  }, [locale])

  useEffect(() => {
    if (mobileViewMode === 'card') {
      setCookieValue(MOBILE_VIEW_COOKIE_KEY, 'card', 60 * 60 * 24 * 365)
      return
    }
    clearCookieValue(MOBILE_VIEW_COOKIE_KEY)
  }, [mobileViewMode])

  useEffect(() => {
    if (isDoMapPage) {
      return
    }

    const controller = new AbortController()

    const loadWines = async () => {
      const items: WineListApiItem[] = []
      let page = 1
      const limit = 100
      const base = resolveApiBaseUrl()

      while (true) {
        const response = await fetch(`${base}/api/wines?page=${page}&limit=${limit}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const payload = await response.json() as WineListApiResponse
        items.push(...payload.items)

        if (!payload.pagination.has_next) {
          break
        }
        page += 1
      }

      const mappedItems = items.map((item) => mapWineListItemToWineCard(item, locale))
      setWines(mappedItems)
    }

    void loadWines().catch(() => {
      setWines([])
    })

    return () => {
      controller.abort()
    }
  }, [isDoMapPage, locale])

  useEffect(() => {
    if (isDoMapPage) {
      return
    }

    if (selectedWineId == null || wineDetailsById[selectedWineId]) {
      return
    }

    const controller = new AbortController()
    const base = resolveApiBaseUrl()

    void fetch(`${base}/api/wines/${selectedWineId}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const payload = await response.json() as WineDetailsApiResponse
        if (controller.signal.aborted || !payload.wine) {
          return
        }

        setWineDetailsById((current) => ({
          ...current,
          [selectedWineId]: payload.wine,
        }))
      })
      .catch(() => {})

    return () => {
      controller.abort()
    }
  }, [isDoMapPage, selectedWineId, wineDetailsById])

  useEffect(() => {
    const controller = new AbortController()
    const base = resolveApiBaseUrl()

    void fetch(`${base}/api/dos`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const payload = await response.json() as DoApiResponse
        setDoOptions(Array.isArray(payload.items) ? payload.items : [])
      })
      .catch(() => {
        setDoOptions([])
      })

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    const shouldLockScroll = isMobileMenuOpen || isMobileFiltersOpen || isMobileSortOpen
    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow

    if (shouldLockScroll) {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
    }
  }, [isMobileMenuOpen, isMobileFiltersOpen, isMobileSortOpen])

  useEffect(() => {
    if (!isDoMapPage) {
      return
    }

    const sync = () => setIsDoMapMobile(window.matchMedia('(max-width: 980px)').matches)
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [isDoMapPage])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isDoDropdownOpen) {
          setIsDoDropdownOpen(false)
          return
        }
        if (doLogoPreview) {
          setDoLogoPreview(null)
          return
        }
        if (isMobileFiltersOpen) {
          setIsMobileFiltersOpen(false)
          return
        }
        if (isMobileSortOpen) {
          setIsMobileSortOpen(false)
          return
        }
        setSelectedWineId(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [doLogoPreview, isDoDropdownOpen, isMobileFiltersOpen, isMobileSortOpen])

  useEffect(() => {
    if (!isDoDropdownOpen) {
      return
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('.do-combobox')) {
        return
      }
      if (event.target instanceof Node) {
        setIsDoDropdownOpen(false)
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [isDoDropdownOpen])

  useEffect(() => {
    if (!isDoMapCountryMenuOpen) {
      return
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('.do-map-country-select')) {
        return
      }
      setIsDoMapCountryMenuOpen(false)
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [isDoMapCountryMenuOpen])

  useEffect(() => {
    const onPopState = () => {
      const state = parseUrlState()
      setSearch(state.q)
      setTypeFilter(state.type)
      setCountryFilter(state.country)
      setRegionFilter(state.region)
      setGrapeFilter(state.grape)
      setMinScoreFilter(state.minScore)
      setSortKey(state.sort)
      setSelectedWineId(state.wineId)
      setActiveModalImageIndex(0)
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const countries = useMemo(() => {
    if (doOptions.length > 0) {
      const labels = Array.from(new Set(doOptions.map((item) => countryCodeToLabel(item.country))))
      labels.sort((a, b) => a.localeCompare(b))
      return ['all', ...labels]
    }
    return ['all', ...Array.from(new Set(wines.map((wine) => wine.country)))]
  }, [doOptions, wines])
  const doFilterOptions = useMemo(() => {
    if (doOptions.length > 0) {
      return doOptions
        .map((item) => ({
          id: item.id,
          name: item.name,
          region: item.region,
          countryCode: item.country,
          countryLabel: countryCodeToLabel(item.country),
          doLogoImage: doLogoPathFromImageName(item.do_logo),
          regionLogoImage: regionLogoPathFromImageName(item.region_logo),
        }))
        .sort((a, b) => {
          const byRegion = a.region.localeCompare(b.region)
          if (byRegion !== 0) return byRegion
          return a.name.localeCompare(b.name)
        })
    }

    const entries = new Map<string, DoFilterOption>()
    wines.forEach((wine, index) => {
      const name = wine.region.trim()
      if (name === '' || name === '-') return
      const key = `${wine.country}::${name}`
      if (!entries.has(key)) {
        entries.set(key, {
          id: index + 1,
          name,
          region: name,
          countryCode: 'spain',
          countryLabel: wine.country,
          doLogoImage: wine.doLogoImage,
          regionLogoImage: wine.regionLogoImage,
        })
      }
    })

    return Array.from(entries.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [doOptions, wines])
  const doOptionsByCountry = useMemo(
    () => (countryFilter === 'all' ? doFilterOptions : doFilterOptions.filter((item) => item.countryLabel === countryFilter)),
    [countryFilter, doFilterOptions],
  )
  const filteredDoOptions = useMemo(() => {
    const query = normalizeSearchText(doSearchText)
    if (query === '') {
      return doOptionsByCountry
    }
    return doOptionsByCountry.filter((item) => {
      const name = normalizeSearchText(item.name)
      const region = normalizeSearchText(item.region)
      return name.includes(query) || region.includes(query)
    })
  }, [doOptionsByCountry, doSearchText])
  const selectedDoOption = useMemo(
    () => doFilterOptions.find((item) => item.name === regionFilter && (countryFilter === 'all' || item.countryLabel === countryFilter)) ?? null,
    [countryFilter, doFilterOptions, regionFilter],
  )
  const selectedDoCommunityFlagPath = selectedDoOption?.countryCode === 'spain'
    ? selectedDoOption.regionLogoImage
    : null
  const grapeOptions = useMemo(
    () => ['all', ...Array.from(new Set(wines.map((wine) => wine.grapes.split(/[,/]/)[0]?.trim()).filter(Boolean)))],
    [wines],
  )

  useEffect(() => {
    if (regionFilter === 'all') {
      return
    }

    const exists = doOptionsByCountry.some((item) => item.name === regionFilter)
    if (!exists) {
      setRegionFilter('all')
    }
  }, [doOptionsByCountry, regionFilter])

  const filteredWines = useMemo(() => {
    const q = search.trim().toLowerCase()

    const filtered = wines.filter((wine) => {
      const matchesSearch =
        q === '' ||
        wine.name.toLowerCase().includes(q) ||
        wine.winery.toLowerCase().includes(q) ||
        wine.region.toLowerCase().includes(q)
      const matchesType = typeFilter === 'all' || wine.type === typeFilter
      const matchesCountry = countryFilter === 'all' || wine.country === countryFilter
      const matchesRegion = regionFilter === 'all' || wine.region === regionFilter
      const matchesGrape = grapeFilter === 'all' || wine.grapes.toLowerCase().includes(grapeFilter.toLowerCase())
      const matchesScore =
        minScoreFilter === 'all' ? true
          : minScoreFilter === 'lt70' ? wine.avgScore < 70
            : minScoreFilter === '70_80' ? wine.avgScore >= 70 && wine.avgScore < 80
              : minScoreFilter === '80_90' ? wine.avgScore >= 80 && wine.avgScore < 90
                : wine.avgScore >= 90

      return matchesSearch && matchesType && matchesCountry && matchesRegion && matchesGrape && matchesScore
    })

    return filtered.sort((a, b) => {
      if (sortKey === 'price_asc') return a.priceFrom - b.priceFrom
      if (sortKey === 'price_desc') return b.priceFrom - a.priceFrom
      if (sortKey === 'latest') return b.vintage - a.vintage
      if (sortKey === 'tasting_date_desc') return (b.tastingDateSortTs ?? 0) - (a.tastingDateSortTs ?? 0)
      if (sortKey === 'tasting_date_asc') return (a.tastingDateSortTs ?? 0) - (b.tastingDateSortTs ?? 0)
      return b.avgScore - a.avgScore
    })
  }, [search, typeFilter, countryFilter, regionFilter, grapeFilter, minScoreFilter, sortKey, wines])

  const selectedWine = useMemo(() => {
    if (selectedWineId == null) {
      return null
    }

    const baseWine = wines.find((wine) => wine.id === selectedWineId) ?? null
    if (!baseWine) {
      return null
    }

    const details = wineDetailsById[selectedWineId]
    return details ? mergeWineCardWithDetails(baseWine, details, locale) : baseWine
  }, [selectedWineId, wines, wineDetailsById, locale])
  const doMapPoints = useMemo<DoMapPoint[]>(
    () => doOptions
      .filter((item) => item.map_data && Number.isFinite(item.map_data.lat) && Number.isFinite(item.map_data.lng))
      .map((item) => ({
        id: item.id,
        name: item.name,
        countryCode: item.country,
        region: item.region,
        country: countryCodeToLabel(item.country),
        lat: Number(item.map_data?.lat),
        lng: Number(item.map_data?.lng),
        zoom: typeof item.map_data?.zoom === 'number' ? item.map_data.zoom : undefined,
        doLogoImage: doLogoPathFromImageName(item.do_logo),
        regionLogoImage: regionLogoPathFromImageName(item.region_logo),
      }))
      .sort((a, b) => {
        const byCountry = a.country.localeCompare(b.country)
        if (byCountry !== 0) return byCountry
        const byRegion = a.region.localeCompare(b.region)
        if (byRegion !== 0) return byRegion
        return a.name.localeCompare(b.name)
      }),
    [doOptions, locale],
  )
  const doMapCountryOptions = useMemo(
    () => [
      DO_MAP_ALL_WORLD_VALUE,
      ...Array.from(new Set(doMapPoints.map((point) => point.country))).sort((a, b) => {
        if (a === 'Spain') return -1
        if (b === 'Spain') return 1
        return a.localeCompare(b)
      }),
    ],
    [doMapPoints],
  )
  const doMapVisiblePoints = useMemo(
    () => doMapCountryFilter === DO_MAP_ALL_WORLD_VALUE
      ? doMapPoints
      : doMapPoints.filter((point) => point.country === doMapCountryFilter),
    [doMapCountryFilter, doMapPoints],
  )
  const selectedMapDo = useMemo(
    () => doMapVisiblePoints.find((point) => point.id === selectedMapDoId) ?? null,
    [doMapVisiblePoints, selectedMapDoId],
  )

  useEffect(() => {
    if (!isDoMapPage) {
      return
    }

    if (doMapCountryOptions.length === 0) {
      setDoMapCountryFilter('')
      return
    }

    if (!doMapCountryOptions.includes(doMapCountryFilter)) {
      setDoMapCountryFilter(DO_MAP_ALL_WORLD_VALUE)
    }
  }, [doMapCountryFilter, doMapCountryOptions, isDoMapPage])

  useEffect(() => {
    if (!isDoMapPage) {
      return
    }
    setSelectedMapDoId(null)
  }, [doMapCountryFilter, isDoMapPage])

  useEffect(() => {
    if (!isDoMapMobile) {
      setIsDoMapMobileDoPickerOpen(false)
    }
  }, [isDoMapMobile])

  useEffect(() => {
    if (!isDoMapPage) {
      return
    }

    const canFullscreen = Boolean(
      doMapCanvasRef.current
      && typeof doMapCanvasRef.current.requestFullscreen === 'function',
    )
    setCanDoMapFullscreen(canFullscreen)

    const onFullscreenChange = () => {
      const isActive = document.fullscreenElement === doMapCanvasRef.current
      setIsDoMapFullscreen(isActive)
      window.setTimeout(() => {
        doMapInstanceRef.current?.invalidateSize({ pan: false, animate: false })
      }, 100)
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [isDoMapPage])

  useEffect(() => {
    if (!isDoMapPage) {
      return
    }

    if (doMapVisiblePoints.length === 0) {
      setSelectedMapDoId(null)
      return
    }

    if (null !== selectedMapDoId && !doMapVisiblePoints.some((point) => point.id === selectedMapDoId)) {
      setSelectedMapDoId(null)
    }
  }, [doMapVisiblePoints, isDoMapPage, selectedMapDoId])

  useEffect(() => {
    if (!isDoMapPage) {
      return
    }

    if (typeof document === 'undefined') {
      return
    }

    if (document.getElementById(LEAFLET_CSS_LINK_ID)) {
      return
    }

    const link = document.createElement('link')
    link.id = LEAFLET_CSS_LINK_ID
    link.rel = 'stylesheet'
    link.href = LEAFLET_CSS_URL
    document.head.appendChild(link)
  }, [isDoMapPage])

  useEffect(() => {
    if (!isDoMapPage || !doMapContainerRef.current || doMapVisiblePoints.length === 0) {
      return
    }

    doMapMarkersRef.current = []
    if (doMapInstanceRef.current) {
      doMapInstanceRef.current.remove()
      doMapInstanceRef.current = null
    }

    let isDisposed = false
    let map: {
      setView: (center: [number, number], zoom: number) => unknown
      flyTo: (center: [number, number], zoom?: number, options?: Record<string, unknown>) => unknown
      fitBounds: (bounds: unknown, options?: Record<string, unknown>) => unknown
      on: (event: string, handler: () => void) => unknown
      getZoom: () => number
      invalidateSize: (options?: Record<string, unknown>) => void
      remove: () => void
    } | null = null
    let resizeObserver: ResizeObserver | null = null
    const initLeaflet = async () => {
      const leaflet = await loadLeafletGlobal()
      if (isDisposed || !doMapContainerRef.current) {
        return
      }

      const leafletMap = leaflet.map(doMapContainerRef.current, {
        zoomControl: false,
        minZoom: 2,
        maxZoom: 12,
        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
        zoomSnap: 1,
        zoomDelta: 1,
      })
      map = leafletMap

      if (doMapCountryFilter === DO_MAP_ALL_WORLD_VALUE) {
        leafletMap.setView([20, 0], 3.1)
      } else {
        leafletMap.fitBounds(doMapVisiblePoints.map((point) => [point.lat, point.lng] as [number, number]), { padding: [36, 36], maxZoom: 7, animate: false })
      }

      setDoMapZoomLevel(leafletMap.getZoom())
      leafletMap.on('zoomend', () => {
        setDoMapZoomLevel(leafletMap.getZoom())
      })

      const tileLanguage = locale === 'ca' ? 'ca' : 'es'
      const tileUrl = isDoMapMobile
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : `https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?lang=${tileLanguage}`
      leaflet.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        updateWhenZooming: false,
        updateWhenIdle: true,
      }).addTo(leafletMap)

      resizeObserver = new ResizeObserver(() => {
        leafletMap.invalidateSize({ pan: false, animate: false })
      })
      resizeObserver.observe(doMapContainerRef.current)
      window.setTimeout(() => {
        leafletMap.invalidateSize({ pan: false, animate: false })
      }, 100)

      const markers = doMapVisiblePoints.map((point) => {
        const encodedLogoUrl = point.doLogoImage ? encodeURI(resolveApiAssetUrl(point.doLogoImage)) : null
        const icon = leaflet.divIcon({
          className: 'do-map-logo-icon',
          iconSize: [26, 26],
          iconAnchor: [13, 13],
          html: encodedLogoUrl
            ? `<span class="do-map-logo-marker"><img src="${encodedLogoUrl}" alt="" onerror="this.style.display='none';this.parentNode.classList.add('is-fallback')" /></span>`
            : '<span class="do-map-logo-marker is-fallback"></span>',
        })

        const marker = leaflet.marker([point.lat, point.lng], { icon }) as {
          addTo: (map: unknown) => unknown
          on: (event: string, handler: () => void) => unknown
          bindTooltip: (content: string, options?: Record<string, unknown>) => unknown
          openTooltip: () => unknown
          closeTooltip: () => unknown
          getElement: () => HTMLElement | null
          setZIndexOffset: (offset: number) => unknown
        }
        marker.addTo(leafletMap)
        marker.bindTooltip(point.name, { direction: 'top', offset: [0, -10] })
        marker.on('click', () => setSelectedMapDoId(point.id))

        return {
          id: point.id,
          marker,
          setSelected: (selected: boolean, zoomBoost: boolean) => {
            const el = marker.getElement()
            const bubble = el?.querySelector('.do-map-logo-marker')
            if (!(bubble instanceof HTMLElement)) {
              return
            }
            marker.setZIndexOffset(selected ? 1000 : 0)
            bubble.classList.toggle('is-selected', selected)
            bubble.classList.toggle('is-zoomed', zoomBoost)
          },
        }
      })

      doMapInstanceRef.current = leafletMap
      doMapMarkersRef.current = markers
      setDoMapInitError(false)
    }

    void initLeaflet().catch(() => {
      setDoMapInitError(true)
    })

    return () => {
      isDisposed = true
      doMapMarkersRef.current = []
      if (map) {
        map.remove()
      }
      resizeObserver?.disconnect()
      doMapInstanceRef.current = null
    }
  }, [doMapCountryFilter, doMapVisiblePoints, isDoMapMobile, isDoMapPage, locale])

  useEffect(() => {
    const map = doMapInstanceRef.current
    if (!isDoMapPage || !map) {
      return
    }

    const zoomBoost = map.getZoom() >= 6
    doMapMarkersRef.current.forEach(({ id, marker, setSelected }) => {
      const isSelected = selectedMapDo?.id === id
      setSelected(isSelected, zoomBoost)
      if (isSelected) {
        marker.openTooltip()
      } else {
        marker.closeTooltip()
      }
    })

    if (doMapCountryFilter === DO_MAP_ALL_WORLD_VALUE && !selectedMapDo) {
      map.setView([20, 0], 3.1)
      return
    }

    if (doMapCountryFilter !== DO_MAP_ALL_WORLD_VALUE && !selectedMapDo && doMapVisiblePoints.length > 0) {
      const countryBounds = doMapVisiblePoints.map((point) => [point.lat, point.lng] as [number, number])
      map.fitBounds(countryBounds, { padding: [36, 36], maxZoom: 7, animate: true, duration: 0.5 })
      return
    }

    if (selectedMapDo) {
      map.flyTo([selectedMapDo.lat, selectedMapDo.lng], selectedMapDo.zoom ?? Math.max(map.getZoom(), 6), { duration: 0.6 })
    }
  }, [doMapCountryFilter, doMapVisiblePoints, isDoMapPage, selectedMapDo])

  useEffect(() => {
    const map = doMapInstanceRef.current
    if (!isDoMapPage || !map) {
      return
    }

    const zoomBoost = doMapZoomLevel >= 6
    doMapMarkersRef.current.forEach(({ id, setSelected }) => {
      setSelected(selectedMapDo?.id === id, zoomBoost)
    })
  }, [doMapZoomLevel, isDoMapPage, selectedMapDo])

  useEffect(() => {
    if (selectedWine && activeModalImageIndex >= selectedWine.gallery.length) {
      setActiveModalImageIndex(0)
    }
  }, [selectedWine, activeModalImageIndex])

  useEffect(() => {
    if (!selectedWine) {
      setDoLogoPreview(null)
    }
  }, [selectedWine])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (countryFilter !== 'all') params.set('country', countryFilter)
    if (regionFilter !== 'all') params.set('region', regionFilter)
    if (grapeFilter !== 'all') params.set('grape', grapeFilter)
    if (minScoreFilter !== 'all') params.set('minScore', minScoreFilter)
    if (sortKey !== DEFAULT_SORT) params.set('sort', sortKey)
    if (selectedWineId != null) params.set('wine', String(selectedWineId))

    const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    const current = `${window.location.pathname}${window.location.search}`
    if (next !== current) {
      window.history.replaceState(null, '', next)
    }
  }, [search, typeFilter, countryFilter, regionFilter, grapeFilter, minScoreFilter, sortKey, selectedWineId])

  const euro = useMemo(
    () => new Intl.NumberFormat(locale === 'ca' ? 'ca-ES' : 'es-ES', { style: 'currency', currency: 'EUR' }),
    [locale],
  )

  const resetFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setCountryFilter('all')
    setRegionFilter('all')
    setDoSearchText('')
    setIsDoDropdownOpen(false)
    setGrapeFilter('all')
    setMinScoreFilter('all')
    setSortKey(DEFAULT_SORT)
  }

  const sortControl = (
    <label>
      <span>{t.icons.sort} {t.filters.sort}</span>
      <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
        <option value="score_desc">{t.sort.score_desc}</option>
        <option value="price_asc">{t.sort.price_asc}</option>
        <option value="price_desc">{t.sort.price_desc}</option>
        <option value="latest">{t.sort.latest}</option>
        <option value="tasting_date_desc">{t.sort.tasting_date_desc}</option>
        <option value="tasting_date_asc">{t.sort.tasting_date_asc}</option>
      </select>
    </label>
  )

  const activeMobileFilters = useMemo(() => {
    const items: Array<{ key: string; label: string; onRemove: () => void }> = []
    const searchValue = search.trim()

    if (searchValue) {
      items.push({
        key: 'search',
        label: `${t.icons.search} ${searchValue}`,
        onRemove: () => setSearch(''),
      })
    }
    if (typeFilter !== 'all') {
      items.push({
        key: 'type',
        label: `${t.icons.type} ${t.wineType[typeFilter]}`,
        onRemove: () => setTypeFilter('all'),
      })
    }
    if (countryFilter !== 'all') {
      items.push({
        key: 'country',
        label: `${t.icons.country} ${countryFilter}`,
        onRemove: () => setCountryFilter('all'),
      })
    }
    if (regionFilter !== 'all') {
      items.push({
        key: 'region',
        label: `${t.icons.region} ${regionFilter}`,
        onRemove: () => setRegionFilter('all'),
      })
    }
    if (grapeFilter !== 'all') {
      items.push({
        key: 'grape',
        label: `${t.icons.grape} ${grapeFilter}`,
        onRemove: () => setGrapeFilter('all'),
      })
    }
    if (minScoreFilter !== 'all') {
      const scoreLabel =
        minScoreFilter === 'lt70' ? '<70'
          : minScoreFilter === '70_80' ? '70-80'
            : minScoreFilter === '80_90' ? '80-90'
              : '90+'
      items.push({
        key: 'score',
        label: `${t.icons.minScore} ${scoreLabel}`,
        onRemove: () => setMinScoreFilter('all'),
      })
    }
    return items
  }, [search, typeFilter, countryFilter, regionFilter, grapeFilter, minScoreFilter, t])

  const filterControlsCore = (
    <>
      <div className="filters-header">
        <p className="eyebrow">{t.icons.filters} {t.filters.title}</p>
      </div>

      <label>
        <span>{t.icons.search} {t.filters.search}</span>
        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.searchPlaceholder} />
      </label>

      <label>
        <span>{t.icons.type} {t.filters.type}</span>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as 'all' | WineType)}>
          <option value="all">{t.filters.allTypes}</option>
          <option value="red">{t.wineType.red}</option>
          <option value="white">{t.wineType.white}</option>
          <option value="rose">{t.wineType.rose}</option>
          <option value="sparkling">{t.wineType.sparkling}</option>
        </select>
      </label>

      <label>
        <span>{t.icons.country} {t.filters.country}</span>
        <select
          value={countryFilter}
          onChange={(event) => {
            setCountryFilter(event.target.value)
            setDoSearchText('')
            setIsDoDropdownOpen(false)
          }}
        >
          {countries.map((country) => (
            <option key={country} value={country}>
              {country === 'all' ? t.filters.allCountries : country}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>{t.icons.region} {t.filters.region}</span>
        <div className={`do-combobox${countryFilter === 'all' ? ' is-disabled' : ''}`}>
          <button
            type="button"
            className="do-combobox-trigger"
            aria-expanded={isDoDropdownOpen}
            aria-haspopup="listbox"
            onClick={() => {
              if (countryFilter === 'all') {
                return
              }
              setIsDoDropdownOpen((current) => !current)
            }}
            disabled={countryFilter === 'all'}
          >
            <span className="do-combobox-trigger-main">
              {selectedDoOption ? (
                <>
                  {selectedDoCommunityFlagPath ? <img src={selectedDoCommunityFlagPath} alt="" className="do-combobox-flag" aria-hidden="true" /> : null}
                  {selectedDoOption.doLogoImage ? <img src={selectedDoOption.doLogoImage} alt="" className="do-combobox-flag" aria-hidden="true" /> : null}
                  <span>{selectedDoOption.countryCode === 'spain' ? selectedDoOption.name : `${selectedDoOption.region} · ${selectedDoOption.name}`}</span>
                </>
              ) : (
                <span>{countryFilter === 'all' ? t.filters.allCountries : t.filters.allRegions}</span>
              )}
            </span>
            <span className="do-combobox-caret" aria-hidden="true">▾</span>
          </button>

          {isDoDropdownOpen && countryFilter !== 'all' ? (
            <div className="do-combobox-menu" role="listbox" aria-label={t.filters.region}>
              <input
                type="search"
                className="do-combobox-search"
                value={doSearchText}
                onChange={(event) => setDoSearchText(event.target.value)}
                placeholder={locale === 'ca' ? 'Filtrar D.O.' : 'Filtrar D.O.'}
              />
              <button
                type="button"
                role="option"
                aria-selected={regionFilter === 'all'}
                className={`do-combobox-option${regionFilter === 'all' ? ' is-selected' : ''}`}
                onClick={() => {
                  setRegionFilter('all')
                  setIsDoDropdownOpen(false)
                }}
              >
                <span>{t.filters.allRegions}</span>
              </button>
              {filteredDoOptions.map((item) => {
                const communityFlag = item.countryCode === 'spain' ? item.regionLogoImage : null
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={regionFilter === item.name}
                    className={`do-combobox-option${regionFilter === item.name ? ' is-selected' : ''}`}
                    onClick={() => {
                      setRegionFilter(item.name)
                      setIsDoDropdownOpen(false)
                    }}
                  >
                    {communityFlag ? <img src={communityFlag} alt="" className="do-combobox-flag" aria-hidden="true" /> : null}
                    {item.doLogoImage ? <img src={item.doLogoImage} alt="" className="do-combobox-flag" aria-hidden="true" /> : null}
                    <span>{item.countryCode === 'spain' ? item.name : `${item.region} · ${item.name}`}</span>
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
      </label>

      <label>
        <span>{t.icons.grape} {t.filters.grape}</span>
        <select value={grapeFilter} onChange={(event) => setGrapeFilter(event.target.value)}>
          {grapeOptions.map((grape) => (
            <option key={grape} value={grape}>
              {grape === 'all' ? (locale === 'ca' ? 'Totes les varietats' : 'Todas las variedades') : grape}
            </option>
          ))}
        </select>
      </label>

      <div className="filter-score-group" role="group" aria-label={`${t.icons.minScore} ${t.filters.minScore}`}>
        <span>{t.icons.minScore} {t.filters.minScore}</span>
        <button
          type="button"
          className={`score-filter-reset${minScoreFilter === 'all' ? ' active' : ''}`}
          onClick={() => setMinScoreFilter('all')}
          aria-pressed={minScoreFilter === 'all'}
        >
          {t.filters.anyScore}
        </button>
        <div className="filter-score-medals">
          {[
            { key: 'lt70', label: '<70', tone: 'base', icon: null },
            { key: '70_80', label: '70-80', tone: 'bronze', icon: '🥉' },
            { key: '80_90', label: '80-90', tone: 'silver', icon: '🥈' },
            { key: 'gte90', label: '90+', tone: 'gold', icon: '🥇' },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              className={`score-filter-medal score-filter-medal-range ${option.tone}${minScoreFilter === option.key ? ' active' : ''}`}
              onClick={() => setMinScoreFilter(option.key as ScoreFilterBucket)}
              aria-pressed={minScoreFilter === option.key}
            >
              {option.icon ? <span className="score-filter-medal-icon" aria-hidden="true">{option.icon}</span> : null}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

    </>
  )

  const filterControls = (
    <>
      {filterControlsCore}
      {sortControl}
      <button type="button" className="clear-filters" onClick={resetFilters}>
        {t.filters.clear}
      </button>
    </>
  )
  const selectedMapCountryFlag = doMapCountryFilter === DO_MAP_ALL_WORLD_VALUE ? null : countryFlagPath(doMapCountryFilter)
  const selectedMapCountryLabel = doMapCountryFilter === DO_MAP_ALL_WORLD_VALUE
    ? t.doMap.allWorld
    : localizedCountryName(doMapCountryFilter, locale)
  const selectedMapCountryCompactLabel = useMemo(() => {
    if (doMapCountryFilter === DO_MAP_ALL_WORLD_VALUE) {
      return locale === 'ca' ? 'Món' : 'Mundo'
    }
    if (doMapCountryFilter === 'United States') {
      return 'USA'
    }
    if (doMapCountryFilter === 'South Africa') {
      return 'SA'
    }
    return localizedCountryName(doMapCountryFilter, locale)
  }, [doMapCountryFilter, locale])
  const toggleDoMapFullscreen = () => {
    if (!doMapCanvasRef.current) {
      return
    }

    if (document.fullscreenElement === doMapCanvasRef.current) {
      void document.exitFullscreen()
      return
    }

    void doMapCanvasRef.current.requestFullscreen()
  }
  const desktopNav = (
    <nav className="topbar-nav" aria-label={t.topbar.navigation}>
      <a className={`topbar-nav-link${isCatalogPage ? ' active' : ''}`} href="/">{t.topbar.winesCatalog}</a>
      <a className={`topbar-nav-link${isDoMapPage ? ' active' : ''}`} href="/do-map">{t.topbar.doMap}</a>
      <a className="topbar-nav-link" href="/#about">{t.topbar.whoWeAre}</a>
      <a
        className="topbar-nav-link topbar-nav-link-admin"
        href={adminHref}
        onClick={() => {
          window.localStorage.setItem('wine-app-theme-mode', theme)
        }}
      >
        {t.topbar.backoffice}
      </a>
    </nav>
  )

  if (isDoMapPage) {
    return (
      <main className="public-shell do-map-shell">
        <div className="public-background" aria-hidden="true" />

        <header className={`public-topbar${isMobileMenuOpen ? ' mobile-menu-open' : ''}`}>
          <div className="brand-block">
            <div className="brand-copy">
              <img src={logoSrc} className="brand-wordmark" alt="Vins Tat & Rosset" />
              <p>{t.appName}</p>
            </div>
          </div>
          {desktopNav}

          <div className="topbar-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
              aria-label={isDark ? t.topbar.light : t.topbar.dark}
            >
              <span aria-hidden="true">{isDark ? '☾' : '☀'}</span>
              <span>{isDark ? t.topbar.dark : t.topbar.light}</span>
            </button>

            <label className="select-wrap">
              <span className="sr-only">{t.topbar.language}</span>
              <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={t.topbar.language}>
                <option value="ca">CA</option>
                <option value="es">ES</option>
              </select>
            </label>

            <button
              type="button"
              className={`mobile-header-icon-button${isMobileMenuOpen ? ' active' : ''}`}
              aria-label={t.topbar.menu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            >
              <span aria-hidden="true">☰</span>
            </button>
          </div>

          <nav id="mobile-nav-menu" className={`mobile-nav-menu${isMobileMenuOpen ? ' open' : ''}`} aria-label={t.topbar.navigation}>
            <div className="mobile-nav-menu-head">
              <span>{t.topbar.navigation}</span>
              <button type="button" className="mobile-nav-menu-close" onClick={() => setIsMobileMenuOpen(false)} aria-label={t.modal.close}>
                <span aria-hidden="true">✕</span>
              </button>
            </div>
            <a href="/" onClick={() => setIsMobileMenuOpen(false)}>{t.topbar.winesCatalog}</a>
            <a href="/do-map" onClick={() => setIsMobileMenuOpen(false)}>{t.topbar.doMap}</a>
            <a href="/#about" onClick={() => setIsMobileMenuOpen(false)}>{t.topbar.whoWeAre}</a>
            <a
              href={adminHref}
              onClick={() => {
                window.localStorage.setItem('wine-app-theme-mode', theme)
                setIsMobileMenuOpen(false)
              }}
            >
              {t.topbar.backoffice}
            </a>
          </nav>
        </header>

        {isMobileMenuOpen ? (
          <button
            type="button"
            className="mobile-nav-backdrop"
            aria-label={t.topbar.closeFilters}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        ) : null}

        <section className="hero-panel do-map-hero">
          <div className="do-map-hero-main">
            {t.doMap.eyebrow.trim() !== '' ? (
              <p className="eyebrow">{t.doMap.eyebrow}</p>
            ) : null}
            <div className="do-map-hero-title-row">
              <h1>{t.doMap.title}</h1>
              <div className="do-map-country-filter-bar" aria-label={t.doMap.filterCountry}>
                {!isDoMapMobile ? (
                  <span>{t.icons.country} {t.doMap.filterCountry}</span>
                ) : null}
                <div className="do-map-country-select">
                  <button
                    type="button"
                    className="do-map-country-button"
                    aria-haspopup="listbox"
                    aria-expanded={isDoMapCountryMenuOpen}
                    onClick={() => setIsDoMapCountryMenuOpen((open) => !open)}
                  >
                    {isDoMapMobile ? <span className="do-map-control-icon" aria-hidden="true">🌍</span> : null}
                    {selectedMapCountryFlag ? <img src={selectedMapCountryFlag} alt="" className="do-map-country-flag" aria-hidden="true" /> : null}
                    <strong>{isDoMapMobile ? selectedMapCountryCompactLabel : selectedMapCountryLabel}</strong>
                    <span className="do-map-country-caret" aria-hidden="true">▾</span>
                  </button>

                  {isDoMapCountryMenuOpen ? (
                    <div className="do-map-country-menu" role="listbox" aria-label={t.doMap.filterCountry}>
                  {doMapCountryOptions.map((country) => {
                    if (country === DO_MAP_ALL_WORLD_VALUE) {
                      return (
                        <button
                          key={`map-country-option-${country}`}
                          type="button"
                          role="option"
                          aria-selected={doMapCountryFilter === country}
                          className={`do-map-country-option${doMapCountryFilter === country ? ' is-selected' : ''}`}
                          onClick={() => {
                            setDoMapCountryFilter(country)
                            setIsDoMapCountryMenuOpen(false)
                            setSelectedMapDoId(null)
                          }}
                        >
                          <span>{t.doMap.allWorld}</span>
                        </button>
                      )
                    }

                    const flag = countryFlagPath(country)
                    return (
                      <button
                            key={`map-country-option-${country}`}
                            type="button"
                            role="option"
                            aria-selected={doMapCountryFilter === country}
                            className={`do-map-country-option${doMapCountryFilter === country ? ' is-selected' : ''}`}
                            onClick={() => {
                        setDoMapCountryFilter(country)
                        setIsDoMapCountryMenuOpen(false)
                      }}
                          >
                            {flag ? <img src={flag} alt="" className="do-map-country-flag" aria-hidden="true" /> : null}
                            <span>{localizedCountryName(country, locale)}</span>
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </div>

                {isDoMapMobile ? (
                  <button
                    type="button"
                    className="do-map-mobile-picker-trigger"
                    onClick={() => setIsDoMapMobileDoPickerOpen(true)}
                    disabled={doMapVisiblePoints.length === 0}
                  >
                    <span>DO</span>
                  </button>
                ) : null}
              </div>
            </div>
            {t.doMap.subtitle.trim() !== '' ? (
              <p className="hero-subtitle">{t.doMap.subtitle}</p>
            ) : null}
          </div>
        </section>

        <section className="do-map-layout">
          <div className="cards-panel do-map-canvas-card">
            <div ref={doMapCanvasRef} className="do-map-canvas" role="img" aria-label={t.doMap.worldMapLabel}>
              <div ref={doMapContainerRef} className="do-map-leaflet" />
              {isDoMapMobile && canDoMapFullscreen ? (
                <button
                  type="button"
                  className="do-map-fullscreen-button"
                  onClick={toggleDoMapFullscreen}
                  aria-label={isDoMapFullscreen ? t.doMap.fullscreenClose : t.doMap.fullscreenOpen}
                  title={isDoMapFullscreen ? t.doMap.fullscreenClose : t.doMap.fullscreenOpen}
                >
                  {isDoMapFullscreen ? '✕' : '⛶'}
                </button>
              ) : null}
              {doMapInitError ? (
                <p className="do-map-error">
                  {locale === 'ca'
                    ? 'No s ha pogut carregar el mapa. Recarrega la pàgina.'
                    : 'No se ha podido cargar el mapa. Recarga la página.'}
                </p>
              ) : null}
            </div>
          </div>

          <aside className={`cards-panel do-map-detail-card${isDoMapMobile ? ' is-mobile' : ''}`}>
            {selectedMapDo ? (
              <>
                <h2>{selectedMapDo.name}</h2>
                <p>{selectedMapDo.region} · {localizedCountryName(selectedMapDo.country, locale)}</p>
                <div className="do-map-detail-logos">
                  {selectedMapDo.regionLogoImage ? (
                    <img src={selectedMapDo.regionLogoImage} alt={selectedMapDo.region} loading="lazy" />
                  ) : null}
                  {selectedMapDo.doLogoImage ? (
                    <img src={selectedMapDo.doLogoImage} alt={`${selectedMapDo.name} DO`} loading="lazy" />
                  ) : null}
                </div>
              </>
            ) : null}

            {!isDoMapMobile ? (
              <>
                <h3>{t.doMap.listTitle}</h3>
                <div className="do-map-list">
                  {doMapVisiblePoints.map((point) => (
                    <button
                      key={`map-list-${point.id}`}
                      type="button"
                      className={`do-map-list-item${selectedMapDo?.id === point.id ? ' active' : ''}`}
                      onClick={() => setSelectedMapDoId(point.id)}
                    >
                      <span className="do-map-list-item-row">
                        {countryFlagPath(point.country) ? (
                          <img
                            src={countryFlagPath(point.country) ?? ''}
                            alt=""
                            className="do-map-list-item-flag"
                            aria-hidden="true"
                          />
                        ) : null}
                        <span className="do-map-list-item-text">
                          <strong>{point.name}</strong>
                          <span>{point.region} · {localizedCountryName(point.country, locale)}</span>
                        </span>
                      </span>
                    </button>
                  ))}
                  {doMapVisiblePoints.length === 0 ? (
                  <p className="do-map-empty">
                    {locale === 'ca'
                      ? 'No hi ha DO amb coordenades disponibles.'
                      : 'No hay DO con coordenadas disponibles.'}
                  </p>
                  ) : null}
                </div>
              </>
            ) : null}
          </aside>
        </section>

        {isDoMapMobile && isDoMapMobileDoPickerOpen ? (
          <>
            <button
              type="button"
              className="do-map-mobile-picker-backdrop"
              aria-label={t.doMap.closeSelector}
              onClick={() => setIsDoMapMobileDoPickerOpen(false)}
            />
            <section className="do-map-mobile-picker" role="dialog" aria-modal="true" aria-label={t.doMap.chooseDo}>
              <div className="do-map-mobile-picker-head">
                <strong>{t.doMap.chooseDoPlaceholder}</strong>
                <button type="button" onClick={() => setIsDoMapMobileDoPickerOpen(false)} aria-label={t.doMap.closeSelector}>
                  ✕
                </button>
              </div>
              <div className="do-map-mobile-picker-list">
                {doMapVisiblePoints.map((point) => (
                  <button
                    key={`map-mobile-list-${point.id}`}
                    type="button"
                    className={`do-map-list-item${selectedMapDo?.id === point.id ? ' active' : ''}`}
                    onClick={() => {
                      setSelectedMapDoId(point.id)
                      setIsDoMapMobileDoPickerOpen(false)
                    }}
                  >
                    <span className="do-map-list-item-row">
                      {countryFlagPath(point.country) ? (
                        <img
                          src={countryFlagPath(point.country) ?? ''}
                          alt=""
                          className="do-map-list-item-flag"
                          aria-hidden="true"
                        />
                      ) : null}
                      <span className="do-map-list-item-text">
                        <strong>{point.name}</strong>
                        <span>{point.region} · {localizedCountryName(point.country, locale)}</span>
                      </span>
                    </span>
                  </button>
                ))}
                {doMapVisiblePoints.length === 0 ? (
                  <p className="do-map-empty">{t.doMap.chooseCountryFirst}</p>
                ) : null}
              </div>
            </section>
          </>
        ) : null}
      </main>
    )
  }

  return (
    <main className="public-shell">
      <div className="public-background" aria-hidden="true" />

      <header className={`public-topbar${isMobileMenuOpen ? ' mobile-menu-open' : ''}`}>
        <div className="brand-block">
          <div className="brand-copy">
            <img src={logoSrc} className="brand-wordmark" alt="Vins Tat & Rosset" />
            <p>{t.appName}</p>
          </div>
        </div>
        {desktopNav}

        <div className="topbar-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
            aria-label={isDark ? t.topbar.light : t.topbar.dark}
          >
            <span aria-hidden="true">{isDark ? '☾' : '☀'}</span>
            <span>{isDark ? t.topbar.dark : t.topbar.light}</span>
          </button>

          <label className="select-wrap">
            <span className="sr-only">{t.topbar.language}</span>
            <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={t.topbar.language}>
              <option value="ca">CA</option>
              <option value="es">ES</option>
            </select>
          </label>

          <button
            type="button"
            className={`mobile-header-icon-button${isMobileMenuOpen ? ' active' : ''}`}
            aria-label={t.topbar.menu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            <span aria-hidden="true">☰</span>
          </button>
        </div>

        <nav id="mobile-nav-menu" className={`mobile-nav-menu${isMobileMenuOpen ? ' open' : ''}`} aria-label={t.topbar.navigation}>
          <div className="mobile-nav-menu-head">
            <span>{t.topbar.navigation}</span>
            <button type="button" className="mobile-nav-menu-close" onClick={() => setIsMobileMenuOpen(false)} aria-label={t.modal.close}>
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          <a href="/" onClick={() => setIsMobileMenuOpen(false)}>{t.topbar.winesCatalog}</a>
          <a href="/do-map" onClick={() => setIsMobileMenuOpen(false)}>{t.topbar.doMap}</a>
          <a href="/#about" onClick={() => setIsMobileMenuOpen(false)}>{t.topbar.whoWeAre}</a>
          <a
            href={adminHref}
            onClick={() => {
              window.localStorage.setItem('wine-app-theme-mode', theme)
              setIsMobileMenuOpen(false)
            }}
          >
            {t.topbar.backoffice}
          </a>
        </nav>
      </header>

      {isMobileMenuOpen ? (
        <button
          type="button"
          className="mobile-nav-backdrop"
          aria-label={t.topbar.closeFilters}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      ) : null}

      <section className="hero-panel" id="catalog">
        <div>
          <p className="eyebrow">ELS NOSTRES VINS</p>
          <h1>Catàleg de vins</h1>
        </div>
        <section className="mobile-filter-dropdown" aria-label={t.filters.title}>
        <div className="mobile-filter-bar">
          <button
            type="button"
            className={`mobile-view-trigger${mobileViewMode === 'card' ? ' active' : ''}`}
            onClick={() => setMobileViewMode((mode) => (mode === 'card' ? 'list' : 'card'))}
            aria-label={mobileViewMode === 'card'
              ? (locale === 'ca' ? 'Canvia a vista de llista' : 'Cambiar a vista de lista')
              : (locale === 'ca' ? 'Canvia a vista de targetes' : 'Cambiar a vista de tarjetas')}
            title={mobileViewMode === 'card'
              ? (locale === 'ca' ? 'Vista llista' : 'Vista lista')
              : (locale === 'ca' ? 'Vista targetes' : 'Vista tarjetas')}
          >
            <span aria-hidden="true">◫</span>
          </button>

          <button
            type="button"
            className={`mobile-filter-trigger${isMobileFiltersOpen ? ' active' : ''}`}
            onClick={() => {
              setIsMobileSortOpen(false)
              setIsMobileFiltersOpen((open) => !open)
            }}
            aria-expanded={isMobileFiltersOpen}
            aria-controls="mobile-filters-panel"
          >
            <span className="mobile-filter-trigger-label">
              <span aria-hidden="true">{t.icons.filters}</span>
              <span className="mobile-filter-trigger-text">{t.filters.title}</span>
            </span>
            <span className="mobile-filter-trigger-meta">
              {filteredWines.length}
            </span>
          </button>

          <button
            type="button"
            className={`mobile-sort-trigger${isMobileSortOpen ? ' active' : ''}${sortKey !== DEFAULT_SORT ? ' has-value' : ''}`}
            onClick={() => {
              setIsMobileFiltersOpen(false)
              setIsMobileSortOpen((open) => !open)
            }}
            aria-expanded={isMobileSortOpen}
            aria-controls="mobile-sort-panel"
            aria-label={`${t.filters.sort}: ${t.sort[sortKey]}`}
            title={`${t.filters.sort}: ${t.sort[sortKey]}`}
          >
            <span aria-hidden="true">{t.icons.sort}</span>
          </button>
        </div>

        {isMobileSortOpen ? (
          <button
            type="button"
            className="mobile-sort-backdrop"
            aria-label={t.modal.close}
            onClick={() => setIsMobileSortOpen(false)}
          />
        ) : null}

        {isMobileSortOpen ? (
          <div id="mobile-sort-panel" className="mobile-sort-panel" role="dialog" aria-label={t.filters.sort}>
            <div className="mobile-sort-panel-head">
              <span>{t.icons.sort} {t.filters.sort}</span>
              <button type="button" className="mobile-sort-close" onClick={() => setIsMobileSortOpen(false)} aria-label={t.modal.close}>
                <span aria-hidden="true">✕</span>
              </button>
            </div>
            <div className="mobile-sort-options" role="listbox" aria-label={t.filters.sort}>
              {(['score_desc', 'price_asc', 'price_desc', 'latest', 'tasting_date_desc', 'tasting_date_asc'] as SortKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`mobile-sort-option${sortKey === key ? ' active' : ''}`}
                  onClick={() => {
                    setSortKey(key)
                    setIsMobileSortOpen(false)
                  }}
                  role="option"
                  aria-selected={sortKey === key}
                >
                  <span>{t.sort[key]}</span>
                  {sortKey === key ? <span aria-hidden="true">✓</span> : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {!isMobileFiltersOpen && activeMobileFilters.length > 0 ? (
          <div className="mobile-filter-active-bar" aria-label="Active filters">
            <div className="mobile-filter-active-bar-head">
              <span className="mobile-filter-active-bar-title">
                {t.filters.title} {locale === 'ca' ? 'actius' : 'activos'}
              </span>
              <button type="button" className="mobile-filter-active-clear" onClick={resetFilters}>
                {t.filters.clear}
              </button>
            </div>
            <div className="mobile-filter-active-list">
              {activeMobileFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  className="mobile-filter-active-chip"
                  onClick={filter.onRemove}
                  title={filter.label}
                  aria-label={`${filter.label} · remove`}
                >
                  <span className="mobile-filter-active-chip-text">{filter.label}</span>
                  <span className="mobile-filter-active-chip-x" aria-hidden="true">✕</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {isMobileFiltersOpen ? (
          <button
            type="button"
            className="mobile-filters-backdrop"
            aria-label={t.topbar.closeFilters}
            onClick={() => setIsMobileFiltersOpen(false)}
          />
        ) : null}

        <div id="mobile-filters-panel" className={`mobile-filter-panel${isMobileFiltersOpen ? ' open' : ''}`}>
          <div className="mobile-filter-panel-header">
            <div>
              <p className="eyebrow">{t.icons.filters} {t.filters.title}</p>
              <p className="mobile-filter-panel-meta">{filteredWines.length} {t.topbar.resultCount}</p>
            </div>
            <button
              type="button"
              className="mobile-filter-panel-close"
              onClick={() => setIsMobileFiltersOpen(false)}
              aria-label={t.topbar.closeFilters}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          <div className="mobile-filter-panel-content">
            {filterControlsCore}
          </div>

          <div className="mobile-filter-panel-footer">
            <button type="button" className="mobile-filter-footer-clear" onClick={resetFilters}>
              {t.filters.clear}
            </button>
          </div>
        </div>
      </section>
      </section>

      <section className="catalog-layout">
        <aside className="filters-panel">
          {filterControls}
        </aside>

        <section className="cards-panel">
          <div className={`cards-grid mobile-layout-${mobileViewMode}`}>
            {filteredWines.map((wine) => {
              const isFeatured = wine.avgScore >= 90
              const scoreTier = wine.avgScore >= 90 ? 'gold' : wine.avgScore >= 80 ? 'silver' : wine.avgScore >= 70 ? 'bronze' : 'base'
              const countryFlagImage = countryFlagPath(wine.country)
              const communityFlagImage = wine.country === 'Spain' ? wine.regionLogoImage ?? null : null
              const communityName = wine.country === 'Spain' ? autonomousCommunityNameForRegion(wine.region) : null

              return (
                <article
                  key={wine.id}
                  className={`wine-card ${isFeatured ? 'featured' : ''} score-tier-${scoreTier} mobile-view-${mobileViewMode}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedWineId(wine.id)
                    setActiveModalImageIndex(0)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedWineId(wine.id)
                      setActiveModalImageIndex(0)
                    }
                  }}
                >
                    <div className="wine-card-media">
                    <img
                      src={resolvePublicWineImageForTheme(wine.image, isDark)}
                      alt={wine.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src = defaultPublicWineImageForTheme(isDark)
                      }}
                    />
                    <div className="wine-card-overlay" />
                      <div className="wine-card-badges">
                        {isFeatured ? <span className="gold-chip">{t.card.featured90}</span> : null}
                        {wine.rewardBadgeImage ? (
                          <span className="wine-card-award-corner-tag" aria-label={`${wine.reward?.name ?? 'Award'} ${wine.reward?.score ?? ''}`.trim()}>
                            <img src={wine.rewardBadgeImage} alt="" loading="lazy" />
                          </span>
                        ) : null}
                      </div>
                      {wine.country !== 'Spain' ? (
                        <span className="country-flag-badge wine-card-country-floating" aria-label={wine.country} title={wine.country}>
                          {countryFlagImage ? <img className="flag-badge-image" src={countryFlagImage} alt={localizedCountryName(wine.country, locale)} loading="lazy" /> : countryFlagEmoji(wine.country)}
                        </span>
                      ) : null}
                      <span className={`wine-card-score-floating wine-card-score-floating-${scoreTier}`} aria-label={`${t.card.avgScore} ${wine.avgScore.toFixed(1)}`}>
                        {wine.avgScore.toFixed(1)}
                      </span>
                    </div>

                  <div className="wine-card-body">
                    <div className="wine-card-head">
                      <div>
                        <h3>{wine.name}</h3>
                        <span className={`wine-type-pill wine-type-pill-${wine.type}`}>
                          <span className={`wine-type-pill-dot wine-type-pill-dot-${wine.type}`} aria-hidden="true">🍇</span>
                          <span>{t.wineType[wine.type]}</span>
                        </span>
                      </div>
                      <div className="score-award-stack">
                        <div className={`score-badge score-badge-${scoreTier}`} aria-label={`${t.card.avgScore} ${wine.avgScore.toFixed(1)}`}>
                          <strong>{wine.avgScore.toFixed(1)}</strong>
                          <span>{t.card.points}</span>
                        </div>
                      </div>
                    </div>

                    <section className="wine-card-info-section" aria-label="Informacio del vi">
                      <p className="wine-card-info-title">INFORMACIO DEL VI</p>
                      <dl className="wine-card-meta">
                      <div className="wine-card-meta-box-do">
                        <dt>{t.icons.region} DO</dt>
                        <dd className="origin-with-do">
                          {communityFlagImage && communityName ? (
                            <span className="country-flag-badge" aria-label={`Comunidad autonoma ${communityName}`} title={communityName}>
                              <img className="flag-badge-image" src={communityFlagImage} alt={communityName} loading="lazy" />
                            </span>
                          ) : null}
                          {wine.doLogoImage ? (
                            <span className="do-logo-tooltip" aria-label={`${wine.region} DO`}>
                              <img className="do-logo-badge" src={wine.doLogoImage} alt={`${wine.region} DO`} loading="lazy" />
                              <span className="do-logo-tooltip-panel" role="tooltip" aria-hidden="true">
                                <img src={wine.doLogoImage} alt="" loading="lazy" />
                                <span>{wine.region}</span>
                              </span>
                            </span>
                          ) : null}
                          <span>{wine.region}</span>
                        </dd>
                      </div>
                      <div className="wine-card-meta-box-aging">
                        <dt>🍷 Crianza</dt>
                        <dd>{wine.aging}</dd>
                      </div>
                      <div className="wine-card-meta-box-vintage"><dt>{t.icons.vintage} {t.card.vintage}</dt><dd>{wine.vintage}</dd></div>
                      <div className="wine-card-meta-box-grapes">
                        <dt>{t.icons.grape} {t.filters.grape}</dt>
                        <dd className="wine-card-meta-grapes">
                          {splitGrapeVarieties(wine.grapes).map((grape) => (
                            <button
                              key={`${wine.id}-meta-grape-${grape}`}
                              type="button"
                              className="grape-filter-chip grape-filter-chip-secondary grape-filter-chip-compact"
                              onClick={(event) => {
                                event.stopPropagation()
                                setGrapeFilter(grape)
                              }}
                              aria-label={`${t.filters.grape}: ${grape}`}
                              title={grape}
                            >
                              <span aria-hidden="true">{t.icons.grape}</span>
                              <span>{grape}</span>
                            </button>
                          ))}
                        </dd>
                      </div>
                      </dl>
                    </section>

                    <section className="wine-card-mobile-layout" aria-label="mobile card layout">
                      <div className="wine-card-mobile-main-row">
                        <div className="wine-card-mobile-main-left">
                          <p className="wine-card-mobile-name-line">
                            <span className='wine-card-mobile-title '>{wine.name}</span>
                          </p>
                          <p className="wine-card-mobile-main-subline">{wine.vintage} • {wine.aging}</p>
                          <p className="wine-card-mobile-winery">{wine.winery}</p>
                        </div>
                        </div>
                       {/* </div>
                                      <div className="wine-card-mobile-main-right">
                          <span className='title'>{wine.avgScore.toFixed(1)}</span>
                          <span>M: {wine.mariaScore != null ? wine.mariaScore.toFixed(1) : 'n/d'}</span>
                          <span>A: {wine.adriaScore != null ? wine.adriaScore.toFixed(1) : 'n/d'}</span>
                        </div> */}

                      <div className="wine-card-mobile-do-row">
                        <p className="wine-card-mobile-do-text">DO <span className='title'>{wine.region}</span> </p>

                        <p className="wine-card-mobile-do-logos">
                          {communityFlagImage && communityName ? (
                            <img className="do-logo-badge" src={communityFlagImage} alt={communityName} loading="lazy" />
                          ) : null}
                          {wine.doLogoImage ? (
                            <img className="do-logo-badge" src={wine.doLogoImage} alt={`${wine.region} DO`} loading="lazy" />
                          ) : null}
                        </p>
                      </div>

                      <div className="wine-card-mobile-grapes-row">
                        <p>{t.filters.grape}</p>
                        <div className="wine-card-mobile-grapes-list">
                          {splitGrapeVarieties(wine.grapes).map((grape) => (
                            <button
                              key={`${wine.id}-mobile-grape-${grape}`}
                              type="button"
                              className="grape-filter-chip grape-filter-chip-secondary grape-filter-chip-compact"
                              onClick={(event) => {
                                event.stopPropagation()
                                setGrapeFilter(grape)
                              }}
                              aria-label={`${t.filters.grape}: ${grape}`}
                              title={grape}
                            >
                              <span aria-hidden="true">{t.icons.grape}</span>
                              <span>{grape}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="wine-card-mobile-list-layout" aria-label="mobile list layout">
                      <div className="wine-card-mobile-list-image-wrap">
                        <img
                          src={resolvePublicWineImageForTheme(wine.image, isDark)}
                          alt={wine.name}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.src = defaultPublicWineImageForTheme(isDark)
                          }}
                        />
                      </div>

                      <div className="wine-card-mobile-list-main">
                        <p className="wine-card-mobile-list-name">{wine.name}</p>
                        <p className="wine-card-mobile-list-subline">{wine.vintage} • {t.wineType[wine.type]}</p>
                        <p className="wine-card-mobile-list-do-row">
                          <span className="wine-card-mobile-list-do-title">DO</span>
                          {wine.doLogoImage ? (
                            <img className="do-logo-badge" src={wine.doLogoImage} alt={`${wine.region} DO`} loading="lazy" />
                          ) : null}
                        </p>
                        <p className="wine-card-mobile-list-do-name">{wine.region}</p>
                        {wine.country !== 'Spain' ? (
                          <p className="wine-card-mobile-list-origin-row">
                            <span className="wine-card-mobile-list-origin-label">{locale === 'ca' ? 'Fabricació' : 'Fabricación'}</span>
                            <span className="wine-card-mobile-list-country">
                              {countryFlagImage
                                ? <img className="flag-badge-image wine-card-mobile-list-country-flag" src={countryFlagImage} alt={localizedCountryName(wine.country, locale)} loading="lazy" />
                                : <span className="wine-card-mobile-list-country-emoji" aria-hidden="true">{countryFlagEmoji(wine.country)}</span>}
                              <span>{localizedCountryName(wine.country, locale)}</span>
                            </span>
                          </p>
                        ) : null}
                      </div>

                      <div className="wine-card-mobile-list-grapes-col" aria-label={t.filters.grape}>
                        <p className="wine-card-mobile-list-grapes-title">
                          {locale === 'ca' ? 'varietats de vi' : 'variedades de vino'}
                        </p>
                        <div className="wine-card-mobile-list-grapes-list">
                          {splitGrapeVarieties(wine.grapes).map((grape) => (
                            <button
                              key={`${wine.id}-list-grape-${grape}`}
                              type="button"
                              className="grape-filter-chip grape-filter-chip-secondary grape-filter-chip-compact"
                              onClick={(event) => {
                                event.stopPropagation()
                                setGrapeFilter(grape)
                              }}
                              aria-label={`${t.filters.grape}: ${grape}`}
                              title={grape}
                            >
                              <span aria-hidden="true">{t.icons.grape}</span>
                              <span>{grape}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="wine-card-mobile-list-score-col">
                        <span className={`wine-card-score-floating wine-card-score-floating-${scoreTier} wine-card-mobile-list-score-bullet`} aria-label={`${t.card.avgScore} ${wine.avgScore.toFixed(1)}`}>
                          {wine.avgScore.toFixed(1)}
                        </span>
                      </div>
                    </section>

                    <section className="wine-card-review-section" aria-label="review summary">
                      <p className="wine-card-review-title">Valoració</p>
                      <div className="wine-card-review-block">
                        <article className="wine-card-mini-box wine-card-mini-maria">
                          <span className="mini-label">👩 {t.modal.mariaScore}</span>
                          <strong>{wine.mariaScore != null ? wine.mariaScore.toFixed(2) : 'n/d'}</strong>
                        </article>
                        <article className="wine-card-mini-box wine-card-mini-adria">
                          <span className="mini-label">🧑 {t.modal.adriaScore}</span>
                          <strong>{wine.adriaScore != null ? wine.adriaScore.toFixed(2) : 'n/d'}</strong>
                        </article>
                        <article className="wine-card-mini-box wine-card-mini-date">
                          <span className="mini-label">📅 {t.modal.tastedAt}</span>
                          <strong>{wine.tastedAt}</strong>
                        </article>
                      </div>
                    </section>

                    <div className="wine-card-footer">
                      <span className="card-link">{t.card.viewProfile}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </section>

      <section className="mobile-about-anchor" id="about" aria-hidden="true" />

      {selectedWine ? (
        <div className="public-modal-backdrop" role="presentation" onClick={() => setSelectedWineId(null)}>
          <section
            className="public-wine-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="public-wine-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="public-wine-modal-header">
              <div>
                <p className="eyebrow">{t.modal.details}</p>
                <div className="public-wine-modal-title-row">
                  <h2 id="public-wine-modal-title">{selectedWine.name}</h2>
                  {selectedWine.rewardBadgeImage ? (
                    <span
                      className="public-wine-modal-award-icon"
                      aria-label={`${selectedWine.reward?.name ?? 'Award'} ${selectedWine.reward?.score ?? ''}`.trim()}
                      title={`${selectedWine.reward?.name ?? 'Award'} ${selectedWine.reward?.score ?? ''}`.trim()}
                    >
                      <img src={selectedWine.rewardBadgeImage} alt="" loading="lazy" />
                    </span>
                  ) : null}
                </div>
                <p className="muted-line">{selectedWine.winery}</p>
              </div>
              <button type="button" className="ghost-close public-wine-modal-close" onClick={() => setSelectedWineId(null)}>
                <span className="public-wine-modal-close-icon" aria-hidden="true">✕</span>
                <span className="public-wine-modal-close-label">{t.modal.close}</span>
              </button>
            </header>

            <div className="public-wine-modal-grid">
              <div className="public-wine-gallery">
                <div className="public-wine-main-image">
                  <img
                    src={resolvePublicWineImageForTheme(selectedWine.gallery[activeModalImageIndex] ?? selectedWine.image, isDark)}
                    alt={selectedWine.name}
                    onError={(event) => {
                      event.currentTarget.src = defaultPublicWineImageForTheme(isDark)
                    }}
                  />
                </div>
                <div className="public-wine-thumbs" aria-label={t.modal.gallery}>
                  {selectedWine.gallery.map((src, index) => {
                    const photoLabel = galleryPhotoLabels[index] ?? `${t.modal.gallery} ${index + 1}`
                    return (
                    <button
                      key={`${selectedWine.id}-${src}-${index}`}
                      type="button"
                      className={`public-wine-thumb ${activeModalImageIndex === index ? 'active' : ''}`}
                      onClick={() => setActiveModalImageIndex(index)}
                      aria-label={photoLabel}
                      title={photoLabel}
                    >
                      <img
                        src={resolvePublicWineImageForTheme(src, isDark)}
                        alt={`${selectedWine.name} · ${photoLabel}`}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = defaultPublicWineImageForTheme(isDark)
                        }}
                      />
                      <span className="public-wine-thumb-label">{photoLabel}</span>
                    </button>
                    )
                  })}
                </div>
              </div>

              <div className="public-wine-details">
                {(() => {
                  const selectedCountryFlagImage = countryFlagPath(selectedWine.country)
                  const selectedCommunityFlagImage = selectedWine.country === 'Spain' ? selectedWine.regionLogoImage ?? null : null
                  const selectedCommunityName = selectedWine.country === 'Spain' ? autonomousCommunityNameForRegion(selectedWine.region) : null
                  return (
                <section className="detail-card">
                  <h3>{t.icons.details} {t.modal.details}</h3>
                  <dl>
                    <div><dt>{t.icons.winery} {t.modal.winery}</dt><dd>{selectedWine.winery}</dd></div>
                    <div>
                      <dt>{t.icons.origin} DO</dt>
                      <dd className="origin-with-do">
                        <span className="country-flag-badge" aria-label={selectedWine.country} title={selectedWine.country}>
                          {selectedCountryFlagImage ? <img className="flag-badge-image" src={selectedCountryFlagImage} alt={localizedCountryName(selectedWine.country, locale)} loading="lazy" /> : countryFlagEmoji(selectedWine.country)}
                        </span>
                        {selectedCommunityFlagImage && selectedCommunityName ? (
                          <span className="country-flag-badge" aria-label={`Comunidad autonoma ${selectedCommunityName}`} title={selectedCommunityName}>
                            <img className="flag-badge-image" src={selectedCommunityFlagImage} alt={selectedCommunityName} loading="lazy" />
                          </span>
                        ) : null}
                        {selectedWine.doLogoImage ? (
                          <span className="do-logo-tooltip do-logo-tooltip-clickable">
                            <button
                              type="button"
                              className="do-logo-inline-button"
                              onClick={() => setDoLogoPreview({ src: selectedWine.doLogoImage!, label: selectedWine.region })}
                              aria-label={`${selectedWine.region} DO`}
                              title={selectedWine.region}
                            >
                              <img className="do-logo-badge" src={selectedWine.doLogoImage} alt={`${selectedWine.region} DO`} loading="lazy" />
                            </button>
                            <span className="do-logo-tooltip-panel" role="tooltip" aria-hidden="true">
                              <img src={selectedWine.doLogoImage} alt="" loading="lazy" />
                              <span>{selectedWine.region}</span>
                            </span>
                          </span>
                        ) : null}
                        <span>{selectedWine.region}</span>
                      </dd>
                    </div>
                    <div><dt>{t.icons.type} {t.modal.style}</dt><dd>{t.wineType[selectedWine.type]} · {selectedWine.vintage}</dd></div>
                    <div className="detail-grapes-row">
                      <dt>{t.icons.grape} {t.modal.grapes}</dt>
                      <dd>
                        <div className="grape-variety-list">
                          {splitGrapeVarieties(selectedWine.grapes).map((grape) => (
                            <span key={`${selectedWine.id}-grape-${grape}`} className="grape-variety-pill">
                              <span aria-hidden="true">{t.icons.grape}</span>
                              <span>{grape}</span>
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                    <div><dt>{t.icons.type} {t.modal.aging}</dt><dd>{selectedWine.aging}</dd></div>
                    <div><dt>{t.icons.price} {t.modal.alcohol}</dt><dd>{selectedWine.alcohol}</dd></div>
                    <div><dt>📅 {t.modal.tastedAt}</dt><dd>{selectedWine.tastedAt}</dd></div>
                    <div><dt>🗓 {t.modal.month}</dt><dd>{selectedWine.month}</dd></div>
                    <div><dt>📍 {t.modal.place}</dt><dd>{selectedWine.place} · {selectedWine.city}</dd></div>
                    <div><dt>{t.icons.avgScore} {t.card.avgScore}</dt><dd>{selectedWine.avgScore.toFixed(1)} {t.card.points}</dd></div>
                    <div><dt>{t.icons.price} {t.card.priceFrom}</dt><dd>{euro.format(selectedWine.priceFrom)}</dd></div>
                    <div><dt>{t.icons.reward} {t.card.reward}</dt><dd>{selectedWine.reward ? `${selectedWine.reward.name}${selectedWine.reward.score ? ` · ${selectedWine.reward.score}` : ''}` : t.modal.rewardNone}</dd></div>
                  </dl>
                </section>
                  )
                })()}

                <section className="detail-card score-detail-card">
                  <h3>{t.icons.avgScore} {t.card.avgScore}</h3>
                  <p className="score-detail-date">📅 {selectedWine.tastedAt} · {selectedWine.month}</p>
                  <div className="reviewer-score-grid">
                    <article className="reviewer-score reviewer-score-maria">
                      <header>
                        <span className="reviewer-avatar" aria-hidden="true">👩</span>
                        <strong>{t.modal.mariaScore}</strong>
                      </header>
                      <p>{selectedWine.mariaScore != null ? selectedWine.mariaScore.toFixed(2) : 'n/d'}</p>
                    </article>
                    <article className="reviewer-score reviewer-score-adria">
                      <header>
                        <span className="reviewer-avatar" aria-hidden="true">🧑</span>
                        <strong>{t.modal.adriaScore}</strong>
                      </header>
                      <p>{selectedWine.adriaScore != null ? selectedWine.adriaScore.toFixed(2) : 'n/d'}</p>
                    </article>
                  </div>
                </section>

                <section className="detail-card">
                  <h3>{t.icons.tasting} {t.modal.tasting}</h3>
                  <p>{selectedWine.notes}</p>
                </section>

                <section className="detail-card">
                  <h3>{t.icons.tags} {t.modal.tags}</h3>
                  <div className="detail-tags">
                    {selectedWine.tags.map((tag) => <span key={`${selectedWine.id}-${tag}`}>{tag}</span>)}
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {doLogoPreview ? (
        <div className="public-modal-backdrop do-logo-lightbox-backdrop" role="presentation" onClick={() => setDoLogoPreview(null)}>
          <section
            className="do-logo-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${doLogoPreview.label} DO`}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="ghost-close do-logo-lightbox-close" onClick={() => setDoLogoPreview(null)}>
              {t.modal.close}
            </button>
            <img src={doLogoPreview.src} alt={`${doLogoPreview.label} DO`} loading="lazy" />
            <p>{doLogoPreview.label}</p>
          </section>
        </div>
      ) : null}
    </main>
  )
}
