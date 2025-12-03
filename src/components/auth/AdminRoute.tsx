import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-admin";
import { Shield, AlertCircle } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  useEffect(() => {
    // Si pas chargé, attendre
    if (authLoading || adminLoading) return;

    // Si pas d'utilisateur, rediriger vers login
    if (!user) {
      navigate("/login");
      return;
    }

    // Si pas admin, rediriger vers home
    if (!isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  // Afficher loading pendant la vérification
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Vérification des permissions administrateur...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur ou pas admin, ne rien afficher (redirection en cours)
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
          <p className="text-muted-foreground">Vous n'avez pas les permissions nécessaires.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
