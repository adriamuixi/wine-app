import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
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

type MenuKey = 'dashboard' | 'wines' | 'reviews' | 'admin' | 'wineProfile'
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
    sections,
  }
}

function App() {
  const { labels, locale, t } = useI18n()
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

  const priceFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'ca' ? 'ca-ES' : 'es-ES', { style: 'currency', currency: 'EUR' }),
    [locale],
  )

  const menuTitle = {
    dashboard: labels.topbar.overview,
    wines: labels.topbar.wines,
    reviews: labels.topbar.reviews,
    admin: labels.topbar.admin,
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
          <aside className="wine-promo" aria-hidden="true">
            <img
                src="photos/wines_photo.png"
              className="promo-photo"
              alt=""
              aria-hidden="true"
            />
            <div className="promo-overlay" />
            <div className="promo-content">
              <div className="promo-logo-card">
              <img
                src="brand/logo-wordmark-light.png"
                className="brand-logo brand-logo-promo"
                alt=""
                aria-hidden="true"
              />
              </div>
              <p className="eyebrow">{labels.login.eyebrow}</p>
              <h1>{labels.login.title}</h1>
              <p>{labels.login.promo}</p>
              <ul className="promo-list">
                {labels.login.bullets.map((bullet: string) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          </aside>

          <section className="login-panel" aria-labelledby="login-title">
            <div className="login-header">
              <div className="login-header-top">
                <div>
                  <img
                    src={brandWordmarkSrc}
                    className="brand-logo brand-logo-login"
                    alt="Vins Tat & Rosset"
                  />
                  <p className="eyebrow">{labels.common.appName}</p>
                  <h2 id="login-title">{labels.login.panelTitle}</h2>
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
                  <LanguageSelector />
                </div>
              </div>
              <p className="muted">{labels.common.mockMode}</p>
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

            <div className="demo-note">
              <p className="demo-note-title">{labels.login.demoTitle}</p>
              <p>{labels.login.demoDescription}</p>
            </div>
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

      <section className="dashboard-content">
        <header className="topbar">
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

            <section className="panel search-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{labels.dashboard.search.eyebrow}</p>
                  <h3>{labels.dashboard.search.title}</h3>
                </div>
                <span className="pill">
                  {filteredWines.length} {labels.dashboard.search.results}
                </span>
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
                    onChange={(event) =>
                      setMinScoreFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))
                    }
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
                        <td>
                          <strong>{wine.name}</strong>
                          <span>{wine.winery}</span>
                        </td>
                        <td>{wineTypeLabel(wine.type)}</td>
                        <td>{wine.country} · {wine.region}</td>
                        <td>{priceFormatter.format(wine.pricePaid)}</td>
                        <td>{wine.averageScore ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        ) : null}

        {menu === 'wines' ? (
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
                  <p className="eyebrow">{labels.wines.edit.eyebrow}</p>
                  <h3>{labels.wines.edit.title}</h3>
                </div>
                <span className="pill">{mockWines.length} {labels.wines.edit.countSuffix}</span>
              </div>
              <div className="list-stack">
                {mockWines.slice(0, 6).map((wine) => (
                  <article key={wine.id} className="list-card">
                    <div>
                      <h4>{wine.name}</h4>
                      <p>{wine.winery} · {wine.country} · {wine.region}</p>
                    </div>
                    <button type="button" className="secondary-button small">{labels.wines.edit.action}</button>
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

        {menu === 'wineProfile' && selectedWineSheet && selectedWineProfile ? (
          <section className="wine-profile-screen">
            <header className="panel wine-profile-header-panel">
              <div className="wine-profile-header-main">
                <div className="wine-profile-title-wrap">
                  <p className="eyebrow">{selectedWineProfile.headline}</p>
                  <h3>{selectedWineSheet.name}</h3>
                  <p className="muted">{selectedWineSheet.winery} · {selectedWineSheet.country} · {selectedWineSheet.region}</p>
                </div>
                <div className="wine-profile-header-actions">
                  <button type="button" className="ghost-button" onClick={closeWineSheet}>
                    {t('wineProfile.backToDashboard')}
                  </button>
                  <button type="button" className="secondary-button">
                    {t('wineProfile.editWineMock')}
                  </button>
                </div>
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
