import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Search, Eye, BarChart3, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function BansosLanding() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/bansos/track?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Nav */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/bansos" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#c9a84c]" />
            <span className="font-bold text-lg tracking-tight">BansosChain</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <Link to="/bansos/track" className="hover:text-white transition-colors">Tracking</Link>
            <Link to="/bansos/blockchain" className="hover:text-white transition-colors">Blockchain</Link>
            <Link to="/bansos/stats" className="hover:text-white transition-colors">Statistik</Link>
          </nav>
          <Link to="/bansos/login">
            <Button size="sm" className="bg-[#c9a84c] text-[#0a1628] hover:bg-[#d4b85c] font-semibold">
              Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-full px-3 py-1 text-xs text-[#c9a84c] mb-6">
            <Shield className="h-3 w-3" /> Blockchain-Powered Transparency
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            Transparansi Penyaluran{" "}
            <span className="text-[#c9a84c]">Bantuan Sosial</span>
          </h1>
          <p className="text-lg text-white/60 mb-8 max-w-lg">
            Setiap rupiah tercatat. Setiap transaksi terverifikasi. Sistem blockchain untuk akuntabilitas penyaluran bansos di Indonesia.
          </p>

          {/* Track form */}
          <form onSubmit={handleTrack} className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari NIK, QR Token, atau Tracking ID..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11"
              />
            </div>
            <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#264a73] h-11 px-6">
              Lacak <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Eye, title: "Transparan", desc: "Semua penyaluran tercatat di blockchain publik yang bisa diakses siapa saja." },
            { icon: Shield, title: "Immutable", desc: "Data tidak bisa diubah setelah dicatat — mencegah manipulasi dan korupsi." },
            { icon: BarChart3, title: "Akuntabel", desc: "Statistik real-time dan audit trail lengkap untuk setiap transaksi bansos." },
          ].map((f) => (
            <Card key={f.title} className="bg-white/[0.03] border-white/10 hover:border-[#c9a84c]/30 transition-colors">
              <CardContent className="p-6">
                <f.icon className="h-8 w-8 text-[#c9a84c] mb-3" />
                <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-white/50">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-4">
          <Link to="/bansos/track" className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/10 hover:border-[#1e3a5f] transition-colors group">
            <div>
              <div className="font-semibold text-sm text-white">Tracking Bantuan</div>
              <div className="text-xs text-white/40">Lacak status penyaluran</div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors" />
          </Link>
          <Link to="/bansos/blockchain" className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/10 hover:border-[#1e3a5f] transition-colors group">
            <div>
              <div className="font-semibold text-sm text-white">Blockchain Explorer</div>
              <div className="text-xs text-white/40">Lihat rantai transaksi</div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors" />
          </Link>
          <Link to="/bansos/stats" className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/10 hover:border-[#1e3a5f] transition-colors group">
            <div>
              <div className="font-semibold text-sm text-white">Statistik Publik</div>
              <div className="text-xs text-white/40">Dashboard data penyaluran</div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-white/30">
          BansosChain — Sistem Blockchain untuk Transparansi Bansos Indonesia
        </div>
      </footer>
    </div>
  );
}
