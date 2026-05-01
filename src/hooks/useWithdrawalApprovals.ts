import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ApprovalInfo {
  id: string;
  transaction_id: string;
  admin_id: string;
  admin_email: string;
  approved_at: string;
  notes: string | null;
}

interface ApprovalSettings {
  threshold: number;
  requiredApprovals: number;
}

export const useWithdrawalApprovals = () => {
  const [approvals, setApprovals] = useState<Record<string, ApprovalInfo[]>>({});
  const [settings, setSettings] = useState<ApprovalSettings>({
    threshold: 5000,
    requiredApprovals: 2,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["large_withdrawal_threshold", "required_approvals_count"]);

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((s) => {
        settingsMap[s.key] = s.value;
      });

      setSettings({
        threshold: parseFloat(settingsMap["large_withdrawal_threshold"] || "5000"),
        requiredApprovals: parseInt(settingsMap["required_approvals_count"] || "2", 10),
      });
    } catch (error) {
      console.error("Error fetching approval settings:", error);
    }
  }, []);

  const fetchApprovals = useCallback(async (transactionIds: string[]) => {
    if (transactionIds.length === 0) {
      setApprovals({});
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("withdrawal_approvals")
        .select("*")
        .in("transaction_id", transactionIds);

      if (error) throw error;

      const groupedApprovals: Record<string, ApprovalInfo[]> = {};
      data?.forEach((approval) => {
        if (!groupedApprovals[approval.transaction_id]) {
          groupedApprovals[approval.transaction_id] = [];
        }
        groupedApprovals[approval.transaction_id].push(approval);
      });

      setApprovals(groupedApprovals);
    } catch (error) {
      console.error("Error fetching approvals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addApproval = async (
    transactionId: string,
    adminId: string,
    adminEmail: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.from("withdrawal_approvals").insert({
        transaction_id: transactionId,
        admin_id: adminId,
        admin_email: adminEmail,
        notes: notes || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Approved",
            description: "You have already approved this withdrawal",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return false;
      }

      toast({
        title: "Approval Added",
        description: "Your approval has been recorded",
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error adding approval",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const removeApproval = async (transactionId: string, adminId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("withdrawal_approvals")
        .delete()
        .eq("transaction_id", transactionId)
        .eq("admin_id", adminId);

      if (error) throw error;

      toast({
        title: "Approval Removed",
        description: "Your approval has been withdrawn",
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error removing approval",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const clearApprovals = async (transactionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("withdrawal_approvals")
        .delete()
        .eq("transaction_id", transactionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error clearing approvals:", error);
      return false;
    }
  };

  const canFinalApprove = (transactionId: string, amount: number): boolean => {
    const isLarge = amount >= settings.threshold;
    if (!isLarge) return true;

    const txApprovals = approvals[transactionId] || [];
    return txApprovals.length >= settings.requiredApprovals;
  };

  const getApprovalStatus = (
    transactionId: string,
    amount: number
  ): {
    isLarge: boolean;
    currentCount: number;
    requiredCount: number;
    canFinalize: boolean;
  } => {
    const isLarge = amount >= settings.threshold;
    const txApprovals = approvals[transactionId] || [];
    const currentCount = txApprovals.length;
    const requiredCount = settings.requiredApprovals;

    return {
      isLarge,
      currentCount,
      requiredCount,
      canFinalize: !isLarge || currentCount >= requiredCount,
    };
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    approvals,
    settings,
    loading,
    fetchApprovals,
    fetchSettings,
    addApproval,
    removeApproval,
    clearApprovals,
    canFinalApprove,
    getApprovalStatus,
  };
};
