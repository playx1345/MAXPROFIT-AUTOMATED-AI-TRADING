import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find active restrictions past their deadline
    const { data: expiredRestrictions, error: fetchError } = await supabase
      .from("user_restrictions")
      .select("*")
      .eq("status", "active")
      .lt("deadline", new Date().toISOString());

    if (fetchError) throw fetchError;

    if (!expiredRestrictions || expiredRestrictions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expired restrictions found", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let suspended = 0;
    let completed = 0;

    for (const restriction of expiredRestrictions) {
      // Check if user has any approved/completed withdrawal
      const { data: withdrawals } = await supabase
        .from("transactions")
        .select("id")
        .eq("user_id", restriction.user_id)
        .eq("type", "withdrawal")
        .in("status", ["approved", "completed"])
        .limit(1);

      if (withdrawals && withdrawals.length > 0) {
        // User completed a withdrawal - mark restriction as completed
        await supabase
          .from("user_restrictions")
          .update({ status: "completed", updated_at: new Date().toISOString() })
          .eq("id", restriction.id);
        completed++;
      } else {
        // No approved withdrawal - suspend the account
        await supabase
          .from("profiles")
          .update({ is_suspended: true })
          .eq("id", restriction.user_id);

        await supabase
          .from("user_restrictions")
          .update({ status: "suspended", updated_at: new Date().toISOString() })
          .eq("id", restriction.id);

        // Log the action
        await supabase.from("admin_activity_logs").insert({
          admin_id: restriction.created_by,
          admin_email: restriction.admin_email,
          action: "auto_suspend_restriction_expired",
          target_type: "user",
          target_id: restriction.user_id,
          details: {
            restriction_id: restriction.id,
            deadline: restriction.deadline,
            message: "Account auto-suspended: withdrawal deadline expired",
          },
        });

        suspended++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, suspended, completed, total: expiredRestrictions.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing restrictions:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
