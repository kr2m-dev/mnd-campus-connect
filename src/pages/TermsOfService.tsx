import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FileText, Users, ShoppingCart, AlertTriangle, Scale, Mail } from "lucide-react";

export default function TermsOfService() {
  const navigate = useNavigate();

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => {};

  return (
    <div className="min-h-screen bg-background">
      <Header
        onUniversityChange={handleUniversityChange}
        onSupplierAccess={handleSupplierAccess}
        onStudentExchange={handleStudentExchange}
      />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Conditions{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              d'utilisation
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ces conditions d'utilisation régissent votre accès et votre utilisation
            de la plateforme MND Campus Connect.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Dernière mise à jour : 15 janvier 2024
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                1. Objet et champ d'application
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Définition du service :</h4>
                <p className="text-muted-foreground">
                  MND Campus Connect est une plateforme e-commerce dédiée aux étudiants universitaires
                  d'Afrique francophone, permettant l'achat de produits essentiels et les échanges
                  entre étudiants directement sur les campus universitaires.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Acceptation des conditions :</h4>
                <p className="text-muted-foreground">
                  En accédant à notre plateforme et en l'utilisant, vous acceptez d'être lié par ces
                  conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas
                  utiliser notre service.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 text-sm">
                  <strong>Important :</strong> Ces conditions peuvent être modifiées à tout moment.
                  Nous vous notifierons des changements importants par email ou via notre plateforme.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                2. Inscription et comptes utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Conditions d'inscription :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Être étudiant, personnel ou partenaire d'une université affiliée</li>
                  <li>Fournir des informations exactes et à jour</li>
                  <li>Être âgé d'au moins 16 ans</li>
                  <li>Accepter nos conditions d'utilisation et politique de confidentialité</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Responsabilités du compte :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Maintenir la confidentialité de vos identifiants</li>
                  <li>Notifier immédiatement tout accès non autorisé</li>
                  <li>Mettre à jour vos informations personnelles</li>
                  <li>Assumer la responsabilité de toutes les activités sous votre compte</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Types de comptes :</h4>
                <div className="space-y-2">
                  <div>
                    <strong>Étudiant :</strong> <span className="text-muted-foreground">Accès aux produits et services étudiants</span>
                  </div>
                  <div>
                    <strong>Personnel universitaire :</strong> <span className="text-muted-foreground">Accès étendu selon le statut</span>
                  </div>
                  <div>
                    <strong>Fournisseur :</strong> <span className="text-muted-foreground">Possibilité de vendre des produits sur la plateforme</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                3. Utilisation de la plateforme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Usages autorisés :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Parcourir et acheter des produits disponibles</li>
                  <li>Créer et gérer votre profil utilisateur</li>
                  <li>Interagir avec d'autres utilisateurs de manière respectueuse</li>
                  <li>Partager des avis et évaluations honnêtes</li>
                  <li>Utiliser les fonctionnalités d'échange entre étudiants</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Usages interdits :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Vendre des produits illégaux ou dangereux</li>
                  <li>Publier du contenu offensant ou discriminatoire</li>
                  <li>Tenter de contourner les mesures de sécurité</li>
                  <li>Utiliser des bots ou scripts automatisés</li>
                  <li>Violer les droits de propriété intellectuelle</li>
                  <li>Spammer ou harceler d'autres utilisateurs</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">
                  <strong>Sanctions :</strong> La violation de ces règles peut entraîner
                  la suspension temporaire ou permanente de votre compte.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card>
            <CardHeader>
              <CardTitle>4. Commandes et paiements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Processus de commande :</h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Sélection des produits et ajout au panier</li>
                  <li>Vérification des informations de livraison</li>
                  <li>Choix du mode de paiement</li>
                  <li>Confirmation et validation de la commande</li>
                  <li>Réception de la confirmation par email</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Moyens de paiement acceptés :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Cartes bancaires (Visa, Mastercard)</li>
                  <li>Paiements mobiles (Orange Money, MTN Money)</li>
                  <li>Virements bancaires</li>
                  <li>Paiement à la livraison (selon disponibilité)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Politique de prix :</h4>
                <p className="text-muted-foreground">
                  Les prix affichés sont en francs CFA et incluent toutes les taxes applicables.
                  Nous nous réservons le droit de modifier les prix à tout moment, mais les commandes
                  confirmées ne seront pas affectées.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card>
            <CardHeader>
              <CardTitle>5. Livraison et retours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Modalités de livraison :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Livraison sur le campus universitaire</li>
                  <li>Points de retrait désignés sur le campus</li>
                  <li>Délai standard : 2-3 jours ouvrables</li>
                  <li>Livraison gratuite à partir de 25 000 FCFA</li>
                  <li>Notification par SMS/email lors de la livraison</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Politique de retour :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Retour possible dans les 14 jours suivant la réception</li>
                  <li>Produits en état neuf et dans leur emballage d'origine</li>
                  <li>Remboursement ou échange selon votre préférence</li>
                  <li>Frais de retour à la charge du client (sauf défaut)</li>
                  <li>Certains produits d'hygiène ne peuvent être retournés</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                6. Limitation de responsabilité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Responsabilité de MND :</h4>
                <p className="text-muted-foreground">
                  MND Campus Connect agit en tant qu'intermédiaire entre les acheteurs et les vendeurs.
                  Notre responsabilité est limitée au bon fonctionnement de la plateforme et au
                  traitement des transactions.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Exclusions de responsabilité :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Qualité des produits vendus par les fournisseurs tiers</li>
                  <li>Interruptions de service dues à des causes externes</li>
                  <li>Pertes de données dues à des problèmes techniques</li>
                  <li>Dommages indirects ou préjudices commerciaux</li>
                  <li>Actions des utilisateurs tiers sur la plateforme</li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-700 text-sm">
                  <strong>Force majeure :</strong> MND ne peut être tenu responsable des retards
                  ou défaillances causés par des événements indépendants de sa volonté.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card>
            <CardHeader>
              <CardTitle>7. Propriété intellectuelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Droits de MND :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Marques, logos et éléments graphiques</li>
                  <li>Code source et architecture de la plateforme</li>
                  <li>Contenu éditorial et descriptions</li>
                  <li>Bases de données et algorithmes</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Droits des utilisateurs :</h4>
                <p className="text-muted-foreground">
                  Vous conservez vos droits sur le contenu que vous publiez, mais vous accordez
                  à MND une licence d'utilisation pour afficher ce contenu sur la plateforme.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Respect des droits tiers :</h4>
                <p className="text-muted-foreground">
                  Vous vous engagez à ne pas publier de contenu violant les droits de propriété
                  intellectuelle de tiers. Nous nous réservons le droit de retirer tout contenu
                  signalé comme contrefaisant.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                8. Résolution des litiges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Procédure de réclamation :</h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Contact du service client via notre plateforme</li>
                  <li>Exposé détaillé du problème avec preuves</li>
                  <li>Médiation avec les parties concernées</li>
                  <li>Proposition de solution amiable</li>
                  <li>Escalade vers la direction si nécessaire</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Droit applicable :</h4>
                <p className="text-muted-foreground">
                  Ces conditions sont régies par le droit sénégalais. En cas de litige,
                  les tribunaux de Dakar seront seuls compétents.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Médiation :</h4>
                <p className="text-muted-foreground">
                  Avant tout recours judiciaire, nous encourageons la résolution amiable
                  des différends par médiation auprès d'un organisme reconnu.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Questions et contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Pour toute question concernant ces conditions d'utilisation :
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Service Juridique</h4>
                    <p className="text-sm text-muted-foreground">
                      Email : legal@mndproduits.com<br />
                      Téléphone : +221 77 123 45 67
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Support Client</h4>
                    <p className="text-sm text-muted-foreground">
                      Email : support@mndproduits.com<br />
                      Chat en ligne disponible 24h/7j
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 text-sm">
                    <strong>Engagement :</strong> Nous nous engageons à répondre à toutes vos questions
                    dans un délai de 48 heures maximum.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}