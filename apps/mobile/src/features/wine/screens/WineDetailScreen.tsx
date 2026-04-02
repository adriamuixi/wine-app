import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { WineDetailPhoto, WineDetailReview, WinePhotoType } from '@wine-app/api-client'
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import type { RootStackParamList } from '../../../app/navigation/RootNavigator'
import { apiClient } from '../../../shared/api/client'
import { toReadableApiError } from '../../../shared/api/errors'
import { resolveImageUrl } from '../../../shared/assets/images'
import { useAuth } from '../../../shared/auth/AuthContext'
import { useI18n } from '../../../shared/i18n/I18nContext'
import { colors } from '../../../shared/theme/colors'

type Props = NativeStackScreenProps<RootStackParamList, 'WineDetail'>

const PHOTO_ORDER: WinePhotoType[] = ['bottle', 'front_label', 'back_label', 'situation']

export function WineDetailScreen({ navigation, route }: Props) {
  const { user } = useAuth()
  const { t, locale } = useI18n()
  const wineId = route.params.wineId

  const details = useQuery({
    queryKey: ['wine', wineId],
    queryFn: async () => apiClient.getWine(wineId),
  })

  const ownReview = useMemo(() => {
    if (details.data?.wine === undefined || user === null) return null
    return details.data.wine.reviews.find((review) => review.user.id === user.id) ?? null
  }, [details.data?.wine, user])

  const wine = details.data?.wine
  const availablePhotoTypes = useMemo(() => {
    if (wine === undefined) return ['bottle'] as WinePhotoType[]
    const present = new Set<WinePhotoType>()
    for (const photo of wine.photos) {
      if (photo.type != null && photo.url.trim() !== '') {
        present.add(photo.type)
      }
    }
    const ordered = PHOTO_ORDER.filter((type) => present.has(type))
    return ordered.length > 0 ? ordered : (['bottle'] as WinePhotoType[])
  }, [wine])
  const [selectedPhotoType, setSelectedPhotoType] = useState<WinePhotoType>('bottle')
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)

  if (details.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (details.isError || wine === undefined) {
    return (
      <View style={styles.center}>
        <Text>{toReadableApiError(details.error, t)}</Text>
      </View>
    )
  }

  const openReviewEditor = (): void => {
    if (user === null) {
      Alert.alert(t('wineDetail.privateActionTitle'), t('wineDetail.privateActionMessage'))
      navigation.navigate('Login', { reason: 'review' })
      return
    }

    navigation.navigate('ReviewEditor', {
      wineId,
      reviewId: ownReview?.id,
    })
  }

  const photoType = availablePhotoTypes.includes(selectedPhotoType) ? selectedPhotoType : availablePhotoTypes[0]
  const selectedPhoto = pickPhotoByType(wine.photos, photoType) ?? wine.photos[0]
  const photoItems = availablePhotoTypes.map((type) => ({
    type,
    label: photoTypeLabel(type, t),
    photo: pickPhotoByType(wine.photos, type),
  }))
  const galleryPhotos = photoItems.map((item) => ({
    type: item.type,
    label: item.label,
    uri: resolveImageUrl(item.photo?.url, '/images/photos/wines/no-photo-dark.png'),
  }))
  const selectedIndex = Math.max(0, galleryPhotos.findIndex((item) => item.type === photoType))

  const avgScore = averageScore(wine.reviews)
  const topPurchase = wine.purchases[0] ?? null
  const tastingDate = topPurchase?.purchased_at ?? wine.reviews[0]?.created_at ?? null
  const tastingMonth = tastingDate ? new Intl.DateTimeFormat(localeToIntl(locale), { month: 'long' }).format(new Date(tastingDate)) : null
  const doName = wine.do?.name ?? t('wineDetail.noDo')
  const doLogo = wine.do?.do_logo ? resolveImageUrl(`/images/icons/DO/${wine.do.do_logo}`) : null
  const regionLogo = wine.do?.region_logo ? resolveImageUrl(`/images/flags/regions/${wine.do.region_logo}`) : null
  const placeLabel = topPurchase ? `${topPurchase.place.name}${topPurchase.place.city ? ` · ${topPurchase.place.city}` : ''}` : t('wineDetail.noPlace')
  const minPrice = minimumPrice(wine.purchases)
  const awardLabel = wine.awards[0]?.name ? awardName(wine.awards[0].name) : t('wineDetail.noFeaturedAward')

  const mariaReview = wine.reviews.find((review) => `${review.user.name} ${review.user.lastname}`.toLowerCase().includes('maria')) ?? wine.reviews[0]
  const adriaReview = wine.reviews.find((review) => `${review.user.name} ${review.user.lastname}`.toLowerCase().includes('adria')) ?? wine.reviews[1]
  const notes = collectNotes(wine.reviews)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.topTitle}>{wine.name}</Text>

      <Pressable
        style={styles.photoCard}
        onPress={() => {
          setViewerIndex(selectedIndex)
          setIsViewerOpen(true)
        }}
      >
        <Image source={{ uri: resolveImageUrl(selectedPhoto?.url, '/images/photos/wines/no-photo-dark.png') }} style={styles.heroPhoto} />
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
        {photoItems.map((item) => {
          const active = item.type === photoType
          return (
            <Pressable key={item.type} style={[styles.thumbCard, active ? styles.thumbCardActive : null]} onPress={() => setSelectedPhotoType(item.type)}>
              <Image source={{ uri: resolveImageUrl(item.photo?.url, '/images/photos/wines/no-photo.png') }} style={styles.thumbImage} />
              <Text style={[styles.thumbText, active ? styles.thumbTextActive : null]} numberOfLines={1}>{item.label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{t('wineDetail.detailTitle')}</Text>

        <DetailRow icon="🏛️" label={t('wineDetail.wineryLabel')} value={wine.winery ?? t('wineDetail.unknownWinery')} />

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>🧭 {t('wineDetail.doLabel')}</Text>
          <View style={styles.doRow}>
            {wine.do?.country_code ? <Text style={styles.flagText}>{countryCodeToFlag(wine.do.country_code)}</Text> : null}
            {doLogo ? <Image source={{ uri: doLogo }} style={styles.inlineLogo} resizeMode="contain" /> : null}
            {regionLogo ? <Image source={{ uri: regionLogo }} style={styles.inlineLogo} resizeMode="contain" /> : null}
            <Text style={styles.infoValue}>{doName}</Text>
          </View>
        </View>

        <DetailRow icon="◈" label={t('wineDetail.styleLabel')} value={`${wineTypeLabel(wine.wine_type, t)} · ${wine.vintage_year ?? '-'}`} />

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>🍇 {t('wineDetail.grapesLabel')}</Text>
          <View style={styles.chipsWrap}>
            {(wine.grapes.length > 0 ? wine.grapes : [{ id: -1, name: '-', color: null, percentage: null }]).map((grape) => (
              <View key={grape.id} style={styles.pillChip}>
                <Text style={styles.pillChipText}>🍇 {grape.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <DetailRow icon="◈" label={t('wineDetail.agingLabel')} value={agingTypeLabel(wine.aging_type, t)} />
        <DetailRow icon="€" label={t('wineDetail.alcoholLabel')} value={wine.alcohol_percentage == null ? t('wineDetail.noAlcohol') : `${wine.alcohol_percentage}%`} />
        <DetailRow icon="📅" label={t('wineDetail.tastingDateLabel')} value={tastingDate ? formatDate(tastingDate, locale) : t('wineDetail.noDate')} />
        <DetailRow icon="🗓️" label={t('wineDetail.monthLabel')} value={tastingMonth ?? t('wineDetail.noDate')} />
        <DetailRow icon="📍" label={t('wineDetail.placeLabel')} value={placeLabel} />
        <DetailRow icon="★" label={t('wineDetail.avgScoreLabel')} value={avgScore == null ? '-' : `${avgScore.toFixed(1)} punts`} />
        <DetailRow icon="€" label={t('wineDetail.priceFromLabel')} value={minPrice == null ? t('wineDetail.noPrice') : `${minPrice.toFixed(2)} €`} />
        <DetailRow icon="🏆" label={t('wineDetail.awardsLabel')} value={awardLabel} />
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>★ {t('wineDetail.averageSectionTitle')}</Text>
        <Text style={styles.softMeta}>📅 {tastingDate ? `${formatDate(tastingDate, locale)} · ${tastingMonth ?? ''}` : t('wineDetail.noDate')}</Text>
        {mariaReview ? <ScoreCard review={mariaReview} tint="pink" /> : null}
        {adriaReview ? <ScoreCard review={adriaReview} tint="blue" /> : null}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>🍷 {t('wineDetail.tastingNotesTitle')}</Text>
        <Text style={styles.notesText}>{notes.length > 0 ? notes.join(' · ') : t('wineDetail.noNotes')}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>🏷️ {t('wineDetail.tagsTitle')}</Text>
        <View style={styles.chipsWrap}>
          {[doName, wineTypeLabel(wine.wine_type, t)].filter((tag) => tag.trim() !== '').map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagChipText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {user === null ? <Text style={styles.info}>{t('wineDetail.privateModeInfo')}</Text> : null}

      <Pressable style={styles.primaryButton} onPress={openReviewEditor}>
        <Text style={styles.primaryButtonText}>{ownReview ? t('wineDetail.editMyReview') : t('wineDetail.createMyReview')}</Text>
      </Pressable>

      <Modal visible={isViewerOpen} animationType="fade" transparent={false}>
        <View style={styles.viewerWrap}>
          <Pressable style={styles.viewerClose} onPress={() => setIsViewerOpen(false)}>
            <Text style={styles.viewerCloseText}>×</Text>
          </Pressable>

          <View style={styles.viewerHeader}>
            <Text style={styles.viewerHeaderText}>{wine.name}</Text>
            <Text style={styles.viewerSubText}>{galleryPhotos.length > 0 ? `${viewerIndex + 1} / ${galleryPhotos.length}` : '-'}</Text>
          </View>

          <View style={styles.viewerBody}>
            <Pressable
              style={[styles.viewerArrowBtn, viewerIndex <= 0 ? styles.viewerArrowDisabled : null]}
              disabled={viewerIndex <= 0}
              onPress={() => setViewerIndex((prev) => Math.max(0, prev - 1))}
            >
              <Text style={styles.viewerArrowText}>‹</Text>
            </Pressable>

            <Image source={{ uri: galleryPhotos[viewerIndex]?.uri }} style={styles.viewerImage} resizeMode="contain" />

            <Pressable
              style={[styles.viewerArrowBtn, viewerIndex >= galleryPhotos.length - 1 ? styles.viewerArrowDisabled : null]}
              disabled={viewerIndex >= galleryPhotos.length - 1}
              onPress={() => setViewerIndex((prev) => Math.min(galleryPhotos.length - 1, prev + 1))}
            >
              <Text style={styles.viewerArrowText}>›</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

function DetailRow(props: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{props.icon} {props.label}</Text>
      <Text style={styles.infoValue}>{props.value}</Text>
    </View>
  )
}

function ScoreCard(props: { review: WineDetailReview; tint: 'pink' | 'blue' }) {
  const bg = props.tint === 'pink' ? '#fff4f8' : '#f5f8ff'
  const border = props.tint === 'pink' ? '#efbfd0' : '#c7d5ef'

  return (
    <View style={[styles.scoreCard, { backgroundColor: bg, borderColor: border }]}>
      <Text style={styles.scoreLabel}>🧑 Valoracio {props.review.user.name}</Text>
      <Text style={styles.scoreValue}>{props.review.score == null ? '-' : props.review.score.toFixed(2)}</Text>
    </View>
  )
}

function pickPhotoByType(photos: WineDetailPhoto[], type: WinePhotoType): WineDetailPhoto | undefined {
  return photos.find((photo) => photo.type === type && photo.url.trim() !== '')
}

function photoTypeLabel(type: WinePhotoType, t: (key: string, params?: Record<string, string | number>) => string): string {
  if (type === 'bottle') return t('wineDetail.photoBottle')
  if (type === 'front_label') return t('wineDetail.photoFrontLabel')
  if (type === 'back_label') return t('wineDetail.photoBackLabel')
  return t('wineDetail.photoContext')
}

function wineTypeLabel(type: string | null, t: (key: string, params?: Record<string, string | number>) => string): string {
  if (type === 'red') return 'Negre'
  if (type === 'white') return 'Blanc'
  if (type === 'rose') return 'Rosat'
  if (type === 'sparkling') return 'Escumos'
  if (type === 'sweet') return 'Dolc'
  if (type === 'fortified') return 'Fortificat'
  return t('wineDetail.noType')
}

function agingTypeLabel(type: string | null, t: (key: string, params?: Record<string, string | number>) => string): string {
  if (type == null) return t('wineDetail.noAging')
  if (type === 'joven') return 'Jove'
  if (type === 'crianza') return 'Crianca'
  if (type === 'reserva') return 'Reserva'
  if (type === 'gran_reserva') return 'Gran reserva'
  return type
}

function formatDate(value: string, locale: 'ca' | 'es' | 'en'): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat(localeToIntl(locale), { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parsed)
}

function localeToIntl(locale: 'ca' | 'es' | 'en'): string {
  if (locale === 'ca') return 'ca-ES'
  if (locale === 'es') return 'es-ES'
  return 'en-US'
}

function averageScore(reviews: WineDetailReview[]): number | null {
  const valid = reviews.map((review) => review.score).filter((score): score is number => typeof score === 'number')
  if (valid.length === 0) return null
  return valid.reduce((sum, score) => sum + score, 0) / valid.length
}

function minimumPrice(purchases: Array<{ price_paid: number }>): number | null {
  if (purchases.length === 0) return null
  return purchases.reduce((min, item) => Math.min(min, item.price_paid), Number.POSITIVE_INFINITY)
}

function awardName(name: string): string {
  if (name === 'penin') return 'Penín'
  if (name === 'parker') return 'Parker'
  if (name === 'wine_spectator') return 'Wine Spectator'
  if (name === 'decanter') return 'Decanter'
  if (name === 'james_suckling') return 'James Suckling'
  if (name === 'guia_proensa') return 'Guia Proensa'
  return name
}

function collectNotes(reviews: WineDetailReview[]): string[] {
  const items = new Set<string>()
  for (const review of reviews) {
    for (const bullet of review.bullets) {
      if (typeof bullet === 'string' && bullet.trim() !== '') {
        items.add(bullet.replaceAll('_', ' '))
      }
    }
  }
  return [...items]
}

function countryCodeToFlag(code: string): string {
  const letters = code.toUpperCase().trim()
  if (letters.length !== 2) return ''
  const chars = [...letters]
  return chars.map((char) => String.fromCodePoint(127397 + char.charCodeAt(0))).join('')
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ece4da' },
  content: { padding: 8, gap: 10, paddingBottom: 28 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: '#7f7883', fontSize: 20, fontWeight: '500', marginHorizontal: 4, marginTop: 2 },
  photoCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d7c7b3',
    backgroundColor: '#fff',
  },
  heroPhoto: { width: '100%', height: 258, backgroundColor: '#e7d9c2' },
  thumbRow: { gap: 8, paddingHorizontal: 2 },
  thumbCard: {
    width: 88,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d7c7b3',
    backgroundColor: '#f8f3ed',
    padding: 4,
    gap: 4,
  },
  thumbCardActive: {
    borderColor: '#cc5f8d',
    backgroundColor: '#fff6fa',
  },
  thumbImage: { width: '100%', height: 60, borderRadius: 8, backgroundColor: '#eee2d2' },
  thumbText: { fontSize: 10, color: '#534046', fontWeight: '600', textAlign: 'center' },
  thumbTextActive: { color: '#7e1f49' },
  panel: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd0c0',
    backgroundColor: '#f3eee8',
    padding: 10,
    gap: 8,
  },
  panelTitle: { fontSize: 17, fontWeight: '900', color: '#2b1b23', marginBottom: 2 },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7d8ca',
    backgroundColor: '#f4efea',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  infoLabel: { color: '#9a8a8f', fontSize: 12, fontWeight: '600' },
  infoValue: { color: '#2f2328', fontSize: 18, fontWeight: '800' },
  doRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flagText: { fontSize: 16 },
  inlineLogo: { width: 22, height: 17, borderRadius: 4, backgroundColor: '#fff' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  pillChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d98db3',
    backgroundColor: '#fff7fb',
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  pillChipText: { fontSize: 11, color: '#6b2750', fontWeight: '700' },
  softMeta: { color: '#6b565c', fontWeight: '600', marginTop: -2, fontSize: 12 },
  scoreCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  scoreLabel: { color: '#47363d', fontWeight: '700', fontSize: 13 },
  scoreValue: { color: '#2d1f24', fontWeight: '900', fontSize: 22 },
  notesText: { color: '#4f3d44', fontWeight: '600', lineHeight: 18, fontSize: 12 },
  tagChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d0c4b8',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagChipText: { color: '#5a4950', fontWeight: '600', fontSize: 12 },
  info: { color: colors.textMuted, fontStyle: 'italic' },
  primaryButton: { marginTop: 4, borderRadius: 12, backgroundColor: colors.accent, padding: 14 },
  primaryButtonText: { color: '#fff', fontWeight: '800', textAlign: 'center', fontSize: 16 },
  viewerWrap: {
    flex: 1,
    backgroundColor: '#110a0d',
  },
  viewerClose: {
    position: 'absolute',
    top: 46,
    right: 18,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerCloseText: { color: '#fff', fontSize: 27, lineHeight: 28, fontWeight: '500' },
  viewerHeader: {
    paddingTop: 52,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  viewerHeaderText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  viewerSubText: { color: 'rgba(255,255,255,0.76)', fontSize: 13, marginTop: 2 },
  viewerBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  viewerArrowBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerArrowDisabled: { opacity: 0.35 },
  viewerArrowText: { color: '#fff', fontSize: 34, lineHeight: 34, marginTop: -3 },
  viewerImage: {
    flex: 1,
    height: '100%',
    maxHeight: '90%',
    borderRadius: 12,
  },
})
