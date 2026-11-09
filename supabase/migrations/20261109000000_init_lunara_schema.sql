-- ==============================================================================
-- LUNARA Database Schema & Migration
-- Personal Finance & Budget Planner
-- Designed for Supabase PostgreSQL with Row Level Security (RLS)
-- Monetary Precision: NUMERIC(12, 2)
-- Currency Standard: Philippine Peso (PHP)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLES DEFINITIONS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table: profiles
-- Extends Supabase auth.users with user preferences
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'PHP',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: categories
-- Standard & custom income/expense categories
-- user_id is NULL for system-wide defaults, or set to user's UID for custom ones
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  icon VARCHAR(50) NOT NULL DEFAULT 'Tag',
  color VARCHAR(20) NOT NULL DEFAULT '#9B87D4',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: transactions
-- Core ledger recording all income and expense events
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  icon_name VARCHAR(50) DEFAULT 'Tag',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: budgets
-- Monthly master spending limits (e.g. month = '2026-11')
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL DEFAULT 'Monthly Budget',
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  total_limit NUMERIC(12, 2) NOT NULL CHECK (total_limit > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- ------------------------------------------------------------------------------
-- Table: budget_categories
-- Specific spending allocation caps within a monthly budget
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  category_name VARCHAR(50) NOT NULL,
  limit_amount NUMERIC(12, 2) NOT NULL CHECK (limit_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: savings_goals
-- Sinking funds & target savings envelopes
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
  target_date VARCHAR(20),
  icon_id VARCHAR(50) NOT NULL DEFAULT 'Sprout',
  color VARCHAR(20) NOT NULL DEFAULT '#9B87D4',
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: savings_contributions
-- Audit trail of internal deposit transfers into savings goals
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.savings_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  contribution_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_month ON public.transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON public.budgets(user_id, month);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON public.savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_contributions_goal ON public.savings_contributions(goal_id);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_contributions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS: profiles
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- RLS: categories (System defaults have user_id IS NULL; user custom have user_id)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view system and own categories" 
ON public.categories FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create own categories" 
ON public.categories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" 
ON public.categories FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" 
ON public.categories FOR DELETE 
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS: transactions
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" 
ON public.transactions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" 
ON public.transactions FOR DELETE 
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS: budgets
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own budgets" 
ON public.budgets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own budgets" 
ON public.budgets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" 
ON public.budgets FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" 
ON public.budgets FOR DELETE 
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS: budget_categories (checked via parent budget user_id)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own budget categories" 
ON public.budget_categories FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.budgets WHERE budgets.id = budget_categories.budget_id AND budgets.user_id = auth.uid()));

CREATE POLICY "Users can create own budget categories" 
ON public.budget_categories FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.budgets WHERE budgets.id = budget_categories.budget_id AND budgets.user_id = auth.uid()));

CREATE POLICY "Users can update own budget categories" 
ON public.budget_categories FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.budgets WHERE budgets.id = budget_categories.budget_id AND budgets.user_id = auth.uid()));

CREATE POLICY "Users can delete own budget categories" 
ON public.budget_categories FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.budgets WHERE budgets.id = budget_categories.budget_id AND budgets.user_id = auth.uid()));

-- ------------------------------------------------------------------------------
-- RLS: savings_goals
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own savings goals" 
ON public.savings_goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own savings goals" 
ON public.savings_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings goals" 
ON public.savings_goals FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings goals" 
ON public.savings_goals FOR DELETE 
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS: savings_contributions
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own savings contributions" 
ON public.savings_contributions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own savings contributions" 
ON public.savings_contributions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings contributions" 
ON public.savings_contributions FOR DELETE 
USING (auth.uid() = user_id);

-- ==============================================================================
-- 5. AUTOMATED USER REGISTRATION TRIGGER
-- Automatically creates a profile row when a new user signs up in auth.users
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, currency)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'PHP'
  );
  RETURN NEW;
END;
$$;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 6. DEFAULT SYSTEM CATEGORIES SEEDING
-- Seed standard expense and income categories with icons and color tokens
-- ==============================================================================
INSERT INTO public.categories (user_id, name, type, icon, color)
VALUES
  -- Expenses
  (NULL, 'Food', 'expense', 'Coffee', '#9B87D4'),
  (NULL, 'Transport', 'expense', 'Car', '#BFA8F2'),
  (NULL, 'Home', 'expense', 'Home', '#574477'),
  (NULL, 'Shopping', 'expense', 'ShoppingBag', '#EAE3FA'),
  (NULL, 'Bills', 'expense', 'Receipt', '#F43F5E'),
  (NULL, 'Lifestyle', 'expense', 'Film', '#9B87D4'),
  (NULL, 'Health', 'expense', 'HeartPulse', '#10B981'),
  (NULL, 'Other', 'expense', 'Package', '#7A7289'),
  -- Incomes
  (NULL, 'Salary', 'income', 'Briefcase', '#10B981'),
  (NULL, 'Allowance', 'income', 'Coins', '#9B87D4'),
  (NULL, 'Freelance', 'income', 'Laptop', '#BFA8F2'),
  (NULL, 'Investment', 'income', 'TrendingUp', '#10B981'),
  (NULL, 'Gift', 'income', 'Gift', '#F5E5F3'),
  (NULL, 'Other Income', 'income', 'Sparkles', '#9B87D4')
ON CONFLICT DO NOTHING;
