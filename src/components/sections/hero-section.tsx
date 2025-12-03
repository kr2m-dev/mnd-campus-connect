import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Users,
  Truck,
  Shield,
  Star,
  ArrowRight,
  Store,
  Heart,
  GraduationCap,
  Handshake
} from "lucide-react";
import heroImage from "@/assets/hero-students.jpg";
import type { User } from "@supabase/supabase-js";
import type { University } from "@/data/universities";

interface HeroSectionProps {
  onSelectUniversity: () => void;
  onSupplierAccess: () => void;
  user?: User | null;
  userUniversity?: University | null;
}

export const HeroSection = ({ onSelectUniversity, onSupplierAccess, user, userUniversity }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Étudiants africains utilisant la plateforme CampusLink"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/60 to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-2xl">
          {/* Badge */}
          <Badge
            variant="secondary"
            className="mb-6 bg-primary/10 text-primary border-primary/20 fade-in"
          >
            <Star className="w-3 h-3 mr-1" />
            {user ? `Bienvenue sur ${userUniversity?.name || 'votre campus'}` : 'Plateforme #1 pour étudiants'}
          </Badge>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary-foreground slide-up">
            {user ? (
              <>
                Bonjour {user.user_metadata?.first_name || 'étudiant'} !
                <span className="block bg-gradient-primary bg-clip-text text-transparent">
                  Découvrez vos produits
                </span>
              </>
            ) : (
              <>
                Vos produits essentiels
                <span className="block bg-gradient-primary bg-clip-text text-transparent">
                  livrés sur campus
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 slide-up" style={{animationDelay: '0.2s'}}>
            {user && userUniversity ? (
              <>
                Explorez notre sélection de produits d'hygiène, soins et parfums
                disponibles sur le campus de <span className="font-semibold">{userUniversity.name}</span>.
              </>
            ) : (
              <>
                Hygiène, soins, parfums... Tout ce dont vous avez besoin pour votre vie étudiante,
                disponible directement sur votre campus universitaire.
              </>
            )}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 bounce-in" style={{animationDelay: '0.4s'}}>
            {user ? (
              /* Buttons for authenticated users */
              <>
                <Button
                  size="lg"
                  onClick={() => document.querySelector('.products-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-primary hover:bg-primary-dark text-primary-foreground btn-glow group"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Voir les produits
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={onSelectUniversity}
                  className="bg-white border-primary/20 text-primary hover:bg-primary/10 hover:border-primary group shadow-md"
                >
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Mon Profil
                </Button>
              </>
            ) : (
              /* Buttons for anonymous users */
              <>
                <Button
                  size="lg"
                  onClick={onSelectUniversity}
                  className="bg-primary hover:bg-primary-dark text-primary-foreground btn-glow group"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Choisir mon université
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  size="lg"
                  onClick={() => window.location.href = '/supplier'}
                  className="bg-primary hover:bg-primary-dark text-primary-foreground btn-glow group"
                >
                  <Store className="w-5 h-5 mr-2" />
                  Devenir Fournisseur
                </Button>
              </>
            )}
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 fade-in" style={{animationDelay: '0.6s'}}>
            <div className="flex items-center space-x-2 text-primary-foreground/80">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">Livraison campus</span>
            </div>
            
            <div className="flex items-center space-x-2 text-primary-foreground/80">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">Paiement sécurisé</span>
            </div>
            
            <div className="flex items-center space-x-2 text-primary-foreground/80">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">Entre étudiants</span>
            </div>
            
            <div className="flex items-center space-x-2 text-primary-foreground/80">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Handshake className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">Entre étudiants et fournisseurs</span>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="absolute bottom-8 right-8 hidden lg:block">
          <div className="bg-background/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/20">
            <div className="grid grid-cols-2 gap-4 text-center text-primary-foreground">
              <div>
                <div className="text-2xl font-bold">6</div>
                <div className="text-xs opacity-80">Universités</div>
              </div>
              <div>
                <div className="text-2xl font-bold">225K+</div>
                <div className="text-xs opacity-80">Étudiants</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};