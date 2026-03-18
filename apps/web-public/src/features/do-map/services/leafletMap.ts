import { LEAFLET_JS_URL, LEAFLET_SCRIPT_ID } from '../../../app/config/constants'
import { resolveApiAssetUrl } from '../../catalog/services/wineMappers'
import type { Locale } from '../../../i18n/messages'
import type { DoMapPoint, LeafletGlobal, LeafletMap } from '../types'

export type DoMapMarkerHandle = {
  id: number
  marker: {
    openTooltip: () => unknown
    closeTooltip: () => unknown
    getElement: () => HTMLElement | null
    setZIndexOffset: (offset: number) => unknown
  }
  setSelected: (selected: boolean, zoomBoost: boolean) => void
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

type InitializeLeafletMapParams = {
  container: HTMLDivElement
  points: DoMapPoint[]
  locale: Locale
  doMapCountryFilter: string
  doMapAllWorldValue: string
  onZoomChange: (zoom: number) => void
  onMarkerClick: (pointId: number) => void
}

export async function initializeLeafletMap({
  container,
  points,
  locale,
  doMapCountryFilter,
  doMapAllWorldValue,
  onZoomChange,
  onMarkerClick,
}: InitializeLeafletMapParams): Promise<{ map: LeafletMap; markers: DoMapMarkerHandle[]; resizeObserver: ResizeObserver }> {
  const leaflet = await loadLeafletGlobal()

  const leafletMap = leaflet.map(container, {
    zoomControl: false,
    minZoom: 2,
    maxZoom: 12,
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false,
    zoomSnap: 1,
    zoomDelta: 1,
  })

  if (doMapCountryFilter === doMapAllWorldValue) {
    leafletMap.setView([20, 0], 3.1)
  } else {
    leafletMap.fitBounds(points.map((point) => [point.lat, point.lng] as [number, number]), { padding: [36, 36], maxZoom: 7, animate: false })
  }

  onZoomChange(leafletMap.getZoom())
  leafletMap.on('zoomend', () => {
    onZoomChange(leafletMap.getZoom())
  })

  const tileLanguage = locale === 'ca' ? 'ca' : locale === 'en' ? 'en' : 'es'
  const primaryTileUrl = `https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?lang=${tileLanguage}`
  const fallbackTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const tileLayerOptions = {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    updateWhenZooming: false,
    updateWhenIdle: true,
  }

  const primaryTileLayer = leaflet.tileLayer(primaryTileUrl, tileLayerOptions).addTo(leafletMap)
  let switchedToFallback = false
  primaryTileLayer.on('tileerror', () => {
    if (switchedToFallback) {
      return
    }

    switchedToFallback = true
    leafletMap.removeLayer(primaryTileLayer)
    leaflet.tileLayer(fallbackTileUrl, tileLayerOptions).addTo(leafletMap)
  })

  const resizeObserver = new ResizeObserver(() => {
    leafletMap.invalidateSize({ pan: false, animate: false })
  })
  resizeObserver.observe(container)
  window.setTimeout(() => {
    leafletMap.invalidateSize({ pan: false, animate: false })
  }, 100)

  const markers: DoMapMarkerHandle[] = points.map((point) => {
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
    marker.on('click', () => onMarkerClick(point.id))

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

  return {
    map: leafletMap,
    markers,
    resizeObserver,
  }
}
