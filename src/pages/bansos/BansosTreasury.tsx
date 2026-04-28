import { useState } from "react";
import { Landmark, Plus, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBansosTreasuryWallets, useBansosPrograms, useBansosAllTxs } from "@/hooks/use-bansos";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const formatIDR = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;

export default function BansosTreasury() {
  const { data: wallets, isLoading } = useBansosTreasuryWallets();
  const { data: programs } = useBansosPrograms();
  const { data: txs } = useBansosAllTxs();
  const [open, setOpen] = useState(false);
  const [programId, setProgramId] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const totalBudget = (wallets ?? []).reduce((s: number, w: any) => s + Number(w.balance), 0);

  const handleTopup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.rpc("bansos_treasury_topup", {
      _program_id: programId,
      _amount: Number(form.get("amount")),
      _description: String(form.get("description") ?? "Top-up anggaran"),
    });
    setLoading(false);
    if (error) return toast({ title: "Gagal", description: error.message, variant: "destructive" });
    toast({ title: "Berhasil", description: "Anggaran bertambah & tercatat di blockchain." });
    queryClient.invalidateQueries({ queryKey: ["bansos-treasury-wallets"] });
    queryClient.invalidateQueries({ queryKey: ["bansos-all-txs"] });
    queryClient.invalidateQueries({ queryKey: ["bansos-programs"] });
    setOpen(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-bansos-text">Treasury Anggaran</h1>
          <p className="text-sm text-bansos-text-muted">Dompet pemerintah per program</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-bansos-accent text-bansos-on-accent hover:bg-bansos-accent-hover">
              <Plus className="h-4 w-4 mr-1" /> Top-up
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-bansos-surface border-bansos-border text-bansos-text max-w-md">
            <DialogHeader><DialogTitle>Top-up Anggaran Program</DialogTitle></DialogHeader>
            <form onSubmit={handleTopup} className="space-y-3">
              <div>
                <Label className="text-xs text-bansos-text-muted">Program</Label>
                <Select value={programId} onValueChange={setProgramId}>
                  <SelectTrigger className="bg-bansos-bg border-bansos-border text-bansos-text mt-1">
                    <SelectValue placeholder="Pilih program" />
                  </SelectTrigger>
                  <SelectContent>
                    {(programs ?? []).map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-bansos-text-muted">Nominal (Rp)</Label>
                <Input name="amount" type="number" min={1} required className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" />
              </div>
              <div>
                <Label className="text-xs text-bansos-text-muted">Keterangan</Label>
                <Input name="description" placeholder="Sumber APBN/hibah" className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" />
              </div>
              <Button type="submit" disabled={loading || !programId} className="w-full bg-bansos-accent text-bansos-on-accent hover:bg-bansos-accent-hover">
                {loading ? "Memproses..." : "Top-up Anggaran"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total */}
      <Card className="bg-bansos-surface border-bansos-border">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-md bg-bansos-accent/10 text-bansos-accent flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-bansos-text-muted">Total Saldo Treasury</div>
            <div className="text-2xl font-bold text-bansos-text">{formatIDR(totalBudget)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(wallets ?? []).map((w: any) => (
          <Card key={w.id} className="bg-bansos-surface border-bansos-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-bansos-accent" />
                  <span className="text-sm font-semibold text-bansos-text">{w.label}</span>
                </div>
                <Badge variant="outline" className="text-xs border-bansos-border text-bansos-text-muted">
                  {w.bansos_programs?.category ?? "treasury"}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-bansos-text">{formatIDR(w.balance)}</div>
              <code className="block mt-2 text-[10px] text-bansos-text-faint font-mono truncate">{w.wallet_address}</code>
            </CardContent>
          </Card>
        ))}
        {!isLoading && (wallets ?? []).length === 0 && (
          <Card className="bg-bansos-surface border-bansos-border md:col-span-2">
            <CardContent className="p-8 text-center text-sm text-bansos-text-faint">
              Belum ada dompet treasury. Klik Top-up untuk membuat.
            </CardContent>
          </Card>
        )}
      </div>

      {/* All txs */}
      <Card className="bg-bansos-surface border-bansos-border">
        <CardContent className="p-0">
          <div className="px-4 py-3 border-b border-bansos-border">
            <h3 className="text-sm font-semibold text-bansos-text">Aliran Transaksi Terbaru</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-bansos-text-faint text-xs border-b border-bansos-border">
                  <th className="text-left py-2.5 px-4">Hash</th>
                  <th className="text-left py-2.5 px-4">Jenis</th>
                  <th className="text-left py-2.5 px-4 hidden md:table-cell">Keterangan</th>
                  <th className="text-right py-2.5 px-4">Jumlah</th>
                  <th className="text-left py-2.5 px-4 hidden lg:table-cell">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {(txs ?? []).map((t: any) => (
                  <tr key={t.id} className="border-b border-bansos-border text-bansos-text-muted">
                    <td className="py-2 px-4 font-mono text-xs text-bansos-accent">{t.tx_hash.slice(0, 14)}…</td>
                    <td className="py-2 px-4"><Badge variant="outline" className="text-xs capitalize border-bansos-border">{t.tx_type}</Badge></td>
                    <td className="py-2 px-4 hidden md:table-cell truncate max-w-xs">{t.description ?? "-"}</td>
                    <td className="py-2 px-4 text-right font-semibold text-bansos-text">{formatIDR(t.amount)}</td>
                    <td className="py-2 px-4 hidden lg:table-cell text-xs text-bansos-text-faint">
                      {new Date(t.created_at).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
                {(txs ?? []).length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-bansos-text-faint">Belum ada transaksi</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
