# WUGAN release WUGAN-2026.10.23-01

The user has authorized automatic deployment to their existing wugan.net WordPress installation. Do not ask them to repeat that authorization or require manual theme installation as the default path.

## Version mapping

Website, theme and preview: 2.0.0. Inquiry plugin: 1.1.1.
Theme version appears in WordPress Themes, Wugan setup and the public footer. Inquiry version appears in Plugins and the inquiry administration footer.

DigitalOcean and Cloudflare are external platforms; do not label their vendor software with an invented version. Record the same release ID in deployment history only after the relevant operations succeed. No release has yet been applied to production by this workspace. OKKI is not connected.

## Current connection blocker

The managed runtime status reports no secrets, runtime variables or outbound identities. The user previously bound CLOUDFLARE_API_TOKEN and DIGITALOCEAN_ACCESS_TOKEN in another environment configuration. Current onboarding draft recovery is unavailable in this thread. Reconnect to that published environment and recheck readiness; never request tokens in chat or print their contents.

DigitalOcean API access alone does not grant SSH execution on an existing droplet. Check for an authorized server connection or an available authenticated deployment mechanism before promising file installation. Keep production DNS, email DNS records and server identity unchanged.

## Authorized deployment sequence when connected

1. Read-only inspect the existing server, WordPress root, active theme, plugins, page slugs and current site version.
2. Back up database and files; confirm a restorable backup before modifications.
3. Install versioned packages in staging and preview content. The starter importer skips existing page slugs: prepare an explicit backed-up page migration for the old site rather than silently leaving old content.
4. Activate the theme/plugin and apply the reviewed page migration, homepage and permalink settings. Retain existing leads and unrelated settings.
5. Verify public routes, mobile layout, forms, and actual SMTP delivery without sending unsolicited messages. OKKI requires its own integration setup.
6. Purge site caches as appropriate, verify https://wugan.net, record deployed versions and backup reference in release history. Do not claim deployment from package creation alone.
