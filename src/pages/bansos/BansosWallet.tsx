import { useState, useEffect } from "react";
import { Wallet, ArrowDownLeft, ArrowUpRight, Copy, ShoppingBag, Link2, Unlink, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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

  // Realtime sync: dompet baru / saldo berubah / transaksi baru
  useEffect(() => {
    let userId: string | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userId = user.id;

      channel = supabase
        .channel(`wallet-sync-${userId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bansos_wallets", filter: `owner_user_id=eq.${userId}` },
          () => {
            queryClient.invalidateQueries({ queryKey: ["bansos-my-wallet"] });
            queryClient.invalidateQueries({ queryKey: ["bansos-wallet-txs"] });
          }
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "bansos_wallet_transactions" },
          (payload: any) => {
            const wId = wallet?.id;
            if (!wId) {
              queryClient.invalidateQueries({ queryKey: ["bansos-my-wallet"] });
              return;
            }
            if (payload.new?.from_wallet_id === wId || payload.new?.to_wallet_id === wId) {
              queryClient.invalidateQueries({ queryKey: ["bansos-my-wallet"] });
              queryClient.invalidateQueries({ queryKey: ["bansos-wallet-txs", wId] });
            }
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [wallet?.id, queryClient]);


  const handleConnectPhantom = async () => {
    const provider = (window as any)?.phantom?.solana ?? (window as any)?.solana;
    if (!provider?.isPhantom) {
      toast({
        title: "Phantom tidak terdeteksi",
        description: "Install ekstensi/aplikasi Phantom Wallet terlebih dahulu (phantom.app).",
        variant: "destructive",
      });
      window.open("https://phantom.app/", "_blank");
      return;
    }
    try {
      const resp = await provider.connect();
      const address = resp?.publicKey?.toString();
      if (!address) throw new Error("Gagal mendapatkan alamat Phantom");
      const { error } = await supabase.rpc("bansos_link_phantom", { _phantom_address: address });
      if (error) throw error;
      toast({ title: "Phantom terhubung", description: address.slice(0, 8) + "…" + address.slice(-6) });
      queryClient.invalidateQueries({ queryKey: ["bansos-my-wallet"] });
    } catch (err: any) {
      toast({ title: "Gagal menghubungkan", description: err?.message ?? "Coba lagi", variant: "destructive" });
    }
  };

  const handleUnlinkPhantom = async () => {
    const { error } = await supabase.rpc("bansos_unlink_phantom");
    if (error) return toast({ title: "Gagal", description: error.message, variant: "destructive" });
    try { await (window as any)?.phantom?.solana?.disconnect?.(); } catch {}
    toast({ title: "Phantom diputus" });
    queryClient.invalidateQueries({ queryKey: ["bansos-my-wallet"] });
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

      {/* Phantom Wallet link */}
      <Card className="bg-bansos-surface border-bansos-border">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-[#ab9ff2]/15 text-[#ab9ff2] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 128 128" className="h-6 w-6" fill="currentColor" aria-hidden>
              <path d="M64 16C37.5 16 16 37.5 16 64s21.5 48 48 48c2.4 0 4.4-2 4.4-4.4 0-1.2-.5-2.3-1.3-3.1-1.6-1.6-2.5-3.8-2.5-6.2 0-4.9 4-8.8 8.8-8.8h10.4c14 0 25.4-11.4 25.4-25.4C109.2 33.4 89.1 16 64 16zm-25.6 56a6.4 6.4 0 1 1 0-12.8 6.4 6.4 0 0 1 0 12.8zm22.4 0a6.4 6.4 0 1 1 0-12.8 6.4 6.4 0 0 1 0 12.8z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-bansos-text">Phantom Wallet</div>
            {(wallet as any).phantom_address ? (
              <code className="text-xs text-bansos-text-faint font-mono truncate block">
                {(wallet as any).phantom_address.slice(0, 8)}…{(wallet as any).phantom_address.slice(-6)}
              </code>
            ) : (
              <div className="text-xs text-bansos-text-muted">Hubungkan untuk verifikasi identitas Web3</div>
            )}
          </div>
          {(wallet as any).phantom_address ? (
            <Button size="sm" variant="outline" onClick={handleUnlinkPhantom}>
              <Unlink className="h-3.5 w-3.5 mr-1.5" /> Putus
            </Button>
          ) : (
            <Button size="sm" onClick={handleConnectPhantom} className="bg-[#ab9ff2] text-black hover:bg-[#9a8be8]">
              <Link2 className="h-3.5 w-3.5 mr-1.5" /> Hubungkan
            </Button>
          )}
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
