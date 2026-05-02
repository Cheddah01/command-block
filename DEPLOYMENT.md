# Deployment notes

## Frontend

Hosted on Cloudflare Pages, project name `command-block`. Pushes to `main`
trigger an automatic build (`npm run build`) and publish `dist/`. Public
landing at `https://command-block.pages.dev/`; admin pages at
`https://command-block.pages.dev/ops/*`.

## Cloudflare Access

A self-hosted Access application protects `command-block.pages.dev/ops/*`
using the existing `Admins` policy. The same Access team also gates the
Worker at `command-block-api.colbysthickey.workers.dev`. One GitHub OAuth
login covers both within a session.

## Worker

Source: `github.com/cheddah01/command-block-api`. Pushes to `main` trigger
Cloudflare Workers Builds, which runs `wrangler deploy`. Bindings (R2 FILES,
D1 DB) are declared in `wrangler.toml`.
