import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, Package, ShoppingCart, DollarSign, MousePointer2, Eye } from "lucide-react";
import { useAdminStats } from "@/hooks/use-admin";

export const AdminStats = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Cards statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <div className="flex flex-col gap-0.5 mt-1">
              <p className="text-xs text-muted-foreground">Clients: {stats.users.clients} | Fours: {stats.users.suppliers}</p>
              <p className="text-xs text-muted-foreground">Actifs: {stats.users.active} | Bannis: {stats.users.banned}</p>
            </div>
          </CardContent>
        </Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Store className="w-4 h-4" />Fournisseurs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.suppliers.total}</div><p className="text-xs text-muted-foreground">Vérifiés: {stats.suppliers.verified} | En attente: {stats.suppliers.pending}</p></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Package className="w-4 h-4" />Produits</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.products.total}</div><p className="text-xs text-muted-foreground">Actifs: {stats.products.active} | Inactifs: {stats.products.inactive}</p></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><ShoppingCart className="w-4 h-4" />Commandes</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.orders.total}</div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="w-4 h-4" />CA Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.orders.revenue} CFA</div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><MousePointer2 className="w-4 h-4" />Interactions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.interactions?.total || 0}</div><p className="text-xs text-muted-foreground">Clics, likes, etc.</p></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Eye className="w-4 h-4" />Visites</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.visits?.total || 0}</div><p className="text-xs text-muted-foreground">Pages vues</p></CardContent></Card>
      </div>
    </div>
  );
};
