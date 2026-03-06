import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_name, user_email, withdrawal_amount, currency, fees } = await req.json();

    console.log(`Sending fee breakdown email to ${user_email}`);

    const totalFees = fees.reduce((sum: number, f: any) => sum + f.amount, 0);
    const netAmount = withdrawal_amount - totalFees;

    const feeRows = fees.map((f: any) => `
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2b313930;">
        <span style="font-size:13px;color:#848e9c;">${f.label}</span>
        <span style="font-size:13px;color:#eaecef;font-weight:500;">$${f.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
      </div>
    `).join("");

    const emailResponse = await resend.emails.send({
      from: "Win-Tradex <notifications@win-tradex.com>",
      to: [user_email],
      subject: `Action Required: Fee Payment for $${withdrawal_amount.toLocaleString()} ${currency} Withdrawal`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Withdrawal Fee Breakdown</title>
        </head>
        <body style="margin:0;padding:0;background-color:#0b0e11;color:#eaecef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;">
          <div style="max-width:600px;margin:0 auto;background-color:#181a20;">
            
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#1e2329 0%,#0b0e11 100%);padding:28px 32px;border-bottom:1px solid #2b3139;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span style="width:8px;height:8px;background:#d4af37;border-radius:50;display:inline-block;"></span>
                  <span style="font-size:22px;font-weight:700;color:#d4af37;">Win-Tradex</span>
                </div>
                <span style="font-size:11px;color:#848e9c;text-transform:uppercase;letter-spacing:2px;background:#2b3139;padding:4px 12px;border-radius:4px;">Fee Notice</span>
              </div>
              <div style="text-align:center;">
                <h1 style="font-size:20px;color:#eaecef;font-weight:600;margin:0 0 4px 0;">⚠️ Withdrawal Fee Required</h1>
                <p style="font-size:13px;color:#848e9c;margin:0;">Please complete fee payment to process your withdrawal</p>
              </div>
            </div>

            <!-- Greeting -->
            <div style="padding:24px 32px;border-bottom:1px solid #2b3139;">
              <p style="margin:0;font-size:14px;color:#eaecef;">Dear <strong>${user_name}</strong>,</p>
              <p style="margin:12px 0 0;font-size:13px;color:#848e9c;">Your withdrawal request of <strong style="color:#d4af37;">$${withdrawal_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong> ${currency} requires the following fees to be paid before processing can begin.</p>
            </div>

            <!-- Fee Breakdown -->
            <div style="padding:24px 32px;border-bottom:1px solid #2b3139;">
              <div style="font-size:13px;font-weight:600;color:#d4af37;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px;">Fee Breakdown</div>
              <div style="background:#1e2329;border-radius:8px;padding:16px;">
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2b313930;">
                  <span style="font-size:13px;color:#848e9c;">Withdrawal Amount</span>
                  <span style="font-size:13px;color:#eaecef;font-weight:500;">$${withdrawal_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                ${feeRows}
                <div style="border-top:1px dashed #2b3139;margin-top:8px;padding-top:10px;display:flex;justify-content:space-between;">
                  <span style="font-size:13px;color:#f0b90b;font-weight:600;">Total Fees</span>
                  <span style="font-size:15px;color:#f0b90b;font-weight:700;">$${totalFees.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div style="border-top:1px solid #2b3139;margin-top:8px;padding-top:10px;display:flex;justify-content:space-between;">
                  <span style="font-size:13px;color:#eaecef;font-weight:600;">You Will Receive</span>
                  <span style="font-size:15px;color:#0ecb81;font-weight:700;">$${netAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <!-- Important Notice -->
            <div style="padding:24px 32px;border-bottom:1px solid #2b3139;">
              <div style="background:rgba(240,185,11,0.08);border:1px solid rgba(240,185,11,0.2);border-radius:8px;padding:16px;">
                <h4 style="color:#f0b90b;font-size:13px;margin:0 0 8px;">⚠️ Important</h4>
                <p style="color:#848e9c;font-size:12px;line-height:1.6;margin:0;">
                  These fees are required by the blockchain network and our platform to process your withdrawal securely. 
                  Please submit payment at your earliest convenience to avoid delays. Your withdrawal will be processed 
                  once all fees are confirmed.
                </p>
              </div>
            </div>

            <!-- CTA -->
            <div style="padding:24px 32px;text-align:center;border-bottom:1px solid #2b3139;">
              <a href="https://win-tradex.com/dashboard/withdraw" style="display:inline-block;background:linear-gradient(135deg,#d4af37 0%,#b8962e 100%);color:#0b0e11;text-decoration:none;padding:14px 40px;border-radius:6px;font-weight:700;font-size:14px;letter-spacing:0.5px;text-transform:uppercase;">Pay Fees Now</a>
              <p style="margin:12px 0 0;font-size:12px;color:#848e9c;">
                Need help? <a href="mailto:support@win-tradex.com" style="color:#d4af37;text-decoration:none;">Contact Support</a>
              </p>
            </div>

            <!-- Footer -->
            <div style="padding:24px 32px;text-align:center;background:#0b0e11;">
              <p style="font-size:11px;color:#5e6673;margin:4px 0;">This is an automated notification. Please do not reply to this email.</p>
              <p style="font-size:11px;color:#5e6673;margin:4px 0;">© ${new Date().getFullYear()} Win-Tradex. All rights reserved.</p>
              <div style="color:#d4af37;font-weight:600;font-size:14px;margin-top:16px;">Win-Tradex</div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Fee breakdown email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message_id: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending fee breakdown notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
