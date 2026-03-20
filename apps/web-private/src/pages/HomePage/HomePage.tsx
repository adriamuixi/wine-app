import type { ChangeEvent, FormEvent, ReactNode, SyntheticEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LanguageSelector } from '../../components/LanguageSelector'
import '../../App.css'
import { ApiDocPanel } from '../../features/apiDoc'
import { DashboardPanel } from '../../features/dashboard'
import { DoCreatePanel, DoDirectoryPanel, DoEditModal } from '../../features/do'
import { deleteDoById } from '../../features/do/services/doApi'
import { ReviewEditorPanel, ReviewsPanel } from '../../features/reviews'
import { SettingsPanel } from '../../features/settings'
import { PhotoEditorModal, WineFiltersMobileModal, WineFormPanel, WineGalleryModal, WineProfilePanel, WinesListPanel, useWinePhotoActions } from '../../features/wines'
import { toCountryIsoCode } from '../../features/do/services/countryCode'
import { usePhotoEditorGestures } from '../../features/wines/hooks/usePhotoEditorGestures'
import { deleteWineById } from '../../features/wines/services/photoApi'
import { drawPhotoEditorPreviewImage, getPhotoEditorRatioClass } from '../../features/wines/services/photoEditor'
import { formatIsoDateToDdMmYyyy, parseDateInputToIso } from '../../features/wines/lib/dateInput'
import { ConfirmDeleteModal } from '../../shared/components/ConfirmDeleteModal'
import {
  DEFAULT_NO_PHOTO_DARK_SRC,
  DEFAULT_NO_PHOTO_LIGHT_SRC,
  DEFAULT_WINE_ICON_DATA_URI,
  SIDEBAR_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from '../../app/config/constants'
import { useI18n } from '../../i18n/I18nProvider'
import { i18n } from '../../i18n/i18n'
import type { Locale } from '../../i18n/messages'
import type {
  CountryFilterValue,
  DoApiItem,
  DoApiResponse,
  DoCreateDraft,
  DoEditDraft,
  DoSortField,
  DoSortPresetKey,
} from '../../features/do'
import type {
  MyWineReviewEntry,
  ReviewFormPreset,
  ReviewItem,
  ReviewTimelinePoint,
} from '../../features/reviews'
import type { AppUser, AuthApiResponse, MenuKey, ThemeMode } from '../../features/settings'
import type {
  GenericStatsApiResponse,
  ReviewsPerMonthStatsApiResponse,
  ScoringGenericStatsApiResponse,
} from '../../features/dashboard'
import type {
  AwardRow,
  DoLogoCropRatio,
  GalleryModalVariant,
  GrapeApiItem,
  GrapeApiResponse,
  GrapeBlendRow,
  PhotoEditorAssetType,
  ReviewListApiResponse,
  WineDetailsApiAward,
  WineDetailsApiPhoto,
  WineDetailsApiResponse,
  WineDetailsApiReview,
  WineDetailsApiWine,
  WineItem,
  WineListApiItem,
  WineListApiResponse,
  WinePhotoSlotType,
  WineType,
} from '../../features/wines'
import { resolveApiAssetUrl, resolveApiBaseUrl } from '../../shared/lib/env'
import { localeToIntl } from '../../shared/lib/locale'
import { averageScoreByType, clamp, createSeededRandom, linearRegression, median, standardDeviation } from '../../shared/lib/math'
import { normalizeSearchText } from '../../shared/lib/text'
import { isWorldCountryValue, toWorldCountryValue } from '../../shared/lib/worldCountries'

const SAMPLE_WINE_THUMBNAIL_SRC = DEFAULT_NO_PHOTO_LIGHT_SRC
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
const REVIEW_TAG_OPTIONS = ['AFRUTADO', 'FLORAL', 'MINERAL', 'MADERA MARCADA', 'POTENTE'] as const
const REVIEW_TAG_TO_ENUM: Record<(typeof REVIEW_TAG_OPTIONS)[number], WineDetailsApiReview['bullets'][number]> = {
  AFRUTADO: 'fruity',
  FLORAL: 'floral',
  MINERAL: 'mineral',
  'MADERA MARCADA': 'oak_forward',
  POTENTE: 'powerful',
}
const REVIEW_ENUM_TO_TAG: Record<WineDetailsApiReview['bullets'][number], (typeof REVIEW_TAG_OPTIONS)[number]> = {
  fruity: 'AFRUTADO',
  floral: 'FLORAL',
  mineral: 'MINERAL',
  oak_forward: 'MADERA MARCADA',
  powerful: 'POTENTE',
}
const SCORE_OPTIONS_0_TO_10 = Array.from({ length: 11 }, (_, value) => value)
const SCORE_OPTIONS_0_TO_100 = Array.from({ length: 101 }, (_, value) => value)
const CURRENT_DATE = new Date()
const CURRENT_YEAR = CURRENT_DATE.getFullYear()
const CURRENT_DATE_INPUT = `${CURRENT_YEAR}-${String(CURRENT_DATE.getMonth() + 1).padStart(2, '0')}-${String(CURRENT_DATE.getDate()).padStart(2, '0')}`
const VINTAGE_YEAR_OPTIONS = Array.from({ length: 76 }, (_, index) => String(CURRENT_YEAR - index))
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
      tastingDate: CURRENT_DATE_INPUT,
      overallScore: 85,
      aroma: 5,
      appearance: 5,
      palateEntry: 5,
      body: 5,
      persistence: 5,
      tags: [],
      notes: '',
    }
  }

  const hasDetailedAxes = (
    review.aroma != null
    && review.appearance != null
    && review.palateEntry != null
    && review.body != null
    && review.persistence != null
  )

  const base = Math.max(0, Math.min(10, Math.round(review.score / 10)))
  const boosted = Math.max(0, Math.min(10, base + 1))
  const tags = review.tags ?? (review.score >= 90 ? ['POTENTE', 'MADERA MARCADA'] : ['AFRUTADO', 'FLORAL'])

  return {
    wineId: String(review.wineId),
    tastingDate: review.createdAt,
    overallScore: review.score,
    aroma: hasDetailedAxes ? Math.max(0, Math.min(10, Math.round(review.aroma ?? 0))) : boosted,
    appearance: hasDetailedAxes ? Math.max(0, Math.min(10, Math.round(review.appearance ?? 0))) : Math.max(0, base - 1),
    palateEntry: hasDetailedAxes ? Math.max(0, Math.min(10, Math.round(review.palateEntry ?? 0))) : base,
    body: hasDetailedAxes ? Math.max(0, Math.min(10, Math.round(review.body ?? 0))) : boosted,
    persistence: hasDetailedAxes ? Math.max(0, Math.min(10, Math.round(review.persistence ?? 0))) : base,
    tags,
    notes: review.notes,
  }
}

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

function normalizeCountryToken(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
}

function labelForCountryCodePath(countryCode: Exclude<CountryFilterValue, 'all'>, locale: string, path: 'common.worldCountries' | 'common.countries'): string | null {
  const key = `${path}.${countryCode}`
  const translated = i18n.getFixedT(locale)(key)
  return translated === key ? null : translated
}

function countryCodeToLabel(countryCode: Exclude<CountryFilterValue, 'all'> | null, locale: string): string {
  if (countryCode == null) {
    return '-'
  }

  const fromWorldCountries = labelForCountryCodePath(countryCode, locale, 'common.worldCountries')
  if (fromWorldCountries != null && fromWorldCountries.trim() !== '') {
    return fromWorldCountries
  }

  const fromLegacyCountries = labelForCountryCodePath(countryCode, locale, 'common.countries')
  if (fromLegacyCountries != null && fromLegacyCountries.trim() !== '') {
    return fromLegacyCountries
  }

  return countryCode.replace(/_/g, ' ')
}

function countryLabelToFilterValue(country: string): CountryFilterValue {
  const normalized = normalizeCountryToken(country)
  if (normalized === '') {
    return 'all'
  }

  const shorthand: Record<string, Exclude<CountryFilterValue, 'all'>> = {
    usa: 'united_states',
    us: 'united_states',
  }
  if (normalized in shorthand) {
    return shorthand[normalized]
  }

  for (const code of WINE_COUNTRY_FILTER_VALUES) {
    const normalizedCode = normalizeCountryToken(code)
    if (normalized === normalizedCode) {
      return code
    }

    const normalizedCodeSpaced = normalizeCountryToken(code.replace(/_/g, ' '))
    if (normalized === normalizedCodeSpaced) {
      return code
    }

    for (const locale of ['es', 'ca', 'en'] as const) {
      const worldLabel = labelForCountryCodePath(code, locale, 'common.worldCountries')
      if (worldLabel != null && normalizeCountryToken(worldLabel) === normalized) {
        return code
      }

      const legacyLabel = labelForCountryCodePath(code, locale, 'common.countries')
      if (legacyLabel != null && normalizeCountryToken(legacyLabel) === normalized) {
        return code
      }
    }
  }

  return 'all'
}

function countryCodeFromAny(country: string): Exclude<CountryFilterValue, 'all'> | null {
  const mapped = countryLabelToFilterValue(country)
  return mapped === 'all' ? null : mapped
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
  return new Intl.DateTimeFormat(localeToIntl(locale), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function labelForPhotoType(type: WineDetailsApiPhoto['type'] | 'do_logo', locale: string): string {
  const key = type == null ? 'default' : type
  return i18n.getFixedT(locale)(`common.photoType.${key}`)
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
  return i18n.getFixedT(locale)(`common.agingType.${agingType}`)
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

  return new Intl.DateTimeFormat(localeToIntl(locale), {
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

      const monthFormatter = new Intl.DateTimeFormat(localeToIntl(locale), {
        month: 'short',
        timeZone: 'UTC',
      })
      const firstMonthLabel = monthFormatter.format(firstDate).replace('.', '')
      const secondMonthLabel = monthFormatter.format(secondDate).replace('.', '')
      const connector = 'del'

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

function HomePage() {
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
  const [photoPickerType, setPhotoPickerType] = useState<PhotoEditorAssetType | null>(null)
  const [photoPickerContext, setPhotoPickerContext] = useState<'wine' | 'doCreate' | 'doEdit' | null>(null)
  const [photoEditorWineId, setPhotoEditorWineId] = useState<number | null>(null)
  const [photoEditorType, setPhotoEditorType] = useState<PhotoEditorAssetType | null>(null)
  const [photoEditorSource, setPhotoEditorSource] = useState<string | null>(null)
  const [photoEditorZoom, setPhotoEditorZoom] = useState(1)
  const [photoEditorOffsetX, setPhotoEditorOffsetX] = useState(0)
  const [photoEditorOffsetY, setPhotoEditorOffsetY] = useState(0)
  const [photoEditorDoLogoCropRatio, setPhotoEditorDoLogoCropRatio] = useState<DoLogoCropRatio>('photo')
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
  const [doListNameFilter, setDoListNameFilter] = useState('')
  const [doListNameFilterDebounced, setDoListNameFilterDebounced] = useState('')
  const [doListCountryFilter, setDoListCountryFilter] = useState<CountryFilterValue>('all')
  const [doListRegionFilter, setDoListRegionFilter] = useState('')
  const [doListRegionFilterDebounced, setDoListRegionFilterDebounced] = useState('')
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
  const [doListReloadToken, setDoListReloadToken] = useState(0)
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
  const [reviewSortOrder, setReviewSortOrder] = useState<'score_desc' | 'score_asc' | 'name_asc' | 'name_desc' | 'do_asc' | 'do_desc'>('score_desc')
  const [reviewFormSubmitting, setReviewFormSubmitting] = useState(false)
  const [reviewFormError, setReviewFormError] = useState<string | null>(null)
  const [reviewSuccessToast, setReviewSuccessToast] = useState<string | null>(null)
  const [reviewActionError, setReviewActionError] = useState<string | null>(null)
  const [reviewDeleteBusyId, setReviewDeleteBusyId] = useState<number | null>(null)
  const [doSuccessToast, setDoSuccessToast] = useState<string | null>(null)
  const [doCreateDraft, setDoCreateDraft] = useState<DoCreateDraft>({
    name: '',
    region: '',
    country: 'spain',
    country_code: 'ES',
    do_logo: '',
  })
  const [doCreateSubmitting, setDoCreateSubmitting] = useState(false)
  const [doCreateError, setDoCreateError] = useState<string | null>(null)
  const [doCreateLogoFile, setDoCreateLogoFile] = useState<File | null>(null)
  const [doCreateLogoPreviewSrc, setDoCreateLogoPreviewSrc] = useState<string | null>(null)
  const [doEditTarget, setDoEditTarget] = useState<DoApiItem | null>(null)
  const [doEditDraft, setDoEditDraft] = useState<DoEditDraft | null>(null)
  const [doAssetUploadingType, setDoAssetUploadingType] = useState<'do_logo' | null>(null)
  const [doEditSubmitting, setDoEditSubmitting] = useState(false)
  const [doEditError, setDoEditError] = useState<string | null>(null)
  const [doDeleteTarget, setDoDeleteTarget] = useState<DoApiItem | null>(null)
  const [doDeleteSubmitting, setDoDeleteSubmitting] = useState(false)
  const [doDeleteError, setDoDeleteError] = useState<string | null>(null)
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
  const [grapeBlendRows, setGrapeBlendRows] = useState<GrapeBlendRow[]>([
    { id: 1, grapeId: '', percentage: '' },
  ])
  const [awardRows, setAwardRows] = useState<AwardRow[]>([])
  const {
    handlePhotoEditorPointerDown,
    handlePhotoEditorPointerMove,
    handlePhotoEditorPointerUp,
    resetPhotoEditorGestures,
  } = usePhotoEditorGestures({
    photoEditorType,
    photoEditorZoom,
    photoEditorOffsetX,
    photoEditorOffsetY,
    setPhotoEditorZoom,
    setPhotoEditorOffsetX,
    setPhotoEditorOffsetY,
  })
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
      { key: 'red', label: t('ui.reds'), grapes: reds },
      { key: 'white', label: t('ui.whites'), grapes: whites },
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
        label: t('ui.country_region_name'),
      },
      {
        key: 'name_country_region',
        label: t('ui.name_country_region'),
      },
      {
        key: 'region_name_country',
        label: t('ui.region_name_country'),
      },
    ],
    [locale],
  )
  const doDirectoryItems = useMemo(() => {
    const items = [...doOptions]
    const collator = new Intl.Collator(localeToIntl(locale), { sensitivity: 'base' })

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
  const reviewSortConfig = useMemo((): { sortBy: 'score' | 'name' | 'do'; sortDir: 'asc' | 'desc' } => {
    return (() => {
      if (reviewSortOrder === 'score_asc') return { sortBy: 'score', sortDir: 'asc' }
      if (reviewSortOrder === 'name_asc') return { sortBy: 'name', sortDir: 'asc' }
      if (reviewSortOrder === 'name_desc') return { sortBy: 'name', sortDir: 'desc' }
      if (reviewSortOrder === 'do_asc') return { sortBy: 'do', sortDir: 'asc' }
      if (reviewSortOrder === 'do_desc') return { sortBy: 'do', sortDir: 'desc' }
      return { sortBy: 'score', sortDir: 'desc' }
    })()
  }, [reviewSortOrder])
  const sortedDoRegionFilterOptions = useMemo(() => {
    const collator = new Intl.Collator(localeToIntl(locale), { sensitivity: 'base' })
    const regionOptions = [...new Set(
      doOptions
        .map((item) => item.region.trim())
        .filter((value) => value !== ''),
    )]

    return regionOptions.sort((left, right) => collator.compare(left, right))
  }, [doOptions, locale])
  const metrics = useMemo(
    () => ({
      totalWines: genericStats?.total_wines ?? wineItems.length,
      totalReviews: genericStats?.total_reviews ?? reviewsPerMonthStats?.review_counts.reduce((sum, count) => sum + count, 0) ?? 0,
      myReviews: genericStats?.my_reviews ?? myReviewEntries.length,
      averageRed: genericStats?.average_red ?? averageScoreByType(wineItems, 'red'),
      averageWhite: genericStats?.average_white ?? averageScoreByType(wineItems, 'white'),
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
    () => new Intl.NumberFormat(localeToIntl(locale), { style: 'currency', currency: 'EUR' }),
    [locale],
  )

  const menuTitle = {
    dashboard: labels.topbar.overview,
    wines: labels.topbar.wines,
    dos: labels.topbar.dos,
    doCreate: labels.topbar.doCreate,
    wineCreate: labels.topbar.wineCreate,
    wineEdit: labels.topbar.wineEdit,
    reviews: labels.topbar.reviews,
    reviewCreate: labels.topbar.reviewCreate,
    reviewEdit: labels.topbar.reviewEdit,
    admin: labels.topbar.admin,
    apiDocs: labels.topbar.apiDoc,
    settings: labels.topbar.settings,
    wineProfile: selectedWineSheet ? `${t('wineProfile.pageTitle')} · ${selectedWineSheet.name}` : t('wineProfile.pageTitle'),
  }[menu]
  const doEditDoLogoPath = doLogoPathFromImageName(doEditDraft?.do_logo ?? null)
  const doEditRegionLogoPath = regionLogoPathFromImageName(doEditDraft?.region_logo ?? null)
  const doCreateLogoPath = doCreateLogoPreviewSrc ?? doLogoPathFromImageName(doCreateDraft.do_logo)

  const wineTypeLabel = (type: WineType) => {
    const localized = labels.wineType[type]
    if (typeof localized === 'string' && localized.trim() !== '') {
      return localized
    }

    if (type === 'sweet' || type === 'fortified') return labels.wineType[type]
    return type
  }
  const galleryLabels = labels.wineProfile.imageLabels
  const activeGalleryPhotoType: WinePhotoSlotType = activeGalleryImageKey === 'front'
    ? 'front_label'
    : activeGalleryImageKey === 'back'
      ? 'back_label'
      : activeGalleryImageKey === 'situation'
        ? 'situation'
        : 'bottle'
  const isPhotoOverlayOpen = selectedWineGallery != null || (photoEditorType != null && photoEditorSource != null)
  const isDarkMode = themeMode === 'dark'
  const brandWordmarkSrc = isDarkMode ? '/images/brand/logo-wordmark-dark.png' : '/images/brand/logo-wordmark-light.png'
  const brandWordmarkSidebarSrc = isDarkMode
    ? '/images/brand/logo-wordmark-dark.png'
    : '/images/brand/logo-wordmark-light.png'
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
        lastReview: t('ui.value_2_march_2026'),
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
    const timeoutId = window.setTimeout(() => {
      setDoListNameFilterDebounced(doListNameFilter.trim())
    }, 260)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [doListNameFilter])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDoListRegionFilterDebounced(doListRegionFilter.trim())
    }, 260)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [doListRegionFilter])

  useEffect(() => {
    setSettingsName(currentUser?.name ?? '')
    setSettingsLastname(currentUser?.lastname ?? '')
  }, [currentUser])

  useEffect(() => {
    if (!['wines', 'wineCreate', 'wineEdit', 'dos', 'doCreate'].includes(menu)) {
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
    if (menu === 'dos') {
      if (doListNameFilterDebounced !== '') {
        searchParams.set('name', doListNameFilterDebounced)
      }
      if (doListCountryFilter !== 'all') {
        searchParams.set('country', doListCountryFilter)
      }
      if (doListRegionFilterDebounced !== '') {
        searchParams.set('region', doListRegionFilterDebounced)
      }
    }

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
  }, [doListCountryFilter, doListNameFilterDebounced, doListRegionFilterDebounced, doListReloadToken, doSortFields, menu])

  const openDoCreate = () => {
    if (doCreateLogoPreviewSrc != null) {
      URL.revokeObjectURL(doCreateLogoPreviewSrc)
    }
    setDoCreateDraft({
      name: '',
      region: '',
      country: 'spain',
      country_code: 'ES',
      do_logo: '',
    })
    setDoCreateLogoFile(null)
    setDoCreateLogoPreviewSrc(null)
    setDoCreateSubmitting(false)
    setDoCreateError(null)
    setMenu('doCreate')
    setShowMobileMenu(false)
  }

  const handleDoCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = doCreateDraft.name.trim()
    const region = doCreateDraft.region.trim()
    const country = doCreateDraft.country
    const countryCode = doCreateDraft.country_code.trim().toUpperCase()
    const doLogoRaw = doCreateDraft.do_logo.trim()

    if (name === '' || region === '' || countryCode.length !== 2) {
      setDoCreateError(
        t('ui.name_region_country_and_code_country_2_characters_are_required'),
      )
      return
    }

    setDoCreateSubmitting(true)
    setDoCreateError(null)

    try {
      const response = await fetch(`${resolveApiBaseUrl()}/api/dos`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name,
          region,
          country,
          country_code: countryCode,
          do_logo: doCreateLogoFile != null ? null : (doLogoRaw === '' ? null : doLogoRaw),
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
          // Keep HTTP fallback.
        }
        throw new Error(errorMessage)
      }

      let createdDoId: number | undefined

      if (doCreateLogoFile != null) {
        try {
          const createdPayload = await response.json() as { do?: { id?: number } }
          createdDoId = createdPayload.do?.id
        } catch {
          createdDoId = undefined
        }

        if (!Number.isInteger(createdDoId) || (createdDoId as number) < 1) {
          throw new Error(t('ui.not_received_id_do_created_for_upload_logo'))
        }

        const body = new FormData()
        body.set('type', 'do_logo')
        body.set('file', doCreateLogoFile)
        const uploadResponse = await fetch(`${resolveApiBaseUrl()}/api/dos/${createdDoId}/assets`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
          body,
        })

        if (!uploadResponse.ok) {
          let errorMessage = `HTTP ${uploadResponse.status}`
          try {
            const errorPayload = await uploadResponse.json() as { error?: string }
            if (typeof errorPayload.error === 'string' && errorPayload.error.trim() !== '') {
              errorMessage = errorPayload.error
            }
          } catch {
            // Keep HTTP fallback.
          }
          throw new Error(errorMessage)
        }
      }

      if (doCreateLogoPreviewSrc != null) {
        URL.revokeObjectURL(doCreateLogoPreviewSrc)
      }
      setDoCreateLogoFile(null)
      setDoCreateLogoPreviewSrc(null)
      setDoListReloadToken((current) => current + 1)
      setDoSuccessToast(
        t('ui.created_success', { name }),
      )
      setMenu('dos')
      setDoCreateSubmitting(false)
    } catch (error: unknown) {
      setDoCreateError(error instanceof Error ? error.message : (t('ui.not_could_create_do')))
      setDoCreateSubmitting(false)
    }
  }

  const openDoEdit = useCallback((item: DoApiItem) => {
    setDoEditTarget(item)
    setDoEditDraft({
      name: item.name,
      region: item.region,
      country: item.country,
      country_code: item.country_code,
      do_logo: item.do_logo ?? '',
      region_logo: item.region_logo ?? '',
    })
    setDoAssetUploadingType(null)
    setDoEditError(null)
    setDoEditSubmitting(false)
  }, [])

  const closeDoEdit = () => {
    setDoEditTarget(null)
    setDoEditDraft(null)
    setDoAssetUploadingType(null)
    setDoEditError(null)
    setDoEditSubmitting(false)
  }

  const openDoDeleteConfirm = useCallback((item: DoApiItem) => {
    setDoDeleteTarget(item)
    setDoDeleteError(null)
    setDoDeleteSubmitting(false)
  }, [])

  const closeDoDeleteConfirm = () => {
    setDoDeleteTarget(null)
    setDoDeleteError(null)
    setDoDeleteSubmitting(false)
  }

  const doDirectoryRows = useMemo(() => (
    doDirectoryItems.map((item) => {
      const logoPath = doLogoPathFromImageName(item.do_logo)
      const regionLogoPath = regionLogoPathFromImageName(item.region_logo)
      const communityFlagPath = regionLogoPath

      return (
        <tr key={item.id}>
          <td className="do-directory-logo-cell" data-label={t('common.logo')}>
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
                <span className="do-directory-logo-fallback" aria-hidden="true">{t('common.doAbbreviation')}</span>
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
          <td className="do-directory-name-cell" data-label={t('ui.name')}>
            <strong>{item.name}</strong>
          </td>
          <td className="do-directory-region-cell" data-label={labels.dashboard.table.region}>
            <span className="wine-cell-value">{item.region}</span>
          </td>
          <td className="do-directory-country-cell" data-label={t('common.country')}>
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
          <td className="wine-col-actions do-directory-actions-cell" data-label={t('ui.actions')}>
            <div className="do-directory-actions">
              <button type="button" className="ghost-button small" onClick={() => openDoEdit(item)}>
                {t('ui.edit_action')}
              </button>
              <button type="button" className="ghost-button small danger-text-button" onClick={() => openDoDeleteConfirm(item)}>
                {t('ui.delete')}
              </button>
            </div>
          </td>
        </tr>
      )
    })
  ), [doDirectoryItems, labels.dashboard.table.region, locale, openDoDeleteConfirm, openDoEdit])

  const handleDoEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!doEditTarget || !doEditDraft) {
      return
    }

    const name = doEditDraft.name.trim()
    const region = doEditDraft.region.trim()
    const country = doEditDraft.country
    const countryCode = doEditDraft.country_code.trim().toUpperCase()
    const doLogoRaw = doEditDraft.do_logo.trim()
    if (name === '' || region === '' || countryCode.length !== 2) {
      setDoEditError(
        t('ui.name_region_country_and_code_country_2_characters_are_required'),
      )
      return
    }

    setDoEditSubmitting(true)
    setDoEditError(null)

    try {
      const response = await fetch(`${resolveApiBaseUrl()}/api/dos/${doEditTarget.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name,
          region,
          country,
          country_code: countryCode,
          do_logo: doLogoRaw === '' ? null : doLogoRaw,
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
          // Keep HTTP fallback.
        }
        throw new Error(errorMessage)
      }

      const updatedItem: DoApiItem = {
        ...doEditTarget,
        name,
        region,
        country,
        country_code: countryCode,
        do_logo: doLogoRaw === '' ? null : doLogoRaw,
        region_logo: doEditTarget.region_logo,
      }

      setDoOptions((current) => current.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
      setDoListReloadToken((current) => current + 1)
      setDoSuccessToast(
        t('ui.updated_success', { name }),
      )
      closeDoEdit()
    } catch (error: unknown) {
      setDoEditError(error instanceof Error ? error.message : (t('ui.not_could_update_do')))
      setDoEditSubmitting(false)
    }
  }

  const confirmDeleteDo = async () => {
    if (!doDeleteTarget) {
      return
    }

    setDoDeleteSubmitting(true)
    setDoDeleteError(null)

    try {
      await deleteDoById({ apiBaseUrl: resolveApiBaseUrl(), doId: doDeleteTarget.id })

      setDoOptions((current) => current.filter((item) => item.id !== doDeleteTarget.id))
      setDoListReloadToken((current) => current + 1)
      setDoSuccessToast(
        t('ui.deleted_success', { name: doDeleteTarget.name }),
      )
      closeDoDeleteConfirm()
    } catch (error: unknown) {
      setDoDeleteError(error instanceof Error ? error.message : (t('ui.not_could_delete_do')))
      setDoDeleteSubmitting(false)
    }
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
        setWineFormError(error instanceof Error ? error.message : (t('ui.not_could_load_wine')))
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
        setSelectedWineSheetError(error instanceof Error ? error.message : (t('ui.not_could_load_sheet_wine')))
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
    if ((menu !== 'reviews' && menu !== 'reviewCreate' && menu !== 'reviewEdit') || currentUserId == null) {
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

        const wineById = new Map(allWines.map((wine) => [wine.id, wine]))
        const reviewEntries: MyWineReviewEntry[] = []
        let reviewsPage = 1
        let reviewsTotalPages = 1

        while (reviewsPage <= reviewsTotalPages) {
          const params = new URLSearchParams()
          params.set('page', String(reviewsPage))
          params.set('limit', String(limit))
          params.set('sort_by', reviewSortConfig.sortBy)
          params.set('sort_dir', reviewSortConfig.sortDir)

          const reviewsResponse = await fetch(`${resolveApiBaseUrl()}/api/reviews?${params.toString()}`, {
            signal: controller.signal,
            credentials: 'include',
            headers: {
              Accept: 'application/json',
            },
          })

          if (!reviewsResponse.ok) {
            throw new Error(`HTTP ${reviewsResponse.status}`)
          }

          const payload = await reviewsResponse.json() as ReviewListApiResponse
          reviewsTotalPages = payload.pagination.total_pages
          const pageItems = Array.isArray(payload.items) ? payload.items : []

          pageItems.forEach((item) => {
            if (item.user.id !== currentUserId) {
              return
            }

            const wine = wineById.get(item.wine.id) ?? {
              id: item.wine.id,
              name: item.wine.name,
              winery: '-',
              type: 'red',
              country: '-',
              region: item.wine.do?.name ?? '-',
              doName: item.wine.do?.name ?? null,
              doLogo: null,
              regionLogo: null,
              thumbnailSrc: getDefaultNoPhotoSrc(),
              galleryPreview: {
                bottle: getDefaultNoPhotoSrc(),
                front: getDefaultNoPhotoSrc(),
                back: getDefaultNoPhotoSrc(),
                situation: getDefaultNoPhotoSrc(),
              },
              vintageYear: null,
              agingType: null,
              pricePaid: 0,
              averageScore: null,
            } satisfies WineItem

            reviewEntries.push({
              wine,
              review: {
                id: item.id,
                user: {
                  id: item.user.id,
                  name: item.user.name,
                  lastname: item.user.lastname,
                },
                score: item.score,
                aroma: item.aroma,
                appearance: item.appearance,
                palate_entry: item.palate_entry,
                body: item.body,
                persistence: item.persistence,
                bullets: item.bullets,
                created_at: item.created_at,
              },
            })
          })

          reviewsPage += 1
        }

        if (controller.signal.aborted) {
          return
        }

        setReviewTotalWines(totalItems)
        setMyReviewEntries(reviewEntries)
        setMyReviewSummaryStatus('ready')
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return
        }

        setMyReviewSummaryStatus('error')
        setMyReviewSummaryError(error instanceof Error ? error.message : (t('ui.not_could_load_your_reviews')))
      }
    }

    void loadMyReviews()

    return () => {
      controller.abort()
    }
  }, [menu, currentUserId, locale, reviewListReloadToken, reviewSortConfig])

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
          throw new Error(t('ui.credentials_invalid'))
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
        setLoginError(error instanceof Error ? error.message : (t('ui.not_could_start_session')))
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
    const cycle: Locale[] = ['es', 'ca', 'en']
    const currentIndex = cycle.indexOf(locale)
    const nextLocale = cycle[(currentIndex + 1) % cycle.length]
    setLocale(nextLocale)
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
          <p className="eyebrow">{labels.wineProfile.photosEyebrow}</p>
          <h3>{t('ui.gallery_wine')}</h3>
        </div>
        <div className="panel-header-actions">
          <span className="pill">{slots.filter((slot) => slot.uploaded).length}/4 {t('ui.uploaded')}</span>
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
                title={t('wineProfile.photoActions.edit')}
                aria-label={t('wineProfile.photoActions.edit')}
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
                title={t('wineProfile.photoActions.delete')}
                aria-label={t('wineProfile.photoActions.delete')}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )

  const startPhotoPick = (wineId: number, type: WinePhotoSlotType) => {
    setPhotoPickerContext('wine')
    setPhotoEditorWineId(wineId)
    setPhotoPickerType(type)
    setPhotoEditorError(null)
    photoPickerInputRef.current?.click()
  }

  const startDoCreateLogoPick = () => {
    setPhotoPickerContext('doCreate')
    setPhotoEditorWineId(null)
    setPhotoPickerType('do_logo')
    setPhotoEditorError(null)
    photoPickerInputRef.current?.click()
  }

  const startDoEditLogoPick = () => {
    if (!doEditTarget || doEditDraft == null) {
      return
    }

    setPhotoPickerContext('doEdit')
    setPhotoEditorWineId(doEditTarget.id)
    setPhotoPickerType('do_logo')
    setPhotoEditorError(null)
    photoPickerInputRef.current?.click()
  }

  const handlePhotoPickerChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || photoPickerType == null || photoPickerContext == null) {
      event.currentTarget.value = ''
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPhotoEditorType(photoPickerType)
    setPhotoEditorSource(objectUrl)
    setPhotoEditorZoom(1)
    setPhotoEditorOffsetX(0)
    setPhotoEditorOffsetY(0)
    setPhotoEditorDoLogoCropRatio('photo')
    setPhotoEditorError(null)
    event.currentTarget.value = ''
  }

  const closePhotoEditor = () => {
    if (photoEditorSource != null) {
      URL.revokeObjectURL(photoEditorSource)
    }
    setPhotoEditorType(null)
    setPhotoPickerContext(null)
    setPhotoEditorWineId(null)
    setPhotoEditorSource(null)
    setPhotoEditorSaving(false)
    setPhotoEditorError(null)
    setPhotoEditorZoom(1)
    setPhotoEditorOffsetX(0)
    setPhotoEditorOffsetY(0)
    setPhotoEditorDoLogoCropRatio('photo')
    resetPhotoEditorGestures()
  }

  const photoEditorRatioClass = useMemo(
    () => getPhotoEditorRatioClass(photoEditorType, photoEditorDoLogoCropRatio),
    [photoEditorType, photoEditorDoLogoCropRatio],
  )

  const drawPhotoEditorPreview = useCallback(
    () => drawPhotoEditorPreviewImage({
      photoEditorSource,
      photoEditorType,
      photoEditorDoLogoCropRatio,
      photoEditorZoom,
      photoEditorOffsetX,
      photoEditorOffsetY,
      canvas: photoEditorCanvasRef.current,
    }),
    [
      photoEditorDoLogoCropRatio,
      photoEditorOffsetX,
      photoEditorOffsetY,
      photoEditorSource,
      photoEditorType,
      photoEditorZoom,
    ],
  )

  const { savePhotoEditor, resetWinePhotoToDefault } = useWinePhotoActions({
    apiBaseUrl: resolveApiBaseUrl(),
    photoEditorType,
    photoPickerContext,
    photoEditorWineId,
    doCreateLogoPreviewSrc,
    drawPhotoEditorPreview,
    closePhotoEditor,
    getDefaultNoPhotoSrc,
    resolveApiAssetUrl,
    t: (key) => t(key),
    setPhotoEditorSaving,
    setPhotoEditorError,
    setPhotoDeleteBusyType,
    setDoCreateLogoFile,
    setDoCreateLogoPreviewSrc,
    setDoCreateDraft,
    setDoAssetUploadingType,
    setDoEditError,
    setDoEditDraft,
    setDoOptions,
    setDoListReloadToken,
    setWineProfileReloadToken,
    setWineEditReloadToken,
    setWineListReloadToken,
    setSelectedWineGallery,
  })

  useEffect(() => {
    if (photoEditorSource == null || photoEditorType == null) {
      return
    }

    void drawPhotoEditorPreview().catch(() => {
      setPhotoEditorError(t('ui.not_could_preview_photo'))
    })
  }, [photoEditorSource, photoEditorType, photoEditorZoom, photoEditorOffsetX, photoEditorOffsetY, photoEditorDoLogoCropRatio, locale])

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
      aroma: review.aroma,
      appearance: review.appearance,
      palateEntry: review.palate_entry,
      body: review.body,
      persistence: review.persistence,
      tags: review.bullets.map((bullet) => REVIEW_ENUM_TO_TAG[bullet]).filter((tag): tag is (typeof REVIEW_TAG_OPTIONS)[number] => tag != null),
    })
    setMenu('reviewEdit')
    setShowMobileMenu(false)
  }

  const deleteReview = async (wine: WineItem, review: WineDetailsApiReview) => {
    const confirmMessage = t('ui.want_delete_this_review')
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
      setReviewSuccessToast(t('ui.review_deleted_successfully'))
    } catch (error: unknown) {
      setReviewActionError(error instanceof Error ? error.message : (t('ui.not_could_delete_review')))
    } finally {
      setReviewDeleteBusyId(null)
    }
  }

  const reviewEditorPreset = buildReviewFormPreset(selectedReviewForEdit)
  const reviewedWineIdSet = useMemo(
    () => new Set(myReviewEntries.map((entry) => entry.wine.id)),
    [myReviewEntries],
  )
  const creatableWineItems = useMemo(
    () => wineItems.filter((wine) => !reviewedWineIdSet.has(wine.id)),
    [wineItems, reviewedWineIdSet],
  )

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
      await deleteWineById({
        apiBaseUrl: resolveApiBaseUrl(),
        wineId: wineDeleteTarget.id,
      })

      closeWineDeleteConfirm()
      if (wineItems.length === 1 && winePage > 1) {
        setWinePage((current) => Math.max(1, current - 1))
      } else {
        setWineListReloadToken((current) => current + 1)
      }
    } catch (error: unknown) {
      setWineDeleteError(error instanceof Error ? error.message : (t('ui.not_could_delete_wine')))
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
            placeholder={t('ui.search_by_name_wine')}
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
          {t('ui.variety_grape')}
          <select
            value={grapeFilter === 'all' ? 'all' : String(grapeFilter)}
            onChange={(event) => {
              setGrapeFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))
              setWinePage(1)
            }}
          >
            <option value="all">{t('ui.all_varieties')}</option>
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
          {t('ui.country_wine')}
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
          {t('common.doCountry')}
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
          {t('ui.search_do')}
          <input
            type="search"
            value={doSearchText}
            onChange={(event) => {
              setDoSearchText(event.target.value)
            }}
            placeholder={
              doCountryFilter === 'all'
                ? (t('ui.first_select_country'))
                : (t('ui.do_name_or_region'))
            }
            disabled={doCountryFilter === 'all'}
          />
        </label>

        <label>
          {t('common.doAbbreviation')}
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
                        ? (t('ui.select_country_before'))
                        : (t('ui.all_dos')))}
                  </span>
                )}
              </span>
              <span className="do-combobox-caret" aria-hidden="true">▾</span>
            </button>

            {isDoDropdownOpen && doCountryFilter !== 'all' ? (
              <div className="do-combobox-menu" role="listbox" aria-label={t('common.doAbbreviation')}>
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
                  <span>{t('ui.all_dos')}</span>
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
            {t('ui.clear_filters')}
          </button>
          <button
            type="button"
            className="primary-button small"
            onClick={() => {
              setIsDoDropdownOpen(false)
              setIsWineFiltersMobileOpen(false)
            }}
          >
            {t('ui.apply_filters')}
          </button>
        </div>
      ) : null}
    </>
  )

  const handleWineFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const isEditing = menu === 'wineEdit'
    if (isEditing && !selectedWineForEdit) {
      setWineFormError(t('ui.not_could_identify_wine_edit'))
      return
    }

    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    if (name === '') {
      setWineFormError(t('ui.name_wine_required'))
      return
    }

    const wineryRaw = String(form.get('winery') ?? '').trim()
    const wineType = String(form.get('wine_type') ?? '').trim()
    const agingType = String(form.get('aging_type') ?? '').trim()
    const country = manufacturingCountry
    const doId = createDoId === 'all' ? null : createDoId
    const vintageYearRaw = String(form.get('vintage_year') ?? '').trim()
    const alcoholRaw = String(form.get('alcohol_percentage') ?? '').trim()
    const placeTypeRaw = String(form.get('place_type') ?? '').trim()
    const placeName = String(form.get('place_name') ?? '').trim()
    const placeAddressRaw = String(form.get('place_address') ?? '').trim()
    const placeCityRaw = String(form.get('place_city') ?? '').trim()
    const placeCountryRaw = String(form.get('place_country') ?? '').trim()
    const pricePaidRaw = String(form.get('price_paid') ?? '').trim()
    const purchasedAtRaw = String(form.get('purchased_at') ?? '').trim()
    const purchasedAtIso = parseDateInputToIso(purchasedAtRaw)

    if (placeName === '' || pricePaidRaw === '' || purchasedAtRaw === '') {
      setWineFormError(
        t('ui.purchase_incomplete_place_price_and_date_are_required'),
      )
      return
    }

    if (purchasedAtIso == null) {
      setWineFormError(t('ui.date_must_use_dd_mm_yyyy'))
      return
    }

    const placeType = PLACE_TYPE_OPTIONS.includes(placeTypeRaw as (typeof PLACE_TYPE_OPTIONS)[number]) ? placeTypeRaw : null
    if (placeType === null) {
      setWineFormError(
        t('ui.type_place_invalid'),
      )
      return
    }

    const placeCountry = toWorldCountryValue(placeCountryRaw)
    if (!isWorldCountryValue(placeCountry)) {
      setWineFormError(
        t('ui.country_purchase_invalid'),
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
            country: placeCountry,
          },
          price_paid: pricePaidRaw,
          purchased_at: purchasedAtIso,
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
          ? t('wines.ui.updated_success', { name })
          : t('wines.ui.created_success', { name })
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
            ? (t('ui.not_could_update_wine'))
            : (t('ui.not_could_create_wine')),
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
    return () => {
      if (doCreateLogoPreviewSrc != null) {
        URL.revokeObjectURL(doCreateLogoPreviewSrc)
      }
    }
  }, [doCreateLogoPreviewSrc])

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
    const aromaRaw = String(data.get('aroma') ?? '').trim()
    const appearanceRaw = String(data.get('appearance') ?? '').trim()
    const palateEntryRaw = String(data.get('palate_entry') ?? '').trim()
    const bodyRaw = String(data.get('body') ?? '').trim()
    const persistenceRaw = String(data.get('persistence') ?? '').trim()
    const bulletsRaw = data.getAll('bullets').map((value) => String(value)) as Array<(typeof REVIEW_TAG_OPTIONS)[number]>
    const createdAtRaw = String(data.get('created_at') ?? '').trim()
    const createdAtIso = parseDateInputToIso(createdAtRaw)

    const wineId = Number(wineIdRaw)
    const score = Number(scoreRaw)
    const aroma = Number(aromaRaw)
    const appearance = Number(appearanceRaw)
    const palateEntry = Number(palateEntryRaw)
    const body = Number(bodyRaw)
    const persistence = Number(persistenceRaw)

    if (!Number.isInteger(wineId) || wineId < 1) {
      setReviewFormError(t('ui.must_select_a_wine'))
      setReviewFormSubmitting(false)
      return
    }

    if (mode === 'create' && reviewedWineIdSet.has(wineId)) {
      setReviewFormError(t('ui.this_wine_already_this_reviewed_and_not_can_back_select'))
      setReviewFormSubmitting(false)
      return
    }

    if (createdAtRaw !== '' && createdAtIso == null) {
      setReviewFormError(t('ui.date_must_use_dd_mm_yyyy'))
      setReviewFormSubmitting(false)
      return
    }

    const payload = {
      score: Math.max(0, Math.min(100, Math.round(score))),
      aroma: Math.max(0, Math.min(10, Math.round(aroma))),
      appearance: Math.max(0, Math.min(10, Math.round(appearance))),
      palate_entry: Math.max(0, Math.min(10, Math.round(palateEntry))),
      body: Math.max(0, Math.min(10, Math.round(body))),
      persistence: Math.max(0, Math.min(10, Math.round(persistence))),
      bullets: bulletsRaw.map((tag) => REVIEW_TAG_TO_ENUM[tag]),
      created_at: createdAtRaw === '' ? undefined : createdAtIso ?? undefined,
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
          ? (t('ui.review_created_successfully'))
          : (t('ui.review_updated_successfully')),
      )
    } catch (error: unknown) {
      setReviewFormError(error instanceof Error ? error.message : (t('ui.not_could_save_review')))
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
      setSettingsProfileError(t('ui.name_and_surname_are_required'))
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
      setSettingsProfileSuccess(t('ui.profile_updated_successfully'))
    } catch (error: unknown) {
      setSettingsProfileError(error instanceof Error ? error.message : (t('ui.not_could_update_profile')))
    } finally {
      setSettingsProfileSubmitting(false)
    }
  }

  const wineFormId = `wine-form-${menu}-${selectedWineForEdit?.id ?? 'new'}-${wineEditDetails?.id ?? 'none'}-${wineEditStatus}`
  const wineSubmitLabel = menu === 'wineEdit'
    ? (wineFormSubmitting ? (t('ui.saving')) : (t('ui.save_wine')))
    : (wineFormSubmitting ? (t('ui.creating')) : labels.wines.add.submit)

  if (!authBootstrapped) {
    return (
      <main className="login-shell">
        <section className="login-stage">
          <section className="login-panel">
            <p className="muted">{t('ui.checking_session')}</p>
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
          {t('common.publicWeb')}
        </a>
        <section className="login-stage">
          <section className="login-panel" aria-labelledby="login-title">
            <div className="login-header">
              <div className="login-header-top">
                <div>
                  <img
                    src={brandWordmarkSrc}
                    className="brand-logo brand-logo-login"
                    alt={t('common.brandAlt')}
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
                {loginSubmitting ? (t('ui.signing_in')) : labels.login.submit}
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
        aria-label={t('common.backofficeNavigationAria')}
      >
        <div className="sidebar-header">
          <img src={brandIconSrc} className="brand-mark" alt={t('common.brandAlt')} />
          <div className="sidebar-brand-copy">
            <img src={brandWordmarkSidebarSrc} className="brand-logo brand-logo-sidebar" alt={t('common.brandAlt')} />
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
          aria-label={t('common.userInformationAria')}
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
          aria-label={t('common.closeMenuAria')}
          onClick={() => setShowMobileMenu(false)}
        />
      ) : null}

      <section className="dashboard-content">
        <header className="topbar">
          <div className="topbar-mobile-head" aria-label={t('common.backofficeHeaderAria')}>
            <div className="topbar-mobile-brand">
              <img src={brandWordmarkTopbarSrc} className="topbar-mobile-wordmark" alt={t('common.brandAlt')} />
            </div>

            <div className="topbar-mobile-actions">
              <button
                type="button"
                className="topbar-mobile-bullet topbar-mobile-bullet-language"
                onClick={toggleLocale}
                aria-label={t('common.languageCodeAria', { code: locale.toUpperCase() })}
                title={t('common.languageCodeAria', { code: locale.toUpperCase() })}
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
                aria-label={t('ui.settings')}
                title={t('ui.settings')}
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
          <DashboardPanel
            t={t}
            labels={{ dashboard: { metrics: labels.dashboard.metrics } }}
            metrics={metrics}
            dashboardAnalytics={dashboardAnalytics}
            genericStatsStatus={genericStatsStatus}
            genericStatsError={genericStatsError}
            reviewsPerMonthStatus={reviewsPerMonthStatus}
            reviewsPerMonthError={reviewsPerMonthError}
            scoringGenericStatsStatus={scoringGenericStatsStatus}
            scoringGenericStatsError={scoringGenericStatsError}
            wineItemsLength={wineItems.length}
            wineTypeLabel={wineTypeLabel}
            priceFormatter={priceFormatter}
            onGoToReviews={() => setMenu('reviews')}
          />
        ) : null}

        {menu === 'wines' ? (
          <WinesListPanel
            t={t}
            labels={{ dashboard: { search: labels.dashboard.search, table: labels.dashboard.table } }}
            locale={locale}
            wineItems={wineItems}
            wineListStatus={wineListStatus}
            wineListError={wineListError}
            wineTotalItems={wineTotalItems}
            wineTotalPages={wineTotalPages}
            winePage={winePage}
            wineLimit={wineLimit}
            wineHasPrev={wineHasPrev}
            wineHasNext={wineHasNext}
            wineActiveFiltersCount={wineActiveFiltersCount}
            isMobileViewport={isMobileViewport}
            onOpenWineCreate={openWineCreate}
            onOpenWineMobileFilters={() => setIsWineFiltersMobileOpen(true)}
            onSetWinePage={setWinePage}
            onSetWineLimit={setWineLimit}
            onOpenWineSheet={openWineSheet}
            onOpenWineGallery={(wine) => openWineGallery(wine, 'full', 'bottle')}
            onOpenWineEdit={openWineEdit}
            onOpenWineDeleteConfirm={openWineDeleteConfirm}
            renderWineFiltersDesktop={renderWineFilters('desktop')}
            countryFlagPath={countryFlagPath}
            countryFlagEmoji={countryFlagEmoji}
            localizedCountryName={localizedCountryName}
            doLogoPathFromImageName={doLogoPathFromImageName}
            regionLogoPathFromImageName={regionLogoPathFromImageName}
            medalToneFromScore={medalToneFromScore}
            wineTypeLabel={wineTypeLabel}
            labelForAgingType={labelForAgingType}
            fallbackToDefaultWineIcon={fallbackToDefaultWineIcon}
            fallbackToAdminAsset={fallbackToAdminAsset}
          />
        ) : null}

        {menu === 'dos' ? (
          <DoDirectoryPanel
            t={t}
            labels={{ dos: { list: labels.dos.list }, dashboard: { table: { region: labels.dashboard.table.region } } }}
            doDirectoryItemsLength={doDirectoryItems.length}
            doSortPreset={doSortPreset}
            doSortPresetOptions={doSortPresetOptions}
            doListNameFilter={doListNameFilter}
            doListCountryFilter={doListCountryFilter}
            doListRegionFilter={doListRegionFilter}
            sortedDoRegionFilterOptions={sortedDoRegionFilterOptions}
            countryFilterValues={WINE_COUNTRY_FILTER_VALUES}
            doDirectoryRows={doDirectoryRows}
            onDoSortPresetChange={setDoSortPreset}
            onOpenDoCreate={openDoCreate}
            onDoListNameFilterChange={(event) => setDoListNameFilter(event.target.value)}
            onDoListCountryFilterChange={setDoListCountryFilter}
            onDoListRegionFilterChange={setDoListRegionFilter}
            countryCodeToLabel={(countryCode) => countryCodeToLabel(countryCode, locale)}
          />
        ) : null}

        {menu === 'doCreate' ? (
          <DoCreatePanel
            t={t}
            labels={labels.dos.create}
            doCreateSubmitting={doCreateSubmitting}
            photoEditorSaving={photoEditorSaving}
            doCreateDraft={doCreateDraft}
            doCreateError={doCreateError}
            doCreateLogoPath={doCreateLogoPath}
            doCreateLogoCaption={
              doCreateLogoFile != null
                ? doCreateLogoFile.name
                : (doCreateDraft.do_logo.trim() !== '' ? doCreateDraft.do_logo : t('ui.without_logo_assigned'))
            }
            countryOptions={WINE_COUNTRY_FILTER_VALUES.map((countryCode) => ({
              value: countryCode,
              label: countryCodeToLabel(countryCode, locale),
            }))}
            onBack={() => setMenu('dos')}
            onSubmit={(event) => { void handleDoCreateSubmit(event) }}
            onNameChange={(value) => setDoCreateDraft((current) => ({ ...current, name: value }))}
            onRegionChange={(value) => setDoCreateDraft((current) => ({ ...current, region: value }))}
            onCountryChange={(value) => setDoCreateDraft((current) => ({ ...current, country: value, country_code: toCountryIsoCode(value) }))}
            onCountryCodeChange={(value) => setDoCreateDraft((current) => ({ ...current, country_code: value.toUpperCase() }))}
            onStartLogoPick={startDoCreateLogoPick}
            onClearLogo={() => {
              if (doCreateLogoPreviewSrc != null) {
                URL.revokeObjectURL(doCreateLogoPreviewSrc)
              }
              setDoCreateLogoPreviewSrc(null)
              setDoCreateLogoFile(null)
              setDoCreateDraft((current) => ({ ...current, do_logo: '' }))
            }}
            onFallbackAsset={fallbackToAdminAsset}
          />
        ) : null}

        {menu === 'wineCreate' || menu === 'wineEdit' ? (
          <WineFormPanel
            t={t}
            labels={{ wines: labels.wines, wineType: labels.wineType, common: labels.common }}
            mode={menu}
            wineFormId={wineFormId}
            wineSubmitLabel={wineSubmitLabel}
            wineFormSubmitting={wineFormSubmitting}
            wineEditStatus={wineEditStatus}
            wineFormError={wineFormError}
            selectedWineForEdit={selectedWineForEdit}
            wineEditDetails={wineEditDetails}
            agingOptions={AGING_OPTIONS}
            vintageYearOptions={VINTAGE_YEAR_OPTIONS}
            countryOptions={WINE_COUNTRY_FILTER_VALUES.map((countryCode) => ({
              value: countryCode,
              label: countryCodeToLabel(countryCode, locale),
            }))}
            placeTypeOptions={PLACE_TYPE_OPTIONS}
            awardOptions={AWARD_OPTIONS}
            manufacturingCountry={manufacturingCountry}
            createDoCountryFilter={createDoCountryFilter}
            createDoSearchText={createDoSearchText}
            createDoId={createDoId}
            isCreateDoDropdownOpen={isCreateDoDropdownOpen}
            selectedCreateDoOption={selectedCreateDoOption}
            selectedCreateDoCommunityFlagPath={selectedCreateDoCommunityFlagPath}
            createFilteredDosBySearch={createFilteredDosBySearch}
            createDoDropdownRef={createDoDropdownRef}
            grapeBlendRows={grapeBlendRows}
            grapesByColor={grapesByColor}
            awardRows={awardRows}
            primaryEditPurchase={primaryEditPurchase}
            currentDateInput={CURRENT_DATE_INPUT}
            wineEditPhotoManager={menu === 'wineEdit' && selectedWineForEdit ? renderWinePhotoManager(selectedWineForEdit.id, wineEditPhotoSlots) : null}
            onSubmit={handleWineFormSubmit}
            onBack={() => setMenu('wines')}
            onManufacturingCountryChange={setManufacturingCountry}
            onCreateDoCountryFilterChange={(value) => {
              setCreateDoCountryFilter(value)
              setCreateDoId('all')
              setCreateDoSearchText('')
              setIsCreateDoDropdownOpen(false)
            }}
            onCreateDoSearchTextChange={setCreateDoSearchText}
            onCreateDoDropdownToggle={() => {
              if (createDoCountryFilter === 'all') {
                return
              }
              setIsCreateDoDropdownOpen((current) => !current)
            }}
            onCreateDoDropdownClose={() => setIsCreateDoDropdownOpen(false)}
            onCreateDoIdChange={setCreateDoId}
            onCreateDoSelect={(item) => {
              setCreateDoId(item.id)
              setManufacturingCountry(item.country)
            }}
            updateGrapeBlendRow={updateGrapeBlendRow}
            removeGrapeBlendRow={removeGrapeBlendRow}
            addGrapeBlendRow={addGrapeBlendRow}
            updateAwardRow={updateAwardRow}
            removeAwardRow={removeAwardRow}
            addAwardRow={addAwardRow}
            onFallbackAsset={fallbackToAdminAsset}
            regionLogoPathFromImageName={regionLogoPathFromImageName}
            formatIsoDateToDdMmYyyy={formatIsoDateToDdMmYyyy}
          />
        ) : null}

        {menu === 'reviews' ? (
          <ReviewsPanel
            t={t}
            labels={{ reviews: { edit: labels.reviews.edit, create: { palateEntry: labels.reviews.create.palateEntry } } }}
            reviewTotalWines={reviewTotalWines}
            myReviewEntries={myReviewEntries}
            myReviewSummaryStatus={myReviewSummaryStatus}
            myReviewSummaryError={myReviewSummaryError}
            reviewActionError={reviewActionError}
            reviewSortOrder={reviewSortOrder}
            reviewDeleteBusyId={reviewDeleteBusyId}
            locale={locale}
            reviewEnumToTag={REVIEW_ENUM_TO_TAG}
            onOpenReviewCreate={openReviewCreate}
            onReviewSortOrderChange={setReviewSortOrder}
            onOpenReviewEdit={(entry) => openReviewEdit(entry.wine, entry.review)}
            onDeleteReview={(entry) => {
              void deleteReview(entry.wine, entry.review)
            }}
            countryFlagPath={countryFlagPath}
            countryFlagEmoji={countryFlagEmoji}
            localizedCountryName={localizedCountryName}
            doLogoPathFromImageName={doLogoPathFromImageName}
            fallbackToDefaultWineIcon={fallbackToDefaultWineIcon}
            fallbackToAdminAsset={fallbackToAdminAsset}
            formatApiDate={formatApiDate}
            medalToneFromTen={medalToneFromTen}
            medalToneFromHundred={medalToneFromHundred}
          />
        ) : null}

        {menu === 'reviewCreate' ? (
          <ReviewEditorPanel
            t={t}
            labels={labels.reviews.create}
            mode="create"
            preset={createReviewPreset}
            selectedReviewId={selectedReviewForEdit?.id ?? null}
            reviewFormSubmitting={reviewFormSubmitting}
            reviewFormError={reviewFormError}
            creatableWineItems={creatableWineItems}
            wineItems={wineItems}
            reviewedWineIdSet={reviewedWineIdSet}
            reviewTagOptions={REVIEW_TAG_OPTIONS}
            scoreOptions0To10={SCORE_OPTIONS_0_TO_10}
            scoreOptions0To100={SCORE_OPTIONS_0_TO_100}
            onBack={() => setMenu('reviews')}
            onSubmit={handleReviewFormSubmit('create')}
          />
        ) : null}

        {menu === 'reviewEdit' ? (
          <ReviewEditorPanel
            t={t}
            labels={labels.reviews.create}
            mode="edit"
            preset={reviewEditorPreset}
            selectedReviewId={selectedReviewForEdit?.id ?? null}
            reviewFormSubmitting={reviewFormSubmitting}
            reviewFormError={reviewFormError}
            creatableWineItems={creatableWineItems}
            wineItems={wineItems}
            reviewedWineIdSet={reviewedWineIdSet}
            reviewTagOptions={REVIEW_TAG_OPTIONS}
            scoreOptions0To10={SCORE_OPTIONS_0_TO_10}
            scoreOptions0To100={SCORE_OPTIONS_0_TO_100}
            onBack={() => setMenu('reviews')}
            onSubmit={handleReviewFormSubmit('edit')}
          />
        ) : null}

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
          <ApiDocPanel
            labels={labels.apiDoc}
            apiGuideStatus={apiGuideStatus}
            apiGuideMarkdown={apiGuideMarkdown}
            apiGuideUrl={apiGuideUrl}
            apiGuideError={apiGuideError}
            copiedApiCodeKey={copiedApiCodeKey}
            onRefresh={() => {
              setApiGuideMarkdown('')
              setApiGuideError(null)
              setApiGuideReloadToken((current) => current + 1)
            }}
            onCopyApiCodeBlock={handleCopyApiCodeBlock}
          />
        ) : null}

        {menu === 'settings' ? (
          <SettingsPanel
            t={t}
            labelsMenu={labels.menu}
            settingsName={settingsName}
            settingsLastname={settingsLastname}
            settingsPassword={settingsPassword}
            settingsProfileSubmitting={settingsProfileSubmitting}
            settingsProfileError={settingsProfileError}
            settingsProfileSuccess={settingsProfileSuccess}
            loggedIn={loggedIn}
            locale={locale}
            themeMode={themeMode}
            defaultSortPreference={defaultSortPreference}
            defaultLandingPage={defaultLandingPage}
            showOnlySpainByDefault={showOnlySpainByDefault}
            compactCardsPreference={compactCardsPreference}
            onSettingsNameChange={setSettingsName}
            onSettingsLastnameChange={setSettingsLastname}
            onSettingsPasswordChange={setSettingsPassword}
            onSettingsProfileSubmit={handleSettingsProfileSubmit}
            onLocaleChange={setLocale}
            onThemeModeChange={setThemeMode}
            onDefaultSortPreferenceChange={setDefaultSortPreference}
            onDefaultLandingPageChange={setDefaultLandingPage}
            onToggleShowOnlySpainByDefault={() => setShowOnlySpainByDefault((current) => !current)}
            onToggleCompactCardsPreference={() => setCompactCardsPreference((current) => !current)}
          />
        ) : null}

        {menu === 'wineProfile' && selectedWineSheet ? (
          <WineProfilePanel
            t={t}
            locale={locale}
            fallbackName={selectedWineSheet.name}
            selectedWineSheetStatus={selectedWineSheetStatus}
            selectedWineSheetError={selectedWineSheetError}
            selectedWineSheetDetails={selectedWineSheetDetails}
            selectedWineAverageScore={selectedWineAverageScore}
            selectedWineGrapePie={selectedWineGrapePie}
            selectedWineDoLogo={selectedWineDoLogo}
            selectedWineCommunityFlagPath={selectedWineCommunityFlagPath}
            winePhotoManager={renderWinePhotoManager(selectedWineSheet.id, selectedWinePhotoSlots)}
            reviewEnumToTag={REVIEW_ENUM_TO_TAG}
            onBack={closeWineSheet}
            onEdit={() => openWineEdit(selectedWineSheet)}
            onFallbackAsset={fallbackToAdminAsset}
            formatApiDate={formatApiDate}
            countryCodeToLabel={(country, currentLocale) => countryCodeToLabel(country, currentLocale)}
            wineTypeLabel={(type) => wineTypeLabel(type)}
            labelForAgingType={labelForAgingType}
            labelForAwardName={labelForAwardName}
            medalToneFromHundred={medalToneFromHundred}
            wineryLabel={labels.wines.add.winery}
          />
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

      <WineFiltersMobileModal
        open={isMobileViewport && isWineFiltersMobileOpen}
        t={t}
        onClose={() => {
          setIsDoDropdownOpen(false)
          setIsWineFiltersMobileOpen(false)
        }}
        content={renderWineFilters('mobile')}
      />

      <DoEditModal
        open={doEditTarget != null}
        t={t}
        targetName={doEditTarget?.name ?? ''}
        doEditDraft={doEditDraft}
        doEditDoLogoPath={doEditDoLogoPath}
        doEditRegionLogoPath={doEditRegionLogoPath}
        doAssetUploadingType={doAssetUploadingType}
        doEditSubmitting={doEditSubmitting}
        photoEditorSaving={photoEditorSaving}
        doEditError={doEditError}
        countryOptions={WINE_COUNTRY_FILTER_VALUES.map((countryCode) => ({
          value: countryCode,
          label: countryCodeToLabel(countryCode, locale),
        }))}
        onClose={closeDoEdit}
        onSubmit={(event) => { void handleDoEditSubmit(event) }}
        onNameChange={(value) => setDoEditDraft((current) => (current == null ? current : { ...current, name: value }))}
        onRegionChange={(value) => setDoEditDraft((current) => (current == null ? current : { ...current, region: value }))}
        onCountryChange={(value) => setDoEditDraft((current) => (current == null ? current : { ...current, country: value }))}
        onCountryCodeChange={(value) => setDoEditDraft((current) => (current == null ? current : { ...current, country_code: value.toUpperCase() }))}
        onStartDoEditLogoPick={startDoEditLogoPick}
        onClearDoLogo={() => setDoEditDraft((current) => (current == null ? current : { ...current, do_logo: '' }))}
        onFallbackAsset={fallbackToAdminAsset}
      />

      <ConfirmDeleteModal
        open={doDeleteTarget != null}
        eyebrow={t('ui.delete_do')}
        title={doDeleteTarget?.name ?? ''}
        description={t('ui.this_accion_eliminara_do_yes_not_has_wines_linked_want_continuar')}
        error={doDeleteError}
        cancelLabel={t('ui.cancel')}
        confirmLabel={doDeleteSubmitting ? t('ui.deleting') : t('ui.delete_action')}
        submitting={doDeleteSubmitting}
        modalId="delete-do-title"
        onClose={closeDoDeleteConfirm}
        onConfirm={() => { void confirmDeleteDo() }}
      />

      <ConfirmDeleteModal
        open={wineDeleteTarget != null}
        eyebrow={t('ui.delete_wine_section')}
        title={wineDeleteTarget?.name ?? ''}
        description={t('ui.this_accion_eliminara_wine_and_its_photos_want_continuar')}
        error={wineDeleteError}
        cancelLabel={t('ui.cancel')}
        confirmLabel={wineDeleteSubmitting ? t('ui.deleting') : t('ui.delete_action')}
        submitting={wineDeleteSubmitting}
        modalId="delete-wine-title"
        onClose={closeWineDeleteConfirm}
        onConfirm={() => { void confirmDeleteWine() }}
      />

      <PhotoEditorModal
        open={photoEditorType != null && photoEditorSource != null}
        t={t}
        photoEditorType={photoEditorType}
        title={photoEditorType == null ? '' : labelForPhotoType(photoEditorType, locale)}
        ratioClass={photoEditorRatioClass}
        isMobileViewport={isMobileViewport}
        zoom={photoEditorZoom}
        offsetX={photoEditorOffsetX}
        offsetY={photoEditorOffsetY}
        doLogoCropRatio={photoEditorDoLogoCropRatio}
        error={photoEditorError}
        saving={photoEditorSaving}
        canvasRef={photoEditorCanvasRef}
        onClose={closePhotoEditor}
        onSave={() => { void savePhotoEditor() }}
        onPointerDown={handlePhotoEditorPointerDown}
        onPointerMove={handlePhotoEditorPointerMove}
        onPointerUp={handlePhotoEditorPointerUp}
        onDecreaseZoom={() => setPhotoEditorZoom((current) => clamp(current - 0.1, 1, 3))}
        onIncreaseZoom={() => setPhotoEditorZoom((current) => clamp(current + 0.1, 1, 3))}
        onZoomChange={(event) => setPhotoEditorZoom(Number(event.target.value))}
        onOffsetXChange={(event) => setPhotoEditorOffsetX(Number(event.target.value))}
        onOffsetYChange={(event) => setPhotoEditorOffsetY(Number(event.target.value))}
        onDoLogoCropRatioChange={setPhotoEditorDoLogoCropRatio}
      />

      <input
        ref={photoPickerInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handlePhotoPickerChange}
      />

      <WineGalleryModal
        open={selectedWineGallery != null}
        t={t}
        wineName={selectedWineGallery?.name ?? ''}
        winery={selectedWineGallery?.winery ?? ''}
        images={selectedWineGalleryImages}
        activeKey={activeGalleryImageKey}
        galleryLabels={galleryLabels}
        compact={galleryModalVariant === 'compact'}
        onClose={closeWineGallery}
        onSetActiveKey={setActiveGalleryImageKey}
        onEditActive={() => {
          if (!selectedWineGallery) {
            return
          }
          startPhotoPick(selectedWineGallery.id, activeGalleryPhotoType)
        }}
        onDeleteActive={() => {
          if (!selectedWineGallery) {
            return
          }
          void resetWinePhotoToDefault(selectedWineGallery.id, activeGalleryPhotoType)
        }}
        deleteDisabled={photoDeleteBusyType === activeGalleryPhotoType}
        onFallbackWineImage={fallbackToDefaultWineIcon}
      />

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

export default HomePage
