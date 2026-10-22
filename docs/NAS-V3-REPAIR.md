# NAS preview v3 — navigation repair

Reported: only products could be browsed; another navigation produced an Apache 404. The screenshot does not expose the full failing path. Read-only checks against the user's NAS found the current homepage and the main section pages responding successfully, with extensionless links redirected to directories. The exact failing URL has not been established, so these checks do not claim to reproduce the user's specific 404.

The export now maps every page link to its explicit `index.html`, preserves query parameters and anchors, and makes every internal link/asset relative to its page directory. The archive can also be served from a renamed directory without pointing back at the old folder. Image-switch attributes are included. JavaScript and CSS use a new cache version; the footer identifies NAS preview v3. Server application routes are unchanged.

The regression test builds the full export and checks all 19 pages, links, anchors and assets against a server that rejects directories and redirects. It mounts under a different directory name to detect accidental hardcoded paths. Browser review additionally visits all pages, checks images, mobile layout and menu navigation, sample intent, preview submission and image switching.

Deployment entry: `http://120.196.100.125:8082/wugan-site/index.html`. The package is delivered for the user to copy through Finder. No NAS files were modified remotely. Static preview does not send or persist inquiries.
