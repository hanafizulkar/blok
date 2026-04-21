import { useState } from "react";
import { Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function BansosLogin() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>("penerima");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login gagal", description: error.message, variant: "destructive" });
      return;
    }
    navigate("/bansos/dashboard");
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const fullName = form.get("full_name") as string;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
    });

    if (error) {
      setLoading(false);
      toast({ title: "Registrasi gagal", description: error.message, variant: "destructive" });
      return;
    }

    // Assign bansos role
    if (data.user) {
      await supabase.from("bansos_user_roles").insert({ user_id: data.user.id, role: role as any });
    }

    setLoading(false);
    toast({ title: "Berhasil", description: "Silakan cek email untuk verifikasi akun." });
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/bansos" className="flex items-center gap-2 justify-center mb-8">
          <Shield className="h-7 w-7 text-[#c9a84c]" />
          <span className="font-bold text-xl text-white tracking-tight">BansosChain</span>
        </Link>

        <Card className="bg-[#0f1b3d]/80 border-white/10">
          <Tabs defaultValue="login">
            <CardHeader className="pb-2">
              <TabsList className="w-full bg-white/5">
                <TabsTrigger value="login" className="flex-1 text-sm data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">Login</TabsTrigger>
                <TabsTrigger value="register" className="flex-1 text-sm data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">Daftar</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label className="text-white/70 text-xs">Email</Label>
                    <Input name="email" type="email" required className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-white/70 text-xs">Password</Label>
                    <Input name="password" type="password" required className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-[#c9a84c] text-[#0a1628] hover:bg-[#d4b85c] font-semibold">
                    {loading ? "Loading..." : "Masuk"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label className="text-white/70 text-xs">Nama Lengkap</Label>
                    <Input name="full_name" required className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-white/70 text-xs">Email</Label>
                    <Input name="email" type="email" required className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-white/70 text-xs">Password</Label>
                    <Input name="password" type="password" required minLength={6} className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-white/70 text-xs">Peran</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin_pemerintah">Admin Pemerintah</SelectItem>
                        <SelectItem value="petugas_lapangan">Petugas Lapangan</SelectItem>
                        <SelectItem value="penerima">Penerima Bansos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-[#c9a84c] text-[#0a1628] hover:bg-[#d4b85c] font-semibold">
                    {loading ? "Loading..." : "Daftar"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
