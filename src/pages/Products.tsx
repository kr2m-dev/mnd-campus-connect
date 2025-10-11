import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Dumbbell,
  Search,
  Filter,
  ArrowLeft,
  Grid3X3,
  List
} from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/hooks/use-auth";
import { useAddToCart } from "@/hooks/use-cart";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getUniversityById } from "@/data/universities";

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

export default function Products() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const addToCart = useAddToCart();

  const handleAddToCart = (productId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    addToCart.mutate({ userId: user.id, productId, quantity: 1 });
  };

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => {};

  // Get user's university for filtering
  const userUniversity = user?.user_metadata?.university_id
    ? getUniversityById(user.user_metadata.university_id)
    : null;

  const { data: products = [], isLoading } = useProducts(userUniversity?.id);
  const { data: categories = [] } = useCategories();

  // Filter and search products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "all" || product.categories?.name === selectedCategory;

    const matchesPrice = (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
                        (!priceRange.max || product.price <= parseFloat(priceRange.max));

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.name.localeCompare(b.name);
      default: // newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onUniversityChange={handleUniversityChange}
          onSupplierAccess={handleSupplierAccess}
          onStudentExchange={handleStudentExchange}
        />
        <div className="flex items-center justify-center pt-20 h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des produits...</p>
          </div>
        </div>
      </div>
    );
  }

  const ProductCard = ({ product, index }: { product: any; index: number }) => {
    const discount = product.original_price
      ? Math.round((1 - product.price / product.original_price) * 100)
      : 0;

    if (viewMode === "list") {
      return (
        <Card className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex gap-4 p-4">
              {/* Product Image */}
              <div className="relative w-32 h-32 bg-muted overflow-hidden rounded-lg flex-shrink-0">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {discount > 0 && (
                  <Badge variant="destructive" className="absolute top-2 left-2 text-xs">
                    -{discount}%
                  </Badge>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {product.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Rating */}
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
                  <span className="text-sm text-muted-foreground">
                    {product.rating}
                  </span>
                </div>

                {/* Supplier */}
                {product.suppliers && (
                  <p className="text-sm text-muted-foreground">
                    par {product.suppliers.business_name}
                  </p>
                )}

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-primary">
                      {product.price} CFA
                    </span>
                    {product.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.original_price} CFA
                      </span>
                    )}
                  </div>
                  <Button 
                    className="bg-primary hover:bg-primary-dark"
                    onClick={() => handleAddToCart(product.id)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Ajouter au panier
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 interactive-scale"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <CardContent className="p-0">
          {/* Product Image */}
          <div className="relative aspect-square bg-muted overflow-hidden">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary">
                <Eye className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="secondary">
                <Heart className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary-dark">
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
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
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
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
              <p className="text-xs text-muted-foreground mb-2">
                par {product.suppliers.business_name}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {product.price} CFA
                </span>
                {product.original_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {product.original_price} CFA
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full bg-primary hover:bg-primary-dark btn-glow group"
            onClick={() => handleAddToCart(product.id)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ajouter au panier
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onUniversityChange={handleUniversityChange}
        onSupplierAccess={handleSupplierAccess}
        onStudentExchange={handleStudentExchange}
      />

      <div className="container mx-auto px-4 py-8 pt-24">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">
              Nos{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Produits
              </span>
            </h1>
          </div>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez notre large sélection de produits d'hygiène, de soins et de parfums
            disponibles sur votre campus universitaire.
          </p>

          {userUniversity && (
            <div className="mt-4">
              <Badge variant="outline" className="text-sm">
                <span className="mr-2">{userUniversity.flag}</span>
                Disponible sur {userUniversity.name}
              </Badge>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récents</SelectItem>
                <SelectItem value="price-low">Prix croissant</SelectItem>
                <SelectItem value="price-high">Prix décroissant</SelectItem>
                <SelectItem value="rating">Mieux notés</SelectItem>
                <SelectItem value="name">Nom A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Prix:</span>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-20"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">CFA</span>
            </div>
            {(priceRange.min || priceRange.max) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPriceRange({ min: "", max: "" })}
              >
                Effacer
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {sortedProducts.length} produit{sortedProducts.length > 1 ? 's' : ''} trouvé{sortedProducts.length > 1 ? 's' : ''}
          </p>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              <Package className="w-4 h-4 mr-2" />
              Tous
            </Button>
            {categories.slice(0, 4).map((category) => {
              const Icon = iconMap[category.icon_name || 'Package'] || Package;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Products Grid/List */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Essayez de modifier vos filtres ou votre recherche
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setPriceRange({ min: "", max: "" });
              }}
            >
              Effacer tous les filtres
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              : "space-y-4"
          }>
            {sortedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}