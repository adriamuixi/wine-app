import { useEffect } from 'react'
import { Platform } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import * as NavigationBar from 'expo-navigation-bar'
import { AppProviders } from './src/app/providers/AppProviders'
import { RootNavigator } from './src/app/navigation/RootNavigator'

function AppContent() {
  const statusBarColor = '#4d192a'

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return
    }

    const applyNavigationBar = async (): Promise<void> => {
      try {
        await NavigationBar.setVisibilityAsync('visible')
        await NavigationBar.setBehaviorAsync('inset-swipe')
        await NavigationBar.setPositionAsync('relative')
        await NavigationBar.setBackgroundColorAsync('#000000')
        await NavigationBar.setButtonStyleAsync('light')
      } catch {
        // No-op on devices/versions where some APIs are not available.
      }
    }

    void applyNavigationBar()
  }, [])

  return (
    <>
      <StatusBar
        style="light"
        backgroundColor={statusBarColor}
        hidden={false}
        animated
        translucent={false}
      />
      <RootNavigator />
    </>
  )
}

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  )
}
