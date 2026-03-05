import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { SessionTimeoutWarning } from "@/components/SessionTimeoutWarning";
import { PageLoader } from "@/components/PageLoader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { showWarning, dismissWarning } = useSessionTimeout();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <PageLoader />;
  if (!session) return <Navigate to="/auth" replace />;

  return (
    <>
      <SessionTimeoutWarning open={showWarning} onDismiss={dismissWarning} />
      {children}
    </>
  );
};

export default ProtectedRoute;
