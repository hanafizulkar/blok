import { useState } from "react";
import { Wallet, ArrowDownLeft, ArrowUpRight, Copy, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBansosMyWallet, useBansosWalletTxs, useBansosMerchants } from "@/hooks/use-bansos";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const formatIDR = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;

export default function BansosWallet() {
  const { data: wallet, isLoading } = useBansosMyWallet();
  const { data: txs } = useBansosWalletTxs(wallet?.id);
  const { data: merchants } = useBansosMerchants();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [merchantId, setMerchantId] = useState("");
  const [loading, setLoading] = useState(false);

  const copyAddr = () => {
    if (!wallet?.wallet_address) return;
    navigator.clipboard.writeText(wallet.wallet_address);
    toast({ title: "Tersalin", description: "Alamat dompet disalin." });
  };

  const handlePay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const amount = Number(form.get("amount"));
    const desc = String(form.get("description") ?? "Pembelian");
    const { error } = await supabase.rpc("bansos_merchant_purchase", {
      _merchant_id: merchantId,
      _amount: amount,
      _description: desc,
    });
    setLoading(false);
    if (error) return toast({ title: "Gagal", description: error.message, variant: "destructive" });
    toast({ title: "Berhasil", description: "Pembayaran tercatat di blockchain." });
    queryClient.invalidateQueries({ queryKey: ["bansos-my-wallet"] });
    queryClient.invalidateQueries({ queryKey: ["bansos-wallet-txs"] });
    setOpen(false);
  };

  if (isLoading) {
    return <div className="p-6 text-bansos-text-muted">Memuat dompet...</div>;
  }

  if (!wallet) {
    return (
      <div className="p-4 md:p-6">
        <Card className="bg-bansos-surface border-bansos-border">
          <CardContent className="p-8 text-center">
            <Wallet className="h-10 w-10 mx-auto text-bansos-text-faint mb-3" />
            <h2 className="text-bansos-text font-semibold mb-1">Dompet belum tersedia</h2>
            <p className="text-sm text-bansos-text-muted">
              Dompet akan otomatis dibuat setelah data penerima Anda diverifikasi oleh petugas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-bansos-text">Dompet Saya</h1>
        <p className="text-sm text-bansos-text-muted">Saldo bantuan & riwayat transaksi</p>
      </div>

      {/* Balance card */}
      <Card className="bg-gradient-to-br from-bansos-primary to-bansos-primary/70 border-bansos-border overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Wallet className="h-3.5 w-3.5" /> {wallet.label}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {formatIDR(wallet.balance)}
              </div>
            </div>
            <Badge variant="outline" className="border-white/30 text-white/90 text-xs capitalize">
              {wallet.wallet_type}
            </Badge>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <code className="text-xs text-white/70 font-mono truncate">{wallet.wallet_address}</code>
            <button onClick={copyAddr} className="text-white/70 hover:text-white">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Action */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-bansos-accent text-bansos-on-accent hover:bg-bansos-accent-hover">
            <ShoppingBag className="h-4 w-4 mr-2" /> Bayar ke Merchant
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-bansos-surface border-bansos-border text-bansos-text max-w-md">
          <DialogHeader><DialogTitle>Pembayaran Merchant</DialogTitle></DialogHeader>
          <form onSubmit={handlePay} className="space-y-3">
            <div>
              <Label className="text-xs text-bansos-text-muted">Merchant</Label>
              <Select value={merchantId} onValueChange={setMerchantId}>
                <SelectTrigger className="bg-bansos-bg border-bansos-border text-bansos-text mt-1">
                  <SelectValue placeholder="Pilih merchant" />
                </SelectTrigger>
                <SelectContent>
                  {(merchants ?? []).map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} — {m.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-bansos-text-muted">Nominal</Label>
              <Input name="amount" type="number" min={1} required className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" />
            </div>
            <div>
              <Label className="text-xs text-bansos-text-muted">Keterangan</Label>
              <Input name="description" placeholder="e.g. Beli beras 5kg" className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" />
            </div>
            <Button type="submit" disabled={loading || !merchantId} className="w-full bg-bansos-accent text-bansos-on-accent hover:bg-bansos-accent-hover">
              {loading ? "Memproses..." : "Bayar Sekarang"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tx history */}
      <Card className="bg-bansos-surface border-bansos-border">
        <CardContent className="p-0">
          <div className="px-4 py-3 border-b border-bansos-border">
            <h3 className="text-sm font-semibold text-bansos-text">Riwayat Transaksi</h3>
          </div>
          <div className="divide-y divide-bansos-border">
            {(txs ?? []).map((t: any) => {
              const incoming = t.to_wallet_id === wallet.id;
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center ${incoming ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                    {incoming ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-bansos-text capitalize truncate">{t.description ?? t.tx_type}</div>
                    <div className="text-xs text-bansos-text-faint font-mono truncate">{t.tx_hash.slice(0, 18)}…</div>
                  </div>
                  <div className={`text-sm font-semibold ${incoming ? "text-emerald-500" : "text-rose-500"}`}>
                    {incoming ? "+" : "-"} {formatIDR(t.amount)}
                  </div>
                </div>
              );
            })}
            {(txs ?? []).length === 0 && (
              <div className="p-8 text-center text-sm text-bansos-text-faint">Belum ada transaksi</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
