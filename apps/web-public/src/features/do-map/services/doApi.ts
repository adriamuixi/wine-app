import type { DoApiResponse, DoApiItem } from '../types'

type FetchDoItemsParams = {
  userIds?: number[]
  hasWines?: boolean
}

export async function fetchDoItems(baseUrl: string, signal: AbortSignal, params: FetchDoItemsParams = {}): Promise<DoApiItem[]> {
  const searchParams = new URLSearchParams()
  if (params.userIds && params.userIds.length > 0) {
    searchParams.set('user_ids', params.userIds.join(','))
  }
  if (params.hasWines === true) {
    searchParams.set('has_wines', 'true')
  }

  const queryString = searchParams.toString()
  const response = await fetch(`${baseUrl}/api/dos${queryString !== '' ? `?${queryString}` : ''}`, {
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const payload = await response.json() as DoApiResponse
  return Array.isArray(payload.items) ? payload.items : []
}
