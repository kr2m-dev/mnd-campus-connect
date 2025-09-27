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
  Percent
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  supplier: string;
  category: string;
  maxQuantity: number;
  isPromo?: boolean;
}

const sampleCartItems: CartItem[] = [
  {
    id: "cart-1",
    productId: "1",
    name: "Savon antibactérien Dettol",
    price: 2500,
    originalPrice: 3000,
    quantity: 2,
    image: "/placeholder.svg",
    supplier: "Pharmacie Campus",
    category: "Hygiène",
    maxQuantity: 10,
    isPromo: true
  },
  {
    id: "cart-2",
    productId: "2",
    name: "Parfum Axe Africa 150ml",
    price: 8500,
    quantity: 1,
    image: "/placeholder.svg",
    supplier: "Beauty Store",
    category: "Parfums",
    maxQuantity: 5
  },
  {
    id: "cart-3",
    productId: "3",
    name: "Crème hydratante Nivea",
    price: 4200,
    originalPrice: 5000,
    quantity: 1,
    image: "/placeholder.svg",
    supplier: "Cosmetics Plus",
    category: "Soins",
    maxQuantity: 8,
    isPromo: true
  }
];

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(sampleCartItems);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => {};

  // Redirect if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }

    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            quantity: Math.min(newQuantity, item.maxQuantity)
          };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
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
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalSavings = cartItems.reduce((total, item) => {
    if (item.originalPrice) {
      return total + ((item.originalPrice - item.price) * item.quantity);
    }
    return total;
  }, 0);

  const promoDiscount = appliedPromo === "student20" ? subtotal * 0.2 :
                       appliedPromo === "welcome10" ? subtotal * 0.1 : 0;

  const deliveryFee = subtotal > 10000 ? 0 : 1500; // Free delivery over 100€
  const total = subtotal - promoDiscount + deliveryFee;

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onUniversityChange={handleUniversityChange}
          onSupplierAccess={handleSupplierAccess}
          onStudentExchange={handleStudentExchange}
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
        onSupplierAccess={handleSupplierAccess}
        onStudentExchange={handleStudentExchange}
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
              const discount = item.originalPrice
                ? Math.round((1 - item.price / item.originalPrice) * 100)
                : 0;

              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex gap-4 p-4">
                      {/* Product Image */}
                      <div className="relative w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {item.isPromo && (
                          <Badge variant="destructive" className="absolute top-1 left-1 text-xs">
                            -{discount}%
                          </Badge>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              par {item.supplier}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{item.price}€</span>
                              {item.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {item.originalPrice}€
                                </span>
                              )}
                            </div>
                            {item.isPromo && (
                              <p className="text-xs text-green-600">
                                Économie: {((item.originalPrice! - item.price) * item.quantity)}€
                              </p>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
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
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.maxQuantity}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {item.quantity >= item.maxQuantity && (
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
                    <span>{subtotal}€</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Économies promotions</span>
                      <span>-{totalSavings}€</span>
                    </div>
                  )}

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Code promo ({appliedPromo?.toUpperCase()})</span>
                      <span>-{promoDiscount}€</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Livraison
                    </span>
                    <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                      {deliveryFee === 0 ? "GRATUITE" : `${deliveryFee}€`}
                    </span>
                  </div>

                  {deliveryFee > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Livraison gratuite à partir de 100€
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{total}€</span>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-gradient-primary" size="lg">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Procéder au paiement
                  </Button>

                  <div className="text-xs text-center text-muted-foreground">
                    Paiement sécurisé • Livraison sur le campus
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

      <Footer />
    </div>
  );
}