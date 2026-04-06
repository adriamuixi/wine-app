import type { WineAiDraft } from '../types'

type WineAiDraftPreviewPanelProps = {
  t: (key: string) => string
  draft: WineAiDraft
  onBack: () => void
  onUseDraft: () => void
}

function metadataLabel(value: string) {
  return value.replace(/_/g, ' ')
}

export function WineAiDraftPreviewPanel({ t, draft, onBack, onUseDraft }: WineAiDraftPreviewPanelProps) {
  const fields: Array<{ label: string; key: string; value: string }> = [
    { label: t('wines.add.name'), key: 'wine.name', value: draft.wine.name ?? '-' },
    { label: t('wines.add.winery'), key: 'wine.winery', value: draft.wine.winery ?? '-' },
    { label: t('wines.add.type'), key: 'wine.wine_type', value: draft.wine.wine_type ?? '-' },
    { label: t('ui.country_production'), key: 'wine.country', value: draft.wine.country ?? '-' },
    { label: t('ui.crianza'), key: 'wine.aging_type', value: draft.wine.aging_type ?? '-' },
    { label: t('wines.add.vintage'), key: 'wine.vintage_year', value: draft.wine.vintage_year == null ? '-' : String(draft.wine.vintage_year) },
    { label: t('ui.alcohol_content'), key: 'wine.alcohol_percentage', value: draft.wine.alcohol_percentage == null ? '-' : String(draft.wine.alcohol_percentage) },
    { label: t('common.doAbbreviation'), key: 'wine.do_name', value: draft.wine.do?.name ?? '-' },
    { label: t('wines.add.place'), key: 'purchase.place_name', value: draft.purchase.place_name ?? '-' },
    { label: t('wines.add.price'), key: 'purchase.price_paid', value: draft.purchase.price_paid == null ? '-' : String(draft.purchase.price_paid) },
    { label: t('ui.date_purchase'), key: 'purchase.purchased_at', value: draft.purchase.purchased_at ?? '-' },
  ]

  return (
    <section className="screen-grid">
      <section className="panel ai-preview-panel">
        <div className="panel-header wine-create-header">
          <div>
            <p className="eyebrow">{t('ui.ai_preview')}</p>
            <h3>{t('ui.review_ai_draft')}</h3>
          </div>
          <div className="panel-header-actions">
            <button type="button" className="ghost-button small review-editor-back-button" onClick={onBack}>
              <span className="review-editor-back-text">{t('ui.back_list')}</span>
            </button>
            <button type="button" className="primary-button small" onClick={onUseDraft}>
              {t('ui.use_draft_in_create_form')}
            </button>
          </div>
        </div>

        {draft.research_summary ? <p className="muted">{draft.research_summary}</p> : null}
        {draft.missing_required_fields.length > 0 ? (
          <div className="api-doc-state api-doc-state-error">
            <p>{t('ui.ai_missing_required_fields')}</p>
            <p className="api-doc-error-detail">{draft.missing_required_fields.join(', ')}</p>
          </div>
        ) : null}
        {draft.warnings.length > 0 ? (
          <div className="api-doc-state">
            <p>{t('ui.ai_warnings')}</p>
            <p className="api-doc-error-detail">{draft.warnings.join(' · ')}</p>
          </div>
        ) : null}

        <fieldset className="form-block">
          <legend>{t('ui.ai_draft_fields')}</legend>
          <div className="ai-preview-stack">
            {fields.map((field) => {
              const metadata = draft.field_metadata[field.key]
              return (
                <div key={field.key} className="ai-preview-field-row">
                  <strong className="ai-preview-field-label">{field.label}</strong>
                  <span className="ai-preview-field-value">{field.value}</span>
                  <span className="ai-preview-field-meta">{metadata ? `${metadataLabel(metadata.source)} · ${metadataLabel(metadata.confidence)}` : '-'}</span>
                  {metadata?.notes ? <span className="ai-preview-field-notes">{metadata.notes}</span> : null}
                </div>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="form-block form-block-half">
          <legend>{t('ui.composition_and_grape')}</legend>
          <div className="ai-preview-stack">
            {draft.grapes.length === 0 ? <p className="muted">-</p> : draft.grapes.map((grape) => (
              <div key={`${grape.name}-${grape.grape_id ?? 'x'}`} className="ai-preview-field-row">
                <strong className="ai-preview-field-label">{grape.name}</strong>
                <span className="ai-preview-field-value">{grape.percentage == null ? '-' : `${grape.percentage}%`}</span>
                <span className="ai-preview-field-meta">{grape.matched ? t('ui.ai_matched') : t('ui.ai_unmatched')}</span>
                <span className="ai-preview-field-notes">{grape.grape_id == null ? '-' : `#${grape.grape_id}`}</span>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="form-block form-block-half">
          <legend>{t('ui.awards')}</legend>
          <div className="ai-preview-stack">
            {draft.awards.length === 0 ? <p className="muted">-</p> : draft.awards.map((award) => (
              <div key={`${award.name}-${award.year ?? 'x'}`} className="ai-preview-field-row">
                <strong className="ai-preview-field-label">{award.name}</strong>
                <span className="ai-preview-field-value">{award.score == null ? '-' : String(award.score)}</span>
                <span className="ai-preview-field-meta">{award.year ?? '-'}</span>
              </div>
            ))}
          </div>
        </fieldset>
      </section>
    </section>
  )
}
