import { Users, Package, Blocks, DollarSign, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBansosStats, useBansosDistributions, useBansosChainVerify } from "@/hooks/use-bansos";
import { Badge } from "@/components/ui/badge";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--bansos-accent))", "hsl(var(--bansos-primary))", "hsl(var(--bansos-text-muted))", "hsl(var(--bansos-accent-hover))"];

export default function BansosDashboard() {
  const { data: stats } = useBansosStats();
  const { data: distributions } = useBansosDistributions();
  const { data: chainStatus } = useBansosChainVerify();

  const statCards = [
    { icon: Users, label: "Total Penerima", value: stats?.total_recipients ?? 0, sub: `${stats?.verified_recipients ?? 0} terverifikasi` },
    { icon: Package, label: "Total Distribusi", value: stats?.total_distributions ?? 0, sub: `${stats?.active_programs ?? 0} program aktif` },
    { icon: DollarSign, label: "Total Tersalurkan", value: `Rp ${Number(stats?.total_amount ?? 0).toLocaleString("id-ID")}`, sub: "" },
    { icon: Blocks, label: "Total Blok", value: stats?.total_blocks ?? 0, sub: chainStatus?.valid ? "✓ Chain valid" : "⚠ Chain issue" },
  ];

  const statusCounts: Record<string, number> = {};
  distributions?.forEach((d: any) => { statusCounts[d.status] = (statusCounts[d.status] || 0) + 1; });
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const recent = (distributions ?? []).slice(0, 8);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-bansos-text">Dashboard</h1>
        <p className="text-sm text-bansos-text-muted">Ringkasan sistem penyaluran bantuan sosial</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <Card key={s.label} className="bg-bansos-surface border-bansos-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="h-4 w-4 text-bansos-accent" />
                <span className="text-xs text-bansos-text-muted">{s.label}</span>
              </div>
              <div className="text-xl font-bold text-bansos-text">{s.value}</div>
              {s.sub && <div className="text-xs text-bansos-text-faint mt-1">{s.sub}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-bansos-surface border-bansos-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-bansos-text-muted">Status Distribusi</CardTitle></CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--bansos-surface))", border: "1px solid hsl(var(--bansos-border))", color: "hsl(var(--bansos-text))", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-[200px] flex items-center justify-center text-bansos-text-faint text-sm">Belum ada data</div>}
          </CardContent>
        </Card>

        <Card className="bg-bansos-surface border-bansos-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-bansos-text-muted">Status Blockchain</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`h-5 w-5 ${chainStatus?.valid ? "text-green-500" : "text-red-500"}`} />
              <span className="text-bansos-text font-medium text-sm">{chainStatus?.valid ? "Integritas Terjaga" : "Ada Masalah"}</span>
            </div>
            <div className="text-xs text-bansos-text-muted space-y-1">
              <p>Total blok: {chainStatus?.total_blocks ?? 0}</p>
            </div>
            <div className="bg-bansos-bg rounded p-3 border border-bansos-border">
              <div className="text-[10px] font-mono text-bansos-text-faint">Verifikasi chain mengecek bahwa setiap blok terhubung dengan hash blok sebelumnya secara berurutan.</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-bansos-surface border-bansos-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-bansos-text-muted">Distribusi Terbaru</CardTitle></CardHeader>
        <CardContent>
          {recent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-bansos-text-faint text-xs border-b border-bansos-border">
                    <th className="text-left py-2 pr-4">Tracking</th>
                    <th className="text-left py-2 pr-4">Penerima</th>
                    <th className="text-left py-2 pr-4">Program</th>
                    <th className="text-right py-2 pr-4">Nominal</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((d: any) => (
                    <tr key={d.id} className="border-b border-bansos-border text-bansos-text-muted">
                      <td className="py-2 pr-4 font-mono text-xs text-bansos-accent">{d.tracking_id}</td>
                      <td className="py-2 pr-4">{d.bansos_recipients?.full_name ?? "-"}</td>
                      <td className="py-2 pr-4">{d.bansos_programs?.name ?? "-"}</td>
                      <td className="py-2 pr-4 text-right">Rp {Number(d.amount).toLocaleString("id-ID")}</td>
                      <td className="py-2"><Badge variant="outline" className="text-xs border-bansos-border text-bansos-text-muted">{d.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="py-8 text-center text-bansos-text-faint text-sm">Belum ada distribusi</div>}
        </CardContent>
      </Card>
    </div>
  );
}
