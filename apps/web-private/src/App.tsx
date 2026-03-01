import type { FormEvent, HTMLAttributes, ReactNode, SyntheticEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import hljs from 'highlight.js/lib/common'
import { Bar, BarChart, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import ReactMarkdown from 'react-markdown'
import { LanguageSelector } from './components/LanguageSelector'
import './App.css'
import { useI18n } from './i18n/I18nProvider'

type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'sweet' | 'fortified'
type CountryFilterValue =
  | 'all'
  | 'spain'
  | 'france'
  | 'italy'
  | 'portugal'
  | 'germany'
  | 'argentina'
  | 'chile'
  | 'united_states'
  | 'south_africa'
  | 'australia'

type WineItem = {
  id: number
  name: string
  winery: string
  type: WineType
  country: string
  region: string
  vintageYear: number | null
  pricePaid: number
  averageScore: number | null
}

type ReviewItem = {
  id: number
  wineId: number
  wineName: string
  score: number
  createdAt: string
  notes: string
}

type WineListApiItem = {
  id: number
  name: string
  winery: string | null
  wine_type: WineType | null
  country: Exclude<CountryFilterValue, 'all'> | null
  do: { id: number; name: string } | null
  vintage_year: number | null
  avg_score: number | null
}

type WineListApiPagination = {
  page: number
  limit: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

type WineListApiResponse = {
  items: WineListApiItem[]
  pagination: WineListApiPagination
}

type GrapeApiItem = {
  id: number
  name: string
  color: 'red' | 'white'
}

type GrapeApiResponse = {
  items: GrapeApiItem[]
}

type DoApiItem = {
  id: number
  name: string
  region: string
  country: Exclude<CountryFilterValue, 'all'>
  country_code: string
}

type DoApiResponse = {
  items: DoApiItem[]
}

type WineProfileField = {
  label: string
  value: string
}

type WineProfileSection = {
  icon: string
  title: string
  fields: WineProfileField[]
}

type WineProfileMedalTone = 'gold' | 'silver' | 'bronze'

type MenuKey = 'dashboard' | 'wines' | 'wineCreate' | 'wineEdit' | 'reviews' | 'reviewCreate' | 'reviewEdit' | 'admin' | 'apiDocs' | 'settings' | 'wineProfile'
type ThemeMode = 'light' | 'dark'
type GalleryModalVariant = 'full' | 'compact'

type MockUser = {
  id: number
  name: string
  lastname: string
  email: string
}

type AuthApiUser = {
  id: number
  email: string
  name: string
  lastname: string
}

type AuthApiResponse = {
  user: AuthApiUser
}

type GrapeBlendRow = {
  id: number
  grape: string
}

type AwardRow = {
  id: number
  award: string
  score: string
  year: string
}

type ReviewFormPreset = {
  wineId: string
  tastingDate: string
  overallScore: number
  aroma: number
  sweetness: number
  acidity: number
  tannin: number
  body: number
  persistence: number
  tags: string[]
  notes: string
}

const SAMPLE_WINE_THUMBNAIL_SRC = '/images/photos/wines/exmaple_wine-hash.png'
const DEFAULT_WINE_ICON_CANDIDATES = ['/images/photos/wines_photo.png', '/admin/images/photos/wines_photo.png'] as const
const DEFAULT_WINE_ICON_DATA_URI = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="240" viewBox="0 0 160 240"><rect width="160" height="240" rx="14" fill="%23f3ece3"/><path d="M55 36h50c0 36-10 56-25 71v51h22v18H58v-18h22v-51C65 92 55 72 55 36Z" fill="%238f3851"/><circle cx="80" cy="73" r="24" fill="%23c9657f"/></svg>'
const SAMPLE_WINE_GALLERY = [
  { key: 'bottle', src: SAMPLE_WINE_THUMBNAIL_SRC },
  { key: 'front', src: '/images/photos/wines/front_wine-hash.png' },
  { key: 'back', src: '/images/photos/wines/back_wine-hash.png' },
] as const

const mockUser: MockUser = {
  id: 1,
  name: 'Adrià',
  lastname: 'Sommelier',
  email: 'adria@example.com',
}

type JournalWineRow = {
  wine: string
  typeCa: string
  region: string
  vintage: number | null
  maria: string
  adria: string
  place: string
}

const journalWineRows: JournalWineRow[] = [
  { wine: 'Lo cometa', typeCa: 'Blanc', region: 'Terra Alta', vintage: 2019, maria: '7', adria: '7,5', place: 'Celler del nou priorat' },
  { wine: 'Compte ovelles', typeCa: 'Negre', region: 'Penedès', vintage: 2020, maria: '5', adria: '5,75', place: 'Casa Rosset' },
  { wine: 'Seré 2018', typeCa: 'Negre', region: 'Montsant', vintage: 2018, maria: '6,5', adria: '6,25', place: 'Taberna La Parra' },
  { wine: 'Vega de Nava', typeCa: 'Negre', region: 'Ribera del Duero', vintage: 2018, maria: '8', adria: '8', place: 'Casa Tat' },
  { wine: 'Chateldon', typeCa: 'Negre', region: 'Penedès', vintage: 2019, maria: '8', adria: '', place: 'Casa Rosset' },
  { wine: 'Matsu - el pícaro', typeCa: 'Negre', region: 'Toro', vintage: 2020, maria: '7,5', adria: '8', place: 'Casa Tat' },
  { wine: 'Titella', typeCa: 'Negre', region: 'Montsant', vintage: 2017, maria: '8', adria: '8,1', place: 'Casa Rosset' },
  { wine: 'Ulldemolins', typeCa: 'Negre', region: 'Montsant', vintage: 2016, maria: '6,5', adria: '6,75', place: 'Casa Tat' },
  { wine: 'Clot d’encís blanc de negres', typeCa: 'Blanc', region: 'Terra Alta', vintage: 2019, maria: '7,5', adria: '7,15', place: 'Casa Tat' },
  { wine: 'Ninín', typeCa: 'Negre', region: 'Ribera del Duero', vintage: 2018, maria: '6,75', adria: '6,9', place: 'Casa Rosset' },
  { wine: 'Roca Blanca', typeCa: 'Negre', region: 'Montsant', vintage: 2016, maria: '6', adria: '4,25', place: 'Casa Tat' },
  { wine: 'Enate', typeCa: 'Negre', region: 'Somontano', vintage: 2017, maria: '7', adria: '8', place: 'Casa Rosset' },
  { wine: 'Fulget', typeCa: 'Blanc', region: 'Rías Baixas', vintage: 2019, maria: '6,5', adria: '5,5', place: "A'rogueira" },
  { wine: 'Roca blanca', typeCa: 'Negre', region: 'Montsant', vintage: 2016, maria: '5,5', adria: '4,67', place: 'Casa Tat' },
  { wine: 'Castillo de Albai', typeCa: 'Negre', region: 'Rioja', vintage: 2016, maria: '7', adria: '7,1', place: 'Casa Rosset' },
  { wine: 'Acústic', typeCa: 'Negre', region: 'Montsant', vintage: 2018, maria: '9,2', adria: '8,1', place: 'Casa Rosset' },
  { wine: 'Matsu - el recio', typeCa: 'Negre', region: 'Toro', vintage: null, maria: '9', adria: '7,8', place: 'Casa Rosset' },
  { wine: 'Roureda', typeCa: 'Negre', region: 'Tarragona', vintage: 2016, maria: '', adria: '', place: 'Casa Tat' },
  { wine: 'Almodí', typeCa: 'Negre', region: 'Terra Alta', vintage: 2019, maria: '7,5', adria: '7,5', place: 'Casa Rosset' },
  { wine: 'Muga', typeCa: 'Negre', region: 'Rioja', vintage: 2017, maria: '8', adria: '7', place: 'Casa Tat' },
  { wine: "L'isard", typeCa: 'Negre', region: 'Penedès', vintage: 2019, maria: '7,7', adria: '7,1', place: 'Casa Rosset' },
  { wine: 'Sumarroca classic', typeCa: 'Negre', region: 'Penedès', vintage: 2019, maria: '7', adria: '8', place: 'Casa Rosset' },
  { wine: 'Condado de Teón', typeCa: 'Negre', region: 'Ribera del Duero', vintage: 2018, maria: '6,5', adria: '6,1', place: 'Casa Tat' },
  { wine: 'Rosum', typeCa: 'Negre', region: 'Toro', vintage: 2017, maria: '8,5', adria: '7,1', place: 'Casa Tat' },
]

function parseJournalScore(value: string): number | null {
  const normalized = value.trim().replace(',', '.')
  if (!normalized) {
    return null
  }

  const numeric = Number(normalized)
  return Number.isFinite(numeric) ? numeric : null
}

function mapTypeFromCa(value: string, wineName: string): WineType {
  const text = value.trim().toLowerCase()
  if (text.includes('blanc')) return 'white'
  if (text.includes('rosat')) return 'rose'
  if (text.includes('escum')) return 'sparkling'
  if (wineName.toLowerCase().includes('classic') || wineName.toLowerCase().includes('cava')) return 'sparkling'
  return 'red'
}

const mockWines: WineItem[] = journalWineRows.map((row, index) => {
  const maria = parseJournalScore(row.maria)
  const adria = parseJournalScore(row.adria)
  const avgTen = maria != null && adria != null ? (maria + adria) / 2 : (maria ?? adria ?? 6.8)
  const averageScore = Math.round(avgTen * 100) / 10
  const pricePaid = Number((9 + (avgTen * 1.9) + ((index % 5) * 1.75)).toFixed(2))

  return {
    id: index + 1,
    name: row.wine,
    winery: row.place,
    type: mapTypeFromCa(row.typeCa, row.wine),
    country: 'Spain',
    region: row.region,
    vintageYear: row.vintage,
    pricePaid,
    averageScore,
  }
})

const mockReviews: ReviewItem[] = [
  { id: 11, wineId: 1, wineName: 'Lo cometa', score: 88, createdAt: '2026-02-20', notes: 'Cirera madura, cos mitjà i final amable.' },
  { id: 12, wineId: 16, wineName: 'Acústic', score: 95, createdAt: '2026-02-18', notes: 'Fusta integrada, taní estructurat i persistència llarga.' },
  { id: 13, wineId: 13, wineName: 'Fulget', score: 84, createdAt: '2026-02-14', notes: 'Perfil fresc, acidesa viva i final net.' },
  { id: 14, wineId: 20, wineName: 'Muga', score: 86, createdAt: '2026-02-12', notes: 'Aroma net, pas de boca equilibrat i bona longitud.' },
]

const AGING_OPTIONS = ['jove', 'criança', 'reserva', 'gran_reserva'] as const
const PLACE_TYPE_OPTIONS = ['restaurant', 'supermarket', 'wine_bar', 'cellar', 'online'] as const
const AWARD_OPTIONS = ['decanter', 'penin', 'wine_spectator', 'parker'] as const
const GRAPE_OPTIONS = ['Garnatxa', 'Carinyena', 'Tempranillo', 'Cabernet Sauvignon', 'Syrah', 'Macabeu', 'Xarel·lo', 'Parellada'] as const
const REVIEW_TAG_OPTIONS = ['Afrutado', 'Floral', 'Especiado', 'Mineral', 'Madera marcada', 'Fácil de beber', 'Elegante', 'Potente', 'Gastronómico'] as const
const SCORE_OPTIONS_0_TO_10 = Array.from({ length: 11 }, (_, value) => value)
const SCORE_OPTIONS_0_TO_100 = Array.from({ length: 101 }, (_, value) => value)
const VINTAGE_YEAR_OPTIONS = Array.from({ length: 76 }, (_, index) => String(2026 - index))
const WINE_COUNTRY_FILTER_VALUES: Exclude<CountryFilterValue, 'all'>[] = [
  'spain',
  'france',
  'italy',
  'portugal',
  'germany',
  'argentina',
  'chile',
  'united_states',
  'south_africa',
  'australia',
]

function buildReviewFormPreset(review: ReviewItem | null): ReviewFormPreset {
  if (review == null) {
    return {
      wineId: '',
      tastingDate: '2026-02-27',
      overallScore: 85,
      aroma: 5,
      sweetness: 5,
      acidity: 5,
      tannin: 5,
      body: 5,
      persistence: 5,
      tags: [],
      notes: '',
    }
  }

  const base = Math.max(0, Math.min(10, Math.round(review.score / 10)))
  const boosted = Math.max(0, Math.min(10, base + 1))
  const tags = review.score >= 90 ? ['Elegante', 'Potente', 'Gastronómico'] : ['Afrutado', 'Fácil de beber']

  return {
    wineId: String(review.wineId),
    tastingDate: review.createdAt,
    overallScore: review.score,
    aroma: boosted,
    sweetness: Math.max(0, base - 1),
    acidity: base,
    tannin: boosted,
    body: boosted,
    persistence: base,
    tags,
    notes: review.notes,
  }
}

const THEME_STORAGE_KEY = 'wine-app-theme-mode'
const SIDEBAR_STORAGE_KEY = 'wine-app-sidebar-collapsed'

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') {
    return saved
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
}

function averageScore(wines: WineItem[], type: WineType): number {
  const values = wines.filter((wine) => wine.type === type && wine.averageScore !== null).map((wine) => wine.averageScore as number)
  if (values.length === 0) {
    return 0
  }

  return values.reduce((sum, current) => sum + current, 0) / values.length
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  return sorted[middle]
}

function standardDeviation(values: number[]): number {
  if (values.length <= 1) return 0
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance = values.reduce((sum, value) => sum + ((value - avg) ** 2), 0) / values.length
  return Math.sqrt(variance)
}

function linearRegression(points: Array<{ x: number; y: number }>): { slope: number; intercept: number } {
  if (points.length === 0) {
    return { slope: 0, intercept: 0 }
  }

  const n = points.length
  const sumX = points.reduce((sum, point) => sum + point.x, 0)
  const sumY = points.reduce((sum, point) => sum + point.y, 0)
  const sumXY = points.reduce((sum, point) => sum + (point.x * point.y), 0)
  const sumXX = points.reduce((sum, point) => sum + (point.x * point.x), 0)
  const denominator = (n * sumXX) - (sumX ** 2)

  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n }
  }

  const slope = ((n * sumXY) - (sumX * sumY)) / denominator
  const intercept = (sumY - (slope * sumX)) / n
  return { slope, intercept }
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = ((1664525 * state) + 1013904223) >>> 0
    return state / 4294967296
  }
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

function localizedCountryName(country: string, locale: string): string {
  if (country === 'Spain') return locale === 'ca' ? 'Espanya' : 'España'
  return country
}

function countryCodeToLabel(countryCode: Exclude<CountryFilterValue, 'all'> | null, locale: string): string {
  if (countryCode == null) {
    return '-'
  }

  const mapCa: Record<Exclude<CountryFilterValue, 'all'>, string> = {
    spain: 'Espanya',
    france: 'França',
    italy: 'Itàlia',
    portugal: 'Portugal',
    germany: 'Alemanya',
    argentina: 'Argentina',
    chile: 'Xile',
    united_states: 'Estats Units',
    south_africa: 'Sud-àfrica',
    australia: 'Austràlia',
  }
  const mapEs: Record<Exclude<CountryFilterValue, 'all'>, string> = {
    spain: 'España',
    france: 'Francia',
    italy: 'Italia',
    portugal: 'Portugal',
    germany: 'Alemania',
    argentina: 'Argentina',
    chile: 'Chile',
    united_states: 'Estados Unidos',
    south_africa: 'Sudáfrica',
    australia: 'Australia',
  }

  return locale === 'ca' ? mapCa[countryCode] : mapEs[countryCode]
}

function countryLabelToFilterValue(country: string): CountryFilterValue {
  const normalized = country.trim().toLowerCase()
  const map: Record<string, Exclude<CountryFilterValue, 'all'>> = {
    spain: 'spain',
    españa: 'spain',
    espanya: 'spain',
    france: 'france',
    francia: 'france',
    frança: 'france',
    italy: 'italy',
    italia: 'italy',
    portugal: 'portugal',
    germany: 'germany',
    alemania: 'germany',
    alemanya: 'germany',
    argentina: 'argentina',
    chile: 'chile',
    usa: 'united_states',
    'united states': 'united_states',
    'estados unidos': 'united_states',
    'estats units': 'united_states',
    'south africa': 'south_africa',
    'sudáfrica': 'south_africa',
    'sud-àfrica': 'south_africa',
    australia: 'australia',
  }

  return map[normalized] ?? 'all'
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function doLogoPathForRegion(region: string): string | null {
  const map: Record<string, string> = {
    'Penedès': '/images/icons/DO/penedes_DO.png',
    Montsant: '/images/icons/DO/montanst_DO.png',
    'Ribera del Duero': '/images/icons/DO/ribera_del_duero_DO.png',
    Somontano: '/images/icons/DO/somontano_DO.jpg',
    Toro: '/images/icons/DO/toro_DO.jpg',
    Rioja: '/images/icons/DO/rioja_DO.png',
    Tarragona: '/images/icons/DO/tarragona_DO.png',
    'Terra Alta': '/images/icons/DO/terra_alta_DO.png',
    Priorat: '/images/icons/DO/priorat_DO.png',
    'Conca de Barberà': '/images/icons/DO/conca_de_barbera_DO.jpg',
    'Pla de Bages': '/images/icons/DO/pla_de_bages_DO.png',
    Alella: '/images/icons/DO/alella_DO.png',
    Empordà: '/images/icons/DO/emporda_DO.png',
    Navarra: '/images/icons/DO/navarra_DO.jpg',
    Cariñena: '/images/icons/DO/cariñena_DO.png',
    Calatayud: '/images/icons/DO/calatayud_DO.jpg',
    Cigales: '/images/icons/DO/cigales_DO.png',
    Arlanza: '/images/icons/DO/arlanza_DO.jpg',
    'Costers del Segre': '/images/icons/DO/costers_del_segre_DO.png',
  }

  return map[region] ?? null
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
    // CCAA names from DB
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
    // Legacy DO region names to keep compatibility in other views
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

function autonomousCommunityFlagPathForRegion(region: string): string | null {
  const community = spanishAutonomousCommunity(region)
  if (!community) return null
  return `/images/flags/ccaa/${community.slug}.png`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function medalToneFromScore(score: number | null): WineProfileMedalTone | null {
  if (score == null) {
    return null
  }

  if (score >= 90) return 'gold'
  if (score >= 85) return 'silver'
  return 'bronze'
}

function buildMockWineProfile(
  wine: WineItem,
  wineProfileLabels: any,
  wineTypeLabels: Record<WineType, string>,
) {
  const wp = wineProfileLabels
  const wm = wineProfileLabels.mock
  const formatTemplate = (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce(
      (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
      template,
    )
  const harvest = (wine.vintageYear ?? 2021) - 1
  const wineTypeValue = `${wineTypeLabels[wine.type].toLowerCase()} (${wine.type})`
  const aging = wine.type === 'red' ? wm.values.agingReserve : wm.values.agingYoung
  const placeType = wine.id % 2 === 0 ? 'restaurant' : 'supermarket'
  const placeTypeDisplay = placeType === 'restaurant' ? wm.values.placeTypeRestaurant : wm.values.placeTypeSupermarket
  const countryCode = wine.country.toLowerCase().replaceAll(' ', '_')
  const countryDisplayMap: Record<string, string> = {
    Spain: wm.values.countrySpain,
    France: wm.values.countryFrance,
    Portugal: wm.values.countryPortugal,
  }
  const countryDisplay = countryDisplayMap[wine.country] ?? countryCode
  const alcoholPercentage = wine.type === 'red' ? 14 : wine.type === 'sparkling' ? 12 : 13
  const createdAt = `2026-02-${String(5 + wine.id).padStart(2, '0')}T18:30:00Z`
  const updatedAt = `2026-02-${String(15 + wine.id).padStart(2, '0')}T10:15:00Z`
  const photosSummary = [
    wm.values.photoTypeBottle,
    wm.values.photoTypeFrontLabel,
    wm.values.photoTypeBackLabel,
  ].join(', ')
  const awardName = wine.id % 2 === 0 ? 'decanter' : 'penin'
  const awardScore = (88 + (wine.id % 6)).toFixed(1)
  const awardYear = wine.vintageYear ? wine.vintageYear + 2 : 2026
  const awardPresent = wine.id % 5 !== 0
  const grapeRows = wine.type === 'white'
    ? [
        { name: 'Albariño', color: 'white', percentage: '70.00' },
        { name: 'Godello', color: 'white', percentage: '30.00' },
      ]
    : wine.type === 'sparkling'
      ? [
          { name: 'Macabeo', color: 'white', percentage: '45.00' },
          { name: 'Xarel·lo', color: 'white', percentage: '35.00' },
          { name: 'Parellada', color: 'white', percentage: '20.00' },
        ]
      : [
          { name: 'Tempranillo', color: 'red', percentage: '80.00' },
          { name: 'Garnatxa', color: 'red', percentage: '20.00' },
        ]

  const sections: WineProfileSection[] = [
    {
      icon: '🍷',
      title: wm.sectionTitles.wineRecord,
      fields: [
        { label: wm.fieldLabels.id, value: String(wine.id) },
        { label: wm.fieldLabels.name, value: wine.name },
        { label: wm.fieldLabels.winery, value: wine.winery },
        { label: wm.fieldLabels.wineTypeEnum, value: wineTypeValue },
        { label: wm.fieldLabels.agingTypeEnum, value: aging },
        { label: wm.fieldLabels.vintageYear, value: String(wine.vintageYear ?? '-') },
        { label: wm.fieldLabels.alcoholPercentage, value: `${alcoholPercentage}` },
        { label: wm.fieldLabels.pricePaid, value: `${wine.pricePaid.toFixed(2)}` },
        { label: wm.fieldLabels.createdAt, value: createdAt },
        { label: wm.fieldLabels.updatedAt, value: updatedAt },
      ],
    },
    {
      icon: '🗺',
      title: wm.sectionTitles.regionDo,
      fields: [
        { label: wm.fieldLabels.countryEnum, value: countryDisplay },
        { label: wm.fieldLabels.regionDoName, value: wine.region },
        { label: wm.fieldLabels.regionDoCountry, value: countryDisplay },
        { label: wm.fieldLabels.regionDoId, value: formatTemplate(wm.templates.mockFkValue, { id: 100 + wine.id, mockFk: wm.labels.mockFk }) },
      ],
    },
    {
      icon: '🍇',
      title: wm.sectionTitles.grapes,
      fields: [
        { label: wm.fieldLabels.grapeRows, value: formatTemplate(wm.templates.recordsCount, { count: grapeRows.length }) },
        {
          label: formatTemplate(wm.templates.grapeRowLabel, { index: 1 }),
          value: formatTemplate(wm.templates.grapeRowValue, {
            ...grapeRows[0],
            color: grapeRows[0].color === 'red' ? wm.values.colorRed : wm.values.colorWhite,
          }),
        },
        ...(grapeRows[1]
          ? [{
              label: formatTemplate(wm.templates.grapeRowLabel, { index: 2 }),
              value: formatTemplate(wm.templates.grapeRowValue, {
                ...grapeRows[1],
                color: grapeRows[1].color === 'red' ? wm.values.colorRed : wm.values.colorWhite,
              }),
            }]
          : []),
        ...(grapeRows[2]
          ? [{
              label: formatTemplate(wm.templates.grapeRowLabel, { index: 3 }),
              value: formatTemplate(wm.templates.grapeRowValue, {
                ...grapeRows[2],
                color: grapeRows[2].color === 'red' ? wm.values.colorRed : wm.values.colorWhite,
              }),
            }]
          : []),
        { label: wm.labels.mockExtraHarvest, value: formatTemplate(wm.templates.harvestRange, { year: harvest }) },
      ],
    },
    {
      icon: '📍',
      title: wm.sectionTitles.placePurchase,
      fields: [
        { label: wm.fieldLabels.purchasePlaceId, value: formatTemplate(wm.templates.mockFkValue, { id: 200 + wine.id, mockFk: wm.labels.mockFk }) },
        { label: wm.fieldLabels.placeTypeEnum, value: placeTypeDisplay },
        { label: wm.fieldLabels.placeName, value: placeType === 'restaurant' ? wm.values.placeNameRestaurant : wm.values.placeNameSupermarket },
        { label: wm.fieldLabels.placeAddress, value: wm.values.placeAddressMock },
        { label: wm.fieldLabels.placeCity, value: wm.values.placeCityMock },
        { label: wm.fieldLabels.pricePaid, value: formatTemplate(wm.templates.priceEur, { price: wine.pricePaid.toFixed(2) }) },
      ],
    },
    {
      icon: '🖼',
      title: wm.sectionTitles.mediaAwardsReview,
      fields: [
        { label: wm.fieldLabels.photoRecordsEnum, value: photosSummary },
        { label: wm.fieldLabels.photoUrls, value: wm.values.photoUrlsMock },
        { label: wm.fieldLabels.awardNameEnum, value: awardName },
        { label: wm.fieldLabels.awardScore, value: awardScore },
        { label: wm.fieldLabels.awardYear, value: String(awardYear) },
        { label: wm.labels.reviewSummaryMock, value: formatTemplate(wm.templates.reviewSummary, { score: wine.averageScore ?? '-' }) },
        { label: wm.fieldLabels.reviewBulletsEnum, value: wm.values.reviewBullets },
      ],
    },
  ]

  return {
    headline: wp.pageTitle,
    summary: wine.type === 'red' ? wm.profile.summaryRed : wm.profile.summaryOther,
    tags: wm.profile.tags,
    pairing: wm.profile.pairing,
    servingNotes: wm.profile.servingNotes,
    galleryLabels: {
      bottle: wp.imageLabels.bottle,
      front: wp.imageLabels.front,
      back: wp.imageLabels.back,
      photosTitle: wp.galleryEyebrow,
    },
    heroAward: awardPresent
      ? {
          icon: '🏅',
          label: awardName,
          year: String(awardYear),
        }
      : null,
    heroAwardScore: awardPresent ? Number(awardScore) : null,
    sections,
  }
}

function fallbackToDefaultWineIcon(event: SyntheticEvent<HTMLImageElement, Event>): void {
  const image = event.currentTarget
  const attemptRaw = image.dataset.fallbackAttempt ?? '0'
  const attempt = Number.parseInt(attemptRaw, 10)
  if (Number.isNaN(attempt) || attempt < 0) {
    image.dataset.fallbackAttempt = '0'
    image.src = DEFAULT_WINE_ICON_CANDIDATES[0]
    return
  }

  if (attempt < DEFAULT_WINE_ICON_CANDIDATES.length) {
    image.dataset.fallbackAttempt = String(attempt + 1)
    image.src = DEFAULT_WINE_ICON_CANDIDATES[attempt]
    return
  }

  image.onerror = null
  image.src = DEFAULT_WINE_ICON_DATA_URI
}

function fallbackToAdminAsset(event: SyntheticEvent<HTMLImageElement, Event>): void {
  const image = event.currentTarget
  const attemptRaw = image.dataset.fallbackAttempt ?? '0'
  const attempt = Number.parseInt(attemptRaw, 10)
  const originalSrc = image.dataset.originalSrc ?? image.getAttribute('src') ?? ''

  if (!image.dataset.originalSrc) {
    image.dataset.originalSrc = originalSrc
  }

  if (attempt === 0 && originalSrc.startsWith('/images/')) {
    image.dataset.fallbackAttempt = '1'
    image.src = `/admin${originalSrc}`
    return
  }

  image.onerror = null
  image.style.display = 'none'
}

function App() {
  const { labels, locale, setLocale, t } = useI18n()
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(getInitialSidebarCollapsed)
  const [loggedIn, setLoggedIn] = useState(false)
  const [authBootstrapped, setAuthBootstrapped] = useState(false)
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null)
  const [menu, setMenu] = useState<MenuKey>('dashboard')
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('demo1234')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [selectedWineSheet, setSelectedWineSheet] = useState<WineItem | null>(null)
  const [selectedWineGallery, setSelectedWineGallery] = useState<WineItem | null>(null)
  const [selectedWineForEdit, setSelectedWineForEdit] = useState<WineItem | null>(null)
  const [selectedReviewForEdit, setSelectedReviewForEdit] = useState<ReviewItem | null>(null)
  const [galleryModalVariant, setGalleryModalVariant] = useState<GalleryModalVariant>('full')
  const [activeGalleryImageKey, setActiveGalleryImageKey] = useState<(typeof SAMPLE_WINE_GALLERY)[number]['key']>('bottle')
  const [dashboardSeed] = useState(() => Math.floor(Math.random() * 2_147_483_647))
  const [defaultSortPreference, setDefaultSortPreference] = useState<'score_desc' | 'recent' | 'price_asc'>('score_desc')
  const [defaultLandingPage, setDefaultLandingPage] = useState<'dashboard' | 'wines' | 'reviews'>('dashboard')
  const [showOnlySpainByDefault, setShowOnlySpainByDefault] = useState(true)
  const [compactCardsPreference, setCompactCardsPreference] = useState(false)
  const [apiGuideMarkdown, setApiGuideMarkdown] = useState('')
  const [apiGuideStatus, setApiGuideStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [apiGuideError, setApiGuideError] = useState<string | null>(null)
  const [apiGuideUrl, setApiGuideUrl] = useState<string | null>(null)
  const [apiGuideReloadToken, setApiGuideReloadToken] = useState(0)
  const [copiedApiCodeKey, setCopiedApiCodeKey] = useState<string | null>(null)

  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')
  const [wineCountryFilter, setWineCountryFilter] = useState<CountryFilterValue>('all')
  const [doCountryFilter, setDoCountryFilter] = useState<CountryFilterValue>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | WineType>('all')
  const [minScoreFilter, setMinScoreFilter] = useState<'all' | number>('all')
  const [grapeFilter, setGrapeFilter] = useState<'all' | number>('all')
  const [doFilter, setDoFilter] = useState<'all' | number>('all')
  const [doSearchText, setDoSearchText] = useState('')
  const [isDoDropdownOpen, setIsDoDropdownOpen] = useState(false)
  const [grapeOptions, setGrapeOptions] = useState<GrapeApiItem[]>([])
  const [doOptions, setDoOptions] = useState<DoApiItem[]>([])
  const [wineItems, setWineItems] = useState<WineItem[]>([])
  const [wineListStatus, setWineListStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [wineListError, setWineListError] = useState<string | null>(null)
  const [winePage, setWinePage] = useState(1)
  const [wineLimit, setWineLimit] = useState(20)
  const [wineTotalItems, setWineTotalItems] = useState(0)
  const [wineTotalPages, setWineTotalPages] = useState(0)
  const [wineHasNext, setWineHasNext] = useState(false)
  const [wineHasPrev, setWineHasPrev] = useState(false)
  const doDropdownRef = useRef<HTMLDivElement | null>(null)
  const [grapeBlendRows, setGrapeBlendRows] = useState<GrapeBlendRow[]>([
    { id: 1, grape: 'Tempranillo' },
  ])
  const [awardRows, setAwardRows] = useState<AwardRow[]>([])

  const addGrapeBlendRow = () => {
    setGrapeBlendRows((current) => [
      ...current,
      { id: Date.now(), grape: GRAPE_OPTIONS[0] },
    ])
  }

  const removeGrapeBlendRow = (rowId: number) => {
    setGrapeBlendRows((current) => (current.length > 1 ? current.filter((row) => row.id !== rowId) : current))
  }

  const updateGrapeBlendRow = (rowId: number, patch: Partial<GrapeBlendRow>) => {
    setGrapeBlendRows((current) => current.map((row) => (row.id === rowId ? { ...row, ...patch } : row)))
  }

  const addAwardRow = () => {
    setAwardRows((current) => [
      ...current,
      { id: Date.now(), award: AWARD_OPTIONS[0], score: '', year: '' },
    ])
  }

  const removeAwardRow = (rowId: number) => {
    setAwardRows((current) => current.filter((row) => row.id !== rowId))
  }

  const updateAwardRow = (rowId: number, patch: Partial<AwardRow>) => {
    setAwardRows((current) => current.map((row) => (row.id === rowId ? { ...row, ...patch } : row)))
  }

  const menuItems: Array<{ key: Exclude<MenuKey, 'wineProfile'>; label: string; short: string; icon: string }> = [
    { key: 'dashboard', label: labels.menu.dashboard, short: 'DB', icon: '⌂' },
    { key: 'wines', label: labels.menu.wines, short: 'W', icon: '🍷' },
    { key: 'reviews', label: labels.menu.reviews, short: 'R', icon: '✎' },
    { key: 'admin', label: labels.menu.admin, short: 'A', icon: '⚙' },
    { key: 'apiDocs', label: labels.menu.apiDoc, short: 'API', icon: '🧭' },
  ]

  const countries = useMemo(
    () => ['all', ...WINE_COUNTRY_FILTER_VALUES] as CountryFilterValue[],
    [],
  )

  const grapesByColor = useMemo(() => {
    const reds = grapeOptions
      .filter((grape) => grape.color === 'red')
      .sort((a, b) => a.name.localeCompare(b.name))
    const whites = grapeOptions
      .filter((grape) => grape.color === 'white')
      .sort((a, b) => a.name.localeCompare(b.name))

    return [
      { key: 'red', label: locale === 'ca' ? 'Negres' : 'Tintas', grapes: reds },
      { key: 'white', label: locale === 'ca' ? 'Blanques' : 'Blancas', grapes: whites },
    ]
  }, [grapeOptions, locale])

  const dosByCountry = useMemo(() => {
    if (doCountryFilter === 'all') {
      return [] as DoApiItem[]
    }

    return doOptions
      .filter((item) => item.country === doCountryFilter)
      .sort((a, b) => {
        const byRegion = a.region.localeCompare(b.region)
        if (byRegion !== 0) return byRegion
        return a.name.localeCompare(b.name)
      })
  }, [doCountryFilter, doOptions])

  const filteredDosBySearch = useMemo(() => {
    const query = normalizeSearchText(doSearchText)
    if (query === '') {
      return dosByCountry
    }

    return dosByCountry.filter((item) => {
      const name = normalizeSearchText(item.name)
      const region = normalizeSearchText(item.region)
      return name.includes(query) || region.includes(query)
    })
  }, [doSearchText, dosByCountry])

  const selectedDoOption = useMemo(
    () => (doFilter === 'all' ? null : doOptions.find((item) => item.id === doFilter) ?? null),
    [doFilter, doOptions],
  )
  const selectedDoCommunityFlagPath = selectedDoOption ? autonomousCommunityFlagPathForRegion(selectedDoOption.region) : null

  const metrics = useMemo(
    () => ({
      totalWines: mockWines.length,
      totalReviews: 124,
      myReviews: mockReviews.length,
      averageRed: averageScore(mockWines, 'red'),
      averageWhite: averageScore(mockWines, 'white'),
    }),
    [],
  )

  const dashboardAnalytics = useMemo(() => {
    const scoredWines = mockWines.filter((wine) => wine.averageScore != null)
    const scoreValues = scoredWines.map((wine) => wine.averageScore as number)
    const scoreMedian = median(scoreValues)
    const scoreStdDev = standardDeviation(scoreValues)
    const sortedByScore = [...scoredWines].sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0))
    const topWines = sortedByScore.slice(0, 3)
    const lowWines = [...sortedByScore].slice(-3).reverse()
    const highScoreCount = scoredWines.filter((wine) => (wine.averageScore ?? 0) >= 80).length
    const lowScoreCount = scoredWines.filter((wine) => (wine.averageScore ?? 0) < 65).length
    const scoreSpread = scoredWines.length > 0
      ? Math.max(...scoredWines.map((wine) => wine.averageScore ?? 0)) - Math.min(...scoredWines.map((wine) => wine.averageScore ?? 0))
      : 0
    const averagePrice = mockWines.reduce((sum, wine) => sum + wine.pricePaid, 0) / mockWines.length
    const minPrice = Math.min(...mockWines.map((wine) => wine.pricePaid))
    const maxPrice = Math.max(...mockWines.map((wine) => wine.pricePaid))
    const maxScore = Math.max(...scoreValues)
    const minScore = Math.min(...scoreValues)
    const approvedCount = scoredWines.filter((wine) => (wine.averageScore ?? 0) >= 70).length
    const approvedRate = scoredWines.length ? (approvedCount / scoredWines.length) * 100 : 0
    const qualityIndex = averagePrice > 0 ? ((metrics.averageRed + metrics.averageWhite) / 2) / averagePrice : 0

    const timelineLocale = locale === 'ca' ? 'ca-ES' : 'es-ES'
    const randTimeline = createSeededRandom(dashboardSeed + 17)
    const randCompare = createSeededRandom(dashboardSeed + 311)
    const monthFormatter = new Intl.DateTimeFormat(timelineLocale, { month: 'short', year: '2-digit' })
    const now = new Date()
    let previousReviews = 2 + Math.floor(randTimeline() * 3)
    let previousMedian = 74 + (randTimeline() * 6)
    const reviewTimeline = Array.from({ length: 60 }, (_, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (59 - index), 1)
      const reviewsDelta = Math.floor((randTimeline() * 5) - 2) // -2..2
      const reviewsNoise = randTimeline() < 0.15 ? Math.floor(randTimeline() * 3) : 0
      const reviews = Math.max(0, Math.min(8, previousReviews + reviewsDelta + reviewsNoise))
      const medianDelta = ((randTimeline() * 3.2) - 1.6)
      const median = Math.max(68, Math.min(94, previousMedian + medianDelta))
      previousReviews = reviews
      previousMedian = median
      return {
        label: monthFormatter.format(monthDate).replace('.', ''),
        reviews,
        median: Math.round(median * 10) / 10,
      }
    })

    const compareLabels = locale === 'ca'
      ? ['Gen', 'Feb', 'Mar', 'Abr', 'Mai', 'Jun']
      : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
    let previousWeb = 16 + Math.floor(randCompare() * 10)
    let previousMine = 2 + Math.floor(randCompare() * 3)
    const webVsMyTimeline = compareLabels.map((label) => {
      const web = Math.max(8, Math.min(36, previousWeb + Math.floor((randCompare() * 9) - 4)))
      const mine = Math.max(1, Math.min(9, previousMine + Math.floor((randCompare() * 5) - 2)))
      previousWeb = web
      previousMine = mine
      return { label, web, mine }
    })
    const rollingAverage10 = scoredWines.map((_, index) => {
      const start = Math.max(0, index - 9)
      const slice = scoredWines.slice(start, index + 1)
      const avg = slice.reduce((sum, row) => sum + (row.averageScore ?? 0), 0) / slice.length
      return { index: index + 1, avg: Math.round(avg * 10) / 10 }
    })

    const scoreBuckets = [
      { label: '<60', count: scoredWines.filter((wine) => (wine.averageScore ?? 0) < 60).length },
      { label: '60-69', count: scoredWines.filter((wine) => (wine.averageScore ?? 0) >= 60 && (wine.averageScore ?? 0) < 70).length },
      { label: '70-79', count: scoredWines.filter((wine) => (wine.averageScore ?? 0) >= 70 && (wine.averageScore ?? 0) < 80).length },
      { label: '80-89', count: scoredWines.filter((wine) => (wine.averageScore ?? 0) >= 80 && (wine.averageScore ?? 0) < 90).length },
      { label: '90+', count: scoredWines.filter((wine) => (wine.averageScore ?? 0) >= 90).length },
    ]

    const byType = (['red', 'white', 'rose', 'sparkling'] as WineType[]).map((type) => {
      const wines = scoredWines.filter((wine) => wine.type === type)
      const avg = wines.length ? wines.reduce((sum, wine) => sum + (wine.averageScore ?? 0), 0) / wines.length : 0
      return { type, count: wines.length, avg }
    })

    const awards = mockWines.map((wine) => ({
      hasAward: wine.id % 5 !== 0,
      awardName: wine.id % 2 === 0 ? 'decanter' : 'penin',
    }))
    const awardsWith = awards.filter((entry) => entry.hasAward).length
    const awardsWithout = awards.length - awardsWith
    const awardTypes = [
      { label: 'Decanter', count: awards.filter((entry) => entry.hasAward && entry.awardName === 'decanter').length },
      { label: 'Peñín', count: awards.filter((entry) => entry.hasAward && entry.awardName === 'penin').length },
    ]

    const valueRows = scoredWines
      .map((wine) => ({
        ...wine,
        valueIndex: wine.pricePaid > 0 ? ((wine.averageScore ?? 0) / wine.pricePaid) : 0,
      }))
      .sort((a, b) => b.valueIndex - a.valueIndex)
    const topValueWines = valueRows.slice(0, 10)
    const underTenWines = scoredWines.filter((wine) => wine.pricePaid < 10)
    const underTenWithGreatScore = underTenWines.filter((wine) => (wine.averageScore ?? 0) >= 80)
    const underTenGreatPct = underTenWines.length ? (underTenWithGreatScore.length / underTenWines.length) * 100 : 0
    const scoreBands = [
      { label: '50-59', min: 50, max: 60 },
      { label: '60-69', min: 60, max: 70 },
      { label: '70-79', min: 70, max: 80 },
      { label: '80-89', min: 80, max: 90 },
      { label: '90+', min: 90, max: 101 },
    ].map((band) => {
      const wines = scoredWines.filter((wine) => (wine.averageScore ?? 0) >= band.min && (wine.averageScore ?? 0) < band.max)
      const avgBandPrice = wines.length ? wines.reduce((sum, wine) => sum + wine.pricePaid, 0) / wines.length : 0
      return { label: band.label, avgPrice: avgBandPrice, count: wines.length }
    })

    const byVintageMap = new Map<number, WineItem[]>()
    scoredWines.forEach((wine) => {
      if (wine.vintageYear == null) return
      const current = byVintageMap.get(wine.vintageYear) ?? []
      current.push(wine)
      byVintageMap.set(wine.vintageYear, current)
    })
    const byVintage = [...byVintageMap.entries()]
      .map(([year, wines]) => ({
        year,
        avgScore: wines.reduce((sum, wine) => sum + (wine.averageScore ?? 0), 0) / wines.length,
        count: wines.length,
      }))
      .sort((a, b) => a.year - b.year)
    const bestVintage = [...byVintage].sort((a, b) => b.avgScore - a.avgScore)[0] ?? null
    const oldVintageScores = scoredWines.filter((wine) => (wine.vintageYear ?? 9999) <= 2018).map((wine) => wine.averageScore ?? 0)
    const recentVintageScores = scoredWines.filter((wine) => (wine.vintageYear ?? 0) >= 2019).map((wine) => wine.averageScore ?? 0)
    const oldVsRecent = {
      oldAvg: oldVintageScores.length ? oldVintageScores.reduce((sum, value) => sum + value, 0) / oldVintageScores.length : 0,
      recentAvg: recentVintageScores.length ? recentVintageScores.reduce((sum, value) => sum + value, 0) / recentVintageScores.length : 0,
    }

    const byDo = [...new Set(scoredWines.map((wine) => wine.region))].map((region) => {
      const wines = scoredWines.filter((wine) => wine.region === region)
      const avgScore = wines.reduce((sum, wine) => sum + (wine.averageScore ?? 0), 0) / wines.length
      const avgPrice = wines.reduce((sum, wine) => sum + wine.pricePaid, 0) / wines.length
      const consistency = standardDeviation(wines.map((wine) => wine.averageScore ?? 0))
      const bestWine = [...wines].sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0))[0]
      const bestValue = [...wines]
        .map((wine) => ({
          name: wine.name,
          valueIndex: (wine.averageScore ?? 0) / Math.max(0.01, wine.pricePaid),
        }))
        .sort((a, b) => b.valueIndex - a.valueIndex)[0]
      return {
        region,
        count: wines.length,
        avgScore,
        avgPrice,
        consistency,
        bestWine: bestWine?.name ?? '-',
        bestValue: bestValue?.valueIndex ?? 0,
      }
    })
    const doRanking = [...byDo].sort((a, b) => b.avgScore - a.avgScore)
    const doMostConsistent = [...byDo].filter((entry) => entry.count > 1).sort((a, b) => a.consistency - b.consistency)[0] ?? null

    const priceVsScore = scoredWines.map((wine) => ({ price: wine.pricePaid, score: wine.averageScore ?? 0, name: wine.name }))
    const regression = linearRegression(priceVsScore.map((point) => ({ x: point.price, y: point.score })))
    const regressionLine = [
      { price: minPrice, score: (regression.slope * minPrice) + regression.intercept },
      { price: maxPrice, score: (regression.slope * maxPrice) + regression.intercept },
    ]
    const sweetSpotPrice = topValueWines.length
      ? median(topValueWines.map((wine) => wine.pricePaid))
      : averagePrice

    const coupleRows = journalWineRows
      .map((row) => {
        const maria = parseJournalScore(row.maria)
        const adria = parseJournalScore(row.adria)
        if (maria == null || adria == null) {
          return null
        }
        return {
          wine: row.wine,
          region: row.region,
          maria,
          adria,
          diff: Math.abs(maria - adria),
        }
      })
      .filter((row): row is { wine: string; region: string; maria: number; adria: number; diff: number } => row !== null)
    const mariaAvg = coupleRows.length ? coupleRows.reduce((sum, row) => sum + row.maria, 0) / coupleRows.length : 0
    const adriaAvg = coupleRows.length ? coupleRows.reduce((sum, row) => sum + row.adria, 0) / coupleRows.length : 0
    const disagreementCount = coupleRows.filter((row) => row.diff > 2).length
    const disagreementPct = coupleRows.length ? (disagreementCount / coupleRows.length) * 100 : 0
    const avgDifference = coupleRows.length ? coupleRows.reduce((sum, row) => sum + row.diff, 0) / coupleRows.length : 0
    const syncIndex = Math.max(0, 100 - (avgDifference * 20) - disagreementPct)
    const coupleScatter = coupleRows.map((row) => ({ x: row.maria, y: row.adria, wine: row.wine }))
    const disagreementByDo = [...new Set(coupleRows.map((row) => row.region))].map((region) => {
      const rows = coupleRows.filter((row) => row.region === region)
      const avgDiff = rows.reduce((sum, row) => sum + row.diff, 0) / rows.length
      return { region, avgDiff, count: rows.length }
    }).sort((a, b) => b.avgDiff - a.avgDiff)

    const placeRows = scoredWines.map((wine) => ({
      ...wine,
      placeType: wine.winery.toLowerCase().includes('casa') ? 'supermarket' : 'restaurant',
    }))
    const supermarketRows = placeRows.filter((row) => row.placeType === 'supermarket')
    const restaurantRows = placeRows.filter((row) => row.placeType === 'restaurant')
    const placeComparison = {
      supermarketAvgScore: supermarketRows.length ? supermarketRows.reduce((sum, row) => sum + (row.averageScore ?? 0), 0) / supermarketRows.length : 0,
      restaurantAvgScore: restaurantRows.length ? restaurantRows.reduce((sum, row) => sum + (row.averageScore ?? 0), 0) / restaurantRows.length : 0,
      supermarketAvgPrice: supermarketRows.length ? supermarketRows.reduce((sum, row) => sum + row.pricePaid, 0) / supermarketRows.length : 0,
      restaurantAvgPrice: restaurantRows.length ? restaurantRows.reduce((sum, row) => sum + row.pricePaid, 0) / restaurantRows.length : 0,
    }

    return {
      topWines,
      lowWines,
      highScoreCount,
      lowScoreCount,
      scoreMedian,
      scoreStdDev,
      approvedRate,
      maxScore,
      minScore,
      scoreSpread,
      averagePrice,
      minPrice,
      maxPrice,
      qualityIndex,
      reviewTimeline,
      webVsMyTimeline,
      rollingAverage10,
      scoreBuckets,
      byType,
      awardsWith,
      awardsWithout,
      awardTypes,
      topValueWines,
      underTenGreatPct,
      underTenGreatCount: underTenWithGreatScore.length,
      scoreBands,
      byVintage,
      bestVintage,
      oldVsRecent,
      doRanking,
      doMostConsistent,
      priceVsScore,
      regressionLine,
      regressionSlope: regression.slope,
      sweetSpotPrice,
      mariaAvg,
      adriaAvg,
      avgDifference,
      disagreementPct,
      syncIndex,
      coupleScatter,
      disagreementByDo,
      placeComparison,
    }
  }, [dashboardSeed, locale, metrics.averageRed, metrics.averageWhite])

  const priceFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'ca' ? 'ca-ES' : 'es-ES', { style: 'currency', currency: 'EUR' }),
    [locale],
  )

  const menuTitle = {
    dashboard: labels.topbar.overview,
    wines: labels.topbar.wines,
    wineCreate: locale === 'ca' ? 'Crear vi' : 'Crear vino',
    wineEdit: locale === 'ca' ? 'Editar vi' : 'Editar vino',
    reviews: labels.topbar.reviews,
    reviewCreate: locale === 'ca' ? 'Crear ressenya' : 'Crear reseña',
    reviewEdit: locale === 'ca' ? 'Editar ressenya' : 'Editar reseña',
    admin: labels.topbar.admin,
    apiDocs: labels.topbar.apiDoc,
    settings: locale === 'ca' ? 'Configuració' : 'Configuración',
    wineProfile: selectedWineSheet ? `${t('wineProfile.pageTitle')} · ${selectedWineSheet.name}` : t('wineProfile.pageTitle'),
  }[menu]

  const wineTypeLabel = (type: WineType) => {
    const localized = labels.wineType[type]
    if (typeof localized === 'string' && localized.trim() !== '') {
      return localized
    }

    if (type === 'sweet') return locale === 'ca' ? 'Dolç' : 'Dulce'
    if (type === 'fortified') return locale === 'ca' ? 'Fortificat' : 'Fortificado'
    return type
  }
  const galleryLabels = labels.wineProfile.imageLabels
  const isDarkMode = themeMode === 'dark'
  const brandWordmarkSrc = isDarkMode ? 'images/brand/logo-wordmark-dark.png' : 'images/brand/logo-wordmark-light.png'
  const themeToggleLabel = isDarkMode ? labels.common.themeSwitchToLight : labels.common.themeSwitchToDark
  const displayedUser = currentUser ?? mockUser

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
    document.documentElement.style.colorScheme = themeMode
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
  }, [themeMode])

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  useEffect(() => {
    if (!showMobileMenu) {
      return
    }

    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
    }
  }, [showMobileMenu])

  useEffect(() => {
    if (!selectedWineGallery) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedWineGallery(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedWineGallery])

  useEffect(() => {
    const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
    const fallbackBase = window.location.port.startsWith('517') ? 'http://localhost:8080' : window.location.origin
    const apiBaseUrl = configuredBase && configuredBase.length > 0 ? configuredBase : fallbackBase
    const controller = new AbortController()
    setAuthBootstrapped(false)

    fetch(`${apiBaseUrl}/api/auth/me`, {
      signal: controller.signal,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(async (response) => {
        if (response.status === 401) {
          setLoggedIn(false)
          setCurrentUser(null)
          return
        }
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const payload = await response.json() as AuthApiResponse
        setCurrentUser({
          id: payload.user.id,
          email: payload.user.email,
          name: payload.user.name,
          lastname: payload.user.lastname,
        })
        setLoggedIn(true)
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return
        }
        setLoggedIn(false)
        setCurrentUser(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setAuthBootstrapped(true)
        }
      })

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (menu !== 'apiDocs') {
      return
    }

    const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
    const fallbackBase = window.location.port.startsWith('517') ? 'http://localhost:8080' : window.location.origin
    const apiBaseUrl = configuredBase && configuredBase.length > 0 ? configuredBase : fallbackBase
    const requestUrl = `${apiBaseUrl}/guide.md`
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => {
      controller.abort('timeout')
    }, 12_000)

    setApiGuideUrl(requestUrl)
    setApiGuideStatus('loading')
    setApiGuideError(null)

    fetch(requestUrl, {
      signal: controller.signal,
      credentials: 'include',
      headers: {
        Accept: 'text/markdown',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for ${requestUrl}`)
        }

        const markdown = await response.text()
        setApiGuideMarkdown(markdown)
        setApiGuideStatus('ready')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted && controller.signal.reason !== 'timeout') {
          return
        }

        const message = error instanceof Error ? error.message : 'Unknown error'
        setApiGuideStatus('error')
        setApiGuideError(message)
      })
      .finally(() => {
        window.clearTimeout(timeoutId)
      })

    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [menu, apiGuideReloadToken])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchText(searchText.trim())
    }, 260)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [searchText])

  useEffect(() => {
    if (menu !== 'wines') {
      return
    }

    if (grapeOptions.length > 0) {
      return
    }

    const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
    const fallbackBase = window.location.port.startsWith('517') ? 'http://localhost:8080' : window.location.origin
    const apiBaseUrl = configuredBase && configuredBase.length > 0 ? configuredBase : fallbackBase
    const controller = new AbortController()

    fetch(`${apiBaseUrl}/api/grapes`, {
      signal: controller.signal,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const payload = await response.json() as GrapeApiResponse
        setGrapeOptions(payload.items)
      })
      .catch(() => {
      })

    return () => {
      controller.abort()
    }
  }, [menu, grapeOptions.length])

  useEffect(() => {
    if (menu !== 'wines') {
      return
    }

    if (doOptions.length > 0) {
      return
    }

    const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
    const fallbackBase = window.location.port.startsWith('517') ? 'http://localhost:8080' : window.location.origin
    const apiBaseUrl = configuredBase && configuredBase.length > 0 ? configuredBase : fallbackBase
    const controller = new AbortController()

    fetch(`${apiBaseUrl}/api/dos`, {
      signal: controller.signal,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const payload = await response.json() as DoApiResponse
        setDoOptions(payload.items)
      })
      .catch(() => {
      })

    return () => {
      controller.abort()
    }
  }, [menu, doOptions.length])

  useEffect(() => {
    if (doCountryFilter === 'all') {
      if (doFilter !== 'all') {
        setDoFilter('all')
      }
      if (isDoDropdownOpen) {
        setIsDoDropdownOpen(false)
      }
      return
    }

    if (doFilter === 'all') {
      return
    }

    const existsForCountry = doOptions.some((item) => item.id === doFilter && item.country === doCountryFilter)
    if (!existsForCountry) {
      setDoFilter('all')
    }
  }, [doCountryFilter, doFilter, doOptions, isDoDropdownOpen])

  useEffect(() => {
    if (!isDoDropdownOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!doDropdownRef.current) {
        return
      }
      if (event.target instanceof Node && !doDropdownRef.current.contains(event.target)) {
        setIsDoDropdownOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDoDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isDoDropdownOpen])

  useEffect(() => {
    if (menu !== 'wines') {
      return
    }

    const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
    const fallbackBase = window.location.port.startsWith('517') ? 'http://localhost:8080' : window.location.origin
    const apiBaseUrl = configuredBase && configuredBase.length > 0 ? configuredBase : fallbackBase
    const params = new URLSearchParams()
    params.set('page', String(winePage))
    params.set('limit', String(wineLimit))
    if (debouncedSearchText !== '') {
      params.set('search', debouncedSearchText)
    }
    if (wineCountryFilter !== 'all') {
      params.set('country', wineCountryFilter)
    }
    if (typeFilter !== 'all') {
      params.set('wine_type', typeFilter)
    }
    if (minScoreFilter !== 'all') {
      params.set('score_min', String(minScoreFilter))
    }
    if (grapeFilter !== 'all') {
      params.set('grape_id', String(grapeFilter))
    }
    if (doFilter !== 'all') {
      params.set('do_id', String(doFilter))
    }

    const controller = new AbortController()
    setWineListStatus('loading')
    setWineListError(null)

    fetch(`${apiBaseUrl}/api/wines?${params.toString()}`, {
      signal: controller.signal,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const payload = await response.json() as WineListApiResponse
        const mappedItems = payload.items.map((item) => ({
          id: item.id,
          name: item.name,
          winery: item.winery ?? '-',
          type: item.wine_type ?? 'red',
          country: countryCodeToLabel(item.country, locale),
          region: item.do?.name ?? '-',
          vintageYear: item.vintage_year,
          // List endpoint does not expose price in current API contract.
          pricePaid: 0,
          averageScore: item.avg_score == null ? null : Math.round(item.avg_score * 10) / 10,
        }))

        setWineItems(mappedItems)
        setWinePage(payload.pagination.page)
        setWineLimit(payload.pagination.limit)
        setWineTotalItems(payload.pagination.total_items)
        setWineTotalPages(payload.pagination.total_pages)
        setWineHasNext(payload.pagination.has_next)
        setWineHasPrev(payload.pagination.has_prev)
        setWineListStatus('ready')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }

        setWineListStatus('error')
        setWineListError(error instanceof Error ? error.message : 'Unknown error')
      })

    return () => {
      controller.abort()
    }
  }, [menu, debouncedSearchText, wineCountryFilter, typeFilter, minScoreFilter, grapeFilter, doFilter, winePage, wineLimit, locale])

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (email.trim() === '' || password.trim() === '') {
      setLoginError(labels.login.requiredError)
      return
    }

    setLoginError(null)
    setLoginSubmitting(true)

    const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
    const fallbackBase = window.location.port.startsWith('517') ? 'http://localhost:8080' : window.location.origin
    const apiBaseUrl = configuredBase && configuredBase.length > 0 ? configuredBase : fallbackBase

    fetch(`${apiBaseUrl}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    })
      .then(async (response) => {
        if (response.status === 401) {
          throw new Error(locale === 'ca' ? 'Credencials invàlides.' : 'Credenciales inválidas.')
        }
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const payload = await response.json() as AuthApiResponse
        setCurrentUser({
          id: payload.user.id,
          email: payload.user.email,
          name: payload.user.name,
          lastname: payload.user.lastname,
        })
        setLoggedIn(true)
        setMenu('dashboard')
        setShowMobileMenu(false)
      })
      .catch((error: unknown) => {
        setLoggedIn(false)
        setCurrentUser(null)
        setLoginError(error instanceof Error ? error.message : (locale === 'ca' ? 'No s’ha pogut iniciar sessió.' : 'No se pudo iniciar sesión.'))
      })
      .finally(() => {
        setLoginSubmitting(false)
      })
  }

  const handleLogout = () => {
    const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
    const fallbackBase = window.location.port.startsWith('517') ? 'http://localhost:8080' : window.location.origin
    const apiBaseUrl = configuredBase && configuredBase.length > 0 ? configuredBase : fallbackBase

    fetch(`${apiBaseUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    }).finally(() => {
      setLoggedIn(false)
      setCurrentUser(null)
      setShowMobileMenu(false)
      setMenu('dashboard')
    })
  }

  const handleCopyApiCodeBlock = async (rawCode: string, copyKey: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(rawCode)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = rawCode
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'absolute'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }

      setCopiedApiCodeKey(copyKey)
      window.setTimeout(() => {
        setCopiedApiCodeKey((current) => (current === copyKey ? null : current))
      }, 1700)
    } catch {
      setCopiedApiCodeKey(null)
    }
  }

  const toggleTheme = () => {
    setThemeMode((current) => (current === 'light' ? 'dark' : 'light'))
  }

  const toggleLocale = () => {
    setLocale(locale === 'ca' ? 'es' : 'ca')
  }

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed((current) => !current)
  }

  const openWineGallery = (
    wine: WineItem,
    variant: GalleryModalVariant = 'full',
    initialKey: (typeof SAMPLE_WINE_GALLERY)[number]['key'] = 'bottle',
  ) => {
    setSelectedWineGallery(wine)
    setGalleryModalVariant(variant)
    setActiveGalleryImageKey(initialKey)
  }

  const closeWineGallery = () => {
    setSelectedWineGallery(null)
    setGalleryModalVariant('full')
  }

  const openWineSheet = (wine: WineItem) => {
    setSelectedWineSheet(wine)
    setMenu('wineProfile')
  }

  const closeWineSheet = () => {
    setMenu('dashboard')
  }

  const selectedWineProfile = selectedWineSheet
    ? buildMockWineProfile(selectedWineSheet, labels.wineProfile, labels.wineType)
    : null
  const selectedWineDoLogo = selectedWineSheet ? doLogoPathForRegion(selectedWineSheet.region) : null
  const selectedWineCountryFlagPath = selectedWineSheet ? countryFlagPath(selectedWineSheet.country) : null
  const selectedWineCommunity = selectedWineSheet ? spanishAutonomousCommunity(selectedWineSheet.region) : null
  const selectedWineCommunityFlagPath = selectedWineSheet ? autonomousCommunityFlagPathForRegion(selectedWineSheet.region) : null
  const dbCountryFlags = useMemo(
    () => Array.from(new Set(mockWines.map((wine) => wine.country))).map((country) => ({
      country,
      flagPath: countryFlagPath(country),
      flag: countryFlagEmoji(country),
    })),
    [],
  )
  const spainAutonomousCommunities = useMemo(
    () => {
      const map = new Map<string, { name: string; slug: string }>()
      mockWines
        .filter((wine) => wine.country === 'Spain')
        .forEach((wine) => {
          const community = spanishAutonomousCommunity(wine.region)
          if (community) {
            map.set(community.slug, community)
          }
        })
      return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
    },
    [],
  )

  const openDashboardWithWineFilter = (wine: WineItem, target: 'name' | 'type' | 'country' | 'region') => {
    if (target === 'name') {
      setSearchText(wine.name)
    }

    if (target === 'region') {
      setSearchText(wine.region)
    }

    if (target === 'country') {
      setWineCountryFilter(countryLabelToFilterValue(wine.country))
    }

    if (target === 'type') {
      setTypeFilter(wine.type)
    }

    setMenu('dashboard')
    setShowMobileMenu(false)
  }

  const openReviewCreate = () => {
    setSelectedReviewForEdit(null)
    setMenu('reviewCreate')
    setShowMobileMenu(false)
  }

  const openReviewEdit = (review: ReviewItem) => {
    setSelectedReviewForEdit(review)
    setMenu('reviewEdit')
    setShowMobileMenu(false)
  }

  const reviewEditorPreset = buildReviewFormPreset(selectedReviewForEdit)
  const createReviewPreset = buildReviewFormPreset(null)

  const openWineCreate = () => {
    setSelectedWineForEdit(null)
    setGrapeBlendRows([{ id: 1, grape: 'Tempranillo' }])
    setAwardRows([])
    setMenu('wineCreate')
    setShowMobileMenu(false)
  }

  const openWineEdit = (wine: WineItem) => {
    setSelectedWineForEdit(wine)
    setGrapeBlendRows(
      wine.type === 'white'
        ? [{ id: 1, grape: 'Macabeu' }]
        : [{ id: 1, grape: 'Tempranillo' }],
    )
    setAwardRows(
      wine.id % 5 === 0
        ? []
        : [{
            id: 1,
            award: wine.id % 2 === 0 ? 'decanter' : 'penin',
            score: String(Math.min(99, Math.max(80, Math.round((wine.averageScore ?? 84) + 10)))),
            year: String((wine.vintageYear ?? 2024) + 2),
          }],
    )
    setMenu('wineEdit')
    setShowMobileMenu(false)
  }

  const renderReviewEditor = (mode: 'create' | 'edit', preset: ReviewFormPreset) => (
    <section className="screen-grid">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{labels.reviews.create.eyebrow}</p>
            <h3>{mode === 'create' ? (locale === 'ca' ? 'Crear ressenya' : 'Crear reseña') : (locale === 'ca' ? 'Editar ressenya' : 'Editar reseña')}</h3>
          </div>
          <button type="button" className="ghost-button small" onClick={() => setMenu('reviews')}>
            {locale === 'ca' ? 'Tornar al llistat' : 'Volver al listado'}
          </button>
        </div>

        <form
          key={`${mode}-${selectedReviewForEdit?.id ?? 'new'}`}
          className="stack-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <label>
            {labels.reviews.create.wine}
            <select defaultValue={preset.wineId}>
              <option value="" disabled>{labels.reviews.create.selectWine}</option>
              {mockWines.map((wine) => (
                <option key={wine.id} value={wine.id}>{wine.name} · {wine.winery}</option>
              ))}
            </select>
          </label>

          <label>
            {locale === 'ca' ? 'Data de la cata' : 'Fecha de la cata'}
            <input type="date" defaultValue={preset.tastingDate} />
          </label>

          <fieldset className="form-block">
            <legend>{locale === 'ca' ? 'Valoració del Vi' : 'Valoración del Vino'}</legend>
            <label className="important-rating-field">
              <span>{locale === 'ca' ? 'Valoració General (0-100)' : 'Valoración General (0-100)'}</span>
              <select defaultValue={String(preset.overallScore)}>
                {SCORE_OPTIONS_0_TO_100.map((score) => (
                  <option key={score} value={score}>{score}</option>
                ))}
              </select>
            </label>
            <div className="inline-grid triple">
              <label>
                {locale === 'ca' ? 'Aroma' : 'Aroma'}
                <select defaultValue={String(preset.aroma)}>
                  {SCORE_OPTIONS_0_TO_10.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
              <label>
                {locale === 'ca' ? 'Dolçor' : 'Dulzor'}
                <select defaultValue={String(preset.sweetness)}>
                  {SCORE_OPTIONS_0_TO_10.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
              <label>
                {locale === 'ca' ? 'Acidesa' : 'Acidez'}
                <select defaultValue={String(preset.acidity)}>
                  {SCORE_OPTIONS_0_TO_10.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="inline-grid triple">
              <label>
                {locale === 'ca' ? 'Taní' : 'Tanino'}
                <select defaultValue={String(preset.tannin)}>
                  {SCORE_OPTIONS_0_TO_10.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
              <label>
                {locale === 'ca' ? 'Cos' : 'Cuerpo'}
                <select defaultValue={String(preset.body)}>
                  {SCORE_OPTIONS_0_TO_10.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
              <label>
                {locale === 'ca' ? 'Persistència' : 'Persistencia'}
                <select defaultValue={String(preset.persistence)}>
                  {SCORE_OPTIONS_0_TO_10.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="field-stack">
              <span className="field-label">{locale === 'ca' ? 'Tags de tast' : 'Tags de cata'}</span>
              <div className="tag-checkbox-grid">
                {REVIEW_TAG_OPTIONS.map((tag) => (
                  <label key={tag} className="tag-checkbox-item">
                    <input type="checkbox" defaultChecked={preset.tags.includes(tag)} />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          <label>
            {labels.reviews.create.notes}
            <textarea rows={4} placeholder={labels.reviews.create.notesPlaceholder} defaultValue={preset.notes} />
          </label>

          <button type="submit" className="primary-button">
            {mode === 'create'
              ? labels.reviews.create.submit
              : (locale === 'ca' ? 'Desar canvis de la ressenya' : 'Guardar cambios de la reseña')}
          </button>
        </form>
      </section>
    </section>
  )

  if (!authBootstrapped) {
    return (
      <main className="login-shell">
        <section className="login-stage">
          <section className="login-panel">
            <p className="muted">{locale === 'ca' ? 'Comprovant sessió...' : 'Comprobando sesión...'}</p>
          </section>
        </section>
      </main>
    )
  }

  if (!loggedIn) {
    return (
      <main className="login-shell">
        <section className="login-stage">
          <section className="login-panel" aria-labelledby="login-title">
            <div className="login-header">
              <div className="login-header-top">
                <div>
                  <img
                    src={brandWordmarkSrc}
                    className="brand-logo brand-logo-login"
                    alt="Vins Tat & Rosset"
                  />
                  <p className="eyebrow login-app-title" id="login-title">{labels.common.appName}</p>
                </div>
                <div className="header-controls">
                  <button
                    type="button"
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-pressed={isDarkMode}
                    aria-label={themeToggleLabel}
                    title={themeToggleLabel}
                  >
                    <span aria-hidden="true">{isDarkMode ? '☾' : '☀'}</span>
                    <span>{isDarkMode ? labels.common.themeDark : labels.common.themeLight}</span>
                  </button>
                  <LanguageSelector compact />
                </div>
              </div>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <label>
                {labels.login.email}
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                {labels.login.password}
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>

              {loginError ? (
                <p className="error-message" role="alert">
                  {loginError}
                </p>
              ) : null}

              <button type="submit" className="primary-button" disabled={loginSubmitting}>
                {loginSubmitting ? (locale === 'ca' ? 'Entrant...' : 'Entrando...') : labels.login.submit}
              </button>
            </form>
          </section>
        </section>
      </main>
    )
  }

  return (
    <main className={`dashboard-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside
        id="sidebar"
        className={`sidebar ${showMobileMenu ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}
        aria-label="Backoffice navigation"
      >
        <div className="sidebar-header">
          <img src="images/brand/icon-square-64.png" className="brand-mark" alt="Tat & Rosset icon" />
          <div className="sidebar-brand-copy">
            <img src={brandWordmarkSrc} className="brand-logo brand-logo-sidebar" alt="Vins Tat & Rosset" />
            <p className="eyebrow">{labels.common.appName}</p>
            <h1>{labels.user.backoffice}</h1>
          </div>
          <button
            type="button"
            className="sidebar-collapse-button"
            onClick={toggleSidebarCollapsed}
            aria-pressed={isSidebarCollapsed}
            aria-label={isSidebarCollapsed ? labels.common.expandSidebar : labels.common.collapseSidebar}
            title={isSidebarCollapsed ? labels.common.expandSidebar : labels.common.collapseSidebar}
          >
            <span aria-hidden="true">{isSidebarCollapsed ? '»' : '«'}</span>
          </button>
        </div>

        <div className="sidebar-language">
          <LanguageSelector />
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`nav-item ${menu === item.key ? 'active' : ''}`}
              data-tooltip={item.label}
              title={isSidebarCollapsed ? item.label : undefined}
              onClick={() => {
                setMenu(item.key)
                setShowMobileMenu(false)
              }}
            >
              <span className="nav-badge" aria-hidden="true">
                {item.icon}
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <section
          className="sidebar-user"
          aria-label="User information"
          title={isSidebarCollapsed ? `${displayedUser.name} ${displayedUser.lastname}` : undefined}
        >
          <div className="avatar">{displayedUser.name[0]}</div>
          <div className="user-meta">
            <p className="user-name">{displayedUser.name} {displayedUser.lastname}</p>
            <p className="user-role">{labels.user.role}</p>
            <p className="user-email">{displayedUser.email}</p>
          </div>
          <button
            type="button"
            className={`secondary-button full ${isSidebarCollapsed ? 'icon-only' : ''}`}
            onClick={handleLogout}
            title={isSidebarCollapsed ? labels.common.logout : undefined}
            aria-label={labels.common.logout}
          >
            {isSidebarCollapsed ? '⎋' : labels.common.logout}
          </button>
        </section>
      </aside>

      {showMobileMenu ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setShowMobileMenu(false)}
        />
      ) : null}

      <section className="dashboard-content">
        <header className="topbar">
          <div className="topbar-mobile-head" aria-label="Backoffice header">
            <div className="topbar-mobile-brand">
              <img src={brandWordmarkSrc} className="topbar-mobile-wordmark" alt="Vins Tat & Rosset" />
            </div>

            <div className="topbar-mobile-actions">
              <button
                type="button"
                className="topbar-mobile-bullet topbar-mobile-bullet-language"
                onClick={toggleLocale}
                aria-label={`Idioma: ${locale.toUpperCase()}`}
                title={`Idioma: ${locale.toUpperCase()}`}
              >
                <span>{locale.toUpperCase()}</span>
              </button>

              <button
                type="button"
                className="topbar-mobile-bullet"
                onClick={() => {
                  setMenu('admin')
                  setShowMobileMenu(false)
                }}
                aria-label={labels.menu.admin}
                title={labels.menu.admin}
              >
                <span className="topbar-mobile-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" role="presentation">
                    <path
                      d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4.5 16.5a5.5 5.5 0 0 1 11 0"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              <button
                type="button"
                className="topbar-mobile-bullet"
                onClick={() => {
                  setMenu('settings')
                  setShowMobileMenu(false)
                }}
                aria-label={locale === 'ca' ? 'Configuració' : 'Configuración'}
                title={locale === 'ca' ? 'Configuració' : 'Configuración'}
              >
                <span className="topbar-mobile-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" role="presentation">
                    <path
                      d="M8.8 2.9h2.4l.38 1.62c.33.11.65.24.95.4l1.5-.7 1.7 1.7-.7 1.5c.16.3.29.62.4.95l1.62.38v2.4l-1.62.38c-.11.33-.24.65-.4.95l.7 1.5-1.7 1.7-1.5-.7c-.3.16-.62.29-.95.4l-.38 1.62H8.8l-.38-1.62a6.03 6.03 0 0 1-.95-.4l-1.5.7-1.7-1.7.7-1.5a6.03 6.03 0 0 1-.4-.95l-1.62-.38v-2.4l1.62-.38c.11-.33.24-.65.4-.95l-.7-1.5 1.7-1.7 1.5.7c.3-.16.62-.29.95-.4L8.8 2.9Z"
                      stroke="currentColor"
                      strokeWidth="1.1"
                      strokeLinejoin="round"
                    />
                    <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setShowMobileMenu((current) => !current)}
            aria-expanded={showMobileMenu}
            aria-controls="sidebar"
          >
            {labels.common.menu}
          </button>

          <div className="topbar-copy">
            <p className="eyebrow">{labels.topbar.mockDashboard}</p>
            <h2>{menuTitle}</h2>
          </div>

          <div className="topbar-controls">
            <button
              type="button"
              className="theme-toggle compact"
              onClick={toggleTheme}
              aria-pressed={isDarkMode}
              aria-label={themeToggleLabel}
              title={themeToggleLabel}
            >
              <span aria-hidden="true">{isDarkMode ? '☾' : '☀'}</span>
              <span>{isDarkMode ? labels.common.themeDark : labels.common.themeLight}</span>
            </button>
            <div className="topbar-language">
              <LanguageSelector compact />
            </div>
          </div>
        </header>

        {menu === 'dashboard' ? (
          <section className="screen-grid">
            <div className="stat-grid">
              <article className="stat-card">
                <p>{labels.dashboard.metrics.totalWines}</p>
                <strong>{metrics.totalWines}</strong>
                <span>{labels.dashboard.metrics.catalogHint}</span>
              </article>
              <article className="stat-card">
                <p>{labels.dashboard.metrics.totalReviews}</p>
                <strong>{metrics.totalReviews}</strong>
                <span>{labels.dashboard.metrics.globalReviewsHint}</span>
              </article>
              <article className="stat-card">
                <p>{labels.dashboard.metrics.myReviews}</p>
                <strong>{metrics.myReviews}</strong>
                <span>{labels.dashboard.metrics.myReviewsHint}</span>
              </article>
              <article className="stat-card accent">
                <p>{labels.dashboard.metrics.avgRed}</p>
                <strong>{metrics.averageRed.toFixed(1)}</strong>
                <span>{labels.dashboard.metrics.avgRedHint}</span>
              </article>
              <article className="stat-card accent">
                <p>{labels.dashboard.metrics.avgWhite}</p>
                <strong>{metrics.averageWhite.toFixed(1)}</strong>
                <span>{labels.dashboard.metrics.avgWhiteHint}</span>
              </article>
            </div>

            <section className="dashboard-rich-grid">
              <section className="panel dashboard-hero-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{locale === 'ca' ? 'ACTIVITAT' : 'ACTIVIDAD'}</p>
                    <h3>{locale === 'ca' ? 'Ritme de ressenyes i qualitat' : 'Ritmo de reseñas y calidad'}</h3>
                  </div>
                  <button type="button" className="secondary-button small" onClick={() => setMenu('reviews')}>
                    {locale === 'ca' ? 'Anar a ressenyes' : 'Ir a reseñas'}
                  </button>
                </div>
                <div className="chart-shell chart-shell-tall" aria-label={locale === 'ca' ? 'Gràfica de ritme de ressenyes i puntuació' : 'Gráfica de ritmo de reseñas y puntuación'}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dashboardAnalytics.reviewTimeline} margin={{ top: 8, right: 10, left: -20, bottom: 2 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 120, 110, 0.18)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} minTickGap={18} />
                      <YAxis yAxisId="reviews" tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} width={28} domain={[0, 5]} allowDecimals={false} />
                      <YAxis yAxisId="avg" orientation="right" hide domain={[70, 95]} />
                      <Tooltip
                        cursor={{ fill: 'rgba(143, 56, 81, 0.05)' }}
                        contentStyle={{ borderRadius: 12, border: '1px solid rgba(82,46,28,0.12)', background: 'rgba(255,252,248,0.96)' }}
                      />
                      <Bar yAxisId="reviews" dataKey="reviews" name={locale === 'ca' ? 'Ressenyes' : 'Reseñas'} fill="#c39a7f" radius={[6, 6, 0, 0]} />
                      <Line yAxisId="avg" type="monotone" dataKey="median" name={locale === 'ca' ? 'Mediana score' : 'Mediana score'} stroke="#8f3851" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="dashboard-hero-footnote">
                  <span>{locale === 'ca' ? 'Barra clara: ressenyes' : 'Barra clara: reseñas'}</span>
                  <span>{locale === 'ca' ? 'Línia vi: mediana de score' : 'Línea vino: mediana de score'}</span>
                </div>
              </section>

              <section className="panel dashboard-distribution-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{locale === 'ca' ? 'DISTRIBUCIÓ' : 'DISTRIBUCIÓN'}</p>
                    <h3>{locale === 'ca' ? 'Qualitat del celler' : 'Calidad del catálogo'}</h3>
                  </div>
                </div>
                <div className="bucket-stack">
                  {dashboardAnalytics.scoreBuckets.map((bucket) => {
                    const maxBucket = Math.max(...dashboardAnalytics.scoreBuckets.map((entry) => entry.count), 1)
                    const width = `${(bucket.count / maxBucket) * 100}%`
                    return (
                      <div key={bucket.label} className="bucket-row">
                        <span>{bucket.label}</span>
                        <div className="bucket-track" aria-hidden="true">
                          <div className="bucket-fill" style={{ width }} />
                        </div>
                        <strong>{bucket.count}</strong>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="panel dashboard-frequency-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{locale === 'ca' ? 'FREQÜÈNCIA' : 'FRECUENCIA'}</p>
                    <h3>{locale === 'ca' ? 'Ressenyes web vs meves' : 'Reseñas web vs mías'}</h3>
                  </div>
                </div>
                <div className="chart-shell" aria-label={locale === 'ca' ? 'Comparativa de ressenyes web versus meves' : 'Comparativa de reseñas web versus mías'}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardAnalytics.webVsMyTimeline} margin={{ top: 8, right: 8, left: -20, bottom: 2 }} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 120, 110, 0.16)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip
                        cursor={{ fill: 'rgba(143, 56, 81, 0.05)' }}
                        contentStyle={{ borderRadius: 12, border: '1px solid rgba(82,46,28,0.12)', background: 'rgba(255,252,248,0.96)' }}
                      />
                      <Bar dataKey="web" name={locale === 'ca' ? 'Web' : 'Web'} fill="#c39a7f" radius={[5, 5, 0, 0]} />
                      <Bar dataKey="mine" name={locale === 'ca' ? 'Meves' : 'Mías'} fill="#8f3851" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="dashboard-hero-footnote">
                  <span>{locale === 'ca' ? 'Web (global)' : 'Web (global)'}</span>
                  <span>{locale === 'ca' ? 'Les meves' : 'Las mías'}</span>
                </div>
              </section>

              <section className="panel dashboard-kpi-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{locale === 'ca' ? 'INDICADORS' : 'INDICADORES'}</p>
                    <h3>{locale === 'ca' ? 'Lectura ràpida' : 'Lectura rápida'}</h3>
                  </div>
                </div>
                <div className="dashboard-kpi-list">
                  <article>
                    <span>{locale === 'ca' ? 'Vins >= 80' : 'Vinos >= 80'}</span>
                    <strong>{dashboardAnalytics.highScoreCount}</strong>
                  </article>
                  <article>
                    <span>{locale === 'ca' ? 'Vins < 65' : 'Vinos < 65'}</span>
                    <strong>{dashboardAnalytics.lowScoreCount}</strong>
                  </article>
                  <article>
                    <span>{locale === 'ca' ? 'Dispersió score' : 'Dispersión score'}</span>
                    <strong>{dashboardAnalytics.scoreSpread.toFixed(1)}</strong>
                  </article>
                  <article>
                    <span>{locale === 'ca' ? 'Preu mitjà' : 'Precio medio'}</span>
                    <strong>{priceFormatter.format(dashboardAnalytics.averagePrice)}</strong>
                  </article>
                  <article>
                    <span>{locale === 'ca' ? 'Índex qualitat/preu' : 'Índice calidad/precio'}</span>
                    <strong>{dashboardAnalytics.qualityIndex.toFixed(2)}</strong>
                  </article>
                </div>
              </section>

              <section className="panel dashboard-type-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{locale === 'ca' ? 'PER TIPUS' : 'POR TIPO'}</p>
                    <h3>{locale === 'ca' ? 'Notes mitjanes per tipus de vi' : 'Notas medias por tipo de vino'}</h3>
                  </div>
                </div>
                <div className="type-performance-grid">
                  {dashboardAnalytics.byType.map((row) => (
                    <article key={row.type}>
                      <header>
                        <span>{wineTypeLabel(row.type)}</span>
                        <strong>{row.avg ? row.avg.toFixed(1) : '-'}</strong>
                      </header>
                      <div className="type-performance-track" aria-hidden="true">
                        <div className="type-performance-fill" style={{ width: `${Math.max(6, (row.avg / 100) * 100)}%` }} />
                      </div>
                      <small>{row.count} {locale === 'ca' ? 'vins' : 'vinos'}</small>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel dashboard-awards-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">AWARDS</p>
                    <h3>{locale === 'ca' ? 'Amb premi vs sense premi' : 'Con premio vs sin premio'}</h3>
                  </div>
                </div>
                <div className="awards-split">
                  <div className="awards-donut" aria-hidden="true">
                    <div
                      className="awards-donut-ring"
                      style={{
                        background: `conic-gradient(#8f3851 0 ${(dashboardAnalytics.awardsWith / Math.max(1, mockWines.length)) * 360}deg, rgba(82,46,28,0.12) 0 360deg)`,
                      }}
                    />
                    <div className="awards-donut-center">
                      <strong>{dashboardAnalytics.awardsWith}</strong>
                      <span>{locale === 'ca' ? 'amb premi' : 'con premio'}</span>
                    </div>
                  </div>
                  <div className="awards-breakdown">
                    <div className="awards-breakdown-row">
                      <span>{locale === 'ca' ? 'Amb award' : 'Con award'}</span>
                      <strong>{dashboardAnalytics.awardsWith}</strong>
                    </div>
                    <div className="awards-breakdown-row">
                      <span>{locale === 'ca' ? 'Sense award' : 'Sin award'}</span>
                      <strong>{dashboardAnalytics.awardsWithout}</strong>
                    </div>
                    {dashboardAnalytics.awardTypes.map((award) => (
                      <div key={award.label} className="awards-breakdown-row compact">
                        <span>{award.label}</span>
                        <strong>{award.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="panel dashboard-general-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{locale === 'ca' ? 'GENERALS' : 'GENERALES'}</p>
                    <h3>{locale === 'ca' ? 'Estadístiques base de tast' : 'Estadísticas base de cata'}</h3>
                  </div>
                </div>
                <div className="dashboard-kpi-list">
                  <article>
                    <span>{locale === 'ca' ? 'Mediana puntuació' : 'Mediana puntuación'}</span>
                    <strong>{dashboardAnalytics.scoreMedian.toFixed(1)}</strong>
                  </article>
                  <article>
                    <span>{locale === 'ca' ? 'Desviació estàndard' : 'Desviación estándar'}</span>
                    <strong>{dashboardAnalytics.scoreStdDev.toFixed(2)}</strong>
                  </article>
                  <article>
                    <span>{locale === 'ca' ? 'Aprovats (>7)' : 'Aprobados (>7)'}</span>
                    <strong>{dashboardAnalytics.approvedRate.toFixed(1)}%</strong>
                  </article>
                  <article>
                    <span>{locale === 'ca' ? 'Nota màx / mín' : 'Nota máx / mín'}</span>
                    <strong>{dashboardAnalytics.maxScore.toFixed(1)} · {dashboardAnalytics.minScore.toFixed(1)}</strong>
                  </article>
                  <article>
                    <span>{locale === 'ca' ? 'Rang de preus tastats' : 'Rango de precios catados'}</span>
                    <strong>{priceFormatter.format(dashboardAnalytics.minPrice)} - {priceFormatter.format(dashboardAnalytics.maxPrice)}</strong>
                  </article>
                </div>
              </section>

              <section className="panel dashboard-price-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{locale === 'ca' ? 'PREU VS QUALITAT' : 'PRECIO VS CALIDAD'}</p>
                    <h3>{locale === 'ca' ? 'Relació preu/puntuació' : 'Relación precio/puntuación'}</h3>
                  </div>
                </div>
                <div className="chart-shell" aria-label={locale === 'ca' ? 'Scatter de preu i puntuació' : 'Scatter de precio y puntuación'}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 8, right: 8, left: -20, bottom: 2 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 120, 110, 0.16)" />
                      <XAxis type="number" dataKey="price" name={locale === 'ca' ? 'Preu' : 'Precio'} tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                      <YAxis type="number" dataKey="score" name={locale === 'ca' ? 'Score' : 'Score'} tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ borderRadius: 12, border: '1px solid rgba(82,46,28,0.12)', background: 'rgba(255,252,248,0.96)' }}
                      />
                      <Scatter data={dashboardAnalytics.priceVsScore} fill="#8f3851" />
                      <Scatter data={dashboardAnalytics.regressionLine} fill="transparent" line={{ stroke: '#c39a7f', strokeWidth: 2 }} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="dashboard-hero-footnote">
                  <span>{locale === 'ca' ? 'Pendent regressió' : 'Pendiente regresión'}: {dashboardAnalytics.regressionSlope.toFixed(3)}</span>
                  <span>{locale === 'ca' ? 'Preu dolç estimat' : 'Precio dulce estimado'}: {priceFormatter.format(dashboardAnalytics.sweetSpotPrice)}</span>
                  <span>{locale === 'ca' ? '<10€ amb nota >8' : '<10€ con nota >8'}: {dashboardAnalytics.underTenGreatCount} ({dashboardAnalytics.underTenGreatPct.toFixed(1)}%)</span>
                </div>
                <div className="mini-table">
                  {dashboardAnalytics.topValueWines.slice(0, 5).map((wine) => (
                    <div key={wine.id} className="mini-table-row">
                      <span>{wine.name}</span>
                      <strong>{wine.valueIndex.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
                <div className="mini-table">
                  {dashboardAnalytics.scoreBands.map((band) => (
                    <div key={band.label} className="mini-table-row">
                      <span>{locale === 'ca' ? 'Franja' : 'Franja'} {band.label}</span>
                      <strong>{band.count > 0 ? priceFormatter.format(band.avgPrice) : '-'}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel dashboard-vintage-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{locale === 'ca' ? 'PER ANYADA' : 'POR AÑADA'}</p>
                    <h3>{locale === 'ca' ? 'Evolució per anyada' : 'Evolución por añada'}</h3>
                  </div>
                </div>
                <div className="chart-shell" aria-label={locale === 'ca' ? 'Mitjana per anyada' : 'Media por añada'}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardAnalytics.byVintage} margin={{ top: 8, right: 8, left: -20, bottom: 2 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 120, 110, 0.16)" vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} width={32} />
                      <Tooltip
                        cursor={{ fill: 'rgba(143, 56, 81, 0.05)' }}
                        contentStyle={{ borderRadius: 12, border: '1px solid rgba(82,46,28,0.12)', background: 'rgba(255,252,248,0.96)' }}
                      />
                      <Bar dataKey="avgScore" fill="#8f3851" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="dashboard-hero-footnote">
                  <span>{locale === 'ca' ? 'Millor anyada' : 'Mejor añada'}: {dashboardAnalytics.bestVintage?.year ?? '-'} ({dashboardAnalytics.bestVintage?.avgScore.toFixed(1) ?? '-'})</span>
                  <span>{locale === 'ca' ? 'Antigues (<=2018)' : 'Antiguas (<=2018)'}: {dashboardAnalytics.oldVsRecent.oldAvg.toFixed(1)}</span>
                  <span>{locale === 'ca' ? 'Recents (>=2019)' : 'Recientes (>=2019)'}: {dashboardAnalytics.oldVsRecent.recentAvg.toFixed(1)}</span>
                </div>
              </section>

              <section className="panel dashboard-do-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{locale === 'ca' ? 'PER DO' : 'POR DO'}</p>
                    <h3>{locale === 'ca' ? 'Rànquing de DOs' : 'Ranking de DOs'}</h3>
                  </div>
                </div>
                <div className="mini-table">
                  {dashboardAnalytics.doRanking.slice(0, 6).map((row) => (
                    <div key={row.region} className="mini-table-row">
                      <span>{row.region}</span>
                      <strong>{row.avgScore.toFixed(1)} · {row.bestValue.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
                <div className="dashboard-hero-footnote">
                  <span>{locale === 'ca' ? 'DO més regular' : 'DO más regular'}: {dashboardAnalytics.doMostConsistent?.region ?? '-'}</span>
                  <span>{locale === 'ca' ? 'σ mínim' : 'σ mínimo'}: {dashboardAnalytics.doMostConsistent?.consistency.toFixed(2) ?? '-'}</span>
                </div>
              </section>

              <section className="panel dashboard-couple-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{locale === 'ca' ? 'COMPARATIVA' : 'COMPARATIVA'}</p>
                    <h3>{locale === 'ca' ? 'Maria vs Adrià' : 'Maria vs Adrià'}</h3>
                  </div>
                </div>
                <div className="chart-shell" aria-label={locale === 'ca' ? 'Scatter Maria versus Adrià' : 'Scatter Maria versus Adrià'}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 8, right: 8, left: -20, bottom: 2 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 120, 110, 0.16)" />
                      <XAxis type="number" dataKey="x" name="Maria" domain={[4, 10]} tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                      <YAxis type="number" dataKey="y" name="Adrià" domain={[4, 10]} tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ borderRadius: 12, border: '1px solid rgba(82,46,28,0.12)', background: 'rgba(255,252,248,0.96)' }}
                      />
                      <ReferenceLine segment={[{ x: 4, y: 4 }, { x: 10, y: 10 }]} stroke="#c39a7f" strokeDasharray="4 4" />
                      <Scatter data={dashboardAnalytics.coupleScatter} fill="#8f3851" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="dashboard-kpi-list">
                  <article>
                    <span>{locale === 'ca' ? 'Mitjana Maria' : 'Media Maria'}</span>
                    <strong>{dashboardAnalytics.mariaAvg.toFixed(2)}</strong>
                  </article>
                  <article>
                    <span>{locale === 'ca' ? 'Mitjana Adrià' : 'Media Adrià'}</span>
                    <strong>{dashboardAnalytics.adriaAvg.toFixed(2)}</strong>
                  </article>
                  <article>
                    <span>{locale === 'ca' ? 'Diferència mitjana' : 'Diferencia media'}</span>
                    <strong>{dashboardAnalytics.avgDifference.toFixed(2)}</strong>
                  </article>
                  <article>
                    <span>{locale === 'ca' ? 'Desacords (>2)' : 'Desacuerdos (>2)'}</span>
                    <strong>{dashboardAnalytics.disagreementPct.toFixed(1)}%</strong>
                  </article>
                  <article>
                    <span>{locale === 'ca' ? 'Índex sincronització' : 'Índice sincronización'}</span>
                    <strong>{dashboardAnalytics.syncIndex.toFixed(1)}</strong>
                  </article>
                </div>
                <div className="mini-table">
                  {dashboardAnalytics.disagreementByDo.slice(0, 5).map((row) => (
                    <div key={row.region} className="mini-table-row">
                      <span>{row.region}</span>
                      <strong>{row.avgDiff.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel dashboard-temporal-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{locale === 'ca' ? 'EVOLUCIÓ' : 'EVOLUCIÓN'}</p>
                    <h3>{locale === 'ca' ? 'Rolling average (10 vins)' : 'Rolling average (10 vinos)'}</h3>
                  </div>
                </div>
                <div className="chart-shell" aria-label={locale === 'ca' ? 'Mitjana mòbil de 10 vins' : 'Media móvil de 10 vinos'}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dashboardAnalytics.rollingAverage10} margin={{ top: 8, right: 8, left: -20, bottom: 2 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 120, 110, 0.16)" vertical={false} />
                      <XAxis dataKey="index" tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} width={32} />
                      <Tooltip
                        cursor={{ fill: 'rgba(143, 56, 81, 0.05)' }}
                        contentStyle={{ borderRadius: 12, border: '1px solid rgba(82,46,28,0.12)', background: 'rgba(255,252,248,0.96)' }}
                      />
                      <Line type="monotone" dataKey="avg" stroke="#8f3851" strokeWidth={2.2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="dashboard-hero-footnote">
                  <span>{locale === 'ca' ? 'Restaurant: nota/preu' : 'Restaurante: nota/precio'} {dashboardAnalytics.placeComparison.restaurantAvgScore.toFixed(1)} / {priceFormatter.format(dashboardAnalytics.placeComparison.restaurantAvgPrice)}</span>
                  <span>{locale === 'ca' ? 'Supermercat: nota/preu' : 'Supermercado: nota/precio'} {dashboardAnalytics.placeComparison.supermarketAvgScore.toFixed(1)} / {priceFormatter.format(dashboardAnalytics.placeComparison.supermarketAvgPrice)}</span>
                </div>
              </section>

            </section>
          </section>
        ) : null}

        {menu === 'wines' ? (
          <section className="screen-grid">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{labels.dashboard.search.eyebrow}</p>
                  <h3>{labels.dashboard.search.title}</h3>
                </div>
                <div className="panel-header-actions">
                  <span className="pill">
                    {wineTotalItems} {labels.dashboard.search.results}
                  </span>
                  <button type="button" className="primary-button" onClick={openWineCreate}>
                    {locale === 'ca' ? 'Crear nou vi' : 'Crear nuevo vino'}
                  </button>
                </div>
              </div>

              <div className="filter-grid filter-grid-top">
                <label>
                  {labels.dashboard.search.search}
                  <input
                    type="search"
                    value={searchText}
                    onChange={(event) => {
                      setSearchText(event.target.value)
                      setWinePage(1)
                    }}
                    placeholder={locale === 'ca' ? 'Cerca per nom del vi' : 'Buscar por nombre del vino'}
                  />
                </label>

                <label>
                  {labels.dashboard.search.type}
                  <select
                    value={typeFilter}
                    onChange={(event) => {
                      setTypeFilter(event.target.value as 'all' | WineType)
                      setWinePage(1)
                    }}
                  >
                    <option value="all">{labels.common.allTypes}</option>
                    <option value="red">{labels.wineType.red}</option>
                    <option value="white">{labels.wineType.white}</option>
                    <option value="rose">{labels.wineType.rose}</option>
                    <option value="sparkling">{labels.wineType.sparkling}</option>
                    <option value="sweet">{wineTypeLabel('sweet')}</option>
                    <option value="fortified">{wineTypeLabel('fortified')}</option>
                  </select>
                </label>

                <label>
                  {locale === 'ca' ? 'Varietat de raïm' : 'Variedad de uva'}
                  <select
                    value={grapeFilter === 'all' ? 'all' : String(grapeFilter)}
                    onChange={(event) => {
                      setGrapeFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))
                      setWinePage(1)
                    }}
                  >
                    <option value="all">{locale === 'ca' ? 'Totes les varietats' : 'Todas las variedades'}</option>
                    {grapesByColor.map((group) => (
                      <optgroup key={group.key} label={group.label}>
                        {group.grapes.map((grape) => (
                          <option key={grape.id} value={String(grape.id)}>
                            {grape.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>

                <label>
                  {labels.dashboard.search.minScore}
                  <select
                    value={minScoreFilter === 'all' ? 'all' : String(minScoreFilter)}
                    onChange={(event) => {
                      setMinScoreFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))
                      setWinePage(1)
                    }}
                  >
                    <option value="all">{labels.common.anyScore}</option>
                    <option value="80">80+</option>
                    <option value="85">85+</option>
                    <option value="90">90+</option>
                  </select>
                </label>
              </div>

              <div className="filter-grid">
                <label>
                  {locale === 'ca' ? 'País del vi' : 'País del vino'}
                  <select
                    value={wineCountryFilter}
                    onChange={(event) => {
                      setWineCountryFilter(event.target.value as CountryFilterValue)
                      setWinePage(1)
                    }}
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country === 'all' ? labels.common.allCountries : countryCodeToLabel(country, locale)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  {locale === 'ca' ? 'País D.O.' : 'País D.O.'}
                  <select
                    value={doCountryFilter}
                    onChange={(event) => {
                      setDoCountryFilter(event.target.value as CountryFilterValue)
                      setDoFilter('all')
                      setDoSearchText('')
                      setIsDoDropdownOpen(false)
                      setWinePage(1)
                    }}
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country === 'all' ? labels.common.allCountries : countryCodeToLabel(country, locale)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  {locale === 'ca' ? 'Cerca D.O.' : 'Buscar D.O.'}
                  <input
                    type="search"
                    value={doSearchText}
                    onChange={(event) => {
                      setDoSearchText(event.target.value)
                    }}
                    placeholder={
                      doCountryFilter === 'all'
                        ? (locale === 'ca' ? 'Primer selecciona país' : 'Primero selecciona país')
                        : (locale === 'ca' ? 'Nom o regió de la D.O.' : 'Nombre o región de la D.O.')
                    }
                    disabled={doCountryFilter === 'all'}
                  />
                </label>

                <label>
                  D.O.
                  <div className={`do-combobox${doCountryFilter === 'all' ? ' is-disabled' : ''}`} ref={doDropdownRef}>
                    <button
                      type="button"
                      className="do-combobox-trigger"
                      aria-expanded={isDoDropdownOpen}
                      aria-haspopup="listbox"
                      onClick={() => {
                        if (doCountryFilter === 'all') {
                          return
                        }
                        setIsDoDropdownOpen((current) => !current)
                      }}
                      disabled={doCountryFilter === 'all'}
                    >
                      <span className="do-combobox-trigger-main">
                        {selectedDoOption?.country === 'spain' ? (
                          <>
                            {selectedDoCommunityFlagPath ? (
                              <img
                                src={selectedDoCommunityFlagPath}
                                alt=""
                                className="do-combobox-flag"
                                loading="lazy"
                                aria-hidden="true"
                                onError={fallbackToAdminAsset}
                              />
                            ) : (
                              <span className="do-combobox-flag-fallback" aria-hidden="true">🏳️</span>
                            )}
                            <span>{selectedDoOption.name}</span>
                          </>
                        ) : (
                          <span>
                            {selectedDoOption
                              ? `${selectedDoOption.region} · ${selectedDoOption.name}`
                              : (doCountryFilter === 'all'
                                ? (locale === 'ca' ? 'Selecciona país abans' : 'Selecciona país antes')
                                : (locale === 'ca' ? 'Totes les D.O.' : 'Todas las D.O.'))}
                          </span>
                        )}
                      </span>
                      <span className="do-combobox-caret" aria-hidden="true">▾</span>
                    </button>

                    {isDoDropdownOpen && doCountryFilter !== 'all' ? (
                      <div className="do-combobox-menu" role="listbox" aria-label="D.O.">
                        <button
                          type="button"
                          role="option"
                          aria-selected={doFilter === 'all'}
                          className={`do-combobox-option${doFilter === 'all' ? ' is-selected' : ''}`}
                          onClick={() => {
                            setDoFilter('all')
                            setWinePage(1)
                            setIsDoDropdownOpen(false)
                          }}
                        >
                          <span>{locale === 'ca' ? 'Totes les D.O.' : 'Todas las D.O.'}</span>
                        </button>
                        {filteredDosBySearch.map((item) => {
                          const isSpanishDo = item.country === 'spain'
                          const communityFlagPath = isSpanishDo ? autonomousCommunityFlagPathForRegion(item.region) : null
                          return (
                            <button
                              key={item.id}
                              type="button"
                              role="option"
                              aria-selected={doFilter === item.id}
                              className={`do-combobox-option${doFilter === item.id ? ' is-selected' : ''}`}
                              onClick={() => {
                                setDoFilter(item.id)
                                setWinePage(1)
                                setIsDoDropdownOpen(false)
                              }}
                            >
                              {isSpanishDo ? (
                                communityFlagPath ? (
                                  <img
                                    src={communityFlagPath}
                                    alt=""
                                    className="do-combobox-flag"
                                    loading="lazy"
                                    aria-hidden="true"
                                    onError={fallbackToAdminAsset}
                                  />
                                ) : (
                                  <span className="do-combobox-flag-fallback" aria-hidden="true">🏳️</span>
                                )
                              ) : null}
                              <span>{item.country === 'spain' ? item.name : `${item.region} · ${item.name}`}</span>
                            </button>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                </label>

              </div>

              {wineListStatus === 'error' ? (
                <div className="api-doc-state api-doc-state-error">
                  <p>{locale === 'ca' ? 'No s’ha pogut carregar el llistat de vins.' : 'No se pudo cargar el listado de vinos.'}</p>
                  {wineListError ? <p className="api-doc-error-detail">{wineListError}</p> : null}
                </div>
              ) : null}

              <div className="table-wrap">
                <table className="wine-table">
                  <thead>
                    <tr>
                      <th aria-label="Photo" />
                      <th>{labels.dashboard.table.wine}</th>
                      <th>{labels.dashboard.table.type}</th>
                      <th>{labels.dashboard.table.region}</th>
                      <th>{labels.dashboard.table.avg}</th>
                      <th>{locale === 'ca' ? 'Accions' : 'Acciones'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wineItems.map((wine) => (
                      <tr
                        key={wine.id}
                        className="wine-row-clickable"
                        tabIndex={0}
                        onClick={() => openWineSheet(wine)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            openWineSheet(wine)
                          }
                        }}
                      >
                        <td className="wine-thumb-cell">
                          <img
                            src={SAMPLE_WINE_THUMBNAIL_SRC}
                            alt={`${wine.name} thumbnail`}
                            className="wine-thumb"
                            loading="lazy"
                            onError={fallbackToDefaultWineIcon}
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation()
                              openWineGallery(wine, 'full', 'bottle')
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                event.stopPropagation()
                                openWineGallery(wine, 'full', 'bottle')
                              }
                            }}
                          />
                        </td>
                        <td className="wine-col-main" data-label={labels.dashboard.table.wine}>
                          <strong>{wine.name}</strong>
                          <span>{wine.winery}</span>
                        </td>
                        <td className="wine-col-type" data-label={labels.dashboard.table.type}>{wineTypeLabel(wine.type)}</td>
                        <td className="wine-col-region" data-label={labels.dashboard.table.region}>{wine.country} · {wine.region}</td>
                        <td className="wine-col-score" data-label={labels.dashboard.table.avg}>{wine.averageScore ?? '-'}</td>
                        <td className="wine-col-actions" data-label={locale === 'ca' ? 'Accions' : 'Acciones'}>
                          <button
                            type="button"
                            className="secondary-button small"
                            onClick={(event) => {
                              event.stopPropagation()
                              openWineEdit(wine)
                            }}
                          >
                            {locale === 'ca' ? 'Editar vi' : 'Editar vino'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {wineListStatus === 'loading' ? (
                      <tr>
                        <td colSpan={6}>{locale === 'ca' ? 'Carregant vins...' : 'Cargando vinos...'}</td>
                      </tr>
                    ) : null}
                    {wineListStatus === 'ready' && wineItems.length === 0 ? (
                      <tr>
                        <td colSpan={6}>{locale === 'ca' ? 'Cap vi trobat.' : 'No se encontraron vinos.'}</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <div className="pagination-bar">
                <div className="pagination-meta">
                  {locale === 'ca'
                    ? `Pàgina ${winePage} de ${wineTotalPages || 1} · Total ${wineTotalItems} · Mostrant ${wineItems.length}`
                    : `Página ${winePage} de ${wineTotalPages || 1} · Total ${wineTotalItems} · Mostrando ${wineItems.length}`}
                </div>
                <div className="pagination-actions">
                  <label className="pagination-limit-inline">
                    <span>{locale === 'ca' ? 'Límit' : 'Límite'}</span>
                    <select
                      value={String(wineLimit)}
                      onChange={(event) => {
                        setWineLimit(Number(event.target.value))
                        setWinePage(1)
                      }}
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    className="secondary-button small"
                    disabled={!wineHasPrev || wineListStatus === 'loading'}
                    onClick={() => setWinePage((current) => Math.max(1, current - 1))}
                  >
                    {locale === 'ca' ? 'Anterior' : 'Anterior'}
                  </button>
                  <button
                    type="button"
                    className="secondary-button small"
                    disabled={!wineHasNext || wineListStatus === 'loading'}
                    onClick={() => setWinePage((current) => current + 1)}
                  >
                    {locale === 'ca' ? 'Següent' : 'Siguiente'}
                  </button>
                </div>
              </div>
            </section>
          </section>
        ) : null}

        {menu === 'wineCreate' || menu === 'wineEdit' ? (
          <section className="screen-grid">
            <section className="panel">
              <div className="panel-header wine-create-header">
                <div>
                  <p className="eyebrow">{labels.wines.add.eyebrow}</p>
                  <h3>{menu === 'wineEdit' ? (locale === 'ca' ? 'Editar vi' : 'Editar vino') : labels.wines.add.title}</h3>
                </div>
                <div className="panel-header-actions">
                  <button type="button" className="ghost-button small" onClick={() => setMenu('wines')}>
                    {locale === 'ca' ? 'Tornar al llistat' : 'Volver al listado'}
                  </button>
                </div>
              </div>

              <form className="stack-form wine-create-form" onSubmit={(event) => event.preventDefault()}>
                <fieldset className="form-block">
                  <legend>{locale === 'ca' ? 'Dades bàsiques' : 'Datos básicos'}</legend>
                  <label>
                    {labels.wines.add.name}
                    <input type="text" placeholder="Clos de la Serra" defaultValue={selectedWineForEdit?.name ?? ''} />
                  </label>
                  <div className="inline-grid triple">
                    <label>
                      {labels.wines.add.type}
                      <select defaultValue={selectedWineForEdit?.type ?? 'red'}>
                        <option value="red">{labels.wineType.red}</option>
                        <option value="white">{labels.wineType.white}</option>
                        <option value="rose">{labels.wineType.rose}</option>
                        <option value="sparkling">{labels.wineType.sparkling}</option>
                      </select>
                    </label>
                    <label>
                      {locale === 'ca' ? 'Criança' : 'Crianza'}
                      <select defaultValue="criança">
                        {AGING_OPTIONS.map((aging) => (
                          <option key={aging} value={aging}>{aging}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {labels.wines.add.vintage}
                      <select defaultValue={String(selectedWineForEdit?.vintageYear ?? 2021)}>
                        {VINTAGE_YEAR_OPTIONS.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="inline-grid triple">
                    <label>
                      {locale === 'ca' ? 'Grau alcohòlic (%)' : 'Graduación alcohólica (%)'}
                      <input type="number" min="0" max="20" step="0.1" placeholder="13.5" defaultValue={selectedWineForEdit ? (selectedWineForEdit.type === 'red' ? 14 : 13) : ''} />
                    </label>
                  </div>
                </fieldset>

                <fieldset className="form-block form-block-half">
                  <legend>{locale === 'ca' ? 'Origen i DO' : 'Origen y DO'}</legend>
                  <div className="inline-grid">
                    <label>
                      {labels.wines.add.country}
                      <select defaultValue={selectedWineForEdit?.country ?? 'Spain'}>
                        <option value="Spain">Spain</option>
                        <option value="France">France</option>
                        <option value="Portugal">Portugal</option>
                        <option value="Italy">Italy</option>
                        <option value="Argentina">Argentina</option>
                        <option value="Chile">Chile</option>
                      </select>
                    </label>
                    <label>
                      {labels.wines.add.region}
                      <select defaultValue={selectedWineForEdit?.region ?? 'Priorat'}>
                        {Array.from(new Set(mockWines.map((wine) => wine.region))).sort((a, b) => a.localeCompare(b)).map((region) => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </fieldset>

                <fieldset className="form-block form-block-half">
                  <legend>{locale === 'ca' ? 'Composició i raïm' : 'Composición y uva'}</legend>
                  <div className="grape-blend-head">
                    <span>{locale === 'ca' ? 'Varietat' : 'Variedad'}</span>
                  </div>
                  <div className="grape-blend-list">
                    {grapeBlendRows.map((row) => (
                      <div key={row.id} className="grape-blend-row">
                        <button
                          type="button"
                          className="icon-square-button"
                          onClick={() => removeGrapeBlendRow(row.id)}
                          disabled={grapeBlendRows.length === 1}
                          aria-label={locale === 'ca' ? 'Eliminar varietat' : 'Eliminar variedad'}
                          title={locale === 'ca' ? 'Eliminar varietat' : 'Eliminar variedad'}
                        >
                          <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                            <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 7h2v8h-2v-8Zm4 0h2v8h-2v-8ZM7 10h2v8H7v-8Z" fill="currentColor" />
                          </svg>
                        </button>
                        <label className="sr-only" htmlFor={`grape-row-${row.id}`}>{locale === 'ca' ? 'Varietat' : 'Variedad'}</label>
                        <select
                          id={`grape-row-${row.id}`}
                          value={row.grape}
                          onChange={(event) => updateGrapeBlendRow(row.id, { grape: event.target.value })}
                        >
                          {GRAPE_OPTIONS.map((grape) => (
                            <option key={grape} value={grape}>{grape}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="grape-blend-actions">
                    <button type="button" className="secondary-button small" onClick={addGrapeBlendRow}>
                      {locale === 'ca' ? 'Afegir varietat' : 'Añadir variedad'}
                    </button>
                  </div>
                </fieldset>

                <fieldset className="form-block">
                  <legend>{locale === 'ca' ? 'Compra i lloc de la cata' : 'Compra y lugar de la cata'}</legend>
                  <div className="inline-grid triple">
                    <label>
                      {locale === 'ca' ? 'Tipus de lloc' : 'Tipo de lugar'}
                      <select defaultValue="restaurant">
                        {PLACE_TYPE_OPTIONS.map((placeType) => (
                          <option key={placeType} value={placeType}>{placeType}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {labels.wines.add.place}
                      <input type="text" placeholder="Celler del Centre" defaultValue={selectedWineForEdit?.winery ?? ''} />
                    </label>
                    <label>
                      {labels.wines.add.price}
                      <input type="number" min="0" step="0.01" placeholder="18.50" defaultValue={selectedWineForEdit?.pricePaid ?? ''} />
                    </label>
                  </div>
                  <div className="inline-grid">
                    <label>
                      {locale === 'ca' ? 'Data de la cata' : 'Fecha de la cata'}
                      <input type="date" defaultValue="2026-02-27" />
                    </label>
                  </div>
                  <div className="inline-grid">
                    <label>
                      {locale === 'ca' ? 'Adreça del lloc' : 'Dirección del lugar'}
                      <input type="text" placeholder="Carrer Major 12" />
                    </label>
                    <label>
                      {locale === 'ca' ? 'Ciutat' : 'Ciudad'}
                      <input type="text" placeholder="Barcelona" />
                    </label>
                  </div>
                </fieldset>

                <fieldset className="form-block">
                  <legend>{locale === 'ca' ? 'Media i premis' : 'Media y premios'}</legend>
                  <div className="inline-grid triple">
                    <label>
                      {locale === 'ca' ? 'Foto ampolla' : 'Foto botella'}
                      <input type="file" accept="image/*" />
                    </label>
                    <label>
                      {locale === 'ca' ? 'Foto etiqueta davant' : 'Foto etiqueta frontal'}
                      <input type="file" accept="image/*" />
                    </label>
                    <label>
                      {locale === 'ca' ? 'Foto etiqueta darrere' : 'Foto etiqueta trasera'}
                      <input type="file" accept="image/*" />
                    </label>
                  </div>
                  <div className="award-rows-scroll">
                    <div className="award-rows-head">
                      <span>{locale === 'ca' ? 'Premi' : 'Premio'}</span>
                      <span>{locale === 'ca' ? 'Puntuació' : 'Puntuación'}</span>
                      <span>{locale === 'ca' ? 'Any' : 'Año'}</span>
                      <span aria-hidden="true" />
                    </div>
                    <div className="award-rows-list">
                      {awardRows.map((row) => (
                        <div key={row.id} className="award-row">
                        <label className="sr-only" htmlFor={`award-name-${row.id}`}>{locale === 'ca' ? 'Premi' : 'Premio'}</label>
                        <select
                          id={`award-name-${row.id}`}
                          value={row.award}
                          onChange={(event) => updateAwardRow(row.id, { award: event.target.value })}
                        >
                          {AWARD_OPTIONS.map((award) => (
                            <option key={award} value={award}>{award}</option>
                          ))}
                        </select>
                        <label className="sr-only" htmlFor={`award-score-${row.id}`}>{locale === 'ca' ? 'Puntuació' : 'Puntuación'}</label>
                        <input
                          id={`award-score-${row.id}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="92.0"
                          value={row.score}
                          onChange={(event) => updateAwardRow(row.id, { score: event.target.value })}
                        />
                        <label className="sr-only" htmlFor={`award-year-${row.id}`}>{locale === 'ca' ? 'Any' : 'Año'}</label>
                        <input
                          id={`award-year-${row.id}`}
                          type="number"
                          min="1900"
                          max="2030"
                          placeholder="2024"
                          value={row.year}
                          onChange={(event) => updateAwardRow(row.id, { year: event.target.value })}
                        />
                        <button
                          type="button"
                          className="icon-square-button"
                          onClick={() => removeAwardRow(row.id)}
                          aria-label={locale === 'ca' ? 'Eliminar premi' : 'Eliminar premio'}
                          title={locale === 'ca' ? 'Eliminar premi' : 'Eliminar premio'}
                        >
                          <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                            <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 7h2v8h-2v-8Zm4 0h2v8h-2v-8ZM7 10h2v8H7v-8Z" fill="currentColor" />
                          </svg>
                        </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="award-rows-actions">
                    <button type="button" className="secondary-button small" onClick={addAwardRow}>
                      {locale === 'ca' ? 'Afegir premi' : 'Añadir premio'}
                    </button>
                  </div>
                </fieldset>

                <button type="submit" className="primary-button">
                  {menu === 'wineEdit' ? (locale === 'ca' ? 'Desar canvis del vi' : 'Guardar cambios del vino') : labels.wines.add.submit}
                </button>
              </form>
            </section>
          </section>
        ) : null}

        {menu === 'reviews' ? (
          <section className="screen-grid">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{labels.reviews.edit.title}</p>
                  <h3>{locale === 'ca' ? 'Llistat de ressenyes' : 'Listado de reseñas'}</h3>
                </div>
                <div className="panel-header-actions">
                  <span className="pill">{mockReviews.length} {labels.reviews.edit.countSuffix}</span>
                  <button type="button" className="primary-button" onClick={openReviewCreate}>
                    {locale === 'ca' ? 'Crear ressenya' : 'Crear reseña'}
                  </button>
                </div>
              </div>

              <div className="list-stack">
                {mockReviews.map((review) => (
                  <article key={review.id} className="review-card">
                    <div className="review-card-header">
                      <div>
                        <h4>{review.wineName}</h4>
                        <p>{review.createdAt}</p>
                      </div>
                      <span className="score-pill">{review.score}</span>
                    </div>
                    <p>{review.notes}</p>
                    <div className="review-actions">
                      <button type="button" className="secondary-button small" onClick={() => openReviewEdit(review)}>
                        {labels.reviews.edit.editAction}
                      </button>
                      <button type="button" className="ghost-button small">{labels.reviews.edit.viewWineAction}</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>
        ) : null}

        {menu === 'reviewCreate' ? renderReviewEditor('create', createReviewPreset) : null}

        {menu === 'reviewEdit' ? renderReviewEditor('edit', reviewEditorPreset) : null}

        {menu === 'admin' ? (
          <section className="screen-grid two-columns">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{labels.admin.shortcuts.eyebrow}</p>
                  <h3>{labels.admin.shortcuts.title}</h3>
                </div>
              </div>
              <div className="list-stack">
                {labels.admin.shortcuts.items.map((item: { title: string; description: string; action: string }) => (
                  <article key={item.title} className="list-card">
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                    <button type="button" className="secondary-button small">{item.action}</button>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{labels.admin.account.eyebrow}</p>
                  <h3>{labels.admin.account.title}</h3>
                </div>
              </div>

              <dl className="detail-grid">
                <div>
                  <dt>{labels.admin.account.labels.name}</dt>
                  <dd>{displayedUser.name} {displayedUser.lastname}</dd>
                </div>
                <div>
                  <dt>{labels.admin.account.labels.email}</dt>
                  <dd>{displayedUser.email}</dd>
                </div>
                <div>
                  <dt>{labels.admin.account.labels.role}</dt>
                  <dd>{labels.user.role}</dd>
                </div>
                <div>
                  <dt>{labels.admin.account.labels.myReviews}</dt>
                  <dd>{mockReviews.length}</dd>
                </div>
                <div>
                  <dt>{labels.admin.account.labels.favoriteStyle}</dt>
                  <dd>{labels.admin.account.values.favoriteStyle}</dd>
                </div>
                <div>
                  <dt>{labels.admin.account.labels.lastLogin}</dt>
                  <dd>{labels.admin.account.values.lastLogin}</dd>
                </div>
              </dl>
            </section>
          </section>
        ) : null}

        {menu === 'apiDocs' ? (
          <section className="screen-grid">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{labels.apiDoc.eyebrow}</p>
                  <h3>{labels.apiDoc.title}</h3>
                </div>
                <div className="panel-header-actions">
                  <button
                    type="button"
                    className="secondary-button small"
                    onClick={() => {
                      setApiGuideMarkdown('')
                      setApiGuideError(null)
                      setApiGuideReloadToken((current) => current + 1)
                    }}
                  >
                    {labels.apiDoc.refresh}
                  </button>
                </div>
              </div>

              <p className="muted">{labels.apiDoc.description}</p>

              {apiGuideStatus === 'loading' ? (
                <div className="api-doc-state">{labels.apiDoc.loading}</div>
              ) : null}

              {apiGuideStatus === 'error' ? (
                <div className="api-doc-state api-doc-state-error">
                  <p>{labels.apiDoc.error}</p>
                  {apiGuideUrl ? <p className="api-doc-error-detail">{apiGuideUrl}</p> : null}
                  {apiGuideError ? <p className="api-doc-error-detail">{apiGuideError}</p> : null}
                </div>
              ) : null}

              {apiGuideStatus === 'ready' ? (
                <article className="api-doc-viewer">
                  <div className="api-doc-markdown">
                    <ReactMarkdown
                      components={{
                        code(componentProps) {
                          const { inline, className, children, ...props } = componentProps as {
                            inline?: boolean
                            className?: string
                            children?: ReactNode
                          } & Record<string, unknown>
                          const rawCode = String(children).replace(/\n$/, '')
                          if (inline) {
                            return (
                              <code className={className} {...(props as HTMLAttributes<HTMLElement>)}>
                                {children}
                              </code>
                            )
                          }

                          const language = className?.replace('language-', '').trim().toLowerCase() || ''
                          if (language !== 'bash' && language !== 'json') {
                            return (
                              <code className={className} {...(props as HTMLAttributes<HTMLElement>)}>
                                {children}
                              </code>
                            )
                          }

                          const copyKey = `${language}:${rawCode.slice(0, 90)}`
                          let highlightedCode: string
                          try {
                            highlightedCode = hljs.highlight(rawCode, { language, ignoreIllegals: true }).value
                          } catch {
                            highlightedCode = escapeHtml(rawCode)
                          }

                          return (
                            <div className="api-doc-code-block">
                              <div className="api-doc-code-header">
                                <span className="api-doc-code-lang">{language}</span>
                                <button
                                  type="button"
                                  className="api-doc-code-copy"
                                  onClick={() => {
                                    void handleCopyApiCodeBlock(rawCode, copyKey)
                                  }}
                                >
                                  {copiedApiCodeKey === copyKey ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                              <pre>
                                <code
                                  className="hljs"
                                  // Trusted source: internal API guide markdown.
                                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                                />
                              </pre>
                            </div>
                          )
                        },
                      }}
                    >
                      {apiGuideMarkdown}
                    </ReactMarkdown>
                  </div>
                </article>
              ) : null}
            </section>
          </section>
        ) : null}

        {menu === 'settings' ? (
          <section className="screen-grid two-columns">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{locale === 'ca' ? 'PREFERÈNCIES' : 'PREFERENCIAS'}</p>
                  <h3>{locale === 'ca' ? 'Configuració del backoffice (mock)' : 'Configuración del backoffice (mock)'}</h3>
                </div>
                <span className="pill muted">{locale === 'ca' ? 'Mock' : 'Mock'}</span>
              </div>

              <form className="stack-form settings-form" onSubmit={(event) => event.preventDefault()}>
                <label>
                  {locale === 'ca' ? 'Llengua' : 'Idioma'}
                  <div className="settings-segmented" role="group" aria-label={locale === 'ca' ? 'Llengua' : 'Idioma'}>
                    <button
                      type="button"
                      className={`settings-chip${locale === 'ca' ? ' active' : ''}`}
                      onClick={() => setLocale('ca')}
                    >
                      CA
                    </button>
                    <button
                      type="button"
                      className={`settings-chip${locale === 'es' ? ' active' : ''}`}
                      onClick={() => setLocale('es')}
                    >
                      ES
                    </button>
                  </div>
                </label>

                <label>
                  {locale === 'ca' ? 'Tema' : 'Tema'}
                  <div className="settings-segmented" role="group" aria-label={locale === 'ca' ? 'Tema' : 'Tema'}>
                    <button
                      type="button"
                      className={`settings-chip${themeMode === 'light' ? ' active' : ''}`}
                      onClick={() => setThemeMode('light')}
                    >
                      {locale === 'ca' ? 'Clar' : 'Claro'}
                    </button>
                    <button
                      type="button"
                      className={`settings-chip${themeMode === 'dark' ? ' active' : ''}`}
                      onClick={() => setThemeMode('dark')}
                    >
                      {locale === 'ca' ? 'Fosc' : 'Oscuro'}
                    </button>
                  </div>
                </label>

                <label>
                  {locale === 'ca' ? 'Ordenació per defecte (llistat de vins)' : 'Ordenación por defecto (listado de vinos)'}
                  <select
                    value={defaultSortPreference}
                    onChange={(event) => setDefaultSortPreference(event.target.value as 'score_desc' | 'recent' | 'price_asc')}
                  >
                    <option value="score_desc">{locale === 'ca' ? 'Puntuació (més alta primer)' : 'Puntuación (más alta primero)'}</option>
                    <option value="recent">{locale === 'ca' ? 'Afegits recentment' : 'Añadidos recientemente'}</option>
                    <option value="price_asc">{locale === 'ca' ? 'Preu (més baix primer)' : 'Precio (más bajo primero)'}</option>
                  </select>
                </label>

                <label>
                  {locale === 'ca' ? 'Pantalla inicial per defecte' : 'Pantalla inicial por defecto'}
                  <select
                    value={defaultLandingPage}
                    onChange={(event) => setDefaultLandingPage(event.target.value as 'dashboard' | 'wines' | 'reviews')}
                  >
                    <option value="dashboard">{labels.menu.dashboard}</option>
                    <option value="wines">{labels.menu.wines}</option>
                    <option value="reviews">{labels.menu.reviews}</option>
                  </select>
                </label>
              </form>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{locale === 'ca' ? 'EXPERIÈNCIA' : 'EXPERIENCIA'}</p>
                  <h3>{locale === 'ca' ? 'Preferències extra (mock)' : 'Preferencias extra (mock)'}</h3>
                </div>
              </div>

              <div className="list-stack">
                <article className="list-card settings-toggle-row">
                  <div>
                    <h4>{locale === 'ca' ? 'Filtrar Espanya per defecte' : 'Filtrar España por defecto'}</h4>
                    <p>{locale === 'ca' ? 'Aplica el filtre de país “Espanya” quan obres el cercador.' : 'Aplica el filtro de país “España” al abrir el buscador.'}</p>
                  </div>
                  <button
                    type="button"
                    className={`settings-chip compact${showOnlySpainByDefault ? ' active' : ''}`}
                    onClick={() => setShowOnlySpainByDefault((current) => !current)}
                    aria-pressed={showOnlySpainByDefault}
                  >
                    {showOnlySpainByDefault ? (locale === 'ca' ? 'Activat' : 'Activo') : (locale === 'ca' ? 'Desactivat' : 'Inactivo')}
                  </button>
                </article>

                <article className="list-card settings-toggle-row">
                  <div>
                    <h4>{locale === 'ca' ? 'Targetes compactes' : 'Tarjetas compactas'}</h4>
                    <p>{locale === 'ca' ? 'Mock d’un mode amb menys espai vertical per les llistes.' : 'Mock de un modo con menos espacio vertical para listas.'}</p>
                  </div>
                  <button
                    type="button"
                    className={`settings-chip compact${compactCardsPreference ? ' active' : ''}`}
                    onClick={() => setCompactCardsPreference((current) => !current)}
                    aria-pressed={compactCardsPreference}
                  >
                    {compactCardsPreference ? (locale === 'ca' ? 'Sí' : 'Sí') : 'No'}
                  </button>
                </article>

                <article className="list-card">
                  <div>
                    <h4>{locale === 'ca' ? 'Properes idees (mock)' : 'Próximas ideas (mock)'}</h4>
                    <p>
                      {locale === 'ca'
                        ? 'Notificacions de noves ressenyes, exportació CSV i preferència de decimals a la puntuació.'
                        : 'Notificaciones de nuevas reseñas, exportación CSV y preferencia de decimales en la puntuación.'}
                    </p>
                  </div>
                  <button type="button" className="ghost-button small" disabled>
                    {locale === 'ca' ? 'Aviat' : 'Pronto'}
                  </button>
                </article>
              </div>

            </section>
          </section>
        ) : null}

        {menu === 'wineProfile' && selectedWineSheet && selectedWineProfile ? (
          <section className="wine-profile-screen">
            <header className="panel wine-profile-header-panel">
              <div className="wine-profile-header-main">
                <div className="wine-profile-title-wrap">
                  <p className="eyebrow">{selectedWineProfile.headline}</p>
                  <h3>{selectedWineSheet.name}</h3>
                  <p className="muted wine-profile-origin-line">
                    <span className="wine-profile-flag-badge" aria-label={selectedWineSheet.country} title={selectedWineSheet.country}>
                      {selectedWineCountryFlagPath ? <img className="wine-profile-flag-image" src={selectedWineCountryFlagPath} alt={localizedCountryName(selectedWineSheet.country, locale)} loading="lazy" /> : countryFlagEmoji(selectedWineSheet.country)}
                    </span>
                    {selectedWineCommunityFlagPath && selectedWineCommunity ? (
                      <span className="wine-profile-flag-badge" aria-label={`Comunidad autonoma ${selectedWineCommunity.name}`} title={selectedWineCommunity.name}>
                        <img className="wine-profile-flag-image" src={selectedWineCommunityFlagPath} alt={selectedWineCommunity.name} loading="lazy" />
                      </span>
                    ) : null}
                    {selectedWineDoLogo ? (
                      <span className="wine-profile-do-tooltip">
                        <img className="wine-profile-do-logo" src={selectedWineDoLogo} alt={`${selectedWineSheet.region} DO`} loading="lazy" />
                        <span className="wine-profile-do-tooltip-panel" role="tooltip" aria-hidden="true">
                          <img src={selectedWineDoLogo} alt="" loading="lazy" />
                          <span>{selectedWineSheet.region}</span>
                        </span>
                      </span>
                    ) : null}
                    <span>{selectedWineSheet.winery} · {selectedWineSheet.region}</span>
                  </p>
                </div>
                <div className="wine-profile-award-box" aria-label="Award">
                  <span className="wine-profile-award-icon" aria-hidden="true">🏆</span>
                  {selectedWineProfile.heroAward ? (
                    <div className="wine-profile-award-content">
                      <strong>{selectedWineProfile.heroAward.label}</strong>
                      <span>{selectedWineProfile.heroAward.year}</span>
                    </div>
                  ) : (
                    <div className="wine-profile-award-content">
                      <strong>-</strong>
                    </div>
                  )}
                </div>
                <div className={`wine-profile-medal-score${medalToneFromScore(selectedWineProfile.heroAwardScore) ? ` ${medalToneFromScore(selectedWineProfile.heroAwardScore)}` : ''}`}>
                  <span className="wine-profile-medal-score-label">{t('wineProfile.statAvgScore')}</span>
                  <strong>{selectedWineProfile.heroAwardScore?.toFixed(1) ?? '-'}</strong>
                </div>
              </div>
              <div className="wine-profile-header-actions">
                <button type="button" className="ghost-button" onClick={closeWineSheet}>
                  {t('wineProfile.backToDashboard')}
                </button>
                <button type="button" className="secondary-button">
                  {t('wineProfile.editWineMock')}
                </button>
              </div>
            </header>

            <section className="wine-profile-main-grid">
              <section className="panel wine-profile-photos-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{t('wineProfile.photosEyebrow')}</p>
                    <h3>{t('wineProfile.photoRecordPreview')}</h3>
                  </div>
                  <span className="pill">{SAMPLE_WINE_GALLERY.length} {t('wineProfile.filesSuffix')}</span>
                </div>
                <div className="wine-sheet-thumbnail-row">
                  {SAMPLE_WINE_GALLERY.map((image) => (
                    <button
                      key={image.key}
                      type="button"
                      className="wine-sheet-mini-photo"
                      onClick={() => openWineGallery(selectedWineSheet, 'compact', image.key)}
                      title={`${galleryLabels[image.key]} · ${t('wineProfile.closeGalleryAria')}`}
                    >
                      <img src={image.src} alt={`${selectedWineSheet.name} ${galleryLabels[image.key]}`} onError={fallbackToDefaultWineIcon} />
                      <span>{galleryLabels[image.key]}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="panel wine-profile-summary-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{t('wineProfile.summaryEyebrow')}</p>
                    <h3>{t('wineProfile.operationalProfile')}</h3>
                  </div>
                </div>

                <p className="wine-sheet-description">{selectedWineProfile.summary}</p>

                <div className="wine-sheet-chip-row">
                  {selectedWineProfile.tags.map((tag: string) => (
                    <span key={tag} className="pill">{tag}</span>
                  ))}
                </div>

                <div className="wine-profile-filter-links" aria-label={t('wineProfile.filtersAria')}>
                  <button
                    type="button"
                    className="filter-link-button"
                    onClick={() => openDashboardWithWineFilter(selectedWineSheet, 'name')}
                  >
                    {t('wineProfile.filterWine')}: {selectedWineSheet.name}
                  </button>
                  <button
                    type="button"
                    className="filter-link-button"
                    onClick={() => openDashboardWithWineFilter(selectedWineSheet, 'type')}
                  >
                    {t('wineProfile.filterType')}: {wineTypeLabel(selectedWineSheet.type)}
                  </button>
                  <button
                    type="button"
                    className="filter-link-button"
                    onClick={() => openDashboardWithWineFilter(selectedWineSheet, 'country')}
                  >
                    {t('wineProfile.filterCountry')}: {selectedWineSheet.country}
                  </button>
                  <button
                    type="button"
                    className="filter-link-button"
                    onClick={() => openDashboardWithWineFilter(selectedWineSheet, 'region')}
                  >
                    {t('wineProfile.filterRegion')}: {selectedWineSheet.region}
                  </button>
                </div>

                <div className="wine-profile-origin-strip" aria-label="Countries and Spain autonomous communities">
                  {selectedWineDoLogo ? (
                    <div className="wine-profile-origin-row">
                      <span className="wine-profile-do-chip">
                        <span className="wine-profile-flag-badge" aria-label={selectedWineSheet.country} title={selectedWineSheet.country}>
                          {selectedWineCountryFlagPath ? <img className="wine-profile-flag-image" src={selectedWineCountryFlagPath} alt={localizedCountryName(selectedWineSheet.country, locale)} loading="lazy" /> : countryFlagEmoji(selectedWineSheet.country)}
                        </span>
                        {selectedWineCommunityFlagPath && selectedWineCommunity ? (
                          <span className="wine-profile-flag-badge" aria-label={`Comunidad autonoma ${selectedWineCommunity.name}`} title={selectedWineCommunity.name}>
                            <img className="wine-profile-flag-image" src={selectedWineCommunityFlagPath} alt={selectedWineCommunity.name} loading="lazy" />
                          </span>
                        ) : null}
                        <span className="wine-profile-do-tooltip">
                          <img className="wine-profile-do-logo" src={selectedWineDoLogo} alt={`${selectedWineSheet.region} DO`} loading="lazy" />
                          <span className="wine-profile-do-tooltip-panel" role="tooltip" aria-hidden="true">
                            <img src={selectedWineDoLogo} alt="" loading="lazy" />
                            <span>{selectedWineSheet.region}</span>
                          </span>
                        </span>
                        <span>{selectedWineSheet.region}</span>
                      </span>
                    </div>
                  ) : null}
                  <div className="wine-profile-origin-row">
                    {dbCountryFlags.map(({ country, flag, flagPath }) => (
                      <span key={country} className="wine-profile-country-flag" title={country} aria-label={country}>
                        {flagPath ? <img className="wine-profile-flag-image" src={flagPath} alt={localizedCountryName(country, locale)} loading="lazy" /> : flag}
                      </span>
                    ))}
                  </div>
                  {dbCountryFlags.some((entry) => entry.country === 'Spain') ? (
                    <div className="wine-profile-origin-row wine-profile-spain-communities">
                      {spainAutonomousCommunities.map((community) => (
                        <span key={community.slug} className="wine-profile-community-pill">
                          <span className="wine-profile-flag-badge" aria-hidden="true">
                            <img className="wine-profile-flag-image" src={`/images/flags/ccaa/${community.slug}.png`} alt={community.name} loading="lazy" />
                          </span>
                          <span>{community.name}</span>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="wine-profile-stat-strip">
                  <article>
                    <span>{t('wineProfile.statAvgScore')}</span>
                    <strong>{selectedWineSheet.averageScore ?? '-'}</strong>
                  </article>
                  <article>
                    <span>{t('wineProfile.statPricePaid')}</span>
                    <strong>{priceFormatter.format(selectedWineSheet.pricePaid)}</strong>
                  </article>
                  <article>
                    <span>{t('wineProfile.statVintage')}</span>
                    <strong>{selectedWineSheet.vintageYear ?? '-'}</strong>
                  </article>
                </div>

                <div className="wine-sheet-note-card">
                  <p className="eyebrow">{t('wineProfile.pairingEyebrow')}</p>
                  <p>{selectedWineProfile.pairing.join(' · ')}</p>
                  <p className="muted">{selectedWineProfile.servingNotes}</p>
                </div>
              </section>
            </section>

            <section className="wine-sheet-sections wine-profile-sections">
              {selectedWineProfile.sections.map((section) => (
                <section key={section.title} className="wine-sheet-card">
                  <h4>
                    <span className="wine-sheet-section-icon" aria-hidden="true">{section.icon}</span>
                    <span>{section.title}</span>
                  </h4>
                  <dl className="wine-sheet-kv">
                    {section.fields.map((field) => (
                      <div key={`${section.title}-${field.label}`}>
                        <dt>{field.label}</dt>
                        <dd>{field.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </section>
          </section>
        ) : null}
      </section>

      <nav className="mobile-bottom-nav" aria-label="App navigation">
        {menuItems.map((item) => (
          <button
            key={`mobile-nav-${item.key}`}
            type="button"
            className={`mobile-bottom-nav-item${menu === item.key ? ' active' : ''}`}
            onClick={() => {
              setMenu(item.key)
              setShowMobileMenu(false)
            }}
            aria-pressed={menu === item.key}
            title={item.label}
          >
            <span className="mobile-bottom-nav-icon" aria-hidden="true">{item.icon}</span>
            <span className="mobile-bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {selectedWineGallery ? (
        <div className="modal-backdrop" role="presentation" onClick={closeWineGallery}>
          <section
            className={`image-modal ${galleryModalVariant === 'compact' ? 'compact' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wine-gallery-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="image-modal-header">
              <div>
                <p className="eyebrow">{t('wineProfile.galleryEyebrow')}</p>
                <h3 id="wine-gallery-title">{selectedWineGallery.name}</h3>
                <p className="muted">{selectedWineGallery.winery}</p>
              </div>
              <button type="button" className="ghost-button small" onClick={closeWineGallery} aria-label={t('wineProfile.closeGalleryAria')}>
                {t('wineProfile.closeGallery')}
              </button>
            </header>

            <div className="image-modal-stage">
              <div className="image-modal-rail" role="tablist" aria-label={t('wineProfile.imageViewsAria')}>
                {SAMPLE_WINE_GALLERY.map((image) => {
                  const isActive = image.key === activeGalleryImageKey

                  return (
                    <button
                      key={image.key}
                      type="button"
                      className={`image-modal-thumb ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveGalleryImageKey(image.key)}
                      aria-pressed={isActive}
                    >
                      <img src={image.src} alt={`${selectedWineGallery.name} ${selectedWineProfile?.galleryLabels[image.key] ?? galleryLabels[image.key]}`} loading="lazy" onError={fallbackToDefaultWineIcon} />
                      <span>{selectedWineProfile?.galleryLabels[image.key] ?? galleryLabels[image.key]}</span>
                    </button>
                  )
                })}
              </div>

              <figure className="image-modal-viewer">
                {(() => {
                  const activeImage = SAMPLE_WINE_GALLERY.find((image) => image.key === activeGalleryImageKey) ?? SAMPLE_WINE_GALLERY[0]

                  return (
                    <>
                      <img src={activeImage.src} alt={`${selectedWineGallery.name} ${selectedWineProfile?.galleryLabels[activeImage.key] ?? galleryLabels[activeImage.key]}`} onError={fallbackToDefaultWineIcon} />
                      <figcaption>
                        <strong>{selectedWineProfile?.galleryLabels[activeImage.key] ?? galleryLabels[activeImage.key]}</strong>
                        <span>
                          {t('wineProfile.imageExampleCaption')}
                        </span>
                      </figcaption>
                    </>
                  )
                })()}
              </figure>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default App
