# Production DNS investigation

Investigation date: 2026-09-27

No DNS, Cloudflare, Namecheap, EasyPanel, or application configuration was changed during this investigation.

## Summary

The Cloudflare zone for `melssy.beauty` exists and already contains records that route the storefront and API to the live EasyPanel server at `82.112.253.136`. Direct requests to that IP with the production hostnames succeed.

Public DNS is not currently delegated to that Cloudflare zone. Both Google Public DNS (`8.8.8.8`) and Cloudflare's resolver (`1.1.1.1`) return Namecheap nameservers instead of the intended Cloudflare nameservers. As a result, all three public hostnames resolve to Namecheap's `198.54.117.242` address rather than the EasyPanel server.

The required correction is at the registrar/registry nameserver-delegation layer. The public delegation must be restored to:

- `adam.ns.cloudflare.com`
- `elaine.ns.cloudflare.com`

The existing Cloudflare DNS records do not need to be recreated based on the evidence below.

## Cloudflare project evidence

Direct authoritative queries to both `adam.ns.cloudflare.com` and `elaine.ns.cloudflare.com` return a valid `melssy.beauty` zone with SOA serial `2415882690` and these records:

| Hostname | Record | Value |
| --- | --- | --- |
| `melssy.beauty` | A | `82.112.253.136` |
| `www.melssy.beauty` | CNAME | `melssy.beauty` |
| `api.melssy.beauty` | A | `82.112.253.136` |

No Cloudflare API token/key variable, account ID, zone ID, Wrangler configuration, or Cloudflare automation is present in the tracked repository or the local environment files inspected. The repository therefore does not identify which Cloudflare account owns the zone.

## Expected deployment routing

The repository expects:

- `https://melssy.beauty` to serve the Next.js storefront.
- `https://www.melssy.beauty` to reach the same storefront.
- `https://api.melssy.beauty` to serve the FastAPI backend.
- The frontend's server-side `API_PROXY_TARGET` to use `https://api.melssy.beauty` in the documented EasyPanel configuration.
- The backend CORS origin to allow `https://melssy.beauty`.

Relevant repository files are `easypanel-frontend.txt`, `easypanel-backend.txt`, `frontend/.env.example`, `backend/.env.example`, and `docs/04-technical-architecture.md`.

## EasyPanel destination

The intended public EasyPanel server address is `82.112.253.136`. Its reverse DNS name is `srv1972204.hstgr.cloud`.

This was verified without changing DNS by forcing HTTPS requests to that IP while preserving each production hostname:

- `melssy.beauty/` returned a Next.js `307` redirect to `/rituel`.
- `www.melssy.beauty/` returned the same Next.js `307` redirect.
- `api.melssy.beauty/health` returned HTTP `200` and `{"status":"ok","database":"postgresql"}` from Uvicorn.

This confirms that the EasyPanel frontend, backend, TLS routing, and database health endpoint are operational at the address already stored in Cloudflare.

## Current public DNS

System DNS, Cloudflare resolver `1.1.1.1`, and Google resolver `8.8.8.8` were queried.

| Hostname | Current public A result |
| --- | --- |
| `melssy.beauty` | `198.54.117.242` |
| `www.melssy.beauty` | `198.54.117.242` |
| `api.melssy.beauty` | `198.54.117.242` |

The IPv6-looking system results (`64:ff9b::c636:75f2`) are DNS64 representations of the same IPv4 address, not independently configured production AAAA records.

Public resolvers currently report these nameservers and SOA authority:

- `failed-whois-verification.namecheap.com`
- `verify-contact-details.namecheap.com`
- SOA primary: `verify-contact-details.namecheap.com`

That public delegation conflicts with the intended Cloudflare delegation even if the Namecheap account UI currently displays the Cloudflare nameservers.

## Setup and migration history

No committed note records who created the Cloudflare zone, when the nameservers were changed, or whether a DNS migration was performed. Git history contains no `cloudflare`, `adam.ns.cloudflare.com`, or `elaine.ns.cloudflare.com` setup entry.

The public domain contracts were committed by Yassine El Fiddi in the deployment/application preparation history, but those commits do not contain Cloudflare account ownership or DNS setup details.

## Exact correction to review

1. In Namecheap, ensure the registrar-level nameserver setting for `melssy.beauty` is saved as Custom DNS with exactly `adam.ns.cloudflare.com` and `elaine.ns.cloudflare.com`.
2. If Namecheap already displays those values, contact Namecheap support and ask them to restore/publish the registry delegation because public resolvers still receive Namecheap's verification nameservers. Include the public NS results above.
3. After the delegation is corrected, verify that public NS queries return the two Cloudflare nameservers and that the three hostnames resolve through the existing Cloudflare zone.
4. Then verify `https://melssy.beauty/` and `https://api.melssy.beauty/health` normally, without an IP override.

No Cloudflare DNS-record addition is currently indicated. The existing zone already has the correct apex, `www`, and `api` records pointing to the verified EasyPanel destination.