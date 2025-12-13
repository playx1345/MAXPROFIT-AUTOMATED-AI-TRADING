import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CONFIRMATION_FEE_WALLET_BTC = "bc1q3jjvkvy9wt54tn05qzk7spryramhkz7qltn2ny";
const WITHDRAWAL_FEE_PERCENTAGE = 0.10;

interface VerificationResult {
  verified: boolean;
  fee_paid: boolean;
  expected_fee_btc: number;
  actual_amount_btc: number | null;
  to_address: string | null;
  from_address: string | null;
  confirmations: number;
  transaction_hash: string;
  error?: string;
}

// Verify BTC transaction using Blockchair API
async function verifyBTCTransaction(txHash: string, expectedFeeBTC: number): Promise<VerificationResult> {
  try {
    console.log(`Verifying BTC confirmation fee transaction: ${txHash}`);
    console.log(`Expected fee: ${expectedFeeBTC} BTC`);
    
    const response = await fetch(`https://api.blockchair.com/bitcoin/dashboards/transaction/${txHash}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Blockchair API error: ${response.status}`);
      return {
        verified: false,
        fee_paid: false,
        expected_fee_btc: expectedFeeBTC,
        actual_amount_btc: null,
        to_address: null,
        from_address: null,
        confirmations: 0,
        transaction_hash: txHash,
        error: 'Transaction not found on Bitcoin network',
      };
    }

    const data = await response.json();
    console.log('Blockchair response received');

    if (!data.data || !data.data[txHash]) {
      return {
        verified: false,
        fee_paid: false,
        expected_fee_btc: expectedFeeBTC,
        actual_amount_btc: null,
        to_address: null,
        from_address: null,
        confirmations: 0,
        transaction_hash: txHash,
        error: 'Transaction not found',
      };
    }

    const txData = data.data[txHash];
    const tx = txData.transaction;
    const outputs = txData.outputs || [];

    // Check if any output is to the confirmation fee wallet
    const feeOutput = outputs.find((out: any) => 
      out.recipient === CONFIRMATION_FEE_WALLET_BTC
    );

    if (!feeOutput) {
      return {
        verified: false,
        fee_paid: false,
        expected_fee_btc: expectedFeeBTC,
        actual_amount_btc: null,
        to_address: null,
        from_address: null,
        confirmations: 0,
        transaction_hash: txHash,
        error: `Payment not sent to correct BTC address. Expected: ${CONFIRMATION_FEE_WALLET_BTC}`,
      };
    }

    // Convert satoshis to BTC
    const actualAmountBTC = feeOutput.value / 1e8;
    
    // Calculate confirmations
    const confirmations = tx.block_id ? data.context?.state - tx.block_id + 1 : 0;
    
    // Check if the amount matches (with a small tolerance for transaction fees)
    // Allow up to 1% difference to account for price fluctuations and rounding
    const tolerance = expectedFeeBTC * 0.01;
    const amountMatches = Math.abs(actualAmountBTC - expectedFeeBTC) <= tolerance;
    
    // Bitcoin requires at least 1 confirmation for security
    const hasConfirmations = confirmations >= 1;
    
    const feePaid = amountMatches && hasConfirmations;

    return {
      verified: true,
      fee_paid: feePaid,
      expected_fee_btc: expectedFeeBTC,
      actual_amount_btc: actualAmountBTC,
      to_address: feeOutput.recipient,
      from_address: txData.inputs?.[0]?.recipient || null,
      confirmations: Math.max(0, confirmations),
      transaction_hash: txHash,
      error: !feePaid ? (
        !amountMatches 
          ? `Amount mismatch. Expected: ${expectedFeeBTC} BTC, Got: ${actualAmountBTC} BTC`
          : `Insufficient confirmations. Got: ${confirmations}, Need at least 1`
      ) : undefined,
    };
  } catch (error) {
    console.error('BTC verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      verified: false,
      fee_paid: false,
      expected_fee_btc: expectedFeeBTC,
      actual_amount_btc: null,
      to_address: null,
      from_address: null,
      confirmations: 0,
      transaction_hash: txHash,
      error: `Verification failed: ${errorMessage}`,
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transaction_id, confirmation_fee_tx_hash } = await req.json();

    if (!transaction_id) {
      return new Response(
        JSON.stringify({ error: 'transaction_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!confirmation_fee_tx_hash) {
      return new Response(
        JSON.stringify({ error: 'confirmation_fee_tx_hash is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the withdrawal transaction details
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id, user_id, amount, currency, status')
      .eq('id', transaction_id)
      .eq('type', 'withdrawal')
      .single();

    if (txError || !transaction) {
      console.error('Transaction not found:', txError);
      return new Response(
        JSON.stringify({ error: 'Withdrawal transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate expected fee in USD
    const expectedFeeUSD = transaction.amount * WITHDRAWAL_FEE_PERCENTAGE;

    // Get current BTC price to convert USD fee to BTC
    // Using Blockchair's price endpoint
    const priceResponse = await fetch('https://api.blockchair.com/bitcoin/stats', {
      headers: { 'Accept': 'application/json' },
    });

    if (!priceResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch BTC price' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const priceData = await priceResponse.json();
    const btcPriceUSD = priceData.data?.market_price_usd || 0;

    if (btcPriceUSD === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to get valid BTC price' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert expected fee from USD to BTC
    const expectedFeeBTC = expectedFeeUSD / btcPriceUSD;

    console.log(`Withdrawal amount: $${transaction.amount}`);
    console.log(`Expected fee: $${expectedFeeUSD} (${expectedFeeBTC} BTC at ${btcPriceUSD} USD/BTC)`);

    // Verify the BTC transaction
    const verificationResult = await verifyBTCTransaction(confirmation_fee_tx_hash, expectedFeeBTC);

    // Update the transaction with verification results
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        confirmation_fee_tx_hash,
        confirmation_fee_verified: verificationResult.fee_paid,
        confirmation_fee_verified_at: verificationResult.fee_paid ? new Date().toISOString() : null,
        admin_notes: verificationResult.error 
          ? `Confirmation fee verification failed: ${verificationResult.error}`
          : (verificationResult.fee_paid 
              ? `Confirmation fee verified: ${verificationResult.actual_amount_btc} BTC paid to ${CONFIRMATION_FEE_WALLET_BTC}`
              : null),
      })
      .eq('id', transaction_id);

    if (updateError) {
      console.error('Failed to update transaction:', updateError);
    }

    console.log('Verification result:', JSON.stringify(verificationResult));

    return new Response(
      JSON.stringify({
        ...verificationResult,
        btc_price_usd: btcPriceUSD,
        expected_fee_usd: expectedFeeUSD,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
