import Constants from 'expo-constants'
import { WineAppApiClient } from '@wine-app/api-client'
import { resolveMobileApiBaseUrl } from '@wine-app/mobile-utils'

import { readToken } from '../auth/tokenStore'

export const apiBaseUrl = resolveMobileApiBaseUrl(Constants.expoConfig?.extra?.apiBaseUrl as string | undefined)

export const apiClient = new WineAppApiClient({
  baseUrl: apiBaseUrl,
  getAccessToken: readToken,
})
