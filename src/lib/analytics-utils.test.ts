import test from "node:test";
import assert from "node:assert/strict";
import {
  getGranularityForRange,
  formatDateLabel,
  groupTransactionsByDate,
  calculateStatusBreakdown,
  calculateCurrencyBreakdown,
  calculateKPIs,
  type Transaction,
} from "./analytics-utils";

function createTransaction(partial: Partial<Transaction>): Transaction {
  return {
    id: partial.id ?? crypto.randomUUID(),
    type: partial.type ?? "deposit",
    amount: partial.amount ?? 100,
    status: partial.status ?? "approved",
    currency: partial.currency ?? "USDT",
    created_at: partial.created_at ?? new Date().toISOString(),
  };
}

test("maps time ranges to expected granularity", () => {
  assert.equal(getGranularityForRange("7d"), "day");
  assert.equal(getGranularityForRange("30d"), "day");
  assert.equal(getGranularityForRange("90d"), "week");
  assert.equal(getGranularityForRange("1y"), "month");
});

test("formats date labels by granularity", () => {
  assert.equal(formatDateLabel("2026-01-15", "day"), "Jan 15");
  assert.equal(formatDateLabel("2026-01-15", "week"), "Jan 15");
  assert.equal(formatDateLabel("2026-01-15", "month"), "Jan 2026");
});

test("groups approved/completed transactions and rounds values", () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const outsideWindow = new Date(now);
  outsideWindow.setDate(outsideWindow.getDate() - 45);

  const transactions: Transaction[] = [
    createTransaction({ type: "deposit", amount: 100.123, status: "approved", created_at: now.toISOString() }),
    createTransaction({ type: "withdrawal", amount: 40.567, status: "completed", created_at: now.toISOString() }),
    createTransaction({ type: "deposit", amount: 25, status: "pending", created_at: now.toISOString() }),
    createTransaction({ type: "deposit", amount: 500, status: "approved", created_at: outsideWindow.toISOString() }),
    createTransaction({ type: "deposit", amount: 10, status: "approved", created_at: yesterday.toISOString() }),
  ];

  const result = groupTransactionsByDate(transactions, "30d");

  assert.equal(result.length > 0, true);
  const totalDeposits = result.reduce((sum, row) => sum + row.deposits, 0);
  const totalWithdrawals = result.reduce((sum, row) => sum + row.withdrawals, 0);
  const totalNet = result.reduce((sum, row) => sum + row.net, 0);

  assert.equal(Math.abs(totalDeposits - 110.12) < 0.01, true);
  assert.equal(Math.abs(totalWithdrawals - 40.57) < 0.01, true);
  assert.equal(Math.abs(totalNet - (totalDeposits - totalWithdrawals)) < 0.01, true);
});

test("calculates status breakdown and combines approved/completed", () => {
  const transactions: Transaction[] = [
    createTransaction({ status: "approved", type: "deposit" }),
    createTransaction({ status: "completed", type: "withdrawal" }),
    createTransaction({ status: "pending", type: "deposit" }),
    createTransaction({ status: "rejected", type: "withdrawal" }),
    createTransaction({ status: "ignored", type: "withdrawal" }),
  ];

  const breakdown = calculateStatusBreakdown(transactions);
  const approved = breakdown.find((item) => item.name === "Approved");
  const pending = breakdown.find((item) => item.name === "Pending");
  const rejected = breakdown.find((item) => item.name === "Rejected");

  assert.equal(approved?.value, 2);
  assert.equal(pending?.value, 1);
  assert.equal(rejected?.value, 1);
});

test("calculates currency breakdown with defaults and sorting", () => {
  const transactions: Transaction[] = [
    createTransaction({ type: "deposit", amount: 200, status: "approved", currency: "BTC" }),
    createTransaction({ type: "withdrawal", amount: 50, status: "completed", currency: "BTC" }),
    createTransaction({ type: "deposit", amount: 500, status: "approved" }),
    createTransaction({ type: "withdrawal", amount: 100, status: "pending", currency: "USDT" }),
  ];

  const breakdown = calculateCurrencyBreakdown(transactions);

  assert.equal(breakdown.length, 2);
  assert.equal(breakdown[0].currency, "USDT");
  assert.equal(breakdown[0].total, 500);

  const btc = breakdown.find((item) => item.currency === "BTC");
  assert.deepEqual(btc, { currency: "BTC", deposits: 200, withdrawals: 50, total: 250 });
});

test("calculates KPI metrics with proper rounding", () => {
  const transactions: Transaction[] = [
    createTransaction({ type: "deposit", amount: 100.155, status: "approved" }),
    createTransaction({ type: "withdrawal", amount: 30.222, status: "completed" }),
    createTransaction({ type: "deposit", amount: 10, status: "pending" }),
  ];

  const kpis = calculateKPIs(transactions);

  assert.equal(kpis.totalVolume, 130.38);
  assert.equal(kpis.totalDeposits, 100.16);
  assert.equal(kpis.totalWithdrawals, 30.22);
  assert.equal(kpis.netFlow, 69.93);
  assert.equal(kpis.avgTransactionSize, 65.19);
  assert.equal(kpis.approvalRate, 66.7);
  assert.equal(kpis.totalTransactions, 3);
  assert.equal(kpis.approvedTransactions, 2);
});
