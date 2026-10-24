# WUGAN 2.0.1 - editorial redesign

Release WUGAN-2026.10.24-02. Inquiry plugin 1.1.2.

This is the new 2.0 design, versioned separately from the earlier 2.0.0 build. Not deployed by this workspace.

## Packages

- `review/wugan-studio-v2.0.1.zip`: installable WordPress theme.
- `review/wugan-inquiries-v1.1.2.zip`: installable inquiry plugin.
- `review/WUGAN-2.0.1-preview.zip`: offline visual review exported from actual WordPress rendering. Extract and open index.html; preserve folder structure. Form buttons create email drafts only.

## Contents

16 pages and eight curated underwear detail pages. Image-led homepage, product mega menu, product search (including exact SKU codes), galleries, material/fit/construction fields, factory information, customer visits, quality documentation, brand development, sampling, FAQ and inquiry capture. All images are supplied WUGAN material, not reference-site assets. No external font/CDN dependency is needed for the theme UI.

English is delivered. A conditional Polylang switcher is available only after languages are configured; translated content and forms are not included. OKKI is not integrated.

## Editing

- Pages: edit the page content. Page images panel replaces images using the WordPress media library.
- Products: edit title, description, featured image, gallery and Product development specifications.
- Inquiries: private admin records, email status and CSV export. Configure production email separately.
- Appearance > Wugan setup: default import preserves existing pages. The explicit upgrade checkbox replaces matching bundled pages, with metadata backups and revisions. Review changes on staging first.

Follow `docs/DEPLOYMENT-HANDOFF.md` for production operations. This release deliberately does not modify DNS, email routing or server credentials.

## Reproduction

1. `node scripts/build-studio-content.mjs` regenerates theme content data.
2. Install theme and plugin in a local WordPress instance. Use the reviewed import option.
3. `WUGAN_TEST_URL=http://localhost:8090 node scripts/check-studio.cjs`
4. `node scripts/check-studio-form.cjs` only against the local 8090 test instance with outbound mail disabled.
5. `node scripts/export-wordpress-review.mjs`
6. `node scripts/check-studio-release.cjs`

The earlier static preview scripts and 2.0.0 packages are historical artifacts; the new WordPress export is the authoritative review. Localhost is not a public preview URL.
