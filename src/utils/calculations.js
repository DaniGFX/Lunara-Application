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
export function calculateTotal(transactions = [], type) {
  if (!Array.isArray(transactions)) return 0;
  const sum = transactions
    .filter((tx) => tx.type === type)
    .reduce((acc, tx) => acc + (parseFloat(tx.amount) || 0), 0);
  return roundCurrency(sum);
}

/**
 * Computes monthly dashboard summary according to LUNARA PRD rules.
 * Net Balance = Opening Balance + Total Income - Total Expenses
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

