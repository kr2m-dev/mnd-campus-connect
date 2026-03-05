import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
  Globe,
  ChevronDown,
  ChevronUp,
  X
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
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  // If a university param is in the URL (from home page selector), pre-select it
  const urlUniversityId = searchParams.get("university");
  const [showAllUniversities, setShowAllUniversities] = useState(() => !!urlUniversityId);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(() => urlUniversityId);
  // Sync searchQuery when URL params change (e.g. searching from the header while already on this page)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setSearchQuery(urlSearch);
  }, [searchParams]);

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

  const getPrimaryUniversityForProduct = (product: any) => {
    if (!product.university_filter) return null;
    const firstId = String(product.university_filter)
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)[0];
    if (!firstId) return null;
    return senegalUniversities.find((u) => u.id === firstId) || null;
  };

  // Determine which university to filter by
  const getFilterUniversity = () => {
    if (showAllUniversities) {
      // Si une université spécifique est sélectionnée, utiliser son ID
      if (selectedUniversityId) {
        return selectedUniversityId;
      }
      // Sinon, ne pas filtrer par université (undefined)
      return undefined;
    }
    // Par défaut, filtrer par l'université de l'utilisateur (ID)
    return userUniversity?.id;
  };

  const activeUniversityFilter = getFilterUniversity();

  // Build filters using enhanced types
  const filters: ProductFilters = {
    university: activeUniversityFilter,
    category_id: selectedCategory !== "all" ? selectedCategory : undefined,
    search: searchQuery || undefined,
    min_price: priceRange.min ? parseFloat(priceRange.min) : undefined,
    max_price: priceRange.max ? parseFloat(priceRange.max) : undefined,
    is_active: true,
  };

  // Fallback filters without university — used when the selected university has no products
  const fallbackFilters: ProductFilters = {
    category_id: selectedCategory !== "all" ? selectedCategory : undefined,
    search: searchQuery || undefined,
    min_price: priceRange.min ? parseFloat(priceRange.min) : undefined,
    max_price: priceRange.max ? parseFloat(priceRange.max) : undefined,
    is_active: true,
  };

  const { data: products = [], isLoading } = useProducts(filters);
  // Only run the fallback query when a university filter is active
  const { data: allProducts = [], isLoading: isLoadingFallback } = useProducts(
    fallbackFilters,
    !!activeUniversityFilter
  );

  // When the university filter yields no results, fall back to all products
  const isFallback = !isLoading && products.length === 0 && !!activeUniversityFilter;
  const displayProducts = isFallback ? allProducts : products;
  const isPageLoading = isLoading || (!!activeUniversityFilter && isLoadingFallback);

  const { data: categories = [] } = useCategories();

  // Sort products (filtering is now done by the hook with indexes)
  const sortedProducts = [...displayProducts].sort((a, b) => {
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

  if (isPageLoading) {
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

    const primaryUniversity = getPrimaryUniversityForProduct(product);

    if (viewMode === "list") {
      return (
        <Card
          className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer"
          onClick={() => handleViewDetails(product)}
        >
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
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id, isFavorite); }}
                      className={isFavorite ? "text-red-500 hover:text-red-600" : ""}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleViewDetails(product); }}>
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
                {showAllUniversities && primaryUniversity && (
                  <Badge variant="secondary" className="text-xs mb-2">
                    {primaryUniversity.flag}{' '}
                    {primaryUniversity.name}
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
                    <span className="text-base sm:text-xl font-bold text-primary">
                      {product.price} CFA
                    </span>
                    {product.original_price && (
                      <span className="hidden sm:inline text-sm text-muted-foreground line-through">
                        {product.original_price} CFA
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                      onClick={(e) => { e.stopPropagation(); handleWhatsAppOrder(product); }}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      className="bg-primary hover:bg-primary-dark"
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}
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
        className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 interactive-scale cursor-pointer"
        style={{ animationDelay: `${index * 0.1}s` }}
        onClick={() => handleViewDetails(product)}
      >
        <CardContent className="p-0">
          {/* Product Images Carousel */}
          <div className="relative">
            <ProductImageCarousel
              images={productImages}
              productName={product.name}
              aspectRatio="square"
            />

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
            {showAllUniversities && primaryUniversity && (
              <Badge variant="secondary" className="text-xs mb-2">
                {primaryUniversity.flag}{' '}
                {primaryUniversity.name}
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
              <div className="flex items-center gap-1 sm:gap-2">
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

        <CardFooter className="p-4 pt-0 flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => { e.stopPropagation(); handleViewDetails(product); }}
              title="Voir le produit"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`flex-1 ${isFavorite ? "text-red-500 border-red-300 hover:bg-red-50" : ""}`}
              onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id, isFavorite); }}
              title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
          <Button
            className="w-full bg-primary hover:bg-primary-dark btn-glow"
            onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}
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

      <div className="container mx-auto px-4 py-4 pt-10">

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Nos{" "}
              <span className="text-primary">
                Produits
              </span>
            </h1>
          </div>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez notre large sélection de produits d'hygiène, de soins et de parfums
            disponibles sur votre campus universitaire.
          </p>

          <div className="mt-3">
            <Badge variant="outline" className="text-sm">
              {userUniversity && !showAllUniversities ? (
                <><span className="mr-2">{userUniversity.flag}</span>Disponible sur {userUniversity.name}</>
              ) : showAllUniversities && selectedUniversityId ? (
                <><span className="mr-2">{getUniversityById(selectedUniversityId)?.flag}</span>Produits de {getUniversityById(selectedUniversityId)?.name}</>
              ) : showAllUniversities ? (
                <><Globe className="w-3 h-3 mr-2" />Produits de toutes les universités</>
              ) : (
                <><Package className="w-3 h-3 mr-2" />Tous les produits disponibles</>
              )}
            </Badge>
          </div>
        </div>

        {/* Filters Toggle Button */}
        {(() => {
          const activeFiltersCount = [
            selectedCategory !== "all",
            priceRange.min !== "",
            priceRange.max !== "",
            sortBy !== "newest",
            showAllUniversities,
          ].filter(Boolean).length;

          return (
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(v => !v)}
                className="flex items-center gap-2 h-9"
              >
                <Filter className="w-4 h-4" />
                Filtres
                {activeFiltersCount > 0 && (
                  <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                    {activeFiltersCount}
                  </Badge>
                )}
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {/* Active filter chips */}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedCategory("all")}>
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {(priceRange.min || priceRange.max) && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setPriceRange({ min: "", max: "" })}>
                  {priceRange.min || "0"} – {priceRange.max || "∞"} CFA
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {showAllUniversities && selectedUniversityId && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => { setSelectedUniversityId(null); setShowAllUniversities(false); }}>
                  {getUniversityById(selectedUniversityId)?.flag} {getUniversityById(selectedUniversityId)?.name.split(' ').slice(0, 2).join(' ')}
                  <X className="w-3 h-3" />
                </Badge>
              )}
            </div>
          );
        })()}

        {/* Filters and Search */}
        {showFilters && (
        <div className="bg-card rounded-lg p-3 sm:p-6 mb-6 sm:mb-8 shadow-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
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
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="text-sm text-muted-foreground">Prix:</span>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-16 sm:w-20 h-8 sm:h-9 text-xs sm:text-sm"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-16 sm:w-20 h-8 sm:h-9 text-xs sm:text-sm"
              />
              <span className="text-xs sm:text-sm text-muted-foreground">CFA</span>
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

          {/* University Filter */}
          <div className="border-t pt-3 mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <Switch
                id="show-all-universities"
                checked={showAllUniversities}
                onCheckedChange={(checked) => {
                  setShowAllUniversities(checked);
                  if (!checked) setSelectedUniversityId(null);
                }}
              />
              <Label htmlFor="show-all-universities" className="cursor-pointer text-sm font-medium">
                {userUniversity ? "Autres universités" : "Filtrer par université"}
              </Label>
            </div>

            {showAllUniversities && (
              <Select
                value={selectedUniversityId || "all"}
                onValueChange={(value) => setSelectedUniversityId(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full sm:w-[260px] border-primary/50">
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
        )}

        {/* Fallback notice */}
        {isFallback && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 flex-shrink-0" />
            <span>
              Aucun produit disponible pour cette université. Voici tous les produits disponibles.
            </span>
          </div>
        )}

        {/* Results Count + Category Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <p className="text-sm text-muted-foreground">
            {sortedProducts.length} produit{sortedProducts.length > 1 ? 's' : ''} trouvé{sortedProducts.length > 1 ? 's' : ''}
          </p>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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