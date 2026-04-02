import { ActivityIndicator, Text, View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { LoginScreen } from '../../features/auth/screens/LoginScreen'
import { OnboardingScreen } from '../../features/onboarding/screens/OnboardingScreen'
import { CatalogScreen } from '../../features/catalog/screens/CatalogScreen'
import { DoMapScreen } from '../../features/do-map/screens/DoMapScreen'
import { WineRouteScreen } from '../../features/wine-route/screens/WineRouteScreen'
import { AboutScreen } from '../../features/about/screens/AboutScreen'
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen'
import { ProfileScreen } from '../../features/profile/screens/ProfileScreen'
import { ReviewEditorScreen } from '../../features/reviews/screens/ReviewEditorScreen'
import { WineDetailScreen } from '../../features/wine/screens/WineDetailScreen'
import { useAuth } from '../../shared/auth/AuthContext'
import { useI18n } from '../../shared/i18n/I18nContext'
import { usePreferences } from '../../shared/preferences/PreferencesContext'
import { colors } from '../../shared/theme/colors'

export type RootStackParamList = {
  Onboarding: undefined
  Login: {
    reason?: 'profile' | 'review'
  } | undefined
  Catalog: undefined
  DoMap: undefined
  WineRoute: undefined
  About: undefined
  Settings: undefined
  WineDetail: { wineId: number }
  ReviewEditor: { wineId: number; reviewId?: number }
  Profile: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  const { isReady, token } = useAuth()
  const { isReady: prefsReady, onboarded, theme } = usePreferences()
  const { t } = useI18n()

  if (!isReady || !prefsReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <ActivityIndicator size="large" />
        <Text>{t('navigation.loadingSession')}</Text>
      </View>
    )
  }

  return (
    <Stack.Navigator
      initialRouteName="Catalog"
      screenOptions={{
        headerStyle: { backgroundColor: theme === 'dark' ? '#281118' : colors.topbarMid },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: theme === 'dark' ? '#201319' : colors.background },
      }}
    >
      {!onboarded ? <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} /> : null}
      <Stack.Screen name="Catalog" component={CatalogScreen} options={{ title: t('navigation.catalog'), headerShown: false, animation: 'none' }} />
      <Stack.Screen name="DoMap" component={DoMapScreen} options={{ title: t('navigation.doMap'), headerShown: false, animation: 'none' }} />
      <Stack.Screen name="WineRoute" component={WineRouteScreen} options={{ title: t('navigation.wineRoute'), headerShown: false, animation: 'none' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: t('navigation.about'), headerShown: false, animation: 'none' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings.title') }} />
      <Stack.Screen name="WineDetail" component={WineDetailScreen} options={{ title: t('navigation.wineDetail') }} />
      <Stack.Screen name="ReviewEditor" component={ReviewEditorScreen} options={{ title: t('navigation.reviewEditor') }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: token === null ? t('navigation.privateArea') : t('navigation.myProfile') }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: t('navigation.privateLogin'), presentation: 'modal' }} />
    </Stack.Navigator>
  )
}
