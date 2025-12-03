import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Building, Globe, Scale, Phone, Mail, MapPin } from "lucide-react";

export default function LegalNotice() {
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
            <Scale className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Mentions{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Légales
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Informations légales obligatoires concernant CampusLink
            et l'exploitation de notre plateforme e-commerce.
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
                <Building className="w-5 h-5 text-primary" />
                1. Informations sur l'éditeur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Société :</h4>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>Raison sociale :</strong> MND Technologies SARL</p>
                    <p><strong>Nom commercial :</strong> CampusLink</p>
                    <p><strong>Forme juridique :</strong> Société à Responsabilité Limitée (SARL)</p>
                    <p><strong>Capital social :</strong> 10 000 000 FCFA</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Immatriculation :</h4>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>NINEA :</strong> 007851234567890</p>
                    <p><strong>Registre du Commerce :</strong> SN-DKR-2024-B-1234</p>
                    <p><strong>Code APE :</strong> 4791Z (Vente à distance)</p>
                    <p><strong>TVA :</strong> SN123456789</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                2. Siège social et contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Adresse du siège social :</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <p>MND Technologies SARL</p>
                    <p>Avenue Cheikh Anta Diop</p>
                    <p>Immeuble Tech Hub, 3ème étage</p>
                    <p>BP 12345 Dakar</p>
                    <p>Sénégal</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Coordonnées :</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">+221 77 123 45 67</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">contact@mndproduits.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">www.mndcampusconnect.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card>
            <CardHeader>
              <CardTitle>3. Direction et représentation légale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Gérance :</h4>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>Gérant :</strong> Amadou DIALLO</p>
                    <p><strong>Nationalité :</strong> Sénégalaise</p>
                    <p><strong>Fonction :</strong> Directeur Général</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Responsable publication :</h4>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>Directeur de publication :</strong> Amadou DIALLO</p>
                    <p><strong>Email :</strong> direction@mndproduits.com</p>
                    <p><strong>Responsable éditorial :</strong> Fatou NDIAYE</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card>
            <CardHeader>
              <CardTitle>4. Hébergement et infrastructure technique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Hébergeur principal :</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="space-y-2 text-blue-800">
                    <p><strong>Société :</strong> Vercel Inc.</p>
                    <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</p>
                    <p><strong>Contact :</strong> support@vercel.com</p>
                    <p><strong>Site web :</strong> www.vercel.com</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Base de données :</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="space-y-2 text-green-800">
                    <p><strong>Société :</strong> Supabase Inc.</p>
                    <p><strong>Adresse :</strong> 970 Toa Payoh North #07-04, Singapore 318992</p>
                    <p><strong>Contact :</strong> support@supabase.io</p>
                    <p><strong>Site web :</strong> www.supabase.com</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Services de paiement :</h4>
                <div className="space-y-3">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-orange-800 text-sm">
                      <strong>Stripe :</strong> Stripe Payments Europe, Ltd. - 1 Grand Canal Street Lower, Grand Canal Dock, Dublin 2, Irlande
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-purple-800 text-sm">
                      <strong>Wave :</strong> Wave Mobile Money Senegal - Rue de Thiong x Boulevard du Centenaire, Dakar, Sénégal
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card>
            <CardHeader>
              <CardTitle>5. Propriété intellectuelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Marques et brevets :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>CampusLink</strong> - Marque déposée n° 2024-001234 (OAPI)</li>
                  <li><strong>Logo MND</strong> - Marque figurative déposée n° 2024-001235 (OAPI)</li>
                  <li><strong>Slogan "CampusLink"</strong> - Marque verbale déposée n° 2024-001236 (OAPI)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Droits d'auteur :</h4>
                <p className="text-muted-foreground">
                  L'ensemble du contenu de ce site (textes, images, vidéos, design, architecture, etc.)
                  est protégé par le droit d'auteur. Toute reproduction, même partielle, est strictement
                  interdite sans autorisation écrite préalable de MND Technologies SARL.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Licences logicielles :</h4>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Framework :</strong> React (licence MIT)</p>
                  <p><strong>UI Components :</strong> shadcn/ui (licence MIT)</p>
                  <p><strong>Icons :</strong> Lucide React (licence ISC)</p>
                  <p><strong>Styling :</strong> Tailwind CSS (licence MIT)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card>
            <CardHeader>
              <CardTitle>6. Réglementation et conformité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Autorités de contrôle :</h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Commission de l'UEMOA (commerce électronique)</p>
                    <p className="text-sm text-muted-foreground">
                      01 BP 543 Ouagadougou 01, Burkina Faso
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">ARTP - Autorité de Régulation des Télécommunications</p>
                    <p className="text-sm text-muted-foreground">
                      Immeuble Fahd Ben Abdel Aziz, Route de Ngor, Dakar, Sénégal
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Certifications et agréments :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Agrément e-commerce UEMOA n° AGR-2024-001234</li>
                  <li>Certification PCI DSS pour la sécurité des paiements</li>
                  <li>Conformité RGPD pour la protection des données</li>
                  <li>Licence de change délivrée par la BCEAO</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Médiateur de la consommation :</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="space-y-2 text-blue-800">
                    <p><strong>Médiateur :</strong> Centre de Médiation de la Consommation du Sénégal</p>
                    <p><strong>Adresse :</strong> Avenue Bourguiba x Rue 6, Dakar, Sénégal</p>
                    <p><strong>Email :</strong> mediation@consommation.sn</p>
                    <p><strong>Site :</strong> www.mediation-consommation.sn</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card>
            <CardHeader>
              <CardTitle>7. Données personnelles et cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Responsable du traitement :</h4>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Société :</strong> MND Technologies SARL</p>
                  <p><strong>DPO :</strong> Moussa KANE</p>
                  <p><strong>Email :</strong> dpo@mndproduits.com</p>
                  <p><strong>Téléphone :</strong> +221 77 123 45 68</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Finalités du traitement :</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Gestion des comptes utilisateurs et authentification</li>
                  <li>Traitement des commandes et paiements</li>
                  <li>Service client et support technique</li>
                  <li>Amélioration de nos services</li>
                  <li>Communication marketing (avec consentement)</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 text-sm">
                  <strong>Vos droits :</strong> Vous disposez d'un droit d'accès, de rectification,
                  d'effacement, de portabilité et d'opposition concernant vos données personnelles.
                  Consultez notre <a href="/privacy-policy" className="underline">Politique de Confidentialité</a>
                  pour plus de détails.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card>
            <CardHeader>
              <CardTitle>8. Conditions particulières</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Accessibilité :</h4>
                <p className="text-muted-foreground">
                  CampusLink s'engage à rendre son site accessible conformément aux
                  standards WCAG 2.1 niveau AA. Un audit d'accessibilité est réalisé annuellement.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Environnement :</h4>
                <p className="text-muted-foreground">
                  Notre infrastructure est hébergée sur des serveurs alimentés par des énergies
                  renouvelables. Nous compensons notre empreinte carbone numérique par des
                  projets de reforestation au Sénégal.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Partenariats universitaires :</h4>
                <p className="text-muted-foreground">
                  CampusLink opère sous licence avec les universités partenaires.
                  Les conventions de partenariat sont disponibles sur demande auprès
                  des administrations universitaires concernées.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Contact pour questions légales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Pour toute question relative aux mentions légales ou à nos obligations réglementaires :
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Service Juridique</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Email : legal@mndproduits.com</p>
                      <p>Téléphone : +221 77 123 45 67</p>
                      <p>Horaires : Lun-Ven 8h-18h (GMT)</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Compliance & Réglementation</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Email : compliance@mndproduits.com</p>
                      <p>Téléphone : +221 77 123 45 69</p>
                      <p>Reporting : conformite.mndproduits.com</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700 text-sm">
                    <strong>Transparence :</strong> Ces mentions légales sont mises à jour régulièrement
                    pour refléter l'évolution de notre société et de la réglementation applicable.
                    Dernière vérification : 15 janvier 2024.
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