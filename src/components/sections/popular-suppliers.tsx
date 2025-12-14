import { Star, Package, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

// Données mockées de fournisseurs populaires
const suppliers = [
  {
    id: "1",
    name: "Campus Food Market",
    category: "Alimentation",
    rating: 4.8,
    totalProducts: 250,
    verified: true,
    image: "🍔"
  },
  {
    id: "2",
    name: "Student Hygiene Store",
    category: "Hygiène",
    rating: 4.9,
    totalProducts: 180,
    verified: true,
    image: "🧴"
  },
  {
    id: "3",
    name: "Campus Papeterie",
    category: "Papeterie",
    rating: 4.7,
    totalProducts: 320,
    verified: true,
    image: "📚"
  },
  {
    id: "4",
    name: "Tech Campus",
    category: "Électronique",
    rating: 4.6,
    totalProducts: 150,
    verified: true,
    image: "💻"
  },
  {
    id: "5",
    name: "Style Campus",
    category: "Mode",
    rating: 4.5,
    totalProducts: 200,
    verified: true,
    image: "👕"
  },
  {
    id: "6",
    name: "Campus Snacks",
    category: "Snacks",
    rating: 4.9,
    totalProducts: 120,
    verified: true,
    image: "🍿"
  }
];

export const PopularSuppliers = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Fournisseurs populaires
            </h2>
            <p className="text-lg text-muted-foreground">
              Découvrez nos fournisseurs de confiance et vérifiés
            </p>
          </div>
          <Button
            onClick={() => navigate("/products")}
            className="bg-gradient-primary hover:bg-green-600"
          >
            Voir tous les fournisseurs
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {suppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 group"
              onClick={() => navigate("/products")}
            >
              {/* Supplier Image/Icon */}
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">
                {supplier.image}
              </div>

              {/* Supplier Info */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h3 className="text-lg font-bold">
                    {supplier.name}
                  </h3>
                  {supplier.verified && (
                    <Badge variant="default" className="bg-blue-500 text-xs">
                      ✓
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {supplier.category}
                </p>

                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{supplier.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    (4.{Math.floor(Math.random() * 9)}k avis)
                  </span>
                </div>

                {/* Products Count */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <span>{supplier.totalProducts} produits</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
