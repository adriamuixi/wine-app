import { apiBaseUrl } from '../api/client'

function trimSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

export function sharedImageUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${trimSlash(apiBaseUrl)}${normalizedPath}`
}

export function resolveImageUrl(input: string | null | undefined, fallbackPath = '/images/photos/wines/no-photo.png'): string {
  if (typeof input === 'string' && input.trim() !== '') {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      return input
    }

    return sharedImageUrl(input)
  }

  return sharedImageUrl(fallbackPath)
}

export const sharedImages = {
  brandIcon: sharedImageUrl('/images/brand/icon-square-64.png'),
  brandWordmarkDark: sharedImageUrl('/images/brand/logo-wordmark-dark.png'),
  winesPhoto: sharedImageUrl('/images/photos/wines_photo.png'),
  iconCatalog: sharedImageUrl('/images/icons/wine/wines2_glass.png'),
  iconDoMap: sharedImageUrl('/images/icons/wine/grapes_region.png'),
  iconWineRoute: sharedImageUrl('/images/icons/wine/wine_maps2.png'),
  iconAbout: sharedImageUrl('/images/icons/wine/wine_couple.png'),
  iconPrivate: sharedImageUrl('/images/icons/wine/settings.png'),
  iconReview: sharedImageUrl('/images/icons/wine/wine_comment.png'),
  iconGlass: sharedImageUrl('/images/icons/wine/wine_cup_7.png'),
  iconGrapes: sharedImageUrl('/images/icons/wine/grapes_region.png'),
  noPhoto: sharedImageUrl('/images/photos/wines/no-photo.png'),
} as const
