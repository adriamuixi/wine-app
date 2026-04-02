import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

import type { RootStackParamList } from '../../../app/navigation/RootNavigator'
import { useI18n } from '../../../shared/i18n/I18nContext'
import { usePreferences } from '../../../shared/preferences/PreferencesContext'
import { sharedImages } from '../../../shared/assets/images'
import { colors } from '../../../shared/theme/colors'
import { SafeScreen } from '../../../shared/ui/SafeScreen'

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>

export function OnboardingScreen({ navigation }: Props) {
  const { locale, setLocale, t } = useI18n()
  const { theme, mode, setTheme, setMode, completeOnboarding } = usePreferences()

  const onContinue = (): void => {
    completeOnboarding()
    if (mode === 'private') {
      navigation.replace('Login', { reason: 'profile' })
      return
    }

    navigation.replace('Catalog')
  }

  return (
    <SafeScreen backgroundColor={colors.background} statusBarColor={colors.topbarMid}>
      <View style={styles.container}>
      <View style={styles.card}>
        <Image source={{ uri: sharedImages.brandWordmarkDark }} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>{t('onboarding.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.subtitle')}</Text>

        <Text style={styles.label}>{t('onboarding.modeLabel')}</Text>
        <View style={styles.row}>
          <Chip active={mode === 'public'} label={t('onboarding.modePublic')} onPress={() => setMode('public')} />
          <Chip active={mode === 'private'} label={t('onboarding.modePrivate')} onPress={() => setMode('private')} />
        </View>

        <Text style={styles.label}>{t('onboarding.themeLabel')}</Text>
        <View style={styles.row}>
          <Chip active={theme === 'light'} label={t('onboarding.themeLight')} onPress={() => setTheme('light')} />
          <Chip active={theme === 'dark'} label={t('onboarding.themeDark')} onPress={() => setTheme('dark')} />
        </View>

        <Text style={styles.label}>{t('onboarding.languageLabel')}</Text>
        <View style={styles.row}>
          <Chip active={locale === 'ca'} label="CA" onPress={() => setLocale('ca')} />
          <Chip active={locale === 'es'} label="ES" onPress={() => setLocale('es')} />
          <Chip active={locale === 'en'} label="EN" onPress={() => setLocale('en')} />
        </View>

        <Pressable style={styles.primaryButton} onPress={onContinue}>
          <Text style={styles.primaryButtonText}>{t('onboarding.continue')}</Text>
        </Pressable>
      </View>
      </View>
    </SafeScreen>
  )
}

function Chip(props: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, props.active ? styles.chipActive : null]} onPress={props.onPress}>
      <Text style={[styles.chipText, props.active ? styles.chipTextActive : null]}>{props.label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3c1222',
    justifyContent: 'center',
    padding: 14,
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#fff9f1',
    borderWidth: 1,
    borderColor: '#e1ccb0',
    padding: 16,
    gap: 10,
  },
  logo: { width: 190, height: 36 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted },
  label: { marginTop: 4, color: '#7a614f', fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d8c2a3',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipActive: {
    backgroundColor: '#f4dde5',
    borderColor: '#c66a93',
  },
  chipText: { color: '#694f41', fontWeight: '700' },
  chipTextActive: { color: '#5a2036' },
  primaryButton: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#7d2c48',
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '800' },
})
