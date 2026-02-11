import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Copy, Check, Shield, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TransactionData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  wallet_address: string | null;
  transaction_hash: string | null;
  admin_notes: string | null;
  memo_tag?: string | null;
  type?: string;
}

interface TransactionReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionData | null;
}

const TransactionReceiptDialog = ({ open, onOpenChange, transaction }: TransactionReceiptDialogProps) => {
  const { t } = useTranslation();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!transaction) return null;

  const hasFeeSubmitted = transaction.admin_notes?.toLowerCase().includes('fee hash:') ||
    transaction.admin_notes?.toLowerCase().includes('fee payment hash:');
  const isUnderReview = transaction.admin_notes?.toLowerCase().includes('under_review');

  const displayStatus = transaction.status === 'pending' && isUnderReview
    ? 'under review'
    : transaction.status === 'pending' && hasFeeSubmitted
      ? 'processing'
      : transaction.status;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return "bg-green-500 text-white";
      case "under review":
        return "bg-orange-500 text-white";
      case "processing":
        return "bg-blue-500 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getExplorerUrl = () => {
    if (!transaction.transaction_hash) return null;
    switch (transaction.currency) {
      case "usdt":
        return `https://tronscan.org/#/transaction/${transaction.transaction_hash}`;
      case "btc":
        return `https://blockchair.com/bitcoin/transaction/${transaction.transaction_hash}`;
      case "eth":
      case "usdc":
        return `https://etherscan.io/tx/${transaction.transaction_hash}`;
      case "xrp":
        return `https://xrpscan.com/tx/${transaction.transaction_hash}`;
      default:
        return null;
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0"
      onClick={() => copyToClipboard(text, field)}
    >
      {copiedField === field ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Transaction Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount & Status Header */}
          <div className="text-center py-3 bg-muted/50 rounded-lg">
            <p className="text-3xl font-bold font-display">
              ${transaction.amount.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground uppercase mt-1">
              {transaction.currency}
            </p>
            <Badge className={`mt-2 ${getStatusColor(displayStatus)}`}>
              {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
            </Badge>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div className="space-y-3">
            <DetailRow
              label="Transaction ID"
              value={transaction.id.slice(0, 8) + '...' + transaction.id.slice(-8)}
              fullValue={transaction.id}
              copyField="txId"
              CopyButton={CopyButton}
            />

            <DetailRow
              label="Type"
              value={(transaction.type || 'withdrawal').charAt(0).toUpperCase() + (transaction.type || 'withdrawal').slice(1)}
            />

            <DetailRow
              label="Date & Time"
              value={format(new Date(transaction.created_at), "MMM dd, yyyy 'at' HH:mm:ss")}
            />

            <DetailRow
              label="Currency"
              value={transaction.currency.toUpperCase()}
            />

            {transaction.wallet_address && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Wallet Address</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-mono break-all flex-1 bg-muted/50 px-2 py-1 rounded">
                    {transaction.wallet_address}
                  </p>
                  <CopyButton text={transaction.wallet_address} field="wallet" />
                </div>
              </div>
            )}

            {transaction.currency === 'xrp' && transaction.memo_tag && (
              <DetailRow
                label="Memo Tag"
                value={transaction.memo_tag}
                copyField="memo"
                fullValue={transaction.memo_tag}
                CopyButton={CopyButton}
              />
            )}

            {transaction.transaction_hash && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Transaction Hash</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-mono break-all flex-1 bg-muted/50 px-2 py-1 rounded">
                    {transaction.transaction_hash}
                  </p>
                  <CopyButton text={transaction.transaction_hash} field="hash" />
                </div>
                {getExplorerUrl() && (
                  <a
                    href={getExplorerUrl()!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    View on Blockchain Explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Status Information */}
          <div className="space-y-2">
            {displayStatus === 'pending' && !hasFeeSubmitted && (
              <div className="flex items-start gap-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Confirmation fee payment required to proceed with this withdrawal.</span>
              </div>
            )}
            {displayStatus === 'processing' && (
              <div className="flex items-start gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 p-3 rounded-lg">
                <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Fee submitted. Your withdrawal is being verified and will be processed within 24 hours.</span>
              </div>
            )}
            {displayStatus === 'under review' && (
              <div className="flex items-start gap-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-500/10 p-3 rounded-lg">
                <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>This withdrawal is under security review for verification purposes.</span>
              </div>
            )}
            {(displayStatus === 'approved' || displayStatus === 'completed') && (
              <div className="flex items-start gap-2 text-xs text-green-600 dark:text-green-400 bg-green-500/10 p-3 rounded-lg">
                <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>This withdrawal has been approved and processed.</span>
              </div>
            )}
            {displayStatus === 'rejected' && (
              <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-500/10 p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>This withdrawal has been rejected. Please contact support for more information.</span>
              </div>
            )}
            {transaction.admin_notes && transaction.admin_notes.includes('BLOCKCHAIN CONFIRMATION FAIL') && (
              <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{transaction.admin_notes.replace('BLOCKCHAIN CONFIRMATION FAIL: ', '')}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DetailRow = ({
  label,
  value,
  fullValue,
  copyField,
  CopyButton,
}: {
  label: string;
  value: string;
  fullValue?: string;
  copyField?: string;
  CopyButton?: React.ComponentType<{ text: string; field: string }>;
}) => (
  <div className="flex items-center justify-between gap-2">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <div className="flex items-center gap-1">
      <p className="text-sm font-medium text-right">{value}</p>
      {copyField && fullValue && CopyButton && (
        <CopyButton text={fullValue} field={copyField} />
      )}
    </div>
  </div>
);

export default TransactionReceiptDialog;
