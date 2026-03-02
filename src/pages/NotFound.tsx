import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, ShoppingBag, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    logger.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div
        className="flex items-center space-x-2 mb-10 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img
          src="/logo_cc.png"
          alt="CampusLink"
          className="h-10 w-10 rounded-full object-cover"
        />
        <span className="font-bold text-xl">CampusLink</span>
      </div>

      {/* 404 number */}
      <div className="relative mb-6">
        <span className="text-[8rem] sm:text-[12rem] font-extrabold text-primary/10 leading-none select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl sm:text-7xl font-extrabold text-primary leading-none">
            404
          </span>
        </div>
      </div>

      {/* Message */}
      <h1 className="text-xl sm:text-3xl font-bold mb-3 text-center">
        Page introuvable
      </h1>
      <p className="text-muted-foreground text-sm sm:text-base text-center max-w-md mb-2">
        Oops ! La page{" "}
        <span className="font-mono text-xs sm:text-sm bg-muted px-2 py-0.5 rounded text-foreground">
          {location.pathname}
        </span>{" "}
        n'existe pas.
      </p>
      <p className="text-muted-foreground text-sm text-center max-w-sm mb-10">
        Elle a peut-être été déplacée, supprimée, ou l'adresse est incorrecte.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>

        <Button
          onClick={() => navigate("/")}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Home className="w-4 h-4" />
          Accueil
        </Button>

        <Button
          onClick={() => navigate("/products")}
          variant="outline"
          className="gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Produits
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
