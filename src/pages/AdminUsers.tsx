import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Search } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("*, user_roles(role), subscriptions(status, subscription_plans(name))");
    if (data) setUsers(data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) =>
    (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.user_id || "").includes(search)
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Kelola Users</h1>
        </div>
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Cari user..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary/30">
                    <th className="text-left p-3 font-medium">Nama</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium">Langganan</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-secondary/20">
                      <td className="p-3">
                        <p className="font-medium">{u.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{u.user_id}</p>
                      </td>
                      <td className="p-3">
                        <span className="capitalize">{(u.user_roles as any[])?.[0]?.role || "user"}</span>
                      </td>
                      <td className="p-3">
                        {(u.subscriptions as any[])?.[0]?.subscription_plans?.name || "Free"}
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          (u.subscriptions as any[])?.[0]?.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          {(u.subscriptions as any[])?.[0]?.status || "—"}
                        </span>
                      </td>
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
