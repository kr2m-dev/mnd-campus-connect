import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Truck,
  MapPin,
  Tag,
  AlertCircle,
  CheckCircle,
  Gift,
  Percent,
  MessageCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useCart, useUpdateCartQuantity, useRemoveFromCart } from "@/hooks/use-cart";
import { WhatsAppOrderDialog } from "@/components/whatsapp-order-dialog";

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: cartItems = [], isLoading } = useCart(user?.id);
  const updateQuantity = useUpdateCartQuantity();
  const removeFromCart = useRemoveFromCart();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => {};

  // Redirect if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

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

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "student20") {
      setAppliedPromo("student20");
      setPromoCode("");
    } else if (promoCode.toLowerCase() === "welcome10") {
      setAppliedPromo("welcome10");
      setPromoCode("");
    } else {
      // Invalid promo code
      setPromoCode("");
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  // Calculations
  const subtotal = cartItems.reduce((total, item) => {
    const price = item.products?.price || 0;
    return total + (price * item.quantity);
  }, 0);
  
  const totalSavings = cartItems.reduce((total, item) => {
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

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onUniversityChange={handleUniversityChange}
        />
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
        <Header
          onUniversityChange={handleUniversityChange}
        />

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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onUniversityChange={handleUniversityChange}
      />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mon Panier</h1>
            <p className="text-muted-foreground">
              {totalItems} article{totalItems > 1 ? 's' : ''} dans votre panier
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = item.products;
              if (!product) return null;
              
              const discount = product.original_price
                ? Math.round((1 - product.price / product.original_price) * 100)
                : 0;

              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex gap-4 p-4">
                      {/* Product Image */}
                      <div className="relative w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {product.original_price && (
                          <Badge variant="destructive" className="absolute top-1 left-1 text-xs">
                            -{discount}%
                          </Badge>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            {product.suppliers && (
                              <p className="text-sm text-muted-foreground">
                                par {product.suppliers.business_name}
                              </p>
                            )}
                            {product.categories && (
                              <Badge variant="secondary" className="text-xs">
                                {product.categories.name}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{product.price} CFA</span>
                              {product.original_price && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {product.original_price} CFA
                                </span>
                              )}
                            </div>
                            {product.original_price && (
                              <p className="text-xs text-green-600">
                                Économie: {((product.original_price - product.price) * item.quantity)} CFA
                              </p>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= (product.stock_quantity || 0)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {item.quantity >= (product.stock_quantity || 0) && (
                          <p className="text-xs text-orange-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Stock maximum atteint
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

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
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
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
                  Résumé de la commande
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total ({totalItems} articles)</span>
                    <span>{subtotal} CFA</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Économies promotions</span>
                      <span>-{totalSavings} CFA</span>
                    </div>
                  )}

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Code promo ({appliedPromo?.toUpperCase()})</span>
                      <span>-{promoDiscount} CFA</span>
                    </div>
                  )}

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

                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-primary"
                    size="lg"
                    onClick={() => navigate("/checkout")}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Procéder au paiement
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => setWhatsappDialogOpen(true)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contacter via WhatsApp
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
          </div>
        </div>
      </div>

      <WhatsAppOrderDialog
        isOpen={whatsappDialogOpen}
        onClose={() => setWhatsappDialogOpen(false)}
        cartItems={cartItems}
      />

      <Footer />
    </div>
  );
}