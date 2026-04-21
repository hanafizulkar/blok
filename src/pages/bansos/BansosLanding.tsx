import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Search, Eye, BarChart3, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BansosThemeToggle } from "@/components/bansos/BansosThemeToggle";

export default function BansosLanding() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/bansos/track?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen bg-bansos-bg text-bansos-text">
      <header className="border-b border-bansos-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/bansos" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-bansos-accent" />
            <span className="font-bold text-lg tracking-tight">BansosChain</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-bansos-text-muted">
            <Link to="/bansos/track" className="hover:text-bansos-text transition-colors">Tracking</Link>
            <Link to="/bansos/blockchain" className="hover:text-bansos-text transition-colors">Blockchain</Link>
            <Link to="/bansos/stats" className="hover:text-bansos-text transition-colors">Statistik</Link>
          </nav>
          <div className="flex items-center gap-2">
            <BansosThemeToggle />
            <Link to="/bansos/login">
              <Button size="sm" className="bg-bansos-accent text-bansos-on-accent hover:bg-bansos-accent-hover font-semibold">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-bansos-accent/10 border border-bansos-accent/30 rounded-full px-3 py-1 text-xs text-bansos-accent mb-6">
            <Shield className="h-3 w-3" /> Blockchain-Powered Transparency
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            Transparansi Penyaluran <span className="text-bansos-accent">Bantuan Sosial</span>
          </h1>
          <p className="text-lg text-bansos-text-muted mb-8 max-w-lg">
            Setiap rupiah tercatat. Setiap transaksi terverifikasi. Sistem blockchain untuk akuntabilitas penyaluran bansos di Indonesia.
          </p>

          <form onSubmit={handleTrack} className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bansos-text-faint" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari NIK, QR Token, atau Tracking ID..."
                className="pl-10 bg-bansos-surface border-bansos-border text-bansos-text placeholder:text-bansos-text-faint h-11"
              />
            </div>
            <Button type="submit" className="bg-bansos-primary hover:bg-bansos-primary-hover text-white h-11 px-6">
              Lacak <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Eye, title: "Transparan", desc: "Semua penyaluran tercatat di blockchain publik yang bisa diakses siapa saja." },
            { icon: Shield, title: "Immutable", desc: "Data tidak bisa diubah setelah dicatat — mencegah manipulasi dan korupsi." },
            { icon: BarChart3, title: "Akuntabel", desc: "Statistik real-time dan audit trail lengkap untuk setiap transaksi bansos." },
          ].map((f) => (
            <Card key={f.title} className="bg-bansos-surface border-bansos-border hover:border-bansos-accent/50 transition-colors">
              <CardContent className="p-6">
                <f.icon className="h-8 w-8 text-bansos-accent mb-3" />
                <h3 className="font-semibold text-bansos-text mb-1">{f.title}</h3>
                <p className="text-sm text-bansos-text-muted">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-bansos-border py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-4">
          {[
            { to: "/bansos/track", title: "Tracking Bantuan", sub: "Lacak status penyaluran" },
            { to: "/bansos/blockchain", title: "Blockchain Explorer", sub: "Lihat rantai transaksi" },
            { to: "/bansos/stats", title: "Statistik Publik", sub: "Dashboard data penyaluran" },
          ].map((l) => (
            <Link key={l.to} to={l.to} className="flex items-center justify-between p-4 rounded-lg bg-bansos-surface border border-bansos-border hover:border-bansos-primary transition-colors group">
              <div>
                <div className="font-semibold text-sm text-bansos-text">{l.title}</div>
                <div className="text-xs text-bansos-text-muted">{l.sub}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-bansos-text-faint group-hover:text-bansos-text transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-bansos-border py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-bansos-text-faint">
          BansosChain — Sistem Blockchain untuk Transparansi Bansos Indonesia
        </div>
      </footer>
    </div>
  );
}
