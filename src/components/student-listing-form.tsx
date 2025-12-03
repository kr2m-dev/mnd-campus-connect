import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiImageUpload } from '@/components/multi-image-upload';
import { useAuth } from '@/hooks/use-auth';
import { useCategories } from '@/hooks/use-categories';
import {
  ListingType,
  ItemCondition,
  ListingTypes,
  ItemConditions,
  ListingTypeLabels,
  ItemConditionLabels
} from '@/lib/database-types';

interface StudentListingFormProps {
  onSubmit: (data: StudentListingFormData) => Promise<void>;
  isSubmitting: boolean;
  onClose?: () => void;
  editingListing?: any;
}

export interface StudentListingFormData {
  title: string;
  description: string;
  price: string;
  listing_type: ListingType;
  category_id?: string; // Now uses category ID
  condition: ItemCondition;
  image_urls: string[];
  location: string;
  is_active: boolean;
}

export function StudentListingForm({
  onSubmit,
  isSubmitting,
  onClose,
  editingListing,
}: StudentListingFormProps) {
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();

  const [formData, setFormData] = useState<StudentListingFormData>({
    title: '',
    description: '',
    price: '',
    listing_type: 'sale' as ListingType,
    category_id: undefined,
    condition: 'good' as ItemCondition,
    image_urls: [],
    location: '',
    is_active: true,
  });

  const [images, setImages] = useState<Array<{ url: string; path: string }>>([]);

  useEffect(() => {
    if (editingListing) {
      setFormData({
        title: editingListing.title || '',
        description: editingListing.description || '',
        price: editingListing.price?.toString() || '',
        listing_type: editingListing.listing_type || 'sale',
        category_id: editingListing.category_id || undefined,
        condition: editingListing.condition || 'good',
        image_urls: editingListing.image_urls || [],
        location: editingListing.location || '',
        is_active: editingListing.is_active !== undefined ? editingListing.is_active : true,
      });

      // Convert URLs to image objects for the MultiImageUpload component
      if (editingListing.image_urls && editingListing.image_urls.length > 0) {
        const imageObjects = editingListing.image_urls.map((url: string) => ({
          url,
          path: url.split('/').pop() || '',
        }));
        setImages(imageObjects);
      }
    }
  }, [editingListing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Extract URLs from images
    const imageUrls = images.map(img => img.url);

    await onSubmit({
      ...formData,
      image_urls: imageUrls,
    });

    // Reset form after successful submission
    setFormData({
      title: '',
      description: '',
      price: '',
      listing_type: 'sale',
      category_id: undefined,
      condition: 'good',
      image_urls: [],
      location: '',
      is_active: true,
    });
    setImages([]);
  };

  const showPriceField = formData.listing_type === 'sale';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Titre de l'annonce *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
          placeholder="Ex: iPhone 13 Pro Max 256GB"
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          required
          placeholder="Décrivez votre article en détail..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="listing_type">Type d'annonce *</Label>
          <Select
            value={formData.listing_type}
            onValueChange={(value: ListingType) => setFormData(prev => ({ ...prev, listing_type: value }))}
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

        {showPriceField && (
          <div>
            <Label htmlFor="price">Prix (CFA) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              required={showPriceField}
              placeholder="0"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Catégorie *</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
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

        <div>
          <Label htmlFor="condition">État *</Label>
          <Select
            value={formData.condition}
            onValueChange={(value: ItemCondition) => setFormData(prev => ({ ...prev, condition: value }))}
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

      <div>
        <Label htmlFor="location">Lieu (optionnel)</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="Ex: Campus principal, Résidence universitaire..."
        />
      </div>

      <div>
        <Label>Photos de l'article</Label>
        <MultiImageUpload
          bucket="student-listings"
          currentImages={images}
          onUploadSuccess={(updatedImages) => {
            setImages(updatedImages);
          }}
          userId={user?.id}
          maxImages={5}
          maxSizeMB={5}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Ajoutez jusqu'à 5 photos pour mieux présenter votre article
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Publication...' : (editingListing ? 'Mettre à jour' : 'Publier l\'annonce')}
        </Button>
        {onClose && (
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
}
