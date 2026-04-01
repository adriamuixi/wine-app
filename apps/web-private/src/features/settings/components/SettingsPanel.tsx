import type { FormEventHandler } from 'react'
import type { Locale } from '../../../i18n/messages'
import type { ThemeMode } from '../types'

type SettingsPanelProps = {
  t: (key: string) => string
  labelsMenu: {
    dashboard: string
    wines: string
    dos: string
    reviews: string
  }
  settingsName: string
  settingsLastname: string
  settingsPassword: string
  settingsProfileSubmitting: boolean
  settingsProfileError: string | null
  settingsProfileSuccess: string | null
  loggedIn: boolean
  locale: Locale
  themeMode: ThemeMode
  defaultSortPreference: 'score_desc' | 'recent' | 'price_asc'
  defaultLandingPage: 'dashboard' | 'wines' | 'dos' | 'reviews'
  showOnlySpainByDefault: boolean
  compactCardsPreference: boolean
  onSettingsNameChange: (value: string) => void
  onSettingsLastnameChange: (value: string) => void
  onSettingsPasswordChange: (value: string) => void
  onSettingsProfileSubmit: FormEventHandler<HTMLFormElement>
  onLocaleChange: (nextLocale: Locale) => void
  onThemeModeChange: (nextThemeMode: ThemeMode) => void
  onDefaultSortPreferenceChange: (nextValue: 'score_desc' | 'recent' | 'price_asc') => void
  onDefaultLandingPageChange: (nextValue: 'dashboard' | 'wines' | 'dos' | 'reviews') => void
  onToggleShowOnlySpainByDefault: () => void
  onToggleCompactCardsPreference: () => void
}

export function SettingsPanel({
  t,
  labelsMenu,
  settingsName,
  settingsLastname,
  settingsPassword,
  settingsProfileSubmitting,
  settingsProfileError,
  settingsProfileSuccess,
  loggedIn,
  locale,
  themeMode,
  defaultSortPreference,
  defaultLandingPage,
  showOnlySpainByDefault,
  compactCardsPreference,
  onSettingsNameChange,
  onSettingsLastnameChange,
  onSettingsPasswordChange,
  onSettingsProfileSubmit,
  onLocaleChange,
  onThemeModeChange,
  onDefaultSortPreferenceChange,
  onDefaultLandingPageChange,
  onToggleShowOnlySpainByDefault,
  onToggleCompactCardsPreference,
}: SettingsPanelProps) {
  return (
    <section className="screen-grid two-columns">
      <section className="panel">
        <div className="panel-header">
          <div className="panel-header-heading-with-icon">
            <img className="panel-header-section-icon" src="/images/icons/wine/settings.png" alt="" aria-hidden="true" />
            <div className="panel-header-heading-copy">
              <p className="eyebrow">{t('ui.preferences')}</p>
              <h3>{t('ui.settings_backoffice')}</h3>
            </div>
          </div>
        </div>

        <form className="stack-form settings-form" onSubmit={onSettingsProfileSubmit}>
          <label>
            {t('ui.name')}
            <input
              type="text"
              value={settingsName}
              onChange={(event) => onSettingsNameChange(event.target.value)}
              autoComplete="given-name"
            />
          </label>

          <label>
            {t('ui.surname')}
            <input
              type="text"
              value={settingsLastname}
              onChange={(event) => onSettingsLastnameChange(event.target.value)}
              autoComplete="family-name"
            />
          </label>

          <label>
            {t('ui.new_password')}
            <input
              type="password"
              value={settingsPassword}
              onChange={(event) => onSettingsPasswordChange(event.target.value)}
              autoComplete="new-password"
              placeholder={t('ui.leave_empty_for_keep_it')}
            />
          </label>

          {settingsProfileError ? <p className="error-message">{settingsProfileError}</p> : null}
          {settingsProfileSuccess ? <p className="success-message">{settingsProfileSuccess}</p> : null}

          <button type="submit" className="primary-button" disabled={settingsProfileSubmitting || !loggedIn}>
            {settingsProfileSubmitting ? t('ui.saving') : t('ui.save_profile')}
          </button>
        </form>

        <div className="settings-divider" />

        <form className="stack-form settings-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            {t('ui.language')}
            <div className="settings-segmented" role="group" aria-label={t('ui.language')}>
              <button
                type="button"
                className={`settings-chip${locale === 'ca' ? ' active' : ''}`}
                onClick={() => onLocaleChange('ca')}
              >
                CA
              </button>
              <button
                type="button"
                className={`settings-chip${locale === 'es' ? ' active' : ''}`}
                onClick={() => onLocaleChange('es')}
              >
                ES
              </button>
              <button
                type="button"
                className={`settings-chip${locale === 'en' ? ' active' : ''}`}
                onClick={() => onLocaleChange('en')}
              >
                EN
              </button>
            </div>
          </label>

          <label>
            {t('common.themeLabel')}
            <div className="settings-segmented" role="group" aria-label={t('common.themeLabel')}>
              <button
                type="button"
                className={`settings-chip${themeMode === 'light' ? ' active' : ''}`}
                onClick={() => onThemeModeChange('light')}
              >
                {t('ui.light')}
              </button>
              <button
                type="button"
                className={`settings-chip${themeMode === 'dark' ? ' active' : ''}`}
                onClick={() => onThemeModeChange('dark')}
              >
                {t('ui.dark')}
              </button>
            </div>
          </label>

          <label>
            {t('ui.sort_by_default_list_wines')}
            <select
              value={defaultSortPreference}
              onChange={(event) => onDefaultSortPreferenceChange(event.target.value as 'score_desc' | 'recent' | 'price_asc')}
            >
              <option value="score_desc">{t('ui.score_most_high_first')}</option>
              <option value="recent">{t('ui.added_recently')}</option>
              <option value="price_asc">{t('ui.price_most_low_first')}</option>
            </select>
          </label>

          <label>
            {t('ui.screen_home_by_default')}
            <select
              value={defaultLandingPage}
              onChange={(event) => onDefaultLandingPageChange(event.target.value as 'dashboard' | 'wines' | 'dos' | 'reviews')}
            >
              <option value="dashboard">{labelsMenu.dashboard}</option>
              <option value="wines">{labelsMenu.wines}</option>
              <option value="dos">{labelsMenu.dos}</option>
              <option value="reviews">{labelsMenu.reviews}</option>
            </select>
          </label>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{t('ui.experience')}</p>
            <h3>{t('ui.preferencias_extra')}</h3>
          </div>
        </div>

        <div className="list-stack">
          <article className="list-card settings-toggle-row">
            <div>
              <h4>{t('ui.filter_espana_by_default')}</h4>
              <p>{t('ui.aplica_filter_country_espana_open_searcher')}</p>
            </div>
            <button
              type="button"
              className={`settings-chip compact${showOnlySpainByDefault ? ' active' : ''}`}
              onClick={onToggleShowOnlySpainByDefault}
              aria-pressed={showOnlySpainByDefault}
            >
              {showOnlySpainByDefault ? t('ui.active') : t('ui.inactive')}
            </button>
          </article>

          <article className="list-card settings-toggle-row">
            <div>
              <h4>{t('ui.cards_compact')}</h4>
              <p>{t('ui.mode_with_less_space_vertical_for_lists')}</p>
            </div>
            <button
              type="button"
              className={`settings-chip compact${compactCardsPreference ? ' active' : ''}`}
              onClick={onToggleCompactCardsPreference}
              aria-pressed={compactCardsPreference}
            >
              {compactCardsPreference ? t('ui.active') : t('ui.inactive')}
            </button>
          </article>

          <article className="list-card">
            <div>
              <h4>{t('ui.upcoming_ideas')}</h4>
              <p>{t('ui.notifications_new_reviews_export_csv_and_preference_decimals_score')}</p>
            </div>
            <button type="button" className="ghost-button small" disabled>
              {t('ui.soon')}
            </button>
          </article>
        </div>
      </section>
    </section>
  )
}
