import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search, Shield, ArrowRight, Blocks, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBansosTrack } from "@/hooks/use-bansos";
import { BansosThemeToggle } from "@/components/bansos/BansosThemeToggle";

const statusLabel: Record<string, string> = {
  scheduled: "Terjadwal",
  in_transit: "Dikirim",
  distributed: "Disalurkan",
  received: "Diterima",
  failed: "Gagal",
  cancelled: "Dibatalkan",
};

const statusVariant: Record<string, string> = {
  scheduled: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  in_transit: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  distributed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  received: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  failed: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  cancelled: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
};

const normalize = (raw: string) => {
  const v = raw.trim();
  // Tracking ID BNS-... → uppercase agar match
  if (/^bns[-\s]?/i.test(v)) {
    return v.toUpperCase().replace(/\s+/g, "");
  }
  return v;
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "-";
  }
};

export default function BansosTrack() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") ?? "";
  const [input, setInput] = useState(q);
  const { data: results, isLoading, error } = useBansosTrack(q || null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const v = normalize(input);
    if (!v) return;
    setInput(v);
    // BNS- tracking ID → langsung ke halaman detail (shareable)
    if (/^BNS-/i.test(v)) {
      navigate(`/bansos/track/${encodeURIComponent(v)}`);
      return;
    }
    setParams({ q: v });
  };

  return (
    <div className="min-h-screen bg-bansos-bg">
      <header className="border-b border-bansos-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/bansos" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-bansos-accent" />
            <span className="font-bold text-bansos-text tracking-tight">BansosChain</span>
          </Link>
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-5 text-sm text-bansos-text-muted">
              <Link to="/bansos/blockchain" className="hover:text-bansos-text transition-colors">Blockchain</Link>
              <Link to="/bansos/stats" className="hover:text-bansos-text transition-colors">Statistik</Link>
            </nav>
            <BansosThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-bansos-text mb-1">Tracking Bantuan Sosial</h1>
        <p className="text-sm text-bansos-text-muted mb-6">
          Masukkan <span className="font-mono">Tracking ID</span> (mis. <span className="font-mono">BNS-XXXXXXXXXX</span>), NIK, atau QR Token untuk melihat status bantuan.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bansos-text-faint" />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="BNS-... / NIK / QR Token"
              className="pl-10 bg-bansos-surface border-bansos-border text-bansos-text h-11 font-mono"
              autoFocus
            />
          </div>
          <Button type="submit" className="bg-bansos-primary hover:bg-bansos-primary-hover text-white h-11 px-6">
            Lacak <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>
        <p className="text-xs text-bansos-text-faint mb-8">
          Tip: pencarian tidak peka huruf besar/kecil. Pastikan karakter angka <span className="font-mono">0</span> tidak tertukar huruf <span className="font-mono">O</span>.
        </p>

        {isLoading && <p className="text-bansos-text-muted text-sm">Mencari...</p>}

        {error && (
          <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-md p-3 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Gagal melacak: {(error as Error).message}</span>
          </div>
        )}

        {q && !isLoading && !error && results?.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-8 w-8 mx-auto mb-2 text-bansos-text-faint" />
            <p className="text-bansos-text-muted text-sm">Tidak ditemukan untuk "{q}"</p>
          </div>
        )}

        {(results ?? []).map((r: any, i: number) => {
          const stKey = (r.status ?? "").toLowerCase();
          return (
            <Card key={i} className="bg-bansos-surface border-bansos-border mb-3">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="min-w-0">
                    <div className="font-mono text-sm text-bansos-accent font-semibold truncate">{r.tracking_id}</div>
                    <div className="text-xs text-bansos-text-muted truncate">{r.recipient_name}</div>
                  </div>
                  <Badge variant="outline" className={`text-xs capitalize shrink-0 ${statusVariant[stKey] ?? "border-bansos-border text-bansos-text-muted"}`}>
                    {statusLabel[stKey] ?? r.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
                  <div><div className="text-bansos-text-faint">Program</div><div className="text-bansos-text">{r.program_name}</div></div>
                  <div><div className="text-bansos-text-faint">Kategori</div><div className="text-bansos-text">{r.category}</div></div>
                  <div><div className="text-bansos-text-faint">Nominal</div><div className="text-bansos-text">Rp {Number(r.amount).toLocaleString("id-ID")}</div></div>
                  <div><div className="text-bansos-text-faint">Lokasi</div><div className="text-bansos-text">{r.location || "-"}</div></div>
                </div>

                <div className="flex items-center gap-2 text-xs text-bansos-text-muted mb-2">
                  <Calendar className="h-3.5 w-3.5 text-bansos-text-faint" />
                  <span>Dibuat: {formatDate(r.created_at)}</span>
                  {r.distributed_at && (
                    <>
                      <span className="text-bansos-text-faint">•</span>
                      <span>Disalurkan: {formatDate(r.distributed_at)}</span>
                    </>
                  )}
                </div>

                {r.block_hash && (
                  <div className="bg-bansos-bg rounded p-2.5 border border-bansos-border flex items-center gap-2">
                    <Blocks className="h-4 w-4 text-bansos-accent shrink-0" />
                    <div className="text-[10px] min-w-0">
                      <span className="text-bansos-text-faint">Blok #{r.block_index} • Hash: </span>
                      <code className="text-green-600 dark:text-green-400 font-mono break-all">{r.block_hash}</code>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
