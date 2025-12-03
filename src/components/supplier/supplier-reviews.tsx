import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Package } from "lucide-react";
import { useSupplierReviews, useDeleteReview } from "@/hooks/use-reviews";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SupplierReviewsProps {
  supplierId: string;
}

export const SupplierReviews = ({ supplierId }: SupplierReviewsProps) => {
  const { data: reviews, isLoading } = useSupplierReviews(supplierId);
  const deleteReview = useDeleteReview();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="shadow-card border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Star className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun avis</h3>
          <p className="text-muted-foreground text-center">
            Vos produits n'ont pas encore reçu d'avis clients.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculer la note moyenne
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map(rating =>
    reviews.filter(r => r.rating === rating).length
  );

  const handleDelete = async (reviewId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
      await deleteReview.mutateAsync(reviewId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Résumé des notes */}
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="w-5 h-5" />
            Résumé des avis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Note moyenne */}
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <div className="text-5xl font-bold text-primary mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {reviews.length} avis au total
              </p>
            </div>

            {/* Répartition des notes */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating, index) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-12">
                    {rating} <Star className="w-3 h-3 inline text-yellow-400 fill-yellow-400" />
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full"
                      style={{
                        width: `${reviews.length > 0 ? (ratingCounts[index] / reviews.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {ratingCounts[index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des avis */}
      <div className="space-y-4">
        {reviews.map((review: any) => (
          <Card key={review.id} className="shadow-card border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{review.products?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {review.rating}/5
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(review.id)}
                  disabled={deleteReview.isPending}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            {review.comment && (
              <CardContent>
                <p className="text-sm text-muted-foreground italic">"{review.comment}"</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(review.created_at), "d MMMM yyyy 'à' HH:mm", {
                    locale: fr,
                  })}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
