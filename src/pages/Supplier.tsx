import { useEffect, useState } from "react";
import { useCurrentSupplier, useCreateSupplier, useUpdateSupplier } from "@/hooks/use-supplier";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function Supplier() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => {};
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const { data: supplier, isLoading: supplierLoading } = useCurrentSupplier();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
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
    address: "",
  });

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    category_id: "",
    image_url: "",
    university_filter: "",
    stock_quantity: "",
  });

  useEffect(() => {
    if (supplier) {
      setSupplierForm({
        business_name: supplier.business_name || "",
        description: supplier.description || "",
        contact_email: supplier.contact_email || "",
        contact_phone: supplier.contact_phone || "",
        address: supplier.address || "",
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

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : undefined,
        stock_quantity: parseInt(productForm.stock_quantity) || 0,
        is_active: true,
        rating: 0,
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...productData });
        toast({ title: "Produit mis à jour avec succès" });
      } else {
        await createProduct.mutateAsync(productData);
        toast({ title: "Produit créé avec succès" });
      }
      
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        original_price: "",
        category_id: "",
        image_url: "",
        university_filter: "",
        stock_quantity: "",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du produit",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      category_id: product.category_id || "",
      image_url: product.image_url || "",
      university_filter: product.university_filter || "",
      stock_quantity: product.stock_quantity.toString(),
    });
    setIsProductModalOpen(true);
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
    return <div className="min-h-screen bg-background flex items-center justify-center">Chargement...</div>;
  }

  // Filtrer les produits du fournisseur actuel
  const myProducts = products.filter(product => 
    supplier && product.supplier_id === supplier.id
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        onUniversityChange={handleUniversityChange}
        onSupplierAccess={handleSupplierAccess}
        onStudentExchange={handleStudentExchange}
      />

      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8">Espace Fournisseur</h1>

        {/* Profil Fournisseur */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {supplier ? `Mon Profil Fournisseur ${supplier.is_verified ? '✅' : '⏳'}` : "Devenir Fournisseur"}
            </CardTitle>
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
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm(prev => ({...prev, address: e.target.value}))}
                />
              </div>
              <Button 
                type="submit" 
                disabled={createSupplier.isPending || updateSupplier.isPending}
              >
                {supplier ? "Mettre à jour" : "Devenir fournisseur"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Gestion des Produits */}
        {supplier && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Mes Produits ({myProducts.length})</CardTitle>
                <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingProduct(null);
                      setProductForm({
                        name: "",
                        description: "",
                        price: "",
                        original_price: "",
                        category_id: "",
                        image_url: "",
                        university_filter: "",
                        stock_quantity: "",
                      });
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un produit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nom du produit *</Label>
                        <Input
                          id="name"
                          value={productForm.name}
                          onChange={(e) => setProductForm(prev => ({...prev, name: e.target.value}))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={productForm.description}
                          onChange={(e) => setProductForm(prev => ({...prev, description: e.target.value}))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price">Prix (CFA) *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={productForm.price}
                            onChange={(e) => setProductForm(prev => ({...prev, price: e.target.value}))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="original_price">Prix d'origine (CFA)</Label>
                          <Input
                            id="original_price"
                            type="number"
                            step="0.01"
                            value={productForm.original_price}
                            onChange={(e) => setProductForm(prev => ({...prev, original_price: e.target.value}))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="category">Catégorie</Label>
                        <Select
                          value={productForm.category_id}
                          onValueChange={(value) => setProductForm(prev => ({...prev, category_id: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                       <div>
                         <Label htmlFor="image_url">URL de l'image</Label>
                         <Input
                           id="image_url"
                           type="url"
                           value={productForm.image_url}
                           onChange={(e) => setProductForm(prev => ({...prev, image_url: e.target.value}))}
                           placeholder="https://example.com/image.jpg"
                         />
                         <p className="text-xs text-muted-foreground mt-1">
                           Ajoutez l'URL de l'image de votre produit (optionnel)
                         </p>
                       </div>
                      <div>
                        <Label htmlFor="stock_quantity">Stock disponible</Label>
                        <Input
                          id="stock_quantity"
                          type="number"
                          value={productForm.stock_quantity}
                          onChange={(e) => setProductForm(prev => ({...prev, stock_quantity: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="university_filter">Université (optionnel)</Label>
                        <Input
                          id="university_filter"
                          value={productForm.university_filter}
                          onChange={(e) => setProductForm(prev => ({...prev, university_filter: e.target.value}))}
                          placeholder="Laissez vide pour tous"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={createProduct.isPending || updateProduct.isPending}
                        className="w-full"
                      >
                        {editingProduct ? "Mettre à jour" : "Ajouter"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div>Chargement des produits...</div>
              ) : myProducts.length === 0 ? (
                <p className="text-muted-foreground">Aucun produit ajouté pour le moment.</p>
              ) : (
                <div className="grid gap-4">
                  {myProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                           {product.description && (
                             <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                           )}
                         </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}