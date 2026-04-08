const WINE_ICON_PATHS = [
  '/images/icons/wine/2_glasses.png',
  '/images/icons/wine/2_glasses_2.png',
  '/images/icons/wine/barrel.png',
  '/images/icons/wine/barrel_2.png',
  '/images/icons/wine/barrel_3.png',
  '/images/icons/wine/barrel_automatic.png',
  '/images/icons/wine/barrel_wheel.png',
  '/images/icons/wine/barrels_cave.png',
  '/images/icons/wine/bottle_glass.png',
  '/images/icons/wine/calendar_grapes.png',
  '/images/icons/wine/calendar_grapes_2.png',
  '/images/icons/wine/certificate.png',
  '/images/icons/wine/cheese_2.png',
  '/images/icons/wine/cheese_region.png',
  '/images/icons/wine/chesse_knive.png',
  '/images/icons/wine/corkscrew.png',
  '/images/icons/wine/corkscrew_2.png',
  '/images/icons/wine/corkscrew_3.png',
  '/images/icons/wine/corkscrew_hand.png',
  '/images/icons/wine/cutters.png',
  '/images/icons/wine/do.png',
  '/images/icons/wine/do_only.png',
  '/images/icons/wine/do_shield.png',
  '/images/icons/wine/do_sign.png',
  '/images/icons/wine/glass.png',
  '/images/icons/wine/glass_and_grapes.png',
  '/images/icons/wine/glass_hand.png',
  '/images/icons/wine/glass_region.png',
  '/images/icons/wine/glass_wine.png',
  '/images/icons/wine/glass_wine_decanter.png',
  '/images/icons/wine/glasses_3.png',
  '/images/icons/wine/grape_branch.png',
  '/images/icons/wine/grape_leave.png',
  '/images/icons/wine/grapes.png',
  '/images/icons/wine/grapes_2.png',
  '/images/icons/wine/grapes_3.png',
  '/images/icons/wine/grapes_4.png',
  '/images/icons/wine/grapes_5.png',
  '/images/icons/wine/grapes_6.png',
  '/images/icons/wine/grapes_basket.png',
  '/images/icons/wine/grapes_region.png',
  '/images/icons/wine/grapes_stick.png',
  '/images/icons/wine/grapes_white.png',
  '/images/icons/wine/grapes_white_2.png',
  '/images/icons/wine/heart_wine.png',
  '/images/icons/wine/house_grapes.png',
  '/images/icons/wine/house_grapes_2.png',
  '/images/icons/wine/knive_cheese.png',
  '/images/icons/wine/leave_water.png',
  '/images/icons/wine/leaves.png',
  '/images/icons/wine/mark_wine.png',
  '/images/icons/wine/settings.png',
  '/images/icons/wine/source/wine_pack_1.png',
  '/images/icons/wine/source/wine_pack_2.png',
  '/images/icons/wine/source/wine_pack_3.png',
  '/images/icons/wine/source/wine_pack_4.png',
  '/images/icons/wine/source/wine_pack_5.png',
  '/images/icons/wine/source/wine_pack_6.png',
  '/images/icons/wine/tap.png',
  '/images/icons/wine/warrels.png',
  '/images/icons/wine/wine_2.png',
  '/images/icons/wine/wine_3bottles.png',
  '/images/icons/wine/wine_and_glass.png',
  '/images/icons/wine/wine_bottle.png',
  '/images/icons/wine/wine_bottle_2.png',
  '/images/icons/wine/wine_bottle_3.png',
  '/images/icons/wine/wine_bottle_cheese.png',
  '/images/icons/wine/wine_card.png',
  '/images/icons/wine/wine_comment.png',
  '/images/icons/wine/wine_couple.png',
  '/images/icons/wine/wine_cup_1.png',
  '/images/icons/wine/wine_cup_10.png',
  '/images/icons/wine/wine_cup_2.png',
  '/images/icons/wine/wine_cup_3.png',
  '/images/icons/wine/wine_cup_4.png',
  '/images/icons/wine/wine_cup_5.png',
  '/images/icons/wine/wine_cup_6.png',
  '/images/icons/wine/wine_cup_7.png',
  '/images/icons/wine/wine_cup_8.png',
  '/images/icons/wine/wine_cup_9.png',
  '/images/icons/wine/wine_glass_hand.png',
  '/images/icons/wine/wine_glasse_relax.png',
  '/images/icons/wine/wine_glasses_2.png',
  '/images/icons/wine/wine_grapes.png',
  '/images/icons/wine/wine_grapes_2.png',
  '/images/icons/wine/wine_grapes_3.png',
  '/images/icons/wine/wine_grapes_4.png',
  '/images/icons/wine/wine_lens.png',
  '/images/icons/wine/wine_maps.png',
  '/images/icons/wine/wine_maps2.png',
  '/images/icons/wine/wine_shield.png',
  '/images/icons/wine/wine_tap.png',
  '/images/icons/wine/winery_automatic.png',
  '/images/icons/wine/winery_bucket.png',
  '/images/icons/wine/winery_machine.png',
  '/images/icons/wine/winery_machine_2.png',
  '/images/icons/wine/winery_machine_manual.png',
  '/images/icons/wine/winery_stand.png',
  '/images/icons/wine/wines2_glass.png',
  '/images/icons/wine/wines_bag.png',
  '/images/icons/wine/wines_book.png',
  '/images/icons/wine/wines_bucket.png',
  '/images/icons/wine/wines_bucket_2.png',
  '/images/icons/wine/wineyard.png',
  '/images/icons/wine/wineyard_arc.png',
  '/images/icons/wine/wineyard_bottle.png',
  '/images/icons/wine/wineyard_glass.png',
  '/images/icons/wine/wineyard_houses.png',
  '/images/icons/wine/wineyard_sun.png',
] as const

type IconLibraryPanelProps = {
  t: (key: string, params?: Record<string, string | number>) => string
}

function iconNameFromPath(path: string): string {
  const filename = path.split('/').pop() ?? path
  return filename.replace(/\.png$/i, '')
}

export function IconLibraryPanel({ t }: IconLibraryPanelProps) {
  return (
    <section className="screen-grid">
      <section className="panel">
        <div className="panel-header">
          <div className="panel-header-heading-with-icon">
            <img className="panel-header-section-icon" src="/images/icons/wine/wines_book.png" alt="" aria-hidden="true" />
            <div className="panel-header-heading-copy">
              <p className="eyebrow">{t('ui.asset_library')}</p>
              <h3>{t('ui.icon_library')}</h3>
            </div>
          </div>
          <span className="pill">{t('ui.total_icons_count', { count: WINE_ICON_PATHS.length })}</span>
        </div>

        <p className="panel-intro">{t('ui.icon_library_description')}</p>

        <div className="icon-library-grid">
          {WINE_ICON_PATHS.map((iconPath) => (
            <article key={iconPath} className="icon-library-card">
              <a
                className="icon-library-preview icon-library-preview-link"
                href={iconPath}
                target="_blank"
                rel="noreferrer"
                aria-label={`${t('ui.open_icon_in_new_tab')} ${iconNameFromPath(iconPath)}`}
                title={t('ui.open_icon_in_new_tab')}
              >
                <img src={iconPath} alt={iconNameFromPath(iconPath)} loading="lazy" />
              </a>
              <strong>{iconNameFromPath(iconPath)}</strong>
              <code>{iconPath}</code>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}
