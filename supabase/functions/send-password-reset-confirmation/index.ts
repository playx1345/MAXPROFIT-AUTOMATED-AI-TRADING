import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetConfirmationRequest {
  email: string;
  isAdmin?: boolean;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, isAdmin }: PasswordResetConfirmationRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accountType = isAdmin ? "admin" : "user";
    const currentTime = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0b;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0b; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(135deg, #1a1a1f 0%, #0d0d0f 100%); border-radius: 16px; border: 1px solid #2a2a35; overflow: hidden;">
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, transparent 100%);">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #eab308;">
                      Live Win Trade
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 20px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 50%; text-align: center; line-height: 80px;">
                      <span style="font-size: 40px; color: white;">✓</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #ffffff; text-align: center;">
                      Password Successfully Changed
                    </h2>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #a1a1aa; text-align: center;">
                      Your ${accountType} account password has been successfully updated.
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: rgba(255, 255, 255, 0.05); border-radius: 12px; margin: 20px 0;">
                      <tr>
                        <td style="padding: 16px;">
                          <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">
                            <strong style="color: #a1a1aa;">Account:</strong> ${email}
                          </p>
                          <p style="margin: 0; font-size: 14px; color: #71717a;">
                            <strong style="color: #a1a1aa;">Changed at:</strong> ${currentTime}
                          </p>
                        </td>
                      </tr>
                    </table>
                    <div style="background-color: rgba(234, 179, 8, 0.1); border-left: 4px solid #eab308; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0;">
                      <p style="margin: 0; font-size: 14px; color: #fbbf24;">
                        <strong>Security Notice:</strong> If you did not make this change, please contact our support team immediately.
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; background-color: rgba(0, 0, 0, 0.3); border-top: 1px solid #2a2a35;">
                    <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                      This is an automated security notification from Live Win Trade.<br>
                      Please do not reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Live Win Trade <onboarding@resend.dev>",
        to: [email],
        subject: "Password Successfully Changed - Live Win Trade",
        html: htmlContent,
      }),
    });

    const data = await res.json();
    console.log("Password reset confirmation email sent:", data);

    if (!res.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Confirmation email sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
