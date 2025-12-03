import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useSupplierStats } from "@/hooks/use-supplier-stats";

interface SupplierStatsProps {
  supplierId: string;
}

export const SupplierStats = ({ supplierId }: SupplierStatsProps) => {
  const { data: stats, isLoading } = useSupplierStats(supplierId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Chiffre d'affaires",
      icon: DollarSign,
      stats: [
        { label: "Aujourd'hui", value: `${stats.revenue.today} CFA`, color: "text-blue-600" },
        { label: "Ce mois", value: `${stats.revenue.month} CFA`, color: "text-green-600" },
        { label: "Total", value: `${stats.revenue.total} CFA`, color: "text-purple-600" },
      ],
    },
    {
      title: "Commandes",
      icon: ShoppingCart,
      stats: [
        { label: "Aujourd'hui", value: stats.orders.today, color: "text-blue-600" },
        { label: "Ce mois", value: stats.orders.month, color: "text-green-600" },
        { label: "Total", value: stats.orders.total, color: "text-purple-600" },
      ],
    },
    {
      title: "Produits",
      icon: Package,
      stats: [
        { label: "Actifs", value: stats.products.active, color: "text-green-600" },
        { label: "Stock faible", value: stats.products.lowStock, color: "text-orange-600" },
        { label: "Total", value: stats.products.total, color: "text-blue-600" },
      ],
    },
    {
      title: "Articles vendus",
      icon: TrendingUp,
      stats: [
        { label: "Total", value: stats.itemsSold, color: "text-purple-600" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="shadow-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {card.stats.map((stat, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{stat.label}:</span>
                      <span className={`text-sm font-semibold ${stat.color}`}>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statut des commandes */}
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            État des commandes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold text-yellow-600">{stats.orders.pending}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </div>
            <div className="text-center p-3 bg-blue-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{stats.orders.confirmed}</p>
              <p className="text-xs text-muted-foreground">Confirmées</p>
            </div>
            <div className="text-center p-3 bg-purple-500/10 rounded-lg">
              <Package className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{stats.orders.preparing}</p>
              <p className="text-xs text-muted-foreground">En préparation</p>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{stats.orders.ready}</p>
              <p className="text-xs text-muted-foreground">Prêtes</p>
            </div>
            <div className="text-center p-3 bg-green-600/10 rounded-lg">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-700" />
              <p className="text-2xl font-bold text-green-700">{stats.orders.completed}</p>
              <p className="text-xs text-muted-foreground">Complétées</p>
            </div>
            <div className="text-center p-3 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold text-red-600">{stats.orders.cancelled}</p>
              <p className="text-xs text-muted-foreground">Annulées</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graphique des ventes (7 derniers jours) */}
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ventes des 7 derniers jours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.salesByDay.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-sm font-medium w-20">{day.date}</span>
                <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden relative">
                  <div
                    className="bg-gradient-primary h-full flex items-center justify-end pr-3 text-xs font-semibold text-white"
                    style={{
                      width: `${Math.max((day.revenue / Math.max(...stats.salesByDay.map(d => d.revenue))) * 100, 5)}%`,
                    }}
                  >
                    {day.revenue > 0 && `${day.revenue} CFA`}
                  </div>
                </div>
                <Badge variant="outline" className="w-16 justify-center">
                  {day.orders} cmd
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Produits les plus vendus */}
      {stats.topProducts.length > 0 && (
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5" />
              Top 5 produits vendus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className="w-8 h-8 rounded-full flex items-center justify-center">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {product.quantity} vendus
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
