import { useEffect, useState } from "react";
import { useCurrentSupplier, useCreateSupplier, useUpdateSupplier } from "@/hooks/use-supplier";
import { useProducts, useDeleteProduct, Product } from "@/hooks/use-products";
import { useSupplierOrders } from "@/hooks/use-orders";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, BarChart3, Package, ShoppingCart, Star, Settings } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SupplierStats } from "@/components/supplier/supplier-stats";
import { SupplierOrdersList } from "@/components/supplier-orders-list";
import { SupplierReviews } from "@/components/supplier/supplier-reviews";
import { ImageUpload } from "@/components/image-upload";

export default function Supplier() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => {};

  const { data: supplier, isLoading: supplierLoading } = useCurrentSupplier();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useSupplierOrders(supplier?.id);
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteProduct = useDeleteProduct();

  // Vérifier l'authentification
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }
      setUser(user);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate("/");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const [supplierForm, setSupplierForm] = useState({
    business_name: "",
    description: "",
    contact_email: "",
    contact_phone: "",
    contact_whatsapp: "",
    address: "",
    logo_url: "",
  });

  useEffect(() => {
    if (supplier) {
      setSupplierForm({
        business_name: supplier.business_name || "",
        description: supplier.description || "",
        contact_email: supplier.contact_email || "",
        contact_phone: supplier.contact_phone || "",
        contact_whatsapp: supplier.contact_whatsapp || supplier.contact_phone || "",
        address: supplier.address || "",
        logo_url: supplier.logo_url || "",
      });
    }
  }, [supplier]);

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (supplier) {
        await updateSupplier.mutateAsync(supplierForm);
        toast({ title: "Profil fournisseur mis à jour avec succès" });
      } else {
        await createSupplier.mutateAsync(supplierForm);
        toast({ title: "Profil fournisseur créé avec succès" });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await deleteProduct.mutateAsync(id);
        toast({ title: "Produit supprimé avec succès" });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la suppression",
          variant: "destructive",
        });
      }
    }
  };

  if (supplierLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  // Filtrer les produits du fournisseur actuel
  const myProducts = products.filter(product =>
    supplier && product.supplier_id === supplier.id
  );

  // Si pas encore fournisseur, afficher le formulaire d'inscription
  if (!supplier) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onUniversityChange={handleUniversityChange}
        />
        <div className="container mx-auto px-4 py-8 pt-24 max-w-2xl">
          <h1 className="text-3xl font-bold mb-8 text-center">Devenir Fournisseur</h1>
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Inscription Fournisseur</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSupplierSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="business_name">Nom de l'entreprise *</Label>
                  <Input
                    id="business_name"
                    value={supplierForm.business_name}
                    onChange={(e) => setSupplierForm(prev => ({...prev, business_name: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={supplierForm.description}
                    onChange={(e) => setSupplierForm(prev => ({...prev, description: e.target.value}))}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_email">Email de contact</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={supplierForm.contact_email}
                      onChange={(e) => setSupplierForm(prev => ({...prev, contact_email: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_phone">Téléphone</Label>
                    <Input
                      id="contact_phone"
                      value={supplierForm.contact_phone}
                      onChange={(e) => setSupplierForm(prev => ({...prev, contact_phone: e.target.value}))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contact_whatsapp">WhatsApp * (pour les commandes)</Label>
                  <Input
                    id="contact_whatsapp"
                    value={supplierForm.contact_whatsapp}
                    onChange={(e) => setSupplierForm(prev => ({...prev, contact_whatsapp: e.target.value}))}
                    placeholder="77 123 45 67"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={supplierForm.address}
                    onChange={(e) => setSupplierForm(prev => ({...prev, address: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Logo de l'entreprise</Label>
                  <ImageUpload
                    bucket="supplier-logos"
                    currentImageUrl={supplierForm.logo_url}
                    onUploadSuccess={(url) => {
                      setSupplierForm(prev => ({ ...prev, logo_url: url }));
                    }}
                    onDelete={() => {
                      setSupplierForm(prev => ({ ...prev, logo_url: '' }));
                    }}
                    label="Télécharger le logo"
                    maxSizeMB={2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Format recommandé : carré (ex: 500x500px), PNG ou JPG
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={createSupplier.isPending}
                  className="w-full bg-gradient-primary"
                >
                  {createSupplier.isPending ? "Inscription..." : "Devenir fournisseur"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Dashboard fournisseur avec onglets
  return (
    <div className="min-h-screen bg-background">
      <Header
        onUniversityChange={handleUniversityChange}
      />

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {supplier.logo_url && (
              <img
                src={supplier.logo_url}
                alt={`Logo ${supplier.business_name}`}
                className="w-20 h-20 rounded-full object-cover border-2 border-primary shadow-lg"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Espace Fournisseur
                {supplier.is_verified && <span className="text-2xl">(Verifié)</span>}
                {!supplier.is_verified && <span className="text-2xl">(Non Verifié)</span>}
              </h1>
              <p className="text-muted-foreground text-lg">{supplier.business_name}</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produits ({myProducts.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Commandes
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Avis
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          {/* Onglet Vue d'ensemble */}
          <TabsContent value="overview">
            <SupplierStats supplierId={supplier.id} />
          </TabsContent>

          {/* Onglet Produits */}
          <TabsContent value="products">
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Mes Produits ({myProducts.length})</CardTitle>
                  <Button onClick={() => navigate("/add-product")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un produit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="text-center py-8">Chargement des produits...</div>
                ) : myProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Aucun produit ajouté pour le moment.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {myProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          {product.image_url && (
                            <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded" />
                          )}
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {product.original_price && product.original_price > product.price ? (
                                <>
                                  <span className="line-through text-muted-foreground mr-2">{product.original_price} CFA</span>
                                  <span className="text-primary font-medium">{product.price} CFA</span>
                                </>
                              ) : (
                                <span className="font-medium">{product.price} CFA</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">Stock: {product.stock_quantity}</p>
                            {product.categories && (
                              <p className="text-xs text-primary">{product.categories.name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/add-product?id=${product.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Commandes */}
          <TabsContent value="orders">
            <SupplierOrdersList orders={orders || []} loading={ordersLoading} />
          </TabsContent>

          {/* Onglet Avis */}
          <TabsContent value="reviews">
            <SupplierReviews supplierId={supplier.id} />
          </TabsContent>

          {/* Onglet Paramètres */}
          <TabsContent value="settings">
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle>Paramètres du profil fournisseur</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSupplierSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="business_name_settings">Nom de l'entreprise *</Label>
                    <Input
                      id="business_name_settings"
                      value={supplierForm.business_name}
                      onChange={(e) => setSupplierForm(prev => ({...prev, business_name: e.target.value}))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description_settings">Description</Label>
                    <Textarea
                      id="description_settings"
                      value={supplierForm.description}
                      onChange={(e) => setSupplierForm(prev => ({...prev, description: e.target.value}))}
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_email_settings">Email de contact</Label>
                      <Input
                        id="contact_email_settings"
                        type="email"
                        value={supplierForm.contact_email}
                        onChange={(e) => setSupplierForm(prev => ({...prev, contact_email: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_phone_settings">Téléphone</Label>
                      <Input
                        id="contact_phone_settings"
                        value={supplierForm.contact_phone}
                        onChange={(e) => setSupplierForm(prev => ({...prev, contact_phone: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contact_whatsapp_settings">WhatsApp * (pour les commandes)</Label>
                    <Input
                      id="contact_whatsapp_settings"
                      value={supplierForm.contact_whatsapp}
                      onChange={(e) => setSupplierForm(prev => ({...prev, contact_whatsapp: e.target.value}))}
                      placeholder="77 123 45 67"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address_settings">Adresse</Label>
                    <Input
                      id="address_settings"
                      value={supplierForm.address}
                      onChange={(e) => setSupplierForm(prev => ({...prev, address: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label>Logo de l'entreprise</Label>
                    <ImageUpload
                      bucket="supplier-logos"
                      currentImageUrl={supplierForm.logo_url}
                      onUploadSuccess={(url) => {
                        setSupplierForm(prev => ({ ...prev, logo_url: url }));
                      }}
                      onDelete={() => {
                        setSupplierForm(prev => ({ ...prev, logo_url: '' }));
                      }}
                      label="Télécharger le logo"
                      maxSizeMB={2}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Format recommandé : carré (ex: 500x500px), PNG ou JPG
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={updateSupplier.isPending}
                    className="bg-gradient-primary"
                  >
                    {updateSupplier.isPending ? "Mise à jour..." : "Mettre à jour"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
