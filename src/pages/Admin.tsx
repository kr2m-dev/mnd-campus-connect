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
  useAllOrders,
  useAllReviews,
  useIsAdmin,
  useAllUsers,
  useAllSuppliers,
  useAllProducts,
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
    <div className="min-h-screen bg-muted/30">
      <Header onUniversityChange={handleUniversityChange} />

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-elegant">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Panneau d'Administration
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestion de la plateforme SenCampusLink
              </p>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="overview" className="w-full space-y-6">
          <TabsList className="bg-background border shadow-sm h-auto p-1 flex flex-wrap gap-1">
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Utilisateurs</span>
              <span className="text-xs opacity-70">({users.length})</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Fournisseurs</span>
              <span className="text-xs opacity-70">({suppliers.length})</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Produits</span>
              <span className="text-xs opacity-70">({products.length})</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Commandes</span>
              <span className="text-xs opacity-70">({orders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Avis</span>
              <span className="text-xs opacity-70">({reviews.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminStats />
          </TabsContent>

          <TabsContent value="users">
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-background">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-primary" />
                  Gestion des utilisateurs
                </CardTitle>
                <CardDescription>
                  Gérez les comptes, statuts et permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <UsersTable users={users} isLoading={usersLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers">
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-background">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Store className="w-5 h-5 text-primary" />
                  Gestion des fournisseurs
                </CardTitle>
                <CardDescription>
                  Vérifiez et gérez les fournisseurs
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <SuppliersTable suppliers={suppliers} isLoading={suppliersLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-background">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="w-5 h-5 text-primary" />
                  Gestion des produits
                </CardTitle>
                <CardDescription>
                  Modérez, activez/désactivez ou supprimez les produits
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ProductsTable products={products} isLoading={productsLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-background">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Gestion des commandes
                </CardTitle>
                <CardDescription>
                  Consultez toutes les commandes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <OrdersTable orders={orders} isLoading={ordersLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-background">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="w-5 h-5 text-primary" />
                  Modération des avis
                </CardTitle>
                <CardDescription>
                  Gérez et modérez les avis utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
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
