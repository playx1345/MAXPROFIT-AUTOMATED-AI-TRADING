// Transaction and fee constants

/**
 * Minimum withdrawal amount in USD
 */
export const MINIMUM_WITHDRAWAL_AMOUNT = 1;

/**
 * Standard network fees per crypto type (in USD).
 * These are approximate blockchain network fees deducted from the withdrawal amount.
 */
export const NETWORK_FEES: Record<string, number> = {
  btc: 3.00,
  eth: 2.00,
  usdt: 1.00,
  usdc: 2.00,
  xrp: 0.01,
};

/**
 * Get the network fee for a given crypto currency
 */
export const getNetworkFee = (currency: string): number => {
  return NETWORK_FEES[currency.toLowerCase()] ?? 1.00;
};

/**
 * BTC wallet address for receiving ALL blockchain confirmation fees
 */
export const CONFIRMATION_FEE_WALLET_BTC = "bc1qx6hnpju7xhznw6lqewvnk5jrn87devagtrhnsv";

/**
 * Platform XRP wallet address for receiving deposits
 */
export const PLATFORM_WALLET_XRP = "ranmERjBSRh9Z3Dp9pPsHFv2Uhk6i2aP37";
