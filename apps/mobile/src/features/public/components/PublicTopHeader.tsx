import { Image, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

import { sharedImages } from '../../../shared/assets/images'
import { colors } from '../../../shared/theme/colors'

export function PublicTopHeader() {
  return (
    <LinearGradient
      colors={[colors.topbarStart, colors.topbarMid, colors.topbarEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrap}
    >
      <View style={styles.blurLayer} />
      <View style={styles.content}>
        <Image source={{ uri: sharedImages.brandIcon }} style={styles.icon} />
        <View style={styles.wordmarkWrap}>
          <Image source={{ uri: sharedImages.brandWordmarkDark }} style={styles.wordmark} resizeMode="contain" />
        </View>
        <View style={styles.badgeWrap}>
          <Text style={styles.badge}>TAT I ROSSET</Text>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(243, 204, 220, 0.28)',
  },
  blurLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  content: {
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 10,
  },
  wordmarkWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    width: 236,
    height: 48,
  },
  badgeWrap: {
    minWidth: 78,
    alignItems: 'flex-end',
  },
  badge: {
    color: '#f7d9e5',
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '700',
  },
})
