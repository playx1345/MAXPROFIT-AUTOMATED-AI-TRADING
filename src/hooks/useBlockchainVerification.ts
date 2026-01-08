import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BlockchainVerificationResult {
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

export const useBlockchainVerification = () => {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<BlockchainVerificationResult | null>(null);

  const verifyTransaction = async (
    transactionHash: string,
    currency: "usdt" | "btc" | "eth" | "usdc" | "xrp"
  ): Promise<BlockchainVerificationResult | null> => {
    if (!transactionHash.trim()) {
      setResult(null);
      return null;
    }

    setVerifying(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        "verify-blockchain-transaction",
        {
          body: {
            transaction_hash: transactionHash.trim(),
            currency: currency,
          },
        }
      );

      if (error) {
        const errorResult: BlockchainVerificationResult = {
          verified: false,
          confirmed: false,
          confirmations: 0,
          amount: null,
          to_address: null,
          from_address: null,
          block_number: null,
          timestamp: null,
          error: error.message,
        };
        setResult(errorResult);
        return errorResult;
      }

      setResult(data);
      return data;
    } catch (err) {
      const errorResult: BlockchainVerificationResult = {
        verified: false,
        confirmed: false,
        confirmations: 0,
        amount: null,
        to_address: null,
        from_address: null,
        block_number: null,
        timestamp: null,
        error: err instanceof Error ? err.message : "Verification failed",
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setVerifying(false);
    }
  };

  const clearResult = () => setResult(null);

  return {
    verifying,
    result,
    verifyTransaction,
    clearResult,
  };
};
