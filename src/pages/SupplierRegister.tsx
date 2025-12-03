import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Store, Building, Phone, MapPin, ArrowRight, Sparkles, CheckCircle, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/image-upload";

export default function SupplierRegister() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};

  const [formData, setFormData] = useState({
    // Données utilisateur
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    // Données fournisseur
    businessName: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    contactWhatsapp: "",
    address: "",
    logoUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    if (!formData.businessName) {
      toast({
        title: "Erreur",
        description: "Le nom de l'entreprise est requis",
        variant: "destructive",
      });
      return;
    }

    if (!formData.contactWhatsapp) {
      toast({
        title: "Erreur",
        description: "Le numéro WhatsApp est requis pour recevoir les commandes",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1. Créer le compte utilisateur
      const result = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: "fournisseur",
        universityId: "", // Pas d'université pour les fournisseurs
        universityName: "",
      });

      if (!result.success) {
        return;
      }

      // 2. Créer le profil fournisseur
      const { error: supplierError } = await supabase
        .from("suppliers")
        .insert({
          user_id: result.user?.id,
          business_name: formData.businessName,
          description: formData.description || null,
          contact_email: formData.contactEmail || formData.email,
          contact_phone: formData.contactPhone || null,
          contact_whatsapp: formData.contactWhatsapp,
          address: formData.address || null,
          logo_url: formData.logoUrl || null,
          is_verified: false,
        });

      if (supplierError) {
        console.error("Erreur lors de la création du profil fournisseur:", supplierError);
        toast({
          title: "Erreur",
          description: "Compte créé mais erreur lors de la création du profil fournisseur",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Inscription réussie !",
        description: "Votre compte fournisseur a été créé avec succès. Vérifiez votre email pour confirmer votre compte.",
      });

      // Rediriger vers la page de connexion
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <Header onUniversityChange={handleUniversityChange} />

      <div className="flex items-center justify-center p-4 pt-10 pb-10">
        <div className="w-full max-w-2xl space-y-6">
          {/* Logo and Brand */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Store className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                Devenir Fournisseur
                <Sparkles className="w-6 h-6 text-primary" />
              </h1>
              <p className="text-muted-foreground">Créez votre espace fournisseur et commencez à vendre</p>
            </div>
          </div>

          {/* Registration Form */}
          <Card className="shadow-2xl border-none bg-gradient-to-br from-background/95 to-background backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-center">Inscription Fournisseur</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section Informations Personnelles */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Informations Personnelles
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-semibold">Prénom *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="Modou"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="h-11 border-2 focus:border-primary transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-semibold">Nom *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="DIOP"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="h-11 border-2 focus:border-primary transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="votre.email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 h-11 border-2 focus:border-primary transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold">Mot de passe *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 6 caractères"
                          value={formData.password}
                          onChange={handleChange}
                          className="pl-10 pr-10 h-11 border-2 focus:border-primary transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirmer *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirmer"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="pl-10 pr-10 h-11 border-2 focus:border-primary transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Informations Entreprise */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    Informations Entreprise
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-sm font-semibold">Nom de l'entreprise *</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      type="text"
                      placeholder="Ma Super Entreprise"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="h-11 border-2 focus:border-primary transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Décrivez votre entreprise et vos produits..."
                      value={formData.description}
                      onChange={handleChange}
                      className="border-2 focus:border-primary transition-all resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail" className="text-sm font-semibold">Email de contact</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          placeholder="contact@entreprise.com"
                          value={formData.contactEmail}
                          onChange={handleChange}
                          className="pl-10 h-11 border-2 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone" className="text-sm font-semibold">Téléphone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="contactPhone"
                          name="contactPhone"
                          type="tel"
                          placeholder="77 123 45 67"
                          value={formData.contactPhone}
                          onChange={handleChange}
                          className="pl-10 h-11 border-2 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactWhatsapp" className="text-sm font-semibold">WhatsApp * (pour recevoir les commandes)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                      <Input
                        id="contactWhatsapp"
                        name="contactWhatsapp"
                        type="tel"
                        placeholder="77 123 45 67"
                        value={formData.contactWhatsapp}
                        onChange={handleChange}
                        className="pl-10 h-11 border-2 focus:border-primary transition-all"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Les commandes seront envoyées directement sur ce numéro WhatsApp
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-semibold">Adresse</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="123 Rue Example, Dakar"
                        value={formData.address}
                        onChange={handleChange}
                        className="pl-10 h-11 border-2 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Image className="w-4 h-4 text-primary" />
                      Logo de l'entreprise (optionnel)
                    </Label>
                    <ImageUpload
                      bucket="supplier-logos"
                      currentImageUrl={formData.logoUrl}
                      onUploadSuccess={(url) => {
                        setFormData(prev => ({ ...prev, logoUrl: url }));
                      }}
                      onDelete={() => {
                        setFormData(prev => ({ ...prev, logoUrl: '' }));
                      }}
                      label="Télécharger le logo"
                      maxSizeMB={2}
                    />
                    <p className="text-xs text-muted-foreground">
                      Format recommandé : carré (ex: 500x500px), PNG ou JPG. Vous pourrez aussi l'ajouter plus tard.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-primary hover:shadow-glow transition-all duration-300 text-base font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Inscription en cours...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Créer mon espace fournisseur
                    </div>
                  )}
                </Button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Vous avez déjà un compte fournisseur ?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground">
            En créant un compte, vous acceptez nos{" "}
            <Link to="/terms-of-service" className="underline hover:text-foreground">
              Conditions d'utilisation
            </Link>{" "}
            et notre{" "}
            <Link to="/privacy-policy" className="underline hover:text-foreground">
              Politique de confidentialité
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}