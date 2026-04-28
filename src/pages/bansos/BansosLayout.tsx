import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, Users, Package, BarChart3, LogOut, Menu, Blocks, Wallet, Landmark, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { BansosThemeToggle } from "@/components/bansos/BansosThemeToggle";

const adminNav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/bansos/dashboard" },
  { icon: Users, label: "Penerima", path: "/bansos/recipients" },
  { icon: Package, label: "Distribusi", path: "/bansos/distributions" },
  { icon: Landmark, label: "Treasury", path: "/bansos/treasury" },
  { icon: Wallet, label: "Dompet Saya", path: "/bansos/wallet" },
  { icon: Store, label: "Merchants", path: "/bansos/merchants" },
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
              active ? "bg-bansos-primary text-white" : "text-bansos-text-muted hover:text-bansos-text hover:bg-bansos-border/40"
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
    <div className="flex min-h-screen bg-bansos-bg">
      <aside className="hidden md:flex flex-col w-56 border-r border-bansos-border bg-bansos-surface">
        <Link to="/bansos" className="flex items-center gap-2 h-14 px-4 border-b border-bansos-border">
          <Shield className="h-5 w-5 text-bansos-accent" />
          <span className="font-bold text-bansos-text tracking-tight">BansosChain</span>
        </Link>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          <NavItems />
        </nav>
        <div className="border-t border-bansos-border p-2 flex items-center justify-between">
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-bansos-text-muted hover:text-bansos-text transition-colors">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
          <BansosThemeToggle />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 md:hidden flex items-center justify-between h-12 border-b border-bansos-border bg-bansos-surface px-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-bansos-text">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-56 bg-bansos-surface border-bansos-border">
              <div className="flex items-center gap-2 h-14 px-4 border-b border-bansos-border">
                <Shield className="h-5 w-5 text-bansos-accent" />
                <span className="font-bold text-bansos-text">BansosChain</span>
              </div>
              <nav className="py-3 px-2 space-y-0.5">
                <NavItems onNavigate={() => setOpen(false)} />
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-bansos-accent" />
            <span className="font-bold text-bansos-text text-sm">BansosChain</span>
          </div>
          <BansosThemeToggle />
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
