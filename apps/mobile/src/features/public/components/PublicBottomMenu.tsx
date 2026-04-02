import type { ImageSourcePropType } from 'react-native'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

import { useI18n } from '../../../shared/i18n/I18nContext'
import { colors } from '../../../shared/theme/colors'
import { sharedImages } from '../../../shared/assets/images'

type PublicSection = 'Catalog' | 'DoMap' | 'WineRoute' | 'About' | 'Settings'

type Props = {
  current: PublicSection
  onNavigate: (route: PublicSection) => void
}

type MenuItem = {
  route: PublicSection
  labelKey: string
  icon: ImageSourcePropType
}

const menuItems: MenuItem[] = [
  { route: 'Catalog', labelKey: 'publicMenu.catalog', icon: { uri: sharedImages.iconCatalog } },
  { route: 'DoMap', labelKey: 'publicMenu.doMap', icon: { uri: sharedImages.iconDoMap } },
  { route: 'WineRoute', labelKey: 'publicMenu.wineRoute', icon: { uri: sharedImages.iconWineRoute } },
  { route: 'About', labelKey: 'publicMenu.about', icon: { uri: sharedImages.iconAbout } },
  { route: 'Settings', labelKey: 'publicMenu.settings', icon: { uri: sharedImages.iconPrivate } },
]

export function PublicBottomMenu({ current, onNavigate }: Props) {
  const { t } = useI18n()

  return (
    <View style={styles.wrap}>
      {menuItems.map((item) => {
        const active = item.route === current

        return (
          <Pressable
            key={item.route}
            style={[styles.item, active ? styles.itemActive : null]}
            onPress={() => {
              if (!active) {
                onNavigate(item.route)
              }
            }}
          >
            <Image source={item.icon} style={[styles.icon, active ? styles.iconActive : null]} />
            <Text style={[styles.label, active ? styles.labelActive : null]}>{t(item.labelKey)}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#cfae8a',
    backgroundColor: '#fff5e8',
    paddingVertical: 6,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemActive: {
    backgroundColor: '#f6dce6',
    borderColor: 'transparent',
    shadowColor: '#e5b26d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.42,
    shadowRadius: 10,
    elevation: 6,
  },
  icon: {
    width: 48,
    height: 48,
    opacity: 0.9,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 11,
    color: '#7e6a5d',
    fontWeight: '700',
  },
  labelActive: {
    color: '#5a2036',
  },
})
