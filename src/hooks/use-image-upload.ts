import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UploadedImage {
  file: File;
  url: string;
  path: string;
}

interface UseImageUploadOptions {
  bucket: "student-listings" | "products";
  maxFiles?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export const useImageUpload = ({
  bucket,
  maxFiles = 5,
  maxSizeMB = 5,
  allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
}: UseImageUploadOptions) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Valide un fichier image
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Vérifier le type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(", ")}`
      };
    }

    // Vérifier la taille
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return {
        valid: false,
        error: `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`
      };
    }

    return { valid: true };
  };

  /**
   * Génère un nom de fichier unique
   */
  const generateFileName = (file: File, userId: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split(".").pop();
    return `${userId}/${timestamp}-${randomString}.${extension}`;
  };

  /**
   * Upload un seul fichier vers Supabase Storage
   */
  const uploadSingleFile = async (
    file: File,
    userId: string
  ): Promise<{ url: string; path: string } | null> => {
    // Valider le fichier
    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        title: "Erreur de validation",
        description: validation.error,
        variant: "destructive"
      });
      return null;
    }

    // Générer le nom du fichier
    const filePath = generateFileName(file, userId);

    try {
      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        url: publicUrl,
        path: data.path
      };
    } catch (error: any) {
      console.error("Erreur lors de l'upload:", error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible d'uploader le fichier",
        variant: "destructive"
      });
      return null;
    }
  };

  /**
   * Upload plusieurs fichiers
   */
  const uploadMultipleFiles = async (
    files: File[]
  ): Promise<{ urls: string[]; paths: string[] }> => {
    // Vérifier le nombre de fichiers
    if (files.length > maxFiles) {
      toast({
        title: "Trop de fichiers",
        description: `Vous ne pouvez uploader que ${maxFiles} fichiers maximum`,
        variant: "destructive"
      });
      return { urls: [], paths: [] };
    }

    // Obtenir l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour uploader des images",
        variant: "destructive"
      });
      return { urls: [], paths: [] };
    }

    setIsUploading(true);
    setUploadProgress(0);

    const uploadedUrls: string[] = [];
    const uploadedPaths: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const result = await uploadSingleFile(files[i], user.id);

        if (result) {
          uploadedUrls.push(result.url);
          uploadedPaths.push(result.path);
        }

        // Mettre à jour la progression
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      if (uploadedUrls.length > 0) {
        toast({
          title: "Upload réussi",
          description: `${uploadedUrls.length} image(s) uploadée(s) avec succès`
        });
      }

      return { urls: uploadedUrls, paths: uploadedPaths };
    } catch (error: any) {
      console.error("Erreur lors de l'upload multiple:", error);
      toast({
        title: "Erreur",
        description: "Certains fichiers n'ont pas pu être uploadés",
        variant: "destructive"
      });
      return { urls: uploadedUrls, paths: uploadedPaths };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Supprime un fichier du storage
   */
  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur de suppression",
        description: error.message || "Impossible de supprimer le fichier",
        variant: "destructive"
      });
      return false;
    }
  };

  /**
   * Supprime plusieurs fichiers
   */
  const deleteMultipleFiles = async (filePaths: string[]): Promise<number> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove(filePaths);

      if (error) {
        throw error;
      }

      return data?.length || 0;
    } catch (error: any) {
      console.error("Erreur lors de la suppression multiple:", error);
      toast({
        title: "Erreur",
        description: "Certains fichiers n'ont pas pu être supprimés",
        variant: "destructive"
      });
      return 0;
    }
  };

  return {
    uploadSingleFile,
    uploadMultipleFiles,
    deleteFile,
    deleteMultipleFiles,
    isUploading,
    uploadProgress
  };
};
