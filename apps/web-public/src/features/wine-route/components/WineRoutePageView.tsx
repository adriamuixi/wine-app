import { useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import type { Locale, PublicMessages } from '../../../i18n/messages'
import { LEAFLET_CSS_LINK_ID, LEAFLET_CSS_URL, LEAFLET_JS_URL, LEAFLET_SCRIPT_ID } from '../../../app/config/constants'
import type { ThemeMode } from '../../catalog/types'
import type { LeafletGlobal as BaseLeafletGlobal, LeafletMap } from '../../do-map/types'

type WineRouteStop = {
  id: number
  place: string
  city: string
  lat: number
  lng: number
  tastingDate: string
  winesBought: number
}

type LeafletMarker = {
  addTo: (map: unknown) => unknown
  bindTooltip: (content: string, options?: Record<string, unknown>) => unknown
  on: (event: string, handler: () => void) => unknown
  getElement: () => HTMLElement | null
}

type WineRouteLeafletGlobal = BaseLeafletGlobal & {
  polyline: (latlngs: Array<[number, number]>, options?: Record<string, unknown>) => { addTo: (map: unknown) => unknown }
}

const MOCK_STOPS: WineRouteStop[] = [
  { id: 1, place: 'Vila Viniteca', city: 'Barcelona', lat: 41.3892, lng: 2.1675, tastingDate: '2026-01-12', winesBought: 4 },
  { id: 2, place: 'Celler de Gelida', city: 'Barcelona', lat: 41.3782, lng: 2.1524, tastingDate: '2026-01-19', winesBought: 3 },
  { id: 3, place: 'Lavinia', city: 'Barcelona', lat: 41.3927, lng: 2.1639, tastingDate: '2026-01-25', winesBought: 2 },
  { id: 4, place: 'Vins Noe', city: 'Sant Cugat', lat: 41.4738, lng: 2.0837, tastingDate: '2026-02-03', winesBought: 5 },
  { id: 5, place: 'El Rebost del Vi', city: 'Terrassa', lat: 41.5605, lng: 2.0108, tastingDate: '2026-02-09', winesBought: 2 },
  { id: 6, place: 'Celler La Vinya', city: 'Sabadell', lat: 41.5463, lng: 2.1086, tastingDate: '2026-02-17', winesBought: 4 },
  { id: 7, place: 'Wine Palace', city: 'Mataro', lat: 41.5381, lng: 2.4445, tastingDate: '2026-02-24', winesBought: 3 },
  { id: 8, place: 'La Bota de Oro', city: 'Sitges', lat: 41.2368, lng: 1.8096, tastingDate: '2026-03-04', winesBought: 2 },
  { id: 9, place: 'Vins i Licors Grau', city: 'Palafrugell', lat: 41.9172, lng: 3.1638, tastingDate: '2026-03-12', winesBought: 4 },
  { id: 10, place: 'Celler Can Dani', city: 'Girona', lat: 41.9831, lng: 2.825, tastingDate: '2026-03-21', winesBought: 3 },
]

function formatDate(date: string, locale: Locale): string {
  const localeCode = locale === 'ca' ? 'ca-ES' : locale === 'en' ? 'en-US' : 'es-ES'
  return new Intl.DateTimeFormat(localeCode, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T00:00:00`))
}

function ensureLeafletStylesheet(): void {
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
}

function loadLeaflet(): Promise<WineRouteLeafletGlobal> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Leaflet requires browser environment'))
  }

  if (window.L) {
    return Promise.resolve(window.L as WineRouteLeafletGlobal)
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
        reject(new Error('Leaflet loaded without global object'))
        return
      }
      resolve(window.L as WineRouteLeafletGlobal)
    }
    script.onerror = () => reject(new Error('Failed to load Leaflet'))
    document.head.appendChild(script)
  })
}

type Props = {
  adminHref: string
  desktopNav: ReactNode
  isDark: boolean
  isMobileMenuOpen: boolean
  locale: Locale
  localeLabels: Record<Locale, string>
  logoSrc: string
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>
  setLocale: Dispatch<SetStateAction<Locale>>
  setTheme: Dispatch<SetStateAction<ThemeMode>>
  t: PublicMessages
  theme: ThemeMode
}

export default function WineRoutePageView({
  adminHref,
  desktopNav,
  isDark,
  isMobileMenuOpen,
  locale,
  localeLabels,
  logoSrc,
  setIsMobileMenuOpen,
  setLocale,
  setTheme,
  t,
  theme,
}: Props) {
  const localeCodes = Object.keys(localeLabels) as Locale[]
  const toggleLocale = () => {
    const currentIndex = localeCodes.indexOf(locale)
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % localeCodes.length : 0
    setLocale(localeCodes[nextIndex] ?? localeCodes[0] ?? 'ca')
  }

  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapShellRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRefs = useRef<Record<number, LeafletMarker>>({})
  const [isRouteMapError, setIsRouteMapError] = useState(false)
  const [canRouteMapFullscreen, setCanRouteMapFullscreen] = useState(false)
  const [isRouteMapFullscreen, setIsRouteMapFullscreen] = useState(false)

  const routeStops = useMemo(
    () => [...MOCK_STOPS].sort((a, b) => new Date(a.tastingDate).getTime() - new Date(b.tastingDate).getTime()),
    [],
  )
  const [selectedStopId, setSelectedStopId] = useState<number>(routeStops[0]?.id ?? 0)

  useEffect(() => {
    ensureLeafletStylesheet()
  }, [])

  useEffect(() => {
    const syncCanFullscreen = () => {
      const canFullscreen = Boolean(
        mapShellRef.current
        && typeof mapShellRef.current.requestFullscreen === 'function',
      )
      setCanRouteMapFullscreen(canFullscreen)
    }

    syncCanFullscreen()

    const onFullscreenChange = () => {
      const isActive = document.fullscreenElement === mapShellRef.current
      setIsRouteMapFullscreen(isActive)
      window.setTimeout(() => {
        mapRef.current?.invalidateSize({ pan: false, animate: false })
      }, 100)
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    window.addEventListener('resize', syncCanFullscreen)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      window.removeEventListener('resize', syncCanFullscreen)
    }
  }, [])

  useEffect(() => {
    const container = mapContainerRef.current
    if (!container) {
      return
    }

    let isDisposed = false
    const resizeObserver = new ResizeObserver(() => {
      const map = mapRef.current
      if (!map) {
        return
      }
      map.invalidateSize({ pan: false, animate: false })
    })

    const initMap = async () => {
      const leaflet = await loadLeaflet()
      if (isDisposed || !mapContainerRef.current) {
        return
      }

      const map = leaflet.map(mapContainerRef.current, {
        zoomControl: true,
        minZoom: 5,
        maxZoom: 13,
      })

      const tileLanguage = locale === 'ca' ? 'ca' : locale === 'en' ? 'en' : 'es'
      const primaryTileUrl = `https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?lang=${tileLanguage}`
      const fallbackTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      const tileLayerOptions = {
        attribution: '&copy; OpenStreetMap contributors',
        updateWhenZooming: false,
        updateWhenIdle: true,
      }

      const primaryTileLayer = leaflet.tileLayer(primaryTileUrl, tileLayerOptions) as unknown as {
        addTo: (target: unknown) => unknown
        on: (event: string, handler: () => void) => unknown
      }
      primaryTileLayer.addTo(map)
      let switchedToFallback = false
      primaryTileLayer.on('tileerror', () => {
        if (switchedToFallback) {
          return
        }

        switchedToFallback = true
        map.removeLayer(primaryTileLayer)
        leaflet.tileLayer(fallbackTileUrl, tileLayerOptions).addTo(map)
      })

      const latLngs = routeStops.map((stop) => [stop.lat, stop.lng] as [number, number])
      const bounds = leaflet.latLngBounds(latLngs)
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 10, animate: false })

      leaflet.polyline(latLngs, {
        color: '#b21257',
        weight: 4,
        opacity: 0.9,
      }).addTo(map)

      const firstStop = routeStops[0]
      const lastStop = routeStops[routeStops.length - 1]
      if (firstStop && lastStop && firstStop.id !== lastStop.id) {
        leaflet.polyline(
          [[lastStop.lat, lastStop.lng], [firstStop.lat, firstStop.lng]],
          { color: '#b21257', weight: 3, opacity: 0.55, dashArray: '7 8' },
        ).addTo(map)
      }

      markerRefs.current = {}
      routeStops.forEach((stop, index) => {
        const icon = leaflet.divIcon({
          className: 'wine-route-marker-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          html: `<span class="wine-route-marker-bubble">${index + 1}</span>`,
        })

        const marker = leaflet.marker([stop.lat, stop.lng], { icon })
        marker.addTo(map)
        marker.bindTooltip(`${index + 1}. ${stop.place}`, { direction: 'top', offset: [0, -8] })
        marker.on('click', () => setSelectedStopId(stop.id))
        markerRefs.current[stop.id] = marker
      })

      mapRef.current = map
      resizeObserver.observe(mapContainerRef.current)
      setIsRouteMapError(false)
    }

    void initMap().catch(() => {
      setIsRouteMapError(true)
    })

    return () => {
      isDisposed = true
      markerRefs.current = {}
      resizeObserver.disconnect()
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [locale, routeStops])

  useEffect(() => {
    const selectedStop = routeStops.find((stop) => stop.id === selectedStopId)
    const map = mapRef.current
    if (!selectedStop || !map) {
      return
    }

    Object.entries(markerRefs.current).forEach(([id, marker]) => {
      const markerEl = marker.getElement()
      const bubble = markerEl?.querySelector('.wine-route-marker-bubble')
      if (!(bubble instanceof HTMLElement)) {
        return
      }
      bubble.classList.toggle('is-selected', Number(id) === selectedStopId)
    })

    map.flyTo([selectedStop.lat, selectedStop.lng], Math.max(map.getZoom(), 8), {
      animate: true,
      duration: 0.55,
    })
  }, [routeStops, selectedStopId])

  const toggleRouteMapFullscreen = () => {
    if (!mapShellRef.current) {
      return
    }

    if (document.fullscreenElement === mapShellRef.current) {
      void document.exitFullscreen()
      return
    }

    void mapShellRef.current.requestFullscreen()
  }

  return (
    <main className="public-shell wine-route-shell">
      <div className="public-background" aria-hidden="true" />

      <header className={`public-topbar${isMobileMenuOpen ? ' mobile-menu-open' : ''}`}>
        <div className="brand-block">
          <a className="brand-copy brand-home-link" href="/" onClick={() => setIsMobileMenuOpen(false)} aria-label={t.common.brandAlt}>
            <img src={logoSrc} className="brand-wordmark" alt={t.common.brandAlt} />
            <p>{t.common.appName}</p>
          </a>
        </div>
        {desktopNav}

        <div className="topbar-actions">
          <div className="topbar-mobile-quick-actions">
            <button
              type="button"
              className="topbar-mobile-bullet topbar-mobile-bullet-language"
              onClick={toggleLocale}
              aria-label={t.topbar.language}
              title={t.topbar.language}
            >
              <span>{locale.toUpperCase()}</span>
            </button>

            <button
              type="button"
              className="topbar-mobile-bullet topbar-mobile-bullet-theme"
              onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
              aria-pressed={isDark}
              aria-label={isDark ? t.topbar.light : t.topbar.dark}
              title={isDark ? t.topbar.light : t.topbar.dark}
            >
              <span className="topbar-mobile-icon" aria-hidden="true">
                {isDark ? (
                  <svg viewBox="0 0 20 20" fill="none" role="presentation">
                    <path
                      d="M14.8 12.8A6.3 6.3 0 0 1 7.2 5.2a6.8 6.8 0 1 0 7.6 7.6Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="none" role="presentation">
                    <circle cx="10" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10 2.6v2.1M10 15.3v2.1M2.6 10h2.1M15.3 10h2.1M4.7 4.7l1.5 1.5M13.8 13.8l1.5 1.5M15.3 4.7l-1.5 1.5M6.2 13.8l-1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                )}
              </span>
            </button>
          </div>

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
              {Object.entries(localeLabels).map(([localeCode, label]) => (
                <option key={localeCode} value={localeCode}>{label}</option>
              ))}
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
          <a href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/images/icons/wine/wines2_glass.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
            <span>{t.topbar.winesCatalog}</span>
          </a>
          <a href="/do-map" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/images/icons/wine/grapes_region.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
            <span>{t.topbar.doMap}</span>
          </a>
          <a href="/ruta-de-vins" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/images/icons/wine/wine_maps2.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
            <span>{t.topbar.wineRoute}</span>
          </a>
          <a href="/about" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/images/icons/wine/wine_couple.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
            <span>{t.topbar.whoWeAre}</span>
          </a>
          <a
            href={adminHref}
            onClick={() => {
              window.localStorage.setItem('wine-app-theme-mode', theme)
              setIsMobileMenuOpen(false)
            }}
          >
            <img src="/images/icons/wine/settings.png" className="mobile-nav-link-icon" alt="" aria-hidden="true" />
            <span>{t.topbar.backoffice}</span>
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

      <section className="hero-panel wine-route-hero">
        <div>
          <div className="section-heading-with-icon">
            <img src="/images/icons/wine/wine_maps2.png" className="section-heading-icon" alt="" aria-hidden="true" />
            <div className="section-heading-copy">
              <p className="eyebrow">{t.wineRoute.eyebrow}</p>
              <h1 className="section-title-label">{t.wineRoute.title}</h1>
            </div>
          </div>
        </div>
        <div className="wine-route-hero-badge" aria-label={t.wineRoute.mockAria}>{t.wineRoute.mockBadge}</div>
      </section>

      <section className="wine-route-layout">
        <div className="cards-panel wine-route-map-card">
          <div ref={mapShellRef} className="wine-route-map" role="img" aria-label={t.wineRoute.mapAria}>
            <div ref={mapContainerRef} className="wine-route-map-leaflet" />
            {canRouteMapFullscreen ? (
              <button
                type="button"
                className="wine-route-fullscreen-button"
                onClick={toggleRouteMapFullscreen}
                aria-label={isRouteMapFullscreen ? t.doMap.fullscreenClose : t.doMap.fullscreenOpen}
                title={isRouteMapFullscreen ? t.doMap.fullscreenClose : t.doMap.fullscreenOpen}
              >
                {isRouteMapFullscreen ? '✕' : '⛶'}
              </button>
            ) : null}
            {isRouteMapError ? <p className="do-map-error">{t.doMap.loadError}</p> : null}
          </div>
          <p className="wine-route-map-note">{t.wineRoute.circuitHint}</p>
        </div>

        <aside className="cards-panel wine-route-list-card" aria-label={t.wineRoute.listAria}>
          <h2>{t.wineRoute.listTitle}</h2>
          <div className="wine-route-stop-list">
            {routeStops.map((stop, index) => (
              <button
                key={`wine-route-stop-${stop.id}`}
                type="button"
                className={`wine-route-stop${selectedStopId === stop.id ? ' active' : ''}`}
                onClick={() => setSelectedStopId(stop.id)}
              >
                <span className="wine-route-stop-order">{index + 1}</span>
                <span className="wine-route-stop-content">
                  <strong>{stop.place}</strong>
                  <span>{stop.city}</span>
                  <span>{t.wineRoute.dateLabel}: {formatDate(stop.tastingDate, locale)}</span>
                  <span>{t.wineRoute.winesBoughtLabel}: {stop.winesBought}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>
      </section>
    </main>
  )
}
