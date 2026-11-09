---
name: app-security-specialist
description: Security auditing, Row Level Security (RLS) enforcement, API key protection, session management, and privacy compliance for LUNARA.
---

# LUNARA App Security Specialist Skill

## Overview & PRD Alignment
This skill is dedicated to protecting user financial data, enforcing Row Level Security (RLS), preventing credential leakage, and securing mobile authentication sessions for **LUNARA** as defined in `docs/LUNARA_PRD.md` (Sections 10, 14, 17).

Personal finance applications hold sensitive user information. Security is treated as a core operational requirement, not an afterthought.

---

## 1. Zero-Trust Supabase Key Policy (PRD §10)

> [!CAUTION]
> **Service Role Key Exposure Prohibition**:
> - The Supabase **`service_role` key must NEVER exist** in the React Native / Expo application codebase, `.env` file packaged for the client, Git repository, or client bundles.
> - The mobile application must ONLY use the **`anon` public key** (`EXPO_PUBLIC_SUPABASE_ANON_KEY`).
> - The `anon` key relies strictly on PostgreSQL Row Level Security (RLS) to enforce access control.
> - Any privileged administrative tasks or service-level operations must execute inside Supabase Edge Functions with backend environment variables.

---

## 2. Row Level Security (RLS) Audit Checklist

Every PostgreSQL table in the LUNARA database must pass this security checklist before release:

1. **RLS Enabled**:
   ```sql
   ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;
   ALTER TABLE <table_name> FORCE ROW LEVEL SECURITY;
   ```
2. **Explicit Policies for All 4 Operations**:
   - `SELECT`: `USING (auth.uid() = user_id)`
   - `INSERT`: `WITH CHECK (auth.uid() = user_id)`
   - `UPDATE`: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
   - `DELETE`: `USING (auth.uid() = user_id)`
3. **No Default Public Access**:
   - Revoke default public permissions on tables where applicable:
   ```sql
   REVOKE ALL ON TABLE public.transactions FROM anon;
   GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.transactions TO authenticated;
   ```
4. **Relational Leakage Prevention**:
   - Ensure joins (e.g., `transactions` joining `categories`) cannot leak another user's categories or records.

---

## 3. Client-Side Security & Session Storage

1. **Session Persistence**:
   - Store Supabase auth tokens using `@react-native-async-storage/async-storage` or `expo-secure-store` for sensitive biometric tokens.
   - Configure automatic token refresh: `autoRefreshToken: true`.
2. **Protected Route Enforcers**:
   - Ensure root layout (`app/_layout.js` or React Navigation wrapper) validates session state before rendering protected screens. Unauthenticated requests must redirect to `(auth)/login`.
3. **Logging Sanitation**:
   - Never log passwords, tokens, full transaction payloads, or personally identifiable information (PII) to `console.log`.
   - Strip sensitive tokens in error handlers before display:
   ```javascript
   export function sanitizeErrorMessage(error) {
     if (!error) return 'An unexpected error occurred.';
     // Strip potential internal database schema details or stack traces
     if (error.message?.includes('JWT') || error.message?.includes('token')) {
       return 'Your session has expired. Please sign in again.';
     }
     return error.message || 'An unexpected error occurred.';
   }
   ```

---

## 4. User Account Deletion & GDPR / Privacy (PRD §6.11, §10)

- Users must have a straightforward mechanism to request account deletion.
- When an account is deleted from `auth.users`:
  - Cascading deletes must purge associated records (`profiles`, `transactions`, `budgets`, `categories`, `savings_goals`, `savings_contributions`) to prevent orphaned user financial records.

---

## 5. Collaboration Checklist
- Audit SQL scripts produced by `supabase-backend-specialist`.
- Review forms and input validation implemented by `react-native-expo-developer`.
- Collaborate with `lunara-testing-qa` on RLS penetration tests (e.g. attempting to read User B's records with User A's token).

