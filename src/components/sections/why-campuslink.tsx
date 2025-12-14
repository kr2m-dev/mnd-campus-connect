import { Zap, DollarSign, Shield, Package, Users, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "Livraison rapide",
    description: "Recevez vos commandes rapidement directement sur votre campus",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: DollarSign,
    title: "Prix étudiants",
    description: "Des tarifs avantageux adaptés au budget des étudiants",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Shield,
    title: "Paiement sécurisé",
    description: "Transactions 100% sécurisées pour votre tranquillité d'esprit",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Package,
    title: "Large choix",
    description: "Des milliers de produits disponibles pour tous vos besoins",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Users,
    title: "Support communautaire",
    description: "Une équipe dédiée pour vous accompagner à chaque étape",
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    icon: GraduationCap,
    title: "Spécial étudiants",
    description: "Une plateforme pensée par et pour les étudiants",
    gradient: "from-pink-500 to-rose-500"
  }
];

export const WhyCampusLink = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pourquoi choisir CampusLink ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nous offrons bien plus qu'une simple plateforme d'achat. Découvrez tous nos avantages.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 group"
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
