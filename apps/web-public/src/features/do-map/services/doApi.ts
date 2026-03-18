import type { DoApiResponse, DoApiItem } from '../types'

export async function fetchDoItems(baseUrl: string, signal: AbortSignal): Promise<DoApiItem[]> {
  const response = await fetch(`${baseUrl}/api/dos`, {
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const payload = await response.json() as DoApiResponse
  return Array.isArray(payload.items) ? payload.items : []
}
