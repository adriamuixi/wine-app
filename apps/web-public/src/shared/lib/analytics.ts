type Gtag = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: Gtag
    __wineAppGoogleAnalyticsHistoryTrackingInstalled?: boolean
    __wineAppGoogleAnalyticsLastPath?: string
  }
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
  window.__wineAppGoogleAnalyticsLastPath = window.location.pathname || '/'

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
