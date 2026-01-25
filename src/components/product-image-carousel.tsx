import { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductImageCarouselProps {
  images: string[];
  productName: string;
  className?: string;
  aspectRatio?: 'square' | 'video';
}

export function ProductImageCarousel({
  images,
  productName,
  className = '',
  aspectRatio = 'square',
}: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Si pas d'images, afficher un placeholder
  if (!images || images.length === 0) {
    return (
      <div className={cn(
        "relative w-full bg-muted rounded-lg flex items-center justify-center",
        aspectRatio === 'square' ? 'aspect-square' : 'aspect-video',
        className
      )}>
        <div className="text-center text-muted-foreground">
          <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucune image disponible</p>
        </div>
      </div>
    );
  }

  // Si une seule image, pas besoin de carousel
  if (images.length === 1) {
    return (
      <div className={cn(
        "relative w-full rounded-lg overflow-hidden",
        aspectRatio === 'square' ? 'aspect-square' : 'aspect-video',
        className
      )}>
        <img
          src={images[0]}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={cn(
      "relative w-full rounded-lg overflow-hidden group",
      aspectRatio === 'square' ? 'aspect-square' : 'aspect-video',
      className
    )}>
      {/* Image principale */}
      <img
        src={images[currentIndex]}
        alt={`${productName} - Image ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />

      {/* Boutons de navigation - toujours visibles avec opacité réduite */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goToPrevious();
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 opacity-70 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goToNext();
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 opacity-70 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Indicateurs de position */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 bg-black/40 px-3 py-1.5 rounded-full z-20">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all cursor-pointer",
              index === currentIndex
                ? "bg-white w-6"
                : "bg-white/50 hover:bg-white/75"
            )}
            aria-label={`Aller à l'image ${index + 1}`}
          />
        ))}
      </div>

      {/* Compteur d'images */}
      <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Miniatures (optionnel, visible uniquement sur grands écrans) */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity hidden md:block z-10">
        <div className="flex gap-2 justify-center mb-8">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={cn(
                "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                index === currentIndex
                  ? "border-white scale-110"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img
                src={image}
                alt={`Miniature ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
