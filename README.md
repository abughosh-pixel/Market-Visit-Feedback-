# Fine Market Visits

A responsive market visit survey based on the supplied Market Visit Report. Visitors record visit details, conditional salesperson evaluations, Availability, Presence, Activation, Pricing and Quality observations, leads, store owner feedback and conclusions. Optional recommendations and follow-up priority help reviewers act on a visit.

## Working application

https://fine-market-visits.ali20190704.chatgpt.site

The initial deployment is private for owner review. Visitor access must be configured on the hosting service before distributing it to employees. GitHub holds application source; responses and photos are stored separately in the hosted D1 database and R2 bucket. GitHub Pages alone cannot run the API or collect uploads.

## Features

- Five-step form with required and conditional fields and a review screen.
- Photo previews, removal and browser-side JPEG resizing; 3 photos per topic, 12 per report, 20 MB combined after processing. JPG, PNG and WebP source files are supported. HEIC is not supported.
- Reports are acknowledged only after database storage succeeds; unique submission IDs prevent duplicate reports on retry.
- Explicit session-only text draft saving. Photos must be reattached after a reload; closing the tab may remove the draft.
- Password-protected response workspace, country/priority/search filters, report details, private photo viewing and CSV export with spreadsheet formula escaping.
- The latest 2,000 reports are loaded into the workspace. Exports include the loaded, filtered set and the interface flags truncation.

## Runtime

Built with React and Vinext on Cloudflare Workers. Configure the `DB` D1 binding, `BUCKET` R2 binding and secret `ADMIN_PASSWORD` through hosting. The workspace password is not included in the repository. Do not expose these secrets in browser code or GitHub Pages.

Use Node 22.13 or newer. Install dependencies with the supplied setup helper, run `pnpm dev` for local development and use `pnpm build` for the production build. See the existing `scripts/` helpers for Sites publication and local environment configuration. Copy `.openai/hosting.example.json` to `.openai/hosting.json` and set the assigned project ID when configuring a separate checkout. Production schema is in `db/schema.ts`; generated migrations are in `drizzle/`. Apply migrations before serving requests.

The local runtime may use `.dev.vars` for `ADMIN_PASSWORD`. Environment files are ignored and must never be committed. Initial access is owner-private. Before expanding access, review the hosting audience and use a strong workspace password. Do not post visit reports, employee evaluations or store photos as GitHub issues or repository files.

## Validation

Production build and TypeScript checks. Endpoint tests cover required and conditional data, date/time validation, image signatures, photo storage/readback, duplicate submission retries, cleanup after a failed insert, admin authentication and private report/photo access. Endpoint tests use storage mocks. The local D1 schema was also applied successfully. Desktop visual inspection and part of the form flow were checked in browser; browser credential protection interrupted further browser automation.
