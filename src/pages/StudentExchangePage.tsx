import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useStudentListings } from "@/hooks/use-student-listings";
import { useCategories } from "@/hooks/use-categories";
import { getUniversityById } from "@/data/universities";
import { Input } from "@/components/ui/input";
import {
  ListingType,
  ItemCondition,
  ListingTypeLabels,
  ItemConditionLabels,
  ListingTypes,
  StudentListingFilters
} from "@/lib/database-types";
import {
  Plus,
  MessageCircle,
  Clock,
  MapPin,
  Eye,
  Laptop,
  BookOpen,
  Gamepad2,
  Shirt,
  Package,
  Heart,
  Filter,
  Search,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const categoryIcons: Record<string, React.ElementType> = {
  "Électronique": Laptop,
  "Livres": BookOpen,
  "Gaming": Gamepad2,
  "Vêtements": Shirt,
  "Autres": Package
};

export default function StudentExchangePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<ListingType | "Tous">("Tous");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  const userUniversity = user?.user_metadata?.university_id
    ? getUniversityById(user.user_metadata.university_id)
    : null;

  const { data: categories = [] } = useCategories();

  // Build filters object using the enhanced types
  const filters: StudentListingFilters = {
    university: userUniversity?.name,
    listing_type: selectedType !== "Tous" ? selectedType : undefined,
    category_id: selectedCategory !== "Tous" ? selectedCategory : undefined,
    search: searchQuery || undefined,
    is_active: true,
    is_sold: false,
  };

  const { data: listings = [], isLoading } = useStudentListings(filters);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "À l'instant";
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}j`;
  };

  const handleCreateListing = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/student-exchange/create");
  };

  const handleViewListing = (listingId: string) => {
    navigate(`/student-exchange/${listingId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        selectedUniversity={userUniversity ? {
          name: userUniversity.name,
          city: userUniversity.city,
          country: userUniversity.country,
          flag: userUniversity.flag
        } : null}
        onUniversityChange={() => navigate("/profile")}
      />

      <main className="py-8 pt-24 min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          {/* Header avec design amélioré */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">
                      Espace <span className="bg-gradient-primary bg-clip-text text-transparent">Échange Étudiant</span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Achetez, vendez ou échangez avec d'autres étudiants
                    </p>
                  </div>
                </div>
                {userUniversity && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm font-medium">
                      <MapPin className="w-3 h-3 mr-1" />
                      {userUniversity.name}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {listings.length} annonce{listings.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </div>
              <Button
                onClick={handleCreateListing}
                size="lg"
                className="btn-glow shadow-lg hover:shadow-xl transition-all w-full md:w-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer une annonce
              </Button>
            </div>
          </div>

          {/* Filters avec design moderne */}
          <Card className="mb-8 shadow-card">
            <CardContent className="p-6 space-y-6">
              {/* Search avec icône */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher des annonces par titre ou description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base shadow-sm"
                />
              </div>

              {/* Type Filter avec design amélioré */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Type d'annonce</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedType === "Tous" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("Tous")}
                    className="interactive-scale"
                  >
                    Tous
                  </Button>
                  {ListingTypes.map((type) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedType(type)}
                      className="interactive-scale"
                    >
                      {ListingTypeLabels[type]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filter avec icônes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Catégorie</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "Tous" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("Tous")}
                    className="interactive-scale"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Toutes
                  </Button>
                  {categories.map((category) => {
                    const Icon = categoryIcons[category.name] || Package;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="interactive-scale"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {category.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listings Grid avec animations */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Chargement des annonces...</p>
            </div>
          ) : listings.length === 0 ? (
            <Card className="text-center py-20 shadow-card">
              <CardContent>
                <div className="max-w-md mx-auto space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
                    <Package className="w-24 h-24 mx-auto text-primary/20 relative" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Aucune annonce trouvée</h3>
                    <p className="text-muted-foreground text-lg">
                      {searchQuery || selectedType !== "Tous" || selectedCategory !== "Tous"
                        ? "Essayez de modifier vos filtres"
                        : "Soyez le premier à publier une annonce !"}
                    </p>
                  </div>
                  <Button onClick={handleCreateListing} size="lg" className="btn-glow">
                    <Plus className="w-5 h-5 mr-2" />
                    Créer une annonce
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => {
                const Icon = categoryIcons[listing.categories?.name || "Autres"] || Package;
                const imageUrl = listing.image_urls?.[0] || "/placeholder.svg";
                
                return (
                  <Card
                    key={listing.id}
                    className="group overflow-hidden shadow-card hover:shadow-2xl transition-all duration-500 interactive-scale cursor-pointer border-2 border-transparent hover:border-primary/20"
                    onClick={() => handleViewListing(listing.id)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Image en premier pour un meilleur impact visuel */}
                    <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      {/* Badges overlay sur l'image */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <Badge
                          variant={listing.listing_type === "sale" ? "default" : "secondary"}
                          className="text-xs font-semibold shadow-lg backdrop-blur-sm"
                        >
                          {ListingTypeLabels[listing.listing_type]}
                        </Badge>
                        {listing.condition && (
                          <Badge variant="outline" className="text-xs bg-background/90 backdrop-blur-sm">
                            {ItemConditionLabels[listing.condition]}
                          </Badge>
                        )}
                      </div>

                      {/* Badge temps */}
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="text-xs bg-background/90 backdrop-blur-sm">
                          <Clock className="w-3 h-3 mr-1" />
                          {getTimeAgo(listing.created_at)}
                        </Badge>
                      </div>

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <CardContent className="p-4">.
                      {/* Titre */}
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem]">
                        {listing.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                        {listing.description || "Aucune description disponible"}
                      </p>

                      {/* Séparateur */}
                      <div className="h-px bg-border mb-4" />

                      {/* Prix et Catégorie */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Prix</p>
                          <span className="font-bold text-primary text-xl">
                            {listing.price ? `${listing.price} CFA` : listing.listing_type === "exchange" ? "Échange" : "Gratuit"}
                          </span>
                        </div>

                        {listing.categories && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground mb-1">Catégorie</p>
                            <div className="flex items-center text-sm font-medium">
                              <Icon className="w-4 h-4 mr-1 text-primary" />
                              {listing.categories.name}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Infos supplémentaires */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 pb-4 border-b">
                        <div className="flex items-center gap-3">
                          {listing.location && (
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span className="truncate max-w-[100px]">{listing.location}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {listing.views_count}
                          </div>
                        </div>
                        {listing.profiles?.full_name && (
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            <span className="truncate max-w-[100px]">{listing.profiles.full_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement contact
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contacter
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:text-red-500 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement favorite
                          }}
                        >
                          <Heart className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}