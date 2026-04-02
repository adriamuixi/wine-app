import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { WebView } from 'react-native-webview'

import { apiBaseUrl } from '../../../shared/api/client'
import { useI18n } from '../../../shared/i18n/I18nContext'
import { usePreferences } from '../../../shared/preferences/PreferencesContext'
import { colors } from '../../../shared/theme/colors'

type Props = {
  path: '/' | '/do-map' | '/ruta-de-vins' | '/about'
}

function baseWebUrl(): string {
  return apiBaseUrl.replace(/\/$/, '')
}

export function PublicWebSection({ path }: Props) {
  const { t, locale } = useI18n()
  const { theme } = usePreferences()
  const url = `${baseWebUrl()}${path}`
  const injectedJavaScriptBeforeContentLoaded = `
    try {
      localStorage.setItem('wine-web-public-theme', '${theme}');
      localStorage.setItem('wine-web-public-locale', '${locale}');
      document.documentElement.dataset.theme='${theme}';
      document.documentElement.lang='${locale}';
    } catch (e) {}
    true;
  `

  return (
    <View style={styles.wrap}>
      <WebView
        source={{ uri: url }}
        startInLoadingState
        pullToRefreshEnabled
        style={styles.webview}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
        renderLoading={() => (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
            <Text style={styles.helper}>{t('navigation.loadingSession')}</Text>
          </View>
        )}
        renderError={() => (
          <View style={styles.center}>
            <Text style={styles.error}>{t('errors.unexpected')}</Text>
            <Text style={styles.helper}>{url}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddccb1',
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  error: {
    color: colors.danger,
    fontWeight: '700',
  },
  helper: {
    color: colors.textMuted,
    textAlign: 'center',
  },
})
