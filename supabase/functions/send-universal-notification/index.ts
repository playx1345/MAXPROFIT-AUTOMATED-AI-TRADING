import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type NotificationType =
  | "deposit_confirmation"
  | "account_update"
  | "failed_transaction"
  | "security_alert"
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "withdrawal_completed"
  | "kyc_verified"
  | "kyc_rejected"
  | "investment_started"
  | "investment_completed"
  | "referral_bonus";

interface UniversalNotificationRequest {
  user_name: string;
  user_email: string;
  notification_type: NotificationType;
  amount?: number;
  currency?: string;
  date: string;
  details?: string;
  transaction_id?: string;
  additional_info?: Record<string, string>;
  wallet_address?: string;
  network?: string;
  fee?: number;
  net_amount?: number;
  tx_hash?: string;
}

const SUPPORT_EMAIL = "support@win-tradex.com";

const getNotificationConfig = (type: NotificationType) => {
  const configs: Record<NotificationType, { subject: string; icon: string; color: string; title: string; bgColor: string; borderColor: string; accentColor: string }> = {
    deposit_confirmation: {
      subject: "Deposit Confirmed",
      icon: "✅",
      color: "#0ecb81",
      title: "Deposit Successfully Processed",
      bgColor: "#0ecb8115",
      borderColor: "#0ecb8140",
      accentColor: "#0ecb81",
    },
    account_update: {
      subject: "Account Updated",
      icon: "👤",
      color: "#3b82f6",
      title: "Account Information Updated",
      bgColor: "#3b82f615",
      borderColor: "#3b82f640",
      accentColor: "#3b82f6",
    },
    failed_transaction: {
      subject: "Transaction Failed",
      icon: "❌",
      color: "#f6465d",
      title: "Transaction Could Not Be Processed",
      bgColor: "#f6465d15",
      borderColor: "#f6465d40",
      accentColor: "#f6465d",
    },
    security_alert: {
      subject: "Security Alert",
      icon: "🚨",
      color: "#f6465d",
      title: "Important Security Notice",
      bgColor: "#f6465d15",
      borderColor: "#f6465d40",
      accentColor: "#f6465d",
    },
    withdrawal_approved: {
      subject: "Withdrawal Approved",
      icon: "💸",
      color: "#0ecb81",
      title: "Your Withdrawal Has Been Approved",
      bgColor: "#0ecb8115",
      borderColor: "#0ecb8140",
      accentColor: "#0ecb81",
    },
    withdrawal_rejected: {
      subject: "Withdrawal Rejected",
      icon: "⚠️",
      color: "#f0b90b",
      title: "Withdrawal Request Declined",
      bgColor: "#f0b90b15",
      borderColor: "#f0b90b40",
      accentColor: "#f0b90b",
    },
    withdrawal_completed: {
      subject: "Withdrawal Completed",
      icon: "✅",
      color: "#0ecb81",
      title: "Withdrawal Successfully Sent",
      bgColor: "#0ecb8115",
      borderColor: "#0ecb8140",
      accentColor: "#0ecb81",
    },
    kyc_verified: {
      subject: "KYC Verification Complete",
      icon: "✓",
      color: "#0ecb81",
      title: "Identity Verification Successful",
      bgColor: "#0ecb8115",
      borderColor: "#0ecb8140",
      accentColor: "#0ecb81",
    },
    kyc_rejected: {
      subject: "KYC Verification Issue",
      icon: "📋",
      color: "#f0b90b",
      title: "Additional Verification Required",
      bgColor: "#f0b90b15",
      borderColor: "#f0b90b40",
      accentColor: "#f0b90b",
    },
    investment_started: {
      subject: "Investment Activated",
      icon: "📈",
      color: "#8b5cf6",
      title: "Your Investment Is Now Active",
      bgColor: "#8b5cf615",
      borderColor: "#8b5cf640",
      accentColor: "#8b5cf6",
    },
    investment_completed: {
      subject: "Investment Completed",
      icon: "🎉",
      color: "#0ecb81",
      title: "Investment Successfully Completed",
      bgColor: "#0ecb8115",
      borderColor: "#0ecb8140",
      accentColor: "#0ecb81",
    },
    referral_bonus: {
      subject: "Referral Bonus Earned",
      icon: "🎁",
      color: "#d4af37",
      title: "You've Earned a Referral Bonus!",
      bgColor: "#d4af3715",
      borderColor: "#d4af3740",
      accentColor: "#d4af37",
    },
  };
  return configs[type];
};

const maskAddress = (address: string) => {
  if (!address || address.length < 12) return address || "N/A";
  return `${address.slice(0, 8)}****${address.slice(-6)}`;
};

const isWithdrawalType = (type: NotificationType) =>
  ["withdrawal_approved", "withdrawal_rejected", "withdrawal_completed"].includes(type);

const handler = async (req: Request): Promise<Response> => {
  console.log("send-universal-notification: Request received");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      user_name,
      user_email,
      notification_type,
      amount,
      currency = "USDT",
      date,
      details,
      transaction_id,
      additional_info,
      wallet_address,
      network = "TRC-20",
      fee = 0,
      net_amount,
      tx_hash,
    }: UniversalNotificationRequest = await req.json();

    console.log(`Processing ${notification_type} notification for ${user_email}`);

    const config = getNotificationConfig(notification_type);

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });

    // Build additional info rows
    let additionalInfoHtml = "";
    if (additional_info && Object.keys(additional_info).length > 0) {
      additionalInfoHtml = Object.entries(additional_info)
        .map(
          ([key, value]) => `
            <div class="detail-row">
              <span class="detail-label">${key}</span>
              <span class="detail-value">${value}</span>
            </div>
          `
        )
        .join("");
    }

    const subject = amount && currency
      ? `${config.icon} ${config.subject} - ${amount.toLocaleString()} ${currency.toUpperCase()}`
      : `${config.icon} ${config.subject}`;

    const orderNumber = transaction_id ? transaction_id.slice(0, 12).toUpperCase() : "";
    const actualNetAmount = net_amount ?? (amount ? amount - fee : 0);
    const maskedAddr = wallet_address ? maskAddress(wallet_address) : "";

    // Use Binance-style receipt for withdrawal types
    const useReceiptLayout = isWithdrawalType(notification_type) && amount;

    let htmlContent: string;

    if (useReceiptLayout) {
      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${config.title}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0b0e11; color: #eaecef; line-height: 1.6; }
            .wrapper { max-width: 600px; margin: 0 auto; background-color: #181a20; }
            .header { background: linear-gradient(135deg, #1e2329 0%, #0b0e11 100%); padding: 28px 32px; border-bottom: 1px solid #2b3139; }
            .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .logo-area { display: flex; align-items: center; gap: 10px; }
            .logo-text { font-size: 22px; font-weight: 700; color: #d4af37; letter-spacing: -0.5px; }
            .logo-dot { width: 8px; height: 8px; background: #d4af37; border-radius: 50%; }
            .receipt-label { font-size: 11px; color: #848e9c; text-transform: uppercase; letter-spacing: 2px; background: #2b3139; padding: 4px 12px; border-radius: 4px; }
            .header-title { text-align: center; }
            .header-title h1 { font-size: 20px; color: #eaecef; font-weight: 600; margin-bottom: 4px; }
            .header-title p { font-size: 13px; color: #848e9c; }
            .status-banner { padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #2b3139; }
            .status-left { display: flex; align-items: center; gap: 10px; }
            .status-dot { width: 10px; height: 10px; border-radius: 50%; }
            .status-text { font-size: 14px; font-weight: 600; }
            .status-time { font-size: 12px; color: #848e9c; }
            .amount-section { padding: 28px 32px; text-align: center; border-bottom: 1px solid #2b3139; background: linear-gradient(180deg, ${config.accentColor}08 0%, transparent 100%); }
            .amount-label { font-size: 12px; color: #848e9c; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
            .amount-value { font-size: 36px; font-weight: 700; color: #eaecef; margin-bottom: 4px; }
            .amount-value .currency { font-size: 18px; color: #d4af37; font-weight: 600; margin-left: 6px; }
            .amount-usd { font-size: 14px; color: #848e9c; }
            .section { padding: 24px 32px; border-bottom: 1px solid #2b3139; }
            .section-title { font-size: 13px; font-weight: 600; color: #d4af37; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
            .section-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, #d4af3740, transparent); }
            .detail-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #2b313930; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-size: 13px; color: #848e9c; flex-shrink: 0; }
            .detail-value { font-size: 13px; color: #eaecef; font-weight: 500; text-align: right; max-width: 60%; word-break: break-all; }
            .detail-value.mono { font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace; font-size: 12px; }
            .detail-value.highlight { color: #d4af37; font-weight: 600; }
            .network-badge { display: inline-flex; align-items: center; gap: 6px; background: #2b3139; padding: 4px 12px; border-radius: 4px; font-size: 12px; color: #d4af37; font-weight: 600; }
            .network-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: #0ecb81; }
            .fee-breakdown { background: #1e2329; border-radius: 8px; padding: 16px; margin-top: 8px; }
            .fee-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
            .fee-row .label { color: #848e9c; }
            .fee-row .value { color: #eaecef; }
            .fee-total { border-top: 1px dashed #2b3139; margin-top: 8px; padding-top: 10px; }
            .fee-total .label { color: #eaecef; font-weight: 600; }
            .fee-total .value { color: #0ecb81; font-weight: 700; font-size: 15px; }
            ${details ? `
            .details-msg { background: ${config.bgColor}; border: 1px solid ${config.borderColor}; border-radius: 8px; padding: 16px; margin: 16px 0; }
            .details-msg p { color: ${config.color}; font-size: 13px; margin: 0; }
            ` : ""}
            .security-section { padding: 24px 32px; background: linear-gradient(180deg, #1e2329 0%, #181a20 100%); border-bottom: 1px solid #2b3139; }
            .security-alert { background: rgba(240, 185, 11, 0.08); border: 1px solid rgba(240, 185, 11, 0.2); border-radius: 8px; padding: 16px; }
            .security-alert h4 { color: #f0b90b; font-size: 13px; margin-bottom: 8px; }
            .security-alert p { color: #848e9c; font-size: 12px; }
            .security-alert a { color: #f0b90b; text-decoration: underline; }
            .cta-section { padding: 24px 32px; text-align: center; border-bottom: 1px solid #2b3139; }
            .cta-btn { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); color: #0b0e11; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase; }
            .cta-secondary { display: block; margin-top: 12px; color: #848e9c; font-size: 12px; }
            .cta-secondary a { color: #d4af37; text-decoration: none; }
            .footer { padding: 24px 32px; text-align: center; background: #0b0e11; }
            .footer-links { margin-bottom: 16px; }
            .footer-links a { color: #848e9c; font-size: 12px; text-decoration: none; margin: 0 12px; }
            .footer-divider { height: 1px; background: #2b3139; margin: 16px 0; }
            .footer-legal { font-size: 11px; color: #5e6673; line-height: 1.6; }
            .footer-legal p { margin: 4px 0; }
            .footer-brand { color: #d4af37; font-weight: 600; font-size: 14px; margin-top: 16px; }
            @media (max-width: 480px) {
              .header, .section, .cta-section, .security-section, .footer { padding-left: 20px; padding-right: 20px; }
              .amount-value { font-size: 28px; }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <div class="header-top">
                <div class="logo-area">
                  <span class="logo-dot"></span>
                  <span class="logo-text">Win-Tradex</span>
                </div>
                <span class="receipt-label">Receipt</span>
              </div>
              <div class="header-title">
                <h1>${config.icon} ${config.title}</h1>
                ${orderNumber ? `<p>Order #${orderNumber}</p>` : ""}
              </div>
            </div>

            <div class="status-banner">
              <div class="status-left">
                <span class="status-dot" style="background: ${config.color};"></span>
                <span class="status-text" style="color: ${config.color};">${notification_type.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
              </div>
              <span class="status-time">${formattedDate}</span>
            </div>

            <div class="amount-section">
              <div class="amount-label">Amount</div>
              <div class="amount-value">
                ${amount!.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span class="currency">${currency.toUpperCase()}</span>
              </div>
              <div class="amount-usd">≈ $${amount!.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>
            </div>

            ${details ? `
            <div class="section">
              <div class="details-msg"><p>${details}</p></div>
            </div>
            ` : ""}

            <div class="section">
              <div class="section-title">Transaction Details</div>
              ${transaction_id ? `
              <div class="detail-row">
                <span class="detail-label">Order ID</span>
                <span class="detail-value mono">${transaction_id}</span>
              </div>
              ` : ""}
              <div class="detail-row">
                <span class="detail-label">Coin</span>
                <span class="detail-value highlight">${currency.toUpperCase()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Network</span>
                <span class="detail-value">
                  <span class="network-badge"><span class="dot"></span>${network}</span>
                </span>
              </div>
              ${wallet_address ? `
              <div class="detail-row">
                <span class="detail-label">Address</span>
                <span class="detail-value mono">${maskedAddr}</span>
              </div>
              ` : ""}
              ${tx_hash ? `
              <div class="detail-row">
                <span class="detail-label">TxHash</span>
                <span class="detail-value mono" style="font-size: 11px; color: #0ecb81;">${tx_hash}</span>
              </div>
              ` : ""}
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${formattedDate}</span>
              </div>
              ${additionalInfoHtml}
            </div>

            ${fee > 0 ? `
            <div class="section">
              <div class="section-title">Fee Breakdown</div>
              <div class="fee-breakdown">
                <div class="fee-row">
                  <span class="label">Amount</span>
                  <span class="value">${amount!.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${currency.toUpperCase()}</span>
                </div>
                <div class="fee-row">
                  <span class="label">Network Fee</span>
                  <span class="value">-${fee.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${currency.toUpperCase()}</span>
                </div>
                <div class="fee-row fee-total">
                  <span class="label">You Receive</span>
                  <span class="value">${actualNetAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${currency.toUpperCase()}</span>
                </div>
              </div>
            </div>
            ` : ""}

            <div class="security-section">
              <div class="security-alert">
                <h4>⚠️ Security Notice</h4>
                <p>
                  If you did not initiate this transaction, please
                  <a href="mailto:${SUPPORT_EMAIL}">freeze your account immediately</a>.
                  Do not share your credentials or verification codes.
                </p>
              </div>
            </div>

            <div class="cta-section">
              <a href="https://win-tradex.com/dashboard/transactions" class="cta-btn">View Transaction</a>
              <span class="cta-secondary">
                Need help? <a href="mailto:${SUPPORT_EMAIL}">Contact Support</a>
              </span>
            </div>

            <div class="footer">
              <div class="footer-links">
                <a href="https://win-tradex.com">Home</a>
                <a href="https://win-tradex.com/dashboard">Dashboard</a>
                <a href="mailto:${SUPPORT_EMAIL}">Support</a>
              </div>
              <div class="footer-divider"></div>
              <div class="footer-legal">
                <p>This is an automated notification. Please do not reply.</p>
                <p>© ${new Date().getFullYear()} Win-Tradex. All rights reserved.</p>
              </div>
              <div class="footer-brand">Win-Tradex</div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      // Standard notification layout for non-withdrawal types
      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${config.title}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0b0e11; color: #eaecef; line-height: 1.6; }
            .wrapper { max-width: 600px; margin: 0 auto; background-color: #181a20; }
            .header { background: linear-gradient(135deg, #1e2329 0%, #0b0e11 100%); padding: 28px 32px; border-bottom: 1px solid #2b3139; text-align: center; }
            .logo-area { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px; }
            .logo-text { font-size: 22px; font-weight: 700; color: #d4af37; }
            .logo-dot { width: 8px; height: 8px; background: #d4af37; border-radius: 50%; }
            .header h1 { font-size: 20px; color: #eaecef; font-weight: 600; margin-bottom: 4px; }
            .header p { font-size: 13px; color: #848e9c; }
            .content { padding: 32px; }
            .greeting { color: #eaecef; font-size: 16px; margin-bottom: 20px; }
            .status-badge { display: inline-block; background: ${config.bgColor}; border: 1px solid ${config.borderColor}; color: ${config.color}; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
            .details-msg { background: ${config.bgColor}; border: 1px solid ${config.borderColor}; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
            .details-msg p { color: ${config.color}; font-size: 13px; margin: 0; }
            .section { padding: 0 0 24px 0; border-bottom: 1px solid #2b3139; margin-bottom: 24px; }
            .section-title { font-size: 13px; font-weight: 600; color: #d4af37; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #2b313930; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-size: 13px; color: #848e9c; }
            .detail-value { font-size: 13px; color: #eaecef; font-weight: 500; text-align: right; max-width: 60%; word-break: break-word; }
            .detail-value.mono { font-family: 'Courier New', monospace; font-size: 12px; }
            .detail-value.highlight { color: ${config.color}; font-weight: 600; }
            .amount-section { text-align: center; padding: 24px; background: ${config.accentColor}08; border-radius: 8px; margin-bottom: 24px; }
            .amount-value { font-size: 32px; font-weight: 700; color: #eaecef; }
            .amount-value .currency { font-size: 16px; color: #d4af37; margin-left: 6px; }
            .cta-section { text-align: center; padding: 20px 0; }
            .cta-btn { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); color: #0b0e11; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 700; font-size: 14px; text-transform: uppercase; }
            .cta-secondary { display: block; margin-top: 12px; color: #848e9c; font-size: 12px; }
            .cta-secondary a { color: #d4af37; text-decoration: none; }
            .security-note { background: rgba(240, 185, 11, 0.08); border: 1px solid rgba(240, 185, 11, 0.2); border-radius: 8px; padding: 16px; margin-top: 24px; }
            .security-note p { color: #848e9c; font-size: 12px; margin: 0; }
            .footer { padding: 24px 32px; text-align: center; background: #0b0e11; border-top: 1px solid #2b3139; }
            .footer-legal { font-size: 11px; color: #5e6673; line-height: 1.6; }
            .footer-legal p { margin: 4px 0; }
            .footer-brand { color: #d4af37; font-weight: 600; font-size: 14px; margin-top: 16px; }
            @media (max-width: 480px) {
              .header, .content, .footer { padding-left: 20px; padding-right: 20px; }
              .amount-value { font-size: 24px; }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <div class="logo-area">
                <span class="logo-dot"></span>
                <span class="logo-text">Win-Tradex</span>
              </div>
              <h1>${config.icon} ${config.title}</h1>
              <p>Account Notification</p>
            </div>

            <div class="content">
              <p class="greeting">Dear ${user_name},</p>

              <span class="status-badge">${config.icon} ${notification_type.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>

              ${details ? `<div class="details-msg"><p>${details}</p></div>` : ""}

              ${amount ? `
              <div class="amount-section">
                <div style="font-size: 12px; color: #848e9c; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Amount</div>
                <div class="amount-value">
                  ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  <span class="currency">${currency.toUpperCase()}</span>
                </div>
              </div>
              ` : ""}

              <div class="section">
                <div class="section-title">Details</div>
                <div class="detail-row">
                  <span class="detail-label">Date</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
                ${transaction_id ? `
                <div class="detail-row">
                  <span class="detail-label">Transaction ID</span>
                  <span class="detail-value mono">${transaction_id}</span>
                </div>
                ` : ""}
                ${additionalInfoHtml}
              </div>

              <div class="cta-section">
                <a href="https://win-tradex.com/dashboard" class="cta-btn">View Dashboard</a>
                <span class="cta-secondary">
                  Need help? <a href="mailto:${SUPPORT_EMAIL}">Contact Support</a>
                </span>
              </div>

              <div class="security-note">
                <p>If you have concerns about this activity, please contact support immediately at <a href="mailto:${SUPPORT_EMAIL}" style="color: #f0b90b;">${SUPPORT_EMAIL}</a></p>
              </div>
            </div>

            <div class="footer">
              <div class="footer-legal">
                <p>This is an automated notification. Please do not reply.</p>
                <p>© ${new Date().getFullYear()} Win-Tradex. All rights reserved.</p>
              </div>
              <div class="footer-brand">Win-Tradex</div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Win-Tradex <onboarding@resend.dev>",
      // NOTE: For production, change to: "Win-Tradex <notifications@win-tradex.com>"
      to: [user_email],
      subject,
      html: htmlContent,
    });

    console.log(`${notification_type} notification sent successfully:`, emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message_id: emailResponse.data?.id,
        notification_type,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-universal-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
