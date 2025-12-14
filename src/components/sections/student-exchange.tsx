import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ArrowRight,
  MessageCircle,
  Shield,
  TrendingUp,
  BookOpen,
  Laptop,
  Gamepad2,
  Clock,
  MapPin,
  Eye
} from "lucide-react";
import { useStudentListings } from "@/hooks/use-student-listings";
import { usePlatformStats } from "@/hooks/use-stats";

interface StudentExchangeProps {
  onAccessExchange: () => void;
  selectedUniversity?: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  "Électronique": Laptop,
  "Livres": BookOpen,
  "Gaming": Gamepad2
};

export const StudentExchange = ({ onAccessExchange, selectedUniversity }: StudentExchangeProps) => {
  const { data: listings = [], isLoading } = useStudentListings(selectedUniversity ? { university: selectedUniversity } : undefined);
  const { data: stats } = usePlatformStats();

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${Math.floor(num / 1000)}${num % 1000 >= 500 ? '.5' : ''}K+`;
    }
    return num.toString();
  };

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

  // Show only first 3 listings
  const displayedListings = listings.slice(0, 3);

  return (
    <section className="py-16 config-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-accent/10 text-accent border-accent/20">
            <Users className="w-3 h-3 mr-1" />
            Communauté étudiante
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Espace{" "}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Échange Étudiant
            </span>
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Vendez, achetez ou échangez vos produits directement avec d'autres étudiants 
            de votre université. Sécurisé, pratique et économique.
          </p>
          
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{formatNumber(stats.activeListingsCount)}</div>
                <div className="text-xs text-muted-foreground">Annonces actives</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{formatNumber(stats.studentsCount)}</div>
                <div className="text-xs text-muted-foreground">Étudiants inscrits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.averageRating}</div>
                <div className="text-xs text-muted-foreground">Note moyenne</div>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6 shadow-card hover:shadow-elegant transition-all interactive-scale">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Sécurisé</h3>
            <p className="text-sm text-muted-foreground">
              Vérification d'identité et système de notation pour des échanges en toute confiance.
            </p>
          </Card>
          
          <Card className="text-center p-6 shadow-card hover:shadow-elegant transition-all interactive-scale">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Communication</h3>
            <p className="text-sm text-muted-foreground">
              Chat intégré pour négocier et organiser vos rencontres sur le campus.
            </p>
          </Card>
          
          <Card className="text-center p-6 shadow-card hover:shadow-elegant transition-all interactive-scale">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Économique</h3>
            <p className="text-sm text-muted-foreground">
              Prix étudiants et possibilité d'échanges pour économiser sur vos achats.
            </p>
          </Card>
        </div>

        {/* Recent Exchange Items */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-6 text-center">Annonces récentes</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Chargement des annonces...</p>
            </div>
          ) : displayedListings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune annonce disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayedListings.map((listing, index) => {
                const Icon = categoryIcons[listing.categories?.name || "Autres"] || Laptop;
                const imageUrl = listing.image_urls?.[0] || "/placeholder.svg";
                
                return (
                  <Card 
                    key={listing.id}
                    className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 interactive-scale"
                    style={{ animationDelay: `${index * 0.1}s` }}
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
                              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
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
                        <span className="font-semibold text-primary">
                          {listing.price ? `${listing.price} CFA` : listing.listing_type === "exchange" ? "Échange" : "Gratuit"}
                        </span>
                        
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Icon className="w-3 h-3 mr-1" />
                          {listing.categories?.name || "Autre"}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        {listing.location && (
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {listing.location}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Eye className="w-3 h-3" />
                          <span>{listing.views_count}</span>
                          {listing.profiles?.full_name && (
                            <span>• {listing.profiles.full_name}</span>
                          )}
                        </div>
                      </div>
                      
                      <Button size="sm" variant="outline" className="w-full">
                        <MessageCircle className="w-3 h-3 mr-2" />
                        Contacter
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={onAccessExchange}
            className="bg-accent hover:bg-accent-glow btn-glow group"
          >
            <Users className="w-5 h-5 mr-2" />
            Accéder à l'Espace Échange
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            Inscription gratuite • Réservé aux étudiants universitaires
          </p>
        </div>
      </div>
    </section>
  );
};