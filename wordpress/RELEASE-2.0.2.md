# WUGAN 2.0.2

Release WUGAN-2026.10.27-01. Theme 2.0.2; inquiry plugin unchanged at 1.1.2.

- Explicit Home links in desktop and mobile navigation.
- Fixed pointer gap and duplicate close handlers in the product mega menu.
- Added visible language menu. Native published Polylang destinations are preferred; otherwise optional Google Translate links open the public page in another tab. No external translation request occurs before a click, and query strings are excluded.
- Expanded underwear category with material/construction evidence and sampling/approval information, informed by the uploaded reference HTML.

Deploy theme package `review/wugan-studio-v2.0.2.zip`. Back up database/files first. Header and interaction fixes take effect on theme replacement; no import is needed for those fixes. To update only the underwear page, replace its content from `data/site.json` using the staging deployment process and save a revision. The full Wugan setup upgrade replaces all bundled pages: do not use that for this narrow update if editors have changed other pages.

Offline preview: `review/WUGAN-2.0.2-preview.zip`. Extract, open index.html. Translation links target the production website, not local unpublished preview content. Preview forms create email drafts only.

Tests: `scripts/check-navigation.cjs` adds slow real-pointer trajectories across the former gap at four desktop widths, before/after scrolling, followed by actual navigation. Also checks outside-close, Home, mobile expansion, language entries, keyboard closing and exclusion of private query data from external translation URLs. Existing page/form tests remain applicable.

This is a repository release, not proof of deployment to wugan.net. SMTP, native translations, OKKI and production/CDN verification remain separate deployment work.
