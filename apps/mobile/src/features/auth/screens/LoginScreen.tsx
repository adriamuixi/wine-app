import { useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Alert, Button, Image, StyleSheet, Text, TextInput, View } from 'react-native'

import type { RootStackParamList } from '../../../app/navigation/RootNavigator'
import { toReadableApiError } from '../../../shared/api/errors'
import { useAuth } from '../../../shared/auth/AuthContext'
import { useI18n } from '../../../shared/i18n/I18nContext'
import { sharedImages } from '../../../shared/assets/images'
import { colors } from '../../../shared/theme/colors'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

export function LoginScreen({ navigation, route }: Props) {
  const { loginWithToken } = useAuth()
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const reason = route.params?.reason

  const onSubmit = async (): Promise<void> => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert(t('login.validationTitle'), t('login.validationMessage'))
      return
    }

    try {
      setSubmitting(true)
      await loginWithToken(email.trim(), password)
      if (navigation.canGoBack()) {
        navigation.goBack()
      } else {
        navigation.navigate('Catalog')
      }
    } catch (error) {
      Alert.alert(t('login.failedTitle'), toReadableApiError(error, t))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: sharedImages.brandWordmarkDark }} style={styles.wordmark} resizeMode="contain" />
      <Text style={styles.title}>{t('login.title')}</Text>
      <Text style={styles.subtitle}>
        {reason === 'review'
          ? t('login.subtitleReview')
          : t('login.subtitleProfile')}
      </Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder={t('login.email')}
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        secureTextEntry
        placeholder={t('login.password')}
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button title={submitting ? t('login.signingIn') : t('login.signIn')} onPress={() => { void onSubmit() }} disabled={submitting} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
    padding: 20,
    backgroundColor: colors.backgroundSoft,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  wordmark: {
    width: 190,
    height: 34,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 4,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    backgroundColor: colors.panel,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
})
