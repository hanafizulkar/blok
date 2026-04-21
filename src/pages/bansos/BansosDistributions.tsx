import { useState } from "react";
import { Plus, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBansosDistributions, useBansosRecipients, useBansosPrograms } from "@/hooks/use-bansos";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function BansosDistributions() {
  const { data: distributions, isLoading } = useBansosDistributions();
  const { data: recipients } = useBansosRecipients();
  const { data: programs } = useBansosPrograms();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [programId, setProgramId] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const selectedProgram = programs?.find((p: any) => p.id === programId);

  const handleDistribute = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("bansos_distributions").insert({
      recipient_id: recipientId,
      program_id: programId,
      officer_id: user?.id,
      amount: Number(selectedProgram?.amount_per_distribution ?? form.get("amount")),
      status: "distributed" as any,
      location: form.get("location") as string,
      distributed_at: new Date().toISOString(),
    });

    setLoading(false);
    if (error) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Berhasil", description: "Distribusi tercatat di blockchain." });
    queryClient.invalidateQueries({ queryKey: ["bansos-distributions"] });
    queryClient.invalidateQueries({ queryKey: ["bansos-blockchain"] });
    queryClient.invalidateQueries({ queryKey: ["bansos-stats"] });
    setDialogOpen(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Distribusi Bantuan</h1>
          <p className="text-sm text-white/50">Setiap distribusi otomatis tercatat di blockchain</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#c9a84c] text-[#0a1628] hover:bg-[#d4b85c]">
              <Plus className="h-4 w-4 mr-1" /> Salurkan
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f1b3d] border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Salurkan Bantuan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleDistribute} className="space-y-3">
              <div>
                <Label className="text-xs text-white/60">Penerima</Label>
                <Select value={recipientId} onValueChange={setRecipientId}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue placeholder="Pilih penerima" />
                  </SelectTrigger>
                  <SelectContent>
                    {(recipients ?? []).filter((r: any) => r.verification_status === "verified").map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>{r.full_name} ({r.nik})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-white/60">Program</Label>
                <Select value={programId} onValueChange={setProgramId}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue placeholder="Pilih program" />
                  </SelectTrigger>
                  <SelectContent>
                    {(programs ?? []).filter((p: any) => p.is_active).map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} — Rp {Number(p.amount_per_distribution).toLocaleString("id-ID")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-white/60">Nominal (Rp)</Label>
                <Input name="amount" type="number" defaultValue={selectedProgram?.amount_per_distribution ?? ""} className="bg-white/5 border-white/10 text-white mt-1" />
              </div>
              <div>
                <Label className="text-xs text-white/60">Lokasi Penyaluran</Label>
                <Input name="location" className="bg-white/5 border-white/10 text-white mt-1" placeholder="e.g. Kantor Kelurahan X" />
              </div>
              <Button type="submit" disabled={loading || !recipientId || !programId} className="w-full bg-[#c9a84c] text-[#0a1628] hover:bg-[#d4b85c]">
                {loading ? "Memproses..." : "Salurkan & Catat ke Blockchain"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white/[0.03] border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs border-b border-white/10">
                  <th className="text-left py-3 px-4">Tracking ID</th>
                  <th className="text-left py-3 px-4">Penerima</th>
                  <th className="text-left py-3 px-4 hidden md:table-cell">Program</th>
                  <th className="text-right py-3 px-4">Nominal</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4 hidden lg:table-cell">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {(distributions ?? []).map((d: any) => (
                  <tr key={d.id} className="border-b border-white/5 text-white/70 hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4 font-mono text-xs text-[#c9a84c]">{d.tracking_id}</td>
                    <td className="py-2.5 px-4">{d.bansos_recipients?.full_name ?? "-"}</td>
                    <td className="py-2.5 px-4 hidden md:table-cell">{d.bansos_programs?.name ?? "-"}</td>
                    <td className="py-2.5 px-4 text-right">Rp {Number(d.amount).toLocaleString("id-ID")}</td>
                    <td className="py-2.5 px-4">
                      <Badge variant="outline" className="text-xs border-white/20 text-white/60">{d.status}</Badge>
                    </td>
                    <td className="py-2.5 px-4 hidden lg:table-cell text-xs text-white/40">
                      {d.distributed_at ? new Date(d.distributed_at).toLocaleDateString("id-ID") : "-"}
                    </td>
                  </tr>
                ))}
                {(distributions ?? []).length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-white/30 text-sm">{isLoading ? "Memuat..." : "Belum ada distribusi"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
