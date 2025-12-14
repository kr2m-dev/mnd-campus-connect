import { Building2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

// Universités partenaires avec leurs drapeaux
const universities = [
  { flag: "🇸🇳", name: "UCAD", city: "Dakar, Sénégal" },
  { flag: "🇸🇳", name: "UGB", city: "Saint-Louis, Sénégal" },
  { flag: "🇸🇳", name: "UAD", city: "Bambey, Sénégal" },
  { flag: "🇨🇮", name: "Université Félix Houphouët-Boigny", city: "Abidjan, Côte d'Ivoire" },
  { flag: "🇨🇮", name: "INPHB", city: "Yamoussoukro, Côte d'Ivoire" },
  { flag: "🇧🇯", name: "UAC", city: "Cotonou, Bénin" },
  { flag: "🇹🇬", name: "Université de Lomé", city: "Lomé, Togo" },
  { flag: "🇲🇱", name: "Université de Bamako", city: "Bamako, Mali" },
  { flag: "🇧🇫", name: "Université Ouaga I", city: "Ouagadougou, Burkina Faso" },
  { flag: "🇳🇪", name: "UAM", city: "Niamey, Niger" },
  { flag: "🇬🇳", name: "Université Gamal Abdel Nasser", city: "Conakry, Guinée" },
  { flag: "🇲🇷", name: "Université de Nouakchott", city: "Nouakchott, Mauritanie" }
];

export const PartnerUniversities = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Notre réseau
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Universités partenaires
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Présents dans plus de 50 universités à travers l'Afrique de l'Ouest
          </p>
        </div>

        {/* Universities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 max-w-6xl mx-auto">
          {universities.map((university, index) => (
            <Card
              key={index}
              className="p-4 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group"
            >
              <div className="text-center">
                {/* Flag */}
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {university.flag}
                </div>

                {/* University Name */}
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                  {university.name}
                </h3>

                {/* Location */}
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{university.city}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Votre université n'est pas encore partenaire ?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            Contactez-nous pour devenir partenaire
            <Building2 className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
