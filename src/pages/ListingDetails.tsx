import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useStudentListings, useIncrementViews } from "@/hooks/use-student-listings";
import { getUniversityById } from "@/data/universities";
import { useState, useEffect } from "react";
import {
  ListingTypeLabels,
  ItemConditionLabels
} from "@/lib/database-types";
import {
  MessageCircle,
  Phone,
  MapPin,
  ArrowLeft,
  Loader2,
  Package,
  User,
  Clock,
  Eye,
  Calendar,
  Edit,
  Trash2
} from "lucide-react";

export default function ListingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contactVisible, setContactVisible] = useState(false);

  const { data: listings = [], isLoading } = useStudentListings();
  const listing = listings.find((l) => l.id === id);
  const incrementViews = useIncrementViews();

  const userUniversity = user?.user_metadata?.university_id
    ? getUniversityById(user.user_metadata.university_id)
    : null;

  // Increment views count when page loads
  useEffect(() => {
    if (listing && id) {
      incrementViews.mutate(id);
    }
  }, [id]);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "À l'instant";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaine${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
    return `Il y a ${Math.floor(diffInDays / 30)} mois`;
  };

  const handleContact = () => {
    setContactVisible(true);
  };

  const handleEdit = () => {
    navigate(`/student-exchange/edit/${id}`);
  };

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
      // TODO: Implement delete functionality
      navigate("/student-exchange");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={() => {}} />
        <div className="flex items-center justify-center pt-20 h-[calc(100vh-5rem)]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Chargement de l'annonce...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={() => {}} />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Annonce introuvable</h3>
            <p className="text-muted-foreground mb-4">
              L'annonce que vous recherchez n'existe pas ou a été supprimée.
            </p>
            <Button onClick={() => navigate("/student-exchange")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux annonces
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwner = user?.id === listing.user_id;
  const listingImages = listing.image_urls || [];

  return (
    <div className="min-h-screen bg-background">
      <Header
        selectedUniversity={userUniversity ? {
          name: userUniversity.name,
          city: userUniversity.city,
          country: userUniversity.country,
          flag: userUniversity.flag
        } : null}
        onUniversityChange={() => navigate("/profile")}
      />

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Bouton retour */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {/* Contenu principal */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Section Images */}
          <div className="space-y-4">
            <div className="relative bg-card rounded-lg overflow-hidden shadow-card">
              {listingImages.length > 0 ? (
                <ProductImageCarousel
                  images={listingImages}
                  productName={listing.title}
                  aspectRatio="square"
                  className="rounded-lg"
                />
              ) : (
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground" />
                </div>
              )}

              {/* Badges sur l'image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                <Badge
                  variant={listing.listing_type === "sale" ? "default" : "secondary"}
                  className="text-sm font-bold"
                >
                  {ListingTypeLabels[listing.listing_type]}
                </Badge>
                {listing.condition && (
                  <Badge variant="outline" className="text-sm bg-background/90 backdrop-blur">
                    {ItemConditionLabels[listing.condition]}
                  </Badge>
                )}
              </div>

              {listing.is_sold && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="destructive" className="text-sm font-bold">
                    Vendu
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Section Informations */}
          <div className="space-y-6">
            {/* Actions propriétaire */}
            {isOwner && (
              <div className="flex gap-2 pb-4 border-b">
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            )}

            {/* Titre */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{listing.title}</h1>

              {/* Infos rapides */}
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {getTimeAgo(listing.created_at)}
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {listing.views_count} vue{listing.views_count > 1 ? 's' : ''}
                </div>
                {listing.university && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {listing.university}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Prix */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Prix</h3>
              <div className="text-4xl font-bold text-primary">
                {listing.price ? `${listing.price} CFA` : listing.listing_type === "exchange" ? "Échange" : "Gratuit"}
              </div>
            </div>

            <Separator />

            {/* Description */}
            {listing.description && (
              <div className="space-y-3">
                <h3 className="font-semibold text-xl">Description</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Informations complémentaires */}
            <div className="grid grid-cols-2 gap-4">
              {listing.categories && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Catégorie</h3>
                  <Badge variant="outline" className="text-sm">
                    {listing.categories.name}
                  </Badge>
                </div>
              )}

              {listing.location && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Localisation</h3>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {listing.location}
                  </div>
                </div>
              )}

              <div className="space-y-2 col-span-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Type d'annonce</h3>
                <Badge variant="outline" className="text-sm">
                  {ListingTypeLabels[listing.listing_type]}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Informations vendeur */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Vendeur
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-lg">
                    {listing.profiles?.full_name || "Utilisateur"}
                  </p>
                  {!isOwner && !listing.is_sold && (
                    <Button onClick={handleContact} size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contacter
                    </Button>
                  )}
                </div>

                {contactVisible && !isOwner && (
                  <div className="mt-4 p-4 bg-background rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-2">
                      Pour contacter ce vendeur, utilisez la messagerie interne ou les coordonnées ci-dessous :
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="w-4 h-4 mr-2" />
                        Disponible via la messagerie
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Membre depuis {new Date(listing.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Actions */}
            {!isOwner && !listing.is_sold && (
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleContact}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary-dark text-lg py-7"
                >
                  <MessageCircle className="w-6 h-6 mr-2" />
                  Contacter le vendeur
                </Button>
              </div>
            )}

            {listing.is_sold && (
              <div className="bg-muted rounded-lg p-6 text-center">
                <p className="text-lg font-semibold text-muted-foreground">
                  Cette annonce n'est plus disponible
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
