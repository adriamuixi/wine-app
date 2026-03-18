import type { WineListApiItem } from '../../catalog/types'

export const DO_MAP_ALL_WORLD_VALUE = '__all_world__'

export type DoMapPoint = {
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

export type DoApiItem = {
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

export type DoApiResponse = {
  items: DoApiItem[]
}

export type DoFilterOption = {
  id: number
  name: string
  region: string
  countryCode: NonNullable<WineListApiItem['country']>
  countryLabel: string
  doLogoImage?: string
  regionLogoImage?: string
}

export type LeafletGlobal = {
  map: (container: HTMLElement, options?: Record<string, unknown>) => LeafletMap
  tileLayer: (urlTemplate: string, options?: Record<string, unknown>) => LeafletTileLayer
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

export type LeafletMap = {
  setView: (center: [number, number], zoom: number) => unknown
  flyTo: (center: [number, number], zoom?: number, options?: Record<string, unknown>) => unknown
  fitBounds: (bounds: unknown, options?: Record<string, unknown>) => unknown
  on: (event: string, handler: () => void) => unknown
  getZoom: () => number
  invalidateSize: (options?: Record<string, unknown>) => void
  removeLayer: (layer: unknown) => unknown
  remove: () => void
}

export type LeafletTileLayer = {
  addTo: (map: unknown) => LeafletTileLayer
  on: (event: string, handler: () => void) => LeafletTileLayer
}

declare global {
  interface Window {
    L?: LeafletGlobal
  }
}
