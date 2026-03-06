import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useSupplierBySlug, useProductsBySupplier } from "@/hooks/use-supplier-public";
import { slugify } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  Store,
  MapPin,
  Copy,
  Share2,
  CheckCircle,
  Package,
  Star,
  Loader2,
  ArrowLeft,
  Search,
  X,
} from "lucide-react";

export default function SupplierPublicProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: supplier, isLoading: supplierLoading } = useSupplierBySlug(slug || "");
  const { data: products = [], isLoading: productsLoading } = useProductsBySupplier(
    supplier?.id || "",
    searchQuery || undefined
  );

  const profileUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast({ title: "Lien copié dans le presse-papier !" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Découvrez la boutique ${supplier?.business_name} sur CampusLink : ${profileUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (supplierLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={() => {}} />
        <div className="flex items-center justify-center h-[calc(100vh-5rem)] pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={() => {}} />
        <div className="container mx-auto px-4 py-16 pt-28 text-center">
          <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Boutique introuvable</h2>
          <p className="text-muted-foreground mb-6">
            Cette boutique n'existe pas ou n'est plus disponible.
          </p>
          <Button onClick={() => navigate("/products")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voir les produits
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Non-verified suppliers show a restricted message
  if (!supplier.is_verified) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={() => {}} />
        <div className="container mx-auto px-4 py-16 pt-28 text-center">
          <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Boutique non disponible</h2>
          <p className="text-muted-foreground mb-6">
            Cette boutique n'est pas encore vérifiée. Les vitrines sont réservées aux comptes vérifiés.
          </p>
          <Button onClick={() => navigate("/products")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voir les produits
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onUniversityChange={() => {}} />

      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Supplier profile card */}
        <div className="bg-card border border-border/50 rounded-xl shadow-card p-5 sm:p-6 mb-6 mt-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Logo */}
            <div className="flex-shrink-0">
              {supplier.logo_url ? (
                <img
                  src={supplier.logo_url}
                  alt={supplier.business_name}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Store className="w-10 h-10 text-primary" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold">{supplier.business_name}</h1>
                <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Vérifié
                </Badge>
              </div>

              {supplier.description && (
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {supplier.description}
                </p>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {supplier.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {supplier.address}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={handleCopy}
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? "Copié !" : "Copier le lien"}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleShareWhatsApp}
                title="Partager sur WhatsApp"
                className="flex-shrink-0"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans cette boutique..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Products grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Produits ({products.length})
          </h2>

          {productsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{searchQuery ? "Aucun produit trouvé pour cette recherche." : "Aucun produit disponible pour le moment."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {products.map((product) => {
                const discount = product.original_price
                  ? Math.round((1 - product.price / product.original_price) * 100)
                  : 0;
                const image = product.image_urls?.[0] || product.image_url;

                return (
                  <div
                    key={product.id}
                    className="bg-card border border-border/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => navigate(`/products/${slugify(product.name)}`)}
                  >
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                      {discount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute top-2 left-2 text-xs"
                        >
                          -{discount}%
                        </Badge>
                      )}
                      {product.stock_quantity <= 0 && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Rupture
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-2 sm:p-3">
                      <p className="text-xs sm:text-sm font-medium line-clamp-2 mb-1">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-sm font-bold text-primary">
                          {product.price.toLocaleString()} CFA
                        </span>
                        {product.original_price && (
                          <span className="hidden sm:inline text-xs text-muted-foreground line-through">
                            {product.original_price.toLocaleString()} CFA
                          </span>
                        )}
                      </div>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-muted-foreground">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
