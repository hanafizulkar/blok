import { Link, useParams } from "react-router-dom";
import { Shield, Blocks, Calendar, AlertCircle, ArrowLeft, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBansosTrack } from "@/hooks/use-bansos";
import { BansosThemeToggle } from "@/components/bansos/BansosThemeToggle";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

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

const formatDate = (iso?: string | null) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "-";
  }
};

const normalize = (raw: string) => {
  const v = decodeURIComponent(raw).trim();
  if (/^bns[-\s]?/i.test(v)) return v.toUpperCase().replace(/\s+/g, "");
  return v;
};

export default function BansosTrackDetail() {
  const { trackingId = "" } = useParams();
  const normalized = normalize(trackingId);
  const { data: results, isLoading, error } = useBansosTrack(normalized || null);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ title: "Tautan disalin" });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "Gagal menyalin tautan", variant: "destructive" });
    }
  };

  const result = results?.[0] as any;

  return (
    <div className="min-h-screen bg-bansos-bg">
      <header className="border-b border-bansos-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/bansos" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-bansos-accent" />
            <span className="font-bold text-bansos-text tracking-tight">BansosChain</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/bansos/track" className="text-sm text-bansos-text-muted hover:text-bansos-text transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Lacak Lain
            </Link>
            <BansosThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-bansos-text mb-1">Detail Tracking</h1>
            <p className="text-sm text-bansos-text-muted font-mono break-all">{normalized}</p>
          </div>
          <Button variant="outline" size="sm" onClick={copyLink} className="shrink-0">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-1 hidden sm:inline">Salin Tautan</span>
          </Button>
        </div>

        {isLoading && <p className="text-bansos-text-muted text-sm">Memuat data tracking...</p>}

        {error && (
          <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-md p-3 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Gagal melacak: {(error as Error).message}</span>
          </div>
        )}

        {!isLoading && !error && !result && (
          <Card className="bg-bansos-surface border-bansos-border">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-bansos-text-faint" />
              <p className="text-bansos-text-muted text-sm mb-4">
                Tracking ID "<span className="font-mono">{normalized}</span>" tidak ditemukan.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/bansos/track">Coba Lacak Ulang</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {result && (() => {
          const stKey = (result.status ?? "").toLowerCase();
          return (
            <Card className="bg-bansos-surface border-bansos-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-5 gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-base text-bansos-accent font-semibold truncate">{result.tracking_id}</div>
                    <div className="text-sm text-bansos-text-muted truncate">{result.recipient_name}</div>
                  </div>
                  <Badge variant="outline" className={`text-xs capitalize shrink-0 ${statusVariant[stKey] ?? "border-bansos-border text-bansos-text-muted"}`}>
                    {statusLabel[stKey] ?? result.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-5">
                  <div>
                    <div className="text-xs text-bansos-text-faint mb-0.5">Program</div>
                    <div className="text-bansos-text">{result.program_name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-bansos-text-faint mb-0.5">Kategori</div>
                    <div className="text-bansos-text">{result.category}</div>
                  </div>
                  <div>
                    <div className="text-xs text-bansos-text-faint mb-0.5">Nominal</div>
                    <div className="text-bansos-text">Rp {Number(result.amount).toLocaleString("id-ID")}</div>
                  </div>
                  <div>
                    <div className="text-xs text-bansos-text-faint mb-0.5">Lokasi</div>
                    <div className="text-bansos-text">{result.location || "-"}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-bansos-text-muted mb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-bansos-text-faint" />
                    Dibuat: {formatDate(result.created_at)}
                  </span>
                  {result.distributed_at && (
                    <>
                      <span className="text-bansos-text-faint">•</span>
                      <span>Disalurkan: {formatDate(result.distributed_at)}</span>
                    </>
                  )}
                </div>

                {result.block_hash && (
                  <div className="bg-bansos-bg rounded p-3 border border-bansos-border">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Blocks className="h-4 w-4 text-bansos-accent shrink-0" />
                      <span className="text-xs text-bansos-text-faint">Bukti Blockchain — Blok #{result.block_index}</span>
                    </div>
                    <code className="text-[11px] text-green-600 dark:text-green-400 font-mono break-all block">
                      {result.block_hash}
                    </code>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}
      </div>
    </div>
  );
}
