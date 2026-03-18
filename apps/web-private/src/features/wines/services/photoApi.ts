import type { WineItem, WinePhotoSlotType } from '../types'

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

export async function uploadWinePhoto(params: {
  apiBaseUrl: string
  wineId: number
  type: WinePhotoSlotType
  file: File
}): Promise<string | null> {
  const { apiBaseUrl, wineId, type, file } = params
  const body = new FormData()
  body.set('type', type)
  body.set('file', file)

  const response = await fetch(`${apiBaseUrl}/api/wines/${wineId}/photos`, {
    method: 'POST',
    body,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const payload = await response.json() as { photo?: { url?: string } }
  return payload.photo?.url ?? null
}

export async function fetchDefaultWinePhotoFile(defaultPhotoSrc: string, type: WinePhotoSlotType): Promise<File> {
  const defaultResponse = await fetch(defaultPhotoSrc, { credentials: 'include' })
  if (!defaultResponse.ok) {
    throw new Error(`HTTP ${defaultResponse.status}`)
  }

  const blob = await defaultResponse.blob()
  return new File([blob], `${type}-default.png`, { type: blob.type || 'image/png' })
}

export function applyWinePhotoToGallery(wine: WineItem, type: WinePhotoSlotType, resolvedUploadedUrl: string): WineItem {
  return {
    ...wine,
    thumbnailSrc: type === 'bottle' ? resolvedUploadedUrl : wine.thumbnailSrc,
    galleryPreview: {
      ...wine.galleryPreview,
      ...(type === 'bottle' ? { bottle: resolvedUploadedUrl } : {}),
      ...(type === 'front_label' ? { front: resolvedUploadedUrl } : {}),
      ...(type === 'back_label' ? { back: resolvedUploadedUrl } : {}),
      ...(type === 'situation' ? { situation: resolvedUploadedUrl } : {}),
    },
  }
}

export async function deleteWineById(params: { apiBaseUrl: string; wineId: number }): Promise<void> {
  const { apiBaseUrl, wineId } = params

  const response = await fetch(`${apiBaseUrl}/api/wines/${wineId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  if (response.ok || response.status === 204) {
    return
  }

  let message = `HTTP ${response.status}`
  try {
    const payload = await response.json() as { error?: string }
    message = parseApiError(payload, message)
  } catch {
    // Keep HTTP fallback.
  }

  throw new Error(message)
}
