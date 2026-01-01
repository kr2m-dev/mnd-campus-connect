import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/utils";
import { Search, CheckCircle, XCircle, Trash2, Eye } from "lucide-react";
import { useToggleProductActive, useDeleteProductAdmin } from "@/hooks/use-admin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductsTableProps {
  products: any[];
  isLoading: boolean;
}

export const ProductsTable = ({ products, isLoading }: ProductsTableProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const toggleProductActive = useToggleProductActive();
  const deleteProduct = useDeleteProductAdmin();

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(search.toLowerCase()) ||
    product.suppliers?.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    product.categories?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteProduct = () => {
    if (productToDelete) {
      deleteProduct.mutate(productToDelete.id);
      setProductToDelete(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="outline" className="px-4 py-2">
          {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Tableau */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Ajouté</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Aucun produit trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                          <Eye className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{product.suppliers?.business_name || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.categories?.name || '-'}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{product.price} CFA</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                      {product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.is_active ? (
                      <Badge className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Actif
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="w-3 h-3" />
                        Inactif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(product.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/products/${slugify(product.name)}`)}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toggleProductActive.mutate({
                            productId: product.id,
                            isActive: !product.is_active,
                          })
                        }
                        disabled={toggleProductActive.isPending}
                        title={product.is_active ? "Désactiver" : "Activer"}
                      >
                        {product.is_active ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setProductToDelete(product)}
                        disabled={deleteProduct.isPending}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le produit</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le produit{" "}
              <strong>{productToDelete?.name}</strong> ?
              <br />
              <br />
              Cette action est <strong>irréversible</strong> et supprimera toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
