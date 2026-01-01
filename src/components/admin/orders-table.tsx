import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Package, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface OrdersTableProps {
  orders: any[];
  isLoading: boolean;
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "En attente", variant: "secondary" },
  confirmed: { label: "Confirmée", variant: "default" },
  preparing: { label: "En préparation", variant: "outline" },
  ready: { label: "Prête", variant: "default" },
  completed: { label: "Complétée", variant: "default" },
  cancelled: { label: "Annulée", variant: "destructive" },
};

export const OrdersTable = ({ orders, isLoading }: OrdersTableProps) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredOrders = orders.filter((order) =>
    order.id?.toLowerCase().includes(search.toLowerCase()) ||
    order.suppliers?.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    order.status?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une commande..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="outline" className="px-4 py-2">
          {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Tableau */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Commande</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Aucune commande trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const itemsCount = order.order_items?.length || 0;
                const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium font-mono text-sm">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">ID: {order.id.slice(-8)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{order.suppliers?.business_name || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{itemsCount} article{itemsCount > 1 ? 's' : ''}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{order.total_amount} CFA</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.order_type === 'delivery' ? 'Livraison' : 'Click & Collect'}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/order/${order.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
