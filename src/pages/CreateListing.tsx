import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import { useCreateListing, useUpdateListing, useStudentListings } from "@/hooks/use-student-listings";
import { useImageUpload } from "@/hooks/use-image-upload";
import { getUniversityById } from "@/data/universities";
import { useToast } from "@/hooks/use-toast";
import {
  ListingTypes,
  ListingTypeLabels,
  ItemConditions,
  ItemConditionLabels,
  ListingType,
  ItemCondition
} from "@/lib/database-types";
import {
  ArrowLeft,
  Upload,
  X,
  Loader2
} from "lucide-react";

export default function CreateListing() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditing = !!id;

  const { data: categories = [] } = useCategories();
  const { data: listings = [] } = useStudentListings();
  const createListing = useCreateListing();
  const updateListing = useUpdateListing();
  const {
    uploadMultipleFiles,
    deleteMultipleFiles,
    isUploading: isUploadingImages,
    uploadProgress
  } = useImageUpload({
    bucket: "student-listings",
    maxFiles: 5,
    maxSizeMB: 5
  });

  const existingListing = isEditing ? listings.find((l) => l.id === id) : null;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    listing_type: "sale" as ListingType,
    category_id: "",
    condition: "good" as ItemCondition,
    location: "",
    image_urls: [] as string[],
    image_paths: [] as string[] // Pour stocker les chemins des fichiers
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userUniversity = user?.user_metadata?.university_id
    ? getUniversityById(user.user_metadata.university_id)
    : null;

  // Load existing listing data if editing
  useEffect(() => {
    if (existingListing) {
      setFormData({
        title: existingListing.title,
        description: existingListing.description || "",
        price: existingListing.price?.toString() || "",
        listing_type: existingListing.listing_type,
        category_id: existingListing.category_id || "",
        condition: existingListing.condition || "good",
        location: existingListing.location || "",
        image_urls: existingListing.image_urls || [],
        image_paths: [] // Les chemins ne sont pas stockés en BDD
      });
    }
  }, [existingListing]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez ajouter que 5 images maximum",
        variant: "destructive"
      });
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (index: number) => {
    const imageUrl = formData.image_urls[index];
    const imagePath = formData.image_paths[index];

    // Supprimer du storage si on a le chemin
    if (imagePath) {
      await deleteMultipleFiles([imagePath]);
    }

    // Supprimer de la liste
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
      image_paths: prev.image_paths.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre est requis",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une catégorie",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload les nouvelles images vers Supabase Storage
      let uploadedImageUrls: string[] = [];
      let uploadedImagePaths: string[] = [];

      if (imageFiles.length > 0) {
        const { urls, paths } = await uploadMultipleFiles(imageFiles);
        uploadedImageUrls = urls;
        uploadedImagePaths = paths;
      }

      const listingData = {
        title: formData.title,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : null,
        listing_type: formData.listing_type,
        category_id: formData.category_id,
        condition: formData.condition,
        location: formData.location || null,
        university: userUniversity?.name || null,
        image_urls: [...formData.image_urls, ...uploadedImageUrls],
        is_active: true,
        is_sold: false
      };

      if (isEditing && id) {
        await updateListing.mutateAsync({ id, ...listingData });
        toast({
          title: "Succès",
          description: "Annonce modifiée avec succès"
        });
      } else {
        await createListing.mutateAsync(listingData);
        toast({
          title: "Succès",
          description: "Annonce créée avec succès"
        });
      }

      navigate("/student-exchange");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header onUniversityChange={() => {}} />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold mb-2">Connexion requise</h3>
            <p className="text-muted-foreground mb-4">
              Vous devez être connecté pour créer une annonce
            </p>
            <Button onClick={() => navigate("/login")}>
              Se connecter
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Check if user is the owner when editing
  if (isEditing && existingListing && existingListing.user_id !== user.id) {
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
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold mb-2">Accès refusé</h3>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas les droits pour modifier cette annonce
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

      <div className="container mx-auto px-4 py-8 pt-24 max-w-3xl">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => navigate("/student-exchange")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <h1 className="text-3xl font-bold mb-2">
          {isEditing ? "Modifier l'annonce" : "Créer une annonce"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isEditing ? "Modifiez les informations de votre annonce" : "Remplissez les informations pour publier votre annonce"}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre de l'annonce *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Ex: iPhone 12 Pro en excellent état"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Décrivez votre article en détail..."
              rows={5}
            />
          </div>

          {/* Type and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="listing_type">Type d'annonce *</Label>
              <Select
                value={formData.listing_type}
                onValueChange={(value) => handleInputChange("listing_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ListingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {ListingTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.listing_type === "sale" && (
              <div className="space-y-2">
                <Label htmlFor="price">Prix (CFA) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="5000"
                  min="0"
                  required={formData.listing_type === "sale"}
                />
              </div>
            )}
          </div>

          {/* Category and Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Catégorie *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleInputChange("category_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
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

            <div className="space-y-2">
              <Label htmlFor="condition">État</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => handleInputChange("condition", value as ItemCondition)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ItemConditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {ItemConditionLabels[condition]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Ex: Campus principal, Bâtiment A"
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Images (max 5)</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Cliquez pour ajouter des images ou glissez-déposez
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Formats acceptés: JPG, PNG, WebP, GIF (Max 5MB par image)
              </p>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={isUploadingImages}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("image-upload")?.click()}
                disabled={isUploadingImages}
              >
                {isUploadingImages ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Upload en cours... {uploadProgress}%
                  </>
                ) : (
                  "Choisir des fichiers"
                )}
              </Button>
            </div>

            {/* Existing Images Preview */}
            {formData.image_urls.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {formData.image_urls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Images Preview */}
            {imageFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/student-exchange")}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImages}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? "Modification..." : "Création..."}
                </>
              ) : isUploadingImages ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Upload... {uploadProgress}%
                </>
              ) : (
                isEditing ? "Modifier l'annonce" : "Publier l'annonce"
              )}
            </Button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
