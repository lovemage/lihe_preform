# Lihe Preform Website

This project is a Next.js multilingual website with an admin panel for content management.

## Admin Scope

The admin panel supports:

- homepage content management
- product list management
- product detail management
- image upload with automatic `webp` conversion
- Cloudflare R2 media storage
- Cloudflare D1 content storage
- JSON publish output for the existing frontend readers

Current publish locales:

- `en`
- `ru`

Reserved admin locale:

- `es`

## Required Environment Variables

Create `.env.local` and define the following values:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ASSET_HOSTNAME=your-public-r2-domain.example.com

ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
# Optional alternative to ADMIN_PASSWORD
# ADMIN_PASSWORD_HASH=<sha256-hash>
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret

CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_D1_DATABASE_ID=your-d1-database-id
CLOUDFLARE_D1_API_TOKEN=your-d1-api-token

CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
CLOUDFLARE_R2_BUCKET=your-r2-bucket-name
CLOUDFLARE_R2_PUBLIC_BASE_URL=https://your-public-r2-domain.example.com
```

## Cloudflare Resources

You need these Cloudflare resources:

- one **D1** database for content
- one **R2** bucket for media
- one public R2 domain or CDN domain for frontend image access

`wrangler.json` already contains placeholder bindings:

- `CONTENT_DB`
- `CONTENT_MEDIA`

Replace the placeholder database ID and bucket name before deployment.

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open:

- frontend: `http://localhost:3000`
- admin login: `http://localhost:3000/admin/login`

## Admin Authentication

The first implementation uses a single admin account from environment variables:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`

If both `ADMIN_PASSWORD` and `ADMIN_PASSWORD_HASH` are present, `ADMIN_PASSWORD_HASH` takes priority.

## Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
```

### Deployment (Cloudflare Workers)
```bash
npm run deploy           # Quick deploy (preserves secrets)
npm run deploy:safe      # Full deploy with secrets setup
npm run secrets:set      # Configure Cloudflare secrets
npm run secrets:list     # List all configured secrets
npm run cf:build         # Build only (no deploy)
npm run preview          # Local preview
```

⚠️ **Important**: Use `npm run deploy:safe` for first deployment or when updating secrets.
See [DEPLOYMENT_QUICK_GUIDE.md](DEPLOYMENT_QUICK_GUIDE.md) for details.

### Admin Tools
```bash
npm run admin:seed       # Generate admin password hash
npm run content:migrate  # Migrate JSON to D1
npm run media:migrate    # Migrate images to R2
npm run content:publish  # Publish content to JSON
```

## Content Workflow

### 1. Existing JSON to D1

Use the helper script to inspect the current JSON payloads:

```bash
npm run content:migrate
```

This prints the current `home.json` and `products-data.json` structures so they can be imported into D1.

### 2. Existing Images to R2

Use the helper script to generate a legacy image manifest:

```bash
npm run media:migrate
```

This scans `public/images` and prints a migration manifest for R2 upload work.

### 3. Admin Password Hash Helper

```bash
npm run admin:seed
```

This prints a SHA-256 password hash for the configured admin credentials.

### 4. Publish JSON

The current implementation publishes frontend JSON through the authenticated admin API:

- `POST /api/admin/publish`

The output files are:

- `data/en/home.json`
- `data/ru/home.json`
- `data/en/products-data.json`
- `data/ru/products-data.json`

## Notes

- The frontend still reads JSON from `data/<locale>`.
- D1 is the intended authoritative content source.
- R2 is the intended authoritative media source.
- `es` is already reserved in admin data structures and UI tabs, but is not yet published to frontend JSON.
