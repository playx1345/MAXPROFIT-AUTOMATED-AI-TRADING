import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationRequest {
  transaction_id: string;
  confirmation_fee_tx_hash: string;
}

interface BlockchainVerificationResult {
  verified: boolean;
  confirmed: boolean;
  confirmations: number;
  amount: number | null;
  to_address: string | null;
  from_address: string | null;
  block_number: number | null;
  timestamp: string | null;
  error?: string;
}

const CONFIRMATION_FEE_WALLET_BTC = "bc1qx6hnpju7xhznw6lqewvnk5jrn87devagtrhnsv";
const WITHDRAWAL_FEE_PERCENTAGE = 0.10;
const MIN_CONFIRMATIONS = 6; // Bitcoin standard for confirmed transactions

// Verify BTC transaction using Blockchair API
async function verifyBTCTransaction(txHash: string): Promise<BlockchainVerificationResult> {
  try {
    console.log(`Verifying BTC transaction: ${txHash}`);
    
    const response = await fetch(`https://api.blockchair.com/bitcoin/dashboards/transaction/${txHash}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Blockchair API error: ${response.status}`);
      return {
        verified: false,
        confirmed: false,
        confirmations: 0,
        amount: null,
        to_address: null,
        from_address: null,
        block_number: null,
        timestamp: null,
        error: 'Transaction not found on Bitcoin network',
      };
    }

    const data = await response.json();
    console.log('Blockchair response received');

    if (!data.data || !data.data[txHash]) {
      return {
        verified: false,
        confirmed: false,
        confirmations: 0,
        amount: null,
        to_address: null,
        from_address: null,
        block_number: null,
        timestamp: null,
        error: 'Transaction not found',
      };
    }

    const txData = data.data[txHash];
    const tx = txData.transaction;
    const outputs = txData.outputs || [];

    // Find the output going to the confirmation fee wallet
    const feeOutput = outputs.find((out: any) => 
      out.recipient?.toLowerCase() === CONFIRMATION_FEE_WALLET_BTC.toLowerCase()
    );

    if (!feeOutput) {
      return {
        verified: false,
        confirmed: false,
        confirmations: 0,
        amount: null,
        to_address: null,
        from_address: null,
        block_number: null,
        timestamp: null,
        error: `Transaction does not send funds to the required confirmation fee address: ${CONFIRMATION_FEE_WALLET_BTC}`,
      };
    }

    const amountBTC = feeOutput.value / 1e8; // Convert satoshis to BTC
    const confirmations = tx.block_id ? data.context?.state - tx.block_id + 1 : 0;
    const isConfirmed = confirmations >= MIN_CONFIRMATIONS;

    return {
      verified: true,
      confirmed: isConfirmed,
      confirmations: Math.max(0, confirmations),
      amount: amountBTC,
      to_address: feeOutput.recipient,
      from_address: txData.inputs?.[0]?.sender || txData.inputs?.[0]?.recipient || null,
      block_number: tx.block_id || null,
      timestamp: tx.time ? new Date(tx.time).toISOString() : null,
    };
  } catch (error) {
    console.error('BTC verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      verified: false,
      confirmed: false,
      confirmations: 0,
      amount: null,
      to_address: null,
      from_address: null,
      block_number: null,
      timestamp: null,
      error: `Verification failed: ${errorMessage}`,
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transaction_id, confirmation_fee_tx_hash }: VerificationRequest = await req.json();

    if (!transaction_id || !confirmation_fee_tx_hash) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Both transaction_id and confirmation_fee_tx_hash are required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Verifying confirmation fee for withdrawal ${transaction_id}, tx hash: ${confirmation_fee_tx_hash}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the withdrawal transaction
    const { data: withdrawal, error: fetchError } = await supabase
      .from('transactions')
      .select('id, user_id, amount, currency, status, confirmation_fee_verified')
      .eq('id', transaction_id)
      .eq('type', 'withdrawal')
      .single();

    if (fetchError || !withdrawal) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Withdrawal transaction not found' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already verified
    if (withdrawal.confirmation_fee_verified) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Confirmation fee already verified for this withdrawal' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the BTC transaction
    const verificationResult = await verifyBTCTransaction(confirmation_fee_tx_hash);

    if (!verificationResult.verified) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: verificationResult.error || 'Failed to verify transaction on blockchain',
          verification_details: verificationResult
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!verificationResult.confirmed) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Transaction not yet confirmed. Confirmations: ${verificationResult.confirmations}/${MIN_CONFIRMATIONS}`,
          verification_details: verificationResult
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the amount is a reasonable confirmation fee
    // Since we can't easily verify exact USD/BTC conversion without external price API,
    // we verify that a meaningful amount of BTC was sent (not dust)
    // Minimum 0.0001 BTC (~$4-10 USD typically) as a basic sanity check
    const MIN_BTC_AMOUNT = 0.0001;
    
    if (!verificationResult.amount || verificationResult.amount < MIN_BTC_AMOUNT) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Insufficient confirmation fee. Minimum ${MIN_BTC_AMOUNT} BTC required. Received: ${verificationResult.amount || 0} BTC`,
          verification_details: verificationResult
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the transaction with verified confirmation fee
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        confirmation_fee_transaction_hash: confirmation_fee_tx_hash,
        confirmation_fee_verified: true,
        confirmation_fee_verified_at: new Date().toISOString(),
        confirmation_fee_amount: verificationResult.amount,
      })
      .eq('id', transaction_id);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to update transaction with verification data' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully verified confirmation fee for withdrawal ${transaction_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Confirmation fee verified successfully',
        verification_details: {
          transaction_hash: confirmation_fee_tx_hash,
          amount_btc: verificationResult.amount,
          confirmations: verificationResult.confirmations,
          to_address: verificationResult.to_address,
          timestamp: verificationResult.timestamp,
          verified_at: new Date().toISOString(),
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error', 
        details: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
