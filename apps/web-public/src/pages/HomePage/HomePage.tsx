import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { localeLabels, messages, type Locale } from '../../i18n/messages'
import AboutPageView from '../../features/about/components/AboutPageView'
import CatalogPageView from '../../features/catalog/components/CatalogPageView'
import {
  DEFAULT_PUBLIC_WINE_IMAGE_DARK,
  DEFAULT_PUBLIC_WINE_IMAGE_LIGHT,
  DEFAULT_SORT,
  LEAFLET_CSS_LINK_ID,
  LEAFLET_CSS_URL,
  LOCALE_KEY,
  MOBILE_VIEW_COOKIE_KEY,
  THEME_KEY,
} from '../../app/config/constants'
import type {
  ScoreFilterBucket,
  SortKey,
  ThemeMode,
  WineCard,
  WineDetailsApiResponse,
  WineType,
} from '../../features/catalog/types'
import { fetchWineDetailsById, fetchWineListItems } from '../../features/catalog/services/wineApi'
import {
  countryCodeToLabel,
  doLogoPathFromImageName,
  mapWineListItemToWineCard,
  mergeWineCardWithDetails,
  regionLogoPathFromImageName,
} from '../../features/catalog/services/wineMappers'
import {
  DO_MAP_ALL_WORLD_VALUE,
  type DoApiItem,
  type DoFilterOption,
  type DoMapPoint,
} from '../../features/do-map/types'
import DoMapPageView from '../../features/do-map/components/DoMapPageView'
import WineRoutePageView from '../../features/wine-route/components/WineRoutePageView'
import { fetchWineRouteStops } from '../../features/wine-route/services/wineRouteApi'
import type { WineRouteStop } from '../../features/wine-route/types'
import { fetchDoItems } from '../../features/do-map/services/doApi'
import { initializeLeafletMap, type DoMapMarkerHandle } from '../../features/do-map/services/leafletMap'
import { clearCookieValue, getCookieValue, setCookieValue } from '../../shared/lib/cookies'
import { resolveApiBaseUrl } from '../../shared/lib/env'
import {
  autonomousCommunityNameForRegion,
  countryFlagEmoji,
  countryFlagPath,
  localizedCountryName,
  normalizeSearchText,
} from '../../shared/lib/geo'
import { getInitialLocale, localeToIntl } from '../../shared/lib/locale'
import { upsertCanonicalLink, upsertMetaTag } from '../../shared/lib/seo'
import { getInitialTheme } from '../../shared/lib/theme'
import { parseCatalogUrlState, syncCatalogUrlState } from '../../shared/lib/urlState'

function defaultPublicWineImageForTheme(isDark: boolean): string {
  return isDark ? DEFAULT_PUBLIC_WINE_IMAGE_DARK : DEFAULT_PUBLIC_WINE_IMAGE_LIGHT
}

function resolvePublicWineImageForTheme(src: string, isDark: boolean): string {
  if (src === DEFAULT_PUBLIC_WINE_IMAGE_LIGHT || src === DEFAULT_PUBLIC_WINE_IMAGE_DARK) {
    return defaultPublicWineImageForTheme(isDark)
  }
  return src
}

function splitGrapeVarieties(grapes: string): string[] {
  return grapes
    .split(/[,/]/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export default function App() {
  const initialUrl = useMemo(() => parseCatalogUrlState(), [])
  const currentPath = typeof window !== 'undefined'
    ? (window.location.pathname.replace(/\/+$/, '') || '/')
    : '/'
  const isDoMapPage = currentPath === '/do-map'
  const isAboutPage = currentPath === '/about'
  const isWineRoutePage = currentPath === '/ruta-de-vins'
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
  const [wineRouteStops, setWineRouteStops] = useState<WineRouteStop[]>([])
  const [isWineRouteLoading, setIsWineRouteLoading] = useState(false)
  const [hasWineRouteError, setHasWineRouteError] = useState(false)
  const [wineDetailsById, setWineDetailsById] = useState<Record<number, WineDetailsApiResponse['wine']>>({})
  const [selectedMapDoId, setSelectedMapDoId] = useState<number | null>(null)
  const [doMapZoomLevel, setDoMapZoomLevel] = useState(3.1)
  const [doMapCountryFilter, setDoMapCountryFilter] = useState<string>(DO_MAP_ALL_WORLD_VALUE)
  const [doMapTatRossetScope, setDoMapTatRossetScope] = useState<'all_dos' | 'with_reviews' | 'all_wines'>('all_dos')
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
  const doMapMarkersRef = useRef<DoMapMarkerHandle[]>([])
  const closeSelectedWineModal = useCallback(() => {
    setDoLogoPreview(null)
    setSelectedWineId(null)
  }, [])

  const t = messages[locale]
  const isDark = theme === 'dark'
  const isCatalogPage = !isDoMapPage && !isAboutPage && !isWineRoutePage
  const galleryPhotoLabels = [
    t.common.galleryPhotoLabels.bottle,
    t.common.galleryPhotoLabels.front,
    t.common.galleryPhotoLabels.back,
    t.common.galleryPhotoLabels.context,
  ]
  const logoSrc = 'images/brand/logo-wordmark-dark.png'
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
    const siteName = t.common.meta.siteName
    const sectionTitle = isDoMapPage
      ? t.common.meta.sectionDoMap
      : isAboutPage
        ? t.common.meta.sectionAbout
        : isWineRoutePage
          ? t.common.meta.sectionWineRoute
          : t.common.meta.sectionCatalog
    const description = isDoMapPage
      ? t.common.meta.descriptionDoMap
      : isAboutPage
        ? t.common.meta.descriptionAbout
        : isWineRoutePage
          ? t.common.meta.descriptionWineRoute
          : t.common.meta.descriptionCatalog
    const relativePath = isDoMapPage ? '/do-map' : isAboutPage ? '/about' : isWineRoutePage ? '/ruta-de-vins' : '/'
    const canonical = `${window.location.origin}${relativePath}`

    document.title = `${siteName} | ${sectionTitle}`
    upsertCanonicalLink(canonical)
    upsertMetaTag('name', 'description', description)
    upsertMetaTag('property', 'og:title', `${siteName} | ${sectionTitle}`)
    upsertMetaTag('property', 'og:description', description)
    upsertMetaTag('property', 'og:url', canonical)
    upsertMetaTag('property', 'og:locale', locale === 'ca' ? 'ca_ES' : locale === 'en' ? 'en_US' : 'es_ES')
    upsertMetaTag('name', 'twitter:title', `${siteName} | ${sectionTitle}`)
    upsertMetaTag('name', 'twitter:description', description)
  }, [isAboutPage, isDoMapPage, isWineRoutePage, locale, t.common.meta])

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

    const base = resolveApiBaseUrl()
    void fetchWineListItems(base, controller.signal)
      .then((items) => {
        if (controller.signal.aborted) return
        setWines(items.map((item) => mapWineListItemToWineCard(item, locale)))
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setWines([])
      })

    return () => {
      controller.abort()
    }
  }, [isDoMapPage, locale])

  useEffect(() => {
    if (!isWineRoutePage) {
      return
    }

    const controller = new AbortController()
    const base = resolveApiBaseUrl()
    setIsWineRouteLoading(true)
    setHasWineRouteError(false)
    setWineRouteStops([])

    void fetchWineRouteStops(base, controller.signal)
      .then((items) => {
        if (controller.signal.aborted) return
        setWineRouteStops(items)
        setHasWineRouteError(false)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setWineRouteStops([])
        setHasWineRouteError(true)
      })
      .finally(() => {
        if (controller.signal.aborted) return
        setIsWineRouteLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [isWineRoutePage])

  useEffect(() => {
    if (isDoMapPage) {
      return
    }

    if (selectedWineId == null || wineDetailsById[selectedWineId]) {
      return
    }

    const controller = new AbortController()
    const base = resolveApiBaseUrl()

    void fetchWineDetailsById(base, selectedWineId, controller.signal)
      .then((wine) => {
        if (controller.signal.aborted || !wine) {
          return
        }

        setWineDetailsById((current) => ({
          ...current,
          [selectedWineId]: wine,
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
    const params = isDoMapPage
      ? doMapTatRossetScope === 'with_reviews'
        ? { userIds: [1, 2] }
        : doMapTatRossetScope === 'all_wines'
          ? { hasWines: true }
          : {}
      : {}

    void fetchDoItems(base, controller.signal, params)
      .then((items) => {
        if (controller.signal.aborted) return
        setDoOptions(items)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setDoOptions([])
      })

    return () => {
      controller.abort()
    }
  }, [doMapTatRossetScope, isDoMapPage])

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
        closeSelectedWineModal()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeSelectedWineModal, doLogoPreview, isDoDropdownOpen, isMobileFiltersOpen, isMobileSortOpen])

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
      const state = parseCatalogUrlState()
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
    const syncRegionFilter = () => {
      if (regionFilter === 'all') {
        return
      }

      const exists = doOptionsByCountry.some((item) => item.name === regionFilter)
      if (!exists) {
        setRegionFilter('all')
      }
    }

    syncRegionFilter()
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
  const aboutStats = useMemo(() => {
    const mariaValues = wines.filter((wine) => wine.mariaScore != null).map((wine) => wine.mariaScore as number)
    const rossetValues = wines.filter((wine) => wine.adriaScore != null).map((wine) => wine.adriaScore as number)
    const bothValues = wines
      .filter((wine) => wine.mariaScore != null && wine.adriaScore != null)
      .map((wine) => Math.abs((wine.mariaScore as number) - (wine.adriaScore as number)))

    const tatAverage = mariaValues.length > 0
      ? mariaValues.reduce((sum, value) => sum + value, 0) / mariaValues.length
      : 0
    const rossetAverage = rossetValues.length > 0
      ? rossetValues.reduce((sum, value) => sum + value, 0) / rossetValues.length
      : 0
    const avgDifference = bothValues.length > 0
      ? bothValues.reduce((sum, value) => sum + value, 0) / bothValues.length
      : 0
    const syncIndex = Math.max(0, Math.min(100, 100 - (avgDifference * 10)))

    return {
      totalWines: wines.length,
      totalReviews: mariaValues.length + rossetValues.length,
      tatAverage,
      rossetAverage,
      syncIndex,
    }
  }, [wines])
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
    [doOptions],
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
    const syncDoMapCountryFilter = () => {
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
    }

    syncDoMapCountryFilter()
  }, [doMapCountryFilter, doMapCountryOptions, isDoMapPage])

  useEffect(() => {
    const syncSelectedMapByCountry = () => {
      if (!isDoMapPage) {
        return
      }
      setSelectedMapDoId(null)
    }

    syncSelectedMapByCountry()
  }, [doMapCountryFilter, isDoMapPage])

  useEffect(() => {
    const syncDoMapMobilePicker = () => {
      if (!isDoMapMobile) {
        setIsDoMapMobileDoPickerOpen(false)
      }
    }

    syncDoMapMobilePicker()
  }, [isDoMapMobile])

  useEffect(() => {
    if (!isDoMapPage) {
      return
    }

    const syncCanDoMapFullscreen = () => {
      const canFullscreen = Boolean(
        doMapCanvasRef.current
        && typeof doMapCanvasRef.current.requestFullscreen === 'function',
      )
      setCanDoMapFullscreen(canFullscreen)
    }

    syncCanDoMapFullscreen()

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
    const syncSelectedMapDoId = () => {
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
    }

    syncSelectedMapDoId()
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
      const container = doMapContainerRef.current
      if (isDisposed || !container) {
        return
      }
      const initialized = await initializeLeafletMap({
        container,
        points: doMapVisiblePoints,
        locale,
        doMapCountryFilter,
        doMapAllWorldValue: DO_MAP_ALL_WORLD_VALUE,
        onZoomChange: (zoom) => setDoMapZoomLevel(zoom),
        onMarkerClick: (pointId) => setSelectedMapDoId(pointId),
        onMapClick: () => setSelectedMapDoId(null),
      })
      if (isDisposed) {
        initialized.map.remove()
        initialized.resizeObserver.disconnect()
        return
      }
      map = initialized.map
      resizeObserver = initialized.resizeObserver
      doMapInstanceRef.current = initialized.map
      doMapMarkersRef.current = initialized.markers
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
  }, [doMapZoomLevel, isDoMapPage, selectedMapDo])

  useEffect(() => {
    const map = doMapInstanceRef.current
    if (!isDoMapPage || !map || selectedMapDo) {
      return
    }

    if (doMapCountryFilter === DO_MAP_ALL_WORLD_VALUE && !selectedMapDo) {
      map.setView([20, 0], 3.1)
      return
    }

    if (doMapCountryFilter !== DO_MAP_ALL_WORLD_VALUE && !selectedMapDo && doMapVisiblePoints.length > 0) {
      const countryBounds = doMapVisiblePoints.map((point) => [point.lat, point.lng] as [number, number])
      map.fitBounds(countryBounds, { padding: [36, 36], maxZoom: 7, animate: true, duration: 0.5 })
    }
  }, [doMapCountryFilter, doMapVisiblePoints, isDoMapPage])

  useEffect(() => {
    const map = doMapInstanceRef.current
    if (!isDoMapPage || !map || !selectedMapDo) {
      return
    }

    map.flyTo([selectedMapDo.lat, selectedMapDo.lng], selectedMapDo.zoom ?? Math.max(map.getZoom(), 6), { duration: 0.6 })
  }, [isDoMapPage, selectedMapDo])

  useEffect(() => {
    const syncActiveModalImageIndex = () => {
      if (selectedWine && activeModalImageIndex >= selectedWine.gallery.length) {
        setActiveModalImageIndex(0)
      }
    }

    syncActiveModalImageIndex()
  }, [selectedWine, activeModalImageIndex])

  useEffect(() => {
    syncCatalogUrlState({
      search,
      typeFilter,
      countryFilter,
      regionFilter,
      grapeFilter,
      minScoreFilter,
      sortKey,
      selectedWineId,
    })
  }, [search, typeFilter, countryFilter, regionFilter, grapeFilter, minScoreFilter, sortKey, selectedWineId])

  const euro = useMemo(
    () => new Intl.NumberFormat(localeToIntl(locale), { style: 'currency', currency: 'EUR' }),
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
        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.common.searchPlaceholder} />
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
                placeholder={t.filters.doSearchPlaceholder}
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
              {grape === 'all' ? t.filters.allGrapes : grape}
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
      return t.doMap.allWorldShort
    }
    if (doMapCountryFilter === 'United States') {
      return 'USA'
    }
    if (doMapCountryFilter === 'South Africa') {
      return 'SA'
    }
    return localizedCountryName(doMapCountryFilter, locale)
  }, [doMapCountryFilter, locale, t.doMap.allWorldShort])
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
      <a className={`topbar-nav-link${isCatalogPage ? ' active' : ''}`} href="/">
        <span className="topbar-nav-link-inner">
          <img src="/images/icons/wine/wines2_glass.png" className="topbar-nav-link-icon" alt="" aria-hidden="true" />
          <span>{t.topbar.winesCatalog}</span>
        </span>
      </a>
      <a className={`topbar-nav-link${isDoMapPage ? ' active' : ''}`} href="/do-map">
        <span className="topbar-nav-link-inner">
          <img src="/images/icons/wine/grapes_region.png" className="topbar-nav-link-icon" alt="" aria-hidden="true" />
          <span>{t.topbar.doMap}</span>
        </span>
      </a>
      <a className={`topbar-nav-link${isWineRoutePage ? ' active' : ''}`} href="/ruta-de-vins">
        <span className="topbar-nav-link-inner">
          <img src="/images/icons/wine/wine_maps2.png" className="topbar-nav-link-icon" alt="" aria-hidden="true" />
          <span>{t.topbar.wineRoute}</span>
        </span>
      </a>
      <a className={`topbar-nav-link${isAboutPage ? ' active' : ''}`} href="/about">
        <span className="topbar-nav-link-inner">
          <img src="/images/icons/wine/wine_couple.png" className="topbar-nav-link-icon" alt="" aria-hidden="true" />
          <span>{t.topbar.whoWeAre}</span>
        </span>
      </a>
      <a
        className="topbar-nav-link topbar-nav-link-admin"
        href={adminHref}
        onClick={() => {
          window.localStorage.setItem('wine-app-theme-mode', theme)
        }}
      >
        <span className="topbar-nav-link-inner">
          <img src="/images/icons/wine/settings.png" className="topbar-nav-link-icon" alt="" aria-hidden="true" />
          <span>{t.topbar.backoffice}</span>
        </span>
      </a>
    </nav>
  )

  if (isDoMapPage) {
    return (
      <DoMapPageView
        adminHref={adminHref}
        canDoMapFullscreen={canDoMapFullscreen}
        countryFlagPath={countryFlagPath}
        desktopNav={desktopNav}
        doMapCanvasRef={doMapCanvasRef}
        doMapContainerRef={doMapContainerRef}
        doMapCountryFilter={doMapCountryFilter}
        doMapCountryOptions={doMapCountryOptions}
        doMapInitError={doMapInitError}
        doMapVisiblePoints={doMapVisiblePoints}
        isDark={isDark}
        isDoMapCountryMenuOpen={isDoMapCountryMenuOpen}
        isDoMapFullscreen={isDoMapFullscreen}
        isDoMapMobile={isDoMapMobile}
        isDoMapMobileDoPickerOpen={isDoMapMobileDoPickerOpen}
        doMapTatRossetScope={doMapTatRossetScope}
        isMobileMenuOpen={isMobileMenuOpen}
        locale={locale}
        localeLabels={localeLabels}
        localizedCountryName={localizedCountryName}
        logoSrc={logoSrc}
        selectedMapCountryCompactLabel={selectedMapCountryCompactLabel}
        selectedMapCountryFlag={selectedMapCountryFlag}
        selectedMapCountryLabel={selectedMapCountryLabel}
        selectedMapDo={selectedMapDo}
        setDoMapCountryFilter={setDoMapCountryFilter}
        setIsDoMapCountryMenuOpen={setIsDoMapCountryMenuOpen}
        setIsDoMapMobileDoPickerOpen={setIsDoMapMobileDoPickerOpen}
        setDoMapTatRossetScope={setDoMapTatRossetScope}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        setLocale={setLocale}
        setSelectedMapDoId={setSelectedMapDoId}
        setTheme={setTheme}
        t={t}
        theme={theme}
        toggleDoMapFullscreen={toggleDoMapFullscreen}
      />
    )
  }

  if (isAboutPage) {
    return (
      <AboutPageView
        aboutStats={aboutStats}
        adminHref={adminHref}
        desktopNav={desktopNav}
        isDark={isDark}
        isMobileMenuOpen={isMobileMenuOpen}
        locale={locale}
        localeLabels={localeLabels}
        logoSrc={logoSrc}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        setLocale={setLocale}
        setTheme={setTheme}
        t={t}
        theme={theme}
      />
    )
  }

  if (isWineRoutePage) {
    return (
      <WineRoutePageView
        adminHref={adminHref}
        desktopNav={desktopNav}
        hasRouteError={hasWineRouteError}
        isDark={isDark}
        isLoadingRoute={isWineRouteLoading}
        isMobileMenuOpen={isMobileMenuOpen}
        locale={locale}
        localeLabels={localeLabels}
        logoSrc={logoSrc}
        routeStops={wineRouteStops}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        setLocale={setLocale}
        setTheme={setTheme}
        t={t}
        theme={theme}
      />
    )
  }

  return (
    <CatalogPageView
      activeMobileFilters={activeMobileFilters}
      activeModalImageIndex={activeModalImageIndex}
      adminHref={adminHref}
      autonomousCommunityNameForRegion={autonomousCommunityNameForRegion}
      closeSelectedWineModal={closeSelectedWineModal}
      countryFlagEmoji={countryFlagEmoji}
      countryFlagPath={countryFlagPath}
      defaultPublicWineImageForTheme={defaultPublicWineImageForTheme}
      defaultSort={DEFAULT_SORT}
      desktopNav={desktopNav}
      doLogoPreview={doLogoPreview}
      euro={euro}
      filteredWines={filteredWines}
      filterControls={filterControls}
      filterControlsCore={filterControlsCore}
      galleryPhotoLabels={galleryPhotoLabels}
      isDark={isDark}
      isMobileFiltersOpen={isMobileFiltersOpen}
      isMobileMenuOpen={isMobileMenuOpen}
      isMobileSortOpen={isMobileSortOpen}
      locale={locale}
      localeLabels={localeLabels}
      localizedCountryName={localizedCountryName}
      logoSrc={logoSrc}
      mobileViewMode={mobileViewMode}
      resetFilters={resetFilters}
      resolvePublicWineImageForTheme={resolvePublicWineImageForTheme}
      selectedWine={selectedWine}
      setActiveModalImageIndex={setActiveModalImageIndex}
      setDoLogoPreview={setDoLogoPreview}
      setGrapeFilter={setGrapeFilter}
      setIsMobileFiltersOpen={setIsMobileFiltersOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      setIsMobileSortOpen={setIsMobileSortOpen}
      setLocale={setLocale}
      setMobileViewMode={setMobileViewMode}
      setSelectedWineId={setSelectedWineId}
      setSortKey={setSortKey}
      setTheme={setTheme}
      sortKey={sortKey}
      splitGrapeVarieties={splitGrapeVarieties}
      t={t}
      theme={theme}
    />
  )
}
