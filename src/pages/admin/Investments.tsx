import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

interface Investment {
  id: string;
  user_id: string;
  plan_id: string;
  amount_usdt: number;
  current_value: number;
  roi_percentage: number;
  status: string;
  created_at: string;
  started_at: string | null;
  ends_at: string | null;
  profiles: {
    email: string;
    full_name: string | null;
  };
  investment_plans: {
    name: string;
    expected_roi_min: number;
    expected_roi_max: number;
    duration_days: number;
  };
}

const AdminInvestments = () => {
  const { t } = useTranslation();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from("investments")
        .select(`
          *,
          profiles!investments_user_id_fkey(email, full_name),
          investment_plans(name, expected_roi_min, expected_roi_max, duration_days)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error: any) {
      toast({
        title: t('admin.investments.errorFetching'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const activeInvestments = investments.filter((inv) => inv.status === "active");
  const pendingInvestments = investments.filter((inv) => inv.status === "pending");
  const completedInvestments = investments.filter((inv) => inv.status === "completed");

  const filteredInvestments = (data: Investment[]) => {
    if (!searchTerm) return data;
    return data.filter(
      (inv) =>
        inv.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const InvestmentTable = ({ data }: { data: Investment[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('admin.common.user')}</TableHead>
          <TableHead>{t('admin.investments.plan')}</TableHead>
          <TableHead>{t('admin.common.amount')}</TableHead>
          <TableHead>{t('admin.investments.currentValue')}</TableHead>
          <TableHead>{t('admin.investments.roi')}</TableHead>
          <TableHead>{t('admin.common.status')}</TableHead>
          <TableHead>{t('admin.common.date')}</TableHead>
          <TableHead>{t('admin.common.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredInvestments(data).length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">
              {t('admin.investments.noInvestments')}
            </TableCell>
          </TableRow>
        ) : (
          filteredInvestments(data).map((investment) => (
            <TableRow key={investment.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{investment.profiles?.full_name || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">{investment.profiles?.email}</p>
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {investment.investment_plans?.name || "Unknown"}
              </TableCell>
              <TableCell className="font-semibold">
                ${investment.amount_usdt.toLocaleString()}
              </TableCell>
              <TableCell className="font-semibold text-primary">
                ${investment.current_value.toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge className={investment.roi_percentage > 0 ? "bg-green-500" : "bg-red-500"}>
                  {investment.roi_percentage > 0 ? "+" : ""}
                  {investment.roi_percentage.toFixed(2)}%
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    investment.status === "active"
                      ? "bg-green-500"
                      : investment.status === "pending"
                      ? "bg-yellow-500"
                      : "bg-muted"
                  }
                >
                  {investment.status}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(investment.created_at), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedInvestment(investment);
                    setDetailsOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {t('admin.common.view')}
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">{t('admin.investments.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.investments.title')}</h1>
          <p className="text-muted-foreground">{t('admin.investments.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-lg">
            {t('admin.investments.activeCount', { count: activeInvestments.length })}
          </Badge>
          <Badge variant="outline" className="text-lg">
            {t('admin.common.total')}: ${investments.reduce((sum, inv) => sum + inv.current_value, 0).toLocaleString()}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.investments.allInvestments')}</CardTitle>
          <CardDescription>{t('admin.investments.allInvestmentsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder={t('admin.investments.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">
                {t('admin.common.active')} ({activeInvestments.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                {t('admin.common.pending')} ({pendingInvestments.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                {t('admin.common.completed')} ({completedInvestments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              <InvestmentTable data={activeInvestments} />
            </TabsContent>
            <TabsContent value="pending" className="mt-4">
              <InvestmentTable data={pendingInvestments} />
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <InvestmentTable data={completedInvestments} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Investment Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('admin.investments.investmentDetails')}</DialogTitle>
            <DialogDescription>{t('admin.investments.investmentDetailsDesc')}</DialogDescription>
          </DialogHeader>

          {selectedInvestment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('admin.investments.investor')}</Label>
                  <p className="font-medium">{selectedInvestment.profiles?.full_name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">{selectedInvestment.profiles?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.investments.investmentPlan')}</Label>
                  <p className="font-medium">{selectedInvestment.investment_plans?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvestment.investment_plans?.duration_days} {t('plans.days')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.investments.initialAmount')}</Label>
                  <p className="font-bold text-xl">${selectedInvestment.amount_usdt.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.investments.currentValue')}</Label>
                  <p className="font-bold text-xl text-primary">${selectedInvestment.current_value.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.investments.roi')}</Label>
                  <Badge className={selectedInvestment.roi_percentage > 0 ? "bg-green-500 text-lg" : "bg-red-500 text-lg"}>
                    {selectedInvestment.roi_percentage > 0 ? "+" : ""}
                    {selectedInvestment.roi_percentage.toFixed(2)}%
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.investments.profitLoss')}</Label>
                  <p className={`font-semibold text-lg ${selectedInvestment.current_value >= selectedInvestment.amount_usdt ? "text-green-600" : "text-red-600"}`}>
                    ${(selectedInvestment.current_value - selectedInvestment.amount_usdt).toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.common.status')}</Label>
                  <Badge
                    className={
                      selectedInvestment.status === "active"
                        ? "bg-green-500"
                        : selectedInvestment.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-muted"
                    }
                  >
                    {selectedInvestment.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.investments.created')}</Label>
                  <p className="font-medium">
                    {format(new Date(selectedInvestment.created_at), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
                {selectedInvestment.started_at && (
                  <div>
                    <Label className="text-muted-foreground">{t('admin.investments.started')}</Label>
                    <p className="font-medium">
                      {format(new Date(selectedInvestment.started_at), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                )}
                {selectedInvestment.ends_at && (
                  <div>
                    <Label className="text-muted-foreground">{t('admin.investments.ends')}</Label>
                    <p className="font-medium">
                      {format(new Date(selectedInvestment.ends_at), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <Label className="text-muted-foreground">{t('admin.investments.expectedRoiRange')}</Label>
                <p className="text-sm">
                  {selectedInvestment.investment_plans?.expected_roi_min}% -{" "}
                  {selectedInvestment.investment_plans?.expected_roi_max}%
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInvestments;
