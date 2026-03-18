import type { DoAssetUploadResponse, DoApiItem } from '../types'

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

export async function uploadDoLogoAsset(params: {
  apiBaseUrl: string
  doId: number
  file: File
}): Promise<string> {
  const { apiBaseUrl, doId, file } = params
  const formData = new FormData()
  formData.set('type', 'do_logo')
  formData.set('file', file)

  const response = await fetch(`${apiBaseUrl}/api/dos/${doId}/assets`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  })

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

  const payload = await response.json() as DoAssetUploadResponse
  return payload.asset.filename
}

export async function deleteDoById(params: {
  apiBaseUrl: string
  doId: DoApiItem['id']
}): Promise<void> {
  const { apiBaseUrl, doId } = params
  const response = await fetch(`${apiBaseUrl}/api/dos/${doId}`, {
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
