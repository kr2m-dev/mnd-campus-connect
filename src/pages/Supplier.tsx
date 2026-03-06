import { useEffect, useState } from "react";
import { useCurrentSupplier, useCreateSupplier, useUpdateSupplier } from "@/hooks/use-supplier";
import { useProducts, useDeleteProduct, Product } from "@/hooks/use-products";
import { useSupplierOrders } from "@/hooks/use-orders";
import { useSupplierWhatsAppOrders, useUpdateCommandeStatut, CommandeStatut } from "@/hooks/use-whatsapp-orders";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";
import { Trash2, Edit, Plus, BarChart3, Package, ShoppingCart, Star, Settings, Eye, Copy, Share2, CheckCircle, MessageCircle, Phone, MapPin, Clock, Ban } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  const [linkCopied, setLinkCopied] = useState(false);

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => {};

  const { data: supplier, isLoading: supplierLoading } = useCurrentSupplier();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useSupplierOrders();
  const { data: waOrders = [], isLoading: waOrdersLoading } = useSupplierWhatsAppOrders(supplier?.id || "");
  const updateStatut = useUpdateCommandeStatut();
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            {supplier.logo_url && (
              <img
                src={supplier.logo_url}
                alt={`Logo ${supplier.business_name}`}
                className="w-20 h-20 rounded-full object-cover border-2 border-primary shadow-lg"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Espace Fournisseur
                {supplier.is_verified && <span className="text-2xl">(Verifié)</span>}
                {!supplier.is_verified && <span className="text-2xl">(Non Verifié)</span>}
              </h1>
              <p className="text-muted-foreground text-lg">{supplier.business_name}</p>
            </div>

            {/* Ma Boutique - only for verified suppliers */}
            {supplier.is_verified && supplier.shop_slug ? (() => {
              const publicUrl = `${window.location.origin}/shop/${supplier.shop_slug}`;
              const handleCopy = () => {
                navigator.clipboard.writeText(publicUrl);
                setLinkCopied(true);
                toast({ title: "Lien copié !" });
                setTimeout(() => setLinkCopied(false), 2000);
              };
              const handleShareWA = () => {
                const text = encodeURIComponent(`Découvrez ma boutique ${supplier.business_name} sur CampusLink : ${publicUrl}`);
                window.open(`https://wa.me/?text=${text}`, "_blank");
              };
              return (
                <div className="flex flex-col gap-2 sm:items-end">
                  <p className="text-xs text-muted-foreground font-medium">Ma Boutique</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/shop/${supplier.shop_slug}`)}
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                    >
                      {linkCopied
                        ? <CheckCircle className="w-4 h-4 mr-1.5 text-green-600" />
                        : <Copy className="w-4 h-4 mr-1.5" />
                      }
                      {linkCopied ? "Copié !" : "Copier mon lien"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShareWA}
                      title="Partager sur WhatsApp"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground truncate max-w-[250px]">{publicUrl}</p>
                </div>
              );
            })() : !supplier.is_verified && (
              <div className="flex flex-col gap-1 sm:items-end">
                <p className="text-xs text-muted-foreground font-medium">Ma Boutique</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Cette fonctionnalité est réservée aux comptes vérifiés
                </p>
              </div>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Produits ({myProducts.length})</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Commandes</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp-orders" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
              {waOrders.filter(o => o.statut === "en_cours").length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                  {waOrders.filter(o => o.statut === "en_cours").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Avis</span>
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
                            onClick={() => navigate(`/products/${slugify(product.name)}`)}
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/add-product?id=${product.id}`)}
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            title="Supprimer"
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

          {/* Onglet Commandes WhatsApp */}
          <TabsContent value="whatsapp-orders">
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  Commandes WhatsApp ({waOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {waOrdersLoading ? (
                  <div className="text-center py-8">Chargement...</div>
                ) : waOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Aucune commande WhatsApp pour le moment.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {waOrders.map((commande) => {
                      const statutConfig: Record<CommandeStatut, { label: string; variant: "default" | "secondary" | "destructive"; icon: React.ElementType }> = {
                        en_cours: { label: "En cours", variant: "secondary", icon: Clock },
                        complet: { label: "Complété", variant: "default", icon: CheckCircle },
                        annule: { label: "Annulé", variant: "destructive", icon: Ban },
                      };
                      const config = statutConfig[commande.statut];

                      return (
                        <div key={commande.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm">{commande.product_name}</p>
                              {commande.quantity > 1 && (
                                <Badge variant="outline" className="text-xs">x{commande.quantity}</Badge>
                              )}
                              <Badge variant={config.variant} className="text-xs flex items-center gap-1">
                                <config.icon className="w-3 h-3" />
                                {config.label}
                              </Badge>
                            </div>
                            <p className="text-sm font-bold text-primary">{(commande.product_price * commande.quantity).toLocaleString()} CFA</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {commande.customer_name} — {commande.customer_phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {commande.customer_location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(commande.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>

                          <Select
                            value={commande.statut}
                            onValueChange={(val) =>
                              updateStatut.mutate({ id: commande.id, statut: val as CommandeStatut })
                            }
                          >
                            <SelectTrigger className="w-36 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en_cours">En cours</SelectItem>
                              <SelectItem value="complet">Complété</SelectItem>
                              <SelectItem value="annule">Annulé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
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
