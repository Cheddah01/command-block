# Deployment notes

## After every push

GitHub Actions (`.github/workflows/deploy.yml`) builds the site to `dist/`
and publishes it to GitHub Pages at https://cheddah01.github.io/command-block/.
No manual step needed for normal deploys.

## Cloudflare Access on /ops/*

After the first deploy of the new public/ops split, **add a Cloudflare Access
self-hosted application protecting `cheddah01.github.io/command-block/ops/*`
using the existing `Admins` policy.**

> ⚠️ **Important — this likely won't work as-is.** Cloudflare Access can only
> protect hostnames that are either (a) zones on your Cloudflare account, or
> (b) `*.pages.dev` hostnames on Cloudflare Pages. `cheddah01.github.io` is a
> github.io subdomain owned by GitHub, so you cannot add it as a zone — which
> means CF Access cannot directly gate the static admin pages there.
>
> Until this is resolved, the `/ops/*` HTML pages are **publicly readable**.
> The Worker that serves the actual data IS still behind Access, so without
> a valid Cloudflare Access cookie the pages render empty (API calls fail).
> But anyone can see the page shell and JS source.
>
> ### Two ways to actually gate /ops/*
>
> 1. **Custom domain on Cloudflare** — add a domain you own (e.g.
>    `ops.cheddah.dev`) on Cloudflare, CNAME it to `cheddah01.github.io`,
>    set the GitHub Pages custom domain in repo settings, then add the
>    Access application on `your-domain/command-block/ops/*`.
>
> 2. **Move frontend to Cloudflare Pages** — connect this repo to Cloudflare
>    Pages instead of GitHub Pages. The site is then served from a hostname
>    on Cloudflare, where CF Access policies work directly.
