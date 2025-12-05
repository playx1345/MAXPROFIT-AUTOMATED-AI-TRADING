import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SuspendUserRequest {
  user_id: string;
  suspend: boolean;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create regular client to verify the requesting user is an admin
    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    });

    // Verify the requesting user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      console.error("Role check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { user_id, suspend }: SuspendUserRequest = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin ${user.email} ${suspend ? 'suspending' : 'activating'} user: ${user_id}`);

    // Get user email before updating
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", user_id)
      .single();

    // Indefinite suspension duration (~100 years) for suspended accounts
    // Using "none" to lift the ban and restore account access
    const INDEFINITE_BAN_DURATION = "876000h"; // ~100 years, effectively permanent until admin lifts it

    // Update user's ban status in auth.users
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { ban_duration: suspend ? INDEFINITE_BAN_DURATION : "none" }
    );

    if (updateError) {
      console.error("Error updating user status:", updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also update profile to track suspension
    await supabaseAdmin
      .from("profiles")
      .update({ is_suspended: suspend })
      .eq("id", user_id);

    // Log the admin action
    await supabaseAdmin
      .from("admin_activity_logs")
      .insert({
        admin_id: user.id,
        admin_email: user.email,
        action: suspend ? "user_suspended" : "user_activated",
        target_type: "user",
        target_id: user_id,
        target_email: profile?.email,
        details: {
          timestamp: new Date().toISOString(),
        },
      });

    console.log(`User ${suspend ? 'suspended' : 'activated'} successfully: ${user_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `User ${suspend ? 'suspended' : 'activated'} successfully`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
