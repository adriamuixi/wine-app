import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { LanguageSelector } from './components/LanguageSelector'
import './App.css'
import { useI18n } from './i18n/I18nProvider'

type WineType = 'red' | 'white' | 'rose' | 'sparkling'

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

type MenuKey = 'dashboard' | 'wines' | 'wineCreate' | 'reviews' | 'admin' | 'settings' | 'wineProfile'
type ThemeMode = 'light' | 'dark'
type GalleryModalVariant = 'full' | 'compact'

type MockUser = {
  id: number
  name: string
  lastname: string
  email: string
}

const SAMPLE_WINE_THUMBNAIL_SRC = 'photos/wines/exmaple_wine-hash.png'
const SAMPLE_WINE_GALLERY = [
  { key: 'bottle', src: SAMPLE_WINE_THUMBNAIL_SRC },
  { key: 'front', src: 'photos/wines/front_wine-hash.png' },
  { key: 'back', src: 'photos/wines/back_wine-hash.png' },
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
  { id: 11, wineId: 1, wineName: 'Laderas del Norte', score: 88, createdAt: '2026-02-20', notes: 'Ripe cherry, medium body, easy finish.' },
  { id: 12, wineId: 6, wineName: 'Gran Reserva 12', score: 95, createdAt: '2026-02-18', notes: 'Oak-forward, structured tannin, long persistence.' },
  { id: 13, wineId: 2, wineName: 'Mar de Pizarra', score: 84, createdAt: '2026-02-14', notes: 'Citrus and saline notes, crisp acidity.' },
  { id: 14, wineId: 8, wineName: 'Noches de Burbuja', score: 86, createdAt: '2026-02-12', notes: 'Fresh bubbles, floral nose, clean finish.' },
]

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

function doLogoPathForRegion(region: string): string | null {
  const map: Record<string, string> = {
    'Penedès': '/icons/DO/penedes_DO.png',
    Montsant: '/icons/DO/montanst_DO.png',
    'Ribera del Duero': '/icons/DO/ribera_del_duero_DO.png',
    Somontano: '/icons/DO/somontano_DO.jpg',
    Toro: '/icons/DO/toro_DO.jpg',
    Rioja: '/icons/DO/rioja_DO.png',
    Tarragona: '/icons/DO/tarragona_DO.png',
    'Terra Alta': '/icons/DO/terra_alta_DO.png',
    Priorat: '/icons/DO/priorat_DO.png',
    'Conca de Barberà': '/icons/DO/conca_de_barbera_DO.jpg',
    'Pla de Bages': '/icons/DO/pla_de_bages_DO.png',
    Alella: '/icons/DO/alella_DO.png',
    Empordà: '/icons/DO/emporda_DO.png',
    Navarra: '/icons/DO/navarra_DO.jpg',
    Cariñena: '/icons/DO/cariñena_DO.png',
    Calatayud: '/icons/DO/calatayud_DO.jpg',
    Cigales: '/icons/DO/cigales_DO.png',
    Arlanza: '/icons/DO/arlanza_DO.jpg',
    'Costers del Segre': '/icons/DO/costers_del_segre_DO.png',
  }

  return map[region] ?? null
}

function spanishAutonomousCommunity(region: string): string | null {
  const regionToCommunity: Record<string, string> = {
    'Terra Alta': 'Catalonia',
    'Penedès': 'Catalonia',
    'Montsant': 'Catalonia',
    Tarragona: 'Catalonia',
    Rioja: 'La Rioja',
    'Ribera del Duero': 'Castile and Leon',
    Toro: 'Castile and Leon',
    Somontano: 'Aragon',
    'Rías Baixas': 'Galicia',
  }

  return regionToCommunity[region] ?? null
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
          { name: 'Garnacha', color: 'red', percentage: '20.00' },
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

function App() {
  const { labels, locale, setLocale, t } = useI18n()
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(getInitialSidebarCollapsed)
  const [loggedIn, setLoggedIn] = useState(false)
  const [menu, setMenu] = useState<MenuKey>('dashboard')
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('demo1234')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [selectedWineSheet, setSelectedWineSheet] = useState<WineItem | null>(null)
  const [selectedWineGallery, setSelectedWineGallery] = useState<WineItem | null>(null)
  const [galleryModalVariant, setGalleryModalVariant] = useState<GalleryModalVariant>('full')
  const [activeGalleryImageKey, setActiveGalleryImageKey] = useState<(typeof SAMPLE_WINE_GALLERY)[number]['key']>('bottle')
  const [defaultSortPreference, setDefaultSortPreference] = useState<'score_desc' | 'recent' | 'price_asc'>('score_desc')
  const [defaultLandingPage, setDefaultLandingPage] = useState<'dashboard' | 'wines' | 'reviews'>('dashboard')
  const [showOnlySpainByDefault, setShowOnlySpainByDefault] = useState(true)
  const [compactCardsPreference, setCompactCardsPreference] = useState(false)

  const [searchText, setSearchText] = useState('')
  const [countryFilter, setCountryFilter] = useState<'all' | string>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | WineType>('all')
  const [minScoreFilter, setMinScoreFilter] = useState<'all' | number>('all')

  const menuItems: Array<{ key: Exclude<MenuKey, 'wineProfile'>; label: string; short: string; icon: string }> = [
    { key: 'dashboard', label: labels.menu.dashboard, short: 'DB', icon: '⌂' },
    { key: 'wines', label: labels.menu.wines, short: 'W', icon: '🍷' },
    { key: 'reviews', label: labels.menu.reviews, short: 'R', icon: '✎' },
    { key: 'admin', label: labels.menu.admin, short: 'A', icon: '⚙' },
  ]

  const countries = useMemo(
    () => ['all', ...Array.from(new Set(mockWines.map((wine) => wine.country)))],
    [],
  )

  const filteredWines = useMemo(() => {
    const query = searchText.trim().toLowerCase()

    return mockWines.filter((wine) => {
      const matchesText =
        query === '' ||
        wine.name.toLowerCase().includes(query) ||
        wine.winery.toLowerCase().includes(query) ||
        wine.region.toLowerCase().includes(query)

      const matchesCountry = countryFilter === 'all' || wine.country === countryFilter
      const matchesType = typeFilter === 'all' || wine.type === typeFilter
      const matchesScore = minScoreFilter === 'all' || (wine.averageScore ?? 0) >= minScoreFilter

      return matchesText && matchesCountry && matchesType && matchesScore
    })
  }, [searchText, countryFilter, typeFilter, minScoreFilter])

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
    const sortedByScore = [...scoredWines].sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0))
    const topWines = sortedByScore.slice(0, 3)
    const lowWines = [...sortedByScore].slice(-3).reverse()
    const highScoreCount = scoredWines.filter((wine) => (wine.averageScore ?? 0) >= 80).length
    const lowScoreCount = scoredWines.filter((wine) => (wine.averageScore ?? 0) < 65).length
    const scoreSpread = scoredWines.length > 0
      ? Math.max(...scoredWines.map((wine) => wine.averageScore ?? 0)) - Math.min(...scoredWines.map((wine) => wine.averageScore ?? 0))
      : 0
    const averagePrice = mockWines.reduce((sum, wine) => sum + wine.pricePaid, 0) / mockWines.length
    const qualityIndex = averagePrice > 0 ? ((metrics.averageRed + metrics.averageWhite) / 2) / averagePrice : 0

    const timelineLocale = locale === 'ca' ? 'ca-ES' : 'es-ES'
    const monthFormatter = new Intl.DateTimeFormat(timelineLocale, { month: 'short', year: '2-digit' })
    const now = new Date()
    const reviewTimeline = Array.from({ length: 60 }, (_, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (59 - index), 1)
      const seed = index + 11
      const reviews = (seed * 7 + 3) % 6 // 0..5 (mock estable)
      const median = 76 + ((seed * 13) % 17) + (((seed * 5) % 10) / 10) // ~76.0..92.9
      return {
        label: monthFormatter.format(monthDate).replace('.', ''),
        reviews,
        median: Math.round(median * 10) / 10,
      }
    })

    const webVsMyTimeline = [
      { label: locale === 'ca' ? 'Gen' : 'Ene', web: 18, mine: 3 },
      { label: locale === 'ca' ? 'Feb' : 'Feb', web: 22, mine: 4 },
      { label: locale === 'ca' ? 'Mar' : 'Mar', web: 16, mine: 2 },
      { label: locale === 'ca' ? 'Abr' : 'Abr', web: 28, mine: 5 },
      { label: locale === 'ca' ? 'Mai' : 'May', web: 24, mine: 4 },
      { label: locale === 'ca' ? 'Jun' : 'Jun', web: 31, mine: 6 },
    ]

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

    return {
      topWines,
      lowWines,
      highScoreCount,
      lowScoreCount,
      scoreSpread,
      averagePrice,
      qualityIndex,
      reviewTimeline,
      webVsMyTimeline,
      scoreBuckets,
      byType,
      awardsWith,
      awardsWithout,
      awardTypes,
    }
  }, [locale, metrics.averageRed, metrics.averageWhite])

  const priceFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'ca' ? 'ca-ES' : 'es-ES', { style: 'currency', currency: 'EUR' }),
    [locale],
  )

  const menuTitle = {
    dashboard: labels.topbar.overview,
    wines: labels.topbar.wines,
    wineCreate: locale === 'ca' ? 'Crear vi' : 'Crear vino',
    reviews: labels.topbar.reviews,
    admin: labels.topbar.admin,
    settings: locale === 'ca' ? 'Configuració' : 'Configuración',
    wineProfile: selectedWineSheet ? `${t('wineProfile.pageTitle')} · ${selectedWineSheet.name}` : t('wineProfile.pageTitle'),
  }[menu]

  const wineTypeLabel = (type: WineType) => labels.wineType[type]
  const galleryLabels = labels.wineProfile.imageLabels
  const isDarkMode = themeMode === 'dark'
  const brandWordmarkSrc = isDarkMode ? 'brand/logo-wordmark-dark.png' : 'brand/logo-wordmark-light.png'
  const themeToggleLabel = isDarkMode ? labels.common.themeSwitchToLight : labels.common.themeSwitchToDark

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

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (email.trim() === '' || password.trim() === '') {
      setLoginError(labels.login.requiredError)
      return
    }

    setLoginError(null)
    setLoggedIn(true)
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setShowMobileMenu(false)
    setMenu('dashboard')
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
  const dbCountryFlags = useMemo(
    () => Array.from(new Set(mockWines.map((wine) => wine.country))).map((country) => ({
      country,
      flag: countryFlagEmoji(country),
    })),
    [],
  )
  const spainAutonomousCommunities = useMemo(
    () => Array.from(new Set(
      mockWines
        .filter((wine) => wine.country === 'Spain')
        .map((wine) => spanishAutonomousCommunity(wine.region))
        .filter((value): value is string => Boolean(value)),
    )).sort((a, b) => a.localeCompare(b)),
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
      setCountryFilter(wine.country)
    }

    if (target === 'type') {
      setTypeFilter(wine.type)
    }

    setMenu('dashboard')
    setShowMobileMenu(false)
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

              <button type="submit" className="primary-button">
                {labels.login.submit}
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
          <img src="brand/icon-square-64.png" className="brand-mark" alt="Tat & Rosset icon" />
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
          title={isSidebarCollapsed ? `${mockUser.name} ${mockUser.lastname}` : undefined}
        >
          <div className="avatar">{mockUser.name[0]}</div>
          <div className="user-meta">
            <p className="user-name">{mockUser.name} {mockUser.lastname}</p>
            <p className="user-role">{labels.user.role}</p>
            <p className="user-email">{mockUser.email}</p>
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
                    {filteredWines.length} {labels.dashboard.search.results}
                  </span>
                  <button type="button" className="primary-button" onClick={() => setMenu('wineCreate')}>
                    {locale === 'ca' ? 'Crear nou vi' : 'Crear nuevo vino'}
                  </button>
                </div>
              </div>

              <div className="filter-grid">
                <label>
                  {labels.dashboard.search.search}
                  <input
                    type="search"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder={labels.common.searchPlaceholder}
                  />
                </label>

                <label>
                  {labels.dashboard.search.country}
                  <select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)}>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country === 'all' ? labels.common.allCountries : country}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  {labels.dashboard.search.type}
                  <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as 'all' | WineType)}>
                    <option value="all">{labels.common.allTypes}</option>
                    <option value="red">{labels.wineType.red}</option>
                    <option value="white">{labels.wineType.white}</option>
                    <option value="rose">{labels.wineType.rose}</option>
                    <option value="sparkling">{labels.wineType.sparkling}</option>
                  </select>
                </label>

                <label>
                  {labels.dashboard.search.minScore}
                  <select
                    value={minScoreFilter === 'all' ? 'all' : String(minScoreFilter)}
                    onChange={(event) => setMinScoreFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))}
                  >
                    <option value="all">{labels.common.anyScore}</option>
                    <option value="80">80+</option>
                    <option value="85">85+</option>
                    <option value="90">90+</option>
                  </select>
                </label>
              </div>

              <div className="table-wrap">
                <table className="wine-table">
                  <thead>
                    <tr>
                      <th aria-label="Photo" />
                      <th>{labels.dashboard.table.wine}</th>
                      <th>{labels.dashboard.table.type}</th>
                      <th>{labels.dashboard.table.region}</th>
                      <th>{labels.dashboard.table.price}</th>
                      <th>{labels.dashboard.table.avg}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWines.map((wine) => (
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
                        <td className="wine-col-price" data-label={labels.dashboard.table.price}>{priceFormatter.format(wine.pricePaid)}</td>
                        <td className="wine-col-score" data-label={labels.dashboard.table.avg}>{wine.averageScore ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        ) : null}

        {menu === 'wineCreate' ? (
          <section className="screen-grid two-columns">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{labels.wines.add.eyebrow}</p>
                  <h3>{labels.wines.add.title}</h3>
                </div>
                <span className="pill muted">{labels.wines.add.badge}</span>
              </div>

              <form className="stack-form" onSubmit={(event) => event.preventDefault()}>
                <label>
                  {labels.wines.add.name}
                  <input type="text" placeholder="Clos de la Serra" />
                </label>
                <label>
                  {labels.wines.add.winery}
                  <input type="text" placeholder="Bodega Example" />
                </label>
                <div className="inline-grid">
                  <label>
                    {labels.wines.add.type}
                    <select defaultValue="red">
                      <option value="red">{labels.wineType.red}</option>
                      <option value="white">{labels.wineType.white}</option>
                      <option value="rose">{labels.wineType.rose}</option>
                      <option value="sparkling">{labels.wineType.sparkling}</option>
                    </select>
                  </label>
                  <label>
                    {labels.wines.add.vintage}
                    <input type="number" placeholder="2021" />
                  </label>
                </div>
                <div className="inline-grid">
                  <label>
                    {labels.wines.add.country}
                    <input type="text" placeholder="Spain" />
                  </label>
                  <label>
                    {labels.wines.add.region}
                    <input type="text" placeholder="Priorat" />
                  </label>
                </div>
                <div className="inline-grid">
                  <label>
                    {labels.wines.add.place}
                    <input type="text" placeholder="Restaurant / Supermarket" />
                  </label>
                  <label>
                    {labels.wines.add.price}
                    <input type="number" step="0.01" placeholder="18.50" />
                  </label>
                </div>
                <button type="submit" className="primary-button">{labels.wines.add.submit}</button>
              </form>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{locale === 'ca' ? 'CAMPOS (MOCK)' : 'CAMPOS (MOCK)'}</p>
                  <h3>{locale === 'ca' ? 'Checklist de creació de vi' : 'Checklist de creación de vino'}</h3>
                </div>
                <button type="button" className="ghost-button small" onClick={() => setMenu('wines')}>
                  {locale === 'ca' ? 'Tornar al llistat' : 'Volver al listado'}
                </button>
              </div>
              <div className="list-stack">
                {[
                  locale === 'ca' ? 'Dades bàsiques: nom, celler, tipus, anyada' : 'Datos básicos: nombre, bodega, tipo, añada',
                  locale === 'ca' ? 'Origen: país, regió, DO (si aplica)' : 'Origen: país, región, DO (si aplica)',
                  locale === 'ca' ? 'Compra: lloc i preu (obligatoris)' : 'Compra: lugar y precio (obligatorios)',
                  locale === 'ca' ? 'Multimèdia: fotos ampolla davant/darrere' : 'Multimedia: fotos botella frente/detrás',
                  locale === 'ca' ? 'Metadades: tags interns, notes de catàleg' : 'Metadatos: tags internos, notas de catálogo',
                  locale === 'ca' ? 'Validació abans de desar (mock)' : 'Validación antes de guardar (mock)',
                ].map((item) => (
                  <article key={item} className="list-card">
                    <div>
                      <h4>{item}</h4>
                      <p>{locale === 'ca' ? 'Es refinarà en una iteració següent.' : 'Se refinará en una siguiente iteración.'}</p>
                    </div>
                    <button type="button" className="secondary-button small" disabled>{locale === 'ca' ? 'Mock' : 'Mock'}</button>
                  </article>
                ))}
              </div>
            </section>
          </section>
        ) : null}

        {menu === 'reviews' ? (
          <section className="screen-grid two-columns">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{labels.reviews.create.eyebrow}</p>
                  <h3>{labels.reviews.create.title}</h3>
                </div>
                <span className="pill muted">{labels.reviews.create.badge}</span>
              </div>

              <form className="stack-form" onSubmit={(event) => event.preventDefault()}>
                <label>
                  {labels.reviews.create.wine}
                  <select defaultValue="">
                    <option value="" disabled>{labels.reviews.create.selectWine}</option>
                    {mockWines.map((wine) => (
                      <option key={wine.id} value={wine.id}>{wine.name} · {wine.winery}</option>
                    ))}
                  </select>
                </label>

                <div className="inline-grid triple">
                  <label>{labels.reviews.create.score}<input type="number" min={0} max={100} placeholder="90" /></label>
                  <label>{labels.reviews.create.body}<input type="number" min={0} max={5} placeholder="4" /></label>
                  <label>{labels.reviews.create.acidity}<input type="number" min={0} max={5} placeholder="3" /></label>
                </div>

                <label>
                  {labels.reviews.create.notes}
                  <textarea rows={4} placeholder={labels.reviews.create.notesPlaceholder} />
                </label>

                <button type="submit" className="primary-button">{labels.reviews.create.submit}</button>
              </form>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{labels.reviews.edit.title}</p>
                  <h3>{labels.reviews.edit.title}</h3>
                </div>
                <span className="pill">{mockReviews.length} {labels.reviews.edit.countSuffix}</span>
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
                      <button type="button" className="secondary-button small">{labels.reviews.edit.editAction}</button>
                      <button type="button" className="ghost-button small">{labels.reviews.edit.viewWineAction}</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>
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
                  <dd>{mockUser.name} {mockUser.lastname}</dd>
                </div>
                <div>
                  <dt>{labels.admin.account.labels.email}</dt>
                  <dd>{mockUser.email}</dd>
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
                      {countryFlagEmoji(selectedWineSheet.country)}
                    </span>
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
                      <img src={image.src} alt={`${selectedWineSheet.name} ${galleryLabels[image.key]}`} />
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
                          {countryFlagEmoji(selectedWineSheet.country)}
                        </span>
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
                    {dbCountryFlags.map(({ country, flag }) => (
                      <span key={country} className="wine-profile-country-flag" title={country} aria-label={country}>
                        {flag}
                      </span>
                    ))}
                  </div>
                  {dbCountryFlags.some((entry) => entry.country === 'Spain') ? (
                    <div className="wine-profile-origin-row wine-profile-spain-communities">
                      {spainAutonomousCommunities.map((community) => (
                        <span key={community} className="wine-profile-community-pill">{community}</span>
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
                      <img src={image.src} alt={`${selectedWineGallery.name} ${selectedWineProfile?.galleryLabels[image.key] ?? galleryLabels[image.key]}`} loading="lazy" />
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
                      <img src={activeImage.src} alt={`${selectedWineGallery.name} ${selectedWineProfile?.galleryLabels[activeImage.key] ?? galleryLabels[activeImage.key]}`} />
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
