export type WineRouteStop = {
  purchaseId: number
  purchasedAt: string
  pricePaid: number
  wine: {
    id: number
    name: string
    winery: string | null
    wineType: string | null
    country: string | null
    do: {
      id: number
      name: string
      doLogo: string | null
      regionLogo: string | null
    } | null
  }
  place: {
    id: number
    name: string
    address: string | null
    city: string | null
    country: string
    map: {
      lat: number
      lng: number
    }
  }
}

export type WineRouteApiResponse = {
  items: Array<{
    purchase_id: number
    purchased_at: string
    price_paid: number
    wine: {
      id: number
      name: string
      winery: string | null
      wine_type: string | null
      country: string | null
      do: {
        id: number
        name: string
        do_logo: string | null
        region_logo: string | null
      } | null
    }
    place: {
      id: number
      name: string
      address: string | null
      city: string | null
      country: string
      map_data: {
        lat: number
        lng: number
      }
    }
  }>
}
