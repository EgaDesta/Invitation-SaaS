import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { QRCodeSVG } from "qrcode.react";
import { PlusCircle, Trash2, Download, Copy, QrCode } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { sanitizeInput } from "@/lib/utils";

export default function GuestManager() {
  const { id } = useParams<{ id: string }>();
  useAuth();
  const [guests, setGuests] = useState<any[]>([]);
  const [invitation, setInvitation] = useState<any>(null);
  const [newName, setNewName] = useState("");
  const [bulkNames, setBulkNames] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [showQR, setShowQR] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    const { data: inv } = await supabase.from("invitations").select("*").eq("id", id).single();
    if (inv) setInvitation(inv);
    const { data: guestData } = await supabase.from("guests").select("*").eq("invitation_id", id).order("created_at");
    if (guestData) setGuests(guestData);
  };

  useEffect(() => { fetchData(); }, [id]);

  const addGuest = async () => {
    if (!newName.trim() || !id) return;
    const { error } = await supabase.from("guests").insert({ invitation_id: id, name: sanitizeInput(newName) });
    if (error) toast.error(error.message);
    else { setNewName(""); fetchData(); toast.success("Tamu ditambahkan"); }
  };

  const addBulkGuests = async () => {
    if (!bulkNames.trim() || !id) return;
    const names = bulkNames.split("\n").map((n) => sanitizeInput(n)).filter(Boolean);
    const rows = names.map((name) => ({ invitation_id: id, name }));
    const { error } = await supabase.from("guests").insert(rows);
    if (error) toast.error(error.message);
    else { setBulkNames(""); setShowBulk(false); fetchData(); toast.success(`${names.length} tamu ditambahkan`); }
  };

  const deleteGuest = async (guestId: string) => {
    const { error } = await supabase.from("guests").delete().eq("id", guestId);
    if (error) toast.error(error.message);
    else { fetchData(); toast.success("Tamu dihapus"); }
  };

  const getGuestLink = (guest: any) => {
    if (!invitation) return "";
    return `${window.location.origin}/invite/${invitation.slug}?to=${encodeURIComponent(guest.name)}`;
  };

  const exportCSV = () => {
    const csv = ["Nama,Link,RSVP Status", ...guests.map((g) => `"${g.name}","${getGuestLink(g)}","${g.rsvp_status}"`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guests-${invitation?.slug || "export"}.csv`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Kelola Tamu</h1>
            <p className="text-muted-foreground">{invitation?.title}</p>
          </div>
          <Button variant="outline" onClick={exportCSV} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>

        {/* Add guest */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Nama tamu" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGuest()} maxLength={200} />
              <Button onClick={addGuest}><PlusCircle className="w-4 h-4" /></Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowBulk(!showBulk)}>
              {showBulk ? "Tutup" : "Tambah banyak tamu sekaligus"}
            </Button>
            {showBulk && (
              <div className="space-y-2">
                <Textarea placeholder="Satu nama per baris" value={bulkNames} onChange={(e) => setBulkNames(e.target.value)} rows={5} />
                <Button onClick={addBulkGuests} size="sm">Tambah Semua</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guest list */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Daftar Tamu ({guests.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {guests.map((g) => (
              <div key={g.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="min-w-0">
                  <p className="font-medium truncate">{g.name}</p>
                  <p className="text-xs text-muted-foreground">
                    RSVP: <span className={g.rsvp_status === "attending" ? "text-primary" : g.rsvp_status === "not_attending" ? "text-destructive" : ""}>
                      {g.rsvp_status === "pending" ? "Belum" : g.rsvp_status === "attending" ? "Hadir" : g.rsvp_status === "not_attending" ? "Tidak Hadir" : "Mungkin"}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(getGuestLink(g)); toast.success("Link disalin"); }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowQR(showQR === g.id ? null : g.id)}>
                    <QrCode className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteGuest(g.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                {showQR === g.id && (
                  <div className="w-full mt-2 flex justify-center">
                    <QRCodeSVG value={getGuestLink(g)} size={128} />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
