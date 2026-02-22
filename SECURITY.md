# Security Notes

## Known Issues

### 1. Plunk API Key in Git History

The `.env.example` file previously contained a real Plunk API key. The value has been removed but remains in git history.

**Action required:** Rotate the Plunk API key in the Plunk dashboard.

### 2. Security Headers Middleware

No Next.js `middleware.ts` exists to set security headers. Consider adding:

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (HSTS)

### 3. Rate Limiting

Public API endpoints have no rate limiting. If new public endpoints are added (e.g., contact forms, newsletter signups), consider implementing rate limiting via middleware (e.g., Upstash, Redis-backed).

### 4. Transitive Dependency Vulnerabilities

The following vulnerabilities exist in transitive (indirect) dependencies and cannot be fixed by updating direct dependencies:

- **fast-xml-parser** (critical): Pulled in by `@aws-sdk/client-s3`. Requires AWS SDK major version update or `pnpm.overrides`.
- **hono** (high): Pulled in by `prisma > @prisma/dev`. Dev-only dependency, not used in production runtime.
- **next** (multiple): Pulled in by `apps/mail-preview > @react-email/preview-server`. Dev tool only.

### 5. CI Security Audit

`pnpm audit` is not currently integrated into the CI pipeline. Consider adding it to catch vulnerable dependencies early.

## Reporting Vulnerabilities

If you discover a security vulnerability, please open a private issue or contact the maintainers directly.
