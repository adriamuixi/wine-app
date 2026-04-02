import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import type { RootStackParamList } from '../../../app/navigation/RootNavigator'
import { useI18n } from '../../../shared/i18n/I18nContext'
import { usePreferences } from '../../../shared/preferences/PreferencesContext'
import { colors } from '../../../shared/theme/colors'

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>

export function SettingsScreen({ navigation }: Props) {
  const { locale, setLocale, t } = useI18n()
  const { theme, mode, setTheme, setMode } = usePreferences()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>
      <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>

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

      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>{t('settings.back')}</Text>
      </Pressable>
    </View>
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
    backgroundColor: colors.background,
    padding: 16,
    gap: 10,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginBottom: 6 },
  label: { color: '#7a614f', fontWeight: '700' },
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
  backButton: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#3f5a6b',
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: { color: '#fff', fontWeight: '700' },
})

