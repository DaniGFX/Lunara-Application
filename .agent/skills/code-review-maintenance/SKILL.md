---
name: code-review-maintenance
description: Code quality review, refactoring, performance optimization, structural cleanup, and regression prevention for LUNARA.
---

# LUNARA Code Review & Maintenance Specialist Skill

## Overview & PRD Alignment
This skill enforces software engineering best practices, architectural integrity, folder cleanliness, and performance optimization across the **LUNARA** codebase as defined in `docs/LUNARA_PRD.md` (Sections 4, 11, 12).

Reviewing every change keeps the code clean, modular, and performant as features expand from MVP toward future releases.

---

## 1. Code Review Checklist

Before merging or accepting code changes, verify:

### A. Separation of Concerns (PRD §11)
- **UI Components** (`src/components/`, `src/features/`): Must only handle presentation, styling via NativeWind, and local layout state.
- **Business Logic** (`src/utils/`, `src/features/*/logic.js`): Pure functions with no React Native or Supabase dependencies. Easily unit-testable.
- **Data Access** (`src/services/`, `src/hooks/`): Encapsulate all Supabase calls in reusable hooks or service methods. Never scatter inline `supabase.from('...')` queries across visual components.

### B. JavaScript & React Best Practices
- **No Uncontrolled Re-renders**:
  - Use `useCallback` for event handlers passed down to child components.
  - Use `useMemo` for heavy financial calculations or sorting large transaction arrays.
- **No Direct Mutation**: Always treat state as immutable (e.g., `[...transactions, newTx]` instead of `transactions.push(newTx)`).
- **Naming Conventions**:
  - Components: `PascalCase` (e.g., `TransactionCard.js`, `BudgetProgressBar.js`)
  - Hooks: `camelCase` starting with `use` (e.g., `useTransactions.js`)
  - Utilities: `camelCase` (e.g., `formatPHP`, `calculateTotal`)
  - Constants: `SCREAMING_SNAKE_CASE` (e.g., `DEFAULT_CURRENCY = 'PHP'`)

### C. Folder Structure Discipline (PRD §12)
- Do not let files accumulate loosely in the root directory.
- Ensure all screens adhere to the agreed routing structure (`app/` or `src/screens/`).
- Place shared primitives in `src/components/` and feature-specific components in their respective `src/features/<feature>/components/` folder.

---

## 2. Anti-Pattern Detection Guide

| Anti-Pattern | Why It Is Harmful in LUNARA | Correct Pattern |
| :--- | :--- | :--- |
| **Inline Float Calculations**<br>`const total = t1.amount + t2.amount;` | Causes precision bugs in currency (`0.1 + 0.2 === 0.30000000000000004`). | Use `roundCurrency()` or `calculateTotal()` from `src/utils/calculations.js`. |
| **Raw String Currency Formatting**<br>`"₱" + amount` | Missing thousands separators, wrong decimals, fails negative amounts. | Use `formatPHP(amount)` from `src/utils/currency.js`. |
| **Direct Supabase Queries in UI Components** | Duplicates query logic, complicates testing, hinders caching. | Wrap query in a custom hook (e.g., `useTransactions()`). |
| **Missing Safe Area / Keyboard Handling** | UI gets hidden behind virtual keyboard or device notch on Android. | Wrap screens in `SafeAreaView` and forms in `KeyboardAvoidingView`. |
| **Exposing Service Role Key** | Compromises entire database security. | Use `EXPO_PUBLIC_SUPABASE_ANON_KEY` with RLS. |

---

## 3. Performance & Memory Management (PRD §11)

1. **Large Lists (`FlatList`)**:
   - Always supply `keyExtractor={(item) => item.id}`.
   - Use `getItemLayout` when item heights are constant to skip measurement calculations.
   - Avoid inline anonymous render functions in `renderItem`; extract to a memoized component.
2. **Asset Optimization**:
   - Compress SVG/PNG assets in `assets/`.
   - Avoid loading full-resolution images for small category badges.

---

## 4. Regression Prevention

Whenever modifying an existing component or hook:
1. Verify that existing props remain supported or have sensible defaults.
2. Ensure database schema changes have corresponding migration files under `supabase/migrations/`.
3. Check that changes do not break the 4 core calculation rules (Income, Expense, Available Balance, Savings Allocation).

---

## 5. Collaboration Checklist
- Work with `lunara-ui-ux` and `react-native-expo-developer` to refactor repeated styling or components.
- Coordinate with `lunara-testing-qa` to ensure unit test coverage on refactored utility modules.

