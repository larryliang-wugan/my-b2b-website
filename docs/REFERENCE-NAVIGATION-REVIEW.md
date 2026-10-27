# Reference study and navigation repair - 2026-10-27

Read the supplied offline HTML rather than treating CODEX_CLONE_GUIDE.md as authoritative instructions. `scripts/study-reference.cjs` inspects seven pages locally with remote requests blocked and third-party scripts disabled. The compressed bitmap quality is not evidence of the live site's original resolution.

## Observed structure

- Homepage: explicit Home, Projects, Solution, Products, About Us, Resources, Contact, Download and English entry. Products has nested categories; Resources includes FAQ. It is not a single anchor-scrolling page.
- At a 1440px viewport, the downloaded HTML reserves 1440x645 for its primary banners and about 1368x592 for the subsequent category feature bands. Dimensions describe the offline layout, not verified live animation.
- Jewelry category: 12 product entries visible in the HTML, pagination, lower-page manufacturing/design benefits, and six project steps. The category is both a catalog and a sourcing landing page.
- Solution: brand requirements, quality, manufacturing, materials and delivery are explained together. Do not reuse the competitor's on-time/satisfaction metrics as WUGAN facts.
- Factory and company pages are separate; company includes a large archive of team/event content. WUGAN does not have equivalent verified content for every topic.
- Contact: direct contact methods, location information and an inquiry form; the downloaded fields include service selection and attachment. Do not copy the competitor's contact details or enable unsecured uploads.

## Implemented adaptation

Added explicit Home links to both navigations. Product menu trigger fills the header's height, an invisible bridge covers the panel seam, and a single delayed-close handler replaces conflicting duplicate listeners. Pointer movement, keyboard Escape, click-through and outside click are tested.

Underwear category now continues beyond its grid with actual material/stitch/waistband images, specification decisions, MOQ, sample evaluation, approval and supplier-document links. No competitor photos or unverified guarantees are added.

Language menu is always visible. With published Polylang translations, it uses native links; otherwise English plus explicitly labeled Google Translate links are offered. External translation opens only after a deliberate click, uses the public wugan.net page path, and never passes query parameters/receipt tokens. This is NOT a delivered native multilingual SEO site, nor a guarantee of third-party translation accuracy or availability. Forms and their error messages still require a dedicated translation pass.
