import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/logo_cc.png"
                alt="CampusLink"
                className="h-8 w-auto"
              />
              <div>
                <h3 className="font-bold text-lg">CampusLink</h3>
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
                <button
                  onClick={() => navigate("/")}
                  className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors text-left"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/products")}
                  className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors text-left"
                >
                  Produits
                </button>
              </li>
              <li>
                <button
                  onClick={() => {}}
                  className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors text-left"
                >
                  Espace Échange
                </button>
              </li>
              <li>
                <button
                  onClick={() => {}}
                  className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors text-left"
                >
                  À propos
                </button>
              </li>
              <li>
                <button
                  onClick={() => {}}
                  className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors text-left"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/supplier")}
                  className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors text-left"
                >
                  Espace Fournisseur
                </button>
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
                <Button
                  size="sm"
                  variant="outline"
                  className="group border-secondary-foreground/20 hover:bg-primary hover:border-primary text-primary hover:text-white"
                >
                  <Facebook className="w-4 h-4 text-current" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="group border-secondary-foreground/20 hover:bg-primary hover:border-primary text-primary hover:text-white"
                >
                  <Instagram className="w-4 h-4 text-current" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="group border-secondary-foreground/20 hover:bg-primary hover:border-primary text-primary hover:text-white"
                >
                  <Twitter className="w-4 h-4 text-current" />
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
            © 2024 CampusLink. Tous droits réservés.
          </div>

          <div className="flex space-x-6 mt-4 md:mt-0">
            <button
              onClick={() => navigate("/privacy-policy")}
              className="hover:text-secondary-foreground transition-colors"
            >
              Politique de confidentialité
            </button>
            <button
              onClick={() => navigate("/terms-of-service")}
              className="hover:text-secondary-foreground transition-colors"
            >
              Conditions d'utilisation
            </button>
            <button
              onClick={() => navigate("/legal-notice")}
              className="hover:text-secondary-foreground transition-colors"
            >
              Mentions légales
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};