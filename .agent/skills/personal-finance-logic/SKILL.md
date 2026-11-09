---
name: personal-finance-logic
description: Authoritative guide for personal finance calculations, Philippine Peso currency handling, budget math, savings allocation logic, and precision arithmetic.
---

# LUNARA Personal Finance Logic Skill

## Overview & PRD Alignment
This skill defines and enforces the authoritative mathematical models, accounting rules, and Philippine Peso currency formatting for **LUNARA** as defined in `docs/LUNARA_PRD.md` (Sections 1, 6.7, 6.8, 9, 17).

All agents, screens, and services performing calculations must strictly follow these formulas to prevent conflicting totals across the dashboard, transaction list, budget screens, and analytics.

---

## 1. Core Financial Calculation Formulas

### A. Income, Expenses & Net Cash Flow (PRD §9.1)
For any selected period (e.g., month):
- **Total Income** = $\sum \text{Income Transactions in period}$
- **Total Expenses** = $\sum \text{Expense Transactions in period}$
- **Net Cash Flow** = $\text{Total Income} - \text{Total Expenses}$

### B. Available Balance (PRD §9.2)
- **Formula**:
  $$\text{Available Balance} = \text{Opening Balance} + \text{Total Income} - \text{Total Expenses}$$
- **MVP Specification**: If an explicit opening balance is not yet configured by the user, the dashboard must clearly label this value as:
  **"Net Balance from Recorded Transactions"** rather than representing it as an external verified bank balance.

### C. The Savings Allocation Rule (PRD §6.8, §9.2, §17)
> [!IMPORTANT]
> **Strict Accounting Rule on Savings Contributions**:
> A savings contribution is an **allocation or transfer of funds toward a goal**, NOT a separate expense transaction.
> - **Never** subtract a savings contribution from the available balance if the income it was derived from has already been counted.
> - **Never** create an `expense` transaction automatically when a user records a savings contribution unless the user explicitly logs a real-world withdrawal/expense.
> - If a user spends money *from* their savings for a purchase, that purchase is recorded as an `expense` transaction.

### D. Monthly Budget Calculations (PRD §6.7, §9.3)
- **Budget Spent** = $\sum \text{Eligible Expense Transactions for Budget Period and Categories}$
  - Only transactions with `type === 'expense'` count.
  - Income transactions are strictly excluded.
  - Each expense must only be counted **once**. If an expense matches both an overall monthly budget and a category limit, it updates both but does not duplicate in the grand total.
- **Remaining Budget** = $\text{Total Budget Limit} - \text{Budget Spent}$
  - When $\text{Remaining Budget} < 0$, the budget has been exceeded (overspent).
  - Overspent percentage = $(\text{Budget Spent} / \text{Total Limit}) \times 100$.

### E. Savings Goal Progress (PRD §6.8, §9.4)
- **Current Saved Amount** = $\sum \text{Savings Contributions for this goal} - \sum \text{Savings Withdrawals}$
- **Goal Progress (%)**:
  $$\text{Progress} = \left(\frac{\text{Current Saved Amount}}{\text{Target Amount}}\right) \times 100$$
  - Progress percentage can be clamped visually at $100\%$ for progress bars, while the actual monetary balance retains its exact value (e.g., $\text{₱}12,000 / \text{₱}10,000$).
  - Goal status transitions to `'completed'` when $\text{Current Saved Amount} \ge \text{Target Amount}$.

---

## 2. Floating-Point Precision Strategy in JavaScript

JavaScript numbers use IEEE 754 floating points (e.g., `0.1 + 0.2 === 0.30000000000000004`). In financial calculations, this causes subtle rounding bugs.

### Helper Utility (`src/utils/calculations.js`)
```javascript
/**
 * Rounds a monetary amount to 2 decimal places to eliminate floating point artifacts.
 * @param {number} value
 * @returns {number}
 */
export function roundCurrency(value) {
  if (typeof value !== 'number' || isNaN(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates sum of an array of transactions by type.
 * @param {Array<{amount: number|string, type: string}>} transactions
 * @param {'income'|'expense'} type
 * @returns {number}
 */
export function calculateTotal(transactions, type) {
  if (!Array.isArray(transactions)) return 0;
  const sum = transactions
    .filter((tx) => tx.type === type)
    .reduce((acc, tx) => acc + (parseFloat(tx.amount) || 0), 0);
  return roundCurrency(sum);
}

/**
 * Computes monthly dashboard summary.
 */
export function computeDashboardSummary(transactions = [], openingBalance = 0) {
  const totalIncome = calculateTotal(transactions, 'income');
  const totalExpenses = calculateTotal(transactions, 'expense');
  const netBalance = roundCurrency(openingBalance + totalIncome - totalExpenses);

  return {
    totalIncome,
    totalExpenses,
    netBalance,
  };
}
```

---

## 3. Philippine Peso (PHP / ₱) Formatting Standard

All monetary displays across LUNARA must follow the standard Philippine Peso format:

### Format Requirements:
- Symbol: `₱` (U+20B1)
- Thousands separator: `,` (comma)
- Decimal separator: `.` (period)
- Decimals: Exactly 2 decimal digits (`₱1,250.00`)
- Negative amounts: `-₱500.00` or `(₱500.00)` depending on context

### Formatting Utility (`src/utils/currency.js`)
```javascript
/**
 * Formats a number to Philippine Peso currency string.
 * @param {number|string} amount
 * @param {boolean} showSign
 * @returns {string} e.g. "₱1,500.50"
 */
export function formatPHP(amount, showSign = false) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === null || num === undefined || isNaN(num)) {
    return '₱0.00';
  }

  const absoluteValue = Math.abs(num);
  const formattedNumber = absoluteValue.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (num < 0) {
    return `-₱${formattedNumber}`;
  }
  if (showSign && num > 0) {
    return `+₱${formattedNumber}`;
  }
  return `₱${formattedNumber}`;
}

/**
 * Parses user text input into a clean numeric value.
 * Handles inputs with commas or PHP symbols.
 * @param {string} inputStr
 * @returns {number}
 */
export function parsePhilippinePesoInput(inputStr) {
  if (!inputStr) return 0;
  const cleanStr = String(inputStr).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : Math.round((parsed + Number.EPSILON) * 100) / 100;
}
```

---

## 4. Collaboration Checklist
- Provide `calculateTotal`, `computeDashboardSummary`, and `formatPHP` for `react-native-expo-developer`.
- Coordinate with `finance-analytics` for grouping and trend calculations.
- Coordinate with `lunara-testing-qa` to verify edge cases (zero values, negative balances, cents rounding).

