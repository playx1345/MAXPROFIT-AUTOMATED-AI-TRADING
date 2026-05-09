import { test, expect } from "../../playwright-fixture";
import {
  amountSchema,
  depositAmountSchema,
  validateField,
  getWalletAddressSchema,
  transactionHashSchema,
  emailSchema,
  passwordSchema,
  fullNameSchema,
} from "../../src/lib/validation";

test.describe("validation schemas", () => {
  test("amount schema accepts valid values and rejects invalid precision", () => {
    expect(amountSchema.safeParse("100.50").success).toBe(true);
    expect(amountSchema.safeParse("0").success).toBe(false);
    expect(amountSchema.safeParse("10.999").success).toBe(false);
    expect(amountSchema.safeParse("1000000001").success).toBe(false);
  });

  test("deposit amount schema enforces minimum", () => {
    expect(depositAmountSchema.safeParse("250").success).toBe(true);
    expect(depositAmountSchema.safeParse("249.99").success).toBe(false);
  });

  test("wallet schema selection returns the proper validator per currency", () => {
    const usdt = getWalletAddressSchema("usdt");
    const btc = getWalletAddressSchema("btc");
    const eth = getWalletAddressSchema("eth");
    const xrp = getWalletAddressSchema("xrp");

    expect(usdt.safeParse("TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE").success).toBe(true);
    expect(usdt.safeParse("1BoatSLRHtKNngkdXEeobR76b53LETtpyT").success).toBe(false);

    expect(btc.safeParse("1BoatSLRHtKNngkdXEeobR76b53LETtpyT").success).toBe(true);
    expect(btc.safeParse("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kg3g4ty").success).toBe(true);
    expect(btc.safeParse("0x742d35Cc6634C0532925a3b844Bc454e4438f44e").success).toBe(false);

    expect(eth.safeParse("0x742d35Cc6634C0532925a3b844Bc454e4438f44e").success).toBe(true);
    expect(eth.safeParse("rP1cosk78gYx9sB8gP6xQ5w7KJb8f9B5V").success).toBe(false);

    expect(xrp.safeParse("rP1cosk78gYx9sB8gP6xQ5w7KJb8f9B5V").success).toBe(true);
  });

  test("transaction hash schema handles optional and valid formats", () => {
    expect(transactionHashSchema.safeParse(undefined).success).toBe(true);
    expect(transactionHashSchema.safeParse("a".repeat(64)).success).toBe(true);
    expect(transactionHashSchema.safeParse(`T${"a".repeat(63)}`).success).toBe(true);
    expect(transactionHashSchema.safeParse("short").success).toBe(false);
  });

  test("email, password and full name schemas enforce format rules", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
    expect(emailSchema.safeParse("invalid-email").success).toBe(false);

    expect(passwordSchema.safeParse("StrongPass1").success).toBe(true);
    expect(passwordSchema.safeParse("weakpass1").success).toBe(false);
    expect(passwordSchema.safeParse("WEAKPASS1").success).toBe(false);
    expect(passwordSchema.safeParse("WeakPass").success).toBe(false);

    expect(fullNameSchema.safeParse("John O'Connor").success).toBe(true);
    expect(fullNameSchema.safeParse("J").success).toBe(false);
    expect(fullNameSchema.safeParse("John123").success).toBe(false);
  });

  test("validateField returns normalized success and error shapes", () => {
    const success = validateField(emailSchema, "hello@example.com");
    expect(success.isValid).toBe(true);
    if (success.isValid) {
      expect(success.data).toBe("hello@example.com");
      expect(success.error).toBeNull();
    }

    const failure = validateField(emailSchema, "bad-email");
    expect(failure.isValid).toBe(false);
    if (!failure.isValid) {
      expect(failure.data).toBeNull();
      expect(typeof failure.error).toBe("string");
      expect(failure.error.length).toBeGreaterThan(0);
    }
  });
});
