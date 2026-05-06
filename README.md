# QuantumShield MVP

A working Next.js MVP for a **Post-Quantum Readiness Scanner**.

## What is included

- Phase 1: Real domain scanner API
- Phase 2: Scanner UI connected to `/api/scan`
- Phase 3: TLS, certificate, security headers, SPF/DMARC checks
- Phase 4: Post-quantum migration scoring and recommendations
- Phase 5: Report UI with executive summary and 30/60/90 roadmap
- Phase 6: Optional Supabase saving of scans and saved report URLs
- Basic tests for domain cleaning, validation, demo scan, and scoring

## Important honesty note

This MVP does **not** prove a company is quantum-safe. It performs a public-facing cryptographic posture scan and estimates post-quantum migration readiness. True PQC TLS detection requires a deeper client probe with PQ-capable OpenSSL/BoringSSL or browser telemetry.

## Run locally

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Optional Supabase setup

1. Create a Supabase project.
2. Run `supabase-schema.sql` in the SQL editor.
3. Copy `.env.example` to `.env.local`.
4. Add:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The scanner works without Supabase. Without Supabase, scans are shown in the UI but not permanently saved.

## Tests

```bash
npm test
```

## Deploy

Recommended:

- Vercel for frontend and API routes
- Supabase for database

Note: Some hosting providers restrict raw TLS socket behavior. If TLS scanning fails on Vercel, move scan functions to a small Node/FastAPI backend on Render, Fly.io, Railway, or an EC2 instance.
