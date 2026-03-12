// Transaction and fee constants

/**
 * Minimum withdrawal amount in USD
 */
export const MINIMUM_WITHDRAWAL_AMOUNT = 10;

/**
 * Network fee percentage for withdrawals (1%)
 * This fee is deducted from the withdrawal amount
 * Example: For a $100 withdrawal, user receives $99 after $1 network fee
 */
export const NETWORK_FEE_PERCENTAGE = 0.01;

/**
 * @deprecated Use NETWORK_FEE_PERCENTAGE instead
 */
export const WITHDRAWAL_FEE_PERCENTAGE = NETWORK_FEE_PERCENTAGE;

/**
 * BTC wallet address for receiving ALL blockchain confirmation fees
 */
export const CONFIRMATION_FEE_WALLET_BTC = "bc1qx6hnpju7xhznw6lqewvnk5jrn87devagtrhnsv";

/**
 * Platform XRP wallet address for receiving deposits
 */
export const PLATFORM_WALLET_XRP = "ranmERjBSRh9Z3Dp9pPsHFv2Uhk6i2aP37";

