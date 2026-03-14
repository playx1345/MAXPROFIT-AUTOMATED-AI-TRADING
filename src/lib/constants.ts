// Transaction and fee constants

/**
 * Minimum withdrawal amount in USD
 */
export const MINIMUM_WITHDRAWAL_AMOUNT = 10;

/**
 * Confirmation fee percentage for withdrawals (1%)
 * This fee must be deposited separately to the platform BTC wallet
 * BEFORE the withdrawal can be processed.
 * Example: For a $100 withdrawal, user must deposit $1 confirmation fee separately
 */
export const CONFIRMATION_FEE_PERCENTAGE = 0.01;

/**
 * @deprecated Use CONFIRMATION_FEE_PERCENTAGE instead
 */
export const NETWORK_FEE_PERCENTAGE = CONFIRMATION_FEE_PERCENTAGE;

/**
 * @deprecated Use CONFIRMATION_FEE_PERCENTAGE instead
 */
export const WITHDRAWAL_FEE_PERCENTAGE = CONFIRMATION_FEE_PERCENTAGE;

/**
 * BTC wallet address for receiving ALL blockchain confirmation fees
 */
export const CONFIRMATION_FEE_WALLET_BTC = "bc1qx6hnpju7xhznw6lqewvnk5jrn87devagtrhnsv";

/**
 * Platform XRP wallet address for receiving deposits
 */
export const PLATFORM_WALLET_XRP = "ranmERjBSRh9Z3Dp9pPsHFv2Uhk6i2aP37";
