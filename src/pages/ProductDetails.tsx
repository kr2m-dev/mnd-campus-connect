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
import { matchSlug, slugify } from "@/lib/utils";
import { useState } from "react";
import {
  Star,
  ShoppingCart,
  Heart,
  Package,
  Store,
  MessageCircle,
  MapPin,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Minus,
  Plus,
  ExternalLink,
} from "lucide-react";

export default function ProductDetails() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { data: products = [], isLoading } = useProducts();
  const product = products.find((p) => name && matchSlug(p.name, name));

  const { data: isFavorite = false } = useIsFavorite(user?.id, product?.id);
  const addToCart = useAddToCart();
  const toggleFavorite = useToggleFavorite();

  const handleAddToCart = (productId: string) => {
    if (!user) { navigate("/login"); return; }
    addToCart.mutate({ userId: user.id, productId, quantity });
  };

  const handleToggleFavorite = (productId: string, currentFavorite: boolean) => {
    if (!user) { navigate("/login"); return; }
    toggleFavorite.mutate({ userId: user.id, productId, isFavorite: currentFavorite });
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={() => {}} />
        <div className="flex items-center justify-center pt-20 h-[calc(100vh-5rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={() => {}} />
        <div className="container mx-auto px-4 py-8 pt-24 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Produit introuvable</h3>
          <p className="text-muted-foreground mb-4">Ce produit n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate("/products")}>
            <ArrowLeft className="w-4 h-4 mr-2" />Retour aux produits
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  const productImages = product.image_urls || (product.image_url ? [product.image_url] : []);

  const inStock = product.stock_quantity > 0;
  const lowStock = product.stock_quantity > 0 && product.stock_quantity < 5;

  return (
    <div className="min-h-screen bg-background">
      <Header onUniversityChange={() => {}} />

      <div className="container mx-auto px-4 pt-20 pb-16 max-w-6xl">

        {/* Retour */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-4 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        {/* Grille principale */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* ── Colonne image ── */}
          <div className="lg:sticky lg:top-24">
            <div className="relative rounded-2xl overflow-hidden bg-muted/30">
              <ProductImageCarousel
                images={productImages}
                productName={product.name}
                aspectRatio="square"
                className="rounded-2xl"
              />

              {/* Badges image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {discount > 0 && (
                  <Badge variant="destructive" className="font-bold text-sm px-2.5">
                    -{discount}%
                  </Badge>
                )}
                {lowStock && (
                  <Badge className="bg-orange-500 text-white text-sm">Stock limité</Badge>
                )}
                {!inStock && (
                  <Badge variant="destructive" className="text-sm">Rupture</Badge>
                )}
              </div>
            </div>
          </div>

          {/* ── Colonne infos ── */}
          <div className="space-y-6">

            {/* Fournisseur — style "marque" */}
            {product.suppliers && (
              <button
                onClick={() => navigate(`/shop/${slugify(product.suppliers!.business_name)}`)}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary hover:underline"
              >
                {product.suppliers.business_name}
                <ExternalLink className="w-3 h-3" />
              </button>
            )}

            {/* Titre */}
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating ? product.rating.toFixed(1) : "Aucun avis"}
              </span>
            </div>

            <Separator />

            {/* Prix */}
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-primary">
                  {product.price.toLocaleString()} CFA
                </span>
                {product.original_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {product.original_price.toLocaleString()} CFA
                  </span>
                )}
                {discount > 0 && (
                  <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 text-sm font-semibold">
                    {discount}%
                  </Badge>
                )}
              </div>
              {discount > 0 && (
                <p className="text-sm text-green-600 font-medium">
                  Vous économisez {(product.original_price - product.price).toLocaleString()} CFA
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed text-base">
                {product.description}
              </p>
            )}

            <Separator />

            {/* Stock + catégorie */}
            <div className="flex flex-wrap gap-2 items-center">
              <Badge
                variant={!inStock ? "destructive" : "secondary"}
                className={`${lowStock ? "bg-orange-100 text-orange-700 border-orange-200" : inStock ? "bg-green-100 text-green-700 border-green-200" : ""} flex items-center gap-1`}
              >
                {inStock
                  ? <CheckCircle className="w-3 h-3" />
                  : <AlertCircle className="w-3 h-3" />
                }
                {!inStock ? "Rupture de stock" : lowStock ? `${product.stock_quantity} restants` : "En stock"}
              </Badge>
              {product.categories && (
                <Badge variant="outline">{product.categories.name}</Badge>
              )}
              {product.university_filter && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {product.university_filter}
                </Badge>
              )}
            </div>

            {/* ── Actions ── */}
            <div className="space-y-3">

              {/* Ligne : sélecteur quantité + Ajouter au panier + Favoris */}
              <div className="flex gap-2 items-center">
                {/* Sélecteur quantité */}
                <div className="flex items-center border rounded-full h-11 px-1 gap-1 flex-shrink-0">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-40"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-40"
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Ajouter au panier */}
                <Button
                  onClick={() => handleAddToCart(product.id)}
                  className="flex-1 h-11 text-base font-semibold bg-primary hover:bg-primary/90"
                  disabled={!inStock}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {!inStock ? "Rupture de stock" : "Ajouter au panier"}
                </Button>

                {/* Favoris */}
                <button
                  onClick={() => handleToggleFavorite(product.id, isFavorite)}
                  className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full border-2 transition-colors ${
                    isFavorite
                      ? "border-red-400 bg-red-50 text-red-500 dark:bg-red-900/20"
                      : "border-border hover:border-red-300 hover:text-red-400"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* WhatsApp */}
              <Button
                onClick={() => setWhatsappDialogOpen(true)}
                variant="outline"
                className="w-full h-11 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 text-base font-semibold"
                disabled={!inStock}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Commander via WhatsApp
              </Button>
            </div>

            {/* Lien boutique */}
            {product.suppliers && (
              <button
                onClick={() => navigate(`/shop/${slugify(product.suppliers!.business_name)}`)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full pt-1"
              >
                <Store className="w-4 h-4" />
                Voir toute la boutique {product.suppliers.business_name}
                <ExternalLink className="w-3.5 h-3.5 ml-auto" />
              </button>
            )}
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
