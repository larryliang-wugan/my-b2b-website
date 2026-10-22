# WUGAN performance website revision — 2026-10-22

Source: user-supplied three-page “Codex B2B Web Spec.pdf”. Applied the dark slate (#0F172A), blue (#2563EB) and soft gray (#F8FAFC) visual direction, sticky navigation, conversion-focused hero, metrics, collection cards, interactive fabric/technology panels, customization, process, sample request dialog, downloadable tech-pack checklist and expanded quote form. Shared styling carries through existing product, factory and company pages. Uses local CSS, vanilla JavaScript and inline SVG, without a runtime CDN dependency on the NAS.

The PDF's example brand APEX is replaced by WUGAN. Previously confirmed company figures remain: stock fabric MOQ 300; custom fabric MOQ 1,200; sample 7 days/from USD 15, credited per quotation; production 10/25 days; 800,000 pieces monthly capacity. The PDF itself alternates between $19 and $19.99 and describes an unconfirmed kit composition; the implementation offers a sample request, not a fixed kit checkout.

Socks are a feasibility-enquiry option, not an invented catalog product. No sock images, performance test results, customer testimonials or universal US compliance claims are fabricated. Functional fabric, pouch, waistband and seam features are discussed as development requirements, confirmed against samples and applicable tests. The first four actual underwear products remain editable.

The form accepts PDF/JPG/PNG as supported by the current server. Illustrator artwork instructions ask the buyer to export PDF. Product interest, quantity range and selected customizations are included in the submitted project message on the server version. The static preview prevents API submission and displays a clear test message. It contains no admin accounts, database, private attachments or SMTP credentials.

Export using `npm run export:nas`. Output: `artifacts/nas-preview/wugan-site`. Copy its contents into NAS `Web/wugan-site`. All local assets, product thumbnails and links use the subdirectory prefix. HTTP does not require crypto.randomUUID for the preview form. Static pages have noindex/nofollow metadata. This is a review site, not the final production or WordPress delivery.

WordPress conversion is deferred until the user confirms the final design. Public NAS contents are not modified automatically from this environment.
