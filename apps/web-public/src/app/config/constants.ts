import type { SortKey } from '../../features/catalog/types'

export const THEME_KEY = 'wine-web-public-theme'
export const LOCALE_KEY = 'wine-web-public-locale'
export const MOBILE_VIEW_COOKIE_KEY = 'wine-web-public-mobile-view'
export const DEFAULT_SORT: SortKey = 'score_desc'

export const LEAFLET_CSS_LINK_ID = 'leaflet-css'
export const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
export const LEAFLET_SCRIPT_ID = 'leaflet-script'
export const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

export const DEFAULT_PUBLIC_WINE_IMAGE_LIGHT = '/images/photos/wines/no-photo.png'
export const DEFAULT_PUBLIC_WINE_IMAGE_DARK = '/images/photos/wines/no-photo-dark.png'

export const TEAM_TAT_PHOTO_SRC = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><defs><linearGradient id="bgTat" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f6eadf"/><stop offset="100%" stop-color="#ecd4c4"/></linearGradient></defs><rect width="640" height="480" fill="url(#bgTat)"/><circle cx="320" cy="196" r="108" fill="#f0cdb8"/><path d="M232 208c0-74 44-124 108-124s108 50 108 124v28h-18v128H210V236h22v-28Z" fill="#5d2c39"/><ellipse cx="320" cy="266" rx="64" ry="74" fill="#f3d8c8"/><circle cx="292" cy="252" r="7" fill="#3a2420"/><circle cx="348" cy="252" r="7" fill="#3a2420"/><path d="M292 300c8 12 20 18 28 18s20-6 28-18" fill="none" stroke="#a5505f" stroke-width="8" stroke-linecap="round"/><path d="M228 404c16-52 56-86 92-86 36 0 76 34 92 86" fill="#7f2f45"/><text x="320" y="448" font-family="Georgia,serif" font-size="34" text-anchor="middle" fill="#5d2c39">Tat Maria</text></svg>')}`
export const TEAM_ROSSET_PHOTO_SRC = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><defs><linearGradient id="bgRosset" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e8ecf2"/><stop offset="100%" stop-color="#d1dae9"/></linearGradient></defs><rect width="640" height="480" fill="url(#bgRosset)"/><circle cx="320" cy="196" r="108" fill="#edccb5"/><path d="M232 212c0-64 46-114 108-114s108 50 108 114v24h-26v128H218V236h14v-24Z" fill="#2f3546"/><ellipse cx="320" cy="268" rx="64" ry="74" fill="#f2d7c7"/><circle cx="292" cy="252" r="7" fill="#272220"/><circle cx="348" cy="252" r="7" fill="#272220"/><path d="M292 300c8 11 19 17 28 17s20-6 28-17" fill="none" stroke="#8c4a5b" stroke-width="8" stroke-linecap="round"/><path d="M228 404c16-52 56-86 92-86 36 0 76 34 92 86" fill="#485468"/><text x="320" y="448" font-family="Georgia,serif" font-size="34" text-anchor="middle" fill="#374458">Rosset Adria</text></svg>')}`
