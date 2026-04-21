import { useState } from "react";
import { Plus, Search, UserCheck, UserX, Clock, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBansosRecipients } from "@/hooks/use-bansos";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

const statusColors: Record<string, string> = {
  pending: "text-yellow-600 dark:text-yellow-400 border-yellow-500/40",
  verified: "text-green-600 dark:text-green-400 border-green-500/40",
  rejected: "text-red-600 dark:text-red-400 border-red-500/40",
};
const statusIcons: Record<string, any> = { pending: Clock, verified: UserCheck, rejected: UserX };

export default function BansosRecipients() {
  const { data: recipients, isLoading } = useBansosRecipients();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrDialog, setQrDialog] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filtered = (recipients ?? []).filter((r: any) =>
    r.full_name.toLowerCase().includes(search.toLowerCase()) ||
    r.nik.includes(search) ||
    r.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("bansos_recipients").insert({
      nik: form.get("nik") as string,
      full_name: form.get("full_name") as string,
      address: form.get("address") as string,
      province: form.get("province") as string,
      city: form.get("city") as string,
      phone: form.get("phone") as string,
      category: form.get("category") as any,
      created_by: user?.id,
    });
    setLoading(false);
    if (error) return toast({ title: "Gagal", description: error.message, variant: "destructive" });
    toast({ title: "Berhasil", description: "Penerima baru ditambahkan." });
    queryClient.invalidateQueries({ queryKey: ["bansos-recipients"] });
    setDialogOpen(false);
  };

  const handleVerify = async (id: string, status: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("bansos_recipients").update({
      verification_status: status as any,
      verified_by: user?.id,
      verified_at: new Date().toISOString(),
    }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["bansos-recipients"] });
    toast({ title: "Status diperbarui" });
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-bansos-text">Data Penerima Bansos</h1>
          <p className="text-sm text-bansos-text-muted">{filtered.length} penerima</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-bansos-accent text-bansos-on-accent hover:bg-bansos-accent-hover">
              <Plus className="h-4 w-4 mr-1" /> Tambah
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-bansos-surface border-bansos-border text-bansos-text max-w-md">
            <DialogHeader><DialogTitle>Tambah Penerima</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-bansos-text-muted">NIK</Label>
                  <Input name="nik" required maxLength={16} minLength={16} className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-bansos-text-muted">Nama Lengkap</Label>
                  <Input name="full_name" required className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-bansos-text-muted">Alamat</Label>
                <Input name="address" className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-bansos-text-muted">Provinsi</Label>
                  <Input name="province" className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-bansos-text-muted">Kota/Kabupaten</Label>
                  <Input name="city" className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-bansos-text-muted">Telepon</Label>
                  <Input name="phone" className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-bansos-text-muted">Kategori</Label>
                  <Select name="category" defaultValue="PKH">
                    <SelectTrigger className="bg-bansos-bg border-bansos-border text-bansos-text mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["PKH", "BPNT", "BLT", "PIP", "BST", "Lainnya"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-bansos-accent text-bansos-on-accent hover:bg-bansos-accent-hover">
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bansos-text-faint" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, NIK, kota..." className="pl-10 bg-bansos-surface border-bansos-border text-bansos-text placeholder:text-bansos-text-faint" />
      </div>

      <Card className="bg-bansos-surface border-bansos-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-bansos-text-faint text-xs border-b border-bansos-border">
                  <th className="text-left py-3 px-4">NIK</th>
                  <th className="text-left py-3 px-4">Nama</th>
                  <th className="text-left py-3 px-4 hidden md:table-cell">Kota</th>
                  <th className="text-left py-3 px-4">Kategori</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: any) => {
                  const StatusIcon = statusIcons[r.verification_status] ?? Clock;
                  return (
                    <tr key={r.id} className="border-b border-bansos-border text-bansos-text-muted hover:bg-bansos-bg/50">
                      <td className="py-2.5 px-4 font-mono text-xs">{r.nik}</td>
                      <td className="py-2.5 px-4">{r.full_name}</td>
                      <td className="py-2.5 px-4 hidden md:table-cell">{r.city || "-"}</td>
                      <td className="py-2.5 px-4"><Badge variant="outline" className="text-xs border-bansos-accent/40 text-bansos-accent">{r.category}</Badge></td>
                      <td className="py-2.5 px-4">
                        <Badge variant="outline" className={`text-xs ${statusColors[r.verification_status]}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />{r.verification_status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 text-right space-x-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-bansos-text-muted hover:text-bansos-text" onClick={() => setQrDialog(r.qr_token)}>
                          <QrCode className="h-3.5 w-3.5" />
                        </Button>
                        {r.verification_status === "pending" && (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-green-600 dark:text-green-400 hover:opacity-80" onClick={() => handleVerify(r.id, "verified")}>Verifikasi</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600 dark:text-red-400 hover:opacity-80" onClick={() => handleVerify(r.id, "rejected")}>Tolak</Button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-bansos-text-faint text-sm">{isLoading ? "Memuat..." : "Tidak ada data"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!qrDialog} onOpenChange={() => setQrDialog(null)}>
        <DialogContent className="bg-bansos-surface border-bansos-border text-bansos-text max-w-xs text-center">
          <DialogHeader><DialogTitle className="text-sm">QR Code Penerima</DialogTitle></DialogHeader>
          {qrDialog && (
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-3 rounded-lg"><QRCodeSVG value={qrDialog} size={180} /></div>
              <code className="text-[10px] text-bansos-text-faint font-mono break-all">{qrDialog}</code>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
