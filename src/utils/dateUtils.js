/**
 * Date and Month utility helpers for LUNARA
 * Ensures months update automatically based on real-time clock and transactions.
 */

/**
 * Returns current month key in 'YYYY-MM' format (e.g., '2026-11')
 */
export function getCurrentMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Formats a 'YYYY-MM' key into human-readable label (e.g., '2026-11' -> 'November 2026')
 */
export function formatMonthLabel(monthKey) {
  if (!monthKey || monthKey === 'all') return 'All Time';
  const parts = monthKey.split('-');
  if (parts.length < 2) return monthKey;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Returns uppercase month + year for the dashboard header (e.g. 'NOVEMBER 2026')
 */
export function getCurrentMonthHeader() {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
}

/**
 * Generates dynamic month options based on real clock + user transaction history.
 * - Always includes the current month
 * - Includes previous 11 months so user can review the whole year
 * - Includes upcoming month (e.g., next month for planning)
 * - Dynamically includes any month found in existing transactions
 * - Automatically rolls over when a new month begins
 */
export function generateMonthOptions(transactions = [], monthsBack = 11, monthsForward = 1) {
  const monthKeys = new Set();
  const now = new Date();

  // Upcoming months (e.g. December when in November)
  for (let i = monthsForward; i >= 1; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthKeys.add(key);
  }

  // Current month
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  monthKeys.add(currentKey);

  // Past months
  for (let i = 1; i <= monthsBack; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthKeys.add(key);
  }

  // Include any month from logged transactions
  transactions.forEach((tx) => {
    if (tx.rawDate && tx.rawDate.length >= 7) {
      monthKeys.add(tx.rawDate.slice(0, 7));
    }
  });

  // Sort descending: newest month at top
  const sortedKeys = Array.from(monthKeys).sort((a, b) => b.localeCompare(a));

  const options = sortedKeys.map((key) => ({
    key,
    label: formatMonthLabel(key),
  }));

  options.push({ key: 'all', label: 'All Time' });
  return options;
}

