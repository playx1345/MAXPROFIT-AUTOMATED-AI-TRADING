import { supabase } from "@/integrations/supabase/client";

type EmailTemplate = "welcome" | "withdrawal_submitted" | "withdrawal_approved" | "withdrawal_rejected" | "deposit_approved";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sendTransactionalEmail = async (
  template: EmailTemplate,
  to: string,
  data: Record<string, unknown>
): Promise<void> => {
  const attempt = async () => {
    const { error } = await supabase.functions.invoke("send-transactional-email", {
      body: { template, to, data },
    });
    if (error) throw error;
  };

  try {
    await attempt();
  } catch (err) {
    // Retry once after 2s delay
    try {
      await delay(2000);
      await attempt();
    } catch (retryErr) {
      console.error(`Failed to send ${template} email after retry:`, retryErr);
    }
  }
};
