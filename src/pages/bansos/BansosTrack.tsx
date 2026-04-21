import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Shield, ArrowRight, CheckCircle, Package, Blocks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBansosTrack } from "@/hooks/use-bansos";

export default function BansosTrack() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [input, setInput] = useState(q);
  const { data: results, isLoading } = useBansosTrack(q || null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) setParams({ q: input.trim() });
  };

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Nav */}
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/bansos" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#c9a84c]" />
            <span className="font-bold text-white tracking-tight">BansosChain</span>
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm text-white/50">
            <Link to="/bansos/blockchain" className="hover:text-white transition-colors">Blockchain</Link>
            <Link to="/bansos/stats" className="hover:text-white transition-colors">Statistik</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-1">Tracking Bantuan Sosial</h1>
        <p className="text-sm text-white/50 mb-6">Masukkan NIK, QR Token, atau Tracking ID untuk melihat status bantuan</p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Cari..." className="pl-10 bg-white/5 border-white/10 text-white h-11" />
          </div>
          <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#264a73] h-11 px-6">
            Lacak <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        {isLoading && <p className="text-white/40 text-sm">Mencari...</p>}

        {q && !isLoading && results?.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-8 w-8 mx-auto mb-2 text-white/20" />
            <p className="text-white/40 text-sm">Tidak ditemukan untuk "{q}"</p>
          </div>
        )}

        {(results ?? []).map((r: any, i: number) => (
          <Card key={i} className="bg-white/[0.03] border-white/10 mb-3">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-mono text-sm text-[#c9a84c] font-semibold">{r.tracking_id}</div>
                  <div className="text-xs text-white/40">{r.recipient_name}</div>
                </div>
                <Badge variant="outline" className="text-xs border-white/20 text-white/60 capitalize">{r.status}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
                <div>
                  <div className="text-white/30">Program</div>
                  <div className="text-white/70">{r.program_name}</div>
                </div>
                <div>
                  <div className="text-white/30">Kategori</div>
                  <div className="text-white/70">{r.category}</div>
                </div>
                <div>
                  <div className="text-white/30">Nominal</div>
                  <div className="text-white/70">Rp {Number(r.amount).toLocaleString("id-ID")}</div>
                </div>
                <div>
                  <div className="text-white/30">Lokasi</div>
                  <div className="text-white/70">{r.location || "-"}</div>
                </div>
              </div>

              {r.block_hash && (
                <div className="bg-black/20 rounded p-2.5 border border-white/5 flex items-center gap-2">
                  <Blocks className="h-4 w-4 text-[#c9a84c] shrink-0" />
                  <div className="text-[10px]">
                    <span className="text-white/30">Blok #{r.block_index} • Hash: </span>
                    <code className="text-green-400/70 font-mono">{r.block_hash}</code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
