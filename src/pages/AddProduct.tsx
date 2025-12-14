import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCurrentSupplier } from "@/hooks/use-supplier";
import { useCreateProduct, useUpdateProduct, useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { ProductForm, ProductFormData } from "@/components/supplier/product-form";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AddProduct() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");

  const [user, setUser] = useState(null);
  const { data: supplier, isLoading: supplierLoading } = useCurrentSupplier();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  // Trouver le produit en édition
  const editingProduct = productId
    ? products.find(p => p.id === productId && p.supplier_id === supplier?.id)
    : null;

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

  // Rediriger si pas fournisseur
  useEffect(() => {
    if (!supplierLoading && !supplier) {
      toast({
        title: "Accès refusé",
        description: "Vous devez être fournisseur pour ajouter des produits",
        variant: "destructive",
      });
      navigate("/supplier");
    }
  }, [supplier, supplierLoading, navigate]);

  const handleSubmit = async (data: ProductFormData) => {
    try {
      // Extraire university_filters (qui n'existe pas en base) et garder le reste
      const { university_filters, ...restData } = data;

      const productData = {
        ...restData,
        price: parseFloat(data.price),
        original_price: data.original_price ? parseFloat(data.original_price) : undefined,
        stock_quantity: parseInt(data.stock_quantity) || 0,
        is_active: true,
        rating: 0,
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...productData });
        toast({
          title: "Produit mis à jour avec succès",
          description: "Votre produit a été modifié et est maintenant visible dans votre catalogue."
        });
      } else {
        await createProduct.mutateAsync(productData);
        toast({
          title: "Produit créé avec succès",
          description: "Votre produit a été ajouté et est maintenant visible dans votre catalogue."
        });
      }

      navigate("/supplier?tab=products");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement du produit",
        variant: "destructive",
      });
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

  if (!supplier) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onUniversityChange={() => {}} />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/supplier?tab=products")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à mes produits
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {editingProduct ? "Modifier le produit" : "Ajouter un nouveau produit"}
              </h1>
              <p className="text-muted-foreground">
                {editingProduct
                  ? "Mettez à jour les informations de votre produit"
                  : "Remplissez les informations pour ajouter votre produit au catalogue"
                }
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>
              {editingProduct ? "Informations du produit" : "Nouveau produit"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              editingProduct={editingProduct}
              categories={categories}
              onSubmit={handleSubmit}
              isSubmitting={createProduct.isPending || updateProduct.isPending}
              onClose={() => navigate("/supplier?tab=products")}
            />
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
