type Gtag = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: Gtag
    __wineAppGoogleAnalyticsIds?: string[]
    __wineAppGoogleAnalyticsHistoryTrackingInstalled?: boolean
    __wineAppGoogleAnalyticsLastPath?: string
  }
}

function ensureGtag(): Gtag {
  window.dataLayer = window.dataLayer ?? []
  window.gtag = window.gtag ?? function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }

  return window.gtag
}

export function initGoogleAnalytics(measurementId: string): void {
  if (typeof window === 'undefined' || measurementId.length === 0) {
    return
  }

  const initializedIds = window.__wineAppGoogleAnalyticsIds ?? []
  if (initializedIds.includes(measurementId)) {
    return
  }

  const scriptId = `ga4-script-${measurementId}`
  if (document.getElementById(scriptId) == null) {
    const script = document.createElement('script')
    script.id = scriptId
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script)
  }

  const gtag = ensureGtag()
  gtag('js', new Date())
  gtag('config', measurementId, { send_page_view: false })

  window.__wineAppGoogleAnalyticsIds = [...initializedIds, measurementId]
}

export function trackGoogleAnalyticsPageView(measurementId: string): void {
  if (typeof window === 'undefined' || measurementId.length === 0 || typeof window.gtag !== 'function') {
    return
  }

  const pagePath = window.location.pathname || '/'
  window.__wineAppGoogleAnalyticsLastPath = pagePath

  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
  })
}

export function startGoogleAnalyticsPageTracking(measurementId: string): void {
  if (typeof window === 'undefined' || measurementId.length === 0) {
    return
  }

  trackGoogleAnalyticsPageView(measurementId)

  if (window.__wineAppGoogleAnalyticsHistoryTrackingInstalled) {
    return
  }

  const notifyPageChange = () => {
    const nextPath = window.location.pathname || '/'
    if (window.__wineAppGoogleAnalyticsLastPath === nextPath) {
      return
    }

    trackGoogleAnalyticsPageView(measurementId)
  }

  const wrapHistoryMethod = (method: 'pushState' | 'replaceState') => {
    const original = window.history[method]

    window.history[method] = function patchedHistoryMethod(...args) {
      const result = original.apply(this, args)
      queueMicrotask(notifyPageChange)
      return result
    }
  }

  wrapHistoryMethod('pushState')
  wrapHistoryMethod('replaceState')
  window.addEventListener('popstate', notifyPageChange)
  window.__wineAppGoogleAnalyticsHistoryTrackingInstalled = true
}
