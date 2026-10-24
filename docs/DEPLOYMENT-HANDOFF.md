# WUGAN release WUGAN-2026.10.24-02

The user has authorized automatic deployment to their existing wugan.net WordPress installation. Do not ask them to repeat that authorization or require manual theme installation as the default path.

## Version mapping

Website, theme and preview: 2.0.1 (the new 2.0 design). Inquiry plugin: 1.1.2.
Theme version appears in WordPress Themes, Wugan setup and the public footer. Inquiry version appears in Plugins and the inquiry administration footer.

DigitalOcean and Cloudflare are external platforms; do not label their vendor software with an invented version. Record the same release ID in deployment history only after the relevant operations succeed. No release has yet been applied to production by this workspace. OKKI is not connected.

## Current connection blocker

The managed runtime status reports no secrets, runtime variables or outbound identities. The user previously bound CLOUDFLARE_API_TOKEN and DIGITALOCEAN_ACCESS_TOKEN in another environment configuration. Current onboarding draft recovery is unavailable in this thread. Reconnect to that published environment and recheck readiness; never request tokens in chat or print their contents.

DigitalOcean API access alone does not grant SSH execution on an existing droplet. Check for an authorized server connection or an available authenticated deployment mechanism before promising file installation. Keep production DNS, email DNS records and server identity unchanged.

## Authorized deployment sequence when connected

1. Read-only inspect the existing server, WordPress root, active theme, plugins, page slugs and current site version.
2. Back up database and files; confirm a restorable backup before modifications.
3. Install `review/wugan-studio-v2.0.1.zip` and `review/wugan-inquiries-v1.1.2.zip` in staging. Review the 16 bundled page slugs against existing edits. In Appearance > Wugan setup, explicitly select the release upgrade checkbox to replace matching bundled pages. An unchecked import adds missing pages only. The upgrade preserves old content/descriptions/image mappings in `_wugan_release_backup` post metadata and saves revisions, but this is NOT a substitute for the database backup. Products and inquiries are not overwritten; missing product specification metadata is initialized.
4. Activate the theme/plugin and apply the reviewed page migration, homepage and permalink settings. Retain existing leads and unrelated settings.
5. Verify public routes, mobile layout, forms, and actual SMTP delivery without sending unsolicited messages. OKKI requires its own integration setup.
6. Purge site caches as appropriate, verify https://wugan.net, record deployed versions and backup reference in release history. Do not claim deployment from package creation alone.

## Release-specific acceptance

- Set Home as the static front page; save permalinks if routes fail. Verify `/quality-assurance/`, `/brand-development/`, `/partnerships/`, both catalogs, all eight product routes, samples, FAQ, privacy and contact.
- Product menus support pointer hover, click and keyboard; phone menus use expandable sections.
- Verify MOQ everywhere: 300 pieces per style, per color, across up to 4 sizes. Samples from USD15, sampling from 7 days, production from 15 days subject to approval/materials/order schedule.
- Exclude `/contact/`, `/samples/`, query-based inquiry receipts and `wp-admin/admin-post.php` from page/CDN caching. Verify nonce validity and receipt cookies on HTTPS. Configure trusted proxy handling at the server so rate limits are not shared across all users behind Cloudflare.
- Verify a controlled inquiry arrives at sales@wugan.net. The local test deliberately disables email; local success proves saved records and failure handling, NOT SMTP delivery. Verify email authentication and logging. Do not change existing mailbox MX records.
- OKKI is NOT connected. The plugin exposes a hook, not a working CRM integration.
- English is the only delivered language. A Polylang language menu appears only when multiple languages are configured. Full navigation/content/form translations require a separate translation pass; do not market this release as fully multilingual.
- There are eight curated underwear styles and a sock development page. No invented sock SKU photos, client outcome statistics or blanket performance/certification guarantees have been added.
- Older source documents conflict on factory area, staffing and capacity. These figures are intentionally not used. Current BSCI/material-certificate scope must be verified for any future badges or downloadable documents.
- Theme pages: edit content in Pages; replace images via the Page images panel. Products: edit text, featured image, gallery and Product development specifications. Do not rerun release replacement after editorial changes without reviewing a new backup.
- Restore using the full pre-upgrade database/files backup if necessary. Page revisions alone do not restore descriptions or image mappings.

The new offline review is `review/WUGAN-2.0.1-preview.zip`. It is exported from the actual WordPress rendering. Its form only opens an email draft and must never be installed as the WordPress website.
