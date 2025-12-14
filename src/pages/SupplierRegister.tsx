import { useState } from "react";
import authImage from "@/assets/support.png";
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
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Store, Building, Phone, MapPin, ArrowRight, Sparkles, CheckCircle, Image, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/image-upload";
import { logger } from "@/lib/logger";
import { validateSupplierRegistration, getPasswordStrength, type SupplierRegistrationData } from "@/lib/validation";

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

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    businessName?: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactWhatsapp?: string;
    address?: string;
  }>({});

  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Update password strength indicator
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Comprehensive validation
    const validationResult = validateSupplierRegistration(formData as SupplierRegistrationData);

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);

      // Show first error in toast
      const firstError = Object.values(validationResult.errors)[0];
      toast({
        title: "Erreur de validation",
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    try {
      // Use sanitized data
      const sanitized = validationResult.sanitized!;

      // 1. Créer le compte utilisateur
      const result = await register({
        email: sanitized.email,
        password: formData.password, // Password is not sanitized, only validated
        firstName: sanitized.firstName,
        lastName: sanitized.lastName,
        phone: sanitized.contactPhone || sanitized.contactWhatsapp, // Utiliser le téléphone de contact ou WhatsApp
        userType: "fournisseur",
        universityId: "", // Pas d'université pour les fournisseurs
        universityName: "",
      });

      if (!result.success) {
        return;
      }

      // 2. Créer le profil fournisseur avec données sanitisées
      const { error: supplierError } = await supabase
        .from("suppliers")
        .insert({
          user_id: result.user?.id,
          business_name: sanitized.businessName,
          description: sanitized.description || null,
          contact_email: sanitized.contactEmail || sanitized.email,
          contact_phone: sanitized.contactPhone || null,
          contact_whatsapp: sanitized.contactWhatsapp,
          address: sanitized.address || null,
          logo_url: formData.logoUrl || null, // Logo URL from upload
          is_verified: false,
        });

      if (supplierError) {
        logger.error("Erreur lors de la création du profil fournisseur:", supplierError);
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
      logger.error("Erreur lors de l'inscription:", error);
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

      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-200px)]">

          {/* Left Side - Image */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-full max-w-lg sticky top-8">
              <img
                src={authImage}
                alt="Illustration d'inscription fournisseur"
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-2xl space-y-6">

            {/* Mobile Image - Visible only on mobile */}
            <div className="lg:hidden flex justify-center mb-6">
              <img
                src={authImage}
                alt="Illustration d'inscription fournisseur"
                className="w-64 h-auto object-contain drop-shadow-xl"
              />
            </div>

            {/* Logo and Brand */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Store className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                  Devenir Fournisseur
                  <Sparkles className="w-6 h-6 text-primary" />
                </h1>
                <p className="text-muted-foreground text-base">Créez votre espace fournisseur et commencez à vendre</p>
              </div>
            </div>

            {/* Registration Form */}
            <Card className="shadow-2xl border-none bg-gradient-to-br from-background/95 to-background backdrop-blur-xl overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-center text-xl">Inscription Fournisseur</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
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
                        className={`h-11 border-2 focus:border-primary transition-all ${errors.firstName ? 'border-red-500' : ''}`}
                        required
                        aria-invalid={!!errors.firstName}
                        aria-describedby={errors.firstName ? "firstName-error" : undefined}
                      />
                      {errors.firstName && (
                        <p id="firstName-error" className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.firstName}
                        </p>
                      )}
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
                        className={`h-11 border-2 focus:border-primary transition-all ${errors.lastName ? 'border-red-500' : ''}`}
                        required
                        aria-invalid={!!errors.lastName}
                        aria-describedby={errors.lastName ? "lastName-error" : undefined}
                      />
                      {errors.lastName && (
                        <p id="lastName-error" className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.lastName}
                        </p>
                      )}
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
                        className={`pl-10 h-11 border-2 focus:border-primary transition-all ${errors.email ? 'border-red-500' : ''}`}
                        required
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                    </div>
                    {errors.email && (
                      <p id="email-error" className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold">Mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 caractères, majuscule, chiffre, symbole"
                        value={formData.password}
                        onChange={handleChange}
                        className={`pl-10 pr-10 h-11 border-2 focus:border-primary transition-all ${errors.password ? 'border-red-500' : ''}`}
                        required
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${(passwordStrength.score / 4) * 100}%`,
                                backgroundColor: passwordStrength.color
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                            {passwordStrength.label}
                          </span>
                        </div>
                      </div>
                    )}
                    {errors.password && (
                      <p id="password-error" className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirmer le mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Retapez votre mot de passe"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`pl-10 pr-10 h-11 border-2 focus:border-primary transition-all ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        required
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p id="confirmPassword-error" className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
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
                      className={`h-11 border-2 focus:border-primary transition-all ${errors.businessName ? 'border-red-500' : ''}`}
                      required
                      aria-invalid={!!errors.businessName}
                      aria-describedby={errors.businessName ? "businessName-error" : undefined}
                    />
                    {errors.businessName && (
                      <p id="businessName-error" className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.businessName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Décrivez votre entreprise et vos produits..."
                      value={formData.description}
                      onChange={handleChange}
                      className={`border-2 focus:border-primary transition-all resize-none ${errors.description ? 'border-red-500' : ''}`}
                      rows={3}
                      aria-invalid={!!errors.description}
                      aria-describedby={errors.description ? "description-error" : undefined}
                    />
                    {errors.description && (
                      <p id="description-error" className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.description}
                      </p>
                    )}
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
                          className={`pl-10 h-11 border-2 focus:border-primary transition-all ${errors.contactEmail ? 'border-red-500' : ''}`}
                          aria-invalid={!!errors.contactEmail}
                          aria-describedby={errors.contactEmail ? "contactEmail-error" : undefined}
                        />
                      </div>
                      {errors.contactEmail && (
                        <p id="contactEmail-error" className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.contactEmail}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone" className="text-sm font-semibold">Téléphone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="contactPhone"
                          name="contactPhone"
                          type="tel"
                          placeholder="+221771234567 ou 771234567"
                          value={formData.contactPhone}
                          onChange={handleChange}
                          className={`pl-10 h-11 border-2 focus:border-primary transition-all ${errors.contactPhone ? 'border-red-500' : ''}`}
                          aria-invalid={!!errors.contactPhone}
                          aria-describedby={errors.contactPhone ? "contactPhone-error" : undefined}
                        />
                      </div>
                      {errors.contactPhone && (
                        <p id="contactPhone-error" className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.contactPhone}
                        </p>
                      )}
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
                        placeholder="+221771234567 ou 771234567"
                        value={formData.contactWhatsapp}
                        onChange={handleChange}
                        className={`pl-10 h-11 border-2 focus:border-primary transition-all ${errors.contactWhatsapp ? 'border-red-500' : ''}`}
                        required
                        aria-invalid={!!errors.contactWhatsapp}
                        aria-describedby={errors.contactWhatsapp ? "contactWhatsapp-error" : undefined}
                      />
                    </div>
                    {errors.contactWhatsapp ? (
                      <p id="contactWhatsapp-error" className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.contactWhatsapp}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Les commandes seront envoyées directement sur ce numéro WhatsApp
                      </p>
                    )}
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
                        className={`pl-10 h-11 border-2 focus:border-primary transition-all ${errors.address ? 'border-red-500' : ''}`}
                        aria-invalid={!!errors.address}
                        aria-describedby={errors.address ? "address-error" : undefined}
                      />
                    </div>
                    {errors.address && (
                      <p id="address-error" className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.address}
                      </p>
                    )}
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
            <Link to="/terms-of-service" className="underline hover:text-foreground transition-colors">
              Conditions d'utilisation
            </Link>{" "}
            et notre{" "}
            <Link to="/privacy-policy" className="underline hover:text-foreground transition-colors">
              Politique de confidentialité
            </Link>
          </p>
        </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}