import type { WineRouteApiResponse, WineRouteStop } from '../types'

export async function fetchWineRouteStops(baseUrl: string, signal: AbortSignal): Promise<WineRouteStop[]> {
  const response = await fetch(`${baseUrl}/api/wines/route`, {
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const payload = await response.json() as WineRouteApiResponse
  const items = Array.isArray(payload.items) ? payload.items : []

  return items.map((item) => ({
    purchaseId: item.purchase_id,
    purchasedAt: item.purchased_at,
    pricePaid: item.price_paid,
    wine: {
      id: item.wine.id,
      name: item.wine.name,
      winery: item.wine.winery,
      wineType: item.wine.wine_type,
      country: item.wine.country,
      do: item.wine.do ? {
        id: item.wine.do.id,
        name: item.wine.do.name,
        doLogo: item.wine.do.do_logo,
        regionLogo: item.wine.do.region_logo,
      } : null,
    },
    place: {
      id: item.place.id,
      name: item.place.name,
      address: item.place.address,
      city: item.place.city,
      country: item.place.country,
      map: {
        lat: item.place.map_data.lat,
        lng: item.place.map_data.lng,
      },
    },
  }))
}
