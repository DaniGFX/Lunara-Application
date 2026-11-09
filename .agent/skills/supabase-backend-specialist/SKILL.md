---
name: supabase-backend-specialist
description: Expert guidance for Supabase and PostgreSQL database architecture, schema migrations, Row Level Security (RLS), authentication, and Supabase JS SDK integration.
---

# LUNARA Supabase Backend Specialist Skill

## Overview & PRD Alignment
This skill governs the database design, SQL migrations, Row Level Security (RLS) policies, authentication workflows, and client SDK configuration for **LUNARA** as defined in `docs/LUNARA_PRD.md` (Sections 4, 6.1, 8, 10).

All data architecture must ensure strict user data isolation, exact monetary precision, and referential integrity.

---

## 1. Database Architecture & Schema Standards

### Monetary Precision Rule (PRD §8.2)
- **Always use `NUMERIC(12, 2)`** for monetary values (`amount`, `total_limit`, `target_amount`, etc.).
- **Never use `FLOAT`, `DOUBLE PRECISION`, or `REAL`** to prevent precision loss.
- Enforce check constraints: `CHECK (amount > 0)`.

### Core Tables & Relationships (PRD §8.1)
1. `profiles`: Extends `auth.users` (`id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE`, `full_name TEXT`, `currency VARCHAR(10) DEFAULT 'PHP'`, `created_at TIMESTAMPTZ DEFAULT NOW()`).
2. `categories`: User and system categories (`id UUID`, `user_id UUID REFERENCES auth.users`, `name TEXT NOT NULL`, `type TEXT CHECK (type IN ('income', 'expense'))`, `icon TEXT`, `color TEXT`).
3. `transactions`: Core records (`id UUID`, `user_id UUID REFERENCES auth.users`, `category_id UUID REFERENCES categories ON DELETE RESTRICT`, `type TEXT CHECK (type IN ('income', 'expense'))`, `amount NUMERIC(12,2) NOT NULL CHECK (amount > 0)`, `transaction_date TIMESTAMPTZ NOT NULL`, `note TEXT`).
4. `budgets`: Monthly budgets (`id UUID`, `user_id UUID REFERENCES auth.users`, `name TEXT NOT NULL`, `month VARCHAR(7) NOT NULL` (e.g. `'2026-11'`), `total_limit NUMERIC(12,2) NOT NULL CHECK (total_limit > 0)`).
5. `budget_categories`: Per-category limit within a budget (`id UUID`, `budget_id UUID REFERENCES budgets ON DELETE CASCADE`, `category_id UUID REFERENCES categories ON DELETE RESTRICT`, `limit_amount NUMERIC(12,2) NOT NULL`).
6. `savings_goals`: Target savings (`id UUID`, `user_id UUID REFERENCES auth.users`, `name TEXT NOT NULL`, `target_amount NUMERIC(12,2) NOT NULL`, `target_date DATE`, `status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived'))`).
7. `savings_contributions`: Allocations to goals (`id UUID`, `goal_id UUID REFERENCES savings_goals ON DELETE CASCADE`, `user_id UUID REFERENCES auth.users`, `amount NUMERIC(12,2) NOT NULL CHECK (amount > 0)`, `contribution_date TIMESTAMPTZ DEFAULT NOW()`, `note TEXT`).
8. `recurring_transactions`: Recurring rules (`id UUID`, `user_id UUID REFERENCES auth.users`, `category_id UUID REFERENCES categories`, `type TEXT`, `amount NUMERIC(12,2)`, `frequency TEXT CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'yearly'))`, `start_date DATE`, `next_date DATE`, `status TEXT DEFAULT 'active'`).
9. `notification_settings`: User alert preferences.

---

## 2. Row Level Security (RLS) Policies (PRD §10)

RLS **must be enabled on every table** containing user data. Never deploy a table without RLS.

### Standard RLS Policy Pattern:
```sql
-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Select policy: User can only read their own transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Insert policy: User can only insert records with their own user_id
CREATE POLICY "Users can insert their own transactions"
ON public.transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update policy: User can only update their own records
CREATE POLICY "Users can update their own transactions"
ON public.transactions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Delete policy: User can only delete their own records
CREATE POLICY "Users can delete their own transactions"
ON public.transactions
FOR DELETE
USING (auth.uid() = user_id);
```

Repeat this verified pattern for `profiles`, `categories`, `budgets`, `budget_categories`, `savings_goals`, `savings_contributions`, `recurring_transactions`, and `notification_settings`.

---

## 3. Data Integrity & Safe Category Deletion (PRD §6.6, §8.2)

- Deleting a category must **never silently delete historical transactions**.
- Use `ON DELETE RESTRICT` for `category_id` in `transactions`, or prompt the user to reassign historical transactions before deleting a category.
- When querying transactions, join `categories(name, icon, color, type)`.

---

## 4. Client SDK Setup for React Native / Expo

Store the client in `src/services/supabase.js`:

```javascript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables in Expo config.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Security Guardrail:
- **Never expose `SUPABASE_SERVICE_ROLE_KEY`** in the mobile app bundle or `.env` referenced by Expo. Only the public anonymous key (`EXPO_PUBLIC_SUPABASE_ANON_KEY`) is permitted on the client.

---

## 5. Collaboration Checklist
- Provide database migration scripts in `supabase/migrations/<timestamp>_<name>.sql`.
- Coordinate with `app-security-specialist` to audit RLS policies and session handling.
- Coordinate with `personal-finance-logic` to align database queries with aggregation formulas.

