import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ProductFilters } from "@/lib/database-types";
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
  List,
  MessageCircle,
  Globe
} from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/hooks/use-auth";
import { useAddToCart } from "@/hooks/use-cart";
import { useToggleFavorite, useIsFavorite } from "@/hooks/use-favorites";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getUniversityById, senegalUniversities } from "@/data/universities";
import { WhatsAppOrderDialog } from "@/components/whatsapp-order-dialog";
import { ProductImageCarousel } from "@/components/product-image-carousel";

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
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showAllUniversities, setShowAllUniversities] = useState(false);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
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

  const handleWhatsAppOrder = (product: any) => {
    setSelectedProduct(product);
    setWhatsappDialogOpen(true);
  };

  const handleViewDetails = (product: any) => {
    navigate(`/products/${slugify(product.name)}`);
  };

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => {};

  // Get user's university for filtering
  const userUniversity = user?.user_metadata?.university_id
    ? getUniversityById(user.user_metadata.university_id)
    : null;

  // Determine which university to filter by
  const getFilterUniversity = () => {
    if (showAllUniversities) {
      // Si une université spécifique est sélectionnée, l'utiliser
      if (selectedUniversityId) {
        const university = getUniversityById(selectedUniversityId);
        return university?.name;
      }
      // Sinon, ne pas filtrer par université (undefined)
      return undefined;
    }
    // Par défaut, filtrer par l'université de l'utilisateur
    return userUniversity?.name;
  };

  // Build filters using enhanced types
  const filters: ProductFilters = {
    university: getFilterUniversity(),
    category_id: selectedCategory !== "all" ? selectedCategory : undefined,
    search: searchQuery || undefined,
    min_price: priceRange.min ? parseFloat(priceRange.min) : undefined,
    max_price: priceRange.max ? parseFloat(priceRange.max) : undefined,
    is_active: true,
  };

  const { data: products = [], isLoading } = useProducts(filters);
  const { data: categories = [] } = useCategories();

  // Sort products (filtering is now done by the hook with indexes)
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
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
    const { data: isFavorite = false } = useIsFavorite(user?.id, product.id);
    const discount = product.original_price
      ? Math.round((1 - product.price / product.original_price) * 100)
      : 0;

    // Obtenir les images du produit (compatibilité ancienne/nouvelle structure)
    const productImages = product.image_urls || (product.image_url ? [product.image_url] : []);

    if (viewMode === "list") {
      return (
        <Card className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex gap-4 p-4">
              {/* Product Images Carousel */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <ProductImageCarousel
                  images={productImages}
                  productName={product.name}
                  aspectRatio="square"
                  className="h-full"
                />
                {discount > 0 && (
                  <Badge variant="destructive" className="absolute top-2 left-2 text-xs z-10">
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleFavorite(product.id, isFavorite)}
                      className={isFavorite ? "text-red-500 hover:text-red-600" : ""}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(product)}>
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

                {/* University Badge - Only show when viewing products from other universities */}
                {showAllUniversities && product.university_filter && (
                  <Badge variant="secondary" className="text-xs mb-2">
                    {senegalUniversities.find(u => u.name === product.university_filter)?.flag || ''}{' '}
                    {product.university_filter}
                  </Badge>
                )}

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
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                      onClick={() => handleWhatsAppOrder(product)}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
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
          {/* Product Images Carousel */}
          <div className="relative">
            <ProductImageCarousel
              images={productImages}
              productName={product.name}
              aspectRatio="square"
            />

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-10">
              <Button size="sm" variant="secondary" onClick={() => handleViewDetails(product)}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleToggleFavorite(product.id, isFavorite)}
                className={isFavorite ? "text-red-500" : ""}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary-dark"
                onClick={() => handleAddToCart(product.id)}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
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
              <div className="absolute top-3 right-3 z-10">
                <Heart className="w-5 h-5 text-red-500 fill-current" />
              </div>
            )}
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

            {/* University Badge - Only show when viewing products from other universities */}
            {showAllUniversities && product.university_filter && (
              <Badge variant="secondary" className="text-xs mb-2">
                {senegalUniversities.find(u => u.name === product.university_filter)?.flag || ''}{' '}
                {product.university_filter}
              </Badge>
            )}

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

        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white border-green-600"
            onClick={() => handleWhatsAppOrder(product)}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button 
            className="flex-1 bg-primary hover:bg-primary-dark btn-glow group"
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

          <div className="mt-4 space-y-3">
            {/* Status Badge */}
            <Badge variant="outline" className="text-sm">
              {userUniversity && !showAllUniversities ? (
                <>
                  <span className="mr-2">{userUniversity.flag}</span>
                  Disponible sur {userUniversity.name}
                </>
              ) : showAllUniversities && selectedUniversityId ? (
                <>
                  <span className="mr-2">{getUniversityById(selectedUniversityId)?.flag}</span>
                  Produits de {getUniversityById(selectedUniversityId)?.name}
                </>
              ) : showAllUniversities ? (
                <>
                  <Globe className="w-3 h-3 mr-2" />
                  Produits de toutes les universités
                </>
              ) : (
                <>
                  <Package className="w-3 h-3 mr-2" />
                  Tous les produits disponibles
                </>
              )}
            </Badge>

            {/* University Filter Toggle */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center space-x-2 bg-card p-3 rounded-lg shadow-sm border">
                <Globe className="w-4 h-4 text-primary" />
                <Switch
                  id="show-all-universities"
                  checked={showAllUniversities}
                  onCheckedChange={(checked) => {
                    setShowAllUniversities(checked);
                    if (!checked) {
                      setSelectedUniversityId(null);
                    }
                  }}
                />
                <Label htmlFor="show-all-universities" className="cursor-pointer text-sm font-medium">
                  {userUniversity
                    ? "Voir les produits d'autres universités"
                    : "Filtrer par université"
                  }
                </Label>
              </div>

              {showAllUniversities && (
                <Select
                  value={selectedUniversityId || "all"}
                  onValueChange={(value) => setSelectedUniversityId(value === "all" ? null : value)}
                >
                  <SelectTrigger className="w-[280px] border-primary/50">
                    <SelectValue placeholder="Sélectionner une université" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        Toutes les universités
                      </div>
                    </SelectItem>
                    {senegalUniversities.map((university) => (
                      <SelectItem key={university.id} value={university.id}>
                        <span className="mr-2">{university.flag}</span>
                        {university.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
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
                  <SelectItem key={category.id} value={category.id}>
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
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
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

      <WhatsAppOrderDialog
        isOpen={whatsappDialogOpen}
        onClose={() => setWhatsappDialogOpen(false)}
        product={selectedProduct}
      />

      <Footer />
    </div>
  );
}