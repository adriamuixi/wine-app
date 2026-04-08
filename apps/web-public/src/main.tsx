import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initGoogleAnalytics, startGoogleAnalyticsPageTracking } from './shared/lib/analytics'
import { resolveGoogleAnalyticsMeasurementId } from './shared/lib/env'

const googleAnalyticsMeasurementId = resolveGoogleAnalyticsMeasurementId()

if (googleAnalyticsMeasurementId.length > 0) {
  initGoogleAnalytics(googleAnalyticsMeasurementId)
  startGoogleAnalyticsPageTracking(googleAnalyticsMeasurementId)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
