import { format, subDays, startOfDay, startOfWeek, startOfMonth, parseISO } from 'date-fns';

export type TimeRange = '7d' | '30d' | '90d' | '1y';
export type Granularity = 'day' | 'week' | 'month';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: string;
  currency?: string;
  created_at: string;
}

export interface ChartDataPoint {
  date: string;
  deposits: number;
  withdrawals: number;
  net: number;
}

export interface StatusBreakdown {
  name: string;
  value: number;
  fill: string;
}

export interface CurrencyBreakdown {
  currency: string;
  deposits: number;
  withdrawals: number;
  total: number;
}

export function getDateRange(range: TimeRange): { start: Date; end: Date } {
  const end = new Date();
  let start: Date;
  
  switch (range) {
    case '7d':
      start = subDays(end, 7);
      break;
    case '30d':
      start = subDays(end, 30);
      break;
    case '90d':
      start = subDays(end, 90);
      break;
    case '1y':
      start = subDays(end, 365);
      break;
    default:
      start = subDays(end, 30);
  }
  
  return { start, end };
}

export function getGranularityForRange(range: TimeRange): Granularity {
  switch (range) {
    case '7d':
      return 'day';
    case '30d':
      return 'day';
    case '90d':
      return 'week';
    case '1y':
      return 'month';
    default:
      return 'day';
  }
}

function getDateKey(date: Date, granularity: Granularity): string {
  switch (granularity) {
    case 'day':
      return format(startOfDay(date), 'yyyy-MM-dd');
    case 'week':
      return format(startOfWeek(date), 'yyyy-MM-dd');
    case 'month':
      return format(startOfMonth(date), 'yyyy-MM');
    default:
      return format(startOfDay(date), 'yyyy-MM-dd');
  }
}

export function formatDateLabel(dateStr: string, granularity: Granularity): string {
  const date = parseISO(dateStr);
  switch (granularity) {
    case 'day':
      return format(date, 'MMM d');
    case 'week':
      return format(date, 'MMM d');
    case 'month':
      return format(date, 'MMM yyyy');
    default:
      return format(date, 'MMM d');
  }
}

export function groupTransactionsByDate(
  transactions: Transaction[],
  range: TimeRange
): ChartDataPoint[] {
  const granularity = getGranularityForRange(range);
  const { start, end } = getDateRange(range);
  const grouped: Record<string, { deposits: number; withdrawals: number }> = {};
  
  // Initialize all date buckets
  let current = new Date(start);
  while (current <= end) {
    const key = getDateKey(current, granularity);
    grouped[key] = { deposits: 0, withdrawals: 0 };
    
    switch (granularity) {
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }
  
  // Fill in transaction data
  transactions.forEach(tx => {
    if (tx.status !== 'approved' && tx.status !== 'completed') return;
    
    const txDate = new Date(tx.created_at);
    if (txDate < start || txDate > end) return;
    
    const key = getDateKey(txDate, granularity);
    if (!grouped[key]) return;
    
    if (tx.type === 'deposit') {
      grouped[key].deposits += tx.amount;
    } else {
      grouped[key].withdrawals += tx.amount;
    }
  });
  
  // Convert to array and sort by date
  return Object.entries(grouped)
    .map(([date, data]) => ({
      date: formatDateLabel(date, granularity),
      deposits: Math.round(data.deposits * 100) / 100,
      withdrawals: Math.round(data.withdrawals * 100) / 100,
      net: Math.round((data.deposits - data.withdrawals) * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateStatusBreakdown(
  transactions: Transaction[],
  type?: 'deposit' | 'withdrawal'
): StatusBreakdown[] {
  const filtered = type ? transactions.filter(tx => tx.type === type) : transactions;
  
  const counts = {
    approved: 0,
    pending: 0,
    rejected: 0,
    completed: 0,
  };
  
  filtered.forEach(tx => {
    const status = tx.status as keyof typeof counts;
    if (counts[status] !== undefined) {
      counts[status]++;
    }
  });
  
  return [
    { name: 'Approved', value: counts.approved + counts.completed, fill: 'hsl(var(--chart-2))' },
    { name: 'Pending', value: counts.pending, fill: 'hsl(var(--chart-4))' },
    { name: 'Rejected', value: counts.rejected, fill: 'hsl(var(--chart-5))' },
  ].filter(item => item.value > 0);
}

export function calculateCurrencyBreakdown(transactions: Transaction[]): CurrencyBreakdown[] {
  const currencies: Record<string, { deposits: number; withdrawals: number }> = {};
  
  transactions.forEach(tx => {
    if (tx.status !== 'approved' && tx.status !== 'completed') return;
    
    const currency = tx.currency || 'USDT';
    if (!currencies[currency]) {
      currencies[currency] = { deposits: 0, withdrawals: 0 };
    }
    
    if (tx.type === 'deposit') {
      currencies[currency].deposits += tx.amount;
    } else {
      currencies[currency].withdrawals += tx.amount;
    }
  });
  
  return Object.entries(currencies)
    .map(([currency, data]) => ({
      currency,
      deposits: Math.round(data.deposits * 100) / 100,
      withdrawals: Math.round(data.withdrawals * 100) / 100,
      total: Math.round((data.deposits + data.withdrawals) * 100) / 100,
    }))
    .sort((a, b) => b.total - a.total);
}

export function calculateKPIs(transactions: Transaction[]) {
  const approved = transactions.filter(tx => tx.status === 'approved' || tx.status === 'completed');
  const deposits = approved.filter(tx => tx.type === 'deposit');
  const withdrawals = approved.filter(tx => tx.type === 'withdrawal');
  
  const totalDeposits = deposits.reduce((sum, tx) => sum + tx.amount, 0);
  const totalWithdrawals = withdrawals.reduce((sum, tx) => sum + tx.amount, 0);
  const totalVolume = totalDeposits + totalWithdrawals;
  const netFlow = totalDeposits - totalWithdrawals;
  
  const avgTransactionSize = approved.length > 0 
    ? totalVolume / approved.length 
    : 0;
  
  const approvalRate = transactions.length > 0 
    ? (approved.length / transactions.length) * 100 
    : 0;
  
  return {
    totalVolume: Math.round(totalVolume * 100) / 100,
    totalDeposits: Math.round(totalDeposits * 100) / 100,
    totalWithdrawals: Math.round(totalWithdrawals * 100) / 100,
    netFlow: Math.round(netFlow * 100) / 100,
    avgTransactionSize: Math.round(avgTransactionSize * 100) / 100,
    approvalRate: Math.round(approvalRate * 10) / 10,
    totalTransactions: transactions.length,
    approvedTransactions: approved.length,
  };
}
