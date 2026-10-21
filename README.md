# Fine Market Visits

A responsive market visit survey based on the supplied Market Visit Report. Visitors record visit details, conditional salesperson evaluations, Availability, Presence, Activation, Pricing and Quality observations, leads, store owner feedback and conclusions. Optional recommendations and follow-up priority help reviewers act on a visit.

## Working application

https://fine-market-visits.ali20190704.chatgpt.site

The hosted entry page requires ChatGPT sign-in. The survey is restricted server-side to verified accounts whose email domain is exactly `finehh.com` or `nuqulgroup.com`. The verified site owner retains access as an administrative exception. Users need a ChatGPT account using their work email; this is not Microsoft Entra SSO. A typed email address is never accepted as proof of identity.

GitHub holds application source. Responses and photos are stored separately in hosted D1 and R2 storage; they are never committed to the public repository. The owner-only response workspace is at `/workspace` and requires both the verified owner account and a separate workspace password.

## Features

- Five-step form with required visitor details and explicit salesperson accompaniment selection. All other responses, 1–5 salesperson ratings and photos are optional. Skipped ratings stay blank, never zero.
- Photo previews, removal and browser-side JPEG resizing; 3 photos per topic, 12 per report, 20 MB combined after processing. JPG, PNG and WebP source files are supported. HEIC is not supported.
- Reports are acknowledged only after database storage succeeds. A submission fingerprint covers answers and files: identical retries are deduplicated, while changed submissions using a saved reference are rejected. If a database acknowledgement is lost after commit, the saved record and its referenced photos are retained.
- Explicit session-only text draft saving, isolated by verified account. Photos must be reattached after a reload; closing the tab may remove the draft.
- Owner-identity and password-protected response workspace, country/priority/search filters, report details and private photo viewing. CSV export includes every answer, verified submitter email, numeric ratings, UTC submission timestamp, local visit date, and photo links. UTF-8 BOM supports Arabic in Excel; spreadsheet formulas are escaped. JSON preserves the saved values without spreadsheet escaping. All responses and filtered CSV exports are labelled separately.
- Workspace loading and exports use stable, snapshot-based pagination with verified row counts. Complete exports have no 2,000-row cutoff. Photo links require owner authentication and the workspace cookie; downloading a CSV does not make the photos public.

## Runtime

Built with React and Vinext on Cloudflare Workers. Configure the `DB` D1 binding, `BUCKET` R2 binding and secrets `ADMIN_PASSWORD` and `OWNER_EMAIL` through hosting. The workspace password is not included in the repository. Do not expose these secrets in browser code or GitHub Pages.

Use Node 22.13 or newer. Install dependencies with the supplied setup helper, run `pnpm dev` for local development and use `pnpm build` for the production build. See the existing `scripts/` helpers for Sites publication and local environment configuration. Copy `.openai/hosting.example.json` to `.openai/hosting.json` and set the assigned project ID when configuring a separate checkout. Production schema is in `db/schema.ts`; generated migrations are in `drizzle/`. Apply migrations before serving requests.

The local runtime may use `.dev.vars` for `ADMIN_PASSWORD`. Environment files are ignored and must never be committed. The outer hosting audience can be public because both the survey and its APIs enforce verified domain access, while response and photo APIs enforce owner identity plus the password session. Keep `OWNER_EMAIL` limited to the verified owner. Do not post visit reports, employee evaluations or store photos as GitHub issues or repository files.

## Using the response workspace

Open `/workspace`, sign in with the site owner’s ChatGPT account, and enter the existing workspace password. **All responses · CSV** downloads all saved reports and opens in Excel. **Exact data · JSON** preserves original saved text and structured values. When search or filters are active, **Filtered responses · CSV** exports only matches. CSV includes protected links to each photo grouped by question. Blank cells mean no answer was provided; they are not negative feedback or zero ratings. Use the full reference to reconcile reports across files.

## Validation

Run `node tests/run.mjs`, `node node_modules/typescript/bin/tsc --noEmit`, and the production build. Tests run the actual route/validation/export code against an in-memory SQLite adapter and an R2 storage stub, without contacting production. They cover domain spoof variants, owner-only administration, optional fields, rating bounds, duplicate/conflicting submissions, photo persistence and cleanup, lost database acknowledgements, and complete CSV/JSON exports beyond 2,000 records with filters, Arabic, multiline text, quotes, nulls and spreadsheet formula escaping. The initial local D1 migration was also applied. Browser automation became unavailable due to credential protection; this limits interactive browser verification.
