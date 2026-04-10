import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { LogOut, Users, LayoutDashboard } from "lucide-react";

const CrmLayout = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/crm/login");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header Privado */}
      <header className="bg-card border-b border-border h-16 sticky top-0 z-10">
        <div className="container h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/crm" className="text-xl font-bold tracking-tight text-primary">
              CRM Admin
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/crm" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link to="/crm/leads" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
                <Users className="w-4 h-4" />
                Leads
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 crm-container">
        <Outlet />
      </main>
    </div>
  );
};

export default CrmLayout;
