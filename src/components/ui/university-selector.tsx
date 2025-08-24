import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Users, GraduationCap } from "lucide-react";

interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  studentsCount: string;
  flag: string;
}

const universities: University[] = [
  {
    id: "dakar",
    name: "Université Cheikh Anta Diop",
    city: "Dakar",
    country: "Sénégal",
    studentsCount: "45K+",
    flag: "🇸🇳"
  },
  {
    id: "lome",
    name: "Université de Lomé",
    city: "Lomé",
    country: "Togo",
    studentsCount: "35K+",
    flag: "🇹🇬"
  },
  {
    id: "cotonou",
    name: "Université d'Abomey-Calavi",
    city: "Cotonou",
    country: "Bénin",
    studentsCount: "40K+",
    flag: "🇧🇯"
  },
  {
    id: "bamako",
    name: "Université de Bamako",
    city: "Bamako",
    country: "Mali",
    studentsCount: "30K+",
    flag: "🇲🇱"
  },
  {
    id: "ouaga",
    name: "Université de Ouagadougou",
    city: "Ouagadougou",
    country: "Burkina Faso",
    studentsCount: "25K+",
    flag: "🇧🇫"
  },
  {
    id: "abidjan",
    name: "Université Félix Houphouët-Boigny",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    studentsCount: "50K+",
    flag: "🇨🇮"
  }
];

interface UniversitySelectorProps {
  isOpen: boolean;
  onUniversitySelect: (university: University) => void;
}

export const UniversitySelector = ({ isOpen, onUniversitySelect }: UniversitySelectorProps) => {
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);

  const handleSelect = (university: University) => {
    setSelectedUniversity(university);
    onUniversitySelect(university);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Choisissez votre université
          </DialogTitle>
          <p className="text-muted-foreground mt-2">
            Sélectionnez votre campus pour accéder aux produits disponibles dans votre région
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {universities.map((university) => (
            <div
              key={university.id}
              className="group cursor-pointer"
              onClick={() => handleSelect(university)}
            >
              <div className="card-gradient p-6 rounded-xl shadow-card hover:shadow-elegant transition-all duration-300 interactive-scale border border-border hover:border-primary/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{university.flag}</div>
                  <div className="flex items-center text-accent text-sm font-medium">
                    <Users className="w-4 h-4 mr-1" />
                    {university.studentsCount}
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {university.name}
                </h3>
                
                <div className="flex items-center text-muted-foreground text-sm mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {university.city}, {university.country}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Accéder au campus
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Votre université n'est pas listée ? <span className="text-primary cursor-pointer hover:underline">Contactez-nous</span></p>
        </div>
      </DialogContent>
    </Dialog>
  );
};