// Currency configuration and formatting for Sri Lanka (LKR)
export const SHIPPING_THRESHOLD = 10000; // Free delivery for orders over Rs. 10,000
export const STANDARD_SHIPPING_FEE = 450; // Standard islandwide delivery fee

/**
 * Format a numeric amount as Sri Lankan Rupees (e.g., "Rs. 2,500.00")
 * @param {number|string} amount
 * @returns {string}
 */
export function formatLKR(amount) {
  const num = Number(amount) || 0;
  return `Rs. ${num.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const formatPrice = formatLKR;
