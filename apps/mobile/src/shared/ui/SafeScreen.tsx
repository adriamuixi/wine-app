import type { PropsWithChildren } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type Props = PropsWithChildren<{
  backgroundColor: string
  statusBarColor?: string
  navigationBarColor?: string
}>

export function SafeScreen({ backgroundColor, statusBarColor, navigationBarColor = '#000000', children }: Props) {
  const topColor = statusBarColor ?? backgroundColor

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: navigationBarColor }]} edges={['bottom']}>
      <SafeAreaView style={[styles.safe, { backgroundColor: topColor }]} edges={['top']}>
        <View style={[styles.content, { backgroundColor }]}>{children}</View>
      </SafeAreaView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
})
