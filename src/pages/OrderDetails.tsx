import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  MapPin,
  Phone,
  Calendar,
  MessageCircle,
  User,
  ShoppingBag,
  Store,
  FileText,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useOrder, useOrderItems, useCancelOrder } from "@/hooks/use-orders";
import { OrderStatus } from "@/lib/database-types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createWhatsAppLink } from "@/lib/phone-utils";
import { useState } from "react";
import { logger } from "@/lib/logger";

const statusConfig: Record<OrderStatus, {
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
}> = {
  pending: {
    label: "En attente",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200",
    description: "Votre commande a été reçue et est en attente de confirmation"
  },
  confirmed: {
    label: "Confirmée",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    description: "Votre commande a été confirmée par le fournisseur"
  },
  preparing: {
    label: "En préparation",
    icon: ChefHat,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
    description: "Votre commande est en cours de préparation"
  },
  ready: {
    label: "Prête",
    icon: Package,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
    description: "Votre commande est prête pour la livraison ou le retrait"
  },
  completed: {
    label: "Terminée",
    icon: CheckCircle,
    color: "text-green-700",
    bgColor: "bg-green-100 border-green-300",
    description: "Votre commande a été livrée avec succès"
  },
  cancelled: {
    label: "Annulée",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
    description: "Cette commande a été annulée"
  }
};

const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

export default function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { data: order, isLoading: isLoadingOrder } = useOrder(orderId || "");
  const { data: orderItems = [], isLoading: isLoadingItems } = useOrderItems(orderId || "");
  const cancelOrder = useCancelOrder();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};

  // Redirect if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  if (isLoadingOrder || isLoadingItems) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={handleUniversityChange} />
        <div className="flex items-center justify-center pt-20 h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des détails de la commande...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={handleUniversityChange} />
        <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Commande introuvable</h3>
              <p className="text-muted-foreground mb-6">
                La commande que vous recherchez n'existe pas ou a été supprimée.
              </p>
              <Button onClick={() => navigate("/my-orders")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à mes commandes
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const config = statusConfig[order.status];
  const StatusIcon = config.icon;
  const orderDate = new Date(order.created_at);
  const currentStatusIndex = statusFlow.indexOf(order.status);

  const handleCancelOrder = async () => {
    if (!orderId) return;

    setIsCancelling(true);
    try {
      await cancelOrder.mutateAsync(orderId);
      setShowCancelDialog(false);
    } catch (error) {
      logger.error("Error cancelling order:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleContactSupplier = () => {
    if (!order.suppliers?.contact_whatsapp) return;

    const message = `Bonjour, je souhaite obtenir des informations sur ma commande #${order.id.slice(0, 8)} d'un montant de ${order.total_amount} CFA.\n\nStatut actuel : ${config.label}`;
    const whatsappUrl = createWhatsAppLink(order.suppliers.contact_whatsapp, message);
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onUniversityChange={handleUniversityChange} />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-5xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/my-orders")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à mes commandes
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Commande #{order.id.slice(0, 8)}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Passée le {format(orderDate, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </span>
                {order.updated_at && order.updated_at !== order.created_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Mise à jour {format(new Date(order.updated_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </span>
                )}
              </div>
            </div>
            <Badge className={`${config.bgColor} ${config.color} border text-base px-4 py-2`}>
              <StatusIcon className="w-4 h-4 mr-2" />
              {config.label}
            </Badge>
          </div>
          <p className="text-muted-foreground">{config.description}</p>
        </div>

        {/* Status Timeline */}
        {order.status !== 'cancelled' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Suivi de la commande</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-muted" />
                <div
                  className="absolute left-4 top-4 w-0.5 bg-primary transition-all duration-500"
                  style={{
                    height: `${(currentStatusIndex / (statusFlow.length - 1)) * 100}%`
                  }}
                />

                {/* Status Steps */}
                <div className="space-y-6">
                  {statusFlow.map((status, index) => {
                    const stepConfig = statusConfig[status];
                    const StepIcon = stepConfig.icon;
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                      <div key={status} className="relative flex items-start gap-4">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? 'bg-primary border-primary'
                            : 'bg-background border-muted'
                        }`}>
                          <StepIcon className={`w-4 h-4 ${
                            isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div className={`flex-1 ${isCurrent ? 'pt-1' : 'pt-0.5'}`}>
                          <h4 className={`font-semibold ${
                            isCompleted ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {stepConfig.label}
                          </h4>
                          {isCurrent && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {stepConfig.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Articles commandés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div key={item.id}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold">{item.product_name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span>Quantité: {item.quantity}</span>
                            <span>•</span>
                            <span>{item.product_price} CFA l'unité</span>
                          </div>
                        </div>
                        <div className="text-right font-semibold">
                          {item.subtotal} CFA
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                {/* Total */}
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-2xl text-primary">{order.total_amount} CFA</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Informations de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.profiles && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {order.profiles.first_name} {order.profiles.last_name}
                      </p>
                      {order.profiles.phone && (
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {order.profiles.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {order.delivery_address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Adresse de livraison</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.delivery_address}
                      </p>
                    </div>
                  </div>
                )}

                {order.delivery_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Téléphone de livraison</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.delivery_phone}
                      </p>
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Notes</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.notes}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Supplier Info */}
            {order.suppliers && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Store className="w-5 h-5" />
                    Fournisseur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold">{order.suppliers.business_name}</p>
                  </div>

                  {order.suppliers.contact_phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {order.suppliers.contact_phone}
                    </div>
                  )}

                  {order.suppliers.contact_whatsapp && order.status !== 'cancelled' && (
                    <Button
                      onClick={handleContactSupplier}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contacter sur WhatsApp
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            {order.status === 'pending' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Annuler la commande
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Vous ne pouvez annuler que les commandes en attente
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nombre d'articles</span>
                  <span className="font-medium">
                    {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Types de produits</span>
                  <span className="font-medium">{orderItems.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{order.total_amount} CFA</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
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
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
            >
              Non, garder la commande
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
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
