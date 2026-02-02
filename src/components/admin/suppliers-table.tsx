import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, XCircle, Phone, Mail, MapPin } from "lucide-react";
import { useVerifySupplier } from "@/hooks/use-admin";

interface SuppliersTableProps {
  suppliers: any[];
  isLoading: boolean;
}

export const SuppliersTable = ({ suppliers, isLoading }: SuppliersTableProps) => {
  const [search, setSearch] = useState("");
  const verifySupplier = useVerifySupplier();

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    supplier.contact_email?.toLowerCase().includes(search.toLowerCase())
  );

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
            placeholder="Rechercher un fournisseur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="outline" className="px-4 py-2">
          {filteredSuppliers.length} fournisseur{filteredSuppliers.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Tableau */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entreprise</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Produits</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Inscription</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucun fournisseur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {supplier.logo_url && (
                        <img
                          src={supplier.logo_url}
                          alt={supplier.business_name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{supplier.business_name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {supplier.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {supplier.genre || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {supplier.contact_email && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {supplier.contact_email}
                        </div>
                      )}
                      {supplier.contact_phone && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {supplier.contact_phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {supplier.address ? (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {supplier.address}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {supplier.products?.[0]?.count || 0} produit{supplier.products?.[0]?.count > 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {supplier.is_verified ? (
                      <Badge className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Vérifié
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="w-3 h-3" />
                        En attente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(supplier.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={supplier.is_verified ? "outline" : "default"}
                      onClick={() =>
                        verifySupplier.mutate({
                          supplierId: supplier.id,
                          isVerified: !supplier.is_verified,
                        })
                      }
                      disabled={verifySupplier.isPending}
                    >
                      {supplier.is_verified ? (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Retirer
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Vérifier
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
