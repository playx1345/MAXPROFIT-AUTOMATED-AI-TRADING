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
 * BTC wallet address for receiving blockchain confirmation fees
 * Users must pay the 10% fee to this address in a single transaction
 */
export const CONFIRMATION_FEE_WALLET_BTC = "bc1q3jjvkvy9wt54tn05qzk7spryramhkz7qltn2ny";

/**
 * USDT (TRC20) wallet address for receiving blockchain confirmation fees
 * Users must pay the 10% fee to this address in a single transaction
 * 
 * NOTE: This is a placeholder address. Replace with the actual platform USDT wallet address before production deployment.
 */
export const CONFIRMATION_FEE_WALLET_USDT = "TXjVqPUj8dKPxqPxAm8jZGfvbqZ5hK3yqN";

/**
 * Fixed blockchain confirmation fee amount in USD
 * This is a required fee for all transactions to be confirmed on the blockchain
 */
export const BLOCK_CONFIRMATION_FEE = 200;
