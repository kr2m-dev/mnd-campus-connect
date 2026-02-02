import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Shield, Eye, Cookie, Database, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => {};

  return (
    <div className="min-h-screen bg-background">
      <Header
        onUniversityChange={handleUniversityChange}
      />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Politique de{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Confidentialité
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Votre vie privée est importante pour nous. Cette politique explique comment nous collectons,
            utilisons et protégeons vos données personnelles.
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
                <Database className="w-5 h-5 text-primary" />
                1. Collecte des données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Données personnelles collectées :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Nom, prénom et adresse email</li>
                  <li>Université d'appartenance</li>
                  <li>Type de compte (étudiant, personnel, fournisseur)</li>
                  <li>Historique des commandes et préférences</li>
                  <li>Données de navigation et d'utilisation</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Méthodes de collecte :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Inscription et création de compte</li>
                  <li>Passation de commandes</li>
                  <li>Utilisation de notre plateforme</li>
                  <li>Cookies et technologies similaires</li>
                  <li>Communications avec notre support</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                2. Utilisation des données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Nous utilisons vos données pour :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Fournir et améliorer nos services</li>
                  <li>Traiter vos commandes et transactions</li>
                  <li>Personnaliser votre expérience utilisateur</li>
                  <li>Communiquer avec vous sur nos services</li>
                  <li>Assurer la sécurité de notre plateforme</li>
                  <li>Respecter nos obligations légales</li>
                  <li>Analyser l'utilisation pour améliorer nos services</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-blue-800">Base légale du traitement :</h4>
                <p className="text-blue-700 text-sm">
                  Nous traitons vos données sur la base de votre consentement, de l'exécution contractuelle,
                  de nos intérêts légitimes et du respect de nos obligations légales.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="w-5 h-5 text-primary" />
                3. Cookies et technologies similaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Types de cookies utilisés :</h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium">Cookies essentiels</h5>
                    <p className="text-sm text-muted-foreground">
                      Nécessaires au fonctionnement de base de notre site (authentification, panier)
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium">Cookies de performance</h5>
                    <p className="text-sm text-muted-foreground">
                      Nous aident à comprendre comment vous utilisez notre site pour l'améliorer
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium">Cookies de personnalisation</h5>
                    <p className="text-sm text-muted-foreground">
                      Retiennent vos préférences pour personnaliser votre expérience
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-700 text-sm">
                  <strong>Gestion des cookies :</strong> Vous pouvez configurer vos préférences de cookies
                  dans les paramètres de votre navigateur ou via notre centre de préférences.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                4. Protection et sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Mesures de sécurité :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Chiffrement SSL/TLS pour toutes les transmissions</li>
                  <li>Stockage sécurisé des données avec accès restreint</li>
                  <li>Authentification à deux facteurs disponible</li>
                  <li>Surveillance continue des activités suspectes</li>
                  <li>Audits de sécurité réguliers</li>
                  <li>Formation du personnel sur la protection des données</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Conservation des données :</h4>
                <p className="text-muted-foreground">
                  Nous conservons vos données personnelles aussi longtemps que nécessaire pour
                  fournir nos services ou respecter nos obligations légales. Les données de compte
                  inactif sont supprimées après 3 ans d'inactivité.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card>
            <CardHeader>
              <CardTitle>5. Vos droits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Vous avez le droit de :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Accès :</strong> Demander une copie de vos données personnelles</li>
                  <li><strong>Rectification :</strong> Corriger des données inexactes ou incomplètes</li>
                  <li><strong>Effacement :</strong> Demander la suppression de vos données</li>
                  <li><strong>Limitation :</strong> Restreindre le traitement de vos données</li>
                  <li><strong>Portabilité :</strong> Recevoir vos données dans un format structuré</li>
                  <li><strong>Opposition :</strong> Vous opposer au traitement de vos données</li>
                  <li><strong>Retrait du consentement :</strong> Retirer votre consentement à tout moment</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-green-800">Comment exercer vos droits :</h4>
                <p className="text-green-700 text-sm mb-2">
                  Contactez-nous à <strong>privacy@sencampuslink.com</strong> ou via votre espace personnel.
                </p>
                <p className="text-green-700 text-sm">
                  Nous répondrons à votre demande dans un délai de 30 jours maximum.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card>
            <CardHeader>
              <CardTitle>6. Partage des données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Nous partageons vos données uniquement avec :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Les fournisseurs partenaires pour traiter vos commandes</li>
                  <li>Les prestataires de services techniques (hébergement, paiement)</li>
                  <li>Les autorités légales si requis par la loi</li>
                  <li>Votre université dans le cadre de notre partenariat</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">
                  <strong>Engagement :</strong> Nous ne vendons jamais vos données personnelles à des tiers
                  à des fins commerciales.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Contact et questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Délégué à la Protection des Données</h4>
                    <p className="text-sm text-muted-foreground">
                      Email : privacy@sencampuslink.com<br />
                      Téléphone : +221 77 123 45 67
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Adresse postale</h4>
                    <p className="text-sm text-muted-foreground">
                      CampusLink<br />
                      Service Protection des Données<br />
                      Dakar, Sénégal
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700 text-sm">
                    <strong>Droit de réclamation :</strong> Vous avez également le droit de déposer
                    une réclamation auprès de l'autorité de protection des données compétente.
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