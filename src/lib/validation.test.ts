import test from "node:test";
import assert from "node:assert/strict";
import {
  amountSchema,
  depositAmountSchema,
  validateField,
  getWalletAddressSchema,
  transactionHashSchema,
  emailSchema,
  passwordSchema,
  fullNameSchema,
} from "./validation";

test("amount schema accepts valid values and rejects invalid precision", () => {
  assert.equal(amountSchema.safeParse("100.50").success, true);
  assert.equal(amountSchema.safeParse("0").success, false);
  assert.equal(amountSchema.safeParse("10.999").success, false);
  assert.equal(amountSchema.safeParse("1000000001").success, false);
});

test("deposit amount schema enforces minimum", () => {
  assert.equal(depositAmountSchema.safeParse("250").success, true);
  assert.equal(depositAmountSchema.safeParse("249.99").success, false);
});

test("wallet schema selection returns the proper validator per currency", () => {
  const usdt = getWalletAddressSchema("usdt");
  const btc = getWalletAddressSchema("btc");
  const eth = getWalletAddressSchema("eth");
  const xrp = getWalletAddressSchema("xrp");

  assert.equal(usdt.safeParse("TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE").success, true);
  assert.equal(usdt.safeParse("1BoatSLRHtKNngkdXEeobR76b53LETtpyT").success, false);

  assert.equal(btc.safeParse("1BoatSLRHtKNngkdXEeobR76b53LETtpyT").success, true);
  assert.equal(btc.safeParse("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kg3g4ty").success, true);
  assert.equal(btc.safeParse("0x742d35Cc6634C0532925a3b844Bc454e4438f44e").success, false);

  assert.equal(eth.safeParse("0x742d35Cc6634C0532925a3b844Bc454e4438f44e").success, true);
  assert.equal(eth.safeParse("rP1cosk78gYx9sB8gP6xQ5w7KJb8f9B5V").success, false);

  assert.equal(xrp.safeParse("rP1cosk78gYx9sB8gP6xQ5w7KJb8f9B5V").success, true);
});

test("transaction hash schema handles optional and valid formats", () => {
  assert.equal(transactionHashSchema.safeParse(undefined).success, true);
  assert.equal(transactionHashSchema.safeParse("a".repeat(64)).success, true);
  assert.equal(transactionHashSchema.safeParse(`T${"a".repeat(63)}`).success, true);
  assert.equal(transactionHashSchema.safeParse("short").success, false);
});

test("email, password and full name schemas enforce format rules", () => {
  assert.equal(emailSchema.safeParse("user@example.com").success, true);
  assert.equal(emailSchema.safeParse("invalid-email").success, false);

  assert.equal(passwordSchema.safeParse("StrongPass1").success, true);
  assert.equal(passwordSchema.safeParse("weakpass1").success, false);
  assert.equal(passwordSchema.safeParse("WEAKPASS1").success, false);
  assert.equal(passwordSchema.safeParse("WeakPass").success, false);

  assert.equal(fullNameSchema.safeParse("John O'Connor").success, true);
  assert.equal(fullNameSchema.safeParse("J").success, false);
  assert.equal(fullNameSchema.safeParse("John123").success, false);
});

test("validateField returns normalized success and error shapes", () => {
  const success = validateField(emailSchema, "hello@example.com");
  assert.equal(success.isValid, true);
  if (success.isValid) {
    assert.equal(success.data, "hello@example.com");
    assert.equal(success.error, null);
  }

  const failure = validateField(emailSchema, "bad-email");
  assert.equal(failure.isValid, false);
  if (!failure.isValid) {
    assert.equal(failure.data, null);
    assert.equal(typeof failure.error, "string");
    assert.equal(failure.error.length > 0, true);
  }
});
