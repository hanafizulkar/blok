import { useState } from "react";
import bansosLogo from "@/assets/bansoschain-icon.png";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BansosThemeToggle } from "@/components/bansos/BansosThemeToggle";

export default function BansosLogin() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>("penerima");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.get("email") as string,
      password: form.get("password") as string,
    });
    setLoading(false);
    if (error) return toast({ title: "Login gagal", description: error.message, variant: "destructive" });
    navigate("/bansos/dashboard");
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { data, error } = await supabase.auth.signUp({
      email: form.get("email") as string,
      password: form.get("password") as string,
      options: { data: { full_name: form.get("full_name") as string }, emailRedirectTo: window.location.origin },
    });
    if (error) {
      setLoading(false);
      return toast({ title: "Registrasi gagal", description: error.message, variant: "destructive" });
    }
    if (data.user) {
      await supabase.from("bansos_user_roles").insert({ user_id: data.user.id, role: role as any });
    }
    setLoading(false);
    toast({ title: "Berhasil", description: "Silakan cek email untuk verifikasi akun." });
  };

  return (
    <div className="min-h-screen bg-bansos-bg flex items-center justify-center px-4 relative">
      <div className="absolute top-4 right-4">
        <BansosThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Link to="/bansos" className="flex items-center gap-2 justify-center mb-8">
          <img src={bansosLogo} alt="BansosChain logo" width={32} height={32} className="h-8 w-8" />
          <span className="font-bold text-xl text-bansos-text tracking-tight">BansosChain</span>
        </Link>

        <Card className="bg-bansos-surface border-bansos-border">
          <Tabs defaultValue="login">
            <CardHeader className="pb-2">
              <TabsList className="w-full bg-bansos-bg">
                <TabsTrigger value="login" className="flex-1 text-sm data-[state=active]:bg-bansos-primary data-[state=active]:text-white">Login</TabsTrigger>
                <TabsTrigger value="register" className="flex-1 text-sm data-[state=active]:bg-bansos-primary data-[state=active]:text-white">Daftar</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label className="text-bansos-text-muted text-xs">Email</Label>
                    <Input name="email" type="email" required className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" />
                  </div>
                  <div>
                    <Label className="text-bansos-text-muted text-xs">Password</Label>
                    <Input name="password" type="password" required className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-bansos-accent text-bansos-on-accent hover:bg-bansos-accent-hover font-semibold">
                    {loading ? "Loading..." : "Masuk"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label className="text-bansos-text-muted text-xs">Nama Lengkap</Label>
                    <Input name="full_name" required className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" />
                  </div>
                  <div>
                    <Label className="text-bansos-text-muted text-xs">Email</Label>
                    <Input name="email" type="email" required className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" />
                  </div>
                  <div>
                    <Label className="text-bansos-text-muted text-xs">Password</Label>
                    <Input name="password" type="password" required minLength={6} className="bg-bansos-bg border-bansos-border text-bansos-text mt-1" />
                  </div>
                  <div>
                    <Label className="text-bansos-text-muted text-xs">Peran</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="bg-bansos-bg border-bansos-border text-bansos-text mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin_pemerintah">Admin Pemerintah</SelectItem>
                        <SelectItem value="petugas_lapangan">Petugas Lapangan</SelectItem>
                        <SelectItem value="penerima">Penerima Bansos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-bansos-accent text-bansos-on-accent hover:bg-bansos-accent-hover font-semibold">
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
