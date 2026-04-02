import type { PropsWithChildren } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { AuthProvider } from '../../shared/auth/AuthContext'
import { I18nProvider } from '../../shared/i18n/I18nContext'
import { PreferencesProvider } from '../../shared/preferences/PreferencesContext'
import { queryClient, queryPersister } from '../../shared/query/client'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: queryPersister }}>
        <PreferencesProvider>
          <I18nProvider>
            <AuthProvider>
              <NavigationContainer>{children}</NavigationContainer>
            </AuthProvider>
          </I18nProvider>
        </PreferencesProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  )
}
