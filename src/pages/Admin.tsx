import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AdminStats } from "@/components/admin/admin-stats";
import { UsersTable } from "@/components/admin/users-table";
import { SuppliersTable } from "@/components/admin/suppliers-table";
import { ProductsTable } from "@/components/admin/products-table";
import { OrdersTable } from "@/components/admin/orders-table";
import { ReviewsTable } from "@/components/admin/reviews-table";
import {
  useIsAdmin,
  useAllUsers,
  useAllSuppliers,
  useAllProducts,
  useAllOrders,
  useAllReviews,
} from "@/hooks/use-admin";
import { BarChart3, Users, Store, Package, Shield, ShoppingCart, Star } from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: users = [], isLoading: usersLoading } = useAllUsers();
  const { data: suppliers = [], isLoading: suppliersLoading } = useAllSuppliers();
  const { data: products = [], isLoading: productsLoading } = useAllProducts();
  const { data: orders = [], isLoading: ordersLoading } = useAllOrders();
  const { data: reviews = [], isLoading: reviewsLoading } = useAllReviews();

  const handleUniversityChange = () => {};

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate]);

  if (adminLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-lg font-medium">Vérification des permissions...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Authentification administrateur en cours
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onUniversityChange={handleUniversityChange} />

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                Panneau d'Administration
              </h1>
              <p className="text-muted-foreground mt-1">
                Gestion complète de la plateforme MND Campus Connect
              </p>
            </div>
          </div>
        </div>

        {/* Onglets de navigation */}
        <Tabs defaultValue="overview" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Utilisateurs</span>
              <span className="sm:hidden">({users.length})</span>
              <span className="hidden sm:inline">({users.length})</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-2">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Fournisseurs</span>
              <span className="sm:hidden">({suppliers.length})</span>
              <span className="hidden sm:inline">({suppliers.length})</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Produits</span>
              <span className="sm:hidden">({products.length})</span>
              <span className="hidden sm:inline">({products.length})</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Commandes</span>
              <span className="sm:hidden">({orders.length})</span>
              <span className="hidden sm:inline">({orders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Avis</span>
              <span className="sm:hidden">({reviews.length})</span>
              <span className="hidden sm:inline">({reviews.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <AdminStats />
          </TabsContent>

          {/* Utilisateurs */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gestion des utilisateurs
                </CardTitle>
                <CardDescription>
                  Gérez les comptes utilisateurs, leurs statuts et leurs permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersTable users={users} isLoading={usersLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fournisseurs */}
          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Gestion des fournisseurs
                </CardTitle>
                <CardDescription>
                  Vérifiez et gérez les fournisseurs de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SuppliersTable suppliers={suppliers} isLoading={suppliersLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Produits */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Gestion des produits
                </CardTitle>
                <CardDescription>
                  Modérez les produits, activez/désactivez ou supprimez-les
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductsTable products={products} isLoading={productsLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commandes */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Gestion des commandes
                </CardTitle>
                <CardDescription>
                  Consultez toutes les commandes de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrdersTable orders={orders} isLoading={ordersLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Avis */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Modération des avis
                </CardTitle>
                <CardDescription>
                  Gérez et modérez les avis laissés par les utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewsTable reviews={reviews} isLoading={reviewsLoading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
