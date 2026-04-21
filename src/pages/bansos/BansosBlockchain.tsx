import { Blocks, Link as LinkIcon, ShieldCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBansosBlockchain, useBansosChainVerify } from "@/hooks/use-bansos";

export default function BansosBlockchain() {
  const { data: blocks, isLoading } = useBansosBlockchain();
  const { data: chainStatus } = useBansosChainVerify();

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Blockchain Explorer</h1>
          <p className="text-sm text-white/50">Rantai transaksi penyaluran bansos — immutable</p>
        </div>
        <div className="flex items-center gap-2">
          {chainStatus?.valid ? (
            <Badge className="bg-green-500/10 text-green-400 border-green-500/30 gap-1">
              <ShieldCheck className="h-3 w-3" /> Chain Valid
            </Badge>
          ) : (
            <Badge className="bg-red-500/10 text-red-400 border-red-500/30 gap-1">
              <AlertTriangle className="h-3 w-3" /> Chain Issue
            </Badge>
          )}
        </div>
      </div>

      {/* Block list */}
      <div className="space-y-3">
        {(blocks ?? []).map((block: any, i: number) => (
          <Card key={block.id} className="bg-white/[0.03] border-white/10 hover:border-[#1e3a5f]/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-[#1e3a5f] rounded p-1.5">
                    <Blocks className="h-4 w-4 text-[#c9a84c]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Block #{block.block_index}</div>
                    <div className="text-[10px] text-white/30">{new Date(block.created_at).toLocaleString("id-ID")}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] border-[#c9a84c]/30 text-[#c9a84c]">
                  {(block.data as any)?.status ?? "—"}
                </Badge>
              </div>

              {/* Transaction data */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                <div>
                  <div className="text-white/30">Tracking</div>
                  <div className="text-[#c9a84c] font-mono">{(block.data as any)?.tracking_id ?? "—"}</div>
                </div>
                <div>
                  <div className="text-white/30">Penerima</div>
                  <div className="text-white/70">{(block.data as any)?.recipient_name ?? "—"}</div>
                </div>
                <div>
                  <div className="text-white/30">Program</div>
                  <div className="text-white/70">{(block.data as any)?.program_name ?? "—"}</div>
                </div>
                <div>
                  <div className="text-white/30">Nominal</div>
                  <div className="text-white/70">Rp {Number((block.data as any)?.amount ?? 0).toLocaleString("id-ID")}</div>
                </div>
              </div>

              {/* Hashes */}
              <div className="bg-black/20 rounded p-2.5 space-y-1.5 border border-white/5">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-white/30 w-16 shrink-0">Hash:</span>
                  <code className="text-green-400/70 font-mono truncate">{block.hash}</code>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <LinkIcon className="h-3 w-3 text-white/20 shrink-0" />
                  <span className="text-white/30 w-12 shrink-0">Prev:</span>
                  <code className="text-white/30 font-mono truncate">{block.previous_hash}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(blocks ?? []).length === 0 && (
          <div className="py-16 text-center text-white/30">
            <Blocks className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{isLoading ? "Memuat blockchain..." : "Belum ada blok — salurkan bantuan untuk membuat blok pertama"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
