import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Shield, LayoutDashboard, Users, Package, BarChart3, Settings, LogOut, Menu, ChevronRight, Blocks } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useBansosRole } from "@/hooks/use-bansos";
import { supabase } from "@/integrations/supabase/client";

const adminNav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/bansos/dashboard" },
  { icon: Users, label: "Penerima", path: "/bansos/recipients" },
  { icon: Package, label: "Distribusi", path: "/bansos/distributions" },
  { icon: Blocks, label: "Blockchain", path: "/bansos/blockchain" },
  { icon: BarChart3, label: "Statistik", path: "/bansos/stats" },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  return (
    <>
      {adminNav.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
              active ? "bg-[#1e3a5f] text-white" : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

export default function BansosLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/bansos");
  };

  return (
    <div className="flex min-h-screen bg-[#0a1628]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-white/10 bg-[#0a1628]">
        <Link to="/bansos" className="flex items-center gap-2 h-14 px-4 border-b border-white/10">
          <Shield className="h-5 w-5 text-[#c9a84c]" />
          <span className="font-bold text-white tracking-tight">BansosChain</span>
        </Link>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          <NavItems />
        </nav>
        <div className="border-t border-white/10 p-2">
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-white/40 hover:text-white/70 transition-colors w-full">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 md:hidden flex items-center justify-between h-12 border-b border-white/10 bg-[#0a1628] px-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-56 bg-[#0a1628] border-white/10">
              <div className="flex items-center gap-2 h-14 px-4 border-b border-white/10">
                <Shield className="h-5 w-5 text-[#c9a84c]" />
                <span className="font-bold text-white">BansosChain</span>
              </div>
              <nav className="py-3 px-2 space-y-0.5">
                <NavItems onNavigate={() => setOpen(false)} />
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-[#c9a84c]" />
            <span className="font-bold text-white text-sm">BansosChain</span>
          </div>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
