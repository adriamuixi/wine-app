import { ApiError } from '@wine-app/api-client'

export function toReadableApiError(error: unknown, t: (key: string, params?: Record<string, string | number>) => string): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return t('errors.authRequired')
    if (error.status === 403) return t('errors.forbidden')
    if (error.status === 404) return t('errors.notFound')

    if (typeof error.payload === 'object' && error.payload !== null && 'error' in error.payload) {
      const value = (error.payload as { error?: unknown }).error
      if (typeof value === 'string' && value.trim() !== '') {
        return value
      }
    }

    return t('errors.requestFailed', { status: error.status })
  }

  if (error instanceof Error && error.message.trim() !== '') {
    return error.message
  }

  return t('errors.unexpected')
}
