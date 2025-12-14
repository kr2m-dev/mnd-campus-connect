import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  Package
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites, useRemoveFavorite } from "@/hooks/use-favorites";
import { useAddToCart } from "@/hooks/use-cart";

export default function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: favorites = [], isLoading } = useFavorites(user?.id);
  const removeFavorite = useRemoveFavorite();
  const addToCart = useAddToCart();

  const handleUniversityChange = () => {};

  // Redirect if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  const handleRemoveFavorite = (productId: string) => {
    if (user) {
      removeFavorite.mutate({ userId: user.id, productId });
    }
  };

  const handleAddToCart = (productId: string) => {
    if (user) {
      addToCart.mutate({ userId: user.id, productId, quantity: 1 });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={handleUniversityChange} />
        <div className="flex items-center justify-center pt-20 h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de vos favoris...</p>
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
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mes Favoris</h1>
            <p className="text-muted-foreground">
              {favorites.length} produit{favorites.length > 1 ? 's' : ''} dans vos favoris
            </p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Aucun favori pour le moment</h2>
              <p className="text-muted-foreground mb-8">
                Ajoutez des produits à vos favoris en cliquant sur le cœur pour les retrouver facilement ici.
              </p>
              <Button
                onClick={() => navigate("/products")}
                className="bg-gradient-primary"
              >
                <Package className="w-4 h-4 mr-2" />
                Découvrir les produits
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => {
              const product = favorite.products;
              if (!product) return null;

              const discount = product.original_price
                ? Math.round((1 - product.price / product.original_price) * 100)
                : 0;

              return (
                <Card key={favorite.id} className="group overflow-hidden shadow-card hover:shadow-elegant transition-all">
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Favorite Badge */}
                      <div className="absolute top-3 left-3">
                        <Heart className="w-6 h-6 text-red-500 fill-current" />
                      </div>

                      {/* Discount Badge */}
                      {discount > 0 && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="destructive">
                            -{discount}%
                          </Badge>
                        </div>
                      )}

                      {/* Remove Button */}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveFavorite(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {product.rating}
                        </span>
                      </div>

                      {/* Supplier */}
                      {product.suppliers && (
                        <p className="text-xs text-muted-foreground mb-3">
                          par {product.suppliers.business_name}
                        </p>
                      )}

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl font-bold text-primary">
                          {product.price} CFA
                        </span>
                        {product.original_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {product.original_price} CFA
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFavorite(product.id)}
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Retirer
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product.id)}
                          className="bg-primary hover:bg-primary-dark"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Panier
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
