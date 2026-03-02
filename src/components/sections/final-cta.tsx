import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export const FinalCTA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) {
      navigate("/products");
    } else {
      navigate("/register");
    }
  };

  return (
    <section className="py-12 md:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-green-600" />

      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">
              Rejoignez-nous dès aujourd'hui
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            Prêt à simplifier votre vie étudiante ?
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-10 max-w-2xl mx-auto">
            Rejoignez des milliers d'étudiants qui utilisent déjà CampusLink pour leurs achats quotidiens
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button
              onClick={handleCTA}
              className="bg-primary text-white hover:bg-primary/90 text-sm sm:text-lg px-5 sm:px-8 py-3 sm:py-6 h-auto shadow-2xl group w-full sm:w-auto"
            >
              {user ? "Découvrir les produits" : "Créer un compte gratuit"}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            {!user && (
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-sm sm:text-lg px-5 sm:px-8 py-3 sm:py-6 h-auto w-full sm:w-auto"
              >
                J'ai déjà un compte
              </Button>
            )}
          </div>

          {/* Trust indicators */}
          <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-8 text-white/80 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span>Gratuit et sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span>Paiement 100% sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span>Support 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
