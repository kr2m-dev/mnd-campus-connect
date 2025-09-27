import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  User,
  Menu,
  Search,
  Bell,
  Store,
  Users,
  MapPin,
  LogIn,
  UserPlus,
  Package
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { getUniversityById } from "@/data/universities";

interface HeaderProps {
  selectedUniversity?: {
    name: string;
    city: string;
    country: string;
    flag: string;
  } | null;
  onUniversityChange: () => void;
  onSupplierAccess: () => void;
  onStudentExchange: () => void;
}

export const Header = ({
  selectedUniversity,
  onUniversityChange,
  onSupplierAccess,
  onStudentExchange
}: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [cartCount] = useState(3);

  // Get user's university from their metadata
  const userUniversity = user?.user_metadata?.university_id
    ? getUniversityById(user.user_metadata.university_id)
    : null;

  const NavLinks = () => (
    <>
      <Button variant="ghost" size="sm" onClick={() => navigate("/products")}>
        <Package className="w-4 h-4 mr-2" />
        Produits
      </Button>
      <Button variant="ghost" size="sm" onClick={onStudentExchange}>
        <Users className="w-4 h-4 mr-2" />
        Espace Échange
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">MND</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">MND.Produits</h1>
              <p className="text-xs text-muted-foreground">Campus Connect</p>
            </div>
          </div>
        </div>

        {/* University Display */}
        {(user && userUniversity) ? (
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/profile")}
              className="flex items-center space-x-2"
            >
              <span className="text-lg">{userUniversity.flag}</span>
              <div className="flex flex-col items-start">
                <span className="text-xs font-medium truncate max-w-32">
                  {userUniversity.name.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {userUniversity.city}
                </span>
              </div>
              <User className="w-3 h-3" />
            </Button>
          </div>
        ) : selectedUniversity && !user ? (
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onUniversityChange}
              className="flex items-center space-x-2"
            >
              <span className="text-lg">{selectedUniversity.flag}</span>
              <div className="flex flex-col items-start">
                <span className="text-xs font-medium truncate max-w-32">
                  {selectedUniversity.name.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedUniversity.city}
                </span>
              </div>
              <MapPin className="w-3 h-3" />
            </Button>
          </div>
        ) : null}

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher des produits..." 
              className="pl-10 pr-4"
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <NavLinks />
          
          <div className="flex items-center space-x-2 ml-4 border-l pl-4">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/notifications")}>
                  <Bell className="w-4 h-4" />
                </Button>

                <Button variant="ghost" size="sm" className="relative" onClick={() => navigate("/cart")}>
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>

                <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                  <User className="w-4 h-4 mr-2" />
                  Profil
                </Button>

                <Button variant="ghost" size="sm" onClick={logout}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </Button>

                <Button variant="default" size="sm" onClick={() => navigate("/register")} className="bg-gradient-primary">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Inscription
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-2">
          <Button variant="ghost" size="sm" className="relative" onClick={() => navigate("/cart")}>
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs"
              >
                {cartCount}
              </Badge>
            )}
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-6">
                {(user && userUniversity) ? (
                  <div className="p-4 bg-muted rounded-lg">
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/profile")}
                      className="w-full justify-start p-0 h-auto"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{userUniversity.flag}</span>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">
                            {userUniversity.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {userUniversity.city}, {userUniversity.country}
                          </span>
                        </div>
                      </div>
                    </Button>
                  </div>
                ) : selectedUniversity && !user ? (
                  <div className="p-4 bg-muted rounded-lg">
                    <Button
                      variant="ghost"
                      onClick={onUniversityChange}
                      className="w-full justify-start p-0 h-auto"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{selectedUniversity.flag}</span>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">
                            {selectedUniversity.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {selectedUniversity.city}, {selectedUniversity.country}
                          </span>
                        </div>
                      </div>
                    </Button>
                  </div>
                ) : null}
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Rechercher..." 
                    className="pl-10"
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <NavLinks />
                </div>
                
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  {user ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => navigate("/notifications")} className="w-full">
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate("/profile")} className="w-full">
                        <User className="w-4 h-4 mr-2" />
                        Profil
                      </Button>
                      <Button variant="outline" size="sm" onClick={logout} className="w-full">
                        Déconnexion
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => navigate("/login")} className="w-full">
                        <LogIn className="w-4 h-4 mr-2" />
                        Connexion
                      </Button>
                      <Button variant="default" size="sm" onClick={() => navigate("/register")} className="w-full bg-gradient-primary">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Inscription
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};