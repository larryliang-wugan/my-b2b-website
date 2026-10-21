# WUGAN B2B manufacturing website

English OEM/ODM website for wugan.net. Node.js 24+, Express, server-rendered HTML, SQLite and vanilla browser JavaScript. This is a server application, not a static-only website.

## Run

```sh
npm ci
npm test
npm run build
npm run dev
```

The server listens on port 3000 (override PORT). `npm start` runs without the development watcher. `npm run build` validates scripts and required assets; no compiled bundle is necessary. Health endpoint: `/health`.

## Features

- Four editable products, category/search filters, product details and inquiry shortlist.
- OEM/ODM, fabrics, factory, about, contact, FAQ and sourcing articles.
- Inquiry form with consent, private PDF/JPEG/PNG attachments (10 MB maximum), database persistence, duplicate-request handling and SMTP notifications.
- Password-protected `/admin`: inquiry status, CSV export, private attachment download, email retry, product/article editing and image uploads.
- Mobile navigation, page metadata, canonical URLs, sitemap and robots file.
- Rate limits, session expiry, CSRF checks, escaped output and private upload storage.

## Configure

See [.env.example](.env.example) and [deployment instructions](docs/DEPLOYMENT.md). Environment files are not loaded automatically: inject variables through the host, or use Node's `--env-file` option locally. Never commit credentials.

Create an administrator with ADMIN_USERNAME and ADMIN_PASSWORD supplied securely in the process environment, then run `npm run admin:create`. No default account exists. SMTP is optional for local work: inquiries persist even if notification is unavailable. Production requires a persistent server, HTTPS, storage, a configured administrator and a verified email delivery test.

Run `npm run backup` to back up the database, private attachments and public media. Keep copies off the application host. Database and uploads are excluded from Git.

Business facts and proposed commercial terms: [business decisions](docs/BUSINESS_DECISIONS.md). Historical certificates are not presented as current certification.

## Cloud workflow

Reuse `/workspace/my-b2b-website`; no additional worktree is necessary. Restart the server in each cloud task. Run functional tests and validate HTML, browser assets and `/health` locally. Development readiness does not mean the public domain has been deployed.
