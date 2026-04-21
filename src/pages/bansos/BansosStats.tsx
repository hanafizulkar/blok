import { Link } from "react-router-dom";
import { Shield, Users, Package, DollarSign, Blocks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBansosStats, useBansosDistributions } from "@/hooks/use-bansos";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { BansosThemeToggle } from "@/components/bansos/BansosThemeToggle";

const COLORS = ["hsl(var(--bansos-accent))", "hsl(var(--bansos-primary))", "hsl(var(--bansos-text-muted))", "hsl(var(--bansos-accent-hover))", "hsl(var(--bansos-primary-hover))"];

export default function BansosStats() {
  const { data: stats } = useBansosStats();
  const { data: distributions } = useBansosDistributions();

  const statCards = [
    { icon: Users, label: "Total Penerima", value: stats?.total_recipients ?? 0 },
    { icon: Package, label: "Distribusi", value: stats?.total_distributions ?? 0 },
    { icon: DollarSign, label: "Total Tersalurkan", value: `Rp ${Number(stats?.total_amount ?? 0).toLocaleString("id-ID")}` },
    { icon: Blocks, label: "Blok Blockchain", value: stats?.total_blocks ?? 0 },
  ];

  const byProgram: Record<string, number> = {};
  (distributions ?? []).forEach((d: any) => {
    const name = d.bansos_programs?.name ?? "Unknown";
    byProgram[name] = (byProgram[name] || 0) + Number(d.amount);
  });
  const programData = Object.entries(byProgram).map(([name, value]) => ({ name, value }));

  const byStatus: Record<string, number> = {};
  (distributions ?? []).forEach((d: any) => { byStatus[d.status] = (byStatus[d.status] || 0) + 1; });
  const statusData = Object.entries(byStatus).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-bansos-bg">
      <header className="border-b border-bansos-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/bansos" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-bansos-accent" />
            <span className="font-bold text-bansos-text tracking-tight">BansosChain</span>
          </Link>
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-5 text-sm text-bansos-text-muted">
              <Link to="/bansos/track" className="hover:text-bansos-text transition-colors">Tracking</Link>
              <Link to="/bansos/blockchain" className="hover:text-bansos-text transition-colors">Blockchain</Link>
            </nav>
            <BansosThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-bansos-text">Statistik Penyaluran</h1>
          <p className="text-sm text-bansos-text-muted">Data publik — siapa saja bisa melihat</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((s) => (
            <Card key={s.label} className="bg-bansos-surface border-bansos-border">
              <CardContent className="p-4">
                <s.icon className="h-5 w-5 text-bansos-accent mb-2" />
                <div className="text-xl font-bold text-bansos-text">{s.value}</div>
                <div className="text-xs text-bansos-text-muted">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-bansos-surface border-bansos-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-bansos-text-muted">Dana per Program</CardTitle></CardHeader>
            <CardContent>
              {programData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={programData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bansos-border))" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(var(--bansos-text-muted))", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(var(--bansos-text-muted))", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--bansos-surface))", border: "1px solid hsl(var(--bansos-border))", color: "hsl(var(--bansos-text))", fontSize: 12 }} />
                    <Bar dataKey="value" fill="hsl(var(--bansos-accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-[220px] flex items-center justify-center text-bansos-text-faint text-sm">Belum ada data</div>}
            </CardContent>
          </Card>

          <Card className="bg-bansos-surface border-bansos-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-bansos-text-muted">Status Distribusi</CardTitle></CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} label>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--bansos-surface))", border: "1px solid hsl(var(--bansos-border))", color: "hsl(var(--bansos-text))", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-[220px] flex items-center justify-center text-bansos-text-faint text-sm">Belum ada data</div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
