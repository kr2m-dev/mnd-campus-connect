import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin,
  Send,
  Shield,
  Truck,
  Users,
  Heart
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">MND</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">MND.Produits</h3>
                <p className="text-xs text-secondary-foreground/70">Campus Connect</p>
              </div>
            </div>
            
            <p className="text-sm text-secondary-foreground/80 mb-6">
              La plateforme e-commerce dédiée aux étudiants universitaires d'Afrique francophone. 
              Produits essentiels et échanges entre étudiants, directement sur votre campus.
            </p>
            
            {/* Newsletter */}
            <div>
              <h4 className="font-semibold mb-3">Newsletter</h4>
              <div className="flex gap-2">
                <Input 
                  placeholder="Votre email" 
                  className="bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/60"
                />
                <Button size="sm" className="bg-primary hover:bg-primary-dark">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Produits
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Espace Échange
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  À propos
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Espace Fournisseur
                </a>
              </li>
            </ul>
          </div>
          
          {/* Universities */}
          <div>
            <h4 className="font-semibold mb-4">Universités partenaires</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  🇸🇳 Université de Dakar
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  🇹🇬 Université de Lomé
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  🇧🇯 Université de Cotonou
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  🇲🇱 Université de Bamako
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  🇧🇫 Université de Ouagadougou
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  🇨🇮 Université d'Abidjan
                </a>
              </li>
            </ul>
            
            <div className="mt-4">
              <a href="#" className="text-primary hover:text-primary-glow text-sm transition-colors">
                + Ajouter votre université
              </a>
            </div>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-secondary-foreground/80">contact@mndproduits.com</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-secondary-foreground/80">+221 77 123 45 67</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-secondary-foreground/80">Dakar, Sénégal</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="mt-6">
              <h5 className="font-medium mb-3">Suivez-nous</h5>
              <div className="flex space-x-3">
                <Button size="sm" variant="outline" className="border-secondary-foreground/20 hover:bg-primary hover:border-primary">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-secondary-foreground/20 hover:bg-primary hover:border-primary">
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-secondary-foreground/20 hover:bg-primary hover:border-primary">
                  <Twitter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Banner */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4 text-primary" />
              </div>
              <span className="text-secondary-foreground/80">Livraison campus</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="text-secondary-foreground/80">Paiement sécurisé</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <span className="text-secondary-foreground/80">Communauté</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary" />
              </div>
              <span className="text-secondary-foreground/80">Support 24/7</span>
            </div>
          </div>
        </div>
      </div>
      
      <Separator className="bg-secondary-foreground/20" />
      
      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-secondary-foreground/60">
          <div>
            © 2024 MND.Produits. Tous droits réservés.
          </div>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-secondary-foreground transition-colors">
              Politique de confidentialité
            </a>
            <a href="#" className="hover:text-secondary-foreground transition-colors">
              Conditions d'utilisation
            </a>
            <a href="#" className="hover:text-secondary-foreground transition-colors">
              Mentions légales
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};