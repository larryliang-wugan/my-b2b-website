# WUGAN WordPress starter

This deliverable contains an editable block theme and a separate inquiry plugin.
Use WordPress 6.6+ and PHP 8.1+. Install first on a staging site.

1. Appearance > Themes > Add New > Upload: install `wugan-performance.zip` and activate.
2. Plugins > Add New > Upload: install `wugan-inquiries.zip` and activate.
3. Appearance > Editor > Templates > Front Page: edit homepage blocks, text, photos and documentation sections. Header/footer are editable template parts.
4. Set the site name to WUGAN and tagline to Performance Underwear & Socks Manufacturer.
5. Create and approve a Privacy Policy page at `/privacy-policy/`; select it under Settings > Privacy before accepting real inquiries.
6. Set up authenticated SMTP or a transactional mail service for sales@wugan.net. Test external delivery, spam placement and failure handling. wp_mail acceptance does not guarantee delivery.
7. Submit a test inquiry and check the private WUGAN Inquiries admin menu and email notification. Restrict admin access to authorized staff. Configure retention and deletion for customer information.
8. Disable search indexing for staging; enable it only after production review. Configure HTTPS, backups and a tested restore.

## Editing and photography

Homepage sections are native WordPress blocks, editable in the Site Editor.
Save changes to persist a customized template in the database. No paid builder is required.
The bundled images are existing project assets, not newly generated pictures.
The socks section currently uses a generic fabric/waistband detail; replace it with real socks.
Suggested shots: underwear and socks paired landscape hero (2400x1400), clean product front/back (1600x1600), yarn/cushioning/seam details (1600x1200), each factory and QC process (2000x1400).
Add certificate images with Image blocks under the corresponding document heading. Include holder, scope and document date in the caption. Current homepage does not claim factory-wide OEKO-TEX certification or a BSCI pass.
Add actual factory addresses once the addresses of both sites have been confirmed.

## Confirmed commercial information

wugan.net; sales@wugan.net; WhatsApp +86 13692352052; 24-hour inquiry contact.
MOQ 300 pieces, samples from USD 15, sampling from 7 days, production from 15 days.
Two factories, for underwear and socks, confirmed by owner on 2026-10-23.
Order-specific conditions remain subject to quotation.

## OKKI

OKKI is not connected. Its supported API, account permissions and authentication must be confirmed.
The plugin emits `wugan_inquiry_created($post_id, $data)` after saving each inquiry.
A separate adapter should map fields to the actual OKKI API, store credentials server-side,
use the inquiry ID for idempotency, queue retries and expose synchronization status.
Do not paste API credentials into page content or theme files.

## Current scope and checks

This is a homepage-led WordPress starter with page/post templates and a working inquiry handler implementation.
Product catalogue administration, attachments, CRM sync and sample checkout are not included.
No cloud servers, paid resources or DNS records have been created or changed.
PHP parsing and WordPress runtime verification must be completed on staging before launch.
