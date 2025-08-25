import { useState } from "react";
import { Header } from "@/components/layout/header";
import { HeroSection } from "@/components/sections/hero-section";
import { ProductsShowcase } from "@/components/sections/products-showcase";
import { StudentExchange } from "@/components/sections/student-exchange";
import { Footer } from "@/components/layout/footer";
import { UniversitySelector } from "@/components/ui/university-selector";

interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
}

const Index = () => {
  const [isUniversitySelectorOpen, setIsUniversitySelectorOpen] = useState(true);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [showStudentExchange, setShowStudentExchange] = useState(false);
  const [showSupplierAccess, setShowSupplierAccess] = useState(false);

  const handleUniversitySelect = (university: University) => {
    setSelectedUniversity(university);
    setIsUniversitySelectorOpen(false);
  };

  const handleUniversityChange = () => {
    setIsUniversitySelectorOpen(true);
  };

  const handleStudentExchange = () => {
    if (!selectedUniversity) {
      setIsUniversitySelectorOpen(true);
      return;
    }
    setShowStudentExchange(true);
    // In a real app, this would navigate to the student exchange page
    console.log("Navigate to student exchange");
  };

  const handleSupplierAccess = () => {
    setShowSupplierAccess(true);
    // In a real app, this would navigate to the supplier login/register page
    console.log("Navigate to supplier access");
  };

  const handleSelectUniversity = () => {
    setIsUniversitySelectorOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        selectedUniversity={selectedUniversity}
        onUniversityChange={handleUniversityChange}
        onSupplierAccess={handleSupplierAccess}
        onStudentExchange={handleStudentExchange}
      />
      
      <main>
        <HeroSection 
          onSelectUniversity={handleSelectUniversity}
          onSupplierAccess={handleSupplierAccess}
        />
        
        {selectedUniversity && (
          <>
            <ProductsShowcase selectedUniversity={selectedUniversity.name} />
            <StudentExchange onAccessExchange={handleStudentExchange} />
          </>
        )}
      </main>
      
      <Footer />
      
      <UniversitySelector 
        isOpen={isUniversitySelectorOpen}
        onUniversitySelect={handleUniversitySelect}
      />
    </div>
  );
};

export default Index;
