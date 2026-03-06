import { useNavigate } from "react-router-dom";
import { slugify } from "@/lib/utils";
import {
  Star,
  ShoppingCart,
  Heart,
  Sparkles,
  Droplets,
  Shirt,
  Package,
  Laptop,
  Book,
  Coffee,
  Dumbbell,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useAddToCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToggleFavorite, useIsFavorite } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import { WhatsAppOrderDialog } from "@/components/whatsapp-order-dialog";
import type { User } from "@supabase/supabase-js";

const iconMap: Record<string, React.ElementType> = {
  Laptop, Shirt, Book, Coffee, Dumbbell, Sparkles, Droplets, Package
};

interface ProductsShowcaseProps {
  selectedUniversity?: string;
}

interface ProductCardProps {
  product: any;
  discount: number;
  index: number;
  user: User | null;
  onAddToCart: (productId: string, quantity: number) => void;
  onToggleFavorite: (productId: string, isFavorite: boolean) => void;
  onViewDetails: (product: any) => void;
  onCommanderDirectement: (product: any) => void;
}

const ProductCard = ({ product, discount, index, user, onAddToCart, onToggleFavorite, onViewDetails, onCommanderDirectement }: ProductCardProps) => {
  const { data: isFavorite = false } = useIsFavorite(user?.id, product.id);
  const [qty, setQty] = useState(1);
  const image = product.image_urls?.[0] || product.image_url;
  const inStock = product.stock_quantity > 0;

  return (
    <div
      className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-border/30 flex flex-col"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image */}
      <div
        className="relative aspect-square bg-muted cursor-pointer overflow-hidden"
        onClick={() => onViewDetails(product)}
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Badge remise */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-foreground text-background text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 z-10">
            <Tag className="w-2.5 h-2.5" />
            -{discount}%
          </div>
        )}
        {!discount && product.stock_quantity < 5 && product.stock_quantity > 0 && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full z-10">
            Stock limité
          </div>
        )}

        {/* Favoris */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id, isFavorite); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors z-10 ${
            isFavorite
              ? "bg-red-500 text-white"
              : "bg-white/90 dark:bg-card/90 text-muted-foreground hover:text-red-400"
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Contenu */}
      <div className="p-3 flex flex-col gap-2.5 flex-1">
        {/* Nom */}
        <p
          className="text-sm font-medium line-clamp-2 cursor-pointer hover:text-primary transition-colors leading-snug"
          onClick={() => onViewDetails(product)}
        >
          {product.name}
        </p>

        {/* Prix + Rating */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-bold">{product.price.toLocaleString()} CFA</span>
            {product.original_price && (
              <span className="hidden sm:inline text-xs text-muted-foreground line-through">
                {product.original_price.toLocaleString()}
              </span>
            )}
          </div>
          {product.rating > 0 && (
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30 rounded-full px-2 py-0.5 flex-shrink-0">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {product.rating.toFixed(1)}
              </span>
              <Star className="w-3 h-3 text-amber-500 fill-current" />
            </div>
          )}
        </div>

        {/* Sélecteur quantité + panier */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-full px-3 h-9 flex-1 justify-between">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-semibold w-5 text-center">{qty}</span>
            <button
              onClick={() => setQty(q => q + 1)}
              disabled={qty >= product.stock_quantity}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product.id, qty); }}
            disabled={!inStock}
            className="w-9 h-9 flex-shrink-0 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-primary transition-colors disabled:opacity-40"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Bouton commander */}
        <button
          onClick={(e) => { e.stopPropagation(); onCommanderDirectement(product); }}
          className="w-full bg-foreground text-background rounded-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-primary transition-colors"
        >
          Commander directement
          <MessageCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const ProductsShowcase = ({ selectedUniversity }: ProductsShowcaseProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const limit = user ? 5 : 12;
  const { data: products = [], isLoading } = useProducts(selectedUniversity ? { university: selectedUniversity } : undefined);
  const { data: allProducts = [] } = useProducts(undefined, !!selectedUniversity && products.length < limit && !isLoading);
  const displayProducts = products.length >= limit ? products : [...products, ...allProducts.filter(p => !products.find(up => up.id === p.id))];
  const { data: categories = [] } = useCategories();
  const addToCart = useAddToCart();
  const toggleFavorite = useToggleFavorite();

  const handleAddToCart = (productId: string, quantity: number = 1) => {
    if (!user) { navigate("/login"); return; }
    addToCart.mutate({ userId: user.id, productId, quantity });
  };

  const handleToggleFavorite = (productId: string, isFavorite: boolean) => {
    if (!user) { navigate("/login"); return; }
    toggleFavorite.mutate({ userId: user.id, productId, isFavorite });
  };

  const handleViewDetails = (product: any) => {
    navigate(`/products/${slugify(product.name)}`);
  };

  const handleCommanderDirectement = (product: any) => {
    setSelectedProduct(product);
    setWhatsappDialogOpen(true);
  };

  const filteredProducts = selectedCategory === "Tous"
    ? displayProducts
    : displayProducts.filter(product => product.categories?.name === selectedCategory);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">Chargement des produits...</div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-16 bg-muted/30 products-section">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Découvrez nos{" "}
            <span className="text-primary">produits phares</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Une sélection soigneusement choisie de produits disponibles sur votre campus universitaire.
          </p>
        </div>

        {/* Catégories */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-10">
          <Button
            variant={selectedCategory === "Tous" ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setSelectedCategory("Tous")}
          >
            <Package className="w-4 h-4 mr-2" />
            Tous
          </Button>
          {categories.map((category) => {
            const Icon = iconMap[category.icon_name || 'Package'] || Package;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSelectedCategory(category.name)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Grille produits */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {filteredProducts.slice(0, limit).map((product, index) => {
            const discount = product.original_price
              ? Math.round((1 - product.price / product.original_price) * 100)
              : 0;
            return (
              <ProductCard
                key={product.id}
                product={product}
                discount={discount}
                index={index}
                user={user}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                onViewDetails={handleViewDetails}
                onCommanderDirectement={handleCommanderDirectement}
              />
            );
          })}
        </div>

        {/* Voir tous */}
        <div className="text-center">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full hover:bg-primary hover:text-primary-foreground"
            onClick={() => navigate("/products")}
          >
            Voir tous les produits
            <Package className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <WhatsAppOrderDialog
        isOpen={whatsappDialogOpen}
        onClose={() => { setWhatsappDialogOpen(false); setSelectedProduct(null); }}
        product={selectedProduct}
      />
    </section>
  );
};
