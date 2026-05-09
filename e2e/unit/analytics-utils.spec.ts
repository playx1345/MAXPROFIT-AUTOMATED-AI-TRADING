import { test, expect } from "../../playwright-fixture";
import {
  getGranularityForRange,
  formatDateLabel,
  groupTransactionsByDate,
  calculateStatusBreakdown,
  calculateCurrencyBreakdown,
  calculateKPIs,
  type Transaction,
} from "../../src/lib/analytics-utils";

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

test.describe("analytics utils", () => {
  test("maps time ranges to expected granularity", () => {
    expect(getGranularityForRange("7d")).toBe("day");
    expect(getGranularityForRange("30d")).toBe("day");
    expect(getGranularityForRange("90d")).toBe("week");
    expect(getGranularityForRange("1y")).toBe("month");
  });

  test("formats date labels by granularity", () => {
    expect(formatDateLabel("2026-01-15", "day")).toBe("Jan 15");
    expect(formatDateLabel("2026-01-15", "week")).toBe("Jan 15");
    expect(formatDateLabel("2026-01-15", "month")).toBe("Jan 2026");
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

    expect(result.length).toBeGreaterThan(0);
    const totalDeposits = result.reduce((sum, row) => sum + row.deposits, 0);
    const totalWithdrawals = result.reduce((sum, row) => sum + row.withdrawals, 0);
    const totalNet = result.reduce((sum, row) => sum + row.net, 0);

    expect(totalDeposits).toBeCloseTo(110.12, 2);
    expect(totalWithdrawals).toBeCloseTo(40.57, 2);
    expect(totalNet).toBeCloseTo(69.55, 2);
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

    expect(approved?.value).toBe(2);
    expect(pending?.value).toBe(1);
    expect(rejected?.value).toBe(1);
  });

  test("calculates currency breakdown with defaults and sorting", () => {
    const transactions: Transaction[] = [
      createTransaction({ type: "deposit", amount: 200, status: "approved", currency: "BTC" }),
      createTransaction({ type: "withdrawal", amount: 50, status: "completed", currency: "BTC" }),
      createTransaction({ type: "deposit", amount: 500, status: "approved" }),
      createTransaction({ type: "withdrawal", amount: 100, status: "pending", currency: "USDT" }),
    ];

    const breakdown = calculateCurrencyBreakdown(transactions);

    expect(breakdown.length).toBe(2);
    expect(breakdown[0].currency).toBe("USDT");
    expect(breakdown[0].total).toBe(500);

    const btc = breakdown.find((item) => item.currency === "BTC");
    expect(btc).toMatchObject({ deposits: 200, withdrawals: 50, total: 250 });
  });

  test("calculates KPI metrics with proper rounding", () => {
    const transactions: Transaction[] = [
      createTransaction({ type: "deposit", amount: 100.155, status: "approved" }),
      createTransaction({ type: "withdrawal", amount: 30.222, status: "completed" }),
      createTransaction({ type: "deposit", amount: 10, status: "pending" }),
    ];

    const kpis = calculateKPIs(transactions);

    expect(kpis.totalVolume).toBe(130.38);
    expect(kpis.totalDeposits).toBe(100.16);
    expect(kpis.totalWithdrawals).toBe(30.22);
    expect(kpis.netFlow).toBe(69.93);
    expect(kpis.avgTransactionSize).toBe(65.19);
    expect(kpis.approvalRate).toBe(66.7);
    expect(kpis.totalTransactions).toBe(3);
    expect(kpis.approvedTransactions).toBe(2);
  });
});
