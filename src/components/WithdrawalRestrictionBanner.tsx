import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Restriction {
  id: string;
  deadline: string;
  message: string | null;
  status: string;
}

export const WithdrawalRestrictionBanner = () => {
  const [restriction, setRestriction] = useState<Restriction | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const fetchRestriction = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_restrictions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setRestriction(data[0] as Restriction);
      }
    };

    fetchRestriction();
  }, []);

  useEffect(() => {
    if (!restriction) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const deadline = new Date(restriction.deadline).getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setExpired(true);
        setTimeLeft("00:00:00");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [restriction]);

  if (!restriction) return null;

  return (
    <Alert
      className={`border-2 ${
        expired
          ? "border-destructive bg-destructive/10"
          : "border-yellow-500 bg-yellow-500/10"
      } animate-fade-in`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className={`h-5 w-5 mt-0.5 shrink-0 ${
              expired ? "text-destructive" : "text-yellow-600"
            }`}
          />
          <div className="flex-1">
            <h4 className="font-bold text-base mb-1">
              {expired
                ? "⚠️ Withdrawal Deadline Expired"
                : "⏳ Withdrawal Required"}
            </h4>
            <AlertDescription className="text-sm">
              {expired ? (
                <span>
                  Your withdrawal deadline has passed. Your account may be
                  suspended. If you are having challenges, please contact admin
                  support immediately.
                </span>
              ) : (
                <span>
                  You must complete a withdrawal before the deadline. Failure to
                  do so will result in your account being suspended until further
                  notice.
                </span>
              )}
            </AlertDescription>
            {restriction.message && (
              <p className="text-sm text-muted-foreground mt-1 italic">
                Admin note: {restriction.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Clock
              className={`h-4 w-4 ${
                expired ? "text-destructive" : "text-yellow-600"
              }`}
            />
            <span
              className={`font-mono text-2xl font-bold ${
                expired
                  ? "text-destructive"
                  : "text-yellow-600"
              }`}
            >
              {timeLeft}
            </span>
            <span className="text-sm text-muted-foreground">remaining</span>
          </div>

          {!expired && (
            <Link to="/dashboard/withdraw">
              <Button size="sm" className="gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Withdraw Now
              </Button>
            </Link>
          )}
        </div>

        {expired && (
          <p className="text-xs text-muted-foreground">
            If you are having challenges with the withdrawal process, please
            contact admin support for assistance.
          </p>
        )}
      </div>
    </Alert>
  );
};
