import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useStudentListings } from "@/hooks/use-student-listings";
import { getUniversityById } from "@/data/universities";
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
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const categoryIcons: Record<string, React.ElementType> = {
  "Électronique": Laptop,
  "Livres": BookOpen,
  "Gaming": Gamepad2,
  "Vêtements": Shirt,
  "Autres": Package
};

const categories = ["Tous", "Électronique", "Livres", "Gaming", "Vêtements", "Sport", "Mobilier", "Autres"];

export default function StudentExchangePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedType, setSelectedType] = useState<string>("Tous");
  
  const userUniversity = user?.user_metadata?.university_id
    ? getUniversityById(user.user_metadata.university_id)
    : null;

  const { data: listings = [], isLoading } = useStudentListings(userUniversity?.name);

  const filteredListings = listings.filter(listing => {
    const categoryMatch = selectedCategory === "Tous" || listing.category === selectedCategory;
    const typeMatch = selectedType === "Tous" || listing.listing_type === selectedType;
    return categoryMatch && typeMatch;
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "À l'instant";
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}j`;
  };

  const getListingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sale: "Vente",
      exchange: "Échange",
      free: "Gratuit"
    };
    return labels[type] || type;
  };

  const handleCreateListing = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Navigate to create listing page (to be created)
    console.log("Navigate to create listing");
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
        onSupplierAccess={() => navigate("/supplier")}
        onStudentExchange={() => {}}
      />

      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Espace <span className="text-primary">Échange Étudiant</span>
                </h1>
                <p className="text-muted-foreground">
                  Achetez, vendez ou échangez avec d'autres étudiants de votre université
                </p>
              </div>
              <Button onClick={handleCreateListing} size="lg" className="btn-glow">
                <Plus className="w-5 h-5 mr-2" />
                Créer une annonce
              </Button>
            </div>

            {userUniversity && (
              <Badge variant="outline" className="text-sm">
                <MapPin className="w-3 h-3 mr-1" />
                {userUniversity.name}
              </Badge>
            )}
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4" />
                <span className="font-semibold">Type</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Tous", "sale", "exchange", "free"].map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                  >
                    {type === "Tous" ? "Tous" : getListingTypeLabel(type)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4" />
                <span className="font-semibold">Catégorie</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = categoryIcons[category] || Package;
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {category}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement des annonces...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Aucune annonce trouvée</h3>
              <p className="text-muted-foreground mb-4">
                Soyez le premier à publier une annonce !
              </p>
              <Button onClick={handleCreateListing}>
                <Plus className="w-4 h-4 mr-2" />
                Créer une annonce
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => {
                const Icon = categoryIcons[listing.category] || Package;
                const imageUrl = listing.image_urls?.[0] || "/placeholder.svg";
                
                return (
                  <Card 
                    key={listing.id}
                    className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 interactive-scale cursor-pointer"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant={listing.listing_type === "sale" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {getListingTypeLabel(listing.listing_type)}
                            </Badge>
                            {listing.condition && (
                              <Badge variant="outline" className="text-xs">
                                {listing.condition}
                              </Badge>
                            )}
                          </div>
                          
                          <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                            {listing.title}
                          </CardTitle>
                        </div>
                        
                        <div className="text-right text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {getTimeAgo(listing.created_at)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                        <img 
                          src={imageUrl}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {listing.description || "Pas de description"}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-primary text-lg">
                          {listing.price ? `${listing.price} CFA` : listing.listing_type === "exchange" ? "Échange" : "Gratuit"}
                        </span>
                        
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Icon className="w-3 h-3 mr-1" />
                          {listing.category}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        {listing.location && (
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {listing.location}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {listing.views_count}
                          </div>
                          {listing.profiles?.full_name && (
                            <span>{listing.profiles.full_name}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageCircle className="w-3 h-3 mr-2" />
                          Contacter
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Heart className="w-4 h-4" />
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