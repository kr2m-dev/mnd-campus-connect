import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  MessageCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useOrders, useCancelOrder } from "@/hooks/use-orders";
import { OrderStatus } from "@/lib/database-types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createWhatsAppLink } from "@/lib/phone-utils";

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

export default function MyOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useOrders();
  const cancelOrder = useCancelOrder();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};

  // Redirect if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  const handleCancelOrder = (orderId: string) => {
    setOrderToCancel(orderId);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;

    setIsCancelling(true);
    try {
      await cancelOrder.mutateAsync(orderToCancel);
      setOrderToCancel(null);
    } catch (error) {
      console.error("Error cancelling order:", error);
    } finally {
      setIsCancelling(false);
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
            <p className="text-muted-foreground">Chargement de vos commandes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onUniversityChange={handleUniversityChange} />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mes Commandes</h1>
            <p className="text-muted-foreground">
              Suivez l'état de vos commandes
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{orders.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-xs text-muted-foreground">En attente</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {orders.filter(o => ['confirmed', 'preparing'].includes(o.status)).length}
              </div>
              <div className="text-xs text-muted-foreground">En cours</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'completed').length}
              </div>
              <div className="text-xs text-muted-foreground">Terminées</div>
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
              <p className="text-muted-foreground mb-6">
                {selectedStatus === "all"
                  ? "Vous n'avez pas encore passé de commande"
                  : `Vous n'avez pas de commande avec le statut "${statusConfig[selectedStatus as OrderStatus]?.label}"`
                }
              </p>
              <Button onClick={() => navigate("/products")}>
                Découvrir nos produits
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;
              const orderDate = new Date(order.created_at);

              return (
                <Card
                  key={order.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
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
                          {order.suppliers && (
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {order.suppliers.business_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{order.total_amount} CFA</div>
                        {order.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelOrder(order.id);
                            }}
                            className="text-red-600 hover:text-red-700 mt-1"
                          >
                            Annuler
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Delivery Info */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          Informations de livraison
                        </h4>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          {order.delivery_address && (
                            <p className="flex items-start gap-2">
                              <MapPin className="w-3 h-3 mt-1 flex-shrink-0" />
                              {order.delivery_address}
                            </p>
                          )}
                          {order.delivery_phone && (
                            <p className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {order.delivery_phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Notes</h4>
                          <p className="text-sm text-muted-foreground">{order.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Contact Supplier */}
                    {order.suppliers?.contact_whatsapp && order.status !== 'cancelled' && (
                      <div className="mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const message = `Bonjour, je souhaite obtenir des informations sur ma commande #${order.id.slice(0, 8)} d'un montant de ${order.total_amount} CFA.\n\nStatut actuel : ${statusConfig[order.status].label}`;
                            const whatsappUrl = createWhatsAppLink(order.suppliers?.contact_whatsapp, message);
                            if (whatsappUrl) {
                              window.open(whatsappUrl, '_blank');
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contacter le fournisseur sur WhatsApp
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Order Dialog */}
      <Dialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Annuler la commande
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setOrderToCancel(null)}
              disabled={isCancelling}
            >
              Non, garder la commande
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Annulation...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Oui, annuler
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
