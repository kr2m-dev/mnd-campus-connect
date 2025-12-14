import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Truck,
  MapPin,
  Phone,
  User,
  FileText,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  Package
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useCart, useRemoveFromCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: cartItems = [], isLoading } = useCart(user?.id);
  const createOrder = useCreateOrder();
  const removeFromCart = useRemoveFromCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    deliveryAddress: "",
    notes: ""
  });

  // Charger les données du profil et la dernière adresse utilisée
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      try {
        // Charger le profil
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, phone")
          .eq("user_id", user.id)
          .single();

        if (error) {
          logger.error("Error loading profile:", error);
          return;
        }

        // Récupérer la dernière adresse utilisée du localStorage
        const lastAddress = localStorage.getItem(`last_delivery_address_${user.id}`);

        if (profile) {
          const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
          setFormData(prev => ({
            ...prev,
            fullName: fullName || "",
            phone: profile.phone || "",
            deliveryAddress: lastAddress || ""
          }));
        }
      } catch (error) {
        logger.error("Error loading profile data:", error);
      }
    };

    loadProfileData();
  }, [user]);

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};

  // Redirect if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  // Redirect if cart is empty
  if (!isLoading && cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  // Group cart items by supplier
  const itemsBySupplier = cartItems.reduce((acc, item) => {
    // Use supplier_id from product, fallback to supplier.id, then "unknown"
    const supplierId = item.products?.supplier_id || item.products?.suppliers?.id || "unknown";
    if (!acc[supplierId]) {
      acc[supplierId] = {
        supplier: item.products?.suppliers,
        items: []
      };
    }
    acc[supplierId].items.push(item);
    return acc;
  }, {} as Record<string, { supplier: any; items: any[] }>);

  // Calculations
  const subtotal = cartItems.reduce((total, item) => {
    const price = item.products?.price || 0;
    return total + (price * item.quantity);
  }, 0);

  const deliveryFee = subtotal > 50000 ? 0 : 1500;
  const total = subtotal + deliveryFee;
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create an order for each supplier
      const supplierIds = Object.keys(itemsBySupplier);

      for (const supplierId of supplierIds) {
        const supplierItems = itemsBySupplier[supplierId].items;
        const supplierTotal = supplierItems.reduce((sum, item) => {
          return sum + ((item.products?.price || 0) * item.quantity);
        }, 0);

        // Skip if no valid supplier
        if (supplierId === "unknown") {
          logger.warn("Skipping order creation: no supplier_id for items", supplierItems);
          continue;
        }

        // Create order
        const orderData = {
          supplier_id: supplierId,
          status: 'pending' as const,
          total_amount: supplierTotal + deliveryFee,
          delivery_address: formData.deliveryAddress,
          delivery_phone: formData.phone,
          notes: formData.notes
        };

        logger.log("Creating order with data:", orderData);
        const createdOrder = await createOrder.mutateAsync(orderData);
        logger.log("Order created:", createdOrder);

        // Create order items
        const orderItemsData = supplierItems.map(item => ({
          order_id: createdOrder.id,
          product_id: item.products?.id,
          product_name: item.products?.name || 'Produit inconnu',
          product_price: item.products?.price || 0,
          quantity: item.quantity,
          subtotal: (item.products?.price || 0) * item.quantity
        }));

        logger.log("Creating order items:", orderItemsData);
        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItemsData);

        if (itemsError) {
          logger.error("Error creating order items:", itemsError);
          throw itemsError;
        }

        // Remove items from cart
        for (const item of supplierItems) {
          if (user) {
            await removeFromCart.mutateAsync({ cartItemId: item.id, userId: user.id });
          }
        }
      }

      // Sauvegarder l'adresse de livraison pour la prochaine fois
      if (user && formData.deliveryAddress) {
        localStorage.setItem(`last_delivery_address_${user.id}`, formData.deliveryAddress);
      }

      toast.success("Commande créée avec succès!");
      navigate("/orders");
    } catch (error) {
      logger.error("Error creating order:", error);
      toast.error("Erreur lors de la création de la commande");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.fullName && formData.phone && formData.deliveryAddress;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={handleUniversityChange} />
        <div className="flex items-center justify-center pt-20 h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
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
        <Button
          variant="ghost"
          onClick={() => navigate("/cart")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au panier
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Finaliser la commande</h1>
            <p className="text-muted-foreground">
              Remplissez vos informations de livraison
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Informations de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nom complet
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Votre nom complet"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Téléphone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="77 123 45 67"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Adresse de livraison
                    </Label>
                    <Input
                      id="deliveryAddress"
                      placeholder="Ex: Grand Campus, Pavillon A, Chambre 12"
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Précisez le pavillon, la chambre ou le point de rencontre
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Notes (optionnel)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Instructions spéciales pour la livraison..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">Mode de livraison</p>
                        <p className="text-blue-700">
                          📍 Livraison sur le campus universitaire<br />
                          ⏰ Délai: 2-3 jours ouvrables<br />
                          💰 Paiement à la livraison
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Order Items Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Récapitulatif ({totalItems} articles)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const product = item.products;
                    if (!product) return null;

                    return (
                      <div key={item.id} className="flex gap-3 items-center">
                        <div className="w-12 h-12 bg-muted rounded flex-shrink-0 overflow-hidden">
                          <img
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × {product.price} CFA
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {product.price * item.quantity} CFA
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Résumé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{subtotal} CFA</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Livraison
                    </span>
                    <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                      {deliveryFee === 0 ? "GRATUITE" : `${deliveryFee} CFA`}
                    </span>
                  </div>

                  {deliveryFee > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Livraison gratuite à partir de 50 000 CFA
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{total} CFA</span>
                </div>

                <Badge variant="secondary" className="w-full justify-center py-2">
                  Paiement à la livraison
                </Badge>

                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  className="w-full bg-gradient-primary"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmer la commande
                    </>
                  )}
                </Button>

                <div className="text-xs text-center text-muted-foreground space-y-1">
                  <p>En confirmant, vous acceptez nos conditions générales</p>
                  <p>Le fournisseur sera notifié de votre commande</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
