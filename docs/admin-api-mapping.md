# Admin API mapping

Reviewed 2026-10-12 against https://documenter.getpostman.com/view/18720296/2sBY4Mt1Fp.
Collection retrieved directly from the Postman documenter gateway. Paths below
are from the published requests, not guesses from the previous caleb API.

## Current authorization agreement

Backend developer says the documented admin endpoints currently work without auth.
`ADMIN_AUTH_ENABLED` defaults to false: dashboard/read proxies do not require a
cookie and do not forward stale bearer tokens. This is NOT a secure public admin
deployment. Restrict the app AND backend with private access controls until
backend authentication/authorization is implemented. Frontend gating alone cannot
protect publicly reachable backend routes.

Login UI is prepared at `/login`, with credentials disabled in no-auth mode and a
link to the dashboard. No fake credentials, token or successful login is generated.
Admin write proxies remain blocked without auth; coupon creation is not wired yet.

## Documented endpoints

| UI / purpose | Backend method and path | Parameters / response |
| --- | --- | --- |
| Merchant growth chart | GET /admin/overview/merchant-growth | year; data.chartData and data.momGrowth |
| Signup chart | GET /admin/overview/signups | year; data.chartData |
| Retention chart | GET /admin/overview/retention | year and month (1-12); data.chartData; monthly active merchants |
| Users | GET /admin/users/list (in request description) | search/country; merchantName, storesCount; nested pagination |
| Orders | GET /admin/orders/list | data.data rows and data.meta |
| Transactions | GET /admin/transactions/list | status=Successful example; nested rows/meta |
| Deliveries | GET /admin/deliveries/list | page=2&limit=40 example; no saved response |
| Finance cards | GET /admin/finance/metrics | range=7d/30d/90d/12m; four objects with amount/trend |
| Gateway share | GET /admin/finance/gateway-volume | range=30d; data array of name/percentage |
| Create coupon | POST /api/coupon/create | startDate, expiryDate, usageLimit, amount; storeId commented in example |
| List coupons | GET, URL blank in published request | data array of coupons |
| Validate coupon | POST /api/coupon/validate | storeId, code |

Coupons inherit `x-internal-secret` authentication in the docs; this is a server
secret, never an admin user's password or a client-side credential. Other folders
do not configure Postman's auth field, but request descriptions mention Bearer JWTs.
The backend developer's current no-auth instruction takes precedence for this
integration; confirm this documentation inconsistency before enabling auth.

## Mapping implemented in this pass

`lib/admin-endpoints.ts` maps existing BFF users/orders/transactions/deliveries to `/list`.
It also maps individual metric routes and new overview/finance metric BFF routes.
`normalizeAdminEnvelope` converts `{data:{data:[],meta:{totalCount,currentPage,
pageCount,...}}}` to the existing UI `{data:[],meta:{total,page,lastPage,...}}`.
Chart payloads remain unchanged, including momGrowth. No guessed aggregate metrics.
Undocumented routes return 501 rather than making guessed upstream requests.

Overview now requests three separate charts, with a shared year selector and
retention-only month selector. All years/months omits the corresponding parameter.
Finance cards and gateway share both refresh with range=7d/30d/90d/12m, not from/to.
The UI uses the backend momGrowth and trend, without claiming an undocumented
comparison period for finance. Retention is labelled active merchants, not a rate.
One-point charts render; empty/zero/error data never falls back to sample metrics.
Requests are cancelled on filter changes and stale responses ignored.
Orders use channel, deliveries use provider, users use country and transactions
use status. User rows map merchantName and storesCount to existing table columns.

## Pending integration

- Confirm delivery fields; then verify its table adapter against an actual response.
- Overview KPI cards, channel mix and top stores have no documented endpoint;
  unavailable data is not fabricated or derived from unrelated charts.
- No finance revenue-trend, wallet balance or settlement account endpoint exists
  in this collection. Platform revenue is not presented as a wallet balance.
- Stores, subscriptions, invoices, staff, support and audit endpoints are not in
  this collection. Keep outstanding local staff changes separate from this work.
- Overview, finance and the four mapped list pages now use loading/error/empty
  states without sample fallback. Other, undocumented pages still need integration.
- Confirm what merchant growth, retention, markup fees and pending settlements
  actually measure, including currency and percentage conventions.

## Future login contract to confirm

The local API caleb branch has POST `/auth/admin/login` with `{email,password}`
and GET `/auth/admin/me` with Bearer authentication. The published docs do NOT
establish deployment of either endpoint. Prepared login uses only these dedicated
admin routes and checks `/me` before issuing an HttpOnly, SameSite=Lax cookie.
It never falls back to vendor login. `/me` currently expects id and role=admin.
Change the adapter if the agreed backend role/session contract differs.

Before enabling ADMIN_AUTH_ENABLED=true: confirm endpoints, create the first admin,
confirm roles/permissions, session expiry/revocation/refresh, password recovery,
rate limiting and MFA policy. Backend must protect every admin endpoint itself.
Logout clears the frontend cookie today; server token revocation is still required
if supported by the agreed backend session design.

## Configuration and testing

Set ADMIN_API_BASE_URL to the backend origin (no /admin suffix). No hardcoded live
fallback. INTERNAL_SECRET is server-only and only needed for contracts requiring it.
Do not use production credentials to test this implementation.
Auth tests use mocked fetch to verify missing routes, rejected credentials,
non-admin profiles, malformed responses and valid login/session exchange.
No real account login, deployed auth validation or live write was performed.
