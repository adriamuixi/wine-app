import { useQuery } from '@tanstack/react-query'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ActivityIndicator, Button, Image, StyleSheet, Text, View } from 'react-native'

import type { RootStackParamList } from '../../../app/navigation/RootNavigator'
import { apiClient } from '../../../shared/api/client'
import { toReadableApiError } from '../../../shared/api/errors'
import { useAuth } from '../../../shared/auth/AuthContext'
import { useI18n } from '../../../shared/i18n/I18nContext'
import { colors } from '../../../shared/theme/colors'
import { sharedImages } from '../../../shared/assets/images'

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>

export function ProfileScreen({ navigation }: Props) {
  const { logout, token } = useAuth()
  const { t } = useI18n()
  const me = useQuery({
    queryKey: ['me'],
    queryFn: async () => apiClient.me(),
    enabled: token !== null,
  })

  if (token === null) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: sharedImages.iconPrivate }} style={styles.headerIcon} />
        <Text style={styles.title}>{t('profile.privateArea')}</Text>
        <Text style={styles.row}>{t('profile.publicMode')}</Text>
        <Button title={t('profile.login')} onPress={() => navigation.navigate('Login', { reason: 'profile' })} />
      </View>
    )
  }

  if (me.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (me.isError || me.data === undefined) {
    return (
      <View style={styles.center}>
        <Text>{toReadableApiError(me.error, t)}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: sharedImages.iconPrivate }} style={styles.headerIcon} />
      <Text style={styles.title}>{t('profile.title')}</Text>
      <Text style={styles.row}>{t('profile.name')}: {me.data.user.name} {me.data.user.lastname}</Text>
      <Text style={styles.row}>{t('profile.email')}: {me.data.user.email}</Text>

      <Button title={t('profile.backToCatalog')} onPress={() => navigation.navigate('Catalog')} />
      <View style={{ height: 10 }} />
      <Button title={t('profile.logout')} color="#7a2734" onPress={() => { void logout() }} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16, gap: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { width: 28, height: 28 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  row: { fontSize: 16, color: colors.textMuted },
})
