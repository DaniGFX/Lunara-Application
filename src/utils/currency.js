/**
 * Formats a numeric value to Philippine Peso (PHP / ₱) currency string.
 * @param {number|string} amount
 * @param {boolean} showSign
 * @returns {string} e.g. "₱1,250.00"
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
 * @param {string} inputStr
 * @returns {number}
 */
export function parsePhilippinePesoInput(inputStr) {
  if (!inputStr) return 0;
  const cleanStr = String(inputStr).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : Math.round((parsed + Number.EPSILON) * 100) / 100;
}

