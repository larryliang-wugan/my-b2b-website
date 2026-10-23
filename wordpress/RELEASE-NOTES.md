# WUGAN Studio release

Delivered: a new WordPress classic theme (`wugan-studio`) and upgraded inquiry plugin. The previous starter theme remains available separately.

## Included

- Original uploaded WUGAN logo and 29 optimized product, factory and team images, with source mapping.
- 13 content pages: Home, Products, Underwear, Socks, Customization, Fabrics, Factories, About, Resources, FAQ, Contact, Samples, Privacy Policy.
- Eight selected independent product pages with galleries, related products and contextual inquiry links.
- Desktop hover/keyboard product dropdown, mobile expandable navigation, product search and category filters.
- WordPress product management, media-library gallery picker, page-image replacement controls and search descriptions.
- Inquiry and sample forms, private lead records, email notification status and administrator CSV export.
- Product brief download and direct WhatsApp/email contact.

## Verified

Local WordPress runtime: PHP 8.2 with SQLite for isolated testing. Imported 13 pages and eight products. Browser checks passed on 1440px desktop and 390px mobile for all 21 pages: images, layout overflow, menus and gallery interaction. Static preview additionally passed category/search checks. A real form submission created a private inquiry record; simulated mail failure, invalid nonce and unverified receipt cases passed. No external email was sent during tests.

## Deployment details

Production target remains the user's DigitalOcean WordPress host with Cloudflare. This session did not have deployment credentials attached, so no production files or DNS were changed. Configure production SMTP and verify delivery to sales@wugan.net before accepting live inquiries. OKKI is not connected; the saved-inquiry integration hook is available.

The reference domain degreefurniture.com could not be fetched because the environment proxy returned HTTP 403. The design implements the user's requested large-image, multi-page manufacturer-site direction; it is not represented as a verified reproduction of that website.

The sock page uses the user's real showroom photography and offers custom development; individual sock SKU specifications were not supplied. Unsupported performance and certification claims are not added. All additional uploaded product archives remain in the workspace for later catalog expansion.

## Preview

WordPress runtime: http://localhost:8090/

Static preview: http://localhost:4173/ . Its inquiry form opens an email draft and does not claim to save website inquiries. The installable WordPress plugin is the real inquiry implementation.

Build preview: `node scripts/build-studio-content.mjs && node scripts/preview-studio.mjs --serve`.

The HTML pages use root-relative paths and must be served over HTTP. Install instructions: NEW-WEBSITE-GUIDE.md.
