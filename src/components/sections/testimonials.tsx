import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    id: 1,
    name: "Aminata Diallo",
    university: "Université Cheikh Anta Diop",
    avatar: "AD",
    rating: 5,
    comment: "CampusLink a vraiment simplifié ma vie étudiante ! Je peux commander tous mes produits essentiels sans quitter le campus. Le service est rapide et fiable.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    name: "Omar Ndiaye",
    university: "Université Gaston Berger",
    avatar: "ON",
    rating: 5,
    comment: "Les prix sont très abordables pour nous les étudiants. J'apprécie particulièrement la variété des produits et la rapidité de livraison. Je recommande vivement !",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    name: "Fatou Sow",
    university: "UCAD",
    avatar: "FS",
    rating: 5,
    comment: "Une plateforme intuitive et sécurisée. J'ai passé plusieurs commandes et je n'ai jamais été déçue. Le support client est également très réactif.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: 4,
    name: "Mamadou Kane",
    university: "Université Alioune Diop",
    avatar: "MK",
    rating: 5,
    comment: "Enfin une solution adaptée aux étudiants africains ! Les fournisseurs sont locaux, les prix sont justes et la livraison est toujours ponctuelle.",
    gradient: "from-orange-500 to-red-500"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ce que disent nos étudiants
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des milliers d'étudiants font confiance à CampusLink pour leurs achats quotidiens
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="p-6 md:p-8 relative hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <Quote className="w-6 h-6 text-white" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-muted-foreground leading-relaxed mb-6 italic">
                "{testimonial.comment}"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-3">
                <Avatar className={`w-12 h-12 bg-gradient-to-br ${testimonial.gradient}`}>
                  <AvatarFallback className="text-white font-semibold">
                    {testimonial.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.university}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
