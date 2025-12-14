import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  ChefHat,
  MapPin,
  Phone,
  Calendar,
  MessageCircle,
  User,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useSupplierOrders, useUpdateOrderStatus, useSupplierOrderStats } from "@/hooks/use-orders";
import { OrderStatus } from "@/lib/database-types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

const statusConfig: Record<OrderStatus, { label: string; icon: any; color: string; bgColor: string }> = {
  pending: {
    label: "En attente",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200"
  },
  confirmed: {
    label: "Confirmée",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200"
  },
  preparing: {
    label: "En préparation",
    icon: ChefHat,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200"
  },
  ready: {
    label: "Prête",
    icon: Package,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200"
  },
  completed: {
    label: "Terminée",
    icon: CheckCircle,
    color: "text-green-700",
    bgColor: "bg-green-100 border-green-300"
  },
  cancelled: {
    label: "Annulée",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200"
  }
};

const nextStatusActions: Record<OrderStatus, { nextStatus?: OrderStatus; label?: string } | null> = {
  pending: { nextStatus: 'confirmed', label: 'Accepter la commande' },
  confirmed: { nextStatus: 'preparing', label: 'Commencer la préparation' },
  preparing: { nextStatus: 'ready', label: 'Marquer comme prête' },
  ready: { nextStatus: 'completed', label: 'Marquer comme livrée' },
  completed: null,
  cancelled: null
};

export default function SupplierOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useSupplierOrders();
  const { data: stats } = useSupplierOrderStats();
  const updateOrderStatus = useUpdateOrderStatus();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};

  // Redirect if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: newStatus });
    } catch (error) {
      logger.error("Error updating order status:", error);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (window.confirm("Voulez-vous vraiment refuser cette commande ?")) {
      await handleStatusChange(orderId, 'cancelled');
    }
  };

  const filteredOrders = selectedStatus === "all"
    ? orders
    : orders.filter(order => order.status === selectedStatus);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={handleUniversityChange} />
        <div className="flex items-center justify-center pt-20 h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des commandes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onUniversityChange={handleUniversityChange} />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
              <p className="text-muted-foreground">
                Gérez et suivez vos commandes clients
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.pending || 0}
              </div>
              <div className="text-xs text-muted-foreground">En attente</div>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats?.confirmed || 0}
              </div>
              <div className="text-xs text-muted-foreground">Confirmées</div>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats?.preparing || 0}
              </div>
              <div className="text-xs text-muted-foreground">Préparation</div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats?.ready || 0}
              </div>
              <div className="text-xs text-muted-foreground">Prêtes</div>
            </CardContent>
          </Card>
          <Card className="border-green-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700">
                {stats?.completed || 0}
              </div>
              <div className="text-xs text-muted-foreground">Terminées</div>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-primary">
                {stats?.revenue?.toLocaleString() || 0} CFA
              </div>
              <div className="text-xs text-muted-foreground">Chiffre d'affaires</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as OrderStatus | "all")} className="mb-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmée</TabsTrigger>
            <TabsTrigger value="preparing">Préparation</TabsTrigger>
            <TabsTrigger value="ready">Prête</TabsTrigger>
            <TabsTrigger value="completed">Terminée</TabsTrigger>
            <TabsTrigger value="cancelled">Annulée</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
              <p className="text-muted-foreground">
                {selectedStatus === "all"
                  ? "Vous n'avez pas encore reçu de commande"
                  : `Aucune commande avec le statut "${statusConfig[selectedStatus as OrderStatus]?.label}"`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;
              const orderDate = new Date(order.created_at);
              const nextAction = nextStatusActions[order.status];

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          Commande #{order.id.slice(0, 8)}
                          <Badge className={`${config.bgColor} ${config.color} border`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(orderDate, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                          </span>
                          {order.profiles?.full_name && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {order.profiles.full_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">{order.total_amount} CFA</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Client & Delivery Info */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                            <User className="w-4 h-4" />
                            Informations client
                          </h4>
                          <div className="text-sm space-y-1 text-muted-foreground">
                            {order.profiles?.full_name && (
                              <p>{order.profiles.full_name}</p>
                            )}
                            {order.delivery_phone && (
                              <p className="flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                {order.delivery_phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {order.delivery_address && (
                          <div>
                            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4" />
                              Adresse de livraison
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {order.delivery_address}
                            </p>
                          </div>
                        )}

                        {order.notes && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Notes du client</h4>
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                              {order.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                          <Package className="w-4 h-4" />
                          Produits commandés
                        </h4>
                        <div className="space-y-2">
                          {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex gap-3 items-center p-2 bg-muted/50 rounded">
                              <div className="w-12 h-12 bg-background rounded flex-shrink-0 overflow-hidden">
                                {item.products?.image_url && (
                                  <img
                                    src={item.products.image_url}
                                    alt={item.product_name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Qté: {item.quantity} × {item.product_price} CFA
                                </p>
                              </div>
                              <p className="text-sm font-semibold">
                                {item.subtotal} CFA
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-6 border-t flex items-center justify-between">
                      <div className="flex gap-2">
                        {order.delivery_phone && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const phone = order.delivery_phone?.replace(/[\s-]/g, '');
                              const message = `Bonjour, concernant votre commande #${order.id.slice(0, 8)}`;
                              window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contacter le client
                          </Button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectOrder(order.id)}
                            className="text-red-600 hover:text-red-700 border-red-200"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Refuser
                          </Button>
                        )}
                        {nextAction && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(order.id, nextAction.nextStatus!)}
                            className="bg-gradient-primary"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {nextAction.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
