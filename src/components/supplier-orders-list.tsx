import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Clock, CheckCircle, XCircle, AlertCircle, User, MapPin, Phone } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useUpdateOrderStatus } from "@/hooks/use-orders";

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
}

interface SupplierOrdersListProps {
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

const orderStatuses = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "preparing", label: "En préparation" },
  { value: "ready", label: "Prête" },
  { value: "completed", label: "Complétée" },
  { value: "cancelled", label: "Annulée" },
];

export const SupplierOrdersList = ({ orders, loading }: SupplierOrdersListProps) => {
  const updateOrderStatus = useUpdateOrderStatus();

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatus.mutate({ orderId, status: newStatus });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card className="shadow-card border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune commande reçue</h3>
          <p className="text-muted-foreground text-center">
            Vous n'avez pas encore reçu de commande pour vos produits.
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
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
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
                <div className="flex items-center gap-3">
                  <Badge className={`${statusInfo.color} border`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>
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

              {/* Customer Details */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Informations client
                </h4>
                {order.delivery_address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>{order.delivery_address}</span>
                  </div>
                )}
                {order.delivery_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{order.delivery_phone}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Status Management & Total */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-sm font-medium mb-2 block">
                    Changer le statut
                  </Label>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Total</p>
                  <p className="text-2xl font-bold text-primary">{order.total_amount} CFA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  );
}
