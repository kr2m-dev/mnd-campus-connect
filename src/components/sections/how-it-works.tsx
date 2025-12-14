import { MapPin, ShoppingCart, Package } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Choisissez votre université",
    description: "Sélectionnez votre campus pour découvrir les produits et services disponibles dans votre zone.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    number: "02",
    icon: ShoppingCart,
    title: "Parcourez les produits",
    description: "Explorez notre large gamme de produits : alimentation, hygiène, papeterie et bien plus encore.",
    color: "from-purple-500 to-pink-500"
  },
  {
    number: "03",
    icon: Package,
    title: "Commandez et recevez",
    description: "Passez commande en quelques clics et recevez vos produits directement sur votre campus.",
    color: "from-green-500 to-emerald-500"
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Commander sur CampusLink est simple et rapide. Suivez ces 3 étapes faciles.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/20 to-primary/5 z-0" />
                )}

                <Card className="relative p-6 md:p-8 text-center hover:shadow-lg transition-all duration-300 bg-background border-2 hover:border-primary/50 z-10">
                  {/* Number Badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} p-4 shadow-lg`}>
                    <Icon className="w-full h-full text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
