---
name: finance-analytics
description: Guide for creating income/expense summaries, category breakdowns, monthly spending charts, budget tracking, and savings analytics in LUNARA.
---

# LUNARA Finance Analytics Skill

## Overview & PRD Alignment
This skill governs data aggregation, categorization analytics, trend calculations, and data visualization for **LUNARA** as defined in `docs/LUNARA_PRD.md` (Sections 6.10, 7.2, 9).

Analytics must present clear, digestible insights into personal spending habits, budget health, and savings velocity while preserving the lavender aesthetic and accessible design.

---

## 1. Analytics & Reporting Capabilities (PRD §6.10)

1. **Monthly Income vs. Expense Comparison**:
   - Compare Total Income, Total Expenses, and Net Savings Rate:
     $$\text{Savings Rate (\%)} = \left(\frac{\text{Total Income} - \text{Total Expenses}}{\text{Total Income}}\right) \times 100$$
2. **Spending by Category (Expense Breakdown)**:
   - Calculate category share:
     $$\text{Category Share (\%)} = \left(\frac{\text{Category Expense}}{\text{Total Expense}}\right) \times 100$$
   - Sort categories in descending order of expenditure to highlight largest spending drivers.
3. **Monthly Budget Utilization**:
   - Track percentage spent of overall budget and individual category limits:
     $$\text{Budget Utilization (\%)} = \left(\frac{\text{Actual Expense}}{\text{Budget Limit}}\right) \times 100$$
   - Status tiers:
     - Normal: $< 80\%$
     - Caution: $80\% - 99\%$
     - Exceeded: $\ge 100\%$
4. **Savings Goal Progress Tracker**:
   - Aggregated savings across all active goals vs. target milestones.

---

## 2. Visualization & Chart Design Standards

- **Chart Palette**: Derived from LUNARA theme tokens:
  - Primary Segment: `#9B87D4` (Lavender)
  - Secondary Segments: `#BFA8F2`, `#7A62B8`, `#F5E5F3`, `#D4C7F5`, `#574477`
  - Highlighting / Alert: Soft rose `#F43F5E` / `#FEE2E2`
- **Libraries**: Lightweight React Native chart solutions (such as `react-native-gifted-charts`, `react-native-chart-kit`, or pure SVG via `react-native-svg`).
- **Ergonomics**:
  - Keep charts interactive or equipped with clear legends.
  - Do not crowd labels on small mobile screens.
  - Always provide numerical labels alongside graphical bars or slices.

---

## 3. Data Transformation Patterns (JavaScript)

```javascript
import { roundCurrency } from '../utils/calculations';

/**
 * Groups expense transactions by category and calculates percentages.
 * @param {Array<Object>} transactions
 * @returns {Array<{categoryId: string, categoryName: string, total: number, percentage: number}>}
 */
export function getCategoryBreakdown(transactions = []) {
  const expenseTransactions = transactions.filter(tx => tx.type === 'expense');
  const totalExpense = expenseTransactions.reduce((acc, tx) => acc + (parseFloat(tx.amount) || 0), 0);

  if (totalExpense === 0) return [];

  const grouped = {};
  for (const tx of expenseTransactions) {
    const catId = tx.category_id || 'uncategorized';
    const catName = tx.categories?.name || 'Uncategorized';
    const catColor = tx.categories?.color || '#9B87D4';

    if (!grouped[catId]) {
      grouped[catId] = {
        categoryId: catId,
        categoryName: catName,
        color: catColor,
        total: 0,
      };
    }
    grouped[catId].total += parseFloat(tx.amount) || 0;
  }

  return Object.values(grouped)
    .map(cat => ({
      ...cat,
      total: roundCurrency(cat.total),
      percentage: roundCurrency((cat.total / totalExpense) * 100),
    }))
    .sort((a, b) => b.total - a.total);
}
```

---

## 4. Collaboration Checklist
- Rely on `personal-finance-logic` for currency rounding and formatting (`formatPHP`).
- Follow `lunara-ui-ux` guidelines for chart container styling and color contrast.
- Interface with `supabase-backend-specialist` for efficient aggregated SQL views or queries when datasets grow.

