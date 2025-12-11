import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PendingWithdrawal {
  id: string;
  user_id: string;
  amount: number;
  created_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting auto-process withdrawals job...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all pending withdrawals older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: pendingWithdrawals, error: fetchError } = await supabase
      .from('transactions')
      .select('id, user_id, amount, created_at')
      .eq('type', 'withdrawal')
      .eq('status', 'pending')
      .lt('created_at', twentyFourHoursAgo);

    if (fetchError) {
      console.error('Error fetching pending withdrawals:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingWithdrawals?.length || 0} withdrawals eligible for auto-processing`);

    const results: { id: string; success: boolean; error?: string }[] = [];

    // Process each eligible withdrawal
    for (const withdrawal of (pendingWithdrawals || []) as PendingWithdrawal[]) {
      try {
        console.log(`Processing withdrawal ${withdrawal.id} for user ${withdrawal.user_id}, amount: ${withdrawal.amount}`);

        const { data, error } = await supabase.rpc('auto_approve_withdrawal', {
          p_transaction_id: withdrawal.id,
        });

        if (error) {
          console.error(`Failed to auto-approve withdrawal ${withdrawal.id}:`, error);
          results.push({ id: withdrawal.id, success: false, error: error.message });
        } else {
          console.log(`Successfully auto-approved withdrawal ${withdrawal.id}:`, data);
          results.push({ id: withdrawal.id, success: true });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Exception processing withdrawal ${withdrawal.id}:`, errorMessage);
        results.push({ id: withdrawal.id, success: false, error: errorMessage });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Auto-process complete. Success: ${successCount}, Failed: ${failCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        successCount,
        failCount,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Auto-process withdrawals error:', errorMessage);

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
