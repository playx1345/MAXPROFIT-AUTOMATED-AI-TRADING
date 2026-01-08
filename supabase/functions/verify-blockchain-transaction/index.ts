import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// Verify USDT TRC20 transaction using TronGrid API
async function verifyTRC20Transaction(txHash: string): Promise<BlockchainVerificationResult> {
  try {
    console.log(`Verifying TRC20 transaction: ${txHash}`);
    
    // Get transaction info from TronGrid
    const response = await fetch(`https://api.trongrid.io/v1/transactions/${txHash}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`TronGrid API error: ${response.status}`);
      return {
        verified: false,
        confirmed: false,
        confirmations: 0,
        amount: null,
        to_address: null,
        from_address: null,
        block_number: null,
        timestamp: null,
        error: 'Transaction not found on TRON network',
      };
    }

    const data = await response.json();
    console.log('TronGrid response:', JSON.stringify(data));

    if (!data.data || data.data.length === 0) {
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

    const tx = data.data[0];
    const isConfirmed = tx.ret && tx.ret[0] && tx.ret[0].contractRet === 'SUCCESS';
    
    // For TRC20 transactions, we need to check the contract data
    let amount = null;
    let toAddress = null;
    let fromAddress = null;

    if (tx.raw_data && tx.raw_data.contract && tx.raw_data.contract[0]) {
      const contract = tx.raw_data.contract[0];
      if (contract.parameter && contract.parameter.value) {
        const value = contract.parameter.value;
        fromAddress = value.owner_address;
        toAddress = value.to_address || value.contract_address;
        
        // For TRC20, amount is in the data field
        if (value.data) {
          // TRC20 transfer data format: transfer(address,uint256)
          // Last 64 chars are the amount in hex
          const dataHex = value.data;
          if (dataHex.length >= 72) {
            const amountHex = dataHex.slice(-64);
            amount = parseInt(amountHex, 16) / 1e6; // USDT has 6 decimals
          }
        } else if (value.amount) {
          amount = value.amount / 1e6;
        }
      }
    }

    // Get current block to calculate confirmations
    const blockResponse = await fetch('https://api.trongrid.io/walletsolidity/getnowblock', {
      headers: { 'Accept': 'application/json' },
    });
    
    let confirmations = 0;
    if (blockResponse.ok && tx.blockNumber) {
      const blockData = await blockResponse.json();
      const currentBlock = blockData.block_header?.raw_data?.number || 0;
      confirmations = Math.max(0, currentBlock - tx.blockNumber);
    }

    return {
      verified: true,
      confirmed: isConfirmed && confirmations >= 19,
      confirmations,
      amount,
      to_address: toAddress,
      from_address: fromAddress,
      block_number: tx.blockNumber || null,
      timestamp: tx.raw_data?.timestamp ? new Date(tx.raw_data.timestamp).toISOString() : null,
    };
  } catch (error) {
    console.error('TRC20 verification error:', error);
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

    // Get the first output as the main recipient
    const mainOutput = outputs[0];
    
    // Calculate total output amount in BTC
    const totalOutputSatoshis = outputs.reduce((sum: number, out: any) => sum + (out.value || 0), 0);
    const amountBTC = totalOutputSatoshis / 1e8;

    // Confirmations - Bitcoin is considered confirmed after 6 confirmations
    const confirmations = tx.block_id ? data.context?.state - tx.block_id + 1 : 0;
    const isConfirmed = confirmations >= 6;

    return {
      verified: true,
      confirmed: isConfirmed,
      confirmations: Math.max(0, confirmations),
      amount: amountBTC,
      to_address: mainOutput?.recipient || null,
      from_address: txData.inputs?.[0]?.recipient || null,
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

// Verify XRP transaction using XRP Ledger API
async function verifyXRPTransaction(txHash: string): Promise<BlockchainVerificationResult> {
  try {
    console.log(`Verifying XRP transaction: ${txHash}`);
    
    const response = await fetch('https://s1.ripple.com:51234/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'tx',
        params: [{
          transaction: txHash,
          binary: false,
        }],
      }),
    });

    if (!response.ok) {
      console.error(`XRP Ledger API error: ${response.status}`);
      return {
        verified: false,
        confirmed: false,
        confirmations: 0,
        amount: null,
        to_address: null,
        from_address: null,
        block_number: null,
        timestamp: null,
        error: 'Transaction not found on XRP Ledger',
      };
    }

    const data = await response.json();
    console.log('XRP Ledger response:', JSON.stringify(data));

    if (data.result.status !== 'success' || !data.result) {
      return {
        verified: false,
        confirmed: false,
        confirmations: 0,
        amount: null,
        to_address: null,
        from_address: null,
        block_number: null,
        timestamp: null,
        error: data.result.error_message || 'Transaction not found',
      };
    }

    const tx = data.result;
    const isValidated = tx.validated === true;
    
    // XRP amounts are in drops (1 XRP = 1,000,000 drops)
    let amount = null;
    if (tx.Amount) {
      if (typeof tx.Amount === 'string') {
        amount = parseInt(tx.Amount) / 1000000;
      } else if (typeof tx.Amount === 'object' && tx.Amount.value) {
        // Token payment
        amount = parseFloat(tx.Amount.value);
      }
    }

    // Get ledger info for confirmations estimate
    let confirmations = 0;
    if (isValidated && tx.ledger_index) {
      try {
        const ledgerResponse = await fetch('https://s1.ripple.com:51234/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'ledger_current',
            params: [{}],
          }),
        });
        if (ledgerResponse.ok) {
          const ledgerData = await ledgerResponse.json();
          const currentLedger = ledgerData.result.ledger_current_index;
          confirmations = Math.max(0, currentLedger - tx.ledger_index);
        }
      } catch (e) {
        console.error('Error getting current ledger:', e);
        confirmations = isValidated ? 1 : 0;
      }
    }

    // XRP is considered confirmed once validated (usually within 4 seconds)
    const isConfirmed = isValidated;

    return {
      verified: true,
      confirmed: isConfirmed,
      confirmations,
      amount,
      to_address: tx.Destination || null,
      from_address: tx.Account || null,
      block_number: tx.ledger_index || null,
      timestamp: tx.date ? new Date((tx.date + 946684800) * 1000).toISOString() : null,
    };
  } catch (error) {
    console.error('XRP verification error:', error);
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transaction_hash, currency } = await req.json();

    if (!transaction_hash) {
      return new Response(
        JSON.stringify({ error: 'Transaction hash is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!currency || !['usdt', 'btc', 'xrp'].includes(currency.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: 'Currency must be usdt, btc, or xrp' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Verifying ${currency.toUpperCase()} transaction: ${transaction_hash}`);

    let result: BlockchainVerificationResult;

    if (currency.toLowerCase() === 'usdt') {
      result = await verifyTRC20Transaction(transaction_hash);
    } else if (currency.toLowerCase() === 'xrp') {
      result = await verifyXRPTransaction(transaction_hash);
    } else {
      result = await verifyBTCTransaction(transaction_hash);
    }

    console.log('Verification result:', JSON.stringify(result));

    return new Response(
      JSON.stringify(result),
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
