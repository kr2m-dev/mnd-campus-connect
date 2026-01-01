import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Star } from "lucide-react";
import { useDeleteReview } from "@/hooks/use-admin";
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

interface ReviewsTableProps {
  reviews: any[];
  isLoading: boolean;
}

export const ReviewsTable = ({ reviews, isLoading }: ReviewsTableProps) => {
  const [search, setSearch] = useState("");
  const [reviewToDelete, setReviewToDelete] = useState<any>(null);
  const deleteReview = useDeleteReview();

  const filteredReviews = reviews.filter((review) =>
    review.comment?.toLowerCase().includes(search.toLowerCase()) ||
    review.products?.name?.toLowerCase().includes(search.toLowerCase()) ||
    review.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteReview = () => {
    if (reviewToDelete) {
      deleteReview.mutate(reviewToDelete.id);
      setReviewToDelete(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
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
            placeholder="Rechercher un avis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="outline" className="px-4 py-2">
          {filteredReviews.length} avis
        </Badge>
      </div>

      {/* Tableau */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Auteur</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Commentaire</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucun avis trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {review.products?.image_url && (
                        <img
                          src={review.products.image_url}
                          alt={review.products.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <span className="font-medium text-sm">
                        {review.products?.name || 'Produit supprimé'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">
                        {review.profiles?.full_name || 'Utilisateur inconnu'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {review.profiles?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {renderStars(review.rating)}
                      <span className="text-xs text-muted-foreground">
                        {review.rating}/5
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm line-clamp-2 max-w-md">
                      {review.comment || <span className="text-muted-foreground italic">Pas de commentaire</span>}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setReviewToDelete(review)}
                      disabled={deleteReview.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!reviewToDelete} onOpenChange={() => setReviewToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'avis</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet avis ?
              <br />
              <br />
              <div className="bg-muted p-3 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(reviewToDelete?.rating || 0)}
                  <span className="text-sm font-medium">
                    par {reviewToDelete?.profiles?.full_name}
                  </span>
                </div>
                <p className="text-sm italic">"{reviewToDelete?.comment}"</p>
              </div>
              <br />
              Cette action est <strong>irréversible</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
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
