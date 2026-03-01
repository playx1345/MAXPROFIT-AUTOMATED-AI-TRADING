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
    const { user_name, user_email } = await req.json();

    console.log(`Sending signup welcome email to ${user_email}`);

    const emailResponse = await resend.emails.send({
      from: "Live Win Trade <onboarding@resend.dev>",
      to: [user_email],
      subject: "Welcome to Live Win Trade – Your Account is Ready",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Live Win Trade</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #0b0e11; color: #eaecef; line-height: 1.6; }
            .wrapper { max-width: 600px; margin: 0 auto; background-color: #181a20; }
            .header { background: linear-gradient(135deg, #1e2329 0%, #0b0e11 100%); padding: 32px; text-align: center; border-bottom: 1px solid #2b3139; }
            .logo-text { font-size: 24px; font-weight: 700; color: #d4af37; letter-spacing: -0.5px; }
            .content { padding: 32px; }
            .greeting { font-size: 22px; font-weight: 600; color: #eaecef; margin-bottom: 16px; }
            .message { font-size: 15px; color: #848e9c; margin-bottom: 24px; line-height: 1.7; }
            .steps { background: #1e2329; border-radius: 8px; padding: 24px; margin-bottom: 24px; }
            .step { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #2b3139; }
            .step:last-child { border-bottom: none; }
            .step-num { background: #d4af37; color: #0b0e11; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
            .step-text { font-size: 14px; color: #eaecef; }
            .step-desc { font-size: 12px; color: #848e9c; margin-top: 4px; }
            .cta-btn { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); color: #0b0e11; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
            .cta-section { text-align: center; padding: 24px 0; }
            .footer { padding: 24px 32px; text-align: center; background: #0b0e11; border-top: 1px solid #2b3139; }
            .footer p { font-size: 11px; color: #5e6673; margin: 4px 0; }
            .footer .brand { color: #d4af37; font-weight: 600; font-size: 14px; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <span class="logo-text">Live Win Trade</span>
            </div>
            <div class="content">
              <p class="greeting">Welcome, ${user_name || "Trader"}! 🎉</p>
              <p class="message">
                Your Live Win Trade account has been successfully created. You're now part of a growing community of smart investors using AI-powered trading strategies.
              </p>
              
              <div class="steps">
                <div class="step">
                  <span class="step-num">1</span>
                  <div>
                    <div class="step-text">Complete Your Profile</div>
                    <div class="step-desc">Add your personal details and wallet addresses</div>
                  </div>
                </div>
                <div class="step">
                  <span class="step-num">2</span>
                  <div>
                    <div class="step-text">Verify Your Identity (KYC)</div>
                    <div class="step-desc">Submit your documents for account verification</div>
                  </div>
                </div>
                <div class="step">
                  <span class="step-num">3</span>
                  <div>
                    <div class="step-text">Make Your First Deposit</div>
                    <div class="step-desc">Fund your account and start investing</div>
                  </div>
                </div>
              </div>

              <div class="cta-section">
                <a href="https://live-win-trade-invest.lovable.app/dashboard" class="cta-btn">Go to Dashboard</a>
              </div>

              <p class="message" style="font-size: 13px; margin-top: 24px;">
                If you have any questions, our support team is available 24/7 at <a href="mailto:support@win-tradex.com" style="color: #d4af37; text-decoration: none;">support@win-tradex.com</a>.
              </p>
            </div>
            <div class="footer">
              <p class="brand">Live Win Trade</p>
              <p>This is an automated welcome email. Please do not reply.</p>
              <p>© ${new Date().getFullYear()} Live Win Trade. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Signup email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending signup email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
