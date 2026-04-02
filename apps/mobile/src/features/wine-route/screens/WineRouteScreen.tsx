import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { StyleSheet, View } from 'react-native'

import type { RootStackParamList } from '../../../app/navigation/RootNavigator'
import { PublicBottomMenu } from '../../public/components/PublicBottomMenu'
import { PublicWebSection } from '../../public/components/PublicWebSection'
import { PublicTopHeader } from '../../public/components/PublicTopHeader'
import { colors } from '../../../shared/theme/colors'
import { SafeScreen } from '../../../shared/ui/SafeScreen'

type Props = NativeStackScreenProps<RootStackParamList, 'WineRoute'>

export function WineRouteScreen({ navigation }: Props) {
  return (
    <SafeScreen backgroundColor={colors.background} statusBarColor={colors.topbarMid}>
      <View style={styles.container}>
        <PublicTopHeader />
        <PublicWebSection path="/ruta-de-vins" />
        <PublicBottomMenu current="WineRoute" onNavigate={(route) => navigation.navigate(route)} />
      </View>
    </SafeScreen>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 0, gap: 0 },
})
