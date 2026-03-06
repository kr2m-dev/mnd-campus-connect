import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Menu,
  MapPin,
  LogIn,
  UserPlus,
  Package,
  Shield,
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  X,
  ChevronDown,
  Heart,
  ArrowLeftRight,
  LogOut,
  MessageCircle,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-admin";
import { useCurrentSupplier } from "@/hooks/use-supplier";

import { getUniversityById } from "@/data/universities";
import { NotificationsPopover } from "@/components/notifications-popover";
import { CartPopover } from "@/components/cart-popover";
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

export const Header = ({ selectedUniversity, onUniversityChange }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const { data: supplier } = useCurrentSupplier();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);


  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Infos utilisateur
  const firstName = user?.user_metadata?.first_name ?? "";
  const lastName = user?.user_metadata?.last_name ?? "";
  const userInitials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() || "U";
  const userName = `${firstName} ${lastName}`.trim() || user?.email?.split("@")[0] || "";

  // Nav item desktop avec underline actif
  const NavItem = ({
    path,
    icon: Icon,
    label,
    className = "",
  }: {
    path: string;
    icon: React.ElementType;
    label: string;
    className?: string;
  }) => {
    const active = isActive(path);
    return (
      <button
        onClick={() => handleNavigate(path)}
        className={`relative flex items-center gap-2 px-3 h-16 text-sm font-medium transition-colors whitespace-nowrap
          ${active ? "text-foreground font-semibold" : "text-foreground/70 hover:text-foreground"} ${className}`}
      >
        <Icon className="w-4 h-4" />
        {label}
        {active && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
        )}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border/60 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-4">

        {/* ── Logo ── */}
        <div
          className="flex items-center gap-2.5 cursor-pointer flex-shrink-0"
          onClick={() => handleNavigate("/")}
        >
          <img
            src="/logo_cc.png"
            alt="CampusLink"
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="font-bold text-lg hidden sm:block">CampusLink</span>
        </div>

        {/* ── Navigation desktop (centre) ── */}
        <nav className="hidden md:flex items-center flex-1 justify-center">

          {/* Université - visiteurs non connectés */}
          {selectedUniversity && !user && (
            <button
              onClick={onUniversityChange}
              className="relative flex items-center gap-1.5 px-3 h-16 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              <span>{selectedUniversity.flag}</span>
              <span className="max-w-24 truncate">{selectedUniversity.name.split(" ").slice(0, 2).join(" ")}</span>
              <MapPin className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Client */}
          {!supplier && <NavItem path="/products" icon={Package} label="Produits" />}
          {user && !supplier && <NavItem path="/orders" icon={ShoppingBag} label="Commandes" />}
          {user && !supplier && <NavItem path="/student-exchange" icon={ArrowLeftRight} label="Échanges" />}
          {user && !supplier && <NavItem path="/favorites" icon={Heart} label="Favoris" />}

          {/* Fournisseur */}
          {supplier && <NavItem path="/supplier" icon={LayoutDashboard} label="Dashboard" />}
          {supplier && <NavItem path="/supplier/orders" icon={ClipboardList} label="Commandes" />}

          {/* Admin */}
          {user && isAdmin && (
            <NavItem path="/admin" icon={Shield} label="Admin" className="text-primary" />
          )}
        </nav>

        {/* ── Actions droite ── */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto flex-shrink-0">
          {user ? (
            <>
              {/* Panier */}
              {!supplier && <CartPopover userId={user.id} />}

              {/* Notifications */}
              <NotificationsPopover userId={user.id} />

              {/* Avatar + nom + dropdown */}
              <div className="relative ml-1">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary uppercase">{userInitials}</span>
                  </div>
                  <span className="hidden lg:block text-sm font-medium max-w-[120px] truncate">
                    {userName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-popover border border-border rounded-2xl shadow-lg py-1.5 z-50 overflow-hidden">
                      <div className="px-3 py-2 border-b border-border/60 mb-1">
                        <p className="text-sm font-semibold truncate">{userName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => handleNavigate("/profile")}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <User className="w-4 h-4" /> Mon profil
                      </button>
                      {!supplier && (
                        <button
                          onClick={() => handleNavigate("/orders")}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4" /> Mes commandes
                        </button>
                      )}
                      <div className="border-t border-border/60 mx-2 my-1" />
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate("/login")}
                className="hidden sm:flex"
              >
                <LogIn className="w-4 h-4 sm:mr-2" />
                <span>Connexion</span>
              </Button>
              <Button
                size="sm"
                onClick={() => handleNavigate("/register")}
                className="bg-primary text-white hover:bg-primary/90 hidden sm:flex"
              >
                <UserPlus className="w-4 h-4 sm:mr-2" />
                <span>Inscription</span>
              </Button>
            </>
          )}

          {/* ── Burger mobile ── */}
          <div className="flex md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0 flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/logo_cc.png" alt="CampusLink" className="h-7 w-7 rounded-full object-cover" />
                    <span className="font-bold">CampusLink</span>
                  </div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="w-4 h-4" />
                    </Button>
                  </SheetClose>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* User info mobile */}
                  {user && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary uppercase">{userInitials}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{userName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  )}

                  {/* Université mobile */}
                  {selectedUniversity && !user && (
                    <button
                      onClick={() => { onUniversityChange(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 w-full p-3 bg-muted rounded-xl text-left"
                    >
                      <span className="text-2xl">{selectedUniversity.flag}</span>
                      <div>
                        <p className="text-sm font-medium">{selectedUniversity.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedUniversity.city}</p>
                      </div>
                      <MapPin className="w-4 h-4 ml-auto text-muted-foreground" />
                    </button>
                  )}

                  {/* Nav mobile */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground px-1 pb-1">NAVIGATION</p>

                    {!supplier && (
                      <button onClick={() => handleNavigate("/products")} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("/products") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                        <Package className="w-4 h-4" /> Produits
                      </button>
                    )}
                    {user && !supplier && (
                      <button onClick={() => handleNavigate("/orders")} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("/orders") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                        <ShoppingBag className="w-4 h-4" /> Mes commandes
                      </button>
                    )}
                    {user && !supplier && (
                      <button onClick={() => handleNavigate("/student-exchange")} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("/student-exchange") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                        <ArrowLeftRight className="w-4 h-4" /> Échanges
                      </button>
                    )}
                    {user && !supplier && (
                      <button onClick={() => handleNavigate("/favorites")} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("/favorites") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                        <Heart className="w-4 h-4" /> Favoris
                      </button>
                    )}
                    {supplier && (
                      <button onClick={() => handleNavigate("/supplier")} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("/supplier") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </button>
                    )}
                    {supplier && (
                      <button onClick={() => handleNavigate("/supplier/orders")} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive("/supplier/orders") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                        <ClipboardList className="w-4 h-4" /> Commandes
                      </button>
                    )}
                    {user && isAdmin && (
                      <button onClick={() => handleNavigate("/admin")} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                        <Shield className="w-4 h-4" /> Administration
                      </button>
                    )}
                  </div>

                  {/* Account mobile */}
                  <div className="space-y-1 pt-2 border-t">
                    <p className="text-xs font-semibold text-muted-foreground px-1 pb-1">COMPTE</p>
                    {user ? (
                      <>
                        <button onClick={() => handleNavigate("/profile")} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                          <User className="w-4 h-4" /> Mon profil
                        </button>
                        <button
                          onClick={() => { logout(); setMobileMenuOpen(false); }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleNavigate("/login")} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                          <LogIn className="w-4 h-4" /> Connexion
                        </button>
                        <button onClick={() => handleNavigate("/register")} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors">
                          <UserPlus className="w-4 h-4" /> Inscription
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
