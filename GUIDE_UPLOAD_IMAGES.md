# Guide d'Implémentation de l'Upload d'Images avec Supabase Storage

Ce guide explique comment l'upload d'images a été implémenté dans votre application et comment l'utiliser.

## 📋 Table des Matières
1. [Architecture](#architecture)
2. [Configuration Supabase](#configuration-supabase)
3. [Utilisation](#utilisation)
4. [Fonctionnalités](#fonctionnalités)
5. [Dépannage](#dépannage)

---

## 🏗️ Architecture

### Fichiers créés

1. **Migration Supabase Storage** (`supabase/migrations/20251204000001_create_storage_buckets.sql`)
   - Crée les buckets de stockage
   - Configure les politiques RLS (Row Level Security)
   - Définit les permissions d'accès

2. **Hook personnalisé** (`src/hooks/use-image-upload.ts`)
   - Gère l'upload d'images
   - Validation des fichiers
   - Suppression d'images
   - Barre de progression

3. **Intégration dans CreateListing** (`src/pages/CreateListing.tsx`)
   - Formulaire avec upload d'images
   - Prévisualisation des images
   - Gestion des erreurs

---

## ⚙️ Configuration Supabase

### Étape 1 : Appliquer les migrations

```bash
# Si vous utilisez Supabase CLI
supabase migration up

# Ou via le Dashboard Supabase
# Allez dans Database > Migrations et exécutez manuellement le SQL
```

### Étape 2 : Vérifier les buckets

Connectez-vous à votre [Dashboard Supabase](https://app.supabase.com) :

1. Allez dans **Storage**
2. Vous devriez voir deux buckets :
   - `student-listings` (pour les annonces étudiantes)
   - `products` (pour les produits des fournisseurs)

### Étape 3 : Vérifier les politiques

Dans chaque bucket, vous devriez avoir ces politiques :

**Permissions :**
- ✅ **SELECT** : Public (tout le monde peut voir)
- ✅ **INSERT** : Authentifié (utilisateurs connectés)
- ✅ **UPDATE** : Propriétaire uniquement
- ✅ **DELETE** : Propriétaire uniquement

---

## 🚀 Utilisation

### Upload d'images lors de la création d'annonce

```typescript
// Le hook est déjà intégré dans CreateListing.tsx
const {
  uploadMultipleFiles,
  deleteMultipleFiles,
  isUploading,
  uploadProgress
} = useImageUpload({
  bucket: "student-listings",
  maxFiles: 5,
  maxSizeMB: 5
});
```

### Processus d'upload automatique

1. **L'utilisateur sélectionne des images** :
   - Via le bouton "Choisir des fichiers"
   - Ou par glisser-déposer (à implémenter)

2. **Validation automatique** :
   - Type de fichier (JPG, PNG, WebP, GIF)
   - Taille (max 5MB par image)
   - Nombre maximum (5 images)

3. **Upload vers Supabase** :
   - Les images sont uploadées dans `student-listings/{user_id}/`
   - Chaque fichier reçoit un nom unique
   - L'URL publique est retournée

4. **Sauvegarde dans la BDD** :
   - Les URLs sont stockées dans `student_listings.image_urls`
   - Type de colonne : `TEXT[]` (array de texte)

---

## ✨ Fonctionnalités

### 1. Validation des fichiers

```typescript
// Validation automatique
const validation = {
  types: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
  maxSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 5
};
```

### 2. Nommage unique des fichiers

Format : `{user_id}/{timestamp}-{random}.{extension}`

Exemple : `abc123-def456/1701234567890-x7k2m9.jpg`

### 3. Barre de progression

```typescript
// Affichée automatiquement pendant l'upload
{isUploading && <Progress value={uploadProgress} />}
```

### 4. Prévisualisation des images

Les images sont affichées avant l'upload avec possibilité de suppression :

```tsx
{imageFiles.map((file, index) => (
  <div key={index} className="relative">
    <img src={URL.createObjectURL(file)} />
    <button onClick={() => removeImage(index)}>
      <X />
    </button>
  </div>
))}
```

### 5. Suppression des images

```typescript
// Suppression du storage ET de la liste
await deleteMultipleFiles([imagePath]);
```

---

## 🔧 API du Hook `useImageUpload`

### Configuration

```typescript
const imageUpload = useImageUpload({
  bucket: "student-listings" | "products",
  maxFiles: 5,              // Nombre max de fichiers
  maxSizeMB: 5,            // Taille max par fichier (MB)
  allowedTypes: [          // Types acceptés
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif"
  ]
});
```

### Méthodes disponibles

#### 1. `uploadMultipleFiles(files: File[])`

Upload plusieurs fichiers en une fois.

```typescript
const { urls, paths } = await uploadMultipleFiles(files);
// urls: ["https://...", "https://..."]
// paths: ["user_id/file1.jpg", "user_id/file2.jpg"]
```

#### 2. `uploadSingleFile(file: File, userId: string)`

Upload un seul fichier.

```typescript
const result = await uploadSingleFile(file, userId);
// result: { url: "https://...", path: "user_id/file.jpg" }
```

#### 3. `deleteFile(filePath: string)`

Supprime un fichier.

```typescript
const success = await deleteFile("user_id/file.jpg");
// success: true | false
```

#### 4. `deleteMultipleFiles(filePaths: string[])`

Supprime plusieurs fichiers.

```typescript
const count = await deleteMultipleFiles(["path1", "path2"]);
// count: nombre de fichiers supprimés
```

### États disponibles

```typescript
const { isUploading, uploadProgress } = useImageUpload({...});

isUploading    // true pendant l'upload
uploadProgress // 0-100 (pourcentage)
```

---

## 📱 Exemple d'utilisation complète

```typescript
import { useImageUpload } from "@/hooks/use-image-upload";

function MyComponent() {
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const {
    uploadMultipleFiles,
    isUploading,
    uploadProgress
  } = useImageUpload({
    bucket: "student-listings",
    maxFiles: 5,
    maxSizeMB: 5
  });

  const handleSubmit = async () => {
    // Upload les images
    const { urls, paths } = await uploadMultipleFiles(imageFiles);

    // Sauvegarder les URLs dans la BDD
    await saveListing({
      ...otherData,
      image_urls: urls
    });
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
      />

      {isUploading && (
        <Progress value={uploadProgress} />
      )}

      <button onClick={handleSubmit}>
        Publier
      </button>
    </div>
  );
}
```

---

## 🐛 Dépannage

### Problème : "Storage bucket not found"

**Solution :** Appliquez la migration storage :
```bash
supabase migration up
```

### Problème : "Permission denied"

**Solution :** Vérifiez les politiques RLS dans le dashboard Supabase Storage.

### Problème : "File too large"

**Solution :** L'image dépasse 5MB. Réduisez la taille ou augmentez la limite dans le hook.

### Problème : "Invalid file type"

**Solution :** Seuls JPG, PNG, WebP et GIF sont acceptés. Convertissez votre image.

### Problème : Les images ne s'affichent pas

**Vérifications :**
1. Le bucket est-il public ? ✓
2. Les URLs sont-elles correctement stockées ? ✓
3. Les politiques SELECT sont-elles configurées ? ✓

---

## 📊 Structure de stockage

```
Bucket: student-listings
├── user_id_1/
│   ├── 1701234567890-abc123.jpg
│   ├── 1701234567891-def456.png
│   └── ...
├── user_id_2/
│   ├── 1701234567892-ghi789.jpg
│   └── ...
└── ...
```

**Avantages :**
- Organisation par utilisateur
- Facile à nettoyer si un utilisateur est supprimé
- Permissions granulaires
- Noms uniques garantis

---

## 🔒 Sécurité

### Politiques RLS implémentées

1. **Lecture (SELECT)** : Public
   - Tout le monde peut voir les images

2. **Création (INSERT)** : Authentifié
   - Seuls les utilisateurs connectés peuvent uploader

3. **Modification (UPDATE)** : Propriétaire
   - Seul le propriétaire peut modifier ses images

4. **Suppression (DELETE)** : Propriétaire
   - Seul le propriétaire peut supprimer ses images

### Validation côté client

- Type de fichier
- Taille de fichier
- Nombre de fichiers

### Protection côté serveur

- RLS Supabase
- Politiques de bucket
- Authentification requise

---

## 🎯 Prochaines étapes (optionnel)

### Améliorations possibles :

1. **Compression d'images** : Réduire automatiquement la taille
2. **Glisser-déposer** : Interface drag & drop
3. **Recadrage** : Permettre le crop des images
4. **Miniatures** : Générer des thumbnails automatiquement
5. **Filigrane** : Ajouter un watermark
6. **CDN** : Utiliser un CDN pour la distribution

### Code exemple pour la compression :

```typescript
import imageCompression from 'browser-image-compression';

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };

  return await imageCompression(file, options);
};
```

---

## 📚 Ressources

- [Documentation Supabase Storage](https://supabase.com/docs/guides/storage)
- [Politiques RLS Storage](https://supabase.com/docs/guides/storage/security/access-control)
- [Upload avec React](https://supabase.com/docs/guides/storage/uploads/standard-uploads)

---

## ✅ Checklist de vérification

Avant de déployer en production :

- [ ] Migrations appliquées
- [ ] Buckets créés et publics
- [ ] Politiques RLS configurées
- [ ] Tests d'upload réussis
- [ ] Tests de suppression réussis
- [ ] Validation des fichiers testée
- [ ] Gestion d'erreurs testée
- [ ] Limite de taille vérifiée

---

**Implémenté par :** Claude Code
**Date :** 2024-12-04
**Version :** 1.0
