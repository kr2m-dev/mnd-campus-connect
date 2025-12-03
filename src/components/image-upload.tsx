import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadFile, deleteFile, validateFile, type StorageBucket } from '@/lib/storage-helper';
import { toast } from 'sonner';

interface ImageUploadProps {
  bucket: StorageBucket;
  currentImageUrl?: string;
  onUploadSuccess: (url: string, path: string) => void;
  onDelete?: () => void;
  userId?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  className?: string;
  label?: string;
}

export function ImageUpload({
  bucket,
  currentImageUrl,
  onUploadSuccess,
  onDelete,
  userId,
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = '',
  label = 'Télécharger une image',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file, maxSizeMB, allowedTypes);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const result = await uploadFile({
        bucket,
        file,
        userId,
      });

      if (result.error || !result.url || !result.path) {
        toast.error('Erreur lors du téléchargement de l\'image');
        setPreviewUrl(currentImageUrl);
        return;
      }

      toast.success('Image téléchargée avec succès');
      onUploadSuccess(result.url, result.path);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors du téléchargement');
      setPreviewUrl(currentImageUrl);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!currentImageUrl || !onDelete) return;

    try {
      // Extract path from URL
      const urlParts = currentImageUrl.split(`/${bucket}/`);
      if (urlParts.length === 2) {
        const path = urlParts[1];
        const error = await deleteFile(bucket, path);

        if (error) {
          toast.error('Erreur lors de la suppression de l\'image');
          return;
        }
      }

      setPreviewUrl(undefined);
      onDelete();
      toast.success('Image supprimée avec succès');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        {previewUrl ? (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {onDelete && !isUploading && (
              <button
                onClick={handleDelete}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}

        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
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
                {label}
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500">
            Formats acceptés: {allowedTypes.map(t => t.split('/')[1]).join(', ')}
            <br />
            Taille max: {maxSizeMB}MB
          </p>
        </div>
      </div>
    </div>
  );
}
