import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_address: string | null;
  delivery_phone: string | null;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    subtotal: number;
    products: {
      name: string;
      price: number;
      image_url: string | null;
    } | null;
  }>;
  suppliers: {
    business_name: string;
    contact_phone: string | null;
    contact_whatsapp: string | null;
  } | null;
}

interface OrdersListProps {
  orders: Order[];
  loading: boolean;
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case "pending":
      return {
        label: "En attente",
        icon: Clock,
        color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      };
    case "confirmed":
      return {
        label: "Confirmée",
        icon: CheckCircle,
        color: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      };
    case "preparing":
      return {
        label: "En préparation",
        icon: Package,
        color: "bg-purple-500/10 text-purple-700 border-purple-500/20",
      };
    case "ready":
      return {
        label: "Prête",
        icon: AlertCircle,
        color: "bg-green-500/10 text-green-700 border-green-500/20",
      };
    case "completed":
      return {
        label: "Complétée",
        icon: CheckCircle,
        color: "bg-green-600/10 text-green-800 border-green-600/20",
      };
    case "cancelled":
      return {
        label: "Annulée",
        icon: XCircle,
        color: "bg-red-500/10 text-red-700 border-red-500/20",
      };
    default:
      return {
        label: status,
        icon: Clock,
        color: "bg-gray-500/10 text-gray-700 border-gray-500/20",
      };
  }
};

export const OrdersList = ({ orders, loading }: OrdersListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card className="shadow-card border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
          <p className="text-muted-foreground text-center">
            Vous n'avez pas encore passé de commande.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const statusInfo = getStatusInfo(order.status);
        const StatusIcon = statusInfo.icon;

        return (
          <Card key={order.id} className="shadow-card border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Commande #{order.id.slice(0, 8)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(order.created_at), "d MMMM yyyy 'à' HH:mm", {
                      locale: fr,
                    })}
                  </p>
                </div>
                <Badge className={`${statusInfo.color} border`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.products?.image_url && (
                      <img
                        src={item.products.image_url}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantité: {item.quantity} × {item.product_price} CFA
                      </p>
                    </div>
                    <p className="font-semibold">{item.subtotal} CFA</p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Order Details */}
              <div className="space-y-2 text-sm">
                {order.suppliers && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fournisseur:</span>
                    <span className="font-medium">{order.suppliers.business_name}</span>
                  </div>
                )}
                {order.delivery_address && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Adresse:</span>
                    <span className="font-medium text-right max-w-[60%]">
                      {order.delivery_address}
                    </span>
                  </div>
                )}
                {order.delivery_phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Téléphone:</span>
                    <span className="font-medium">{order.delivery_phone}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">{order.total_amount} CFA</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
