# B2B company website starter

A responsive English-language B2B website built with Vite and vanilla JavaScript. Includes product categories, an about section, a sourcing process and an inquiry download form. No paid service, database or secret is needed for local development.

## Development

Use Node.js 22 or newer (the cloud environment was validated with Node.js 24).

```sh
npm ci
npm run dev -- --port 5173
```

## Validation and production build

```sh
npm test
npm run build
npm run preview -- --port 4173
```

The production output is in `dist/` and can be deployed to a static hosting service. Deployment is not configured yet.

## Before publishing the business website

- Replace `YOUR BRAND` and the example copy in `src/main.js` and metadata in `index.html` with approved company details.
- Replace illustrative shapes and example categories with real product images and specifications.
- Add verified contact details, legal information and applicable privacy disclosures.
- Connect a real inquiry delivery service and verify delivery before presenting the form as a submission form.

Currently the inquiry form only downloads a local text file. It does not send or store inquiries on a server. No certification, manufacturing capacity or shipping claims are made by this starter. The interface is English for an international B2B starting point; business details and additional languages await confirmation.

## Cloud workflow

Each cloud task is already isolated. Reuse the existing checkout; do not create a Git worktree unless explicitly requested. Dependencies and build output can persist, but development server processes must be restarted in a new task. Start Vite from the repository directory and verify both the page and its JavaScript assets with local HTTP requests. Do not commit `.env` files or credentials.
