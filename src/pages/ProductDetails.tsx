import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppOrderDialog } from "@/components/whatsapp-order-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useProducts } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-cart";
import { useToggleFavorite, useIsFavorite } from "@/hooks/use-favorites";
import { matchSlug } from "@/lib/utils";
import { useState } from "react";
import {
  Star,
  ShoppingCart,
  Heart,
  Package,
  Store,
  MessageCircle,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  ArrowLeft,
  Loader2
} from "lucide-react";

export default function ProductDetails() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);

  const { data: products = [], isLoading } = useProducts();
  const product = products.find((p) => name && matchSlug(p.name, name));

  const { data: isFavorite = false } = useIsFavorite(user?.id, product?.id);
  const addToCart = useAddToCart();
  const toggleFavorite = useToggleFavorite();

  const handleAddToCart = (productId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    addToCart.mutate({ userId: user.id, productId, quantity: 1 });
  };

  const handleToggleFavorite = (productId: string, currentFavorite: boolean) => {
    if (!user) {
      navigate("/login");
      return;
    }
    toggleFavorite.mutate({ userId: user.id, productId, isFavorite: currentFavorite });
  };

  const handleWhatsAppOrder = () => {
    setWhatsappDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={() => {}} />
        <div className="flex items-center justify-center pt-20 h-[calc(100vh-5rem)]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Chargement du produit...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={() => {}} />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Produit introuvable</h3>
            <p className="text-muted-foreground mb-4">
              Le produit que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Button onClick={() => navigate("/products")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux produits
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculer la réduction
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  // Obtenir les images du produit
  const productImages = product.image_urls || (product.image_url ? [product.image_url] : []);

  // Statut du stock
  const stockStatus = product.stock_quantity <= 0
    ? { label: "Rupture de stock", color: "destructive", icon: AlertCircle }
    : product.stock_quantity < 5
    ? { label: "Stock limité", color: "warning", icon: AlertCircle }
    : { label: "En stock", color: "success", icon: CheckCircle };

  return (
    <div className="min-h-screen bg-background">
      <Header onUniversityChange={() => {}} />

      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Bouton retour */}
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-4 hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {/* Contenu principal */}
        <div className="grid md:grid-cols-2 gap-5 sm:gap-8 lg:gap-12 mb-8 items-start">
          {/* Section Images */}
          <div className="md:sticky md:top-20">
            <div className="relative bg-card rounded-lg overflow-hidden shadow-card">
              <ProductImageCarousel
                images={productImages}
                productName={product.name}
                aspectRatio="square"
                className="rounded-lg"
              />

              {/* Badges sur l'image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {discount > 0 && (
                  <Badge variant="destructive" className="text-sm font-bold">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    -{discount}%
                  </Badge>
                )}
                {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                  <Badge variant="secondary" className="text-sm bg-orange-500 text-white">
                    Stock limité
                  </Badge>
                )}
              </div>

              {isFavorite && (
                <div className="absolute top-4 right-4 z-10">
                  <Heart className="w-7 h-7 text-red-500 fill-current drop-shadow-lg" />
                </div>
              )}
            </div>
          </div>

          {/* Section Informations */}
          <div className="space-y-3">
            {/* Titre et Rating */}
            <div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-muted-foreground">
                  {product.rating ? product.rating.toFixed(1) : "N/A"}
                </span>
                <span className="text-xs text-muted-foreground">({product.rating || 0}/5)</span>
              </div>
            </div>

            <Separator />

            {/* Prix */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-primary">
                  {product.price} CFA
                </span>
                {product.original_price && (
                  <span className="text-sm sm:text-base text-muted-foreground line-through">
                    {product.original_price} CFA
                  </span>
                )}
              </div>
              {discount > 0 && (
                <p className="text-sm text-green-600 font-semibold">
                  Économisez {product.original_price - product.price} CFA ({discount}% de réduction)
                </p>
              )}
            </div>

            <Separator />

            {/* Description */}
            {product.description && (
              <div className="space-y-1">
                <h2 className="font-semibold text-base">Description</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Fournisseur + Stock + Catégorie en compact */}
            <div className="space-y-2">
              {product.suppliers && (
                <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{product.suppliers.business_name}</span>
                  </div>
                  {product.suppliers.contact_whatsapp && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {product.suppliers.contact_whatsapp}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  variant={product.stock_quantity <= 0 ? "destructive" : product.stock_quantity < 5 ? "secondary" : "default"}
                  className={product.stock_quantity > 0 && product.stock_quantity < 5 ? "bg-orange-500 text-white" : ""}
                >
                  <stockStatus.icon className="w-3 h-3 mr-1" />
                  {stockStatus.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {product.stock_quantity} unité{product.stock_quantity > 1 ? 's' : ''} disponible{product.stock_quantity > 1 ? 's' : ''}
                </span>
                {product.categories && (
                  <Badge variant="outline" className="text-xs">{product.categories.name}</Badge>
                )}
                {product.university_filter && (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {product.university_filter}
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={() => handleToggleFavorite(product.id, isFavorite)}
                  variant="outline"
                  className={`flex-1 ${isFavorite ? "text-red-500 border-red-500 hover:bg-red-50" : ""}`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                  {isFavorite ? "Retirer" : "Favoris"}
                </Button>
                <Button
                  onClick={handleWhatsAppOrder}
                  variant="outline"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white border-green-600"
                  disabled={product.stock_quantity <= 0}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>

              <Button
                onClick={() => handleAddToCart(product.id)}
                className="w-full bg-primary hover:bg-primary-dark py-5 text-base"
                disabled={product.stock_quantity <= 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.stock_quantity <= 0 ? "Rupture de stock" : "Ajouter au panier"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <WhatsAppOrderDialog
        isOpen={whatsappDialogOpen}
        onClose={() => setWhatsappDialogOpen(false)}
        product={product}
      />

      <Footer />
    </div>
  );
}
