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

## Public catalog routes (one-time Access bypass)

The Worker hostname is behind a Cloudflare Access application. The
`/public/*` routes are intended to be reachable without a login. To make
that work, add a second Access application that explicitly **bypasses**
those paths:

1. CF dashboard → **Zero Trust** → **Access** → **Applications** → **Add an application** → **Self-hosted**
2. Application name: `command-block-api public`
3. Application domain:
   - Subdomain: `command-block-api`
   - Domain: `colbysthickey.workers.dev`
   - Path: `public`
4. **Next** → policy step → **Add a policy**:
   - Policy name: `bypass`
   - Action: **Bypass**
   - Selector: **Everyone** (Include → Everyone)
5. Save the policy, then save the application.

Verify with:

```
curl -i https://command-block-api.colbysthickey.workers.dev/public/plugins
```

Should return `HTTP/2 200` with a JSON array, not a redirect to
`cloudflareaccess.com`.
