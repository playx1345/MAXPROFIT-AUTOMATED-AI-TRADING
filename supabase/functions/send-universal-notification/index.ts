 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { Resend } from "https://esm.sh/resend@2.0.0";
 
 const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 type NotificationType = 
   | 'deposit_confirmation' 
   | 'account_update' 
   | 'failed_transaction' 
   | 'security_alert'
   | 'withdrawal_approved'
   | 'withdrawal_rejected'
   | 'kyc_verified'
   | 'kyc_rejected'
   | 'investment_started'
   | 'investment_completed'
   | 'referral_bonus';
 
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
 }
 
 const SUPPORT_EMAIL = "support@win-tradex.com";
 
 const getNotificationConfig = (type: NotificationType, amount?: number, currency?: string) => {
   const configs: Record<NotificationType, { subject: string; icon: string; color: string; title: string; bgColor: string; borderColor: string }> = {
     deposit_confirmation: {
       subject: "Deposit Confirmed",
       icon: "✅",
       color: "#059669",
       title: "Deposit Successfully Processed",
       bgColor: "#ecfdf5",
       borderColor: "#10b981"
     },
     account_update: {
       subject: "Account Updated",
       icon: "👤",
       color: "#3b82f6",
       title: "Account Information Updated",
       bgColor: "#eff6ff",
       borderColor: "#3b82f6"
     },
     failed_transaction: {
       subject: "Transaction Failed",
       icon: "❌",
       color: "#dc2626",
       title: "Transaction Could Not Be Processed",
       bgColor: "#fef2f2",
       borderColor: "#dc2626"
     },
     security_alert: {
       subject: "Security Alert",
       icon: "🚨",
       color: "#dc2626",
       title: "Important Security Notice",
       bgColor: "#fef2f2",
       borderColor: "#dc2626"
     },
     withdrawal_approved: {
       subject: "Withdrawal Approved",
       icon: "💸",
       color: "#059669",
       title: "Your Withdrawal Has Been Approved",
       bgColor: "#ecfdf5",
       borderColor: "#10b981"
     },
     withdrawal_rejected: {
       subject: "Withdrawal Rejected",
       icon: "⚠️",
       color: "#f59e0b",
       title: "Withdrawal Request Declined",
       bgColor: "#fffbeb",
       borderColor: "#f59e0b"
     },
     kyc_verified: {
       subject: "KYC Verification Complete",
       icon: "✓",
       color: "#059669",
       title: "Identity Verification Successful",
       bgColor: "#ecfdf5",
       borderColor: "#10b981"
     },
     kyc_rejected: {
       subject: "KYC Verification Issue",
       icon: "📋",
       color: "#f59e0b",
       title: "Additional Verification Required",
       bgColor: "#fffbeb",
       borderColor: "#f59e0b"
     },
     investment_started: {
       subject: "Investment Activated",
       icon: "📈",
       color: "#8b5cf6",
       title: "Your Investment Is Now Active",
       bgColor: "#f5f3ff",
       borderColor: "#8b5cf6"
     },
     investment_completed: {
       subject: "Investment Completed",
       icon: "🎉",
       color: "#059669",
       title: "Investment Successfully Completed",
       bgColor: "#ecfdf5",
       borderColor: "#10b981"
     },
     referral_bonus: {
       subject: "Referral Bonus Earned",
       icon: "🎁",
       color: "#d4af37",
       title: "You've Earned a Referral Bonus!",
       bgColor: "#fefce8",
       borderColor: "#eab308"
     }
   };
   
   const config = configs[type];
   if (amount && currency) {
     config.subject = `${config.subject} - $${amount.toLocaleString()} ${currency.toUpperCase()}`;
   }
   return config;
 };
 
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
       currency,
       date, 
       details,
       transaction_id,
       additional_info
     }: UniversalNotificationRequest = await req.json();
 
     console.log(`Processing ${notification_type} notification for ${user_email}`);
 
     const config = getNotificationConfig(notification_type, amount, currency);
     
     const formattedDate = new Date(date).toLocaleDateString('en-US', {
       weekday: 'long',
       year: 'numeric',
       month: 'long',
       day: 'numeric',
       hour: '2-digit',
       minute: '2-digit',
       timeZoneName: 'short'
     });
 
     // Build additional info rows if provided
     let additionalInfoHtml = '';
     if (additional_info && Object.keys(additional_info).length > 0) {
       additionalInfoHtml = Object.entries(additional_info)
         .map(([key, value]) => `
           <div class="detail-row">
             <span class="detail-label">${key}</span>
             <span class="detail-value">${value}</span>
           </div>
         `).join('');
     }
 
     const emailResponse = await resend.emails.send({
       from: "Win-Tradex <notifications@win-tradex.com>",
       to: [user_email],
       subject: `${config.icon} ${config.subject}`,
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
             .header-icon { font-size: 48px; margin-bottom: 10px; }
             .header h1 { color: #d4af37; margin: 0; font-size: 22px; }
             .header p { color: #94a3b8; margin: 10px 0 0 0; font-size: 14px; }
             .content { background-color: #ffffff; padding: 30px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; }
             .greeting { color: #1f2937; font-size: 18px; margin-bottom: 20px; }
             .message { color: #4b5563; font-size: 15px; margin-bottom: 25px; }
             .status-badge { display: inline-block; background: ${config.bgColor}; border: 1px solid ${config.borderColor}; color: ${config.color}; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 25px; }
             .details-box { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 10px; padding: 25px; margin: 25px 0; }
             .details-box h3 { color: #1e3a5f; margin: 0 0 20px 0; font-size: 16px; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
             .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
             .detail-row:last-child { border-bottom: none; }
             .detail-label { color: #6b7280; font-size: 14px; }
             .detail-value { color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; max-width: 60%; word-break: break-word; }
             .amount-highlight { color: ${config.color}; font-size: 20px; }
             .details-message { background: ${config.bgColor}; border: 1px solid ${config.borderColor}; border-radius: 8px; padding: 20px; margin: 25px 0; }
             .details-message p { color: ${config.color}; margin: 0; font-size: 14px; }
             .cta-button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); color: #1e3a5f; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 20px 0; }
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
               <div class="header-icon">${config.icon}</div>
               <h1>${config.title}</h1>
               <p>Win-Tradex Account Notification</p>
             </div>
             
             <div class="content">
               <p class="greeting">Dear ${user_name},</p>
               
               <span class="status-badge">${config.icon} ${notification_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
               
               ${details ? `
               <div class="details-message">
                 <p>${details}</p>
               </div>
               ` : ''}
               
               <div class="details-box">
                 <h3>📋 Notification Details</h3>
                 <div class="detail-row">
                   <span class="detail-label">Date</span>
                   <span class="detail-value">${formattedDate}</span>
                 </div>
                 ${transaction_id ? `
                 <div class="detail-row">
                   <span class="detail-label">Transaction ID</span>
                   <span class="detail-value" style="font-family: monospace; font-size: 12px;">${transaction_id}</span>
                 </div>
                 ` : ''}
                 ${amount ? `
                 <div class="detail-row">
                   <span class="detail-label">Amount</span>
                   <span class="detail-value amount-highlight">$${amount.toLocaleString()} ${currency?.toUpperCase() || 'USDT'}</span>
                 </div>
                 ` : ''}
                 ${additionalInfoHtml}
               </div>
               
               <div style="text-align: center; margin: 30px 0;">
                 <a href="https://win-tradex.com/dashboard" class="cta-button">View Your Dashboard</a>
               </div>
               
               <div class="support-box">
                 <p>
                   Need assistance? Contact our support team at 
                   <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
                 </p>
               </div>
               
               <p class="message" style="margin-top: 25px; font-size: 13px; color: #9ca3af; text-align: center;">
                 This is an automated notification from your Win-Tradex account.
                 If you have concerns about this activity, please contact support immediately.
               </p>
             </div>
             
             <div class="footer">
               <p>© ${new Date().getFullYear()} Win-Tradex. All rights reserved.</p>
               <p>Secure Investment Platform | Your trust is our priority</p>
               <p><a href="https://win-tradex.com">www.win-tradex.com</a></p>
             </div>
           </div>
         </body>
         </html>
       `,
     });
 
     console.log(`${notification_type} notification sent successfully:`, emailResponse);
 
     return new Response(
       JSON.stringify({ 
         success: true, 
         message_id: emailResponse.data?.id,
         notification_type 
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