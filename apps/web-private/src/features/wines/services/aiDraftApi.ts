import type { WineAiDraftApiResponse } from '../types'

type AnalyzeWineDraftParams = {
  apiBaseUrl: string
  wineImage: File
  ticketImage: File | null
  notes: string
  priceOverride: string
  placeType: 'restaurant' | 'supermarket'
  locationName: string
  locationAddress: string
  locationCity: string
  locationCountry: string
  locationLatitude: string
  locationLongitude: string
}

export async function analyzeWineDraftWithAi(params: AnalyzeWineDraftParams) {
  const body = new FormData()
  body.append('wine_image', params.wineImage)
  if (params.ticketImage != null) {
    body.append('ticket_image', params.ticketImage)
  }
  if (params.notes.trim() !== '') {
    body.append('notes', params.notes.trim())
  }
  if (params.priceOverride.trim() !== '') {
    body.append('price_override', params.priceOverride.trim())
  }
  body.append('place_type', params.placeType)
  if (params.locationName.trim() !== '') {
    body.append('location_name', params.locationName.trim())
  }
  if (params.locationAddress.trim() !== '') {
    body.append('location_address', params.locationAddress.trim())
  }
  if (params.locationCity.trim() !== '') {
    body.append('location_city', params.locationCity.trim())
  }
  if (params.locationCountry.trim() !== '') {
    body.append('location_country', params.locationCountry.trim())
  }
  if (params.locationLatitude.trim() !== '') {
    body.append('location_latitude', params.locationLatitude.trim())
  }
  if (params.locationLongitude.trim() !== '') {
    body.append('location_longitude', params.locationLongitude.trim())
  }

  const response = await fetch(`${params.apiBaseUrl}/api/wines/draft-from-ai`, {
    method: 'POST',
    credentials: 'include',
    body,
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    let backendMessage = ''
    try {
      const payload = await response.json() as { error?: string }
      backendMessage = typeof payload.error === 'string' ? payload.error : ''
    } catch {
      backendMessage = ''
    }

    throw new Error(backendMessage || `HTTP ${response.status}`)
  }

  return await response.json() as WineAiDraftApiResponse
}
