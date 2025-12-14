import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorks } from "@/components/sections/how-it-works";
import { ProductsShowcase } from "@/components/sections/products-showcase";
import { WhyCampusLink } from "@/components/sections/why-campuslink";
import { StatsSection } from "@/components/sections/stats-section";
import { StudentExchange } from "@/components/sections/student-exchange";
import { PopularSuppliers } from "@/components/sections/popular-suppliers";
import { Testimonials } from "@/components/sections/testimonials";
import { MobileApp } from "@/components/sections/mobile-app";
import { PartnerUniversities } from "@/components/sections/partner-universities";
import { FinalCTA } from "@/components/sections/final-cta";
import { Footer } from "@/components/layout/footer";
import { UniversitySelector } from "@/components/ui/university-selector";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentSupplier } from "@/hooks/use-supplier";
import { getUniversityById } from "@/data/universities";
import { logger } from "@/lib/logger";

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
    logger.log("Navigate to supplier access");
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
        {/* 1. Hero Section */}
        <HeroSection
          onSelectUniversity={handleSelectUniversity}
          onSupplierAccess={handleSupplierAccess}
          user={user}
          userUniversity={userUniversity}
        />

        {/* 2. How It Works */}
        <HowItWorks />

        {/* 3. Products Showcase - Conditional */}
        {user && userUniversity ? (
          <ProductsShowcase selectedUniversity={userUniversity.name} />
        ) : selectedUniversity ? (
          <ProductsShowcase selectedUniversity={selectedUniversity.name} />
        ) : !loading && !user ? (
          /* Anonymous user without university selection - encourage selection */
          <div className="py-16 text-center bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-4">Choisissez votre université</h2>
              <p className="text-muted-foreground mb-8">
                Sélectionnez votre campus pour découvrir les produits disponibles
              </p>
            </div>
          </div>
        ) : null}

        {/* 4. Why CampusLink */}
        <WhyCampusLink />

        {/* 5. Stats Section */}
        <StatsSection />

        {/* 6. Student Exchange - Conditional */}
        {user && userUniversity ? (
          <StudentExchange
            onAccessExchange={handleStudentExchange}
            selectedUniversity={userUniversity.name}
          />
        ) : selectedUniversity ? (
          <StudentExchange
            onAccessExchange={handleStudentExchange}
            selectedUniversity={selectedUniversity.name}
          />
        ) : null}

        {/* 7. Popular Suppliers */}
        {/* <PopularSuppliers /> */}

        {/* 8. Testimonials */}
        <Testimonials />

        {/* 9. Mobile App */}
        <MobileApp />

        {/* 10. Partner Universities */}
        {/* <PartnerUniversities /> */}

        {/* 11. Final CTA */}
        <FinalCTA />
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
