import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadFile, deleteFile, validateFile, type StorageBucket } from '@/lib/storage-helper';
import { toast } from 'sonner';

interface MultiImageUploadProps {
  bucket: StorageBucket;
  currentImages?: Array<{ url: string; path: string }>;
  onUploadSuccess: (images: Array<{ url: string; path: string }>) => void;
  userId?: string;
  maxImages?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
  className?: string;
}

export function MultiImageUpload({
  bucket,
  currentImages = [],
  onUploadSuccess,
  userId,
  maxImages = 5,
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = '',
}: MultiImageUploadProps) {
  const [images, setImages] = useState<Array<{ url: string; path: string }>>(currentImages);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      toast.error(`Vous ne pouvez télécharger que ${maxImages} images maximum`);
      return;
    }

    // Validate all files
    for (const file of files) {
      const validationError = validateFile(file, maxSizeMB, allowedTypes);
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

    // Upload files
    setIsUploading(true);
    try {
      const uploadPromises = files.map((file) =>
        uploadFile({
          bucket,
          file,
          userId,
        })
      );

      const results = await Promise.all(uploadPromises);

      // Check for errors
      const failedUploads = results.filter((r) => r.error || !r.url || !r.path);
      if (failedUploads.length > 0) {
        toast.error(`Erreur lors du téléchargement de ${failedUploads.length} image(s)`);
      }

      // Add successful uploads to the images array
      const successfulUploads = results
        .filter((r) => !r.error && r.url && r.path)
        .map((r) => ({ url: r.url!, path: r.path! }));

      const updatedImages = [...images, ...successfulUploads];
      setImages(updatedImages);
      onUploadSuccess(updatedImages);

      if (successfulUploads.length > 0) {
        toast.success(`${successfulUploads.length} image(s) téléchargée(s) avec succès`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (index: number) => {
    const imageToDelete = images[index];

    try {
      const error = await deleteFile(bucket, imageToDelete.path);

      if (error) {
        toast.error('Erreur lors de la suppression de l\'image');
        return;
      }

      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);
      onUploadSuccess(updatedImages);
      toast.success('Image supprimée avec succès');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.path}
            className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
          >
            <img
              src={image.url}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handleDelete(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
              type="button"
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {canAddMore && (
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Ajouter</span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading || !canAddMore}
        multiple
      />

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {images.length} / {maxImages} images
        </span>
        <span>
          Max {maxSizeMB}MB par image
        </span>
      </div>

      {canAddMore && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Téléchargement...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Ajouter des images
            </>
          )}
        </Button>
      )}
    </div>
  );
}
