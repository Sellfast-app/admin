# Swiftree Admin — API Endpoint Documentation

This document explains how the admin dashboard talks to the Swiftree backend,
how to access the endpoints locally and in production, and what the backend
team still needs to implement.

---

## 1. How the API layer works

The admin app **never talks to the database directly**. Every dashboard feature
goes through a Next.js server route inside this app (`app/api/admin/*`), which:

1. **Checks the admin session cookie** (`admin_token`, httpOnly). No cookie → `401`.
2. **Forwards the request** to the Swiftree backend at `ADMIN_API_BASE_URL`,
   mapping `/api/admin/<path>` → `<base>/admin/<path>`, preserving query strings.
3. **Attaches credentials**: `Authorization: Bearer <admin_token>` and, when
   configured, `X-Internal-Secret: <INTERNAL_SECRET>` (same secret the vendor
   app already uses for server-to-server calls).
4. **Normalizes the response** to `{ status, message, data }` and passes
   upstream HTTP status codes through unchanged.

```
Browser ──fetch──▶ /api/admin/users          (this app, server-side)
                      │  checks admin_token cookie
                      ▼
                  {ADMIN_API_BASE_URL}/admin/users?page=1
                      │  Bearer token + X-Internal-Secret
                      ▼
                  Swiftree backend  ──▶ response normalized to {status, message, data}
```

This is the same Backends-for-Frontends pattern the vendor dashboard uses, so
no existing vendor/storefront flow is touched by this app.

---

## 2. Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `ADMIN_API_BASE_URL` | Yes | Base URL of the Swiftree backend. Staging: `https://staging.swiftree.app`, production: `https://api.swiftree.app` (confirm with backend). |
| `INTERNAL_SECRET` | Recommended | Shared server-to-server secret. Use the **same value as the vendor app** so the backend can trust the caller. |
| `NEXT_PUBLIC_API_BASE_URL` | Fallback | Only used if `ADMIN_API_BASE_URL` is unset (kept for parity with the vendor app). |

> `.env*` files are gitignored on purpose — never commit real secrets.
> `.env.example` is committed as the template.

---

## 3. Authentication flow

### `POST /api/admin/auth/login`

```bash
curl -X POST https://<admin-host>/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@swiftree.app","password":"••••••••"}' \
  -c cookies.txt
```

**Success `200`:**
```json
{ "status": "success", "message": "Login successful", "data": { "user": { "email": "...", "role": "admin" } } }
```

The response also sets an httpOnly `admin_token` cookie (24h expiry) that
authenticates every other admin call — browsers handle this automatically;
`curl` users should pass `-c cookies.txt` on login and `-b cookies.txt` after.

**Errors:** `400` missing fields · `401` invalid credentials · `403` account
exists but has no admin role · `502/504` backend unreachable/timed out.

**How roles are enforced:** the route first tries the dedicated
`/auth/admin/login` backend endpoint. If that route does not exist yet, it
falls back to the standard `/auth/login` contract and **rejects the login
unless the account's `role` contains "admin"**. Real authorization always
happens on the backend — this layer only gates the door.

### `GET /api/admin/auth/me`

Validates the current session against the backend and returns the admin
profile. `401` clears the cookie.

### `POST /api/admin/auth/logout`

Clears the session cookie.

---

## 4. Endpoint reference

All endpoints below require the `admin_token` cookie (except login).
`GET` unless stated otherwise.

| Frontend endpoint | Upstream backend endpoint | Query params | Used by |
|---|---|---|---|
| `/api/admin/metrics/overview` | `/admin/metrics/overview` | `period=7d\|30d\|90d\|12m` | Overview stat cards |
| `/api/admin/metrics/{signups\|retention\|growth\|channels}` | `/admin/metrics/{...}` | `granularity=day\|week\|month`, `period` | Overview charts |
| `/api/admin/users` | `/admin/users` | `page, limit, search, status, country` | Users page |
| `/api/admin/users/{userId}` | `/admin/users/{userId}` | — | User detail (future) |
| `/api/admin/stores` | `/admin/stores` | `page, limit, search, country, plan` | Store drilldown |
| `/api/admin/orders` | `/admin/orders` | `page, limit, status, channel, store, from, to` | Orders page |
| `/api/admin/transactions` | `/admin/transactions` | `page, limit, gateway, status, from, to` | Transactions page |
| `/api/admin/deliveries` | `/admin/deliveries` | `page, limit, provider, status` | Deliveries page |
| `/api/admin/finance/summary` | `/admin/finance/summary` | `period` | Finance page |
| `/api/admin/subscriptions` | `/admin/subscriptions` | `page, limit, plan, status` | Subscriptions page |
| `/api/admin/support/tickets` | `/admin/support/tickets` | `page, limit, status, priority` | Support page |
| `/api/admin/audit-log` | `/admin/audit-log` | `page, limit, module, staffId, from, to` | Audit ledger (PRD 5.2) |

**Standard list contract** (please implement consistently, backend team):

```
GET ...?page=1&limit=20&search=&status=&from=&to=&sort=
→ 200 { "status": "success", "data": [ ...rows ],
        "meta": { "total": 123, "page": 1, "lastPage": 7 } }
```

**Split-payment note (PRD 2.3):** every transaction row should include
`vendorAmount` and `platformFee` (₦500 markup + transaction %) alongside the
total, so the admin Finance view can reconcile without extra calls.

**Audit note (PRD 5.2):** every admin **write** action on the backend must append
an entry (timestamp, staffId, staffName, actionType, module, ipAddress,
beforeState, afterState) to the immutable ledger exposed at `/admin/audit-log`.

---

## 5. Accessing the endpoints

### Local development

```bash
cd admin
cp .env.example .env          # fill in ADMIN_API_BASE_URL + INTERNAL_SECRET
npm install
npm run dev                   # http://localhost:3000 (or :3001 if occupied)
```

Then:

```bash
# 1. Log in and store the session cookie
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@swiftree.app","password":"your-password"}' \
  -c cookies.txt

# 2. Call any endpoint with the cookie
curl -b cookies.txt "http://localhost:3000/api/admin/users?page=1&limit=20"
```

### Production / staging

1. Deploy the `admin` app (Vercel or equivalent — it is a standard Next.js app).
2. Set `ADMIN_API_BASE_URL` and `INTERNAL_SECRET` in the hosting env settings.
3. Hit `https://<admin-host>/api/admin/auth/login` as above; the cookie is set
   for that host (`secure` in production, httpOnly, SameSite=Lax).

### Expected error responses (uniform across all endpoints)

```json
{ "status": "error", "message": "Admin authentication required", "data": null }   // 401, no/invalid session
{ "status": "error", "message": "ADMIN_API_BASE_URL is not configured ...", "data": null }  // 503
{ "status": "error", "message": "Upstream error 404 ...", "data": null }          // passthrough from backend
{ "status": "error", "message": "Upstream request timed out", "data": null }      // 504
```

> `504`/`502` from a list endpoint usually means the backend route does not
> exist yet (see §6) or `ADMIN_API_BASE_URL` points at the wrong host.

---

## 6. Implementation status

| Layer | Status |
|---|---|
| Admin proxy routes (this app) | ✅ Live — all 12 endpoints forwarding + auth gating |
| Auth (login/logout/me) | ✅ Live — works today via the vendor `/auth/login` contract with role check; upgrades automatically to `/auth/admin/login` when the backend ships it |
| `/admin/*` backend endpoints | ⏳ **Not implemented yet by the backend team.** Until then, authenticated calls return the backend's 404 and the UI keeps using its mock data (`lib/admin-data.ts`). |
| Admin role on existing accounts | ⏳ Backend must either add a role claim or a dedicated admin login route. |

**No existing flow was modified:** this work is entirely inside the `admin`
app — the vendor dashboard, storefront, and all shared backend vendor routes
are untouched.
