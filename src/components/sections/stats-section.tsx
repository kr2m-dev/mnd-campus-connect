import { useEffect, useState, useRef } from "react";
import { Building2, Users, Package, ShoppingBag } from "lucide-react";

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  label: string;
  suffix?: string;
  gradient: string;
}

const StatItem = ({ icon: Icon, value, label, suffix = "", gradient }: StatItemProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setCount(Math.floor(increment * currentStep));
      } else {
        setCount(value);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div ref={elementRef} className="text-center">
      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${gradient} p-3.5 shadow-lg`}>
        <Icon className="w-full h-full text-white" />
      </div>
      <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-muted-foreground font-medium">
        {label}
      </div>
    </div>
  );
};

const stats = [
  {
    icon: Building2,
    value: 50,
    label: "Universités partenaires",
    suffix: "+",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Users,
    value: 15000,
    label: "Étudiants actifs",
    suffix: "+",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Package,
    value: 5000,
    label: "Produits disponibles",
    suffix: "+",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: ShoppingBag,
    value: 25000,
    label: "Commandes livrées",
    suffix: "+",
    gradient: "from-orange-500 to-red-500"
  }
];

export const StatsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            CampusLink en chiffres
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Rejoignez des milliers d'étudiants qui font confiance à CampusLink
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <StatItem key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};
