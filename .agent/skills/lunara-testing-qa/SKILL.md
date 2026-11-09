---
name: lunara-testing-qa
description: Quality assurance, functional testing matrix, financial calculation test cases, RLS security verification, and Android platform testing for LUNARA.
---

# LUNARA Testing & QA Specialist Skill

## Overview & PRD Alignment
This skill provides comprehensive test suites, testing checklists, edge case matrices, and QA verification procedures for **LUNARA** as defined in `docs/LUNARA_PRD.md` (Sections 14, 15).

QA ensures zero calculation errors, seamless Android ergonomics, and robust security across all user flows.

---

## 1. Financial Calculation Test Matrix (PRD §14)

Run and verify these exact test scenarios whenever financial logic or database aggregation changes:

| Test Scenario | Input Data | Expected Outcome | Verification Point |
| :--- | :--- | :--- | :--- |
| **TC-01: Zero Transactions** | 0 income, 0 expenses | Net Balance: `₱0.00`, Total Income: `₱0.00`, Total Expenses: `₱0.00` | Dashboard shows clean empty state without NaN or crash |
| **TC-02: Income Only** | 1 income of `₱15,000.50` | Net Balance: `₱15,000.50`, Total Expenses: `₱0.00` | Format check: `+₱15,000.50` |
| **TC-03: Expense Only** | 1 expense of `₱2,350.75` | Net Balance: `-₱2,350.75` | Formatted with negative sign, appropriate color + icon |
| **TC-04: Mixed Cash Flow** | Income: `₱50,000.00`, Expenses: `₱32,450.25` | Net Cash Flow: `₱17,549.75` | Accuracy to exact 2 decimal cents |
| **TC-05: Budget Exact Match** | Limit: `₱10,000.00`, Spent: `₱10,000.00` | Remaining: `₱0.00`, Utilization: `100%` | Status: `100% Spent`, no error |
| **TC-06: Budget Exceeded** | Limit: `₱10,000.00`, Spent: `₱12,500.00` | Remaining: `-₱2,500.00`, Utilization: `125%` | Warning badge, exceeded message with icon |
| **TC-07: Savings Contribution** | Net Balance: `₱20,000.00`, Goal Contribution: `₱5,000.00` | Goal Saved increases by `₱5,000.00`. Available Balance is NOT subtracted twice | Verify no unexpected expense transaction is created |
| **TC-08: Transaction Edit** | Change expense from `₱500.00` to `₱800.00` | Total Expenses increases by `₱300.00`, Balance drops by `₱300.00` | Instant dashboard & budget recalculation |
| **TC-09: Transaction Delete** | Delete `₱800.00` expense | Total Expenses drops by `₱800.00`, Balance increases by `₱800.00` | Verify confirmation modal before deletion |

---

## 2. Security & RLS Permission Tests (PRD §14)

Execute these checks to guarantee data isolation:
1. **Cross-User Isolation**:
   - Authenticate as User A.
   - Attempt to query transactions with `WHERE user_id = <User_B_UUID>`.
   - **Expected**: Empty array returned (`[]`), never User B's rows.
2. **Tamper Check on Insertion**:
   - Authenticate as User A.
   - Attempt to insert a transaction specifying `user_id: <User_B_UUID>`.
   - **Expected**: Operation rejected by Supabase RLS (`new row violates row-level security policy`).
3. **Unauthenticated Access**:
   - Query `transactions` without an `Authorization` header / session token.
   - **Expected**: Permission denied or empty set.

---

## 3. Android Platform & Usability Verification

- **Keyboard Avoidance**: Open Add Transaction form on a small screen (e.g. 360x640 dp). Verify inputs remain visible and submit button is accessible when the virtual keyboard pops up.
- **Hardware Back Button**: Press Android back button on modal or sub-screens. Verify it closes the modal gracefully rather than unexpectedly exiting the application.
- **Touch Target Audit**: Verify all buttons, filter pills, and icon taps have minimum `48x48 dp` hit slop.
- **Color Contrast & Accessibility**: Check dark purple `#574477` against `#F8F6FC` and `#EAE3FA` with contrast analyzer tool (passes AA).
- **Network Resilience**: Turn on Airplane mode while submitting a transaction. App must show a clear offline retry error rather than freezing or crashing.

---

## 4. Jest / Unit Test Template for Calculations
```javascript
import { calculateTotal, computeDashboardSummary, roundCurrency } from '../src/utils/calculations';

describe('LUNARA Financial Calculations', () => {
  test('correctly calculates net balance from transactions', () => {
    const transactions = [
      { type: 'income', amount: 25000.50 },
      { type: 'expense', amount: 1200.25 },
      { type: 'expense', amount: 350.25 },
    ];
    const summary = computeDashboardSummary(transactions, 0);
    expect(summary.totalIncome).toBe(25000.50);
    expect(summary.totalExpenses).toBe(1550.50);
    expect(summary.netBalance).toBe(23450.00);
  });

  test('handles floating point precision gracefully', () => {
    const transactions = [
      { type: 'expense', amount: 0.1 },
      { type: 'expense', amount: 0.2 },
    ];
    const total = calculateTotal(transactions, 'expense');
    expect(total).toBe(0.3); // Not 0.30000000000000004
  });
});
```

---

## 5. Collaboration Checklist
- Report calculation defects to `personal-finance-logic`.
- Report UI contrast, touch target, or layout overflow bugs to `lunara-ui-ux` and `react-native-expo-developer`.
- Report policy bypasses or data leaks to `app-security-specialist`.

