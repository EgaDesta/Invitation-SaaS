import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, PlusCircle, FileText, CreditCard, LogOut,
  Users, BarChart3, Layers, DollarSign, Menu, X, Moon, Sun, User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const userNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dashboard/create", icon: PlusCircle, label: "Buat Undangan" },
  { to: "/dashboard/invitations", icon: FileText, label: "Undangan Saya" },
  { to: "/dashboard/subscription", icon: CreditCard, label: "Langganan" },
  { to: "/dashboard/profile", icon: User, label: "Profil" },
];

const adminNav = [
  { to: "/admin", icon: BarChart3, label: "Statistik" },
  { to: "/admin/users", icon: Users, label: "Kelola User" },
  { to: "/admin/templates", icon: Layers, label: "Template" },
  { to: "/admin/plans", icon: CreditCard, label: "Paket" },
  { to: "/admin/transactions", icon: DollarSign, label: "Transaksi" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [profileData, setProfileData] = useState<{ full_name: string; avatar_url: string }>({ full_name: "", avatar_url: "" });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const nav = isAdmin ? adminNav : userNav;

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, avatar_url").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfileData({ full_name: data.full_name || "", avatar_url: data.avatar_url || "" });
    });
  }, [user]);

  const toggleDark = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link to="/" className="font-display text-xl font-bold text-foreground">
            Undangan<span className="text-accent">ku</span>
          </Link>
          <button className="lg:hidden text-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.to
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-border">
              <p className="px-3 text-xs text-muted-foreground mb-2">USER</p>
              {userNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === item.to
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={toggleDark}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 w-full"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {dark ? "Mode Terang" : "Mode Gelap"}
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 w-full"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b flex items-center px-4 lg:px-6 bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <button className="lg:hidden mr-4" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                {profileData.avatar_url ? (
                  <img src={profileData.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <span className="text-sm text-muted-foreground hidden sm:block max-w-[120px] truncate">
                {profileData.full_name || user?.email}
              </span>
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-xl shadow-xl z-50 py-1">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-medium text-sm truncate">{profileData.full_name || "Pengguna"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <User className="w-4 h-4" /> Profil
                  </Link>
                  <button
                    onClick={() => { setDropdownOpen(false); handleSignOut(); }}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 w-full transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </div>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
