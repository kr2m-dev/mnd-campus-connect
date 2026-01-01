import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  CreditCard,
  Truck,
  MapPin,
  Tag,
  CheckCircle,
  Trash2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useCart, useUpdateCartQuantity, useRemoveFromCart } from "@/hooks/use-cart";
import { SupplierCartSection } from "@/components/cart/supplier-cart-section";
import { SupplierOrderDialog } from "@/components/cart/supplier-order-dialog";

interface SupplierGroup {
  supplierId: string;
  supplierName: string;
  supplierWhatsapp?: string;
  items: Array<{
    id: string;
    quantity: number;
    products: {
      id: string;
      name: string;
      price: number;
      original_price?: number;
      image_url?: string;
      stock_quantity?: number;
      suppliers?: {
        id: string;
        business_name: string;
        contact_whatsapp?: string;
      };
      categories?: {
        name: string;
      };
    };
  }>;
}

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: cartItems = [], isLoading } = useCart(user?.id);
  const updateQuantity = useUpdateCartQuantity();
  const removeFromCart = useRemoveFromCart();
  
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  
  // State for supplier order dialog
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedSupplierGroup, setSelectedSupplierGroup] = useState<SupplierGroup | null>(null);

  const handleUniversityChange = () => {};

  // Redirect if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  // Group cart items by supplier
  const supplierGroups = useMemo(() => {
    const groups = new Map<string, SupplierGroup>();
    
    cartItems.forEach((item: any) => {
      const supplier = item.products?.suppliers;
      if (!supplier) return;
      
      const supplierId = supplier.id;
      
      if (!groups.has(supplierId)) {
        groups.set(supplierId, {
          supplierId,
          supplierName: supplier.business_name,
          supplierWhatsapp: supplier.contact_whatsapp,
          items: []
        });
      }
      
      groups.get(supplierId)!.items.push(item);
    });
    
    return Array.from(groups.values());
  }, [cartItems]);

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    if (user) {
      updateQuantity.mutate({ cartItemId, quantity: newQuantity, userId: user.id });
    }
  };

  const handleRemoveItem = (cartItemId: string) => {
    if (user) {
      removeFromCart.mutate({ cartItemId, userId: user.id });
    }
  };

  const handleOrderSupplier = (group: SupplierGroup) => {
    setSelectedSupplierGroup(group);
    setOrderDialogOpen(true);
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "student20") {
      setAppliedPromo("student20");
      setPromoCode("");
    } else if (promoCode.toLowerCase() === "welcome10") {
      setAppliedPromo("welcome10");
      setPromoCode("");
    } else {
      setPromoCode("");
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  // Calculations
  const subtotal = cartItems.reduce((total: number, item: any) => {
    const price = item.products?.price || 0;
    return total + (price * item.quantity);
  }, 0);
  
  const totalSavings = cartItems.reduce((total: number, item: any) => {
    const price = item.products?.price || 0;
    const originalPrice = item.products?.original_price;
    if (originalPrice) {
      return total + ((originalPrice - price) * item.quantity);
    }
    return total;
  }, 0);

  const promoDiscount = appliedPromo === "student20" ? subtotal * 0.2 :
                       appliedPromo === "welcome10" ? subtotal * 0.1 : 0;

  const deliveryFee = subtotal > 50000 ? 0 : 1500;
  const total = subtotal - promoDiscount + deliveryFee;

  const totalItems = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={handleUniversityChange} />
        <div className="flex items-center justify-center pt-20 h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement du panier...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={handleUniversityChange} />

        <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
            <p className="text-muted-foreground mb-8">
              Découvrez nos produits et ajoutez-les à votre panier pour commencer vos achats.
            </p>
            <Button
              onClick={() => navigate("/products")}
              className="bg-gradient-primary"
            >
              Découvrir nos produits
            </Button>
          </div>
        </div>
        <Footer />
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
            <ShoppingCart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mon Panier</h1>
            <p className="text-muted-foreground">
              {totalItems} article{totalItems > 1 ? 's' : ''} de {supplierGroups.length} fournisseur{supplierGroups.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items grouped by supplier */}
          <div className="lg:col-span-2 space-y-6">
            {supplierGroups.map((group) => (
              <SupplierCartSection
                key={group.supplierId}
                supplierId={group.supplierId}
                supplierName={group.supplierName}
                items={group.items}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onOrder={() => handleOrderSupplier(group)}
              />
            ))}

            {/* Continue Shopping */}
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/products")}
              >
                Continuer mes achats
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Code promo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!appliedPromo ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Entrez votre code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button onClick={applyPromoCode} disabled={!promoCode}>
                      Appliquer
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Code {appliedPromo.toUpperCase()} appliqué
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removePromoCode}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• STUDENT20 : -20% pour les étudiants</p>
                  <p>• WELCOME10 : -10% première commande</p>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
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
                    <span>Sous-total ({totalItems} articles)</span>
                    <span>{subtotal.toLocaleString()} CFA</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Économies promotions</span>
                      <span>-{totalSavings.toLocaleString()} CFA</span>
                    </div>
                  )}

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Code promo ({appliedPromo?.toUpperCase()})</span>
                      <span>-{promoDiscount.toLocaleString()} CFA</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Livraison
                    </span>
                    <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                      {deliveryFee === 0 ? "GRATUITE" : `${deliveryFee.toLocaleString()} CFA`}
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
                  <span>{total.toLocaleString()} CFA</span>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-primary"
                    size="lg"
                    onClick={() => navigate("/checkout")}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Procéder au paiement
                  </Button>

                  <div className="text-xs text-center text-muted-foreground">
                    Paiement à la livraison • Livraison sur le campus
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>📍 Livraison sur le campus universitaire</p>
                  <p>⏰ Délai: 2-3 jours ouvrables</p>
                  <p>📦 Retrait possible en point relais</p>
                </div>
              </CardContent>
            </Card>

            {/* How it works */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2 text-sm">💡 Comment ça marche ?</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>1. Cliquez sur "Commander" pour chaque fournisseur</li>
                  <li>2. Sélectionnez les produits à inclure</li>
                  <li>3. Envoyez votre commande via WhatsApp</li>
                  <li>4. Les autres produits restent dans votre panier</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Supplier Order Dialog */}
      {selectedSupplierGroup && (
        <SupplierOrderDialog
          isOpen={orderDialogOpen}
          onClose={() => {
            setOrderDialogOpen(false);
            setSelectedSupplierGroup(null);
          }}
          supplierName={selectedSupplierGroup.supplierName}
          supplierWhatsapp={selectedSupplierGroup.supplierWhatsapp}
          items={selectedSupplierGroup.items}
        />
      )}

      <Footer />
    </div>
  );
}