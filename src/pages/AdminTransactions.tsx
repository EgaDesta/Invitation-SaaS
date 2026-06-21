import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchTx = async () => {
      let q = supabase.from("transactions").select("*, subscription_plans(name), profiles!transactions_user_id_fkey(full_name)").order("created_at", { ascending: false });
      if (statusFilter !== "all") q = q.eq("status", statusFilter as "pending" | "success" | "failed" | "expired" | "refunded");
      const { data } = await q;
      if (data) setTransactions(data);
    };
    fetchTx();
  }, [statusFilter]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Transaksi</h1>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary/30">
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium">Paket</th>
                    <th className="text-left p-3 font-medium">Jumlah</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-secondary/20">
                      <td className="p-3">{(t.profiles as any)?.full_name || "—"}</td>
                      <td className="p-3">{(t.subscription_plans as any)?.name || "—"}</td>
                      <td className="p-3 font-medium">Rp {t.amount.toLocaleString("id-ID")}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          t.status === "success" ? "bg-primary/10 text-primary" :
                          t.status === "pending" ? "bg-gold/10 text-gold" :
                          "bg-destructive/10 text-destructive"
                        }`}>{t.status}</span>
                      </td>
                      <td className="p-3 text-muted-foreground">{new Date(t.created_at).toLocaleDateString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
