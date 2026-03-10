# Quality Control Audit Protocol

When the `@audit` command is invoked, the AI Agent must verify the following structural compliances against the current codebase:

## 1. The 3-Layer Mandate Check
- [ ] Do all business rules and architectures reside in `directives/`?
- [ ] Are all deterministic helper scripts or batch jobs located in `execution/`?

## 2. Technology & Type Safety Check
- [ ] Is the frontend framework Next.js utilizing the App Router?
- [ ] Are all frontend components utilizing Strict TypeScript (`.tsx`, `.ts`) with zero `any` usage?
- [ ] Are all server-side data mutations using Zod for payload validation before hitting Supabase?

## 3. Self-Annealing Loop Check
- [ ] If terminal errors occurred during the session, were they documented back into a `directives/` SOP to prevent recurrence?

## 4. UI/UX Excellence
- [ ] Does the UI strictly utilize Tailwind CSS?
- [ ] Are accessible UI primitives (Radix) successfully integrated via `components/ui/`?
