# EffectiveCRM Architecture (Church Module)

## Overview
This application follows the **QUANTDEV MASTER DNA** 3-Layer Mandate.
It is built on a Next.js (App Router, Strict TypeScript) foundation backed by a Supabase (PostgreSQL) backend.

1. **Layer 1 (Directive):** `directives/*.md`
   - Defines standard operating procedures, architectural decisions, and auditing frameworks.
   - The "Strategic Brain" of the CRM.

2. **Layer 2 (Orchestration):** AI Agent Workspace
   - The agent operates across the Next.js framework, calling `execution/` scripts and utilizing server schemas to ensure error-free operation.

3. **Layer 3 (Execution):** `execution/` & Next.js Server Actions
   - Deterministic execution tasks (like `seed_db.py`).
   - Server-side data mutations via Next.js strictly typed Server Actions (connecting directly to Supabase via `@supabase/ssr`).

## Tech Stack
- Frontend: Next.js (TypeScript, App Router)
- Styling: Tailwind CSS, Shadcn UI / Radix primitives
- Database & Auth: Supabase (PostgreSQL, Supabase Auth)
- Data Validation: Zod
