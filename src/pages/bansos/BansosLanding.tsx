import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Search, Eye, BarChart3, ChevronRight, ArrowRight, Wallet, ArrowUpRight, ArrowDownLeft, QrCode, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BansosThemeToggle } from "@/components/bansos/BansosThemeToggle";
import bansosLogo from "@/assets/bansoschain-icon.png";

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
            <img src={bansosLogo} alt="BansosChain logo" width={28} height={28} className="h-7 w-7" />
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

      {/* E-Wallet Showcase */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-bansos-primary/10 border border-bansos-primary/30 rounded-full px-3 py-1 text-xs text-bansos-primary mb-4">
              <Wallet className="h-3 w-3" /> Dompet Digital Bansos
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Dompet bansos di <span className="text-bansos-accent">genggaman</span> Anda
            </h2>
            <p className="text-bansos-text-muted mb-6">
              Terima penyaluran bantuan langsung ke dompet digital. Belanja di merchant terverifikasi, top-up treasury, dan pantau setiap transaksi secara transparan di blockchain.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link to="/bansos/wallet">
                <Button className="bg-bansos-accent text-bansos-on-accent hover:bg-bansos-accent-hover font-semibold">
                  Buka Dompet Saya <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link to="/bansos/merchants">
                <Button variant="outline" className="border-bansos-border text-bansos-text hover:bg-bansos-surface">
                  Lihat Merchant
                </Button>
              </Link>
            </div>
          </div>

          {/* Mock Wallet Card */}
          <div className="relative">
            <Card className="bg-gradient-to-br from-bansos-primary to-bansos-accent border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-6 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <img src={bansosLogo} alt="" width={28} height={28} className="h-7 w-7 brightness-0 invert" />
                    <span className="font-semibold text-sm">BansosChain Wallet</span>
                  </div>
                  <Wallet className="h-5 w-5 opacity-80" />
                </div>
                <div className="mb-6">
                  <div className="text-xs opacity-80 mb-1">Saldo Tersedia</div>
                  <div className="text-3xl font-bold tracking-tight">Rp 750.000</div>
                  <div className="text-xs opacity-70 mt-1">PKH · Kartu Sembako</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Plus, label: "Top-up" },
                    { icon: ArrowUpRight, label: "Kirim" },
                    { icon: QrCode, label: "Scan" },
                  ].map((a) => (
                    <div key={a.label} className="flex flex-col items-center gap-1.5 bg-white/15 backdrop-blur rounded-lg py-3">
                      <a.icon className="h-4 w-4" />
                      <span className="text-[11px] font-medium">{a.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-white/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                      <span>Penyaluran PKH</span>
                    </div>
                    <span className="font-semibold">+Rp 500.000</span>
                  </div>
                  <div className="flex items-center justify-between text-xs opacity-90">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      <span>Toko Berkah Sembako</span>
                    </div>
                    <span>-Rp 125.000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="absolute -inset-4 bg-bansos-accent/20 blur-3xl -z-10 rounded-full" />
          </div>
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
