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
 }
 
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
       currency, 
       date, 
       transaction_id,
       wallet_address 
     }: WithdrawalNotificationRequest = await req.json();
 
     console.log(`Processing withdrawal notification for ${user_email}`);
     console.log(`Transaction ID: ${transaction_id}, Amount: ${amount} ${currency}`);
 
     const formattedDate = new Date(date).toLocaleDateString('en-US', {
       weekday: 'long',
       year: 'numeric',
       month: 'long',
       day: 'numeric',
       hour: '2-digit',
       minute: '2-digit',
       timeZoneName: 'short'
     });
 
     const emailResponse = await resend.emails.send({
      from: "Win-Tradex <onboarding@resend.dev>",
       // NOTE: For production, change to: "Win-Tradex <notifications@win-tradex.com>"
       // and verify win-tradex.com domain in Resend dashboard
       to: [user_email],
       subject: `Withdrawal Request Received - Transaction #${transaction_id.slice(0, 8)}`,
       html: `
         <!DOCTYPE html>
         <html>
         <head>
           <meta charset="utf-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <style>
             body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; line-height: 1.6; }
             .container { max-width: 600px; margin: 0 auto; padding: 20px; }
             .header { background: linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
             .header h1 { color: #d4af37; margin: 0; font-size: 24px; }
             .header p { color: #94a3b8; margin: 10px 0 0 0; font-size: 14px; }
             .content { background-color: #ffffff; padding: 30px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; }
             .greeting { color: #1f2937; font-size: 18px; margin-bottom: 20px; }
             .message { color: #4b5563; font-size: 15px; margin-bottom: 25px; }
             .details-box { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 10px; padding: 25px; margin: 25px 0; }
             .details-box h3 { color: #1e3a5f; margin: 0 0 20px 0; font-size: 16px; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
             .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
             .detail-row:last-child { border-bottom: none; }
             .detail-label { color: #6b7280; font-size: 14px; }
             .detail-value { color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; }
             .amount-highlight { color: #059669; font-size: 20px; }
             .security-box { background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 25px 0; }
             .security-box h4 { color: #065f46; margin: 0 0 10px 0; font-size: 15px; display: flex; align-items: center; gap: 8px; }
             .security-box p { color: #047857; margin: 0; font-size: 14px; }
             .processing-info { background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 25px 0; }
             .processing-info h4 { color: #1d4ed8; margin: 0 0 10px 0; font-size: 15px; }
             .processing-info ul { color: #1e40af; margin: 0; padding-left: 20px; font-size: 14px; }
             .processing-info li { margin: 8px 0; }
             .support-box { background: #fefce8; border: 1px solid #eab308; border-radius: 8px; padding: 15px; margin: 25px 0; text-align: center; }
             .support-box p { color: #854d0e; margin: 0; font-size: 14px; }
             .support-box a { color: #b45309; font-weight: 600; }
             .footer { background: #1f2937; color: #9ca3af; padding: 25px; text-align: center; font-size: 12px; border-radius: 0 0 12px 12px; }
             .footer p { margin: 5px 0; }
             .footer a { color: #d4af37; text-decoration: none; }
           </style>
         </head>
         <body>
           <div class="container">
             <div class="header">
               <h1>🔐 Withdrawal Request Received</h1>
               <p>Your funds are being securely processed</p>
             </div>
             
             <div class="content">
               <p class="greeting">Dear ${user_name},</p>
               
               <p class="message">
                 We have received your withdrawal request and it is currently being processed by our secure payment system. 
                 Your security is our top priority, and we want to assure you that your funds are safe.
               </p>
               
               <div class="details-box">
                 <h3>📋 Transaction Details</h3>
                 <div class="detail-row">
                   <span class="detail-label">Transaction ID</span>
                   <span class="detail-value">${transaction_id}</span>
                 </div>
                 <div class="detail-row">
                   <span class="detail-label">Amount</span>
                   <span class="detail-value amount-highlight">$${amount.toLocaleString()} ${currency.toUpperCase()}</span>
                 </div>
                 <div class="detail-row">
                   <span class="detail-label">Request Date</span>
                   <span class="detail-value">${formattedDate}</span>
                 </div>
                 ${wallet_address ? `
                 <div class="detail-row">
                   <span class="detail-label">Destination Wallet</span>
                   <span class="detail-value" style="font-family: monospace; font-size: 12px; word-break: break-all;">${wallet_address}</span>
                 </div>
                 ` : ''}
                 <div class="detail-row">
                   <span class="detail-label">Status</span>
                   <span class="detail-value" style="color: #f59e0b;">⏳ Processing</span>
                 </div>
               </div>
               
               <div class="security-box">
                 <h4>🛡️ Your Funds Are Secure</h4>
                 <p>
                   Win-Tradex uses industry-leading security protocols to protect your assets. 
                   All withdrawals undergo multi-layer verification to ensure the safety of your funds.
                 </p>
               </div>
               
               <div class="processing-info">
                 <h4>⏱️ Processing Timeline</h4>
                 <ul>
                   <li><strong>Standard Processing:</strong> 1-3 business days</li>
                   <li><strong>Verification:</strong> May require additional time for large amounts</li>
                   <li><strong>Confirmation:</strong> You'll receive an email once completed</li>
                 </ul>
               </div>
               
               <div class="support-box">
                 <p>
                   Questions about your withdrawal? Contact us at 
                   <a href="mailto:support@win-tradex.com">support@win-tradex.com</a>
                 </p>
               </div>
               
               <p class="message" style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                 If you did not initiate this withdrawal request, please contact our support team immediately 
                 and secure your account.
               </p>
             </div>
             
             <div class="footer">
               <p>© ${new Date().getFullYear()} Win-Tradex. All rights reserved.</p>
               <p>This is an automated security notification. Please do not reply directly.</p>
               <p><a href="https://win-tradex.com">www.win-tradex.com</a></p>
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
         message_id: emailResponse.data?.id 
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