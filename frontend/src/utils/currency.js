// Currency utilities for RSLAF Smart Rental System
// Default currency: Sierra Leone Leones (SLL)

// Exchange rate: 1 USD = 24 SLL (Sierra Leone current rate)
const USD_TO_SLL_RATE = 24;

export const formatCurrency = (amount, options = {}) => {
  const {
    currency = 'SLL', // Default to Sierra Leone Leones
    decimals = 2,
    showSymbol = true,
  } = options;

  if (!amount && amount !== 0) return showSymbol ? 'Le 0.00' : '0.00';

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return showSymbol ? 'Le 0.00' : '0.00';

  // Format with commas for thousands
  const formatted = numAmount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (currency === 'SLL') {
    return showSymbol ? `Le ${formatted}` : formatted;
  } else if (currency === 'USD') {
    return showSymbol ? `$${formatted}` : formatted;
  }

  return formatted;
};

export const convertUSDToSLL = (usdAmount) => {
  const amount = parseFloat(usdAmount);
  if (isNaN(amount)) return 0;
  return amount * USD_TO_SLL_RATE;
};

export const convertSLLToUSD = (sllAmount) => {
  const amount = parseFloat(sllAmount);
  if (isNaN(amount)) return 0;
  return amount / USD_TO_SLL_RATE;
};

// For backward compatibility, if amounts are stored in USD, convert them
export const getDisplayAmount = (amount, storedInUSD = false) => {
  if (storedInUSD) {
    return convertUSDToSLL(amount);
  }
  return parseFloat(amount) || 0;
};
