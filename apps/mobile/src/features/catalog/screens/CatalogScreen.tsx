import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { Country, ScoreBucket, WineListItem, WineSortBy, WineSortDir, WineType } from '@wine-app/api-client'

import type { RootStackParamList } from '../../../app/navigation/RootNavigator'
import { PublicBottomMenu } from '../../public/components/PublicBottomMenu'
import { PublicTopHeader } from '../../public/components/PublicTopHeader'
import { apiClient } from '../../../shared/api/client'
import { toReadableApiError } from '../../../shared/api/errors'
import { resolveImageUrl, sharedImages } from '../../../shared/assets/images'
import { useI18n } from '../../../shared/i18n/I18nContext'
import { colors } from '../../../shared/theme/colors'
import { SafeScreen } from '../../../shared/ui/SafeScreen'

type Props = NativeStackScreenProps<RootStackParamList, 'Catalog'>

type CatalogFilters = {
  search: string
  wineType: WineType | 'all'
  scoreBucket: ScoreBucket
  country: Country | 'all'
}

type SortState = {
  by: WineSortBy
  dir: WineSortDir
}

type CatalogViewMode = 'card' | 'list'

const wineTypeOptions: Array<{ value: WineType | 'all'; label: string }> = [
  { value: 'all', label: 'All types' },
  { value: 'red', label: 'Red' },
  { value: 'white', label: 'White' },
  { value: 'rose', label: 'Rose' },
  { value: 'sparkling', label: 'Sparkling' },
  { value: 'sweet', label: 'Sweet' },
  { value: 'fortified', label: 'Fortified' },
]

const countryOptions: Array<{ value: Country | 'all'; label: string }> = [
  { value: 'all', label: 'All countries' },
  { value: 'spain', label: 'Spain' },
  { value: 'france', label: 'France' },
  { value: 'italy', label: 'Italy' },
  { value: 'portugal', label: 'Portugal' },
  { value: 'germany', label: 'Germany' },
  { value: 'argentina', label: 'Argentina' },
  { value: 'chile', label: 'Chile' },
  { value: 'united_states', label: 'United States' },
  { value: 'south_africa', label: 'South Africa' },
  { value: 'australia', label: 'Australia' },
]

const scoreBucketOptions: Array<{ value: ScoreBucket; label: string }> = [
  { value: 'any', label: 'Any score' },
  { value: '90_plus', label: '90+' },
  { value: '80_90', label: '80-89' },
  { value: '70_80', label: '70-79' },
  { value: 'lt70', label: '<70' },
]

const sortOptions: Array<{ value: SortState; label: string }> = [
  { value: { by: 'created_at', dir: 'desc' }, label: 'Latest first' },
  { value: { by: 'score', dir: 'desc' }, label: 'Best score' },
  { value: { by: 'name', dir: 'asc' }, label: 'Name A-Z' },
  { value: { by: 'name', dir: 'desc' }, label: 'Name Z-A' },
]

export function CatalogScreen({ navigation }: Props) {
  const { t } = useI18n()
  const [filters, setFilters] = useState<CatalogFilters>({
    search: '',
    wineType: 'all',
    scoreBucket: 'any',
    country: 'all',
  })
  const [sort, setSort] = useState<SortState>({ by: 'created_at', dir: 'desc' })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<CatalogFilters>(filters)
  const [viewMode, setViewMode] = useState<CatalogViewMode>('card')

  const query = useMemo(() => ({
    page: 1,
    limit: 100,
    search: filters.search.trim() === '' ? undefined : filters.search.trim(),
    wine_type: filters.wineType === 'all' ? undefined : filters.wineType,
    country: filters.country === 'all' ? undefined : filters.country,
    score_bucket: filters.scoreBucket,
    sort_by: sort.by,
    sort_dir: sort.dir,
  }), [filters, sort.by, sort.dir])

  const wines = useQuery({
    queryKey: ['catalog-native', query],
    queryFn: async () => apiClient.listWines(query),
  })

  const totalReviews = useMemo(
    () => (wines.data?.items ?? []).reduce((sum, item) => sum + item.reviews.length, 0),
    [wines.data?.items],
  )

  const applyFilters = (): void => {
    setFilters(draftFilters)
    setIsFilterOpen(false)
  }

  const resetFilters = (): void => {
    setDraftFilters({
      search: '',
      wineType: 'all',
      scoreBucket: 'any',
      country: 'all',
    })
  }

  return (
    <SafeScreen backgroundColor={colors.background} statusBarColor={colors.topbarMid}>
      <View style={styles.container}>
        <PublicTopHeader />
        <HeroPanel
          title={t('catalogNative.title')}
          subtitle={t('catalogNative.subtitle')}
          totalReviews={totalReviews}
          totalReviewsLabel={t('catalogNative.totalReviews')}
          viewMode={viewMode}
          viewModeCardLabel={t('catalogNative.viewCards')}
          viewModeListLabel={t('catalogNative.viewList')}
          sortLabel={t('catalogNative.sortTitle')}
          filtersLabel={t('catalogNative.filtersTitle')}
          onToggleViewMode={() => setViewMode((prev) => (prev === 'card' ? 'list' : 'card'))}
          onOpenFilters={() => {
            setDraftFilters(filters)
            setIsFilterOpen(true)
          }}
          onOpenSort={() => setIsSortOpen(true)}
        />

        <View style={styles.listWrap}>
          {wines.isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" />
            </View>
          ) : null}
          {wines.isError ? (
            <View style={styles.center}>
              <Text style={styles.errorText}>{toReadableApiError(wines.error, t)}</Text>
            </View>
          ) : null}

          <FlatList
            data={wines.data?.items ?? []}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <WineCard
                item={item}
                viewMode={viewMode}
                onPress={() => navigation.navigate('WineDetail', { wineId: item.id })}
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 2, gap: 8, paddingBottom: 16 }}
          />
        </View>

        <PublicBottomMenu current="Catalog" onNavigate={(route) => navigation.navigate(route)} />
      </View>

      <Modal visible={isFilterOpen} animationType="slide" presentationStyle="fullScreen">
        <SafeScreen backgroundColor={colors.background} statusBarColor={colors.topbarMid}>
          <View style={styles.modalScreen}>
            <Text style={styles.modalTitle}>{t('catalogNative.filtersTitle')}</Text>

            <Text style={styles.fieldLabel}>{t('catalogNative.searchLabel')}</Text>
            <TextInput
              value={draftFilters.search}
              onChangeText={(value) => setDraftFilters((prev) => ({ ...prev, search: value }))}
              placeholder={t('catalogNative.searchPlaceholder')}
              placeholderTextColor="#9f8e85"
              style={styles.searchInput}
            />

            <Text style={styles.fieldLabel}>{t('catalogNative.wineTypeLabel')}</Text>
            <OptionRow
              options={wineTypeOptions}
              selected={draftFilters.wineType}
              onSelect={(value) => setDraftFilters((prev) => ({ ...prev, wineType: value }))}
            />

            <Text style={styles.fieldLabel}>{t('catalogNative.countryLabel')}</Text>
            <OptionRow
              options={countryOptions}
              selected={draftFilters.country}
              onSelect={(value) => setDraftFilters((prev) => ({ ...prev, country: value }))}
            />

            <Text style={styles.fieldLabel}>{t('catalogNative.scoreLabel')}</Text>
            <OptionRow
              options={scoreBucketOptions}
              selected={draftFilters.scoreBucket}
              onSelect={(value) => setDraftFilters((prev) => ({ ...prev, scoreBucket: value }))}
            />

            <View style={styles.modalActions}>
              <View style={styles.modalSecondaryRow}>
                <Pressable style={styles.secondaryBtn} onPress={() => setIsFilterOpen(false)}>
                  <Text style={styles.secondaryBtnText}>{t('catalogNative.close')}</Text>
                </Pressable>
                <Pressable style={styles.secondaryBtn} onPress={resetFilters}>
                  <Text style={styles.secondaryBtnText}>{t('catalogNative.reset')}</Text>
                </Pressable>
              </View>
              <Pressable style={styles.primaryBtn} onPress={applyFilters}>
                <Text style={styles.primaryBtnText}>{t('catalogNative.apply')}</Text>
              </Pressable>
            </View>
          </View>
        </SafeScreen>
      </Modal>

      <Modal visible={isSortOpen} animationType="slide" presentationStyle="fullScreen">
        <SafeScreen backgroundColor={colors.background} statusBarColor={colors.topbarMid}>
          <View style={styles.modalScreen}>
            <Text style={styles.modalTitle}>{t('catalogNative.sortTitle')}</Text>
            <ScrollView contentContainerStyle={{ gap: 10 }}>
              {sortOptions.map((option) => {
                const active = option.value.by === sort.by && option.value.dir === sort.dir
                return (
                  <Pressable
                    key={`${option.value.by}-${option.value.dir}`}
                    style={[styles.sortCard, active ? styles.sortCardActive : null]}
                    onPress={() => {
                      setSort(option.value)
                      setIsSortOpen(false)
                    }}
                  >
                    <Text style={[styles.sortCardText, active ? styles.sortCardTextActive : null]}>{option.label}</Text>
                  </Pressable>
                )
              })}
            </ScrollView>
            <Pressable style={[styles.secondaryBtn, styles.secondaryBtnFull]} onPress={() => setIsSortOpen(false)}>
              <Text style={styles.secondaryBtnText}>{t('catalogNative.close')}</Text>
            </Pressable>
          </View>
        </SafeScreen>
      </Modal>
    </SafeScreen>
  )
}

function HeroPanel(props: {
  title: string
  subtitle: string
  totalReviews: number
  totalReviewsLabel: string
  viewMode: CatalogViewMode
  viewModeCardLabel: string
  viewModeListLabel: string
  sortLabel: string
  filtersLabel: string
  onToggleViewMode: () => void
  onOpenFilters: () => void
  onOpenSort: () => void
}) {
  const isCardMode = props.viewMode === 'card'

  return (
    <ImageBackground source={{ uri: sharedImages.winesPhoto }} imageStyle={styles.heroImage} style={styles.heroWrap}>
      <View style={styles.heroOverlay} />
      <View style={styles.heroContent}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroKicker}>{props.subtitle}</Text>
          <Text style={styles.heroTitle}>{props.title}</Text>
        </View>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeValue}>{props.totalReviews}</Text>
          <Text style={styles.heroBadgeLabel}>{props.totalReviewsLabel}</Text>
        </View>
        <View style={styles.heroActions}>
          <Pressable style={[styles.heroActionBtn, styles.heroActionBtnPrimary]} onPress={props.onToggleViewMode}>
            <Text style={styles.heroActionIcon}>{isCardMode ? '◫' : '☰'}</Text>
            <Text style={styles.heroActionText}>{isCardMode ? props.viewModeCardLabel : props.viewModeListLabel}</Text>
          </Pressable>
          <Pressable style={styles.heroActionBtn} onPress={props.onOpenSort}>
            <Text style={styles.heroActionIcon}>⇅</Text>
            <Text style={styles.heroActionText}>{props.sortLabel}</Text>
          </Pressable>
          <Pressable style={styles.heroActionBtn} onPress={props.onOpenFilters}>
            <Text style={styles.heroActionIcon}>⚲</Text>
            <Text style={styles.heroActionText}>{props.filtersLabel}</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  )
}

function WineCard(props: { item: WineListItem; viewMode: CatalogViewMode; onPress: () => void }) {
  const score = props.item.avg_score
  const roundedScore = score == null ? null : Math.round(score * 10) / 10
  const medal = scoreTone(roundedScore)
  const isListMode = props.viewMode === 'list'
  const [hideDoLogo, setHideDoLogo] = useState(false)
  const doLogoUrl = props.item.do?.do_logo ? resolveImageUrl(`/images/icons/DO/${props.item.do.do_logo}`) : null

  return (
    <Pressable style={[styles.card, isListMode ? styles.cardList : styles.cardCard, medal.container]} onPress={props.onPress}>
      <Image
        source={{ uri: resolveImageUrl(props.item.photos[0]?.url, '/images/photos/wines/no-photo.png') }}
        style={[styles.cardPhoto, isListMode ? styles.cardPhotoList : null]}
      />

      <View style={styles.cardMiddle}>
        <Text style={[styles.cardTitle, isListMode ? styles.cardTitleList : null]}>{props.item.name}</Text>
        <Text style={[styles.cardMeta, isListMode ? styles.cardMetaList : null]}>
          {props.item.vintage_year ?? '-'} · {wineTypeLabel(props.item.wine_type)}
        </Text>
        <View style={styles.cardDoRow}>
          <Text style={[styles.cardDoPrefix, isListMode ? styles.cardDoPrefixList : null]}>DO</Text>
          {doLogoUrl && !hideDoLogo ? (
            <Image
              source={{ uri: doLogoUrl }}
              style={[styles.cardDoLogo, isListMode ? styles.cardDoLogoList : null]}
              resizeMode="contain"
              onError={() => setHideDoLogo(true)}
            />
          ) : null}
        </View>
        <Text style={[styles.cardDo, isListMode ? styles.cardDoList : null]}>{props.item.do?.name ?? '-'}</Text>
      </View>

      <View style={[styles.cardRight, isListMode ? styles.cardRightList : null]}>
        <Text style={styles.cardGrapeLabel}>VARIETATS DE VI</Text>
        <View style={styles.grapesWrap}>
          {(props.item.grapes.length > 0 ? props.item.grapes : [{ id: -1, name: '-', color: null, percentage: null }]).slice(0, 3).map((grape) => (
            <View key={grape.id} style={styles.grapeChip}>
              <Text style={styles.grapeChipText}>🍇 {grape.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.scoreBubble, isListMode ? styles.scoreBubbleList : null, medal.bubble]}>
        <Text style={[styles.scoreText, isListMode ? styles.scoreTextList : null]}>{roundedScore == null ? '-' : roundedScore.toFixed(1)}</Text>
      </View>
    </Pressable>
  )
}

function OptionRow<T extends string>(props: {
  options: Array<{ value: T; label: string }>
  selected: T
  onSelect: (value: T) => void
}) {
  return (
    <View style={styles.optionRow}>
      {props.options.map((option) => {
        const active = option.value === props.selected
        return (
          <Pressable key={option.value} style={[styles.optionChip, active ? styles.optionChipActive : null]} onPress={() => props.onSelect(option.value)}>
            <Text style={[styles.optionChipText, active ? styles.optionChipTextActive : null]}>{option.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

function wineTypeLabel(type: WineType | null): string {
  switch (type) {
    case 'red':
      return 'Negre'
    case 'white':
      return 'Blanc'
    case 'rose':
      return 'Rosat'
    case 'sparkling':
      return 'Escumos'
    case 'sweet':
      return 'Dolc'
    case 'fortified':
      return 'Fortificat'
    default:
      return '-'
  }
}

function scoreTone(score: number | null): { bubble: object; container: object } {
  if (score != null && score >= 90) {
    return {
      bubble: { backgroundColor: '#c99b2e' },
      container: { borderColor: '#e0c584', backgroundColor: '#fff9e8' },
    }
  }

  if (score != null && score >= 80) {
    return {
      bubble: { backgroundColor: '#81858e' },
      container: { borderColor: '#cfd3d8', backgroundColor: '#fbfbfc' },
    }
  }

  if (score != null && score >= 70) {
    return {
      bubble: { backgroundColor: '#975f43' },
      container: { borderColor: '#dcb6a1', backgroundColor: '#fff4ef' },
    }
  }

  return {
    bubble: { backgroundColor: '#6d6d6d' },
    container: { borderColor: '#d2c3bc', backgroundColor: '#faf7f5' },
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 0, gap: 0 },
  heroWrap: {
    minHeight: 122,
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 6,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d8c4a7',
  },
  heroImage: { opacity: 0.96 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 248, 240, 0.7)',
  },
  heroContent: {
    flex: 1,
    position: 'relative',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  heroTopRow: { flex: 1, justifyContent: 'center', paddingRight: 78 },
  heroKicker: { color: '#a11f52', letterSpacing: 1, fontWeight: '700', fontSize: 11 },
  heroTitle: { color: '#2b1b23', fontSize: 32, fontWeight: '900', lineHeight: 34 },
  heroActions: { flexDirection: 'row', gap: 8 },
  heroActionBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 13,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d6c4ad',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 8,
  },
  heroActionBtnPrimary: {
    borderColor: '#ca84a3',
    backgroundColor: '#fff7fb',
  },
  heroActionIcon: { fontWeight: '900', color: '#42222d', fontSize: 28, lineHeight: 28 },
  heroActionText: { fontWeight: '800', color: '#42222d', fontSize: 12, lineHeight: 14 },
  heroBadge: {
    position: 'absolute',
    top: 8,
    right: 10,
    borderRadius: 999,
    backgroundColor: '#f0dce5',
    borderWidth: 1,
    borderColor: '#c57f9f',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  heroBadgeValue: { color: '#5f1e3a', fontWeight: '900', fontSize: 16 },
  heroBadgeLabel: { color: '#5f1e3a', fontWeight: '700', fontSize: 10, letterSpacing: 0.3 },
  listWrap: {
    flex: 1,
    backgroundColor: '#ece6dd',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 12 },
  errorText: { color: '#7d2537', fontWeight: '600', textAlign: 'center' },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: '#fdfcfa',
    padding: 10,
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  cardCard: {
    alignItems: 'center',
  },
  cardList: {
    minHeight: 74,
    paddingVertical: 7,
    alignItems: 'center',
  },
  cardPhoto: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#eee2d3' },
  cardPhotoList: { width: 42, height: 42, borderRadius: 8 },
  cardMiddle: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 23, lineHeight: 25, fontWeight: '800', color: '#1f1a1e' },
  cardTitleList: { fontSize: 17, lineHeight: 19 },
  cardMeta: { color: '#514850', fontWeight: '700', fontSize: 15 },
  cardMetaList: { fontSize: 12 },
  cardDoRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  cardDoPrefix: { color: '#32272e', fontWeight: '800', fontSize: 15, lineHeight: 17 },
  cardDoPrefixList: { fontSize: 12, lineHeight: 14 },
  cardDoLogo: { width: 16, height: 16 },
  cardDoLogoList: { width: 12, height: 12 },
  cardDo: { color: '#32272e', fontWeight: '700', fontSize: 24, lineHeight: 26 },
  cardDoList: { fontSize: 14, lineHeight: 16 },
  cardRight: { width: 132, gap: 4, paddingRight: 56, alignSelf: 'flex-start', paddingTop: 2 },
  cardRightList: { width: 96, paddingRight: 42, alignSelf: 'flex-start', paddingTop: 1 },
  cardGrapeLabel: { fontSize: 9, color: '#8e7b7f', fontWeight: '700', letterSpacing: 0.55 },
  grapesWrap: { gap: 3 },
  grapeChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d98db3',
    backgroundColor: '#fff7fb',
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  grapeChipText: { fontSize: 12, color: '#6b2750', fontWeight: '700' },
  scoreBubble: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111',
    shadowOpacity: 0.34,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  scoreBubbleList: {
    width: 40,
    height: 40,
    borderRadius: 20,
    top: 9,
    right: 8,
  },
  scoreText: { color: '#fff', fontWeight: '900', fontSize: 17 },
  scoreTextList: { fontSize: 13 },
  modalScreen: {
    flex: 1,
    backgroundColor: '#efe8dd',
    padding: 16,
  },
  modalTitle: { fontSize: 28, fontWeight: '800', color: '#2b1b23', marginBottom: 10 },
  fieldLabel: { color: '#7a614f', fontWeight: '700', marginTop: 8, marginBottom: 6 },
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d7c1a4',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#2d2528',
    fontSize: 16,
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d8c2a3',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  optionChipActive: { backgroundColor: '#f4dde5', borderColor: '#c66a93' },
  optionChipText: { color: '#694f41', fontWeight: '700' },
  optionChipTextActive: { color: '#5a2036' },
  modalActions: { marginTop: 'auto', gap: 10, paddingTop: 10 },
  modalSecondaryRow: { flexDirection: 'row', gap: 8 },
  secondaryBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c9b49b',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  secondaryBtnFull: { marginTop: 12 },
  secondaryBtnText: { color: '#4f3b31', fontWeight: '700' },
  primaryBtn: {
    borderRadius: 14,
    backgroundColor: '#7d2c48',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  sortCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d5bea0',
    backgroundColor: '#fff',
    padding: 14,
  },
  sortCardActive: {
    borderColor: '#c66a93',
    backgroundColor: '#f8e7ef',
  },
  sortCardText: { color: '#4e3930', fontWeight: '700' },
  sortCardTextActive: { color: '#5a2036' },
})
