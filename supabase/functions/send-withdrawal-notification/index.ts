import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WithdrawalNotificationRequest {
  user_name: string;
  user_email: string;
  amount: number;
  currency: string;
  date: string;
  transaction_id: string;
  wallet_address?: string;
  network?: string;
  fee?: number;
  net_amount?: number;
  status?: 'pending' | 'processing' | 'approved' | 'completed' | 'rejected';
  tx_hash?: string;
  ip_address?: string;
  device?: string;
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
    pending: { label: "Pending", color: "#f59e0b", bgColor: "#fffbeb", icon: "⏳" },
    processing: { label: "Processing", color: "#3b82f6", bgColor: "#eff6ff", icon: "🔄" },
    approved: { label: "Approved", color: "#059669", bgColor: "#ecfdf5", icon: "✅" },
    completed: { label: "Completed", color: "#059669", bgColor: "#ecfdf5", icon: "✅" },
    rejected: { label: "Rejected", color: "#dc2626", bgColor: "#fef2f2", icon: "❌" },
  };
  return configs[status] || configs.pending;
};

const maskAddress = (address: string) => {
  if (!address || address.length < 12) return address || "N/A";
  return `${address.slice(0, 8)}****${address.slice(-6)}`;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-withdrawal-notification: Request received");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      user_name,
      user_email,
      amount,
      currency = "USDT",
      date,
      transaction_id,
      wallet_address,
      network = "TRC-20",
      fee = 0,
      net_amount,
      status = "pending",
      tx_hash,
      ip_address,
      device,
    }: WithdrawalNotificationRequest = await req.json();

    console.log(`Processing withdrawal notification for ${user_email}`);
    console.log(`Transaction ID: ${transaction_id}, Amount: ${amount} ${currency}, Status: ${status}`);

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });

    const statusConfig = getStatusConfig(status);
    const maskedAddress = wallet_address ? maskAddress(wallet_address) : "N/A";
    const actualNetAmount = net_amount ?? (amount - fee);
    const orderNumber = transaction_id.slice(0, 12).toUpperCase();

    const emailResponse = await resend.emails.send({
      from: "Win-Tradex <onboarding@resend.dev>",
      // NOTE: For production, change to: "Win-Tradex <notifications@win-tradex.com>"
      to: [user_email],
      subject: `Withdrawal ${statusConfig.label} - ${amount.toLocaleString()} ${currency.toUpperCase()} | Order #${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Withdrawal Receipt</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0b0e11; color: #eaecef; line-height: 1.6; }
            .wrapper { max-width: 600px; margin: 0 auto; background-color: #181a20; }

            /* Header */
            .header { background: linear-gradient(135deg, #1e2329 0%, #0b0e11 100%); padding: 28px 32px; border-bottom: 1px solid #2b3139; }
            .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .logo-area { display: flex; align-items: center; gap: 10px; }
            .logo-text { font-size: 22px; font-weight: 700; color: #d4af37; letter-spacing: -0.5px; }
            .logo-dot { width: 8px; height: 8px; background: #d4af37; border-radius: 50%; }
            .receipt-label { font-size: 11px; color: #848e9c; text-transform: uppercase; letter-spacing: 2px; background: #2b3139; padding: 4px 12px; border-radius: 4px; }

            .header-title { text-align: center; }
            .header-title h1 { font-size: 20px; color: #eaecef; font-weight: 600; margin-bottom: 4px; }
            .header-title p { font-size: 13px; color: #848e9c; }

            /* Status Banner */
            .status-banner { padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #2b3139; }
            .status-left { display: flex; align-items: center; gap: 10px; }
            .status-dot { width: 10px; height: 10px; border-radius: 50%; }
            .status-text { font-size: 14px; font-weight: 600; }
            .status-time { font-size: 12px; color: #848e9c; }

            /* Amount Section */
            .amount-section { padding: 28px 32px; text-align: center; border-bottom: 1px solid #2b3139; background: linear-gradient(180deg, rgba(212,175,55,0.03) 0%, transparent 100%); }
            .amount-label { font-size: 12px; color: #848e9c; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
            .amount-value { font-size: 36px; font-weight: 700; color: #eaecef; margin-bottom: 4px; }
            .amount-value .currency { font-size: 18px; color: #d4af37; font-weight: 600; margin-left: 6px; }
            .amount-usd { font-size: 14px; color: #848e9c; }

            /* Order Details */
            .section { padding: 24px 32px; border-bottom: 1px solid #2b3139; }
            .section-title { font-size: 13px; font-weight: 600; color: #d4af37; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
            .section-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, #d4af3740, transparent); }

            .detail-grid { width: 100%; }
            .detail-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #2b313930; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-size: 13px; color: #848e9c; flex-shrink: 0; }
            .detail-value { font-size: 13px; color: #eaecef; font-weight: 500; text-align: right; max-width: 60%; word-break: break-all; }
            .detail-value.mono { font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace; font-size: 12px; letter-spacing: 0.3px; }
            .detail-value.highlight { color: #d4af37; font-weight: 600; }
            .detail-value.success { color: #0ecb81; }
            .detail-value.warning { color: #f0b90b; }

            /* Fee Breakdown */
            .fee-breakdown { background: #1e2329; border-radius: 8px; padding: 16px; margin-top: 8px; }
            .fee-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
            .fee-row .label { color: #848e9c; }
            .fee-row .value { color: #eaecef; }
            .fee-total { border-top: 1px dashed #2b3139; margin-top: 8px; padding-top: 10px; }
            .fee-total .label { color: #eaecef; font-weight: 600; }
            .fee-total .value { color: #0ecb81; font-weight: 700; font-size: 15px; }

            /* Network Badge */
            .network-badge { display: inline-flex; align-items: center; gap: 6px; background: #2b3139; padding: 4px 12px; border-radius: 4px; font-size: 12px; color: #d4af37; font-weight: 600; }
            .network-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: #0ecb81; }

            /* Security Section */
            .security-section { padding: 24px 32px; background: linear-gradient(180deg, #1e2329 0%, #181a20 100%); border-bottom: 1px solid #2b3139; }
            .security-alert { background: rgba(240, 185, 11, 0.08); border: 1px solid rgba(240, 185, 11, 0.2); border-radius: 8px; padding: 16px; margin-bottom: 16px; }
            .security-alert h4 { color: #f0b90b; font-size: 13px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
            .security-alert p { color: #848e9c; font-size: 12px; line-height: 1.6; }
            .security-alert a { color: #f0b90b; text-decoration: underline; }

            .security-tips { list-style: none; padding: 0; }
            .security-tips li { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; font-size: 12px; color: #848e9c; }
            .security-tips li .tip-icon { color: #0ecb81; font-size: 14px; flex-shrink: 0; margin-top: 1px; }

            /* Device Info */
            .device-info { background: #1e2329; border-radius: 8px; padding: 12px 16px; margin-top: 12px; display: flex; gap: 20px; flex-wrap: wrap; }
            .device-item { font-size: 11px; }
            .device-item .di-label { color: #848e9c; }
            .device-item .di-value { color: #eaecef; font-weight: 500; }

            /* CTA */
            .cta-section { padding: 24px 32px; text-align: center; border-bottom: 1px solid #2b3139; }
            .cta-btn { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); color: #0b0e11; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase; }
            .cta-secondary { display: block; margin-top: 12px; color: #848e9c; font-size: 12px; }
            .cta-secondary a { color: #d4af37; text-decoration: none; }

            /* Footer */
            .footer { padding: 24px 32px; text-align: center; background: #0b0e11; }
            .footer-links { margin-bottom: 16px; }
            .footer-links a { color: #848e9c; font-size: 12px; text-decoration: none; margin: 0 12px; }
            .footer-links a:hover { color: #d4af37; }
            .footer-divider { height: 1px; background: #2b3139; margin: 16px 0; }
            .footer-legal { font-size: 11px; color: #5e6673; line-height: 1.6; }
            .footer-legal p { margin: 4px 0; }
            .footer-brand { color: #d4af37; font-weight: 600; font-size: 14px; margin-top: 16px; }

            /* Responsive */
            @media (max-width: 480px) {
              .header, .section, .cta-section, .security-section, .footer { padding-left: 20px; padding-right: 20px; }
              .amount-value { font-size: 28px; }
              .device-info { flex-direction: column; gap: 8px; }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <!-- Header -->
            <div class="header">
              <div class="header-top">
                <div class="logo-area">
                  <span class="logo-dot"></span>
                  <span class="logo-text">Win-Tradex</span>
                </div>
                <span class="receipt-label">Receipt</span>
              </div>
              <div class="header-title">
                <h1>${statusConfig.icon} Withdrawal ${statusConfig.label}</h1>
                <p>Order #${orderNumber}</p>
              </div>
            </div>

            <!-- Status Banner -->
            <div class="status-banner">
              <div class="status-left">
                <span class="status-dot" style="background: ${statusConfig.color};"></span>
                <span class="status-text" style="color: ${statusConfig.color};">${statusConfig.label}</span>
              </div>
              <span class="status-time">${formattedDate}</span>
            </div>

            <!-- Amount Section -->
            <div class="amount-section">
              <div class="amount-label">Withdrawal Amount</div>
              <div class="amount-value">
                ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span class="currency">${currency.toUpperCase()}</span>
              </div>
              <div class="amount-usd">≈ $${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>
            </div>

            <!-- Transaction Details -->
            <div class="section">
              <div class="section-title">Transaction Details</div>
              <div class="detail-grid">
                <div class="detail-row">
                  <span class="detail-label">Order ID</span>
                  <span class="detail-value mono">${transaction_id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Coin</span>
                  <span class="detail-value highlight">${currency.toUpperCase()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Network</span>
                  <span class="detail-value">
                    <span class="network-badge">
                      <span class="dot"></span>
                      ${network}
                    </span>
                  </span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Address</span>
                  <span class="detail-value mono">${maskedAddress}</span>
                </div>
                ${wallet_address ? `
                <div class="detail-row">
                  <span class="detail-label">Full Address</span>
                  <span class="detail-value mono" style="font-size: 11px;">${wallet_address}</span>
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
              </div>
            </div>

            <!-- Fee Breakdown -->
            <div class="section">
              <div class="section-title">Fee Breakdown</div>
              <div class="fee-breakdown">
                <div class="fee-row">
                  <span class="label">Withdrawal Amount</span>
                  <span class="value">${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${currency.toUpperCase()}</span>
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

            <!-- Security Section -->
            <div class="security-section">
              <div class="security-alert">
                <h4>⚠️ Security Notice</h4>
                <p>
                  If you did not initiate this withdrawal, please 
                  <a href="mailto:support@win-tradex.com">freeze your account immediately</a> 
                  and contact our security team. Do not share your login credentials or verification codes with anyone.
                </p>
              </div>

              <ul class="security-tips">
                <li>
                  <span class="tip-icon">✓</span>
                  <span>Always verify the withdrawal address before confirming.</span>
                </li>
                <li>
                  <span class="tip-icon">✓</span>
                  <span>Win-Tradex will never ask for your password or 2FA codes via email.</span>
                </li>
                <li>
                  <span class="tip-icon">✓</span>
                  <span>Bookmark our official website to avoid phishing attacks.</span>
                </li>
              </ul>

              ${ip_address || device ? `
              <div class="device-info">
                ${ip_address ? `
                <div class="device-item">
                  <span class="di-label">IP Address: </span>
                  <span class="di-value">${ip_address}</span>
                </div>
                ` : ""}
                ${device ? `
                <div class="device-item">
                  <span class="di-label">Device: </span>
                  <span class="di-value">${device}</span>
                </div>
                ` : ""}
              </div>
              ` : ""}
            </div>

            <!-- CTA -->
            <div class="cta-section">
              <a href="https://win-tradex.com/dashboard/transactions" class="cta-btn">View Transaction Status</a>
              <span class="cta-secondary">
                Need help? <a href="mailto:support@win-tradex.com">Contact Support</a>
              </span>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-links">
                <a href="https://win-tradex.com">Home</a>
                <a href="https://win-tradex.com/dashboard">Dashboard</a>
                <a href="mailto:support@win-tradex.com">Support</a>
              </div>
              <div class="footer-divider"></div>
              <div class="footer-legal">
                <p>This is an automated transaction notification. Please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} Win-Tradex. All rights reserved.</p>
                <p style="margin-top: 8px;">Cryptocurrency withdrawals are irreversible. Please verify all details before confirming.</p>
              </div>
              <div class="footer-brand">Win-Tradex</div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Withdrawal notification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message_id: emailResponse.data?.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-withdrawal-notification:", error);
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
