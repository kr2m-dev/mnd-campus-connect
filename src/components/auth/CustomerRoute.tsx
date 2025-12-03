import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentSupplier } from "@/hooks/use-supplier";
import { Store, AlertCircle } from "lucide-react";

interface CustomerRouteProps {
  children: React.ReactNode;
}

export const CustomerRoute = ({ children }: CustomerRouteProps) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: supplier, isLoading: supplierLoading } = useCurrentSupplier();

  useEffect(() => {
    // Si pas chargé, attendre
    if (authLoading || supplierLoading) return;

    // Si c'est un fournisseur, rediriger vers son espace
    if (supplier) {
      navigate("/supplier");
    }
  }, [supplier, authLoading, supplierLoading, navigate]);

  // Afficher loading pendant la vérification
  if (authLoading || supplierLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si fournisseur, afficher message et rediriger
  if (supplier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Accès réservé aux clients</h2>
          <p className="text-muted-foreground mb-4">
            En tant que fournisseur, vous pouvez gérer vos produits dans votre espace.
          </p>
          <p className="text-sm text-muted-foreground">Redirection vers votre espace fournisseur...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
