import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'

import type { RootStackParamList } from '../../../app/navigation/RootNavigator'
import { apiClient } from '../../../shared/api/client'
import { toReadableApiError } from '../../../shared/api/errors'
import { useAuth } from '../../../shared/auth/AuthContext'
import { useI18n } from '../../../shared/i18n/I18nContext'
import { colors } from '../../../shared/theme/colors'

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewEditor'>

type ReviewDraft = {
  aroma: string
  appearance: string
  palate_entry: string
  body: string
  persistence: string
  score: string
}

function parseAxis(value: string): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return 0
  }

  return Math.max(0, Math.min(10, Math.round(parsed)))
}

function parseScore(value: string): number | null {
  if (value.trim() === '') {
    return null
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return null
  }

  return Math.max(0, Math.min(100, Math.round(parsed)))
}

export function ReviewEditorScreen({ navigation, route }: Props) {
  const queryClient = useQueryClient()
  const { token } = useAuth()
  const { t } = useI18n()
  const { wineId, reviewId } = route.params
  const isEditing = typeof reviewId === 'number'

  const [draft, setDraft] = useState<ReviewDraft>({
    aroma: '5',
    appearance: '5',
    palate_entry: '5',
    body: '5',
    persistence: '5',
    score: '',
  })

  const existingReview = useQuery({
    queryKey: ['review', wineId, reviewId],
    queryFn: async () => apiClient.getReview(wineId, reviewId ?? 0),
    enabled: isEditing && token !== null,
  })

  useEffect(() => {
    if (existingReview.data?.review === undefined) {
      return
    }

    const review = existingReview.data.review
    setDraft({
      aroma: String(review.aroma),
      appearance: String(review.appearance),
      palate_entry: String(review.palate_entry),
      body: String(review.body),
      persistence: String(review.persistence),
      score: review.score == null ? '' : String(review.score),
    })
  }, [existingReview.data?.review])

  const payload = useMemo(() => ({
    aroma: parseAxis(draft.aroma),
    appearance: parseAxis(draft.appearance),
    palate_entry: parseAxis(draft.palate_entry),
    body: parseAxis(draft.body),
    persistence: parseAxis(draft.persistence),
    score: parseScore(draft.score),
    bullets: [] as Array<'fruity' | 'floral' | 'mineral' | 'oak_forward' | 'powerful'>,
  }), [draft])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isEditing && reviewId != null) {
        await apiClient.updateReview(wineId, reviewId, payload)
        return
      }

      await apiClient.createReview(wineId, payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['wine', wineId] })
      navigation.goBack()
    },
    onError: (error) => {
      Alert.alert(t('reviewEditor.reviewErrorTitle'), toReadableApiError(error, t))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (reviewId == null) {
        return
      }

      await apiClient.deleteReview(wineId, reviewId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['wine', wineId] })
      navigation.goBack()
    },
    onError: (error) => {
      Alert.alert(t('reviewEditor.deleteErrorTitle'), toReadableApiError(error, t))
    },
  })

  const updateField = (field: keyof ReviewDraft, value: string): void => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  if (token === null) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.title}>{t('reviewEditor.loginRequired')}</Text>
        <Text style={styles.helper}>{t('reviewEditor.loginRequiredMessage')}</Text>
        <Button title={t('reviewEditor.goToLogin')} onPress={() => navigation.navigate('Login', { reason: 'review' })} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isEditing ? t('reviewEditor.editTitle') : t('reviewEditor.createTitle')}</Text>
      <Field label={t('reviewEditor.aroma')} value={draft.aroma} onChange={(value) => updateField('aroma', value)} />
      <Field label={t('reviewEditor.appearance')} value={draft.appearance} onChange={(value) => updateField('appearance', value)} />
      <Field label={t('reviewEditor.palateEntry')} value={draft.palate_entry} onChange={(value) => updateField('palate_entry', value)} />
      <Field label={t('reviewEditor.body')} value={draft.body} onChange={(value) => updateField('body', value)} />
      <Field label={t('reviewEditor.persistence')} value={draft.persistence} onChange={(value) => updateField('persistence', value)} />
      <Field label={t('reviewEditor.score')} value={draft.score} onChange={(value) => updateField('score', value)} />

      <Button title={saveMutation.isPending ? t('reviewEditor.saving') : t('reviewEditor.save')} onPress={() => saveMutation.mutate()} disabled={saveMutation.isPending} />

      {isEditing ? (
        <View style={{ marginTop: 8 }}>
          <Button
            title={deleteMutation.isPending ? t('reviewEditor.deleting') : t('reviewEditor.deleteReview')}
            color="#9e2f2f"
            onPress={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          />
        </View>
      ) : null}

      {existingReview.isError ? <Text>{toReadableApiError(existingReview.error, t)}</Text> : null}
    </ScrollView>
  )
}

function Field(props: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput keyboardType="numeric" value={props.value} onChangeText={props.onChange} style={styles.input} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  content: { padding: 14, gap: 12, paddingBottom: 30 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  helper: { color: colors.textMuted, marginBottom: 10 },
  label: { fontWeight: '600', color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: 10,
    backgroundColor: colors.panel,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
})
