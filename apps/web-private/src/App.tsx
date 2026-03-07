import type { ChangeEvent, FormEvent, HTMLAttributes, PointerEvent as ReactPointerEvent, ReactNode, SyntheticEvent } from 'react'
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
  doName: string | null
  doLogo: string | null
  regionLogo: string | null
  thumbnailSrc: string
  galleryPreview: {
    bottle: string
    front: string
    back: string
    situation: string
  }
  vintageYear: number | null
  agingType: 'young' | 'crianza' | 'reserve' | 'grand_reserve' | null
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
  intensityAroma?: number
  sweetness?: number
  acidity?: number
  tannin?: number
  body?: number
  persistence?: number
  tags?: string[]
}

type MyWineReviewEntry = {
  wine: WineItem
  review: WineDetailsApiReview
}

type WineListApiItem = {
  id: number
  name: string
  winery: string | null
  wine_type: WineType | null
  country: Exclude<CountryFilterValue, 'all'> | null
  do: { id: number; name: string; do_logo: string | null; region_logo: string | null } | null
  aging_type?: 'young' | 'crianza' | 'reserve' | 'grand_reserve' | null
  vintage_year: number | null
  avg_score: number | null
  photos?: Array<{
    type: 'front_label' | 'back_label' | 'bottle' | 'situation'
    url: string
  }>
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
  do_logo: string | null
  region_logo: string | null
}

type DoApiResponse = {
  items: DoApiItem[]
}

type DoSortField = 'country' | 'region' | 'name'
type DoSortPresetKey = 'country_region_name' | 'name_country_region' | 'region_name_country'

const SAMPLE_DO_DIRECTORY: DoApiItem[] = [
  { id: 101, name: 'Alella', region: 'Cataluña', country: 'spain', country_code: 'ES', do_logo: 'alella_DO.png', region_logo: 'cataluna.png' },
  { id: 102, name: 'Jerez-Xérès-Sherry', region: 'Andalucía', country: 'spain', country_code: 'ES', do_logo: 'jerez_xerez_sherry_DO.jpg', region_logo: 'andalucia.png' },
  { id: 103, name: 'Jumilla', region: 'Murcia', country: 'spain', country_code: 'ES', do_logo: 'jumilla_DO.jpg', region_logo: 'murcia.png' },
  { id: 104, name: 'Penedès', region: 'Cataluña', country: 'spain', country_code: 'ES', do_logo: 'penedes_DO.png', region_logo: 'cataluna.png' },
  { id: 105, name: 'Priorat', region: 'Cataluña', country: 'spain', country_code: 'ES', do_logo: 'priorat_DO.png', region_logo: 'cataluna.png' },
  { id: 106, name: 'Rías Baixas', region: 'Galicia', country: 'spain', country_code: 'ES', do_logo: 'rias_baixas_DO.png', region_logo: 'galicia.png' },
  { id: 107, name: 'Somontano', region: 'Aragón', country: 'spain', country_code: 'ES', do_logo: 'somontano_DO.jpg', region_logo: 'aragon.png' },
  { id: 108, name: 'Toro', region: 'Castilla y León', country: 'spain', country_code: 'ES', do_logo: 'toro_DO.jpg', region_logo: 'castilla_y_leon.png' },
  { id: 109, name: 'Napa Valley', region: 'California', country: 'united_states', country_code: 'US', do_logo: 'hunter_valley_DO.png', region_logo: 'united_states.png' },
]

type ReviewsPerMonthStatsApiResponse = {
  months: string[]
  review_counts: number[]
  median_scores: Array<number | null>
}

type GenericStatsApiResponse = {
  total_wines: number
  total_reviews: number
  my_reviews: number
  average_red: number
  average_white: number
}

type ScoringGenericStatsApiResponse = {
  items: Array<{
    label: '<60' | '60-69' | '70-79' | '80-89' | '90+'
    count: number
  }>
}

type ReviewTimelinePoint = {
  label: string
  reviews: number
  median: number | null
}

type WineDetailsApiGrape = {
  id: number
  name: string
  color: 'red' | 'white'
  percentage: number | null
}

type WineDetailsApiPurchase = {
  id: number
  place: {
    id: number
    place_type: 'restaurant' | 'supermarket'
    name: string
    address: string | null
    city: string | null
    country: Exclude<CountryFilterValue, 'all'>
  }
  price_paid: number
  purchased_at: string
}

type WineDetailsApiAward = {
  id: number
  name: string
  score: number | null
  year: number | null
}

type WineDetailsApiPhoto = {
  id: number
  type: 'front_label' | 'back_label' | 'bottle' | 'situation' | null
  url: string
  hash: string
  size: number
  extension: string
}

type WineDetailsApiReview = {
  id: number
  user: {
    id: number
    name: string
    lastname: string
  }
  score: number | null
  intensity_aroma: number
  sweetness: number
  acidity: number
  tannin: number | null
  body: number
  persistence: number
  bullets: Array<'fruity' | 'floral' | 'spicy' | 'mineral' | 'oak_forward' | 'easy_drinking' | 'elegant' | 'powerful' | 'food_friendly'>
  created_at: string
}

type WineDetailsApiWine = {
  id: number
  name: string
  winery: string | null
  wine_type: WineType | null
  do: {
    id: number
    name: string
    region: string
    country: Exclude<CountryFilterValue, 'all'>
    country_code: string
    do_logo: string | null
    region_logo: string | null
  } | null
  country: Exclude<CountryFilterValue, 'all'> | null
  aging_type: 'young' | 'crianza' | 'reserve' | 'grand_reserve' | null
  vintage_year: number | null
  alcohol_percentage: number | null
  created_at: string
  updated_at: string
  grapes: WineDetailsApiGrape[]
  purchases: WineDetailsApiPurchase[]
  awards: WineDetailsApiAward[]
  photos: WineDetailsApiPhoto[]
  reviews: WineDetailsApiReview[]
}

type WineDetailsApiResponse = {
  wine: WineDetailsApiWine
}

type MenuKey = 'dashboard' | 'wines' | 'dos' | 'wineCreate' | 'wineEdit' | 'reviews' | 'reviewCreate' | 'reviewEdit' | 'admin' | 'apiDocs' | 'settings' | 'wineProfile'
type ThemeMode = 'light' | 'dark'
type GalleryModalVariant = 'full' | 'compact'
type WinePhotoSlotType = 'bottle' | 'front_label' | 'back_label' | 'situation'

type AppUser = {
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
  grapeId: string
  percentage: string
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

const DEFAULT_NO_PHOTO_LIGHT_SRC = '/images/photos/wines/no-photo.png'
const DEFAULT_NO_PHOTO_DARK_SRC = '/images/photos/wines/no-photo-dark.png'
const SAMPLE_WINE_THUMBNAIL_SRC = DEFAULT_NO_PHOTO_LIGHT_SRC
const DEFAULT_WINE_ICON_DATA_URI = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="240" viewBox="0 0 160 240"><rect width="160" height="240" rx="14" fill="%23f3ece3"/><path d="M55 36h50c0 36-10 56-25 71v51h22v18H58v-18h22v-51C65 92 55 72 55 36Z" fill="%238f3851"/><circle cx="80" cy="73" r="24" fill="%23c9657f"/></svg>'
const SAMPLE_WINE_GALLERY = [
  { key: 'bottle', src: SAMPLE_WINE_THUMBNAIL_SRC },
  { key: 'front', src: SAMPLE_WINE_THUMBNAIL_SRC },
  { key: 'back', src: SAMPLE_WINE_THUMBNAIL_SRC },
  { key: 'situation', src: SAMPLE_WINE_THUMBNAIL_SRC },
] as const

const DEFAULT_USER_PLACEHOLDER: AppUser = {
  id: 0,
  name: '-',
  lastname: '',
  email: '-',
}

const AGING_OPTIONS = ['young', 'crianza', 'reserve', 'grand_reserve'] as const
const PLACE_TYPE_OPTIONS = ['restaurant', 'supermarket'] as const
const AWARD_OPTIONS = ['decanter', 'penin', 'wine_spectator', 'parker', 'james_suckling', 'guia_proensa'] as const
const REVIEW_TAG_OPTIONS = ['Afrutado', 'Floral', 'Especiado', 'Mineral', 'Madera marcada', 'Fácil de beber', 'Elegante', 'Potente', 'Gastronómico'] as const
const REVIEW_TAG_TO_ENUM: Record<(typeof REVIEW_TAG_OPTIONS)[number], WineDetailsApiReview['bullets'][number]> = {
  Afrutado: 'fruity',
  Floral: 'floral',
  Especiado: 'spicy',
  Mineral: 'mineral',
  'Madera marcada': 'oak_forward',
  'Fácil de beber': 'easy_drinking',
  Elegante: 'elegant',
  Potente: 'powerful',
  Gastronómico: 'food_friendly',
}
const REVIEW_ENUM_TO_TAG: Record<WineDetailsApiReview['bullets'][number], (typeof REVIEW_TAG_OPTIONS)[number]> = {
  fruity: 'Afrutado',
  floral: 'Floral',
  spicy: 'Especiado',
  mineral: 'Mineral',
  oak_forward: 'Madera marcada',
  easy_drinking: 'Fácil de beber',
  elegant: 'Elegante',
  powerful: 'Potente',
  food_friendly: 'Gastronómico',
}
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

const DO_SORT_PRESET_FIELDS: Record<DoSortPresetKey, [DoSortField, DoSortField, DoSortField]> = {
  country_region_name: ['country', 'region', 'name'],
  name_country_region: ['name', 'country', 'region'],
  region_name_country: ['region', 'name', 'country'],
}

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

  const hasDetailedAxes = (
    review.intensityAroma != null
    && review.sweetness != null
    && review.acidity != null
    && review.body != null
    && review.persistence != null
  )

  const base = Math.max(0, Math.min(10, Math.round(review.score / 10)))
  const boosted = Math.max(0, Math.min(10, base + 1))
  const tags = review.tags ?? (review.score >= 90 ? ['Elegante', 'Potente', 'Gastronómico'] : ['Afrutado', 'Fácil de beber'])

  return {
    wineId: String(review.wineId),
    tastingDate: review.createdAt,
    overallScore: review.score,
    aroma: hasDetailedAxes ? Math.max(0, Math.min(10, Math.round(review.intensityAroma ?? 0))) : boosted,
    sweetness: hasDetailedAxes ? Math.max(0, Math.min(10, Math.round(review.sweetness ?? 0))) : Math.max(0, base - 1),
    acidity: hasDetailedAxes ? Math.max(0, Math.min(10, Math.round(review.acidity ?? 0))) : base,
    tannin: hasDetailedAxes ? Math.max(0, Math.min(10, Math.round(review.tannin ?? 0))) : boosted,
    body: hasDetailedAxes ? Math.max(0, Math.min(10, Math.round(review.body ?? 0))) : boosted,
    persistence: hasDetailedAxes ? Math.max(0, Math.min(10, Math.round(review.persistence ?? 0))) : base,
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
  const code = countryCodeFromAny(country)
  if (code == null) {
    return '🏳️'
  }

  const map: Record<Exclude<CountryFilterValue, 'all'>, string> = {
    spain: '🇪🇸',
    france: '🇫🇷',
    italy: '🇮🇹',
    portugal: '🇵🇹',
    germany: '🇩🇪',
    argentina: '🇦🇷',
    chile: '🇨🇱',
    united_states: '🇺🇸',
    south_africa: '🇿🇦',
    australia: '🇦🇺',
  }

  return map[code]
}

function countryFlagPath(country: string): string | null {
  const code = countryCodeFromAny(country)
  if (code == null) {
    return null
  }

  const map: Record<Exclude<CountryFilterValue, 'all'>, string> = {
    spain: '/images/flags/country/spain.png',
    france: '/images/flags/country/france.png',
    italy: '/images/flags/country/italy.png',
    portugal: '/images/flags/country/portugal.png',
    germany: '/images/flags/country/germany.png',
    argentina: '/images/flags/country/argentina.png',
    chile: '/images/flags/country/chile.png',
    united_states: '/images/flags/country/united_states.png',
    south_africa: '/images/flags/country/south_africa.png',
    australia: '/images/flags/country/australia.png',
  }

  return map[code]
}

function localizedCountryName(country: string, locale: string): string {
  const code = countryCodeFromAny(country)
  return code == null ? country : countryCodeToLabel(code, locale)
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

function countryCodeFromAny(country: string): Exclude<CountryFilterValue, 'all'> | null {
  const mapped = countryLabelToFilterValue(country)
  return mapped === 'all' ? null : mapped
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function doLogoPathFromImageName(logoImage: string | null | undefined): string | null {
  if (!logoImage || logoImage.trim() === '') {
    return null
  }

  return `/images/icons/DO/${logoImage}`
}

function regionLogoPathFromImageName(regionLogo: string | null | undefined): string | null {
  if (!regionLogo || regionLogo.trim() === '') {
    return null
  }

  if (regionLogo === 'united_states.png') {
    return `/images/flags/country/${regionLogo}`
  }

  return `/images/flags/regions/${regionLogo}`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function getDefaultNoPhotoSrc(): string {
  if (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark') {
    return DEFAULT_NO_PHOTO_DARK_SRC
  }
  return DEFAULT_NO_PHOTO_LIGHT_SRC
}

function getDefaultWineIconCandidates(): [string, string] {
  const src = getDefaultNoPhotoSrc()
  return [src, `/admin${src}`]
}

function fallbackToDefaultWineIcon(event: SyntheticEvent<HTMLImageElement, Event>): void {
  const image = event.currentTarget
  const candidates = getDefaultWineIconCandidates()
  const attemptRaw = image.dataset.fallbackAttempt ?? '0'
  const attempt = Number.parseInt(attemptRaw, 10)
  if (Number.isNaN(attempt) || attempt < 0) {
    image.dataset.fallbackAttempt = '0'
    image.src = candidates[0]
    return
  }

  if (attempt < candidates.length) {
    image.dataset.fallbackAttempt = String(attempt + 1)
    image.src = candidates[attempt]
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

function resolveApiBaseUrl(): string {
  const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
  const fallbackBase = window.location.port.startsWith('517') ? 'http://localhost:8080' : window.location.origin
  return configuredBase && configuredBase.length > 0 ? configuredBase : fallbackBase
}

function resolveApiAssetUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  if (!path.startsWith('/')) {
    return path
  }
  return `${resolveApiBaseUrl()}${path}`
}

function normalizeWineType(value: unknown): WineType {
  if (value === 'red' || value === 'white' || value === 'rose' || value === 'sparkling' || value === 'sweet' || value === 'fortified') {
    return value
  }
  return 'red'
}

function normalizeAgingType(value: unknown): 'young' | 'crianza' | 'reserve' | 'grand_reserve' | null {
  if (value === 'young' || value === 'crianza' || value === 'reserve' || value === 'grand_reserve') {
    return value
  }
  return null
}

function normalizeCountryCode(value: unknown): Exclude<CountryFilterValue, 'all'> | null {
  if (
    value === 'spain'
    || value === 'france'
    || value === 'italy'
    || value === 'portugal'
    || value === 'germany'
    || value === 'argentina'
    || value === 'chile'
    || value === 'united_states'
    || value === 'south_africa'
    || value === 'australia'
  ) {
    return value
  }
  return null
}

function mapWineListItemToWineItem(item: WineListApiItem, locale: string): WineItem {
  const defaultSrc = getDefaultNoPhotoSrc()
  const resolvedByType: Record<'bottle' | 'front' | 'back' | 'situation', string> = {
    bottle: defaultSrc,
    front: defaultSrc,
    back: defaultSrc,
    situation: defaultSrc,
  }

  const photos = Array.isArray(item.photos)
    ? item.photos.filter((photo): photo is NonNullable<WineListApiItem['photos']>[number] => {
        return photo != null && typeof photo.url === 'string' && photo.url.trim() !== ''
      })
    : []

  photos.forEach((photo) => {
    const resolvedUrl = resolveApiAssetUrl(photo.url)
    if (photo.type === 'bottle') {
      resolvedByType.bottle = resolvedUrl
    }
    if (photo.type === 'front_label') {
      resolvedByType.front = resolvedUrl
    }
    if (photo.type === 'back_label') {
      resolvedByType.back = resolvedUrl
    }
    if (photo.type === 'situation') {
      resolvedByType.situation = resolvedUrl
    }
  })

  const preferredPhoto = photos.find((photo) => photo.type === 'bottle') ?? photos[0]
  const countryCode = normalizeCountryCode(item.country)

  return {
    galleryPreview: resolvedByType,
    thumbnailSrc: preferredPhoto?.url ? resolveApiAssetUrl(preferredPhoto.url) : defaultSrc,
    id: Number.isFinite(item.id) ? item.id : 0,
    name: typeof item.name === 'string' && item.name.trim() !== '' ? item.name : '-',
    winery: typeof item.winery === 'string' && item.winery.trim() !== '' ? item.winery : '-',
    type: normalizeWineType(item.wine_type),
    country: countryCodeToLabel(countryCode, locale),
    region: item.do?.name ?? '-',
    doName: item.do?.name ?? null,
    doLogo: item.do?.do_logo ?? null,
    regionLogo: item.do?.region_logo ?? null,
    vintageYear: Number.isInteger(item.vintage_year) ? item.vintage_year : null,
    agingType: normalizeAgingType(item.aging_type),
    // List endpoint does not expose price in current API contract.
    pricePaid: 0,
    averageScore: typeof item.avg_score === 'number' && Number.isFinite(item.avg_score)
      ? Math.round(item.avg_score * 10) / 10
      : null,
  }
}

function formatApiDate(dateIso: string, locale: string): string {
  const date = new Date(dateIso)
  if (Number.isNaN(date.getTime())) {
    return dateIso
  }
  return new Intl.DateTimeFormat(locale === 'ca' ? 'ca-ES' : 'es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function labelForPhotoType(type: WineDetailsApiPhoto['type'], locale: string): string {
  if (type === 'bottle') return locale === 'ca' ? 'Ampolla' : 'Botella'
  if (type === 'front_label') return locale === 'ca' ? 'Etiqueta frontal' : 'Etiqueta frontal'
  if (type === 'back_label') return locale === 'ca' ? 'Etiqueta posterior' : 'Etiqueta trasera'
  if (type === 'situation') return locale === 'ca' ? 'Situació' : 'Situación'
  return locale === 'ca' ? 'Foto' : 'Foto'
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function medalToneFromTen(value: number | null): 'gold' | 'silver' | 'bronze' | 'default' {
  if (value == null) return 'default'
  if (value >= 9) return 'gold'
  if (value >= 8) return 'silver'
  if (value >= 7) return 'bronze'
  return 'default'
}

function medalToneFromHundred(value: number | null): 'gold' | 'silver' | 'bronze' | 'default' {
  if (value == null) return 'default'
  if (value >= 90) return 'gold'
  if (value >= 80) return 'silver'
  if (value >= 70) return 'bronze'
  return 'default'
}

function medalToneFromScore(value: number | null): 'gold' | 'silver' | 'bronze' | 'default' {
  if (value == null) return 'default'
  const normalized = value <= 10 ? value * 10 : value
  return medalToneFromHundred(normalized)
}

function labelForAgingType(agingType: WineDetailsApiWine['aging_type'], locale: string): string {
  if (agingType == null) return '-'
  const ca: Record<Exclude<WineDetailsApiWine['aging_type'], null>, string> = {
    young: 'Jove',
    crianza: 'Criança',
    reserve: 'Reserva',
    grand_reserve: 'Gran reserva',
  }
  const es: Record<Exclude<WineDetailsApiWine['aging_type'], null>, string> = {
    young: 'Joven',
    crianza: 'Crianza',
    reserve: 'Reserva',
    grand_reserve: 'Gran reserva',
  }
  return locale === 'ca' ? ca[agingType] : es[agingType]
}

function labelForAwardName(awardName: WineDetailsApiAward['name']): string {
  const map: Record<WineDetailsApiAward['name'], string> = {
    penin: 'Peñín',
    parker: 'Parker',
    wine_spectator: 'Wine Spectator',
    decanter: 'Decanter',
    james_suckling: 'James Suckling',
    guia_proensa: 'Guía Proensa',
  }
  return map[awardName] ?? awardName
}

function formatReviewTimelineLabel(monthKey: string, locale: string): string {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) {
    return monthKey
  }

  const monthDate = new Date(`${monthKey}-01T00:00:00Z`)
  if (Number.isNaN(monthDate.getTime())) {
    return monthKey
  }

  return new Intl.DateTimeFormat(locale === 'ca' ? 'ca-ES' : 'es-ES', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  }).format(monthDate).replace('.', '')
}

function buildBiMonthlyReviewTimeline(
  months: string[],
  reviewCounts: number[],
  medianScores: Array<number | null>,
  locale: string,
): ReviewTimelinePoint[] {
  const grouped: ReviewTimelinePoint[] = []

  for (let index = 0; index < months.length; index += 2) {
    const firstMonth = months[index]
    const secondMonth = months[index + 1] ?? null
    const firstCount = reviewCounts[index] ?? 0
    const secondCount = reviewCounts[index + 1] ?? 0
    const firstMedian = medianScores[index] ?? null
    const secondMedian = medianScores[index + 1] ?? null
    const availableMedians = [firstMedian, secondMedian].filter((value): value is number => value != null)

    const label = (() => {
      if (secondMonth == null) {
        return formatReviewTimelineLabel(firstMonth, locale)
      }

      const [firstYear, firstMonthNumber] = firstMonth.split('-')
      const [secondYear, secondMonthNumber] = secondMonth.split('-')
      const firstDate = new Date(`${firstMonth}-01T00:00:00Z`)
      const secondDate = new Date(`${secondMonth}-01T00:00:00Z`)

      if (
        firstYear == null
        || firstMonthNumber == null
        || secondYear == null
        || secondMonthNumber == null
        || Number.isNaN(firstDate.getTime())
        || Number.isNaN(secondDate.getTime())
      ) {
        return `${formatReviewTimelineLabel(firstMonth, locale)} · ${formatReviewTimelineLabel(secondMonth, locale)}`
      }

      const monthFormatter = new Intl.DateTimeFormat(locale === 'ca' ? 'ca-ES' : 'es-ES', {
        month: 'short',
        timeZone: 'UTC',
      })
      const firstMonthLabel = monthFormatter.format(firstDate).replace('.', '')
      const secondMonthLabel = monthFormatter.format(secondDate).replace('.', '')
      const connector = locale === 'ca' ? 'del' : 'del'

      if (firstYear === secondYear) {
        return `${firstMonthLabel}-${secondMonthLabel} ${connector} ${firstYear}`
      }

      return `${firstMonthLabel} ${connector} ${firstYear} - ${secondMonthLabel} ${connector} ${secondYear}`
    })()

    grouped.push({
      label,
      reviews: firstCount + secondCount,
      median: availableMedians.length === 0
        ? null
        : Math.round((availableMedians.reduce((sum, value) => sum + value, 0) / availableMedians.length) * 10) / 10,
    })
  }

  return grouped
}

function App() {
  const { labels, locale, setLocale, t } = useI18n()
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(getInitialSidebarCollapsed)
  const [loggedIn, setLoggedIn] = useState(false)
  const [authBootstrapped, setAuthBootstrapped] = useState(false)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [menu, setMenu] = useState<MenuKey>('dashboard')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [selectedWineSheet, setSelectedWineSheet] = useState<WineItem | null>(null)
  const [selectedWineSheetDetails, setSelectedWineSheetDetails] = useState<WineDetailsApiWine | null>(null)
  const [selectedWineSheetStatus, setSelectedWineSheetStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [selectedWineSheetError, setSelectedWineSheetError] = useState<string | null>(null)
  const [wineProfileReloadToken, setWineProfileReloadToken] = useState(0)
  const [photoPickerType, setPhotoPickerType] = useState<WinePhotoSlotType | null>(null)
  const [photoEditorWineId, setPhotoEditorWineId] = useState<number | null>(null)
  const [photoEditorType, setPhotoEditorType] = useState<WinePhotoSlotType | null>(null)
  const [photoEditorSource, setPhotoEditorSource] = useState<string | null>(null)
  const [photoEditorZoom, setPhotoEditorZoom] = useState(1)
  const [photoEditorOffsetX, setPhotoEditorOffsetX] = useState(0)
  const [photoEditorOffsetY, setPhotoEditorOffsetY] = useState(0)
  const [photoEditorSaving, setPhotoEditorSaving] = useState(false)
  const [photoEditorError, setPhotoEditorError] = useState<string | null>(null)
  const [photoDeleteBusyType, setPhotoDeleteBusyType] = useState<WinePhotoSlotType | null>(null)
  const [selectedWineGallery, setSelectedWineGallery] = useState<WineItem | null>(null)
  const [selectedWineForEdit, setSelectedWineForEdit] = useState<WineItem | null>(null)
  const [wineEditDetails, setWineEditDetails] = useState<WineDetailsApiWine | null>(null)
  const [wineEditStatus, setWineEditStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [wineEditReloadToken, setWineEditReloadToken] = useState(0)
  const [selectedReviewForEdit, setSelectedReviewForEdit] = useState<ReviewItem | null>(null)
  const [galleryModalVariant, setGalleryModalVariant] = useState<GalleryModalVariant>('full')
  const [activeGalleryImageKey, setActiveGalleryImageKey] = useState<(typeof SAMPLE_WINE_GALLERY)[number]['key']>('bottle')
  const [dashboardSeed] = useState(() => Math.floor(Math.random() * 2_147_483_647))
  const [defaultSortPreference, setDefaultSortPreference] = useState<'score_desc' | 'recent' | 'price_asc'>('score_desc')
  const [defaultLandingPage, setDefaultLandingPage] = useState<'dashboard' | 'wines' | 'dos' | 'reviews'>('dashboard')
  const [showOnlySpainByDefault, setShowOnlySpainByDefault] = useState(true)
  const [compactCardsPreference, setCompactCardsPreference] = useState(false)
  const [settingsName, setSettingsName] = useState('')
  const [settingsLastname, setSettingsLastname] = useState('')
  const [settingsPassword, setSettingsPassword] = useState('')
  const [settingsProfileSubmitting, setSettingsProfileSubmitting] = useState(false)
  const [settingsProfileError, setSettingsProfileError] = useState<string | null>(null)
  const [settingsProfileSuccess, setSettingsProfileSuccess] = useState<string | null>(null)
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
  const [doSortPreset, setDoSortPreset] = useState<DoSortPresetKey>('country_region_name')
  const [typeFilter, setTypeFilter] = useState<'all' | WineType>('all')
  const [minScoreFilter, setMinScoreFilter] = useState<'all' | number>('all')
  const [grapeFilter, setGrapeFilter] = useState<'all' | number>('all')
  const [doFilter, setDoFilter] = useState<'all' | number>('all')
  const [doSearchText, setDoSearchText] = useState('')
  const [isDoDropdownOpen, setIsDoDropdownOpen] = useState(false)
  const [createDoCountryFilter, setCreateDoCountryFilter] = useState<CountryFilterValue>('spain')
  const [createDoSearchText, setCreateDoSearchText] = useState('')
  const [isCreateDoDropdownOpen, setIsCreateDoDropdownOpen] = useState(false)
  const [createDoId, setCreateDoId] = useState<'all' | number>('all')
  const [manufacturingCountry, setManufacturingCountry] = useState<Exclude<CountryFilterValue, 'all'>>('spain')
  const [grapeOptions, setGrapeOptions] = useState<GrapeApiItem[]>([])
  const [doOptions, setDoOptions] = useState<DoApiItem[]>([])
  const [wineItems, setWineItems] = useState<WineItem[]>([])
  const [wineListStatus, setWineListStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [wineListError, setWineListError] = useState<string | null>(null)
  const [wineListReloadToken, setWineListReloadToken] = useState(0)
  const [wineDeleteTarget, setWineDeleteTarget] = useState<WineItem | null>(null)
  const [wineDeleteSubmitting, setWineDeleteSubmitting] = useState(false)
  const [wineDeleteError, setWineDeleteError] = useState<string | null>(null)
  const [winePage, setWinePage] = useState(1)
  const [wineLimit, setWineLimit] = useState(20)
  const [wineTotalItems, setWineTotalItems] = useState(0)
  const [wineTotalPages, setWineTotalPages] = useState(0)
  const [wineHasNext, setWineHasNext] = useState(false)
  const [wineHasPrev, setWineHasPrev] = useState(false)
  const [isWineFiltersMobileOpen, setIsWineFiltersMobileOpen] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(
    () => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 640px)').matches : false),
  )
  const [myReviewEntries, setMyReviewEntries] = useState<MyWineReviewEntry[]>([])
  const [myReviewSummaryStatus, setMyReviewSummaryStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [myReviewSummaryError, setMyReviewSummaryError] = useState<string | null>(null)
  const [reviewTotalWines, setReviewTotalWines] = useState(0)
  const [reviewListReloadToken, setReviewListReloadToken] = useState(0)
  const [reviewWineFilter, setReviewWineFilter] = useState<'all' | number>('all')
  const [reviewFormSubmitting, setReviewFormSubmitting] = useState(false)
  const [reviewFormError, setReviewFormError] = useState<string | null>(null)
  const [reviewSuccessToast, setReviewSuccessToast] = useState<string | null>(null)
  const [reviewActionError, setReviewActionError] = useState<string | null>(null)
  const [reviewDeleteBusyId, setReviewDeleteBusyId] = useState<number | null>(null)
  const [doSuccessToast, setDoSuccessToast] = useState<string | null>(null)
  const [genericStats, setGenericStats] = useState<GenericStatsApiResponse | null>(null)
  const [genericStatsStatus, setGenericStatsStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [genericStatsError, setGenericStatsError] = useState<string | null>(null)
  const [scoringGenericStats, setScoringGenericStats] = useState<ScoringGenericStatsApiResponse | null>(null)
  const [scoringGenericStatsStatus, setScoringGenericStatsStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [scoringGenericStatsError, setScoringGenericStatsError] = useState<string | null>(null)
  const [reviewsPerMonthStats, setReviewsPerMonthStats] = useState<ReviewsPerMonthStatsApiResponse | null>(null)
  const [reviewsPerMonthStatus, setReviewsPerMonthStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [reviewsPerMonthError, setReviewsPerMonthError] = useState<string | null>(null)
  const [wineFormSubmitting, setWineFormSubmitting] = useState(false)
  const [wineFormError, setWineFormError] = useState<string | null>(null)
  const [wineSuccessToast, setWineSuccessToast] = useState<string | null>(null)
  const doDropdownRef = useRef<HTMLDivElement | null>(null)
  const createDoDropdownRef = useRef<HTMLDivElement | null>(null)
  const photoPickerInputRef = useRef<HTMLInputElement | null>(null)
  const photoEditorCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const photoEditorDragRef = useRef<{ active: boolean; pointerId: number; lastX: number; lastY: number } | null>(null)
  const photoEditorPointersRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  const photoEditorPinchRef = useRef<{
    baseDistance: number
    baseZoom: number
    baseOffsetX: number
    baseOffsetY: number
    baseMidX: number
    baseMidY: number
    rect: DOMRect
  } | null>(null)
  const [grapeBlendRows, setGrapeBlendRows] = useState<GrapeBlendRow[]>([
    { id: 1, grapeId: '', percentage: '' },
  ])
  const [awardRows, setAwardRows] = useState<AwardRow[]>([])
  const currentUserId = currentUser?.id ?? null
  const firstGrapeOptionId = grapeOptions[0] ? String(grapeOptions[0].id) : ''

  const addGrapeBlendRow = () => {
    setGrapeBlendRows((current) => [
      ...current,
      { id: Date.now(), grapeId: firstGrapeOptionId, percentage: '' },
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

  useEffect(() => {
    if (!firstGrapeOptionId) {
      return
    }

    setGrapeBlendRows((current) => current.map((row) => (row.grapeId === '' ? { ...row, grapeId: firstGrapeOptionId } : row)))
  }, [firstGrapeOptionId])

  const menuItems: Array<{ key: Exclude<MenuKey, 'wineProfile'>; label: string; short: string; icon: ReactNode }> = [
    {
      key: 'dashboard',
      label: labels.menu.dashboard,
      short: 'DB',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.8V20a1 1 0 0 0 1 1h4.5v-6h3v6H18a1 1 0 0 0 1-1V9.8" />
        </svg>
      ),
    },
    {
      key: 'wines',
      label: labels.menu.wines,
      short: 'W',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M8 3h8c0 4.2-1.2 6.8-4 8.6V17h3v3H9v-3h3v-5.4C9.2 9.8 8 7.2 8 3Z" />
        </svg>
      ),
    },
    {
      key: 'reviews',
      label: labels.menu.reviews,
      short: 'R',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 20h4l10-10-4-4L4 16v4Z" />
          <path d="m12.5 7.5 4 4" />
        </svg>
      ),
    },
    {
      key: 'dos',
      label: labels.menu.dos,
      short: 'DO',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 5.5h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8.8L4 21V7.5a2 2 0 0 1 2-2Z" />
          <path d="M8 10h8" />
          <path d="M8 13.5h5.5" />
        </svg>
      ),
    },
    {
      key: 'apiDocs',
      label: labels.menu.apiDoc,
      short: 'API',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="8.5" />
          <path d="m15.5 8.5-2.2 5.2-5.3 2.2 2.2-5.2 5.3-2.2Z" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      ),
    },
    {
      key: 'admin',
      label: labels.menu.admin,
      short: 'A',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
          <path d="M19.4 15a7.8 7.8 0 0 0 .1-1l2-1.3-1.8-3.1-2.3.5a7.8 7.8 0 0 0-.8-.6l-.3-2.3h-3.6l-.3 2.3c-.3.2-.6.4-.8.6l-2.3-.5-1.8 3.1 2 1.3a7.8 7.8 0 0 0 .1 1l-2 1.3 1.8 3.1 2.3-.5c.2.2.5.4.8.6l.3 2.3h3.6l.3-2.3c.3-.2.6-.4.8-.6l2.3.5 1.8-3.1-2-1.3Z" />
        </svg>
      ),
    },
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

  const createDosByCountry = useMemo(() => {
    if (createDoCountryFilter === 'all') {
      return [] as DoApiItem[]
    }

    return doOptions
      .filter((item) => item.country === createDoCountryFilter)
      .sort((a, b) => {
        const byRegion = a.region.localeCompare(b.region)
        if (byRegion !== 0) return byRegion
        return a.name.localeCompare(b.name)
      })
  }, [createDoCountryFilter, doOptions])

  const createFilteredDosBySearch = useMemo(() => {
    const query = normalizeSearchText(createDoSearchText)
    if (query === '') {
      return createDosByCountry
    }

    return createDosByCountry.filter((item) => {
      const name = normalizeSearchText(item.name)
      const region = normalizeSearchText(item.region)
      return name.includes(query) || region.includes(query)
    })
  }, [createDoSearchText, createDosByCountry])

  const selectedDoOption = useMemo(
    () => (doFilter === 'all' ? null : doOptions.find((item) => item.id === doFilter) ?? null),
    [doFilter, doOptions],
  )
  const selectedDoCommunityFlagPath = selectedDoOption
    ? regionLogoPathFromImageName(selectedDoOption.region_logo)
    : null
  const selectedCreateDoOption = useMemo(
    () => (createDoId === 'all' ? null : doOptions.find((item) => item.id === createDoId) ?? null),
    [createDoId, doOptions],
  )
  const selectedCreateDoCommunityFlagPath = selectedCreateDoOption
    ? regionLogoPathFromImageName(selectedCreateDoOption.region_logo)
    : null
  const primaryEditPurchase = wineEditDetails?.purchases[0] ?? null
  const doSortFields = DO_SORT_PRESET_FIELDS[doSortPreset]
  const doSortPresetOptions = useMemo<Array<{ key: DoSortPresetKey; label: string }>>(
    () => [
      {
        key: 'country_region_name',
        label: locale === 'ca' ? 'País, regió, nom' : 'País, región, nombre',
      },
      {
        key: 'name_country_region',
        label: locale === 'ca' ? 'Nom, país, regió' : 'Nombre, país, región',
      },
      {
        key: 'region_name_country',
        label: locale === 'ca' ? 'Regió, nom, país' : 'Región, nombre, país',
      },
    ],
    [locale],
  )
  const doDirectoryItems = useMemo(() => {
    const items = doOptions.length > 0 ? [...doOptions] : [...SAMPLE_DO_DIRECTORY]
    const collator = new Intl.Collator(locale === 'ca' ? 'ca-ES' : 'es-ES', { sensitivity: 'base' })

    return items.sort((left, right) => {
      for (const field of doSortFields) {
        const comparison = (() => {
          if (field === 'country') {
            return collator.compare(countryCodeToLabel(left.country, locale), countryCodeToLabel(right.country, locale))
          }
          if (field === 'region') {
            return collator.compare(left.region, right.region)
          }
          return collator.compare(left.name, right.name)
        })()

        if (comparison !== 0) {
          return comparison
        }
      }

      return left.id - right.id
    })
  }, [doOptions, doSortFields, locale])

  const metrics = useMemo(
    () => ({
      totalWines: genericStats?.total_wines ?? wineItems.length,
      totalReviews: genericStats?.total_reviews ?? reviewsPerMonthStats?.review_counts.reduce((sum, count) => sum + count, 0) ?? 0,
      myReviews: genericStats?.my_reviews ?? myReviewEntries.length,
      averageRed: genericStats?.average_red ?? averageScore(wineItems, 'red'),
      averageWhite: genericStats?.average_white ?? averageScore(wineItems, 'white'),
    }),
    [genericStats, myReviewEntries.length, reviewsPerMonthStats, wineItems],
  )

  const dashboardAnalytics = useMemo(() => {
    const scoredWines = wineItems.filter((wine) => wine.averageScore != null)
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
    const averagePrice = wineItems.length ? (wineItems.reduce((sum, wine) => sum + wine.pricePaid, 0) / wineItems.length) : 0
    const minPrice = wineItems.length ? Math.min(...wineItems.map((wine) => wine.pricePaid)) : 0
    const maxPrice = wineItems.length ? Math.max(...wineItems.map((wine) => wine.pricePaid)) : 0
    const maxScore = Math.max(...scoreValues)
    const minScore = Math.min(...scoreValues)
    const approvedCount = scoredWines.filter((wine) => (wine.averageScore ?? 0) >= 70).length
    const approvedRate = scoredWines.length ? (approvedCount / scoredWines.length) * 100 : 0
    const qualityIndex = averagePrice > 0 ? ((metrics.averageRed + metrics.averageWhite) / 2) / averagePrice : 0

    const randCompare = createSeededRandom(dashboardSeed + 311)
    const reviewTimeline: ReviewTimelinePoint[] = reviewsPerMonthStats == null
      ? []
      : buildBiMonthlyReviewTimeline(
          reviewsPerMonthStats.months,
          reviewsPerMonthStats.review_counts,
          reviewsPerMonthStats.median_scores,
          locale,
        )

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

    const scoreBuckets = scoringGenericStats?.items ?? [
      { label: '90+', count: scoredWines.filter((wine) => (wine.averageScore ?? 0) >= 90).length },
      { label: '80-89', count: scoredWines.filter((wine) => (wine.averageScore ?? 0) >= 80 && (wine.averageScore ?? 0) < 90).length },
      { label: '70-79', count: scoredWines.filter((wine) => (wine.averageScore ?? 0) >= 70 && (wine.averageScore ?? 0) < 80).length },
      { label: '60-69', count: scoredWines.filter((wine) => (wine.averageScore ?? 0) >= 60 && (wine.averageScore ?? 0) < 70).length },
      { label: '<60', count: scoredWines.filter((wine) => (wine.averageScore ?? 0) < 60).length },
    ]

    const byType = (['red', 'white', 'rose', 'sparkling'] as WineType[]).map((type) => {
      const wines = scoredWines.filter((wine) => wine.type === type)
      const avg = wines.length ? wines.reduce((sum, wine) => sum + (wine.averageScore ?? 0), 0) / wines.length : 0
      return { type, count: wines.length, avg }
    })

    const awards = wineItems.map((wine) => ({
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

    const coupleRows: Array<{ wine: string; region: string; maria: number; adria: number; diff: number }> = []
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
  }, [dashboardSeed, locale, metrics.averageRed, metrics.averageWhite, reviewsPerMonthStats, scoringGenericStats, wineItems])

  const priceFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'ca' ? 'ca-ES' : 'es-ES', { style: 'currency', currency: 'EUR' }),
    [locale],
  )

  const menuTitle = {
    dashboard: labels.topbar.overview,
    wines: labels.topbar.wines,
    dos: labels.topbar.dos,
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
  const isPhotoOverlayOpen = selectedWineGallery != null || (photoEditorType != null && photoEditorSource != null)
  const isDarkMode = themeMode === 'dark'
  const brandWordmarkSrc = isDarkMode ? '/images/brand/logo-wordmark-dark.png' : '/images/brand/logo-wordmark-light.png'
  const brandWordmarkSidebarSrc = '/images/brand/logo-wordmark-dark.png'
  const brandWordmarkTopbarSrc = '/images/brand/logo-wordmark-dark.png'
  const brandIconSrc = '/images/brand/icon-square-64.png'
  const themeToggleLabel = isDarkMode ? labels.common.themeSwitchToLight : labels.common.themeSwitchToDark
  const displayedUser = currentUser ?? DEFAULT_USER_PLACEHOLDER
  const settingsReviewStats = useMemo(() => {
    const scores = myReviewEntries
      .map((entry) => entry.review.score)
      .filter((score): score is number => score != null)
    const sortedByDate = [...myReviewEntries].sort((a, b) => new Date(b.review.created_at).getTime() - new Date(a.review.created_at).getTime())

    if (scores.length === 0 || sortedByDate.length === 0) {
      return {
        totalReviews: 18,
        averageScore: 87.6,
        lastReview: locale === 'ca' ? '2 de març de 2026' : '2 de marzo de 2026',
        highestScore: 94,
        lowestScore: 79,
      }
    }

    return {
      totalReviews: myReviewEntries.length,
      averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      lastReview: formatApiDate(sortedByDate[0].review.created_at, locale),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
    }
  }, [locale, myReviewEntries])

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
    if (!isPhotoOverlayOpen) {
      return
    }

    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    const previousBodyOverscroll = document.body.style.overscrollBehavior
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
      document.body.style.overscrollBehavior = previousBodyOverscroll
    }
  }, [isPhotoOverlayOpen])

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
    setSettingsName(currentUser?.name ?? '')
    setSettingsLastname(currentUser?.lastname ?? '')
  }, [currentUser])

  useEffect(() => {
    if (!['wines', 'wineCreate', 'wineEdit', 'dos'].includes(menu)) {
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
    if (!['wines', 'wineCreate', 'wineEdit', 'dos'].includes(menu)) {
      return
    }

    const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
    const fallbackBase = window.location.port.startsWith('517') ? 'http://localhost:8080' : window.location.origin
    const apiBaseUrl = configuredBase && configuredBase.length > 0 ? configuredBase : fallbackBase
    const controller = new AbortController()
    const searchParams = new URLSearchParams({
      sort_by_1: doSortFields[0],
      sort_by_2: doSortFields[1],
      sort_by_3: doSortFields[2],
    })

    fetch(`${apiBaseUrl}/api/dos?${searchParams.toString()}`, {
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
  }, [doSortFields, menu])

  const announceDoAction = (action: 'create' | 'edit' | 'delete', item?: DoApiItem) => {
    const baseLabel = action === 'create'
      ? (locale === 'ca' ? 'Crear D.O.' : 'Crear DO')
      : action === 'edit'
        ? (locale === 'ca' ? 'Editar D.O.' : 'Editar DO')
        : (locale === 'ca' ? 'Eliminar D.O.' : 'Borrar DO')

    const targetLabel = item ? ` · ${item.name}` : ''
    setDoSuccessToast(
      locale === 'ca'
        ? `${baseLabel}${targetLabel} disponible aviat. Aquesta pantalla és només de visualització per ara.`
        : `${baseLabel}${targetLabel} disponible próximamente. Esta pantalla es solo de visualización por ahora.`,
    )
  }

  useEffect(() => {
    if (!loggedIn || menu !== 'dashboard') {
      return
    }

    const controller = new AbortController()
    setReviewsPerMonthStatus('loading')
    setReviewsPerMonthError(null)

    fetch(`${resolveApiBaseUrl()}/api/stats/reviews-per-monh`, {
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

        const payload = await response.json() as ReviewsPerMonthStatsApiResponse
        const seriesLength = Math.min(payload.months.length, payload.review_counts.length, payload.median_scores.length)

        setReviewsPerMonthStats({
          months: payload.months.slice(0, seriesLength),
          review_counts: payload.review_counts.slice(0, seriesLength),
          median_scores: payload.median_scores.slice(0, seriesLength),
        })
        setReviewsPerMonthStatus('ready')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }

        setReviewsPerMonthStats(null)
        setReviewsPerMonthStatus('error')
        setReviewsPerMonthError(error instanceof Error ? error.message : 'Unknown error')
      })

    return () => {
      controller.abort()
    }
  }, [loggedIn, menu])

  useEffect(() => {
    if (!loggedIn || menu !== 'dashboard') {
      return
    }

    const controller = new AbortController()
    setScoringGenericStatsStatus('loading')
    setScoringGenericStatsError(null)

    fetch(`${resolveApiBaseUrl()}/api/stats/socring-generic`, {
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

        const payload = await response.json() as ScoringGenericStatsApiResponse
        setScoringGenericStats(payload)
        setScoringGenericStatsStatus('ready')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }

        setScoringGenericStats(null)
        setScoringGenericStatsStatus('error')
        setScoringGenericStatsError(error instanceof Error ? error.message : 'Unknown error')
      })

    return () => {
      controller.abort()
    }
  }, [loggedIn, menu])

  useEffect(() => {
    if (!loggedIn || menu !== 'dashboard') {
      return
    }

    const controller = new AbortController()
    setGenericStatsStatus('loading')
    setGenericStatsError(null)

    fetch(`${resolveApiBaseUrl()}/api/stats/generic`, {
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

        const payload = await response.json() as GenericStatsApiResponse
        setGenericStats(payload)
        setGenericStatsStatus('ready')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }

        setGenericStats(null)
        setGenericStatsStatus('error')
        setGenericStatsError(error instanceof Error ? error.message : 'Unknown error')
      })

    return () => {
      controller.abort()
    }
  }, [loggedIn, menu])

  useEffect(() => {
    if (menu !== 'wineEdit' || !selectedWineForEdit) {
      return
    }

    const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
    const fallbackBase = window.location.port.startsWith('517') ? 'http://localhost:8080' : window.location.origin
    const apiBaseUrl = configuredBase && configuredBase.length > 0 ? configuredBase : fallbackBase
    const controller = new AbortController()

    setWineEditStatus('loading')
    setWineEditDetails(null)

    fetch(`${apiBaseUrl}/api/wines/${selectedWineForEdit.id}`, {
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
        const payload = await response.json() as WineDetailsApiResponse
        setWineEditDetails(payload.wine)

        const fallbackCountry = payload.wine.country ?? 'spain'
        setManufacturingCountry(fallbackCountry)
        setCreateDoCountryFilter(payload.wine.do?.country ?? fallbackCountry)
        setCreateDoId(payload.wine.do?.id ?? 'all')
        setCreateDoSearchText('')
        setIsCreateDoDropdownOpen(false)
        setGrapeBlendRows(
          payload.wine.grapes.length > 0
            ? payload.wine.grapes.map((grape, index) => ({
                id: index + 1,
                grapeId: String(grape.id),
                percentage: grape.percentage == null ? '' : String(grape.percentage),
              }))
            : [{ id: 1, grapeId: firstGrapeOptionId, percentage: '' }],
        )
        setAwardRows(
          payload.wine.awards.map((award, index) => ({
            id: index + 1,
            award: award.name,
            score: award.score == null ? '' : String(award.score),
            year: award.year == null ? '' : String(award.year),
          })),
        )
        setWineEditStatus('ready')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }
        setWineEditStatus('error')
        setWineFormError(error instanceof Error ? error.message : (locale === 'ca' ? 'No s’ha pogut carregar el vi.' : 'No se pudo cargar el vino.'))
      })

    return () => {
      controller.abort()
    }
  }, [menu, selectedWineForEdit, firstGrapeOptionId, locale, wineEditReloadToken])

  useEffect(() => {
    if (menu !== 'wineProfile' || !selectedWineSheet) {
      return
    }

    const controller = new AbortController()

    setSelectedWineSheetStatus('loading')
    setSelectedWineSheetDetails(null)
    setSelectedWineSheetError(null)

    fetch(`${resolveApiBaseUrl()}/api/wines/${selectedWineSheet.id}`, {
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
        const payload = await response.json() as WineDetailsApiResponse
        setSelectedWineSheetDetails(payload.wine)
        setSelectedWineSheetStatus('ready')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }
        setSelectedWineSheetStatus('error')
        setSelectedWineSheetError(error instanceof Error ? error.message : (locale === 'ca' ? 'No s’ha pogut carregar la fitxa del vi.' : 'No se pudo cargar la ficha del vino.'))
      })

    return () => {
      controller.abort()
    }
  }, [menu, selectedWineSheet, locale, wineProfileReloadToken])

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
    if (createDoCountryFilter === 'all') {
      if (createDoId !== 'all') {
        setCreateDoId('all')
      }
      if (isCreateDoDropdownOpen) {
        setIsCreateDoDropdownOpen(false)
      }
      return
    }

    if (createDoId === 'all') {
      return
    }

    const existsForCountry = doOptions.some((item) => item.id === createDoId && item.country === createDoCountryFilter)
    if (!existsForCountry) {
      setCreateDoId('all')
    }
  }, [createDoCountryFilter, createDoId, doOptions, isCreateDoDropdownOpen])

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
    if (!isCreateDoDropdownOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!createDoDropdownRef.current) {
        return
      }
      if (event.target instanceof Node && !createDoDropdownRef.current.contains(event.target)) {
        setIsCreateDoDropdownOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCreateDoDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isCreateDoDropdownOpen])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const query = window.matchMedia('(max-width: 640px)')
    type LegacyMediaQueryList = MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void
    }
    const legacyQuery = query as LegacyMediaQueryList
    const onChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches)
    }

    setIsMobileViewport(query.matches)
    if ('addEventListener' in query) {
      query.addEventListener('change', onChange)
    } else if (legacyQuery.addListener) {
      legacyQuery.addListener(onChange)
    }
    return () => {
      if ('removeEventListener' in query) {
        query.removeEventListener('change', onChange)
      } else if (legacyQuery.removeListener) {
        legacyQuery.removeListener(onChange)
      }
    }
  }, [])

  useEffect(() => {
    if (menu !== 'wines' || !isMobileViewport) {
      setIsWineFiltersMobileOpen(false)
      setIsDoDropdownOpen(false)
    }
  }, [isMobileViewport, menu])

  useEffect(() => {
    if (!isWineFiltersMobileOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDoDropdownOpen(false)
        setIsWineFiltersMobileOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isWineFiltersMobileOpen])

  useEffect(() => {
    if (menu !== 'wines' && menu !== 'reviews') {
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
        const sourceItems = Array.isArray(payload.items) ? payload.items : []
        const mappedItems = sourceItems
          .map((item) => {
            try {
              return mapWineListItemToWineItem(item, locale)
            } catch {
              return null
            }
          })
          .filter((item): item is WineItem => item !== null)

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
  }, [menu, debouncedSearchText, wineCountryFilter, typeFilter, minScoreFilter, grapeFilter, doFilter, winePage, wineLimit, locale, wineListReloadToken])

  useEffect(() => {
    if (menu !== 'reviews' || currentUserId == null) {
      return
    }

    const controller = new AbortController()
    setMyReviewSummaryStatus('loading')
    setMyReviewSummaryError(null)

    const loadMyReviews = async () => {
      try {
        const allWines: WineItem[] = []
        let page = 1
        let totalPages = 1
        let totalItems = 0
        const limit = 100

        while (page <= totalPages) {
          const params = new URLSearchParams()
          params.set('page', String(page))
          params.set('limit', String(limit))

          const listResponse = await fetch(`${resolveApiBaseUrl()}/api/wines?${params.toString()}`, {
            signal: controller.signal,
            credentials: 'include',
            headers: {
              Accept: 'application/json',
            },
          })

          if (!listResponse.ok) {
            throw new Error(`HTTP ${listResponse.status}`)
          }

          const payload = await listResponse.json() as WineListApiResponse
          totalPages = payload.pagination.total_pages
          totalItems = payload.pagination.total_items
          allWines.push(...payload.items.map((item) => mapWineListItemToWineItem(item, locale)))
          page += 1
        }

        const entriesByWine = await Promise.all(
          allWines.map(async (wine): Promise<MyWineReviewEntry[]> => {
            const detailsResponse = await fetch(`${resolveApiBaseUrl()}/api/wines/${wine.id}`, {
              signal: controller.signal,
              credentials: 'include',
              headers: {
                Accept: 'application/json',
              },
            })

            if (!detailsResponse.ok) {
              throw new Error(`HTTP ${detailsResponse.status}`)
            }

            const detailsPayload = await detailsResponse.json() as WineDetailsApiResponse
            const myReviews = detailsPayload.wine.reviews.filter((review) => review.user.id === currentUserId)
            return myReviews.map((review) => ({ wine, review }))
          }),
        )

        if (controller.signal.aborted) {
          return
        }

        const entries = entriesByWine
          .flat()
          .sort((a, b) => new Date(b.review.created_at).getTime() - new Date(a.review.created_at).getTime())

        setReviewTotalWines(totalItems)
        setMyReviewEntries(entries)
        setMyReviewSummaryStatus('ready')
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return
        }

        setMyReviewSummaryStatus('error')
        setMyReviewSummaryError(error instanceof Error ? error.message : (locale === 'ca' ? 'No s’han pogut carregar les teves ressenyes.' : 'No se pudieron cargar tus reseñas.'))
      }
    }

    void loadMyReviews()

    return () => {
      controller.abort()
    }
  }, [menu, currentUserId, locale, reviewListReloadToken])

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
    setMenu('wines')
  }

  const selectedWineGalleryImages = useMemo(
    () => (selectedWineGallery
      ? [
          { key: 'bottle', src: selectedWineGallery.galleryPreview.bottle },
          { key: 'front', src: selectedWineGallery.galleryPreview.front },
          { key: 'back', src: selectedWineGallery.galleryPreview.back },
          { key: 'situation', src: selectedWineGallery.galleryPreview.situation },
        ] as const
      : SAMPLE_WINE_GALLERY),
    [selectedWineGallery],
  )
  const selectedWineDoLogo = selectedWineSheetDetails?.do
    ? doLogoPathFromImageName(selectedWineSheetDetails.do.do_logo)
    : (
        selectedWineSheet
          ? doLogoPathFromImageName(selectedWineSheet.doLogo)
          : null
      )
  const selectedWineCommunityFlagPath = selectedWineSheetDetails?.do?.region_logo
    ? regionLogoPathFromImageName(selectedWineSheetDetails.do.region_logo)
    : (selectedWineSheet?.regionLogo ? regionLogoPathFromImageName(selectedWineSheet.regionLogo) : null)

  const selectedWineAverageScore = useMemo(() => {
    if (!selectedWineSheetDetails) {
      return selectedWineSheet?.averageScore ?? null
    }

    const scores = selectedWineSheetDetails.reviews
      .map((review) => review.score)
      .filter((score): score is number => score != null)
    if (scores.length === 0) {
      return selectedWineSheet?.averageScore ?? null
    }
    const sum = scores.reduce((acc, score) => acc + score, 0)
    return Number((sum / scores.length).toFixed(1))
  }, [selectedWineSheetDetails, selectedWineSheet])

  const selectedWineGrapeDistribution = useMemo(() => {
    if (!selectedWineSheetDetails) {
      return []
    }

    const rows = selectedWineSheetDetails.grapes
      .filter((grape) => grape.percentage != null && grape.percentage > 0)
      .map((grape) => ({
        name: grape.name,
        value: Number(grape.percentage),
      }))

    const total = rows.reduce((sum, row) => sum + row.value, 0)
    if (rows.length < 2 || total <= 0) {
      return []
    }

    return rows.map((row) => ({
      ...row,
      normalized: (row.value / total) * 100,
    }))
  }, [selectedWineSheetDetails])

  const selectedWineGrapePie = useMemo(() => {
    if (selectedWineGrapeDistribution.length === 0) {
      return ''
    }

    const palette = ['#8f3851', '#c16786', '#d68aa3', '#b56a4a', '#9f7a55', '#7f6f66']
    let start = 0
    const segments: string[] = []
    selectedWineGrapeDistribution.forEach((entry, index) => {
      const end = Math.min(100, start + entry.normalized)
      segments.push(`${palette[index % palette.length]} ${start.toFixed(2)}% ${end.toFixed(2)}%`)
      start = end
    })
    return `conic-gradient(${segments.join(', ')})`
  }, [selectedWineGrapeDistribution])

  const selectedWinePhotoSlots = useMemo(() => {
    const types: WinePhotoSlotType[] = ['bottle', 'front_label', 'back_label', 'situation']
    const photos = selectedWineSheetDetails?.photos ?? []

    return types.map((type) => {
      const uploaded = photos.find((photo) => photo.type === type)
      const src = uploaded ? resolveApiAssetUrl(uploaded.url) : getDefaultNoPhotoSrc()
      return {
        type,
        src,
        uploaded: uploaded != null,
      }
    })
  }, [selectedWineSheetDetails])

  const wineEditPhotoSlots = useMemo(() => {
    const types: WinePhotoSlotType[] = ['bottle', 'front_label', 'back_label', 'situation']
    const photos = wineEditDetails?.photos ?? []

    return types.map((type) => {
      const uploaded = photos.find((photo) => photo.type === type)
      const src = uploaded ? resolveApiAssetUrl(uploaded.url) : getDefaultNoPhotoSrc()
      return {
        type,
        src,
        uploaded: uploaded != null,
      }
    })
  }, [wineEditDetails])

  const renderWinePhotoManager = (wineId: number, slots: Array<{ type: WinePhotoSlotType; src: string; uploaded: boolean }>) => (
    <section className="panel wine-profile-photos-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">{locale === 'ca' ? 'FOTOS' : 'FOTOS'}</p>
          <h3>{locale === 'ca' ? 'Galeria del vi' : 'Galería del vino'}</h3>
        </div>
        <div className="panel-header-actions">
          <span className="pill">{slots.filter((slot) => slot.uploaded).length}/4 {locale === 'ca' ? 'pujades' : 'subidas'}</span>
        </div>
      </div>
      <div className="wine-sheet-thumbnail-row">
        {slots.map((photo) => (
          <div key={photo.type} className="wine-sheet-mini-photo">
            <img
              src={photo.src}
              alt={`${labelForPhotoType(photo.type, locale)}`}
              loading="lazy"
              onError={fallbackToDefaultWineIcon}
            />
            <span>{labelForPhotoType(photo.type, locale)}</span>
            <div className="wine-photo-actions">
              <button
                type="button"
                className="ghost-button tiny photo-icon-button"
                onClick={() => startPhotoPick(wineId, photo.type)}
                title={locale === 'ca' ? 'Editar foto' : 'Editar foto'}
                aria-label={locale === 'ca' ? 'Editar foto' : 'Editar foto'}
              >
                <svg className="table-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M3 17.25V21h3.75L18.37 9.38l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.62-9.62.92.92-9.62 9.62zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.5 1.5 3.75 3.75 1.5-1.5z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="ghost-button tiny danger photo-icon-button"
                onClick={() => {
                  void resetWinePhotoToDefault(wineId, photo.type)
                }}
                disabled={photoDeleteBusyType === photo.type}
                title={locale === 'ca' ? 'Eliminar foto' : 'Eliminar foto'}
                aria-label={locale === 'ca' ? 'Eliminar foto' : 'Eliminar foto'}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )

  const uploadWinePhoto = async (wineId: number, type: WinePhotoSlotType, file: File): Promise<string | null> => {
    const body = new FormData()
    body.set('type', type)
    body.set('file', file)

    const response = await fetch(`${resolveApiBaseUrl()}/api/wines/${wineId}/photos`, {
      method: 'POST',
      body,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = await response.json() as { photo?: { url?: string } }
    return payload.photo?.url ?? null
  }

  const startPhotoPick = (wineId: number, type: WinePhotoSlotType) => {
    setPhotoEditorWineId(wineId)
    setPhotoPickerType(type)
    setPhotoEditorError(null)
    photoPickerInputRef.current?.click()
  }

  const handlePhotoPickerChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || photoPickerType == null) {
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPhotoEditorType(photoPickerType)
    setPhotoEditorSource(objectUrl)
    setPhotoEditorZoom(1)
    setPhotoEditorOffsetX(0)
    setPhotoEditorOffsetY(0)
    setPhotoEditorError(null)
    event.currentTarget.value = ''
  }

  const closePhotoEditor = () => {
    if (photoEditorSource != null) {
      URL.revokeObjectURL(photoEditorSource)
    }
    setPhotoEditorType(null)
    setPhotoEditorWineId(null)
    setPhotoEditorSource(null)
    setPhotoEditorSaving(false)
    setPhotoEditorError(null)
    setPhotoEditorZoom(1)
    setPhotoEditorOffsetX(0)
    setPhotoEditorOffsetY(0)
    photoEditorDragRef.current = null
    photoEditorPinchRef.current = null
    photoEditorPointersRef.current.clear()
  }

  const drawPhotoEditorPreview = async (): Promise<{ canvas: HTMLCanvasElement; outputFileName: string } | null> => {
    if (photoEditorSource == null || photoEditorType == null) {
      return null
    }
    const canvas = photoEditorCanvasRef.current
    if (canvas == null) {
      return null
    }

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('image_load_error'))
      img.src = photoEditorSource
    })

    const isBottlePhoto = photoEditorType === 'bottle'
    const isSituationPhoto = photoEditorType === 'situation'
    const maxFreeSide = 2048
    const freeScale = isSituationPhoto ? Math.min(1, maxFreeSide / Math.max(image.naturalWidth, image.naturalHeight)) : 1
    const outputWidth = isSituationPhoto
      ? Math.max(1, Math.round(image.naturalWidth * freeScale))
      : (isBottlePhoto ? 576 : 768)
    const outputHeight = isSituationPhoto
      ? Math.max(1, Math.round(image.naturalHeight * freeScale))
      : 1024
    canvas.width = outputWidth
    canvas.height = outputHeight
    const ctx = canvas.getContext('2d')
    if (ctx == null) {
      return null
    }

    const baseScale = isSituationPhoto ? Math.min(outputWidth / image.naturalWidth, outputHeight / image.naturalHeight) : Math.max(outputWidth / image.naturalWidth, outputHeight / image.naturalHeight)
    const effectiveScale = isSituationPhoto ? baseScale : (baseScale * photoEditorZoom)
    const drawWidth = image.naturalWidth * effectiveScale
    const drawHeight = image.naturalHeight * effectiveScale

    const panMaxX = isSituationPhoto ? 0 : Math.max(0, (drawWidth - outputWidth) / 2)
    const panMaxY = isSituationPhoto ? 0 : Math.max(0, (drawHeight - outputHeight) / 2)
    const offsetPxX = (photoEditorOffsetX / 100) * panMaxX
    const offsetPxY = (photoEditorOffsetY / 100) * panMaxY

    const drawX = (outputWidth - drawWidth) / 2 + offsetPxX
    const drawY = (outputHeight - drawHeight) / 2 + offsetPxY

    ctx.clearRect(0, 0, outputWidth, outputHeight)
    ctx.fillStyle = '#0f0b0c'
    ctx.fillRect(0, 0, outputWidth, outputHeight)
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)

    return {
      canvas,
      outputFileName: `${photoEditorType}.jpg`,
    }
  }

  const photoEditorDistance = (a: { x: number; y: number }, b: { x: number; y: number }): number => {
    const dx = b.x - a.x
    const dy = b.y - a.y
    return Math.hypot(dx, dy)
  }

  const photoEditorMidpoint = (a: { x: number; y: number }, b: { x: number; y: number }): { x: number; y: number } => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  })

  const beginPhotoEditorPinch = (rect: DOMRect) => {
    const points = [...photoEditorPointersRef.current.values()]
    if (points.length < 2 || photoEditorType === 'situation') {
      photoEditorPinchRef.current = null
      return
    }

    const [first, second] = points
    const distance = photoEditorDistance(first, second)
    if (distance <= 0) {
      return
    }

    const midpoint = photoEditorMidpoint(first, second)
    photoEditorPinchRef.current = {
      baseDistance: distance,
      baseZoom: photoEditorZoom,
      baseOffsetX: photoEditorOffsetX,
      baseOffsetY: photoEditorOffsetY,
      baseMidX: midpoint.x,
      baseMidY: midpoint.y,
      rect,
    }
  }

  const handlePhotoEditorPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    photoEditorPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (photoEditorPointersRef.current.size >= 2) {
      photoEditorDragRef.current = null
      beginPhotoEditorPinch(event.currentTarget.getBoundingClientRect())
      return
    }

    photoEditorPinchRef.current = null
    photoEditorDragRef.current = {
      active: true,
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
    }
  }

  const handlePhotoEditorPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (photoEditorPointersRef.current.has(event.pointerId)) {
      photoEditorPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    }

    if (photoEditorPointersRef.current.size >= 2 && photoEditorType !== 'situation') {
      const points = [...photoEditorPointersRef.current.values()]
      const [first, second] = points
      if (first && second) {
        const pinchState = photoEditorPinchRef.current
        if (pinchState != null && pinchState.baseDistance > 0) {
          const distance = photoEditorDistance(first, second)
          const midpoint = photoEditorMidpoint(first, second)
          const scale = distance / pinchState.baseDistance
          const nextZoom = clamp(pinchState.baseZoom * scale, 1, 3)
          const deltaMidX = midpoint.x - pinchState.baseMidX
          const deltaMidY = midpoint.y - pinchState.baseMidY
          const nextOffsetX = clamp(pinchState.baseOffsetX + ((deltaMidX / pinchState.rect.width) * 100), -100, 100)
          const nextOffsetY = clamp(pinchState.baseOffsetY + ((deltaMidY / pinchState.rect.height) * 100), -100, 100)
          setPhotoEditorZoom(nextZoom)
          setPhotoEditorOffsetX(nextOffsetX)
          setPhotoEditorOffsetY(nextOffsetY)
        }
      }
      return
    }

    const drag = photoEditorDragRef.current
    if (!drag || !drag.active || drag.pointerId !== event.pointerId) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const deltaX = event.clientX - drag.lastX
    const deltaY = event.clientY - drag.lastY
    drag.lastX = event.clientX
    drag.lastY = event.clientY

    if (rect.width > 0) {
      setPhotoEditorOffsetX((current) => clamp(current + ((deltaX / rect.width) * 100), -100, 100))
    }
    if (rect.height > 0) {
      setPhotoEditorOffsetY((current) => clamp(current + ((deltaY / rect.height) * 100), -100, 100))
    }
  }

  const handlePhotoEditorPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId)
    photoEditorPointersRef.current.delete(event.pointerId)

    if (photoEditorPointersRef.current.size < 2) {
      photoEditorPinchRef.current = null
    }

    if (photoEditorDragRef.current?.pointerId === event.pointerId || photoEditorPointersRef.current.size === 0) {
      photoEditorDragRef.current = null
    }

    if (photoEditorPointersRef.current.size === 1) {
      const [pointerId, point] = [...photoEditorPointersRef.current.entries()][0]
      photoEditorDragRef.current = {
        active: true,
        pointerId,
        lastX: point.x,
        lastY: point.y,
      }
    }
  }

  const savePhotoEditor = async () => {
    if (photoEditorWineId == null || photoEditorType == null) {
      return
    }
    setPhotoEditorSaving(true)
    setPhotoEditorError(null)

    try {
      const rendered = await drawPhotoEditorPreview()
      if (rendered == null) {
        throw new Error('Unable to render image.')
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        rendered.canvas.toBlob(
          (result) => {
            if (result == null) {
              reject(new Error('Unable to generate output image.'))
              return
            }
            resolve(result)
          },
          'image/jpeg',
          0.92,
        )
      })

      const file = new File([blob], rendered.outputFileName, { type: 'image/jpeg' })
      const uploadedUrl = await uploadWinePhoto(photoEditorWineId, photoEditorType, file)
      closePhotoEditor()
      setWineProfileReloadToken((current) => current + 1)
      setWineEditReloadToken((current) => current + 1)
      setWineListReloadToken((current) => current + 1)
      if (uploadedUrl != null) {
        const resolvedUploadedUrl = resolveApiAssetUrl(uploadedUrl)
        setSelectedWineGallery((current) => {
          if (current == null || current.id !== photoEditorWineId) {
            return current
          }

          return {
            ...current,
            thumbnailSrc: photoEditorType === 'bottle' ? resolvedUploadedUrl : current.thumbnailSrc,
            galleryPreview: {
              ...current.galleryPreview,
              ...(photoEditorType === 'bottle' ? { bottle: resolvedUploadedUrl } : {}),
              ...(photoEditorType === 'front_label' ? { front: resolvedUploadedUrl } : {}),
              ...(photoEditorType === 'back_label' ? { back: resolvedUploadedUrl } : {}),
              ...(photoEditorType === 'situation' ? { situation: resolvedUploadedUrl } : {}),
            },
          }
        })
      }
    } catch (error: unknown) {
      setPhotoEditorError(error instanceof Error ? error.message : (locale === 'ca' ? 'No s’ha pogut pujar la foto.' : 'No se pudo subir la foto.'))
    } finally {
      setPhotoEditorSaving(false)
    }
  }

  const resetWinePhotoToDefault = async (wineId: number, type: WinePhotoSlotType) => {
    setPhotoDeleteBusyType(type)
    try {
      const defaultResponse = await fetch(getDefaultNoPhotoSrc(), { credentials: 'include' })
      if (!defaultResponse.ok) {
        throw new Error(`HTTP ${defaultResponse.status}`)
      }
      const blob = await defaultResponse.blob()
      const file = new File([blob], `${type}-default.png`, { type: blob.type || 'image/png' })
      const uploadedUrl = await uploadWinePhoto(wineId, type, file)
      setWineProfileReloadToken((current) => current + 1)
      setWineEditReloadToken((current) => current + 1)
      setWineListReloadToken((current) => current + 1)
      if (uploadedUrl != null) {
        const resolvedUploadedUrl = resolveApiAssetUrl(uploadedUrl)
        setSelectedWineGallery((current) => {
          if (current == null || current.id !== wineId) {
            return current
          }

          return {
            ...current,
            thumbnailSrc: type === 'bottle' ? resolvedUploadedUrl : current.thumbnailSrc,
            galleryPreview: {
              ...current.galleryPreview,
              ...(type === 'bottle' ? { bottle: resolvedUploadedUrl } : {}),
              ...(type === 'front_label' ? { front: resolvedUploadedUrl } : {}),
              ...(type === 'back_label' ? { back: resolvedUploadedUrl } : {}),
              ...(type === 'situation' ? { situation: resolvedUploadedUrl } : {}),
            },
          }
        })
      }
    } catch {
      setPhotoEditorError(locale === 'ca' ? 'No s’ha pogut eliminar la foto.' : 'No se pudo eliminar la foto.')
    } finally {
      setPhotoDeleteBusyType(null)
    }
  }

  useEffect(() => {
    if (photoEditorSource == null || photoEditorType == null) {
      return
    }

    void drawPhotoEditorPreview().catch(() => {
      setPhotoEditorError(locale === 'ca' ? 'No s’ha pogut previsualitzar la foto.' : 'No se pudo previsualizar la foto.')
    })
  }, [photoEditorSource, photoEditorType, photoEditorZoom, photoEditorOffsetX, photoEditorOffsetY, locale])

  const openReviewCreate = () => {
    setSelectedReviewForEdit(null)
    setMenu('reviewCreate')
    setShowMobileMenu(false)
  }

  const openReviewEdit = (wine: WineItem, review: WineDetailsApiReview) => {
    setSelectedReviewForEdit({
      id: review.id,
      wineId: wine.id,
      wineName: wine.name,
      score: review.score ?? 0,
      createdAt: review.created_at.slice(0, 10),
      notes: review.bullets.join(' · '),
      intensityAroma: review.intensity_aroma,
      sweetness: review.sweetness,
      acidity: review.acidity,
      tannin: review.tannin ?? 0,
      body: review.body,
      persistence: review.persistence,
      tags: review.bullets.map((bullet) => REVIEW_ENUM_TO_TAG[bullet]).filter((tag): tag is (typeof REVIEW_TAG_OPTIONS)[number] => tag != null),
    })
    setMenu('reviewEdit')
    setShowMobileMenu(false)
  }

  const deleteReview = async (wine: WineItem, review: WineDetailsApiReview) => {
    const confirmMessage = locale === 'ca'
      ? 'Vols eliminar aquesta ressenya?'
      : '¿Quieres eliminar esta reseña?'
    if (!window.confirm(confirmMessage)) {
      return
    }

    setReviewActionError(null)
    setReviewDeleteBusyId(review.id)

    try {
      const response = await fetch(`${resolveApiBaseUrl()}/api/wines/${wine.id}/reviews/${review.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok && response.status !== 204) {
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorPayload = await response.json() as { error?: string }
          if (typeof errorPayload.error === 'string' && errorPayload.error.trim() !== '') {
            errorMessage = errorPayload.error
          }
        } catch {
          // Keep HTTP fallback error.
        }
        throw new Error(errorMessage)
      }

      setReviewListReloadToken((current) => current + 1)
      setReviewSuccessToast(locale === 'ca' ? 'Ressenya eliminada correctament.' : 'Reseña eliminada correctamente.')
    } catch (error: unknown) {
      setReviewActionError(error instanceof Error ? error.message : (locale === 'ca' ? 'No s’ha pogut eliminar la ressenya.' : 'No se pudo eliminar la reseña.'))
    } finally {
      setReviewDeleteBusyId(null)
    }
  }

  const reviewEditorPreset = buildReviewFormPreset(selectedReviewForEdit)
  const reviewedWineIdSet = useMemo(
    () => new Set(myReviewEntries.map((entry) => entry.wine.id)),
    [myReviewEntries],
  )
  const reviewWineFilterOptions = useMemo(
    () => myReviewEntries
      .map((entry) => ({ id: entry.wine.id, name: entry.wine.name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [myReviewEntries],
  )
  const filteredMyReviewEntries = useMemo(
    () => (reviewWineFilter === 'all'
      ? myReviewEntries
      : myReviewEntries.filter((entry) => entry.wine.id === reviewWineFilter)),
    [myReviewEntries, reviewWineFilter],
  )

  useEffect(() => {
    if (reviewWineFilter === 'all') {
      return
    }
    const stillExists = myReviewEntries.some((entry) => entry.wine.id === reviewWineFilter)
    if (!stillExists) {
      setReviewWineFilter('all')
    }
  }, [myReviewEntries, reviewWineFilter])

  const createReviewPreset = (() => {
    return buildReviewFormPreset(null)
  })()

  const openWineCreate = () => {
    setSelectedWineForEdit(null)
    setWineEditDetails(null)
    setWineEditStatus('idle')
    setGrapeBlendRows([{ id: 1, grapeId: firstGrapeOptionId, percentage: '' }])
    setAwardRows([])
    setCreateDoCountryFilter('spain')
    setCreateDoSearchText('')
    setIsCreateDoDropdownOpen(false)
    setCreateDoId('all')
    setManufacturingCountry('spain')
    setWineFormError(null)
    setMenu('wineCreate')
    setShowMobileMenu(false)
  }

  const openWineEdit = (wine: WineItem) => {
    setSelectedWineForEdit(wine)
    setWineEditDetails(null)
    setWineEditStatus('loading')
    setGrapeBlendRows([{ id: 1, grapeId: firstGrapeOptionId, percentage: '' }])
    setAwardRows([])
    const mappedCountry = countryLabelToFilterValue(wine.country)
    const normalizedCountry = mappedCountry === 'all' ? 'spain' : mappedCountry
    const matchedDo = doOptions.find((entry) => entry.name === wine.region) ?? null
    setCreateDoCountryFilter(matchedDo?.country ?? normalizedCountry)
    setCreateDoSearchText('')
    setIsCreateDoDropdownOpen(false)
    setCreateDoId(matchedDo?.id ?? 'all')
    setManufacturingCountry(normalizedCountry)
    setWineFormError(null)
    setMenu('wineEdit')
    setShowMobileMenu(false)
  }

  const openWineDeleteConfirm = (wine: WineItem) => {
    setWineDeleteTarget(wine)
    setWineDeleteError(null)
    setWineDeleteSubmitting(false)
  }

  const closeWineDeleteConfirm = () => {
    setWineDeleteTarget(null)
    setWineDeleteError(null)
    setWineDeleteSubmitting(false)
  }

  const confirmDeleteWine = async () => {
    if (!wineDeleteTarget) {
      return
    }

    setWineDeleteSubmitting(true)
    setWineDeleteError(null)
    try {
      const response = await fetch(`${resolveApiBaseUrl()}/api/wines/${wineDeleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok && response.status !== 204) {
        throw new Error(`HTTP ${response.status}`)
      }

      closeWineDeleteConfirm()
      if (wineItems.length === 1 && winePage > 1) {
        setWinePage((current) => Math.max(1, current - 1))
      } else {
        setWineListReloadToken((current) => current + 1)
      }
    } catch (error: unknown) {
      setWineDeleteError(error instanceof Error ? error.message : (locale === 'ca' ? 'No s’ha pogut eliminar el vi.' : 'No se pudo eliminar el vino.'))
      setWineDeleteSubmitting(false)
    }
  }

  const resetWineFilters = () => {
    setSearchText('')
    setTypeFilter('all')
    setGrapeFilter('all')
    setMinScoreFilter('all')
    setWineCountryFilter('all')
    setDoCountryFilter('all')
    setDoFilter('all')
    setDoSearchText('')
    setIsDoDropdownOpen(false)
    setWinePage(1)
  }

  const wineActiveFiltersCount = useMemo(() => {
    let count = 0
    if (searchText.trim() !== '') count += 1
    if (typeFilter !== 'all') count += 1
    if (grapeFilter !== 'all') count += 1
    if (minScoreFilter !== 'all') count += 1
    if (wineCountryFilter !== 'all') count += 1
    if (doFilter !== 'all') count += 1
    return count
  }, [doFilter, grapeFilter, minScoreFilter, searchText, typeFilter, wineCountryFilter])

  const renderWineFilters = (mode: 'desktop' | 'mobile') => (
    <>
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
                  const communityFlagPath = isSpanishDo ? regionLogoPathFromImageName(item.region_logo) : null
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

      {mode === 'mobile' ? (
        <div className="wine-mobile-filters-actions">
          <button
            type="button"
            className="ghost-button small"
            onClick={() => {
              resetWineFilters()
            }}
          >
            {locale === 'ca' ? 'Netejar filtres' : 'Limpiar filtros'}
          </button>
          <button
            type="button"
            className="primary-button small"
            onClick={() => {
              setIsDoDropdownOpen(false)
              setIsWineFiltersMobileOpen(false)
            }}
          >
            {locale === 'ca' ? 'Aplicar filtres' : 'Aplicar filtros'}
          </button>
        </div>
      ) : null}
    </>
  )

  const handleWineFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const isEditing = menu === 'wineEdit'
    if (isEditing && !selectedWineForEdit) {
      setWineFormError(locale === 'ca' ? 'No s’ha pogut identificar el vi a editar.' : 'No se pudo identificar el vino a editar.')
      return
    }

    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    if (name === '') {
      setWineFormError(locale === 'ca' ? 'El nom del vi és obligatori.' : 'El nombre del vino es obligatorio.')
      return
    }

    const wineryRaw = String(form.get('winery') ?? '').trim()
    const wineType = String(form.get('wine_type') ?? '').trim()
    const agingType = String(form.get('aging_type') ?? '').trim()
    const country = manufacturingCountry
    const doId = createDoId === 'all' ? null : createDoId
    const vintageYearRaw = String(form.get('vintage_year') ?? '').trim()
    const alcoholRaw = String(form.get('alcohol_percentage') ?? '').trim()
    const placeType = String(form.get('place_type') ?? '').trim()
    const placeName = String(form.get('place_name') ?? '').trim()
    const placeAddressRaw = String(form.get('place_address') ?? '').trim()
    const placeCityRaw = String(form.get('place_city') ?? '').trim()
    const pricePaidRaw = String(form.get('price_paid') ?? '').trim()
    const purchasedAtRaw = String(form.get('purchased_at') ?? '').trim()

    if (placeName === '' || pricePaidRaw === '' || purchasedAtRaw === '') {
      setWineFormError(
        locale === 'ca'
          ? 'Compra incompleta: lloc, preu i data són obligatoris.'
          : 'Compra incompleta: lugar, precio y fecha son obligatorios.',
      )
      return
    }

    const grapes = grapeBlendRows
      .map((row) => {
        const grapeId = Number.parseInt(row.grapeId, 10)
        if (!Number.isInteger(grapeId) || grapeId <= 0) {
          return null
        }

        const percentageText = row.percentage.trim()
        const percentageValue = percentageText === '' ? null : Number(percentageText)
        const percentage = Number.isFinite(percentageValue) ? percentageValue : null

        return {
          grape_id: grapeId,
          percentage,
        }
      })
      .filter((row): row is { grape_id: number; percentage: number | null } => row !== null)

    const awards = awardRows
      .map((row) => {
        const score = row.score.trim()
        const year = row.year.trim()
        return {
          name: row.award.trim(),
          score: score === '' ? null : Number(score),
          year: year === '' ? null : Number.parseInt(year, 10),
        }
      })
      .filter((row) => row.name !== '' && (row.score === null || Number.isFinite(row.score)) && (row.year === null || Number.isInteger(row.year)))

    const payload = {
      name,
      winery: wineryRaw === '' ? null : wineryRaw,
      wine_type: wineType === '' ? null : wineType,
      country,
      aging_type: agingType === '' ? null : agingType,
      do_id: doId,
      vintage_year: vintageYearRaw === '' ? null : Number.parseInt(vintageYearRaw, 10),
      alcohol_percentage: alcoholRaw === '' ? null : Number(alcoholRaw),
      grapes,
      purchases: [
        {
          place: {
            place_type: placeType,
            name: placeName,
            address: placeAddressRaw === '' ? null : placeAddressRaw,
            city: placeCityRaw === '' ? null : placeCityRaw,
            country,
          },
          price_paid: pricePaidRaw,
          purchased_at: purchasedAtRaw,
        },
      ],
      awards,
    }

    const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
    const fallbackBase = window.location.port.startsWith('517') ? 'http://localhost:8080' : window.location.origin
    const apiBaseUrl = configuredBase && configuredBase.length > 0 ? configuredBase : fallbackBase

    setWineFormSubmitting(true)
    setWineFormError(null)

    fetch(isEditing ? `${apiBaseUrl}/api/wines/${selectedWineForEdit?.id}` : `${apiBaseUrl}/api/wines`, {
      method: isEditing ? 'PUT' : 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          let backendMessage = ''
          try {
            const data = await response.json() as { error?: string }
            backendMessage = typeof data.error === 'string' ? data.error : ''
          } catch {
            backendMessage = ''
          }
          throw new Error(backendMessage || `HTTP ${response.status}`)
        }
      })
      .then(() => {
        const toastMessage = isEditing
          ? (locale === 'ca'
            ? `El vi "${name}" s'ha actualitzat correctament.`
            : `El vino "${name}" se ha actualizado correctamente.`)
          : (locale === 'ca'
            ? `El vi "${name}" s'ha creat correctament.`
            : `El vino "${name}" se ha creado correctamente.`)
        setWineSuccessToast(toastMessage)

        if (isEditing) {
          setSelectedWineForEdit(null)
          setWineEditDetails(null)
          setWineEditStatus('idle')
        }
        setMenu('wines')
        setWinePage(1)
        setWineListReloadToken((current) => current + 1)
        setShowMobileMenu(false)
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          setWineFormError(error.message)
          return
        }
        setWineFormError(
          isEditing
            ? (locale === 'ca' ? 'No s’ha pogut actualitzar el vi.' : 'No se pudo actualizar el vino.')
            : (locale === 'ca' ? 'No s’ha pogut crear el vi.' : 'No se pudo crear el vino.'),
        )
      })
      .finally(() => {
        setWineFormSubmitting(false)
      })
  }

  useEffect(() => {
    if (wineSuccessToast == null) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setWineSuccessToast(null)
    }, 4000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [wineSuccessToast])

  useEffect(() => {
    if (reviewSuccessToast == null) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setReviewSuccessToast(null)
    }, 4000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [reviewSuccessToast])

  useEffect(() => {
    if (doSuccessToast == null) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setDoSuccessToast(null)
    }, 2600)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [doSuccessToast])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }
    if (loggedIn) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const previousOverscroll = document.body.style.overscrollBehavior
    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.overscrollBehavior = previousOverscroll
    }
  }, [loggedIn])

  const handleReviewFormSubmit = (mode: 'create' | 'edit') => async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setReviewFormError(null)
    setReviewFormSubmitting(true)

    const form = event.currentTarget
    const data = new FormData(form)

    const wineIdRaw = String(data.get('wine_id') ?? '').trim()
    const scoreRaw = String(data.get('score') ?? '').trim()
    const intensityRaw = String(data.get('intensity_aroma') ?? '').trim()
    const sweetnessRaw = String(data.get('sweetness') ?? '').trim()
    const acidityRaw = String(data.get('acidity') ?? '').trim()
    const tanninRaw = String(data.get('tannin') ?? '').trim()
    const bodyRaw = String(data.get('body') ?? '').trim()
    const persistenceRaw = String(data.get('persistence') ?? '').trim()
    const bulletsRaw = data.getAll('bullets').map((value) => String(value)) as Array<(typeof REVIEW_TAG_OPTIONS)[number]>
    const createdAtRaw = String(data.get('created_at') ?? '').trim()

    const wineId = Number(wineIdRaw)
    const score = Number(scoreRaw)
    const intensityAroma = Number(intensityRaw)
    const sweetness = Number(sweetnessRaw)
    const acidity = Number(acidityRaw)
    const tannin = Number(tanninRaw)
    const body = Number(bodyRaw)
    const persistence = Number(persistenceRaw)

    if (!Number.isInteger(wineId) || wineId < 1) {
      setReviewFormError(locale === 'ca' ? 'Has de seleccionar un vi.' : 'Debes seleccionar un vino.')
      setReviewFormSubmitting(false)
      return
    }

    const payload = {
      score: Math.max(0, Math.min(100, Math.round(score))),
      intensity_aroma: Math.max(0, Math.min(10, Math.round(intensityAroma))),
      sweetness: Math.max(0, Math.min(10, Math.round(sweetness))),
      acidity: Math.max(0, Math.min(10, Math.round(acidity))),
      tannin: Math.max(0, Math.min(10, Math.round(tannin))),
      body: Math.max(0, Math.min(10, Math.round(body))),
      persistence: Math.max(0, Math.min(10, Math.round(persistence))),
      bullets: bulletsRaw.map((tag) => REVIEW_TAG_TO_ENUM[tag]),
      created_at: createdAtRaw === '' ? undefined : createdAtRaw,
    }

    const endpoint = mode === 'create'
      ? `${resolveApiBaseUrl()}/api/wines/${wineId}/reviews`
      : `${resolveApiBaseUrl()}/api/wines/${wineId}/reviews/${selectedReviewForEdit?.id ?? 0}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    try {
      const response = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorPayload = await response.json() as { error?: string }
          if (typeof errorPayload.error === 'string' && errorPayload.error.trim() !== '') {
            errorMessage = errorPayload.error
          }
        } catch {
          // Keep HTTP-based fallback error message when response is not JSON.
        }
        throw new Error(errorMessage)
      }

      setMenu('reviews')
      setReviewListReloadToken((current) => current + 1)
      setReviewSuccessToast(
        mode === 'create'
          ? (locale === 'ca' ? 'Ressenya creada correctament.' : 'Reseña creada correctamente.')
          : (locale === 'ca' ? 'Ressenya actualitzada correctament.' : 'Reseña actualizada correctamente.'),
      )
    } catch (error: unknown) {
      setReviewFormError(error instanceof Error ? error.message : (locale === 'ca' ? 'No s’ha pogut desar la ressenya.' : 'No se pudo guardar la reseña.'))
    } finally {
      setReviewFormSubmitting(false)
    }
  }

  const handleSettingsProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSettingsProfileError(null)
    setSettingsProfileSuccess(null)

    const trimmedName = settingsName.trim()
    const trimmedLastname = settingsLastname.trim()

    if (trimmedName === '' || trimmedLastname === '') {
      setSettingsProfileError(locale === 'ca' ? 'Nom i cognom són obligatoris.' : 'Nombre y apellido son obligatorios.')
      return
    }

    setSettingsProfileSubmitting(true)

    try {
      const response = await fetch(`${resolveApiBaseUrl()}/api/auth/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          lastname: trimmedLastname,
          password: settingsPassword.trim() === '' ? null : settingsPassword,
        }),
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorPayload = await response.json() as { error?: string }
          if (typeof errorPayload.error === 'string' && errorPayload.error.trim() !== '') {
            errorMessage = errorPayload.error
          }
        } catch {
          // Keep HTTP fallback error message when response is not JSON.
        }
        throw new Error(errorMessage)
      }

      const payload = await response.json() as AuthApiResponse
      setCurrentUser({
        id: payload.user.id,
        email: payload.user.email,
        name: payload.user.name,
        lastname: payload.user.lastname,
      })
      setSettingsPassword('')
      setSettingsProfileSuccess(locale === 'ca' ? 'Perfil actualitzat correctament.' : 'Perfil actualizado correctamente.')
    } catch (error: unknown) {
      setSettingsProfileError(error instanceof Error ? error.message : (locale === 'ca' ? 'No s’ha pogut actualitzar el perfil.' : 'No se pudo actualizar el perfil.'))
    } finally {
      setSettingsProfileSubmitting(false)
    }
  }

  const renderReviewEditor = (mode: 'create' | 'edit', preset: ReviewFormPreset) => {
    const reviewFormId = `review-form-${mode}-${selectedReviewForEdit?.id ?? 'new'}`
    const reviewSubmitLabel = mode === 'create'
      ? (reviewFormSubmitting ? (locale === 'ca' ? 'Creant...' : 'Creando...') : labels.reviews.create.submit)
      : (reviewFormSubmitting
        ? (locale === 'ca' ? 'Desant...' : 'Guardando...')
        : (locale === 'ca' ? 'Desar canvis de la ressenya' : 'Guardar cambios de la reseña'))

    return (
      <section className="screen-grid">
        <section className="panel">
          <div className="panel-header wine-create-header">
          <div>
            <p className="eyebrow">{labels.reviews.create.eyebrow}</p>
            <h3>{mode === 'create' ? (locale === 'ca' ? 'Crear ressenya' : 'Crear reseña') : (locale === 'ca' ? 'Editar ressenya' : 'Editar reseña')}</h3>
          </div>
          <div className="panel-header-actions">
            <button type="button" className="ghost-button small review-editor-back-button" onClick={() => setMenu('reviews')}>
              <svg className="review-editor-back-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M14.7 5.3a1 1 0 0 1 0 1.4L10.41 11H20a1 1 0 1 1 0 2h-9.59l4.3 4.3a1 1 0 1 1-1.42 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.42 0Z"
                  fill="currentColor"
                />
              </svg>
              <span className="review-editor-back-text">{locale === 'ca' ? 'Tornar al llistat' : 'Volver al listado'}</span>
            </button>
            <button type="submit" className="primary-button small" form={reviewFormId} disabled={reviewFormSubmitting}>
              {reviewSubmitLabel}
            </button>
          </div>
          </div>

          <form
            id={reviewFormId}
            key={`${mode}-${selectedReviewForEdit?.id ?? 'new'}`}
            className="stack-form"
            onSubmit={handleReviewFormSubmit(mode)}
          >
          <label>
            {labels.reviews.create.wine}
            <select name="wine_id" defaultValue={preset.wineId}>
              <option value="" disabled>{labels.reviews.create.selectWine}</option>
              {wineItems.map((wine) => (
                <option
                  key={wine.id}
                  value={wine.id}
                  disabled={mode === 'create' && reviewedWineIdSet.has(wine.id)}
                >
                  {wine.name} · {wine.winery}
                  {mode === 'create' && reviewedWineIdSet.has(wine.id)
                    ? ` ${locale === 'ca' ? '(ja ressenyat)' : '(ya reseñado)'}`
                    : ''}
                </option>
              ))}
            </select>
            {mode === 'create' ? (
              <small className="muted">
                {locale === 'ca'
                  ? 'Els vins ja ressenyats apareixen en gris i no es poden seleccionar.'
                  : 'Los vinos ya reseñados aparecen en gris y no se pueden seleccionar.'}
              </small>
            ) : null}
          </label>

          <label>
            {locale === 'ca' ? 'Data de la ressenya' : 'Fecha de la reseña'}
            <input type="date" name="created_at" defaultValue={preset.tastingDate} />
          </label>

          <fieldset className="form-block">
            <legend>{locale === 'ca' ? 'Valoració del Vi' : 'Valoración del Vino'}</legend>
            <label className="important-rating-field">
              <span>{locale === 'ca' ? 'Valoració General (0-100)' : 'Valoración General (0-100)'}</span>
              <select name="score" defaultValue={String(preset.overallScore)}>
                {SCORE_OPTIONS_0_TO_100.map((score) => (
                  <option key={score} value={score}>{score}</option>
                ))}
              </select>
            </label>
            <div className="inline-grid triple">
              <label>
                {locale === 'ca' ? 'Aroma' : 'Aroma'}
                <select name="intensity_aroma" defaultValue={String(preset.aroma)}>
                  {SCORE_OPTIONS_0_TO_10.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
              <label>
                {locale === 'ca' ? 'Dolçor' : 'Dulzor'}
                <select name="sweetness" defaultValue={String(preset.sweetness)}>
                  {SCORE_OPTIONS_0_TO_10.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
              <label>
                {locale === 'ca' ? 'Acidesa' : 'Acidez'}
                <select name="acidity" defaultValue={String(preset.acidity)}>
                  {SCORE_OPTIONS_0_TO_10.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="inline-grid triple">
              <label>
                {locale === 'ca' ? 'Taní' : 'Tanino'}
                <select name="tannin" defaultValue={String(preset.tannin)}>
                  {SCORE_OPTIONS_0_TO_10.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
              <label>
                {locale === 'ca' ? 'Cos' : 'Cuerpo'}
                <select name="body" defaultValue={String(preset.body)}>
                  {SCORE_OPTIONS_0_TO_10.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
              <label>
                {locale === 'ca' ? 'Persistència' : 'Persistencia'}
                <select name="persistence" defaultValue={String(preset.persistence)}>
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
                    <input type="checkbox" name="bullets" value={tag} defaultChecked={preset.tags.includes(tag)} />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

            {reviewFormError ? <p className="error-message">{reviewFormError}</p> : null}
          </form>
        </section>
      </section>
    )
  }

  const wineFormId = `wine-form-${menu}-${selectedWineForEdit?.id ?? 'new'}-${wineEditDetails?.id ?? 'none'}-${wineEditStatus}`
  const wineSubmitLabel = menu === 'wineEdit'
    ? (wineFormSubmitting ? (locale === 'ca' ? 'Desant...' : 'Guardando...') : (locale === 'ca' ? 'Desar vi' : 'Guardar vino'))
    : (wineFormSubmitting ? (locale === 'ca' ? 'Creant...' : 'Creando...') : labels.wines.add.submit)

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
    const publicWebUrl = (import.meta.env.VITE_PUBLIC_WEB_URL as string | undefined)?.trim() || '/'

    return (
      <main className="login-shell">
        <a
          className="ghost-button small return-web-link return-web-top-link return-web-top-link-right"
          href={publicWebUrl}
        >
          {locale === 'ca' ? 'Web pública' : 'Web pública'}
        </a>
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
          <img src={brandIconSrc} className="brand-mark" alt="Tat & Rosset icon" />
          <div className="sidebar-brand-copy">
            <img src={brandWordmarkSidebarSrc} className="brand-logo brand-logo-sidebar" alt="Vins Tat & Rosset" />
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
              <img src={brandWordmarkTopbarSrc} className="topbar-mobile-wordmark" alt="Vins Tat & Rosset" />
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
            <p className="eyebrow">{labels.topbar.overview}</p>
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
            {genericStatsStatus === 'error' ? (
              <p className="panel-inline-error">
                {locale === 'ca' ? 'No s’han pogut carregar els indicadors generals.' : 'No se han podido cargar los indicadores generales.'}
                {genericStatsError ? ` (${genericStatsError})` : ''}
              </p>
            ) : null}

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
                      <YAxis yAxisId="reviews" tick={{ fontSize: 11, fill: '#7a695f' }} axisLine={false} tickLine={false} width={28} domain={[0, 'dataMax + 1']} allowDecimals={false} />
                      <YAxis
                        yAxisId="avg"
                        orientation="right"
                        tick={{ fontSize: 11, fill: '#7a695f' }}
                        axisLine={false}
                        tickLine={false}
                        width={34}
                        domain={[0, 100]}
                        ticks={[0, 20, 40, 60, 80, 100]}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(143, 56, 81, 0.05)' }}
                        contentStyle={{ borderRadius: 12, border: '1px solid rgba(82,46,28,0.12)', background: 'rgba(255,252,248,0.96)' }}
                      />
                      <Bar yAxisId="reviews" dataKey="reviews" name={locale === 'ca' ? 'Ressenyes' : 'Reseñas'} fill="#c39a7f" radius={[6, 6, 0, 0]} />
                      <Line yAxisId="avg" type="monotone" dataKey="median" name={locale === 'ca' ? 'Mediana score' : 'Mediana score'} stroke="#8f3851" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                {reviewsPerMonthStatus === 'error' ? (
                  <p className="panel-inline-error">
                    {locale === 'ca' ? 'No s\'han pogut carregar les estadístiques del gràfic.' : 'No se han podido cargar las estadísticas del gráfico.'}
                    {reviewsPerMonthError ? ` (${reviewsPerMonthError})` : ''}
                  </p>
                ) : null}
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
                    const tone = bucket.label === '90+'
                      ? 'gold'
                      : bucket.label === '80-89'
                        ? 'silver'
                        : bucket.label === '70-79'
                          ? 'bronze'
                          : 'default'
                    return (
                      <div key={bucket.label} className="bucket-row">
                        <span>{bucket.label}</span>
                        <div className="bucket-track" aria-hidden="true">
                          <div className={`bucket-fill ${tone}`} style={{ width }} />
                        </div>
                        <strong>{bucket.count}</strong>
                      </div>
                    )
                  })}
                </div>
                {scoringGenericStatsStatus === 'error' ? (
                  <p className="panel-inline-error">
                    {locale === 'ca' ? 'No s’ha pogut carregar la distribució de score.' : 'No se ha podido cargar la distribución de score.'}
                    {scoringGenericStatsError ? ` (${scoringGenericStatsError})` : ''}
                  </p>
                ) : null}
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
                    <h3>Qualifications</h3>
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
                        background: `conic-gradient(#8f3851 0 ${(dashboardAnalytics.awardsWith / Math.max(1, wineItems.length)) * 360}deg, rgba(82,46,28,0.12) 0 360deg)`,
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
                  {isMobileViewport ? (
                    <button
                      type="button"
                      className="secondary-button small wine-mobile-filters-trigger"
                      onClick={() => {
                        setIsWineFiltersMobileOpen(true)
                      }}
                    >
                      {locale === 'ca' ? 'Filtres' : 'Filtros'}
                      <span className="wine-mobile-filters-trigger-count">
                        {wineActiveFiltersCount}
                      </span>
                    </button>
                  ) : null}
                  <button type="button" className="primary-button" onClick={openWineCreate}>
                    {locale === 'ca' ? 'Crear nou vi' : 'Crear nuevo vino'}
                  </button>
                </div>
              </div>

              {!isMobileViewport ? (
                <div className="wine-filters-desktop">
                  {renderWineFilters('desktop')}
                </div>
              ) : null}

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
                      <th className="wine-col-region-header">{locale === 'ca' ? 'País de fabricació' : 'País de fabricación'}</th>
                      <th>{locale === 'ca' ? 'Anyada' : 'Añada'}</th>
                      <th className="wine-col-do-header">D.O.</th>
                      <th>{labels.dashboard.table.avg}</th>
                      <th>{locale === 'ca' ? 'Accions' : 'Acciones'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wineItems.map((wine) => {
                      const doCommunityFlagPath = wine.regionLogo ? regionLogoPathFromImageName(wine.regionLogo) : null
                      const scoreTone = medalToneFromScore(wine.averageScore)

                      return (
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
                            src={wine.thumbnailSrc}
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
                          {wine.averageScore == null ? null : (
                            <span className={`wine-score-chip wine-thumb-score ${scoreTone}`}>
                              <strong>{Number.isInteger(wine.averageScore) ? wine.averageScore.toFixed(0) : wine.averageScore.toFixed(1)}</strong>
                              <small>/100</small>
                            </span>
                          )}
                        </td>
                        <td className="wine-col-main" data-label={labels.dashboard.table.wine}>
                          <strong>{wine.name}</strong>
                          <span>{wine.winery}</span>
                        </td>
                        <td className="wine-col-type" data-label={labels.dashboard.table.type}>
                          <span className="wine-cell-value">{wineTypeLabel(wine.type)}</span>
                        </td>
                        <td className="wine-col-region" data-label={locale === 'ca' ? 'País de fabricació' : 'País de fabricación'}>
                          <span className="wine-country-chip">
                            {countryFlagPath(wine.country) ? (
                              <img
                                className="wine-country-flag"
                                src={countryFlagPath(wine.country) as string}
                                alt={localizedCountryName(wine.country, locale)}
                                loading="lazy"
                                onError={fallbackToAdminAsset}
                              />
                            ) : (
                              <span className="wine-country-emoji" aria-hidden="true">{countryFlagEmoji(wine.country)}</span>
                            )}
                            <span className="wine-country-name">{localizedCountryName(wine.country, locale)}</span>
                          </span>
                        </td>
                        <td className="wine-col-vintage" data-label={locale === 'ca' ? 'Anyada' : 'Añada'}>
                          <span className="wine-cell-value">{wine.vintageYear ?? '-'}</span>
                        </td>
                        <td className="wine-col-aging" data-label={locale === 'ca' ? 'Criança' : 'Crianza'}>
                          <span className="wine-cell-value">{labelForAgingType(wine.agingType, locale)}</span>
                        </td>
                        <td className="wine-col-do" data-label="D.O.">
                          {wine.doName ? (
                            <span className="wine-do-chip">
                              <span className="wine-do-value">{wine.doName}</span>
                              <span className="wine-do-icons" aria-hidden="true">
                              {doCommunityFlagPath ? (
                                <img
                                  src={doCommunityFlagPath}
                                  alt=""
                                  className="wine-do-community-flag"
                                  loading="lazy"
                                  aria-hidden="true"
                                  onError={fallbackToAdminAsset}
                                />
                              ) : null}
                              {doLogoPathFromImageName(wine.doLogo) ? (
                                <img
                                  src={doLogoPathFromImageName(wine.doLogo) as string}
                                  alt=""
                                  className="wine-do-logo"
                                  loading="lazy"
                                  aria-hidden="true"
                                  onError={fallbackToAdminAsset}
                                />
                              ) : null}
                              </span>
                            </span>
                          ) : <span className="wine-do-value">-</span>}
                        </td>
                        <td className="wine-col-score" data-label={labels.dashboard.table.avg}>
                          {wine.averageScore == null ? '-' : (
                            <span className={`wine-score-chip ${scoreTone}`}>
                              <strong>{Number.isInteger(wine.averageScore) ? wine.averageScore.toFixed(0) : wine.averageScore.toFixed(1)}</strong>
                              <small>/100</small>
                            </span>
                          )}
                        </td>
                        <td className="wine-col-actions" data-label={locale === 'ca' ? 'Accions' : 'Acciones'}>
                          <div className="wine-actions-wrap">
                            <button
                              type="button"
                              className="table-icon-button"
                              onClick={(event) => {
                                event.stopPropagation()
                                openWineEdit(wine)
                              }}
                              title={locale === 'ca' ? 'Editar vi' : 'Editar vino'}
                              aria-label={locale === 'ca' ? 'Editar vi' : 'Editar vino'}
                            >
                              <svg className="table-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path
                                  d="M3 17.25V21h3.75L18.37 9.38l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.62-9.62.92.92-9.62 9.62zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.5 1.5 3.75 3.75 1.5-1.5z"
                                  fill="currentColor"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="table-icon-button danger"
                              onClick={(event) => {
                                event.stopPropagation()
                                openWineDeleteConfirm(wine)
                              }}
                              title={locale === 'ca' ? 'Eliminar vi' : 'Eliminar vino'}
                              aria-label={locale === 'ca' ? 'Eliminar vi' : 'Eliminar vino'}
                            >
                              <svg className="table-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path
                                  d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9zm1 12h8a2 2 0 0 0 2-2V8H6v11a2 2 0 0 0 2 2z"
                                  fill="currentColor"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                        </tr>
                      )
                    })}
                    {wineListStatus === 'loading' ? (
                      <tr>
                        <td colSpan={8}>{locale === 'ca' ? 'Carregant vins...' : 'Cargando vinos...'}</td>
                      </tr>
                    ) : null}
                    {wineListStatus === 'ready' && wineItems.length === 0 ? (
                      <tr>
                        <td colSpan={8}>{locale === 'ca' ? 'Cap vi trobat.' : 'No se encontraron vinos.'}</td>
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

        {menu === 'dos' ? (
          <section className="screen-grid">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{labels.dos.list.eyebrow}</p>
                  <h3>{labels.dos.list.title}</h3>
                </div>
                <div className="panel-header-actions">
                  <span className="pill">
                    {doDirectoryItems.length} {labels.dos.list.results}
                  </span>
                  <label className="do-sort-select">
                    <span className="do-sort-label">{locale === 'ca' ? 'Ordre' : 'Orden'}</span>
                    <span className="do-sort-field" aria-hidden="true">
                      <svg viewBox="0 0 24 24" focusable="false">
                        <path d="M7 6h10" />
                        <path d="M7 12h7" />
                        <path d="M7 18h4" />
                        <path d="m16 15 2.5 3 2.5-3" />
                      </svg>
                    </span>
                    <div className="do-sort-select-wrap">
                      <select
                        value={doSortPreset}
                        onChange={(event) => setDoSortPreset(event.target.value as DoSortPresetKey)}
                      >
                        {doSortPresetOptions.map((option) => (
                          <option key={option.key} value={option.key}>{option.label}</option>
                        ))}
                      </select>
                      <span className="do-sort-caret" aria-hidden="true">▾</span>
                    </div>
                  </label>
                  <button type="button" className="primary-button" onClick={() => announceDoAction('create')}>
                    {labels.dos.list.createAction}
                  </button>
                </div>
              </div>

              <div className="table-wrap">
                <table className="wine-table do-directory-table">
                  <thead>
                    <tr>
                      <th>{locale === 'ca' ? 'Logo' : 'Logo'}</th>
                      <th>{locale === 'ca' ? 'Nom' : 'Nombre'}</th>
                      <th>{labels.dashboard.table.region}</th>
                      <th>{locale === 'ca' ? 'País' : 'País'}</th>
                      <th>{locale === 'ca' ? 'Accions' : 'Acciones'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doDirectoryItems.map((item) => {
                      const logoPath = doLogoPathFromImageName(item.do_logo)
                      const regionLogoPath = regionLogoPathFromImageName(item.region_logo)
                      const communityFlagPath = regionLogoPath

                      return (
                        <tr key={item.id}>
                          <td className="do-directory-logo-cell" data-label="Logo">
                            <div className="do-directory-logo-stack">
                              {logoPath ? (
                                <img
                                  src={logoPath}
                                  alt={`${item.name} logo`}
                                  className="do-directory-logo"
                                  loading="lazy"
                                  onError={fallbackToAdminAsset}
                                />
                              ) : (
                                <span className="do-directory-logo-fallback" aria-hidden="true">D.O.</span>
                              )}
                              {communityFlagPath ? (
                                <img
                                  src={communityFlagPath}
                                  alt=""
                                  className="do-directory-community-flag"
                                  loading="lazy"
                                  aria-hidden="true"
                                  onError={fallbackToAdminAsset}
                                />
                              ) : null}
                            </div>
                          </td>
                          <td className="do-directory-name-cell" data-label={locale === 'ca' ? 'Nom' : 'Nombre'}>
                            <strong>{item.name}</strong>
                          </td>
                          <td data-label={labels.dashboard.table.region}>
                            <span className="wine-cell-value">{item.region}</span>
                          </td>
                          <td data-label={locale === 'ca' ? 'País' : 'País'}>
                            <span className="wine-country-chip">
                              {countryFlagPath(item.country) ? (
                                <img
                                  className="wine-country-flag"
                                  src={countryFlagPath(item.country) as string}
                                  alt={countryCodeToLabel(item.country, locale)}
                                  loading="lazy"
                                  onError={fallbackToAdminAsset}
                                />
                              ) : (
                                <span className="wine-country-emoji" aria-hidden="true">{countryFlagEmoji(item.country)}</span>
                              )}
                              <span className="wine-country-name">{countryCodeToLabel(item.country, locale)}</span>
                            </span>
                          </td>
                          <td className="wine-col-actions" data-label={locale === 'ca' ? 'Accions' : 'Acciones'}>
                            <div className="do-directory-actions">
                              <button type="button" className="ghost-button small" onClick={() => announceDoAction('edit', item)}>
                                {locale === 'ca' ? 'Editar' : 'Editar'}
                              </button>
                              <button type="button" className="ghost-button small danger-text-button" onClick={() => announceDoAction('delete', item)}>
                                {locale === 'ca' ? 'Eliminar' : 'Borrar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {doDirectoryItems.length === 0 ? (
                      <tr>
                        <td colSpan={5}>{locale === 'ca' ? 'Cap D.O. disponible.' : 'No hay DO disponibles.'}</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
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
                  <button type="button" className="ghost-button small review-editor-back-button" onClick={() => setMenu('wines')}>
                    <svg className="review-editor-back-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path
                        d="M14.7 5.3a1 1 0 0 1 0 1.4L10.41 11H20a1 1 0 1 1 0 2h-9.59l4.3 4.3a1 1 0 1 1-1.42 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.42 0Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="review-editor-back-text">{locale === 'ca' ? 'Tornar al llistat' : 'Volver al listado'}</span>
                  </button>
                  <button type="submit" className="primary-button small" form={wineFormId} disabled={wineFormSubmitting}>
                    {wineSubmitLabel}
                  </button>
                </div>
              </div>

              <form
                id={wineFormId}
                key={`wine-form-${menu}-${selectedWineForEdit?.id ?? 'new'}-${wineEditDetails?.id ?? 'none'}-${wineEditStatus}`}
                className="stack-form wine-create-form"
                onSubmit={handleWineFormSubmit}
              >
                <div className={`wine-edit-basic-row${menu === 'wineEdit' && selectedWineForEdit ? ' is-edit' : ''}`}>
                  <fieldset className="form-block wine-edit-basic-main">
                    <legend>{locale === 'ca' ? 'Dades bàsiques' : 'Datos básicos'}</legend>
                    <label>
                      {labels.wines.add.name}
                      <input name="name" type="text" placeholder="Clos de la Serra" defaultValue={wineEditDetails?.name ?? selectedWineForEdit?.name ?? ''} required />
                    </label>
                    <div className="inline-grid triple">
                      <label>
                        {labels.wines.add.type}
                        <select name="wine_type" defaultValue={wineEditDetails?.wine_type ?? selectedWineForEdit?.type ?? 'red'}>
                          <option value="red">{labels.wineType.red}</option>
                          <option value="white">{labels.wineType.white}</option>
                          <option value="rose">{labels.wineType.rose}</option>
                          <option value="sparkling">{labels.wineType.sparkling}</option>
                          <option value="sweet">{locale === 'ca' ? 'Dolç' : 'Dulce'}</option>
                          <option value="fortified">{locale === 'ca' ? 'Fortificat' : 'Fortificado'}</option>
                        </select>
                      </label>
                      <label>
                        {locale === 'ca' ? 'Criança' : 'Crianza'}
                        <select name="aging_type" defaultValue={wineEditDetails?.aging_type ?? 'crianza'}>
                          {AGING_OPTIONS.map((aging) => (
                            <option key={aging} value={aging}>{aging}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        {labels.wines.add.vintage}
                        <select name="vintage_year" defaultValue={String(wineEditDetails?.vintage_year ?? selectedWineForEdit?.vintageYear ?? 2021)}>
                          {VINTAGE_YEAR_OPTIONS.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="inline-grid triple">
                      <label>
                        {locale === 'ca' ? 'Grau alcohòlic (%)' : 'Graduación alcohólica (%)'}
                        <input
                          name="alcohol_percentage"
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          placeholder="13.5"
                          defaultValue={
                            wineEditDetails?.alcohol_percentage ?? (selectedWineForEdit ? (selectedWineForEdit.type === 'red' ? 14 : 13) : '')
                          }
                        />
                      </label>
                      <label>
                        {labels.wines.add.winery}
                        <input name="winery" type="text" placeholder="Bodega Nova" defaultValue={wineEditDetails?.winery ?? selectedWineForEdit?.winery ?? ''} />
                      </label>
                      <label>
                        {locale === 'ca' ? 'País de fabricació' : 'País de fabricación'}
                        <select
                          value={manufacturingCountry}
                          onChange={(event) => {
                            const value = event.target.value as Exclude<CountryFilterValue, 'all'>
                            setManufacturingCountry(value)
                          }}
                        >
                          {WINE_COUNTRY_FILTER_VALUES.map((countryCode) => (
                            <option key={countryCode} value={countryCode}>{countryCodeToLabel(countryCode, locale)}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </fieldset>

                  {menu === 'wineEdit' && selectedWineForEdit ? (
                    <div className="wine-edit-photo-manager">
                      {renderWinePhotoManager(selectedWineForEdit.id, wineEditPhotoSlots)}
                    </div>
                  ) : null}
                </div>

                <fieldset className="form-block form-block-half">
                  <legend>{locale === 'ca' ? 'Origen i DO' : 'Origen y DO'}</legend>
                  <div className="inline-grid">
                    <label>
                      {locale === 'ca' ? 'País D.O.' : 'País D.O.'}
                      <select
                        value={createDoCountryFilter}
                        onChange={(event) => {
                          setCreateDoCountryFilter(event.target.value as CountryFilterValue)
                          setCreateDoId('all')
                          setCreateDoSearchText('')
                          setIsCreateDoDropdownOpen(false)
                        }}
                      >
                        <option value="all">{labels.common.allCountries}</option>
                        {WINE_COUNTRY_FILTER_VALUES.map((countryCode) => (
                          <option key={countryCode} value={countryCode}>{countryCodeToLabel(countryCode, locale)}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {locale === 'ca' ? 'Cerca D.O.' : 'Buscar D.O.'}
                      <input
                        type="search"
                        value={createDoSearchText}
                        onChange={(event) => setCreateDoSearchText(event.target.value)}
                        placeholder={
                          createDoCountryFilter === 'all'
                            ? (locale === 'ca' ? 'Primer selecciona país' : 'Primero selecciona país')
                            : (locale === 'ca' ? 'Nom o regió de la D.O.' : 'Nombre o región de la D.O.')
                        }
                        disabled={createDoCountryFilter === 'all'}
                      />
                    </label>
                  </div>
                  <div className="inline-grid">
                    <label>
                      D.O.
                      <div className={`do-combobox${createDoCountryFilter === 'all' ? ' is-disabled' : ''}`} ref={createDoDropdownRef}>
                        <button
                          type="button"
                          className="do-combobox-trigger"
                          aria-expanded={isCreateDoDropdownOpen}
                          aria-haspopup="listbox"
                          onClick={() => {
                            if (createDoCountryFilter === 'all') {
                              return
                            }
                            setIsCreateDoDropdownOpen((current) => !current)
                          }}
                          disabled={createDoCountryFilter === 'all'}
                        >
                          <span className="do-combobox-trigger-main">
                            {selectedCreateDoOption?.country === 'spain' ? (
                              <>
                                {selectedCreateDoCommunityFlagPath ? (
                                  <img
                                    src={selectedCreateDoCommunityFlagPath}
                                    alt=""
                                    className="do-combobox-flag"
                                    loading="lazy"
                                    aria-hidden="true"
                                    onError={fallbackToAdminAsset}
                                  />
                                ) : (
                                  <span className="do-combobox-flag-fallback" aria-hidden="true">🏳️</span>
                                )}
                                <span>{selectedCreateDoOption.name}</span>
                              </>
                            ) : (
                              <span>
                                {selectedCreateDoOption
                                  ? `${selectedCreateDoOption.region} · ${selectedCreateDoOption.name}`
                                  : (createDoCountryFilter === 'all'
                                    ? (locale === 'ca' ? 'Selecciona país abans' : 'Selecciona país antes')
                                    : (locale === 'ca' ? 'Sense D.O.' : 'Sin D.O.'))}
                              </span>
                            )}
                          </span>
                          <span className="do-combobox-caret" aria-hidden="true">▾</span>
                        </button>

                        {isCreateDoDropdownOpen && createDoCountryFilter !== 'all' ? (
                          <div className="do-combobox-menu" role="listbox" aria-label="D.O.">
                            <button
                              type="button"
                              role="option"
                              aria-selected={createDoId === 'all'}
                              className={`do-combobox-option${createDoId === 'all' ? ' is-selected' : ''}`}
                              onClick={() => {
                                setCreateDoId('all')
                                setIsCreateDoDropdownOpen(false)
                              }}
                            >
                              <span>{locale === 'ca' ? 'Sense D.O.' : 'Sin D.O.'}</span>
                            </button>
                            {createFilteredDosBySearch.map((item) => {
                              const isSpanishDo = item.country === 'spain'
                              const communityFlagPath = isSpanishDo ? regionLogoPathFromImageName(item.region_logo) : null
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  role="option"
                                  aria-selected={createDoId === item.id}
                                  className={`do-combobox-option${createDoId === item.id ? ' is-selected' : ''}`}
                                  onClick={() => {
                                    setCreateDoId(item.id)
                                    setIsCreateDoDropdownOpen(false)
                                    setManufacturingCountry(item.country)
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
                </fieldset>

                <fieldset className="form-block form-block-half">
                  <legend>{locale === 'ca' ? 'Composició i raïm' : 'Composición y uva'}</legend>
                  <div className="grape-blend-head">
                    <span>{locale === 'ca' ? 'Varietat' : 'Variedad'}</span>
                    <span>{locale === 'ca' ? 'Percentatge (%)' : 'Porcentaje (%)'}</span>
                    <span aria-hidden="true" />
                  </div>
                  <div className="grape-blend-list">
                    {grapeBlendRows.map((row) => (
                      <div key={row.id} className="grape-blend-row">
                        <label className="sr-only" htmlFor={`grape-row-${row.id}`}>{locale === 'ca' ? 'Varietat' : 'Variedad'}</label>
                        <select
                          id={`grape-row-${row.id}`}
                          value={row.grapeId}
                          onChange={(event) => updateGrapeBlendRow(row.id, { grapeId: event.target.value })}
                        >
                          {grapesByColor.map((group) => (
                            <optgroup key={group.key} label={group.label}>
                              {group.grapes.map((grape) => (
                                <option key={grape.id} value={String(grape.id)}>{grape.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <label className="sr-only" htmlFor={`grape-row-pct-${row.id}`}>{locale === 'ca' ? 'Percentatge' : 'Porcentaje'}</label>
                        <input
                          id={`grape-row-pct-${row.id}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="%"
                          value={row.percentage}
                          onChange={(event) => updateGrapeBlendRow(row.id, { percentage: event.target.value })}
                        />
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
                      <select name="place_type" defaultValue={primaryEditPurchase?.place.place_type ?? 'restaurant'}>
                        {PLACE_TYPE_OPTIONS.map((placeType) => (
                          <option key={placeType} value={placeType}>{placeType}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {labels.wines.add.place}
                      <input
                        name="place_name"
                        type="text"
                        placeholder="Celler del Centre"
                        defaultValue={primaryEditPurchase?.place.name ?? ''}
                        required
                      />
                    </label>
                    <label>
                      {labels.wines.add.price}
                      <input
                        name="price_paid"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="18.50"
                        defaultValue={primaryEditPurchase?.price_paid ?? selectedWineForEdit?.pricePaid ?? ''}
                        required
                      />
                    </label>
                  </div>
                  <div className="inline-grid">
                    <label>
                      {locale === 'ca' ? 'Data de la compra' : 'Fecha de la compra'}
                      <input
                        name="purchased_at"
                        type="date"
                        defaultValue={primaryEditPurchase?.purchased_at?.slice(0, 10) ?? '2026-02-27'}
                        required
                      />
                    </label>
                  </div>
                  <div className="inline-grid">
                    <label>
                      {locale === 'ca' ? 'Adreça del lloc' : 'Dirección del lugar'}
                      <input name="place_address" type="text" placeholder="Carrer Major 12" defaultValue={primaryEditPurchase?.place.address ?? ''} />
                    </label>
                    <label>
                      {locale === 'ca' ? 'Ciutat' : 'Ciudad'}
                      <input name="place_city" type="text" placeholder="Barcelona" defaultValue={primaryEditPurchase?.place.city ?? ''} />
                    </label>
                  </div>
                </fieldset>

                <fieldset className="form-block">
                  <legend>{locale === 'ca' ? 'Premis' : 'Premios'}</legend>
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

                {menu === 'wineEdit' && wineEditStatus === 'loading' ? (
                  <p className="muted">{locale === 'ca' ? 'Carregant dades del vi...' : 'Cargando datos del vino...'}</p>
                ) : null}
                {wineFormError ? <p className="error-message">{wineFormError}</p> : null}
              </form>
            </section>
          </section>
        ) : null}

        {menu === 'reviews' ? (
          <section className="screen-grid">
            <section className="panel">
              <div className="panel-header review-summary-header">
                <div>
                  <p className="eyebrow">{labels.reviews.edit.title}</p>
                  <h3>{locale === 'ca' ? 'Resum de ressenyes' : 'Resumen de reseñas'}</h3>
                </div>
                <div className="panel-header-actions">
                  <button type="button" className="primary-button" onClick={openReviewCreate}>
                    {locale === 'ca' ? 'Crear ressenya' : 'Crear reseña'}
                  </button>
                </div>
              </div>

              <div className="review-kpi-strip">
                <article className="review-kpi-card">
                  <p>{locale === 'ca' ? 'Vins totals' : 'Vinos totales'}</p>
                  <strong>{reviewTotalWines}</strong>
                  <span>{locale === 'ca' ? 'Catàleg global' : 'Catálogo global'}</span>
                </article>
                <article className="review-kpi-card review-kpi-card-mine">
                  <p>{locale === 'ca' ? 'Les meves ressenyes' : 'Mis reseñas'}</p>
                  <strong>{myReviewEntries.length}</strong>
                  <span>{locale === 'ca' ? 'Compte actual' : 'Cuenta actual'}</span>
                </article>
                <article className="review-kpi-card review-kpi-card-pending">
                  <p>{locale === 'ca' ? 'Pendents' : 'Pendientes'}</p>
                  <strong>{Math.max(0, reviewTotalWines - myReviewEntries.length)}</strong>
                  <span>{locale === 'ca' ? 'Vins per ressenyar' : 'Vinos por reseñar'}</span>
                </article>
              </div>

              {myReviewSummaryStatus === 'loading' ? (
                <p className="muted">{locale === 'ca' ? 'Calculant resum de ressenyes...' : 'Calculando resumen de reseñas...'}</p>
              ) : null}

              {myReviewSummaryStatus === 'error' ? (
                <p className="error-message">{myReviewSummaryError ?? (locale === 'ca' ? 'No s’ha pogut calcular el resum.' : 'No se pudo calcular el resumen.')}</p>
              ) : null}
              {reviewActionError ? <p className="error-message">{reviewActionError}</p> : null}

              <section className="review-my-list">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{locale === 'ca' ? 'MEVES RESSENYES' : 'MIS RESEÑAS'}</p>
                    <h3>{locale === 'ca' ? 'Llistat de ressenyes de la teva compte' : 'Listado de reseñas de tu cuenta'}</h3>
                  </div>
                  <label className="review-list-filter">
                    <span>{locale === 'ca' ? 'Filtrar per vi' : 'Filtrar por vino'}</span>
                    <select
                      value={reviewWineFilter === 'all' ? 'all' : String(reviewWineFilter)}
                      onChange={(event) => {
                        const value = event.target.value
                        setReviewWineFilter(value === 'all' ? 'all' : Number(value))
                      }}
                    >
                      <option value="all">{locale === 'ca' ? 'Tots els vins' : 'Todos los vinos'}</option>
                      {reviewWineFilterOptions.map((option) => (
                        <option key={`review-filter-${option.id}`} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="list-stack">
                  {filteredMyReviewEntries.length > 0 ? filteredMyReviewEntries.map((entry) => {
                    const doRegion = entry.wine.doName ?? entry.wine.region
                    const doLabel = doRegion && doRegion !== '-'
                      ? doRegion
                      : (locale === 'ca' ? 'Sense D.O.' : 'Sin D.O.')
                    const doLogoPath = doLogoPathFromImageName(entry.wine.doLogo)
                    const countryFlagPathValue = countryFlagPath(entry.wine.country)

                    return (
                    <article key={`my-review-${entry.review.id}`} className="review-card">
                      <div className="review-main-col">
                        <div className="review-card-top">
                          <img
                            src={entry.wine.thumbnailSrc}
                            alt={`${entry.wine.name} bottle`}
                            className="review-wine-thumb"
                            loading="lazy"
                            onError={fallbackToDefaultWineIcon}
                          />
                          <div className="review-card-header">
                            <div>
                              <h4>{entry.wine.name}</h4>
                              <p>{entry.wine.winery} · {formatApiDate(entry.review.created_at, locale)}</p>
                              <div className="review-origin-row">
                                <span className="review-origin-chip">
                                  {countryFlagPathValue
                                    ? <img className="review-origin-flag" src={countryFlagPathValue} alt={localizedCountryName(entry.wine.country, locale)} loading="lazy" />
                                    : <span className="review-origin-emoji" aria-hidden="true">{countryFlagEmoji(entry.wine.country)}</span>}
                                  <span>{entry.wine.country}</span>
                                </span>
                                <span className="review-origin-chip">
                                  {doLogoPath
                                    ? <img className="review-origin-do-logo" src={doLogoPath} alt={`${doLabel} logo`} onError={fallbackToAdminAsset} />
                                    : null}
                                  <span>{doLabel}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="review-bullets">
                          {entry.review.bullets.length > 0 ? entry.review.bullets.map((bullet) => (
                            <span key={`${entry.review.id}-${bullet}`} className="review-bullet-chip">
                              {REVIEW_ENUM_TO_TAG[bullet] ?? bullet}
                            </span>
                          )) : <span className="review-bullet-chip muted">-</span>}
                        </div>
                      </div>
                      <div className="review-metrics-col">
                        <dl className="review-metrics-grid review-metrics-grid-inline">
                          <div>
                            <dt>{locale === 'ca' ? 'Aroma' : 'Aroma'}</dt>
                            <dd className={`review-metric-value ${medalToneFromTen(entry.review.intensity_aroma)}`}>{entry.review.intensity_aroma}/10</dd>
                          </div>
                          <div>
                            <dt>{locale === 'ca' ? 'Dolçor' : 'Dulzor'}</dt>
                            <dd className={`review-metric-value ${medalToneFromTen(entry.review.sweetness)}`}>{entry.review.sweetness}/10</dd>
                          </div>
                          <div>
                            <dt>{locale === 'ca' ? 'Acidesa' : 'Acidez'}</dt>
                            <dd className={`review-metric-value ${medalToneFromTen(entry.review.acidity)}`}>{entry.review.acidity}/10</dd>
                          </div>
                          <div>
                            <dt>{locale === 'ca' ? 'Taní' : 'Tanino'}</dt>
                            <dd className={`review-metric-value ${medalToneFromTen(entry.review.tannin)}`}>{entry.review.tannin == null ? '-' : `${entry.review.tannin}/10`}</dd>
                          </div>
                          <div>
                            <dt>{locale === 'ca' ? 'Cos' : 'Cuerpo'}</dt>
                            <dd className={`review-metric-value ${medalToneFromTen(entry.review.body)}`}>{entry.review.body}/10</dd>
                          </div>
                          <div>
                            <dt>{locale === 'ca' ? 'Persistència' : 'Persistencia'}</dt>
                            <dd className={`review-metric-value ${medalToneFromTen(entry.review.persistence)}`}>{entry.review.persistence}/10</dd>
                          </div>
                        </dl>
                      </div>
                      <div className="review-score-col">
                        <div className="review-card-header-right">
                          <div className="review-score-summary">
                            <span className={`score-pill ${medalToneFromHundred(entry.review.score)}`}>{entry.review.score == null ? '-' : `${entry.review.score}/100`}</span>
                            <small>{locale === 'ca' ? 'Puntuació total (100)' : 'Puntuación total (100)'}</small>
                          </div>
                          <div className="review-actions review-actions-inline review-actions-end">
                            <button
                              type="button"
                              className="table-icon-button"
                              aria-label={labels.reviews.edit.editAction}
                              title={labels.reviews.edit.editAction}
                              onClick={() => openReviewEdit(entry.wine, entry.review)}
                            >
                              <svg className="table-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58ZM20.7 7.04a1 1 0 0 0 0-1.41l-2.33-2.33a1 1 0 0 0-1.41 0l-1.18 1.18 3.75 3.75 1.17-1.19Z" fill="currentColor" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="table-icon-button danger"
                              aria-label={locale === 'ca' ? 'Eliminar ressenya' : 'Eliminar reseña'}
                              title={locale === 'ca' ? 'Eliminar ressenya' : 'Eliminar reseña'}
                              disabled={reviewDeleteBusyId === entry.review.id}
                              onClick={() => { void deleteReview(entry.wine, entry.review) }}
                            >
                              <svg className="table-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 7h2v8h-2v-8Zm4 0h2v8h-2v-8ZM7 10h2v8H7v-8Z" fill="currentColor" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                    )
                  }) : (
                    <p className="muted">
                      {reviewWineFilter === 'all'
                        ? (locale === 'ca' ? 'Encara no has creat ressenyes.' : 'Todavía no has creado reseñas.')
                        : (locale === 'ca' ? 'No hi ha ressenyes per aquest vi.' : 'No hay reseñas para este vino.')}
                    </p>
                  )}
                </div>
              </section>
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
                  <dt>{labels.admin.account.labels.myReviews}</dt>
                  <dd>{settingsReviewStats.totalReviews}</dd>
                </div>
                <div>
                  <dt>{labels.admin.account.labels.averageScore}</dt>
                  <dd>{settingsReviewStats.averageScore.toFixed(1)}</dd>
                </div>
                <div>
                  <dt>{labels.admin.account.labels.lastReview}</dt>
                  <dd>{settingsReviewStats.lastReview}</dd>
                </div>
                <div>
                  <dt>{labels.admin.account.labels.highestScore}</dt>
                  <dd>{settingsReviewStats.highestScore}</dd>
                </div>
                <div>
                  <dt>{labels.admin.account.labels.lowestScore}</dt>
                  <dd>{settingsReviewStats.lowestScore}</dd>
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
                  <h3>{locale === 'ca' ? 'Configuració del backoffice' : 'Configuración del backoffice'}</h3>
                </div>
              </div>

              <form className="stack-form settings-form" onSubmit={handleSettingsProfileSubmit}>
                <label>
                  {locale === 'ca' ? 'Nom' : 'Nombre'}
                  <input
                    type="text"
                    value={settingsName}
                    onChange={(event) => setSettingsName(event.target.value)}
                    autoComplete="given-name"
                  />
                </label>

                <label>
                  {locale === 'ca' ? 'Cognom' : 'Apellido'}
                  <input
                    type="text"
                    value={settingsLastname}
                    onChange={(event) => setSettingsLastname(event.target.value)}
                    autoComplete="family-name"
                  />
                </label>

                <label>
                  {locale === 'ca' ? 'Nova contrasenya' : 'Nueva contraseña'}
                  <input
                    type="password"
                    value={settingsPassword}
                    onChange={(event) => setSettingsPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder={locale === 'ca' ? 'Deixa-ho buit per conservar-la' : 'Déjalo vacío para conservarla'}
                  />
                </label>

                {settingsProfileError ? <p className="error-message">{settingsProfileError}</p> : null}
                {settingsProfileSuccess ? <p className="success-message">{settingsProfileSuccess}</p> : null}

                <button type="submit" className="primary-button" disabled={settingsProfileSubmitting || !loggedIn}>
                  {settingsProfileSubmitting
                    ? (locale === 'ca' ? 'Desant...' : 'Guardando...')
                    : (locale === 'ca' ? 'Desar perfil' : 'Guardar perfil')}
                </button>
              </form>

              <div className="settings-divider" />

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
                    onChange={(event) => setDefaultLandingPage(event.target.value as 'dashboard' | 'wines' | 'dos' | 'reviews')}
                  >
                    <option value="dashboard">{labels.menu.dashboard}</option>
                    <option value="wines">{labels.menu.wines}</option>
                    <option value="dos">{labels.menu.dos}</option>
                    <option value="reviews">{labels.menu.reviews}</option>
                  </select>
                </label>
              </form>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{locale === 'ca' ? 'EXPERIÈNCIA' : 'EXPERIENCIA'}</p>
                  <h3>{locale === 'ca' ? 'Preferències extra' : 'Preferencias extra'}</h3>
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
                    <p>{locale === 'ca' ? 'Mode amb menys espai vertical per les llistes.' : 'Modo con menos espacio vertical para listas.'}</p>
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
                    <h4>{locale === 'ca' ? 'Properes idees' : 'Próximas ideas'}</h4>
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

        {menu === 'wineProfile' && selectedWineSheet ? (
          <section className="wine-profile-screen">
            <header className="wine-profile-toolbar">
              <h3>{selectedWineSheetDetails?.name ?? selectedWineSheet.name}</h3>
              <div className="wine-profile-header-actions">
                <button type="button" className="ghost-button wine-profile-back-button" onClick={closeWineSheet}>
                  <svg className="wine-profile-back-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                      d="M14.7 5.3a1 1 0 0 1 0 1.4L10.41 11H20a1 1 0 1 1 0 2h-9.59l4.3 4.3a1 1 0 1 1-1.42 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.42 0Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="wine-profile-back-text">{locale === 'ca' ? 'Tornar al llistat de vins' : 'Volver al listado de vinos'}</span>
                </button>
                <button type="button" className="primary-button" onClick={() => openWineEdit(selectedWineSheet)}>
                  {locale === 'ca' ? 'Editar vi' : 'Editar vino'}
                </button>
              </div>
            </header>

            {selectedWineSheetStatus === 'loading' ? (
              <section className="panel">
                <p className="eyebrow">{locale === 'ca' ? 'Carregant' : 'Cargando'}</p>
                <h3>{locale === 'ca' ? 'Preparant fitxa del vi…' : 'Preparando ficha del vino…'}</h3>
              </section>
            ) : null}

            {selectedWineSheetStatus === 'error' ? (
              <section className="panel">
                <p className="eyebrow">{locale === 'ca' ? 'Error' : 'Error'}</p>
                <h3>{locale === 'ca' ? 'No s’ha pogut carregar la fitxa' : 'No se pudo cargar la ficha'}</h3>
                <p className="muted">{selectedWineSheetError ?? (locale === 'ca' ? 'Torna-ho a provar en uns segons.' : 'Vuelve a intentarlo en unos segundos.')}</p>
              </section>
            ) : null}

            {selectedWineSheetStatus === 'ready' && selectedWineSheetDetails ? (
              <>
                <section className="wine-profile-row-one">
                  {renderWinePhotoManager(selectedWineSheet.id, selectedWinePhotoSlots)}

                  <section className="wine-sheet-card wine-profile-card-composition">
                    <h4>
                      <span className="wine-sheet-section-icon" aria-hidden="true">🍇</span>
                      <span>{locale === 'ca' ? 'Composició' : 'Composición'}</span>
                    </h4>
                    <div className="wine-profile-grape-layout">
                      {selectedWineGrapePie !== '' ? (
                        <div className="wine-profile-grape-pie" style={{ background: selectedWineGrapePie }}>
                          <span>{locale === 'ca' ? 'Blend' : 'Blend'}</span>
                        </div>
                      ) : null}
                      <div className="wine-profile-grape-list">
                        {selectedWineSheetDetails.grapes.length > 0 ? selectedWineSheetDetails.grapes.map((grape) => (
                          <div key={grape.id} className="wine-profile-grape-row">
                            <span>{grape.name}</span>
                            <strong>{grape.percentage == null ? '-' : `${grape.percentage}%`}</strong>
                          </div>
                        )) : <p className="muted">{locale === 'ca' ? 'Sense varietats informades.' : 'Sin variedades informadas.'}</p>}
                      </div>
                    </div>
                  </section>
                </section>

                <section className="wine-profile-row-two">
                  <section className="panel wine-profile-summary-panel wine-profile-card-maininfo">
                    <div className="panel-header">
                      <div>
                        <p className="eyebrow">{locale === 'ca' ? 'FITXA TÈCNICA' : 'FICHA TÉCNICA'}</p>
                        <h3>{selectedWineSheetDetails.name}</h3>
                        <p className="wine-profile-maininfo-subtitle">{locale === 'ca' ? 'Identitat del vi + Informació' : 'Identidad del vino + Información'}</p>
                      </div>
                      <div className="wine-profile-card-actions">
                        <button type="button" className="ghost-button small wine-profile-back-button" onClick={closeWineSheet}>
                          <svg className="wine-profile-back-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path
                              d="M14.7 5.3a1 1 0 0 1 0 1.4L10.41 11H20a1 1 0 1 1 0 2h-9.59l4.3 4.3a1 1 0 1 1-1.42 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.42 0Z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="wine-profile-back-text">{locale === 'ca' ? 'Tornar al llistat de vins' : 'Volver al listado de vinos'}</span>
                        </button>
                        <button type="button" className="primary-button small" onClick={() => openWineEdit(selectedWineSheet)}>
                          {locale === 'ca' ? 'Editar vi' : 'Editar vino'}
                        </button>
                      </div>
                    </div>

                    <div className="wine-profile-kpi-strip">
                      <article>
                        <span>{t('wineProfile.statAvgScore')}</span>
                        <strong>{selectedWineAverageScore ?? '-'}</strong>
                      </article>
                      <article>
                        <span>{locale === 'ca' ? 'Anyada' : 'Añada'}</span>
                        <strong>{selectedWineSheetDetails.vintage_year ?? '-'}</strong>
                      </article>
                    </div>

                    <div className="wine-profile-top-strip">
                      {selectedWineSheetDetails.do ? (
                        <section className="wine-profile-do-showcase">
                          <div className="wine-profile-do-showcase-main">
                            {selectedWineDoLogo ? (
                              <img
                                src={selectedWineDoLogo}
                                alt={`${selectedWineSheetDetails.do.name} logo`}
                                className="wine-profile-do-showcase-logo"
                                loading="lazy"
                                onError={fallbackToAdminAsset}
                              />
                            ) : null}
                            <div className="wine-profile-do-showcase-text">
                              <strong>{selectedWineSheetDetails.do.name}</strong>
                              <span>{selectedWineSheetDetails.do.region}</span>
                            </div>
                          </div>
                          <div className="wine-profile-do-badges">
                            <span className="wine-profile-do-badge">
                              {countryCodeToLabel(selectedWineSheetDetails.do.country, locale)}
                            </span>
                            {selectedWineSheetDetails.do.country === 'spain' && selectedWineCommunityFlagPath ? (
                              <span className="wine-profile-community-showcase">
                                <img
                                  src={selectedWineCommunityFlagPath}
                                  alt={selectedWineSheetDetails.do.region}
                                  loading="lazy"
                                  onError={fallbackToAdminAsset}
                                />
                                <span>{selectedWineSheetDetails.do.region}</span>
                              </span>
                            ) : null}
                          </div>
                        </section>
                      ) : null}

                    </div>

                    <dl className="wine-profile-facts-grid">
                      <div>
                        <dt>{locale === 'ca' ? 'Bodega' : 'Bodega'}</dt>
                        <dd>{selectedWineSheetDetails.winery ?? '-'}</dd>
                      </div>
                      <div>
                        <dt>{locale === 'ca' ? 'D.O.' : 'D.O.'}</dt>
                        <dd>{selectedWineSheetDetails.do?.name ?? (locale === 'ca' ? 'Sense D.O.' : 'Sin D.O.')}</dd>
                      </div>
                      <div>
                        <dt>{locale === 'ca' ? 'Regió' : 'Región'}</dt>
                        <dd>{selectedWineSheetDetails.do?.region ?? '-'}</dd>
                      </div>
                      <div>
                        <dt>{locale === 'ca' ? 'Tipus' : 'Tipo'}</dt>
                        <dd>{wineTypeLabel(selectedWineSheetDetails.wine_type ?? selectedWineSheet.type)}</dd>
                      </div>
                      <div>
                        <dt>{locale === 'ca' ? 'Criança' : 'Crianza'}</dt>
                        <dd>{labelForAgingType(selectedWineSheetDetails.aging_type, locale)}</dd>
                      </div>
                      <div>
                        <dt>{locale === 'ca' ? 'Alcohol (%)' : 'Alcohol (%)'}</dt>
                        <dd>{selectedWineSheetDetails.alcohol_percentage ?? '-'}</dd>
                      </div>
                      <div>
                        <dt>{locale === 'ca' ? 'Actualitzat' : 'Actualizado'}</dt>
                        <dd>{formatApiDate(selectedWineSheetDetails.updated_at, locale)}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="wine-sheet-card wine-profile-card-awards">
                    <h4>
                      <span className="wine-sheet-section-icon" aria-hidden="true">🏅</span>
                      <span>{locale === 'ca' ? 'Premis' : 'Premios'}</span>
                    </h4>
                    <div className="wine-profile-list-block">
                      {selectedWineSheetDetails.awards.length > 0 ? selectedWineSheetDetails.awards.map((award) => (
                        <article key={award.id} className="wine-profile-list-row">
                          <span>{labelForAwardName(award.name)}</span>
                          <strong>{award.score != null ? `${award.score}/100` : '-'} · {award.year ?? '-'}</strong>
                        </article>
                      )) : <p className="muted">{locale === 'ca' ? 'Sense premis registrats.' : 'Sin premios registrados.'}</p>}
                    </div>
                  </section>

                  <section className="wine-sheet-card wine-profile-card-reviews">
                    <h4>
                      <span className="wine-sheet-section-icon" aria-hidden="true">✍️</span>
                      <span>{locale === 'ca' ? 'Ressenyes' : 'Reseñas'}</span>
                    </h4>
                    <div className="wine-profile-list-block">
                      {selectedWineSheetDetails.reviews.length > 0 ? selectedWineSheetDetails.reviews.slice(0, 5).map((review) => (
                        <article key={review.id} className="wine-profile-review-card">
                          <div className="wine-profile-review-head">
                            <div>
                              <strong>{review.user.name} {review.user.lastname}</strong>
                              <p className="wine-profile-review-date">{formatApiDate(review.created_at, locale)}</p>
                            </div>
                            <span className={`score-pill ${medalToneFromHundred(review.score)}`}>
                              {review.score == null ? '-' : `${review.score}/100`}
                            </span>
                          </div>
                          <div className="wine-profile-review-bullets">
                            {review.bullets.length > 0
                              ? review.bullets.map((bullet) => (
                                  <span key={`${review.id}-${bullet}`} className="review-bullet-chip">
                                    {REVIEW_ENUM_TO_TAG[bullet] ?? bullet}
                                  </span>
                                ))
                              : <span className="review-bullet-chip muted">-</span>}
                          </div>
                        </article>
                      )) : <p className="muted">{locale === 'ca' ? 'Sense ressenyes registrades.' : 'Sin reseñas registradas.'}</p>}
                    </div>
                  </section>
                </section>
              </>
            ) : null}
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

      {isMobileViewport && isWineFiltersMobileOpen ? (
        <div
          className="modal-backdrop wine-mobile-filters-backdrop"
          role="presentation"
          onClick={() => {
            setIsDoDropdownOpen(false)
            setIsWineFiltersMobileOpen(false)
          }}
        >
          <section
            className="wine-mobile-filters-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wine-mobile-filters-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="wine-mobile-filters-header">
              <div>
                <p className="eyebrow">{locale === 'ca' ? 'FILTRES' : 'FILTROS'}</p>
                <h3 id="wine-mobile-filters-title">{locale === 'ca' ? 'Filtrar vins' : 'Filtrar vinos'}</h3>
              </div>
              <button
                type="button"
                className="ghost-button small"
                onClick={() => {
                  setIsDoDropdownOpen(false)
                  setIsWineFiltersMobileOpen(false)
                }}
              >
                {locale === 'ca' ? 'Tancar' : 'Cerrar'}
              </button>
            </header>
            <div className="wine-mobile-filters-content">
              {renderWineFilters('mobile')}
            </div>
          </section>
        </div>
      ) : null}

      {wineDeleteTarget ? (
        <div className="modal-backdrop wine-delete-backdrop" role="presentation" onClick={closeWineDeleteConfirm}>
          <section
            className="confirm-modal wine-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-wine-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="confirm-modal-header">
              <p className="eyebrow">{locale === 'ca' ? 'ELIMINAR VI' : 'ELIMINAR VINO'}</p>
              <h3 id="delete-wine-title">{wineDeleteTarget.name}</h3>
              <p className="muted">
                {locale === 'ca'
                  ? 'Aquesta acció eliminarà el vi i les seves fotos. Vols continuar?'
                  : 'Esta acción eliminará el vino y sus fotos. ¿Quieres continuar?'}
              </p>
            </header>
            {wineDeleteError ? <p className="error-message">{wineDeleteError}</p> : null}
            <footer className="confirm-modal-actions">
              <button type="button" className="ghost-button" onClick={closeWineDeleteConfirm} disabled={wineDeleteSubmitting}>
                {locale === 'ca' ? 'Cancel·lar' : 'Cancelar'}
              </button>
              <button type="button" className="secondary-button" onClick={() => { void confirmDeleteWine() }} disabled={wineDeleteSubmitting}>
                {wineDeleteSubmitting ? (locale === 'ca' ? 'Eliminant…' : 'Eliminando…') : (locale === 'ca' ? 'Eliminar' : 'Eliminar')}
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {photoEditorType && photoEditorSource ? (
        <div className="modal-backdrop modal-backdrop-top" role="presentation" onClick={closePhotoEditor}>
          <section
            className="photo-editor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-editor-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="photo-editor-header">
              <div>
                <p className="eyebrow">{locale === 'ca' ? 'EDITOR FOTO' : 'EDITOR FOTO'}</p>
                <h3 id="photo-editor-title">{labelForPhotoType(photoEditorType, locale)}</h3>
              </div>
              <button type="button" className="ghost-button small" onClick={closePhotoEditor}>
                {locale === 'ca' ? 'Tancar' : 'Cerrar'}
              </button>
            </header>

            <div className="photo-editor-body">
              <div
                className={`photo-editor-preview-wrap ${
                  photoEditorType === 'bottle'
                    ? 'ratio-9-16'
                    : photoEditorType === 'situation'
                      ? 'ratio-free'
                      : 'ratio-3-4'
                }`}
                onPointerDown={handlePhotoEditorPointerDown}
                onPointerMove={handlePhotoEditorPointerMove}
                onPointerUp={handlePhotoEditorPointerUp}
                onPointerCancel={handlePhotoEditorPointerUp}
              >
                <canvas ref={photoEditorCanvasRef} className="photo-editor-preview" />
                {photoEditorType !== 'situation' ? (
                  <div className="photo-editor-zoom-buttons">
                    <button
                      type="button"
                      className="ghost-button tiny photo-editor-zoom-button"
                      onClick={() => setPhotoEditorZoom((current) => clamp(current - 0.1, 1, 3))}
                      aria-label={locale === 'ca' ? 'Disminuir zoom' : 'Disminuir zoom'}
                    >
                      -
                    </button>
                    <button
                      type="button"
                      className="ghost-button tiny photo-editor-zoom-button"
                      onClick={() => setPhotoEditorZoom((current) => clamp(current + 0.1, 1, 3))}
                      aria-label={locale === 'ca' ? 'Augmentar zoom' : 'Aumentar zoom'}
                    >
                      +
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="photo-editor-controls">
                <p className="muted">
                  {photoEditorType === 'situation'
                    ? (locale === 'ca' ? 'Format lliure (sense retall obligatori)' : 'Formato libre (sin recorte obligatorio)')
                    : `Format ${photoEditorType === 'bottle' ? '9:16' : '3:4'} · ${locale === 'ca' ? 'Arrossega per moure i fes pinça per zoom' : 'Arrastra para mover y pellizca para zoom'}`}
                </p>
                {photoEditorType !== 'situation' ? (
                  <>
                    <label>
                      {locale === 'ca' ? 'Zoom' : 'Zoom'}
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.01"
                        value={photoEditorZoom}
                        onChange={(event) => setPhotoEditorZoom(Number(event.target.value))}
                      />
                    </label>
                    {!isMobileViewport ? (
                      <>
                        <label>
                          {locale === 'ca' ? 'Desplaçament X' : 'Desplazamiento X'}
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            step="1"
                            value={photoEditorOffsetX}
                            onChange={(event) => setPhotoEditorOffsetX(Number(event.target.value))}
                          />
                        </label>
                        <label>
                          {locale === 'ca' ? 'Desplaçament Y' : 'Desplazamiento Y'}
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            step="1"
                            value={photoEditorOffsetY}
                            onChange={(event) => setPhotoEditorOffsetY(Number(event.target.value))}
                          />
                        </label>
                      </>
                    ) : null}
                  </>
                ) : null}
                {photoEditorError ? <p className="error-message">{photoEditorError}</p> : null}
              </div>
            </div>

            <footer className="photo-editor-footer">
              <button type="button" className="ghost-button" onClick={closePhotoEditor}>
                {locale === 'ca' ? 'Cancelar' : 'Cancelar'}
              </button>
              <button type="button" className="secondary-button" disabled={photoEditorSaving} onClick={() => { void savePhotoEditor() }}>
                {photoEditorSaving ? (locale === 'ca' ? 'Guardant…' : 'Guardando…') : (locale === 'ca' ? 'Guardar' : 'Guardar')}
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      <input
        ref={photoPickerInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handlePhotoPickerChange}
      />

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
              <div className="image-modal-head-main">
                <p className="eyebrow">{t('wineProfile.galleryEyebrow')}</p>
                <div className="image-modal-title-row">
                  <h3 id="wine-gallery-title">{selectedWineGallery.name}</h3>
                  <div className="image-modal-left-actions">
                    <button
                      type="button"
                      className="ghost-button small image-modal-icon-button"
                      onClick={() => {
                        const activePhotoType: WinePhotoSlotType =
                          activeGalleryImageKey === 'front'
                            ? 'front_label'
                            : activeGalleryImageKey === 'back'
                              ? 'back_label'
                              : activeGalleryImageKey === 'situation'
                                ? 'situation'
                              : 'bottle'
                        startPhotoPick(selectedWineGallery.id, activePhotoType)
                      }}
                      title={locale === 'ca' ? 'Editar foto' : 'Editar foto'}
                      aria-label={locale === 'ca' ? 'Editar foto' : 'Editar foto'}
                    >
                      <svg className="table-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path
                          d="M3 17.25V21h3.75L18.37 9.38l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l9.62-9.62.92.92-9.62 9.62zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.5 1.5 3.75 3.75 1.5-1.5z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="ghost-button small danger"
                      onClick={() => {
                        const activePhotoType: WinePhotoSlotType =
                          activeGalleryImageKey === 'front'
                            ? 'front_label'
                            : activeGalleryImageKey === 'back'
                              ? 'back_label'
                              : activeGalleryImageKey === 'situation'
                                ? 'situation'
                              : 'bottle'
                        void resetWinePhotoToDefault(selectedWineGallery.id, activePhotoType)
                      }}
                      disabled={
                        photoDeleteBusyType === (
                          activeGalleryImageKey === 'front'
                            ? 'front_label'
                            : activeGalleryImageKey === 'back'
                              ? 'back_label'
                              : activeGalleryImageKey === 'situation'
                                ? 'situation'
                              : 'bottle'
                        )
                      }
                      title={locale === 'ca' ? 'Eliminar foto' : 'Eliminar foto'}
                      aria-label={locale === 'ca' ? 'Eliminar foto' : 'Eliminar foto'}
                    >
                      🗑
                    </button>
                    <button
                      type="button"
                      className="ghost-button small image-modal-icon-button image-modal-close-button"
                      onClick={closeWineGallery}
                      title={locale === 'ca' ? 'Tancar galeria' : 'Cerrar galería'}
                      aria-label={t('wineProfile.closeGalleryAria')}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="muted">{selectedWineGallery.winery}</p>
              </div>
            </header>

            <div className="image-modal-stage">
              <div className="image-modal-rail" role="tablist" aria-label={t('wineProfile.imageViewsAria')}>
                {selectedWineGalleryImages.map((image) => {
                  const isActive = image.key === activeGalleryImageKey

                  return (
                    <button
                      key={image.key}
                      type="button"
                      className={`image-modal-thumb ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveGalleryImageKey(image.key)}
                      aria-pressed={isActive}
                    >
                      <img src={image.src} alt={`${selectedWineGallery.name} ${galleryLabels[image.key]}`} loading="lazy" onError={fallbackToDefaultWineIcon} />
                      <span>{galleryLabels[image.key]}</span>
                    </button>
                  )
                })}
              </div>

              <figure className="image-modal-viewer">
                {(() => {
                  const activeImage = selectedWineGalleryImages.find((image) => image.key === activeGalleryImageKey) ?? selectedWineGalleryImages[0]

                  return (
                    <>
                      <img src={activeImage.src} alt={`${selectedWineGallery.name} ${galleryLabels[activeImage.key]}`} onError={fallbackToDefaultWineIcon} />
                      <figcaption>
                        <strong>{galleryLabels[activeImage.key]}</strong>
                      </figcaption>
                    </>
                  )
                })()}
              </figure>
            </div>
          </section>
        </div>
      ) : null}

      {wineSuccessToast ? (
        <div className="floating-toast floating-toast-success" role="status" aria-live="polite">
          {wineSuccessToast}
        </div>
      ) : null}

      {reviewSuccessToast ? (
        <div className="floating-toast floating-toast-success" role="status" aria-live="polite">
          {reviewSuccessToast}
        </div>
      ) : null}

      {doSuccessToast ? (
        <div className="floating-toast floating-toast-success" role="status" aria-live="polite">
          {doSuccessToast}
        </div>
      ) : null}
    </main>
  )
}

export default App
