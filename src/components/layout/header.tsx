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
  Package,
  Shield,
  LayoutDashboard,
  Heart,
  ShoppingBag,
  ClipboardList,
  X
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-admin";
import { useCurrentSupplier } from "@/hooks/use-supplier";
import { useCart } from "@/hooks/use-cart";
import { useUnreadNotificationsCount } from "@/hooks/use-notifications";
import { getUniversityById } from "@/data/universities";
import { NotificationsPopover } from "@/components/notifications-popover";
import { useState } from "react";

interface HeaderProps {
  selectedUniversity?: {
    name: string;
    city: string;
    country: string;
    flag: string;
  } | null;
  onUniversityChange: () => void;
}

export const Header = ({
  selectedUniversity,
  onUniversityChange
}: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const { data: supplier } = useCurrentSupplier();
  const { data: cartItems = [] } = useCart(user?.id);
  const { data: unreadCount = 0 } = useUnreadNotificationsCount(user?.id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate total cart items count
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Get user's university from their metadata
  const userUniversity = user?.user_metadata?.university_id
    ? getUniversityById(user.user_metadata.university_id)
    : null;

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Lien Produits - masqué pour les fournisseurs (ils voient leurs produits dans leur espace) */}
      {!supplier && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigate("/products")}
          className={`hover:bg-primary ${mobile ? 'w-full justify-start' : ''}`}
        >
          <Package className="w-4 h-4 mr-2" />
          Produits
        </Button>
      )}

      {/* Mes Commandes - visible uniquement pour les clients */}
      {user && !supplier && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigate("/orders")}
          className={`hover:bg-primary ${mobile ? 'w-full justify-start' : ''}`}
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Mes Commandes
        </Button>
      )}

      {/* Dashboard - visible uniquement pour les fournisseurs */}
      {supplier && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigate("/supplier")}
          className={`hover:bg-primary ${mobile ? 'w-full justify-start' : ''}`}
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
      )}

      {/* Gestion Commandes - visible uniquement pour les fournisseurs */}
      {supplier && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigate("/supplier/orders")}
          className={`hover:bg-primary ${mobile ? 'w-full justify-start' : ''}`}
        >
          <ClipboardList className="w-4 h-4 mr-2" />
          Commandes
        </Button>
      )}

      {/* Lien Admin - visible uniquement pour les admins */}
      {user && isAdmin && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigate("/admin")}
          className={`text-primary hover:bg-primary ${mobile ? 'w-full justify-start' : ''}`}
        >
          <Shield className="w-4 h-4 mr-2" />
          Administration
        </Button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-2 sm:gap-4 px-3 sm:px-4">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNavigate("/")}>
            <img
              src="/logo_cc.png"
              alt="CampusLink"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover"
            />
            <div className="hidden sm:block">
              <h1 className="font-bold text-base sm:text-lg">CampusLink</h1>
            </div>
          </div>
        </div>

        {/* University Display - masqué pour les fournisseurs */}
        {(user && userUniversity && !supplier) ? (
          <div className="hidden lg:flex items-center flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate("/profile")}
              className="flex items-center space-x-1.5 hover:bg-primary h-9"
            >
              <span className="text-base">{userUniversity.flag}</span>
              <div className="flex flex-col items-start">
                <span className="text-xs font-medium truncate max-w-28 lg:max-w-32">
                  {userUniversity.name.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {userUniversity.city}
                </span>
              </div>
              <User className="w-3 h-3 hidden xl:block" />
            </Button>
          </div>
        ) : selectedUniversity && !user ? (
          <div className="hidden lg:flex items-center flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onUniversityChange}
              className="flex items-center space-x-1.5 hover:bg-primary h-9"
            >
              <span className="text-base">{selectedUniversity.flag}</span>
              <div className="flex flex-col items-start">
                <span className="text-xs font-medium truncate max-w-28 lg:max-w-32">
                  {selectedUniversity.name.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {selectedUniversity.city}
                </span>
              </div>
              <MapPin className="w-3 h-3 hidden xl:block" />
            </Button>
          </div>
        ) : null}

        {/* Search Bar - prend tout l'espace restant - masqué pour les fournisseurs */}
        {!supplier ? (
          <div className="hidden md:flex flex-1 min-w-0 max-w-md lg:max-w-lg xl:max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des produits..."
                className="pl-10 pr-4 w-full h-9"
              />
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1" />
        )}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
          <NavLinks />

          <div className="flex items-center space-x-1 lg:space-x-2 ml-2 lg:ml-4 border-l pl-2 lg:pl-4">
            {user ? (
              <>
                {/* Panier - masqué pour les fournisseurs */}
                {!supplier && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative hover:bg-primary h-9"
                    onClick={() => handleNavigate("/cart")}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {cartCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                      >
                        {cartCount > 9 ? '9+' : cartCount}
                      </Badge>
                    )}
                  </Button>
                )}

                {/* Notifications */}
                {user && <NotificationsPopover userId={user.id} />}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate("/profile")}
                  className="hover:bg-primary h-9 hidden lg:flex"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profil
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleNavigate("/profile")}
                  className="hover:bg-primary h-9 w-9 lg:hidden"
                  title="Profil"
                >
                  <User className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="hover:bg-primary h-9 hidden xl:flex"
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate("/login")}
                  className="hover:bg-primary h-9"
                >
                  <LogIn className="w-4 h-4 lg:mr-2" />
                  <span className="hidden lg:inline">Connexion</span>
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleNavigate("/register")}
                  className="bg-gradient-primary hover:bg-green-600 h-9"
                >
                  <UserPlus className="w-4 h-4 lg:mr-2" />
                  <span className="hidden lg:inline">Inscription</span>
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-1 ml-auto">
          {/* Panier mobile - masqué pour les fournisseurs */}
          {!supplier && user && (
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-primary h-9 w-9"
              onClick={() => handleNavigate("/cart")}
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Notifications mobile */}
          {user && <NotificationsPopover userId={user.id} />}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-primary h-9 w-9">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
              {/* Header du menu mobile */}
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-lg">Menu</h2>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="w-4 h-4" />
                  </Button>
                </SheetClose>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col space-y-4 p-4">
                  {/* University Display Mobile - masqué pour les fournisseurs */}
                  {(user && userUniversity && !supplier) ? (
                    <div className="p-3 bg-muted rounded-lg">
                      <Button
                        variant="ghost"
                        onClick={() => handleNavigate("/profile")}
                        className="w-full justify-start p-0 h-auto hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{userUniversity.flag}</span>
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
                    <div className="p-3 bg-muted rounded-lg">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onUniversityChange();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start p-0 h-auto hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{selectedUniversity.flag}</span>
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

                  {/* Barre de recherche mobile - masquée pour les fournisseurs */}
                  {!supplier && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher des produits..."
                        className="pl-10 h-10"
                      />
                    </div>
                  )}

                  {/* Navigation Links */}
                  <div className="flex flex-col space-y-1">
                    <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
                      NAVIGATION
                    </div>
                    <NavLinks mobile />
                  </div>

                  {/* User Actions */}
                  <div className="flex flex-col space-y-1 pt-2 border-t">
                    <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
                      {user ? 'COMPTE' : 'SE CONNECTER'}
                    </div>
                    {user ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNavigate("/profile")}
                          className="w-full justify-start hover:bg-primary"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Mon Profil
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full justify-start hover:bg-primary text-red-600"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Déconnexion
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNavigate("/login")}
                          className="w-full justify-start hover:bg-primary"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Connexion
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleNavigate("/register")}
                          className="w-full bg-gradient-primary hover:bg-green-600 mx-3"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Inscription
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};