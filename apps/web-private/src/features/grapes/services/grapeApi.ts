import type { GrapeApiItem, GrapeApiResponse, GrapeColorFilter, GrapeEditDraft, GrapeSortPresetKey } from '../types'

function parseApiError(payload: unknown, fallback: string): string {
  if (
    typeof payload === 'object'
    && payload != null
    && 'error' in payload
    && typeof (payload as { error?: unknown }).error === 'string'
  ) {
    const message = (payload as { error: string }).error.trim()
    if (message !== '') {
      return message
    }
  }
  return fallback
}

async function fetchJsonOrThrow<T>(input: RequestInfo | URL, init: RequestInit): Promise<T> {
  const response = await fetch(input, init)

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`
    try {
      const errorPayload = await response.json() as { error?: string }
      errorMessage = parseApiError(errorPayload, errorMessage)
    } catch {
      // Keep HTTP fallback.
    }
    throw new Error(errorMessage)
  }

  return await response.json() as T
}

export async function listGrapes(params: {
  apiBaseUrl: string
  nameFilter: string
  colorFilter: GrapeColorFilter
  sortPreset: GrapeSortPresetKey
}): Promise<GrapeApiItem[]> {
  const { apiBaseUrl, nameFilter, colorFilter, sortPreset } = params
  const searchParams = new URLSearchParams()
  if (nameFilter.trim() !== '') {
    searchParams.set('name', nameFilter.trim())
  }
  if (colorFilter !== 'all') {
    searchParams.set('color', colorFilter)
  }
  if (sortPreset === 'name_color') {
    searchParams.set('sort_by_1', 'name')
    searchParams.set('sort_by_2', 'color')
  } else {
    searchParams.set('sort_by_1', 'color')
    searchParams.set('sort_by_2', 'name')
  }

  const payload = await fetchJsonOrThrow<GrapeApiResponse>(`${apiBaseUrl}/api/grapes?${searchParams.toString()}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  return payload.items
}

export async function createGrape(params: {
  apiBaseUrl: string
  draft: GrapeEditDraft
}): Promise<number> {
  const { apiBaseUrl, draft } = params
  const payload = await fetchJsonOrThrow<{ grape: { id: number } }>(`${apiBaseUrl}/api/grapes`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      name: draft.name.trim(),
      color: draft.color,
    }),
  })

  return payload.grape.id
}

export async function updateGrape(params: {
  apiBaseUrl: string
  grapeId: number
  draft: GrapeEditDraft
}): Promise<void> {
  const { apiBaseUrl, grapeId, draft } = params
  const response = await fetch(`${apiBaseUrl}/api/grapes/${grapeId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      name: draft.name.trim(),
      color: draft.color,
    }),
  })

  if (response.ok || response.status === 204) {
    return
  }

  let errorMessage = `HTTP ${response.status}`
  try {
    const errorPayload = await response.json() as { error?: string }
    errorMessage = parseApiError(errorPayload, errorMessage)
  } catch {
    // Keep HTTP fallback.
  }
  throw new Error(errorMessage)
}

export async function deleteGrapeById(params: {
  apiBaseUrl: string
  grapeId: number
}): Promise<void> {
  const { apiBaseUrl, grapeId } = params
  const response = await fetch(`${apiBaseUrl}/api/grapes/${grapeId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  if (response.ok || response.status === 204) {
    return
  }

  let errorMessage = `HTTP ${response.status}`
  try {
    const errorPayload = await response.json() as { error?: string }
    errorMessage = parseApiError(errorPayload, errorMessage)
  } catch {
    // Keep HTTP fallback.
  }
  throw new Error(errorMessage)
}

