import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const escapeHtml = (str: string): string => {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

interface TransactionalEmailRequest {
  template: "welcome" | "withdrawal_submitted" | "withdrawal_approved" | "withdrawal_rejected" | "deposit_approved";
  to: string;
  data: Record<string, unknown>;
}

const LOGO_URL = "https://kxjbankkuapchkezjjeq.supabase.co/storage/v1/object/public/email-assets/logo.jpg";

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;">
  <div style="max-width:560px;margin:0 auto;padding:20px 25px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;border-bottom:2px solid #d4af37;padding-bottom:16px;">
      <img src="${LOGO_URL}" width="48" height="48" alt="Win-Tradex" style="border-radius:8px;" />
      <span style="font-size:20px;font-weight:bold;color:#d4af37;padding-left:10px;">Win-Tradex</span>
    </div>
    ${content}
    <div style="font-size:12px;color:#999999;margin-top:30px;border-top:1px solid #eee;padding-top:16px;">
      <p style="margin:0;">This is an automated message. Please do not reply directly.</p>
      <p style="font-size:11px;color:#bbbbbb;margin:8px 0 0;">© ${new Date().getFullYear()} Win-Tradex. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

const templates: Record<string, (data: Record<string, unknown>) => { subject: string; html: string }> = {
  welcome: (data) => ({
    subject: "Welcome to Win-Tradex! 🎉",
    html: emailWrapper(`
      <h1 style="font-size:24px;font-weight:bold;color:#1a1a2e;margin:0 0 20px;">Welcome to Win-Tradex!</h1>
      <p style="font-size:15px;color:#4a4a5a;margin:0 0 20px;">
        Hey ${escapeHtml(data.name as string || 'there')}, welcome aboard! Your account has been verified and you're ready to start trading.
      </p>
      <p style="font-size:15px;color:#4a4a5a;margin:0 0 20px;">
        Here's what you can do next:
      </p>
      <ul style="font-size:15px;color:#4a4a5a;margin:0 0 20px;padding-left:20px;">
        <li>Make your first deposit</li>
        <li>Explore our investment plans</li>
        <li>Set up your wallet addresses</li>
      </ul>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://win-tradex.com/dashboard" style="background-color:#d4af37;color:#0b0e11;font-size:15px;font-weight:bold;border-radius:6px;padding:14px 32px;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;display:inline-block;">Go to Dashboard</a>
      </div>
    `),
  }),

  withdrawal_submitted: (data) => ({
    subject: `Withdrawal Request Submitted — $${Number(data.amount).toLocaleString()} ${escapeHtml(data.currency as string || 'USDT')}`,
    html: emailWrapper(`
      <h1 style="font-size:24px;font-weight:bold;color:#1a1a2e;margin:0 0 20px;">Withdrawal Submitted</h1>
      <p style="font-size:15px;color:#4a4a5a;margin:0 0 20px;">
        Your withdrawal request has been submitted and is pending review.
      </p>
      <div style="background:#faf5e6;border:1px solid #d4af37;border-radius:8px;padding:16px;margin:0 0 20px;">
        <p style="margin:0 0 8px;font-size:14px;color:#4a4a5a;"><strong>Amount:</strong> $${Number(data.amount).toLocaleString()} ${escapeHtml(data.currency as string || 'USDT')}</p>
        <p style="margin:0 0 8px;font-size:14px;color:#4a4a5a;"><strong>Wallet:</strong> ${escapeHtml(((data.wallet_address as string) || '').slice(0, 8))}...${escapeHtml(((data.wallet_address as string) || '').slice(-6))}</p>
        <p style="margin:0;font-size:14px;color:#4a4a5a;"><strong>Status:</strong> <span style="color:#d4af37;font-weight:bold;">Pending</span></p>
      </div>
      <p style="font-size:14px;color:#4a4a5a;">Our team will review and process your withdrawal. You'll receive an update once it's completed.</p>
    `),
  }),

  withdrawal_approved: (data) => ({
    subject: `Withdrawal Approved — $${Number(data.amount).toLocaleString()}`,
    html: emailWrapper(`
      <h1 style="font-size:24px;font-weight:bold;color:#1a1a2e;margin:0 0 20px;">Withdrawal Approved ✅</h1>
      <p style="font-size:15px;color:#4a4a5a;margin:0 0 20px;">
        Great news! Your withdrawal has been approved and is being processed.
      </p>
      <div style="background:#f0fdf4;border:1px solid #22c55e;border-radius:8px;padding:16px;margin:0 0 20px;">
        <p style="margin:0 0 8px;font-size:14px;color:#4a4a5a;"><strong>Amount:</strong> $${Number(data.amount).toLocaleString()}</p>
        <p style="margin:0;font-size:14px;color:#4a4a5a;"><strong>Status:</strong> <span style="color:#22c55e;font-weight:bold;">Approved</span></p>
      </div>
      <p style="font-size:14px;color:#4a4a5a;">Funds will arrive in your wallet shortly.</p>
    `),
  }),

  withdrawal_rejected: (data) => ({
    subject: `Withdrawal Update — Action Required`,
    html: emailWrapper(`
      <h1 style="font-size:24px;font-weight:bold;color:#1a1a2e;margin:0 0 20px;">Withdrawal Update</h1>
      <p style="font-size:15px;color:#4a4a5a;margin:0 0 20px;">
        Your withdrawal request could not be processed at this time.
      </p>
      <div style="background:#fef2f2;border:1px solid #ef4444;border-radius:8px;padding:16px;margin:0 0 20px;">
        <p style="margin:0 0 8px;font-size:14px;color:#4a4a5a;"><strong>Amount:</strong> $${Number(data.amount).toLocaleString()}</p>
        <p style="margin:0 0 8px;font-size:14px;color:#4a4a5a;"><strong>Status:</strong> <span style="color:#ef4444;font-weight:bold;">Rejected</span></p>
        ${data.reason ? `<p style="margin:0;font-size:14px;color:#4a4a5a;"><strong>Reason:</strong> ${escapeHtml(data.reason as string)}</p>` : ''}
      </div>
      <p style="font-size:14px;color:#4a4a5a;">The funds have been returned to your balance. Please contact support if you have questions.</p>
    `),
  }),

  deposit_approved: (data) => ({
    subject: `Deposit Confirmed — $${Number(data.amount).toLocaleString()}`,
    html: emailWrapper(`
      <h1 style="font-size:24px;font-weight:bold;color:#1a1a2e;margin:0 0 20px;">Deposit Confirmed ✅</h1>
      <p style="font-size:15px;color:#4a4a5a;margin:0 0 20px;">
        Your deposit has been confirmed and credited to your account.
      </p>
      <div style="background:#f0fdf4;border:1px solid #22c55e;border-radius:8px;padding:16px;margin:0 0 20px;">
        <p style="margin:0 0 8px;font-size:14px;color:#4a4a5a;"><strong>Amount:</strong> <span style="font-size:20px;font-weight:bold;color:#22c55e;">$${Number(data.amount).toLocaleString()}</span></p>
        <p style="margin:0;font-size:14px;color:#4a4a5a;"><strong>Status:</strong> <span style="color:#22c55e;font-weight:bold;">Confirmed</span></p>
      </div>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://win-tradex.com/dashboard/investments" style="background-color:#d4af37;color:#0b0e11;font-size:15px;font-weight:bold;border-radius:6px;padding:14px 32px;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;display:inline-block;">Start Investing</a>
      </div>
    `),
  }),
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { template, to, data }: TransactionalEmailRequest = await req.json();

    if (!templates[template]) {
      return new Response(JSON.stringify({ error: `Unknown template: ${template}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, html } = templates[template](data);

    // Enqueue using the email queue infrastructure
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { error: enqueueError } = await serviceClient.rpc("enqueue_email", {
      p_to: to,
      p_subject: subject,
      p_html: html,
    });

    if (enqueueError) {
      console.error("Failed to enqueue email:", enqueueError);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Transactional email '${template}' enqueued for ${to}`);

    return new Response(
      JSON.stringify({ success: true, template }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in send-transactional-email:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
