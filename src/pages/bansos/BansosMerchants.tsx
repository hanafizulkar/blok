import { useState } from "react";
import { Store, Plus, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useBansosMerchants } from "@/hooks/use-bansos";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const formatIDR = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;

export default function BansosMerchants() {
  const { data: merchants, isLoading } = useBansosMerchants();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("bansos_merchants").insert({
      owner_user_id: user?.id,
      name: String(form.get("name")),
      category: String(form.get("category") ?? "sembako"),
      address: String(form.get("address") ?? ""),
      phone: String(form.get("phone") ?? ""),
    });
    setLoading(false);
    if (error) return toast({ title: "Gagal", description: error.message, variant: "destructive" });
    toast({ title: "Berhasil", description: "Merchant terdaftar." });
    queryClient.invalidateQueries({ queryKey: ["bansos-merchants"] });
    setOpen(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-bansos-text">Merchants</h1>
          <p className="text-sm text-bansos-text-muted">Toko/warung penerima pembayaran Bansos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-bansos-accent text-bansos-on-accent hover:bg-bansos-accent-hover">
              <Plus className="h-4 w-4 mr-1" /> Daftar Merchant
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-bansos-surface border-bansos-border text-bansos-text max-w-md">
            <DialogHeader><DialogTitle>Daftarkan Merchant</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div><Label className="text-xs text-bansos-text-muted">Nama Toko</Label>
                <Input name="name" required className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" /></div>
              <div><Label className="text-xs text-bansos-text-muted">Kategori</Label>
                <Input name="category" defaultValue="sembako" className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" /></div>
              <div><Label className="text-xs text-bansos-text-muted">Alamat</Label>
                <Input name="address" className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" /></div>
              <div><Label className="text-xs text-bansos-text-muted">Telepon</Label>
                <Input name="phone" className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" /></div>
              <Button type="submit" disabled={loading} className="w-full bg-bansos-accent text-bansos-on-accent hover:bg-bansos-accent-hover">
                {loading ? "Memproses..." : "Daftar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(merchants ?? []).map((m: any) => (
          <Card key={m.id} className="bg-bansos-surface border-bansos-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-bansos-accent" />
                  <span className="font-semibold text-bansos-text">{m.name}</span>
                </div>
                {m.is_verified && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              </div>
              <Badge variant="outline" className="text-xs border-bansos-border text-bansos-text-muted capitalize mb-2">{m.category}</Badge>
              <div className="text-xs text-bansos-text-muted">{m.address ?? "-"}</div>
              <div className="text-xs text-bansos-text-faint">{m.phone ?? "-"}</div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && (merchants ?? []).length === 0 && (
          <Card className="bg-bansos-surface border-bansos-border md:col-span-2 lg:col-span-3">
            <CardContent className="p-8 text-center text-sm text-bansos-text-faint">Belum ada merchant terdaftar.</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
