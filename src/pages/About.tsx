import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  Eye,
  Heart,
  Users,
  Rocket,
  Shield,
  TrendingUp,
  Globe
} from "lucide-react";

export default function About() {
  const handleUniversityChange = () => {};

  return (
    <div className="min-h-screen bg-background">
      <Header onUniversityChange={handleUniversityChange} />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Heart className="w-3 h-3 mr-1" />
            À propos de nous
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Bienvenue sur{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              CampusLink
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            La plateforme e-commerce dédiée aux étudiants universitaires d'Afrique francophone.
            Nous facilitons l'accès aux produits essentiels et favorisons les échanges entre étudiants,
            directement sur votre campus.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="shadow-card hover:shadow-elegant transition-all">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Notre Mission</h2>
              <p className="text-muted-foreground">
                Rendre la vie étudiante plus simple et économique en proposant une marketplace
                sécurisée où les étudiants peuvent accéder à des produits essentiels d'hygiène,
                de soins et de parfums, tout en favorisant les échanges au sein de la communauté
                universitaire.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-all">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Notre Vision</h2>
              <p className="text-muted-foreground">
                Devenir la plateforme de référence pour tous les besoins quotidiens des étudiants
                en Afrique francophone, en créant un écosystème qui connecte étudiants, fournisseurs
                locaux et universités pour une expérience d'achat optimale.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nos Valeurs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Les principes qui guident notre action au quotidien
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 shadow-card hover:shadow-elegant transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Communauté</h3>
              <p className="text-sm text-muted-foreground">
                Créer des liens entre étudiants et favoriser l'entraide
              </p>
            </Card>

            <Card className="text-center p-6 shadow-card hover:shadow-elegant transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Sécurité</h3>
              <p className="text-sm text-muted-foreground">
                Garantir des transactions sûres et protéger vos données
              </p>
            </Card>

            <Card className="text-center p-6 shadow-card hover:shadow-elegant transition-all">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Accessibilité</h3>
              <p className="text-sm text-muted-foreground">
                Rendre les produits essentiels accessibles à tous
              </p>
            </Card>

            <Card className="text-center p-6 shadow-card hover:shadow-elegant transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Innovation</h3>
              <p className="text-sm text-muted-foreground">
                Améliorer constamment l'expérience utilisateur
              </p>
            </Card>
          </div>
        </div>

        {/* Story */}
        <Card className="shadow-card mb-16">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold">Notre Histoire</h2>
            </div>

            <div className="space-y-4 text-muted-foreground">
              <p>
                CampusLink est né d'un constat simple : les étudiants universitaires en Afrique francophone
                rencontrent souvent des difficultés pour accéder à des produits essentiels de qualité à des
                prix abordables, directement sur leur campus.
              </p>

              <p>
                Fondée en 2024, notre plateforme connecte les étudiants avec des fournisseurs locaux de confiance,
                tout en créant un espace d'échange entre étudiants pour acheter, vendre ou échanger des produits.
              </p>

              <p>
                Aujourd'hui, nous sommes présents dans plusieurs universités à travers l'Afrique francophone et
                continuons d'élargir notre réseau pour servir toujours plus d'étudiants.
              </p>

              <p className="font-semibold text-foreground">
                Notre ambition : devenir le partenaire incontournable de la vie étudiante en Afrique.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">6+</div>
            <div className="text-sm text-muted-foreground">Universités partenaires</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">1000+</div>
            <div className="text-sm text-muted-foreground">Produits disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-accent mb-2">5000+</div>
            <div className="text-sm text-muted-foreground">Étudiants inscrits</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <div className="text-sm text-muted-foreground">Satisfaction client</div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
