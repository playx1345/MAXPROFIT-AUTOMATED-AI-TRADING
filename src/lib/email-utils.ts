import { supabase } from "@/integrations/supabase/client";

type EmailTemplate = "welcome" | "withdrawal_submitted" | "withdrawal_approved" | "withdrawal_rejected" | "deposit_approved";

export const sendTransactionalEmail = async (
  template: EmailTemplate,
  to: string,
  data: Record<string, unknown>
): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke("send-transactional-email", {
      body: { template, to, data },
    });
    if (error) {
      console.error(`Failed to send ${template} email:`, error);
    }
  } catch (err) {
    // Fire-and-forget: don't block the main flow
    console.error(`Failed to send ${template} email:`, err);
  }
};
