# Guide de Migration - Fonctionnalités Utilisateur

## Vue d'ensemble

Cette migration ajoute toutes les fonctionnalités essentielles côté utilisateur :
- ✅ Universités (7 universités pré-chargées)
- ✅ Panier d'achat
- ✅ Système de commandes
- ✅ Avis et notes sur les produits
- ✅ Notifications
- ✅ Liste de favoris

## Comment appliquer la migration

### Méthode 1 : Via Supabase CLI (Recommandée)

1. **Assurez-vous que Supabase CLI est installé et configuré**
   ```bash
   # Vérifier l'installation
   supabase --version

   # Si non installé
   npm install -g supabase
   ```

2. **Lier votre projet**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Appliquer la migration**
   ```bash
   supabase db push
   ```

### Méthode 2 : Via l'interface Supabase

1. Ouvrez votre projet sur [https://supabase.com](https://supabase.com)
2. Allez dans **SQL Editor**
3. Ouvrez le fichier `supabase/migrations/20251203000000_add_user_features.sql`
4. Copiez tout le contenu
5. Collez-le dans l'éditeur SQL de Supabase
6. Cliquez sur **Run** pour exécuter

## Vérification post-migration

Après avoir appliqué la migration, vérifiez que tout fonctionne :

### 1. Vérifier les tables créées

```sql
-- Dans SQL Editor de Supabase, exécutez :
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'universities',
  'cart_items',
  'orders',
  'order_items',
  'reviews',
  'notifications',
  'favorites'
);
```

Vous devriez voir les 7 tables listées.

### 2. Vérifier les universités

```sql
SELECT name, city, country FROM universities;
```

Vous devriez voir 7 universités.

### 3. Tester dans l'application

1. **Panier** : Ajoutez un produit au panier
2. **Universités** : Le sélecteur d'université devrait afficher les vraies universités
3. **Commandes** : Créez une commande de test
4. **Notifications** : Changez le statut d'une commande pour déclencher une notification

## Fonctionnalités automatiques

La migration inclut plusieurs fonctionnalités automatiques :

### 1. Mise à jour automatique du rating produit
Quand un utilisateur laisse un avis, le rating du produit est automatiquement recalculé.

### 2. Notifications automatiques
Quand le statut d'une commande change, l'utilisateur reçoit automatiquement une notification.

### 3. Vidage du panier
Quand une commande est créée, les produits commandés sont automatiquement retirés du panier.

### 4. Politiques de sécurité (RLS)
Toutes les tables ont des politiques Row Level Security :
- Les utilisateurs ne voient que leurs propres données
- Les fournisseurs voient leurs commandes
- Les administrateurs ont accès complet

## Nouveaux hooks disponibles

### Favoris
```typescript
import { useFavorites, useAddFavorite, useRemoveFavorite } from "@/hooks/use-favorites";
```

### Notifications
```typescript
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead
} from "@/hooks/use-notifications";
```

## Structure des données

### Universities
- `id` : UUID
- `name` : Nom de l'université
- `city` : Ville
- `country` : Pays
- `flag` : Emoji du drapeau
- `type` : 'public' ou 'private'
- `students_count` : Nombre d'étudiants (texte, ex: "80K+")

### Cart Items
- `user_id` : Référence à l'utilisateur
- `product_id` : Référence au produit
- `quantity` : Quantité
- **Contrainte** : Un utilisateur ne peut avoir qu'une seule ligne par produit

### Orders
- `user_id` : Utilisateur qui commande
- `supplier_id` : Fournisseur
- `total_amount` : Montant total
- `status` : 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
- `delivery_address` : Adresse de livraison
- `phone` : Numéro de téléphone

### Order Items
- `order_id` : Référence à la commande
- `product_id` : Produit commandé
- `quantity` : Quantité
- `price` : Prix au moment de la commande

### Reviews
- `user_id` : Utilisateur qui laisse l'avis
- `product_id` : Produit évalué
- `order_id` : Commande associée (optionnel)
- `rating` : Note de 1 à 5
- `comment` : Commentaire (optionnel)

### Notifications
- `user_id` : Destinataire
- `type` : 'order', 'message', 'product', 'system'
- `title` : Titre de la notification
- `message` : Message
- `link` : Lien optionnel
- `is_read` : Lu ou non

### Favorites
- `user_id` : Utilisateur
- `product_id` : Produit favori
- **Contrainte** : Un utilisateur ne peut favoriser qu'une fois le même produit

## Rollback (en cas de problème)

Si vous devez annuler la migration :

```sql
-- ATTENTION : Ceci supprimera toutes les données de ces tables !
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS universities CASCADE;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS update_product_rating() CASCADE;
DROP FUNCTION IF EXISTS notify_order_status_change() CASCADE;
DROP FUNCTION IF EXISTS clear_cart_after_order() CASCADE;
```

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans Supabase Dashboard > Database > Logs
2. Vérifiez que toutes les tables précédentes existent (profiles, suppliers, products, etc.)
3. Assurez-vous que la fonction `update_updated_at_column()` existe

## Prochaines étapes

Après la migration, vous pouvez :
1. Tester toutes les fonctionnalités utilisateur
2. Créer des commandes de test
3. Laisser des avis sur des produits
4. Vérifier les notifications
5. Ajouter des produits aux favoris

La plateforme est maintenant complète côté utilisateur ! 🎉
