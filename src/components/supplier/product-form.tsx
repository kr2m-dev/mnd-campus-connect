import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MultiImageUpload } from '@/components/multi-image-upload';
import { Product } from '@/hooks/use-products';
import { useUniversities } from '@/hooks/use-universities';
import {
  Info,
  Package,
  DollarSign,
  Tag,
  Image as ImageIcon,
  School,
  AlertCircle,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  editingProduct?: Product | null;
  categories: Array<{ id: string; name: string }>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting: boolean;
  onClose?: () => void;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  original_price: string;
  category_id: string;
  image_url: string; // Gardé pour compatibilité (première image)
  image_urls: string[]; // Nouvelles images multiples
  university_filter: string; // Gardé pour compatibilité (peut contenir 'all' ou une liste séparée par virgules)
  university_filters: string[]; // Nouveaux filtres multiples
  stock_quantity: string;
}

export function ProductForm({
  editingProduct,
  categories,
  onSubmit,
  isSubmitting,
  onClose,
}: ProductFormProps) {
  const { data: universities = [], isLoading: universitiesLoading } = useUniversities();

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category_id: '',
    image_url: '',
    image_urls: [],
    university_filter: '',
    university_filters: [],
    stock_quantity: '0',
  });

  const [images, setImages] = useState<Array<{ url: string; path: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingProduct) {
      // Gérer les images multiples ou l'ancienne image unique
      const imageUrls = (editingProduct as any).image_urls ||
                        (editingProduct.image_url ? [editingProduct.image_url] : []);

      // Gérer la conversion de l'ancien format vers le nouveau
      const universityFilter = editingProduct.university_filter || '';
      let universityFilters: string[] = [];

      if (universityFilter && universityFilter !== 'all') {
        const filterParts = universityFilter.split(',').filter(part => part.trim());

        // Convertir les noms en IDs si nécessaire
        universityFilters = filterParts.map(part => {
          const trimmedPart = part.trim();
          // Vérifier si c'est déjà un ID (format court sans espaces)
          const isId = universities.some(uni => uni.id === trimmedPart);

          if (isId) {
            return trimmedPart;
          }

          // Sinon, chercher l'université par nom
          const university = universities.find(uni => uni.name === trimmedPart);
          if (university) {
            return university.id;
          }

          return trimmedPart; // Garder tel quel si non trouvé
        }).filter(Boolean);
      }

      setFormData({
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: editingProduct.price.toString(),
        original_price: editingProduct.original_price?.toString() || '',
        category_id: editingProduct.category_id || '',
        image_url: imageUrls[0] || '',
        image_urls: imageUrls,
        university_filter: universityFilter,
        university_filters: universityFilters,
        stock_quantity: editingProduct.stock_quantity.toString(),
      });

      // Initialiser les images pour MultiImageUpload
      setImages(imageUrls.map((url: string, index: number) => ({
        url,
        path: `product-${editingProduct.id}-${index}` // Path approximatif
      })));
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        original_price: '',
        category_id: '',
        image_url: '',
        image_urls: [],
        university_filter: '',
        university_filters: [],
        stock_quantity: '0',
      });
      setImages([]);
    }
  }, [editingProduct, universities]);

  // Calcul automatique de la remise
  const discountPercentage = useMemo(() => {
    const price = parseFloat(formData.price);
    const originalPrice = parseFloat(formData.original_price);

    if (!originalPrice || !price || originalPrice <= price) return 0;

    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }, [formData.price, formData.original_price]);

  // Validation en temps réel
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (value.length < 3) {
          newErrors.name = 'Le nom doit contenir au moins 3 caractères';
        } else {
          delete newErrors.name;
        }
        break;

      case 'price':
        const price = parseFloat(value);
        if (isNaN(price) || price <= 0) {
          newErrors.price = 'Le prix doit être supérieur à 0';
        } else {
          delete newErrors.price;
        }
        break;

      case 'original_price':
        const originalPrice = parseFloat(value);
        const currentPrice = parseFloat(formData.price);
        if (value && originalPrice <= currentPrice) {
          newErrors.original_price = 'Le prix d\'origine doit être supérieur au prix actuel';
        } else {
          delete newErrors.original_price;
        }
        break;

      case 'stock_quantity':
        const stock = parseInt(value);
        if (isNaN(stock) || stock < 0) {
          newErrors.stock_quantity = 'Le stock doit être un nombre positif';
        } else {
          delete newErrors.stock_quantity;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // Gérer la sélection/désélection d'une université
  const toggleUniversitySelection = (universityId: string) => {
    setFormData(prev => {
      const currentFilters = prev.university_filters;
      const isSelected = currentFilters.includes(universityId);

      const newFilters = isSelected
        ? currentFilters.filter(id => id !== universityId)
        : [...currentFilters, universityId];

      // Synchroniser avec university_filter
      const filterValue = newFilters.length > 0 ? newFilters.join(',') : '';

      return {
        ...prev,
        university_filters: newFilters,
        university_filter: filterValue
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation finale
    if (Object.keys(errors).length > 0) {
      return;
    }

    await onSubmit(formData);

    // Reset form after successful submission
    if (!editingProduct) {
      setFormData({
        name: '',
        description: '',
        price: '',
        original_price: '',
        category_id: '',
        image_url: '',
        image_urls: [],
        university_filters: [],
        university_filter: '',
        stock_quantity: '0',
      });
      setImages([]);
    }
  };

  // Indicateur de niveau de stock
  const getStockStatus = () => {
    const stock = parseInt(formData.stock_quantity);
    if (stock === 0) return { label: 'Rupture', color: 'destructive', icon: AlertCircle };
    if (stock < 10) return { label: 'Stock faible', color: 'warning', icon: AlertCircle };
    if (stock < 50) return { label: 'Stock moyen', color: 'default', icon: Info };
    return { label: 'Stock suffisant', color: 'success', icon: CheckCircle2 };
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

  const isFormValid = formData.name.length >= 3 &&
                      parseFloat(formData.price) > 0 &&
                      formData.image_urls.length > 0 &&
                      Object.keys(errors).length === 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section: Informations de base */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Informations de base</h3>
        </div>

        <div>
          <Label htmlFor="name" className="flex items-center gap-2 mb-2">
            Nom du produit <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ex: MacBook Pro 14 pouces M3"
            required
            className={cn(errors.name && "border-destructive")}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.name}
            </p>
          )}
          {formData.name && !errors.name && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Nom valide
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="description" className="flex items-center gap-2 mb-2">
            Description
            <span className="text-xs text-muted-foreground font-normal">
              ({formData.description.length}/500)
            </span>
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                handleChange('description', e.target.value);
              }
            }}
            rows={4}
            placeholder="Décrivez votre produit en détail : caractéristiques, état, inclusions..."
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Une bonne description augmente vos chances de vente
          </p>
        </div>

        <div>
          <Label htmlFor="category" className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4" />
            Catégorie
          </Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => handleChange('category_id', value)}
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
      </div>

      <Separator />

      {/* Section: Prix */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Tarification</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price" className="flex items-center gap-2 mb-2">
              Prix de vente (CFA) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="0"
              required
              className={cn(errors.price && "border-destructive")}
            />
            {errors.price && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.price}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="original_price" className="flex items-center gap-2 mb-2">
              Prix d'origine (CFA)
              <span className="text-xs text-muted-foreground font-normal">(optionnel)</span>
            </Label>
            <Input
              id="original_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.original_price}
              onChange={(e) => handleChange('original_price', e.target.value)}
              placeholder="0"
              className={cn(errors.original_price && "border-destructive")}
            />
            {errors.original_price && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.original_price}
              </p>
            )}
          </div>
        </div>

        {discountPercentage > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    Remise de {discountPercentage}% active
                  </p>
                  <p className="text-xs text-green-700">
                    Le badge de promotion sera affiché sur votre produit
                  </p>
                </div>
                <Badge variant="default" className="bg-green-600">
                  -{discountPercentage}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Section: Images */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Images du produit</h3>
          {formData.image_urls.length === 0 && (
            <Badge variant="outline" className="text-destructive border-destructive">
              Requis
            </Badge>
          )}
          {formData.image_urls.length > 0 && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              {formData.image_urls.length} image{formData.image_urls.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <MultiImageUpload
          bucket="product-images"
          currentImages={images}
          onUploadSuccess={(uploadedImages) => {
            setImages(uploadedImages);
            const urls = uploadedImages.map(img => img.url);
            setFormData(prev => ({
              ...prev,
              image_urls: urls,
              image_url: urls[0] || '' // Première image pour compatibilité
            }));
          }}
          maxImages={5}
          maxSizeMB={5}
        />
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800 flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Ajoutez jusqu'à 5 images de haute qualité (min. 800x800px).
              La première image sera utilisée comme image principale.
              Les clients pourront naviguer entre les images avec un carousel.
            </span>
          </p>
        </div>
      </div>

      <Separator />

      {/* Section: Stock et disponibilité */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Stock et disponibilité</h3>
        </div>

        <div>
          <Label htmlFor="stock_quantity" className="flex items-center gap-2 mb-2">
            Quantité en stock
          </Label>
          <Input
            id="stock_quantity"
            type="number"
            min="0"
            value={formData.stock_quantity}
            onChange={(e) => handleChange('stock_quantity', e.target.value)}
            placeholder="0"
            className={cn(errors.stock_quantity && "border-destructive")}
          />
          {errors.stock_quantity && (
            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.stock_quantity}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <StockIcon className={cn(
              "w-4 h-4",
              stockStatus.color === 'destructive' && "text-red-600",
              stockStatus.color === 'warning' && "text-orange-600",
              stockStatus.color === 'default' && "text-blue-600",
              stockStatus.color === 'success' && "text-green-600"
            )} />
            <span className={cn(
              "text-sm font-medium",
              stockStatus.color === 'destructive' && "text-red-600",
              stockStatus.color === 'warning' && "text-orange-600",
              stockStatus.color === 'default' && "text-blue-600",
              stockStatus.color === 'success' && "text-green-600"
            )}>
              {stockStatus.label}
            </span>
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-2 mb-3">
            <School className="w-4 h-4" />
            Visibilité par université
            {formData.university_filters.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {formData.university_filters.length} sélectionnée{formData.university_filters.length > 1 ? 's' : ''}
              </Badge>
            )}
          </Label>

          {universitiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {universities.map((uni) => {
                  const isSelected = formData.university_filters.includes(uni.id);
                  return (
                    <div
                      key={uni.id}
                      onClick={() => toggleUniversitySelection(uni.id)}
                      className={cn(
                        "relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200",
                        "hover:shadow-md hover:scale-[1.02]",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{uni.flag || '🎓'}</div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-medium text-sm truncate",
                            isSelected ? "text-primary" : "text-foreground"
                          )}>
                            {uni.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {uni.city}
                          </p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        )}>
                          {isSelected && (
                            <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    {formData.university_filters.length === 0
                      ? "Aucune université sélectionnée : le produit sera visible pour tous les étudiants de toutes les universités."
                      : `Produit visible uniquement pour les étudiants de ${formData.university_filters.length} université${formData.university_filters.length > 1 ? 's' : ''} sélectionnée${formData.university_filters.length > 1 ? 's' : ''}.`
                    }
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Enregistrement...
            </>
          ) : (
            editingProduct ? 'Mettre à jour le produit' : 'Ajouter le produit'
          )}
        </Button>
        {onClose && (
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="sm:w-auto"
          >
            Annuler
          </Button>
        )}
      </div>

      {!isFormValid && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-xs text-orange-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Veuillez remplir tous les champs obligatoires et télécharger une image avant de soumettre.
            </span>
          </p>
        </div>
      )}
    </form>
  );
}
