import type { FormEventHandler } from 'react'
import type { ReviewFormPreset, WineItem } from '../types'

type ReviewEditorMode = 'create' | 'edit'

type ReviewEditorPanelProps = {
  t: (key: string) => string
  labels: {
    eyebrow: string
    submit: string
    wine: string
    selectWine: string
    palateEntry: string
  }
  mode: ReviewEditorMode
  preset: ReviewFormPreset
  selectedReviewId: number | null
  reviewFormSubmitting: boolean
  reviewFormError: string | null
  creatableWineItems: WineItem[]
  wineItems: WineItem[]
  reviewedWineIdSet: Set<number>
  reviewTagOptions: readonly string[]
  scoreOptions0To10: number[]
  scoreOptions0To100: number[]
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  formatIsoDateToDdMmYyyy: (value: string) => string
}

export function ReviewEditorPanel({
  t,
  labels,
  mode,
  preset,
  selectedReviewId,
  reviewFormSubmitting,
  reviewFormError,
  creatableWineItems,
  wineItems,
  reviewedWineIdSet,
  reviewTagOptions,
  scoreOptions0To10,
  scoreOptions0To100,
  onBack,
  onSubmit,
  formatIsoDateToDdMmYyyy,
}: ReviewEditorPanelProps) {
  const reviewFormId = `review-form-${mode}-${selectedReviewId ?? 'new'}`
  const reviewSubmitLabel = mode === 'create'
    ? (reviewFormSubmitting ? t('ui.creating') : labels.submit)
    : (reviewFormSubmitting ? t('ui.saving') : t('ui.save_changes_review'))
  const winesForSelect = mode === 'create' ? creatableWineItems : wineItems

  return (
    <section className="screen-grid">
      <section className="panel">
        <div className="panel-header wine-create-header">
          <div>
            <p className="eyebrow">{labels.eyebrow}</p>
            <h3>{mode === 'create' ? t('ui.create_review') : t('ui.edit_review')}</h3>
          </div>
          <div className="panel-header-actions">
            <button type="button" className="ghost-button small review-editor-back-button" onClick={onBack}>
              <svg className="review-editor-back-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M14.7 5.3a1 1 0 0 1 0 1.4L10.41 11H20a1 1 0 1 1 0 2h-9.59l4.3 4.3a1 1 0 1 1-1.42 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.42 0Z"
                  fill="currentColor"
                />
              </svg>
              <span className="review-editor-back-text">{t('ui.back_list')}</span>
            </button>
            <button
              type="submit"
              className="primary-button small"
              form={reviewFormId}
              disabled={reviewFormSubmitting || (mode === 'create' && creatableWineItems.length === 0)}
            >
              {reviewSubmitLabel}
            </button>
          </div>
        </div>

        <form
          id={reviewFormId}
          key={`${mode}-${selectedReviewId ?? 'new'}`}
          className="stack-form"
          onSubmit={onSubmit}
        >
          <label>
            {labels.wine}
            <select name="wine_id" defaultValue={preset.wineId} disabled={mode === 'create' && creatableWineItems.length === 0}>
              <option value="" disabled>{labels.selectWine}</option>
              {winesForSelect.map((wine) => (
                <option
                  key={wine.id}
                  value={wine.id}
                  disabled={mode === 'create' && reviewedWineIdSet.has(wine.id)}
                >
                  {wine.name} · {wine.winery}
                  {mode === 'create' && reviewedWineIdSet.has(wine.id) ? ` ${t('ui.already_reviewed')}` : ''}
                </option>
              ))}
            </select>
            {mode === 'create' ? (
              <small className="muted">{t('ui.wines_already_reviewed_appear_gray_and_not_can_select')}</small>
            ) : null}
            {mode === 'create' && creatableWineItems.length === 0 ? (
              <small className="muted">{t('ui.already_has_reviewed_all_wines_available')}</small>
            ) : null}
          </label>

          <label>
            {t('ui.date_review')}
            <input
              type="text"
              name="created_at"
              inputMode="numeric"
              placeholder="dd/mm/yyyy"
              pattern="\\d{2}/\\d{2}/\\d{4}"
              defaultValue={formatIsoDateToDdMmYyyy(preset.tastingDate)}
            />
          </label>

          <fieldset className="form-block">
            <legend>{t('ui.rating_wine')}</legend>
            <label className="important-rating-field">
              <span>{t('ui.rating_general_0_100')}</span>
              <select name="score" defaultValue={String(preset.overallScore)}>
                {scoreOptions0To100.map((score) => (
                  <option key={score} value={score}>{score}</option>
                ))}
              </select>
            </label>
            <div className="inline-grid triple">
              <label>
                {t('reviews.ui.aroma')}
                <select name="aroma" defaultValue={String(preset.aroma)}>
                  {scoreOptions0To10.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
              <label>
                {t('ui.appearance')}
                <select name="appearance" defaultValue={String(preset.appearance)}>
                  {scoreOptions0To10.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
              <label>
                {labels.palateEntry}
                <select name="palate_entry" defaultValue={String(preset.palateEntry)}>
                  {scoreOptions0To10.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="inline-grid triple">
              <label>
                {t('ui.body')}
                <select name="body" defaultValue={String(preset.body)}>
                  {scoreOptions0To10.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
              <label>
                {t('ui.persistence')}
                <select name="persistence" defaultValue={String(preset.persistence)}>
                  {scoreOptions0To10.map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="field-stack">
              <span className="field-label">{t('ui.tags_tasting')}</span>
              <div className="tag-checkbox-grid">
                {reviewTagOptions.map((tag) => (
                  <label key={tag} className="tag-checkbox-item">
                    <input type="checkbox" name="bullets" value={tag} defaultChecked={preset.tags.includes(tag)} />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          {reviewFormError ? <p className="error-message">{reviewFormError}</p> : null}
        </form>
      </section>
    </section>
  )
}
