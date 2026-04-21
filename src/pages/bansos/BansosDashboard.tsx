import { Users, Package, Blocks, DollarSign, ShieldCheck, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBansosStats, useBansosDistributions, useBansosChainVerify } from "@/hooks/use-bansos";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#c9a84c", "#1e3a5f", "#2d8a9e", "#5cbdb9", "#f5f0e0", "#e8c07a"];

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

  // Status distribution pie
  const statusCounts: Record<string, number> = {};
  distributions?.forEach((d: any) => {
    statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
  });
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Recent distributions
  const recent = (distributions ?? []).slice(0, 8);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-white/50">Ringkasan sistem penyaluran bantuan sosial</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <Card key={s.label} className="bg-white/[0.03] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="h-4 w-4 text-[#c9a84c]" />
                <span className="text-xs text-white/50">{s.label}</span>
              </div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              {s.sub && <div className="text-xs text-white/40 mt-1">{s.sub}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Pie chart */}
        <Card className="bg-white/[0.03] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/70">Status Distribusi</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f1b3d", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-white/30 text-sm">Belum ada data</div>
            )}
          </CardContent>
        </Card>

        {/* Chain status */}
        <Card className="bg-white/[0.03] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/70">Status Blockchain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`h-5 w-5 ${chainStatus?.valid ? "text-green-400" : "text-red-400"}`} />
              <span className="text-white font-medium text-sm">{chainStatus?.valid ? "Integritas Terjaga" : "Ada Masalah"}</span>
            </div>
            <div className="text-xs text-white/40 space-y-1">
              <p>Total blok: {chainStatus?.total_blocks ?? 0}</p>
              {!chainStatus?.valid && chainStatus?.first_invalid_index && (
                <p className="text-red-400">Blok tidak valid pada index: {chainStatus.first_invalid_index}</p>
              )}
            </div>
            <div className="bg-white/[0.03] rounded p-3 border border-white/10">
              <div className="text-[10px] font-mono text-white/30">Verifikasi chain mengecek bahwa setiap blok terhubung dengan hash blok sebelumnya secara berurutan.</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent distributions */}
      <Card className="bg-white/[0.03] border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white/70">Distribusi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/40 text-xs border-b border-white/10">
                    <th className="text-left py-2 pr-4">Tracking</th>
                    <th className="text-left py-2 pr-4">Penerima</th>
                    <th className="text-left py-2 pr-4">Program</th>
                    <th className="text-right py-2 pr-4">Nominal</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((d: any) => (
                    <tr key={d.id} className="border-b border-white/5 text-white/70">
                      <td className="py-2 pr-4 font-mono text-xs text-[#c9a84c]">{d.tracking_id}</td>
                      <td className="py-2 pr-4">{d.bansos_recipients?.full_name ?? "-"}</td>
                      <td className="py-2 pr-4">{d.bansos_programs?.name ?? "-"}</td>
                      <td className="py-2 pr-4 text-right">Rp {Number(d.amount).toLocaleString("id-ID")}</td>
                      <td className="py-2">
                        <Badge variant="outline" className="text-xs border-white/20 text-white/60">{d.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-white/30 text-sm">Belum ada distribusi</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
