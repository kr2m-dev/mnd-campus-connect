import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { slugify } from "@/lib/utils";
import {
  Star,
  ShoppingCart,
  Heart,
  Eye,
  Sparkles,
  Droplets,
  Shirt,
  Package,
  Laptop,
  Book,
  Coffee,
  Dumbbell
} from "lucide-react";
import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useAddToCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToggleFavorite, useIsFavorite } from "@/hooks/use-favorites";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import type { User } from "@supabase/supabase-js";

// Map icon names to actual components
const iconMap: Record<string, React.ElementType> = {
  Laptop,
  Shirt,
  Book,
  Coffee,
  Dumbbell,
  Sparkles,
  Droplets,
  Package
};

interface ProductsShowcaseProps {
  selectedUniversity?: string;
}

interface ProductCardProps {
  product: any;
  discount: number;
  index: number;
  user: User | null;
  onAddToCart: (productId: string) => void;
  onToggleFavorite: (productId: string, isFavorite: boolean) => void;
  onViewDetails: (product: any) => void;
}

const ProductCard = ({ product, discount, index, user, onAddToCart, onToggleFavorite, onViewDetails }: ProductCardProps) => {
  const { data: isFavorite = false } = useIsFavorite(user?.id, product.id);

  return (
    <Card
      className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 interactive-scale"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardContent className="p-0">
        {/* Product Image Carousel */}
        <div className="relative">
          <ProductImageCarousel
            images={product.image_urls || (product.image_url ? [product.image_url] : [])}
            productName={product.name}
            aspectRatio="square"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
            {discount > 0 && (
              <Badge variant="destructive" className="text-xs">
                -{discount}%
              </Badge>
            )}
            {product.stock_quantity < 5 && product.stock_quantity > 0 && (
              <Badge variant="secondary" className="text-xs bg-orange-500 text-white">
                Stock limité
              </Badge>
            )}
          </div>

          {/* Favorite Badge */}
          {isFavorite && (
            <div className="absolute top-3 right-3 z-20">
              <Heart className="w-5 h-5 text-red-500 fill-current" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-2 sm:p-4">
          <h3 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {product.rating}
            </span>
          </div>

          {/* Supplier */}
          {product.suppliers && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">
              par {product.suppliers.business_name}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <span className="text-sm sm:text-base lg:text-sm xl:text-base font-bold text-primary">
                {product.price} CFA
              </span>
              {product.original_price && (
                <span className="hidden sm:inline text-xs text-muted-foreground line-through">
                  {product.original_price} CFA
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-2 sm:p-4 pt-0 flex flex-col gap-1.5 sm:gap-2">
        <div className="flex gap-1.5 sm:gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails(product)}
            title="Voir le produit"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`flex-1 ${isFavorite ? "text-red-500 border-red-300 hover:bg-red-50" : ""}`}
            onClick={() => onToggleFavorite(product.id, isFavorite)}
            title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
        </div>
        <Button
          className="w-full bg-primary hover:bg-primary-dark btn-glow"
          onClick={() => onAddToCart(product.id)}
        >
          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Ajouter au panier</span>
          <span className="sm:hidden">Ajouter</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export const ProductsShowcase = ({ selectedUniversity }: ProductsShowcaseProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const { data: products = [], isLoading } = useProducts(selectedUniversity ? { university: selectedUniversity } : undefined);
  const { data: categories = [] } = useCategories();
  const addToCart = useAddToCart();
  const toggleFavorite = useToggleFavorite();

  const handleAddToCart = (productId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    addToCart.mutate({ userId: user.id, productId, quantity: 1 });
  };

  const handleToggleFavorite = (productId: string, isFavorite: boolean) => {
    if (!user) {
      navigate("/login");
      return;
    }
    toggleFavorite.mutate({ userId: user.id, productId, isFavorite });
  };

  const handleViewDetails = (product: any) => {
    navigate(`/products/${slugify(product.name)}`);
  };

  const filteredProducts = selectedCategory === "Tous"
    ? products
    : products.filter(product => product.categories?.name === selectedCategory);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">Chargement des produits...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-16 bg-muted/30 products-section">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          {/* <Badge variant="secondary" className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Produits essentiels
          </Badge> */}

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Découvrez nos{" "}
              <span className="text-primary">
              produits phares
            </span>
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Une sélection soigneusement choisie de produits d'hygiène, de soins et de parfums
            disponibles sur votre campus universitaire.
          </p>

          {selectedUniversity && (
            <div className="mt-4">
              <Badge variant="outline" className="text-sm">
                Disponible sur {selectedUniversity}
              </Badge>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-12">
          <Button
            key="tous"
            variant={selectedCategory === "Tous" ? "default" : "outline"}
            size="sm"
            className="interactive-scale"
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
                className="interactive-scale"
                onClick={() => setSelectedCategory(category.name)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-12">
          {filteredProducts.slice(0, 12).map((product, index) => {
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
              />
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button
            size="lg"
            variant="outline"
            className="interactive-scale hover:bg-primary hover:text-primary-foreground"
            onClick={() => navigate("/products")}
          >
            Voir tous les produits
            <Package className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

    </section>
  );
};
