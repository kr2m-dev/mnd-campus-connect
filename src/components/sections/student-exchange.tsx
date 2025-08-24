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
  MapPin
} from "lucide-react";

const exchangeItems = [
  {
    id: "1",
    title: "MacBook Pro 13\" 2021",
    description: "Excellent état, utilisé 6 mois. Parfait pour études informatiques.",
    price: "850 000 CFA",
    type: "Vente",
    category: "Électronique",
    location: "Université de Dakar",
    timeAgo: "2h",
    image: "/placeholder.svg",
    seller: {
      name: "Amadou K.",
      rating: 4.8,
      verified: true
    }
  },
  {
    id: "2",
    title: "Livres de médecine 2ème année",
    description: "Collection complète anatomie + physiologie. Annotations incluses.",
    price: "Échange contre livres droit",
    type: "Échange",
    category: "Livres",
    location: "Université de Lomé",
    timeAgo: "5h",
    image: "/placeholder.svg",
    seller: {
      name: "Fatou D.",
      rating: 5.0,
      verified: true
    }
  },
  {
    id: "3",
    title: "Console PS5 + 3 jeux",
    description: "Comme neuve, achetée il y a 3 mois. Manette supplémentaire incluse.",
    price: "420 000 CFA",
    type: "Vente",
    category: "Gaming",
    location: "Université de Cotonou",
    timeAgo: "1j",
    image: "/placeholder.svg",
    seller: {
      name: "Ibrahim S.",
      rating: 4.9,
      verified: false
    }
  }
];

interface StudentExchangeProps {
  onAccessExchange: () => void;
}

export const StudentExchange = ({ onAccessExchange }: StudentExchangeProps) => {
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
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2.5K+</div>
              <div className="text-xs text-muted-foreground">Annonces actives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">15K+</div>
              <div className="text-xs text-muted-foreground">Étudiants inscrits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">4.9</div>
              <div className="text-xs text-muted-foreground">Note moyenne</div>
            </div>
          </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exchangeItems.map((item, index) => (
              <Card 
                key={item.id} 
                className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 interactive-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={item.type === "Vente" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {item.type}
                        </Badge>
                        {item.seller.verified && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                            Vérifié
                          </Badge>
                        )}
                      </div>
                      
                      <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </CardTitle>
                    </div>
                    
                    <div className="text-right text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.timeAgo}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-primary">
                      {item.price}
                    </span>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      {item.category === "Électronique" && <Laptop className="w-3 h-3 mr-1" />}
                      {item.category === "Livres" && <BookOpen className="w-3 h-3 mr-1" />}
                      {item.category === "Gaming" && <Gamepad2 className="w-3 h-3 mr-1" />}
                      {item.category}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {item.location}
                    </div>
                    
                    <div className="flex items-center">
                      <span className="mr-1">⭐</span>
                      {item.seller.rating} • {item.seller.name}
                    </div>
                  </div>
                  
                  <Button size="sm" variant="outline" className="w-full">
                    <MessageCircle className="w-3 h-3 mr-2" />
                    Contacter
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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