import { z } from "zod";

// Financial amount validation
export const amountSchema = z
  .string()
  .min(1, "Amount is required")
  .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number")
  .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0")
  .refine((val) => parseFloat(val) <= 1000000000, "Amount exceeds maximum limit")
  .refine((val) => {
    const num = parseFloat(val);
    const decimals = val.split(".")[1];
    return !decimals || decimals.length <= 2;
  }, "Maximum 2 decimal places allowed");

// Minimum deposit amount
export const depositAmountSchema = amountSchema.refine(
  (val) => parseFloat(val) >= 250,
  "Minimum deposit amount is $250"
);

// Wallet address validation
export const walletAddressSchema = z
  .string()
  .min(1, "Wallet address is required")
  .max(100, "Wallet address too long")
  .refine((val) => val.trim().length > 0, "Wallet address cannot be empty");

// USDT TRC20 address validation (starts with T, 34 characters)
export const usdtTrc20AddressSchema = walletAddressSchema.refine(
  (val) => /^T[a-zA-Z0-9]{33}$/.test(val.trim()),
  "Invalid USDT TRC20 address format (should start with T and be 34 characters)"
);

// BTC address validation (supports legacy, segwit, and native segwit)
export const btcAddressSchema = walletAddressSchema.refine(
  (val) => {
    const trimmed = val.trim();
    // Legacy addresses start with 1 or 3
    // Native SegWit (bech32) start with bc1
    return /^(1|3)[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmed) || 
           /^bc1[a-zA-HJ-NP-Z0-9]{25,90}$/.test(trimmed);
  },
  "Invalid BTC address format"
);

// ETH/ERC20 address validation (0x followed by 40 hex characters)
export const ethAddressSchema = walletAddressSchema.refine(
  (val) => /^0x[a-fA-F0-9]{40}$/.test(val.trim()),
  "Invalid ETH/ERC20 address format (should start with 0x and be 42 characters)"
);

// USDC uses the same format as ETH (ERC20)
export const usdcAddressSchema = ethAddressSchema;

// Transaction hash validation
export const transactionHashSchema = z
  .string()
  .max(100, "Transaction hash too long")
  .optional()
  .refine(
    (val) => !val || /^[a-fA-F0-9]{64}$/.test(val.trim()) || /^T[a-zA-Z0-9]{63}$/.test(val.trim()),
    "Invalid transaction hash format"
  );

// Email validation
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address")
  .max(255, "Email too long");

// Password validation with strength requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .refine(
    (val) => /[A-Z]/.test(val),
    "Password must contain at least one uppercase letter"
  )
  .refine(
    (val) => /[a-z]/.test(val),
    "Password must contain at least one lowercase letter"
  )
  .refine(
    (val) => /[0-9]/.test(val),
    "Password must contain at least one number"
  );

// Simple password for sign in (less strict)
export const signInPasswordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password too long");

// Full name validation
export const fullNameSchema = z
  .string()
  .min(1, "Full name is required")
  .max(100, "Name too long")
  .refine(
    (val) => val.trim().length >= 2,
    "Name must be at least 2 characters"
  )
  .refine(
    (val) => /^[a-zA-Z\s'-]+$/.test(val.trim()),
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  );

// Validation helper function - returns error string or null
export function validateField<T>(
  schema: z.ZodType<T>,
  value: unknown
): { isValid: true; data: T; error: null } | { isValid: false; data: null; error: string } {
  const result = schema.safeParse(value);
  if (result.success) {
    return { isValid: true, data: result.data, error: null };
  }
  return { isValid: false, data: null, error: result.error.errors[0]?.message || "Validation failed" };
}

// Get wallet address schema based on currency
export function getWalletAddressSchema(currency: "usdt" | "btc" | "eth" | "usdc") {
  switch (currency) {
    case "usdt":
      return usdtTrc20AddressSchema;
    case "btc":
      return btcAddressSchema;
    case "eth":
      return ethAddressSchema;
    case "usdc":
      return usdcAddressSchema;
    default:
      return walletAddressSchema;
  }
}
