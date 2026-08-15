# HAUS OF INDIA - Project Rules & Deployment Guidelines

## Hostinger Web Hosting Deployment Rules

### 1. Hostinger Node.js & Next.js Setup
- **Node.js Environment**: Deployed on Hostinger Node.js Application Manager (Node `20.x` / `22.x`).
- **Entry Point**: `server.js` at project root (forwards execution to `.next/standalone/server.js`).
- **Next Config**: [next.config.ts](file:///d:/WEBSITE/hoi%20website/next.config.ts) must maintain `output: "standalone"`.

---

### 2. Database & Prisma (SQLite) Rules
- **Prisma Schema**: [prisma/schema.prisma](file:///d:/WEBSITE/hoi%20website/prisma/schema.prisma) must include Linux binary targets:
  `binaryTargets = ["native", "debian-openssl-3.0.x", "rhel-openssl-3.0.x", "linux-musl-openssl-3.0.x", "debian-openssl-1.1.x"]`
- **Database Path**: Database file is located at [prisma/dev.db](file:///d:/WEBSITE/hoi%20website/prisma/dev.db).
- **Prisma Client Normalization**: [src/lib/prisma.ts](file:///d:/WEBSITE/hoi%20website/src/lib/prisma.ts) automatically normalizes `DATABASE_URL` so SQLite paths resolve correctly relative to `schema.prisma`.

---

### 3. Pre-Build Permissions & Standalone Build Hooks
- **Build Script in [package.json](file:///d:/WEBSITE/hoi%20website/package.json)**:
  `"build": "node scripts/fix-permissions.js && prisma generate && next build"`
- **Pre-Build Permission Fixer**: [scripts/fix-permissions.js](file:///d:/WEBSITE/hoi%20website/scripts/fix-permissions.js) recursively applies POSIX `0755` permissions to `src/app/api/auth`, `src/app/api/admin`, `public/`, `prisma/`, and `scripts/` before build to prevent Hostinger `EACCES: permission denied` build errors.
- **Post-Build Asset Bundling**: [scripts/copy-standalone-assets.js](file:///d:/WEBSITE/hoi%20website/scripts/copy-standalone-assets.js) copies `public/`, `.next/static/`, and `prisma/` into `.next/standalone/` post-build.

---

### 4. Environment Variables Reference
- `NEXTAUTH_URL`: `https://hausofindia.com`
- `NEXT_PUBLIC_BASE_URL`: `https://hausofindia.com`
- `DATABASE_URL`: `file:./prisma/dev.db`
- `NEXTAUTH_SECRET`: Set in environment
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Set in environment
- `PAYU_MERCHANT_KEY` & `PAYU_MERCHANT_SALT` & `PAYU_ENV`: Set in environment

---

### 5. Route Integrity
- Every folder under `src/app/api/` must contain a valid `route.ts` (never leave empty API route directories).
