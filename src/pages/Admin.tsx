import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AdminStats } from "@/components/admin/admin-stats";
import { useIsAdmin, useAllUsers, useAllSuppliers, useAllProducts, useBanUser, useUnbanUser, useToggleUserActive, useVerifySupplier, useToggleProductActive, useDeleteProductAdmin } from "@/hooks/use-admin";
import { BarChart3, Users, Store, Package, Shield, Trash2, CheckCircle, XCircle } from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: users = [], isLoading: usersLoading } = useAllUsers();
  const { data: suppliers = [], isLoading: suppliersLoading } = useAllSuppliers();
  const { data: products = [], isLoading: productsLoading } = useAllProducts();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const toggleUserActive = useToggleUserActive();
  const verifySupplier = useVerifySupplier();
  const toggleProductActive = useToggleProductActive();
  const deleteProduct = useDeleteProductAdmin();

  const handleUniversityChange = () => {};
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => {};

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
          <p>Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onUniversityChange={handleUniversityChange} />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Administration
          </h1>
          <p className="text-muted-foreground">Gestion complète de la plateforme</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-2" />Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Utilisateurs ({users.length})</TabsTrigger>
            <TabsTrigger value="suppliers"><Store className="w-4 h-4 mr-2" />Fournisseurs ({suppliers.length})</TabsTrigger>
            <TabsTrigger value="products"><Package className="w-4 h-4 mr-2" />Produits ({products.length})</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview">
            <AdminStats />
          </TabsContent>

          {/* Utilisateurs */}
          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle>Gestion des utilisateurs</CardTitle></CardHeader>
              <CardContent>
                {usersLoading ? <div className="text-center py-8">Chargement...</div> : (
                  <div className="space-y-2">
                    {users.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{user.full_name || 'Utilisateur'}</p>
                          <p className="text-sm text-muted-foreground">ID: {user.user_id?.slice(0, 8)}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={user.is_active ? "default" : "secondary"}>{user.is_active ? "Actif" : "Inactif"}</Badge>
                            {user.banned_at && <Badge variant="destructive">Banni</Badge>}
                            {user.admin_role && <Badge variant="outline">Admin</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => toggleUserActive.mutate({ userId: user.user_id, isActive: !user.is_active })}>
                            {user.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant={user.banned_at ? "default" : "destructive"} onClick={() => user.banned_at ? unbanUser.mutate(user.user_id) : banUser.mutate({ userId: user.user_id, reason: "Violation des règles" })}>
                            {user.banned_at ? "Débannir" : "Bannir"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fournisseurs */}
          <TabsContent value="suppliers">
            <Card>
              <CardHeader><CardTitle>Gestion des fournisseurs</CardTitle></CardHeader>
              <CardContent>
                {suppliersLoading ? <div className="text-center py-8">Chargement...</div> : (
                  <div className="space-y-2">
                    {suppliers.map((supplier: any) => (
                      <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{supplier.business_name}</p>
                          <p className="text-sm text-muted-foreground">{supplier.contact_email}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={supplier.is_verified ? "default" : "secondary"}>{supplier.is_verified ? "Vérifié ✅" : "En attente ⏳"}</Badge>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => verifySupplier.mutate({ supplierId: supplier.id, isVerified: !supplier.is_verified })}>
                          {supplier.is_verified ? "Retirer vérification" : "Vérifier"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Produits */}
          <TabsContent value="products">
            <Card>
              <CardHeader><CardTitle>Gestion des produits</CardTitle></CardHeader>
              <CardContent>
                {productsLoading ? <div className="text-center py-8">Chargement...</div> : (
                  <div className="space-y-2">
                    {products.map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {product.image_url && <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded" />}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.suppliers?.business_name} | {product.price} CFA</p>
                            <Badge variant={product.is_active ? "default" : "secondary"}>{product.is_active ? "Actif" : "Inactif"}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => toggleProductActive.mutate({ productId: product.id, isActive: !product.is_active })}>
                            {product.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => {
                            if (confirm("Supprimer ce produit ?")) deleteProduct.mutate(product.id);
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
