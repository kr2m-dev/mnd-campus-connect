import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { HeroSection } from "@/components/sections/hero-section";
import { ProductsShowcase } from "@/components/sections/products-showcase";
import { StudentExchange } from "@/components/sections/student-exchange";
import { Footer } from "@/components/layout/footer";
import { UniversitySelector } from "@/components/ui/university-selector";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentSupplier } from "@/hooks/use-supplier";
import { getUniversityById } from "@/data/universities";

interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: supplier, isLoading: supplierLoading } = useCurrentSupplier();
  const [isUniversitySelectorOpen, setIsUniversitySelectorOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [showStudentExchange, setShowStudentExchange] = useState(false);
  const [showSupplierAccess, setShowSupplierAccess] = useState(false);

  // For logged-in users, get their university from user metadata
  const userUniversity = user?.user_metadata?.university_id
    ? getUniversityById(user.user_metadata.university_id)
    : null;

  // Redirection automatique pour les fournisseurs
  useEffect(() => {
    if (!loading && !supplierLoading && supplier) {
      navigate("/supplier", { replace: true });
    }
  }, [supplier, loading, supplierLoading, navigate]);

  // Set up initial state based on authentication
  useEffect(() => {
    if (!loading) {
      if (user && userUniversity) {
        // User is logged in - use their university
        setSelectedUniversity({
          id: userUniversity.id,
          name: userUniversity.name,
          city: userUniversity.city,
          country: userUniversity.country,
          flag: userUniversity.flag
        });
        setIsUniversitySelectorOpen(false);
      } else if (!user) {
        // User is not logged in - show university selector by default
        setIsUniversitySelectorOpen(true);
        setSelectedUniversity(null);
      }
    }
  }, [user, userUniversity, loading]);

  // Afficher un loader pendant la vérification ou si c'est un fournisseur
  if (loading || supplierLoading || supplier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const handleUniversitySelect = (university: University) => {
    setSelectedUniversity(university);
    setIsUniversitySelectorOpen(false);
  };

  const handleUniversityChange = () => {
    // For authenticated users, redirect to profile to change university
    if (user) {
      window.location.href = '/profile';
    } else {
      // For anonymous users, show university selector
      setIsUniversitySelectorOpen(true);
    }
  };

  const handleStudentExchange = () => {
    if (!selectedUniversity && !user) {
      setIsUniversitySelectorOpen(true);
      return;
    }
    window.location.href = '/student-exchange';
  };

  const handleSupplierAccess = () => {
    setShowSupplierAccess(true);
    // In a real app, this would navigate to the supplier login/register page
    console.log("Navigate to supplier access");
  };

  const handleSelectUniversity = () => {
    // For authenticated users, redirect to profile
    if (user) {
      window.location.href = '/profile';
    } else {
      // For anonymous users, show university selector
      setIsUniversitySelectorOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        selectedUniversity={selectedUniversity}
        onUniversityChange={handleUniversityChange}
      />
      
      <main>
        <HeroSection
          onSelectUniversity={handleSelectUniversity}
          onSupplierAccess={handleSupplierAccess}
          user={user}
          userUniversity={userUniversity}
        />

        {/* Show products and services based on user state */}
        {user && userUniversity ? (
          /* Authenticated user - show their university products */
          <>
            <ProductsShowcase selectedUniversity={userUniversity.name} />
            <StudentExchange 
              onAccessExchange={handleStudentExchange} 
              selectedUniversity={userUniversity.name}
            />
          </>
        ) : selectedUniversity ? (
          /* Anonymous user with selected university */
          <>
            <ProductsShowcase selectedUniversity={selectedUniversity.name} />
            <StudentExchange 
              onAccessExchange={handleStudentExchange}
              selectedUniversity={selectedUniversity.name}
            />
          </>
        ) : !loading && !user ? (
          /* Anonymous user without university selection - encourage selection */
          <div className="py-16 text-center">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-4">Choisissez votre université</h2>
              <p className="text-muted-foreground mb-8">
                Sélectionnez votre campus pour découvrir les produits disponibles
              </p>
            </div>
          </div>
        ) : null}
      </main>
      
      <Footer />
      
      {/* Only show university selector for anonymous users */}
      {!user && (
        <UniversitySelector
          isOpen={isUniversitySelectorOpen}
          onUniversitySelect={handleUniversitySelect}
          onClose={() => setIsUniversitySelectorOpen(false)}
        />
      )}
    </div>
  );
};

export default Index;
