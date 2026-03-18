import type { WineDetailsApiResponse, WineListApiItem, WineListApiResponse } from '../types'

export async function fetchWineListItems(baseUrl: string, signal: AbortSignal): Promise<WineListApiItem[]> {
  const items: WineListApiItem[] = []
  let page = 1
  const limit = 100

  while (true) {
    const response = await fetch(`${baseUrl}/api/wines?page=${page}&limit=${limit}`, {
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
