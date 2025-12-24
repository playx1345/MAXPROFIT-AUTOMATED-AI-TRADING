import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeeSubmissionNotificationRequest {
  withdrawal_id: string;
  fee_hash: string;
  user_email: string;
  withdrawal_amount: number;
  currency: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-fee-submission-notification: Request received");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { withdrawal_id, fee_hash, user_email, withdrawal_amount, currency }: FeeSubmissionNotificationRequest = await req.json();

    console.log(`Processing fee submission notification for withdrawal ${withdrawal_id}`);
    console.log(`User: ${user_email}, Amount: ${withdrawal_amount} ${currency}`);

    // Send notification to user
    const userEmailResponse = await resend.emails.send({
      from: "Win-Tradex <notifications@win-tradex.com>",
      to: [user_email],
      subject: "Fee Payment Submitted - Withdrawal Processing",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
            .amount { font-size: 24px; font-weight: bold; color: #059669; }
            .hash { background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; word-break: break-all; }
            .status { background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Fee Payment Received</h1>
            </div>
            <div class="content">
              <p>Dear Valued Customer,</p>
              
              <p>We have received your confirmation fee payment for your withdrawal request.</p>
              
              <div class="status">
                <strong>Status: Processing</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px;">Your withdrawal is now being verified and will be processed within 24 hours.</p>
              </div>
              
              <h3>Withdrawal Details:</h3>
              <ul>
                <li><strong>Amount:</strong> <span class="amount">$${withdrawal_amount.toLocaleString()} ${currency.toUpperCase()}</span></li>
                <li><strong>Withdrawal ID:</strong> ${withdrawal_id}</li>
              </ul>
              
              <h3>Your Fee Payment Hash:</h3>
              <div class="hash">${fee_hash}</div>
              
              <p style="margin-top: 20px;">Our team will verify your fee payment on the blockchain and process your withdrawal once confirmed.</p>
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br><strong>Win-Tradex Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Win-Tradex. All rights reserved.</p>
              <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("User email sent successfully:", userEmailResponse);

    // Send notification to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Win-Tradex System <notifications@win-tradex.com>",
      to: ["admin@win-tradex.com"],
      subject: `[Action Required] Fee Payment Submitted - $${withdrawal_amount.toLocaleString()} Withdrawal`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
            .amount { font-size: 24px; font-weight: bold; color: #dc2626; }
            .hash { background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; word-break: break-all; }
            .alert { background: #fef2f2; border: 1px solid #dc2626; padding: 15px; border-radius: 8px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Fee Payment Submitted</h1>
            </div>
            <div class="content">
              <div class="alert">
                <strong>Action Required:</strong> A user has submitted a fee payment hash. Please verify on the blockchain and process the withdrawal.
              </div>
              
              <h3>Withdrawal Details:</h3>
              <ul>
                <li><strong>User:</strong> ${user_email}</li>
                <li><strong>Amount:</strong> <span class="amount">$${withdrawal_amount.toLocaleString()} ${currency.toUpperCase()}</span></li>
                <li><strong>Withdrawal ID:</strong> ${withdrawal_id}</li>
              </ul>
              
              <h3>Submitted Fee Hash:</h3>
              <div class="hash">${fee_hash}</div>
              
              <p style="margin-top: 20px;">Please log in to the admin panel to verify this fee payment and process the withdrawal.</p>
            </div>
            <div class="footer">
              <p>Win-Tradex Admin Notification System</p>
              <p>Timestamp: ${new Date().toISOString()}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Admin email sent successfully:", adminEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_email_id: userEmailResponse.data?.id,
        admin_email_id: adminEmailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-fee-submission-notification:", error);
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
