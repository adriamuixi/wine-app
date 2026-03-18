export function resolveApiBaseUrl(): string {
  const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
  const fallbackBase = window.location.port.startsWith('517') ? 'http://localhost:8080' : window.location.origin
  return configuredBase && configuredBase.length > 0 ? configuredBase : fallbackBase
}
