import type { SortKey, WineDetailsApiResponse, WineListApiItem, WineListApiResponse } from '../types'

function toWineListSortParams(sortKey: SortKey): { sortBy: string; sortDir: 'asc' | 'desc' } {
  if (sortKey === 'price_asc') {
    return { sortBy: 'price', sortDir: 'asc' }
  }
  if (sortKey === 'price_desc') {
    return { sortBy: 'price', sortDir: 'desc' }
  }
  if (sortKey === 'latest') {
    return { sortBy: 'vintage_year', sortDir: 'desc' }
  }
  if (sortKey === 'tasting_date_desc') {
    return { sortBy: 'tasted_at', sortDir: 'desc' }
  }
  if (sortKey === 'tasting_date_asc') {
    return { sortBy: 'tasted_at', sortDir: 'asc' }
  }

  return { sortBy: 'score', sortDir: 'desc' }
}

export async function fetchWineListItems(baseUrl: string, signal: AbortSignal, sortKey: SortKey): Promise<WineListApiItem[]> {
  const items: WineListApiItem[] = []
  let page = 1
  const limit = 100
  const { sortBy, sortDir } = toWineListSortParams(sortKey)

  while (true) {
    const response = await fetch(`${baseUrl}/api/wines?page=${page}&limit=${limit}&sort_by=${encodeURIComponent(sortBy)}&sort_dir=${sortDir}`, {
      signal,
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

  return items
}

export async function fetchWineDetailsById(baseUrl: string, wineId: number, signal: AbortSignal): Promise<WineDetailsApiResponse['wine'] | null> {
  const response = await fetch(`${baseUrl}/api/wines/${wineId}`, {
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const payload = await response.json() as WineDetailsApiResponse
  return payload.wine ?? null
}
