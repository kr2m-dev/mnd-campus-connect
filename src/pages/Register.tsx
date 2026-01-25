import { useState } from "react";
import authImage from "@/assets/support.png";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useUniversities, getUniversityById } from "@/hooks/use-universities";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, GraduationCap, Building, Store, ArrowRight, Sparkles, CheckCircle, Phone, AlertCircle, Globe } from "lucide-react";
import { validateRegistration, getPasswordStrength, type RegistrationData } from "@/lib/validation";

// Country codes for phone numbers
const countryCodes = [
  { code: "+221", country: "Sénégal", flag: "🇸🇳" },
  { code: "+225", country: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "+223", country: "Mali", flag: "🇲🇱" },
  { code: "+224", country: "Guinée", flag: "🇬🇳" },
  { code: "+226", country: "Burkina Faso", flag: "🇧🇫" },
  { code: "+227", country: "Niger", flag: "🇳🇪" },
  { code: "+228", country: "Togo", flag: "🇹🇬" },
  { code: "+229", country: "Bénin", flag: "🇧🇯" },
  { code: "+237", country: "Cameroun", flag: "🇨🇲" },
  { code: "+241", country: "Gabon", flag: "🇬🇦" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
];

type IdentifierMode = "email" | "phone";

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const { data: universities, isLoading: universitiesLoading } = useUniversities();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [identifierMode, setIdentifierMode] = useState<IdentifierMode>("email");
  const [countryCode, setCountryCode] = useState("+221");

  // Dummy handlers for Header component
  const handleUniversityChange = () => { };
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => { };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    universityId: "",
  });

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    universityId?: string;
  }>({});

  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const errors: typeof formData & { universityId?: string } = {} as any;
    
    // Validate names
    if (!formData.firstName || formData.firstName.trim().length < 2) {
      errors.firstName = "Prénom requis (min 2 caractères)";
    }
    if (!formData.lastName || formData.lastName.trim().length < 2) {
      errors.lastName = "Nom requis (min 2 caractères)";
    }
    
    // Validate university
    if (!formData.universityId) {
      errors.universityId = "Veuillez sélectionner votre université";
    }
    
    // Validate based on mode
    let finalEmail = formData.email;
    let finalPhone = formData.phone;
    
    if (identifierMode === "phone") {
      // Phone mode validation
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (!phoneDigits || phoneDigits.length < 7) {
        (errors as any).phone = "Numéro de téléphone invalide (min 7 chiffres)";
      } else {
        // Create phone number with country code
        finalPhone = countryCode + phoneDigits.replace(/^0+/, '');
        // Generate placeholder email for Supabase (using 'phone' subdomain)
        finalEmail = `phone${phoneDigits}@campuslink.sn`;
      }
    } else {
      // Email mode validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !emailPattern.test(formData.email)) {
        (errors as any).email = "Adresse email invalide";
      }
    }
    
    // Validate password
    if (!formData.password || formData.password.length < 6) {
      (errors as any).password = "Mot de passe requis (min 6 caractères)";
    }
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      (errors as any).confirmPassword = "Les mots de passe ne correspondent pas";
    }

    // Check for errors
    const errorKeys = Object.keys(errors).filter(key => (errors as any)[key]);
    if (errorKeys.length > 0) {
      setErrors(errors as any);
      toast({
        title: "Erreur de validation",
        description: (errors as any)[errorKeys[0]],
        variant: "destructive",
      });
      return;
    }

    const selectedUniversity = getUniversityById(universities, formData.universityId);

    const result = await register({
      email: finalEmail,
      password: formData.password,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: finalPhone,
      userType: "client",
      universityId: formData.universityId,
      universityName: selectedUniversity?.name || "",
    });

    if (result.success) {
      // Message différent selon le mode d'inscription
      if (identifierMode === "email") {
        toast({
          title: "📧 Vérifiez votre email !",
          description: "Un email de confirmation vous a été envoyé. Cliquez sur le lien pour activer votre compte.",
          duration: 10000,
        });
      } else {
        toast({
          title: "✅ Inscription réussie !",
          description: "Votre compte a été créé. Vous pouvez maintenant vous connecter.",
        });
      }
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <Header
        onUniversityChange={handleUniversityChange}
      />

      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-200px)]">

          {/* Left Side - Image */}
          <div className="hidden lg:flex items-center justify-center">

            <div className="w-full max-w-lg">
              {/* Logo and Brand */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Créer un compte
                </h1>
                <p className="text-muted-foreground text-base">Rejoignez votre université sur CampusLink</p>
              </div>

              <img
                src={authImage}
                alt="Illustration d'inscription"
                className="w-auto h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md space-y-6">

              {/* Mobile Image - Visible only on mobile */}
              <div className="lg:hidden flex justify-center mb-6">
                <img
                  src={authImage}
                  alt="Illustration d'inscription"
                  className="w-64 h-auto object-contain drop-shadow-xl"
                />
              </div>


              {/* Registration Form */}
              <Card className="shadow-2xl border-none bg-gradient-to-br from-background/95 to-background backdrop-blur-xl overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-semibold">Prénom</Label>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-primary/10 rounded-lg flex items-center justify-center">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                          <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder="Modou"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`pl-12 h-11 border-2 focus:border-primary transition-all ${errors.firstName ? 'border-red-500' : ''}`}
                            required
                            aria-invalid={!!errors.firstName}
                            aria-describedby={errors.firstName ? "firstName-error" : undefined}
                          />
                        </div>
                        {errors.firstName && (
                          <p id="firstName-error" className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-semibold">Nom</Label>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-primary/10 rounded-lg flex items-center justify-center">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                          <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            placeholder="DIOP"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={`pl-12 h-11 border-2 focus:border-primary transition-all ${errors.lastName ? 'border-red-500' : ''}`}
                            required
                            aria-invalid={!!errors.lastName}
                            aria-describedby={errors.lastName ? "lastName-error" : undefined}
                          />
                        </div>
                        {errors.lastName && (
                          <p id="lastName-error" className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* University Field */}
                    <div className="space-y-2">
                      <Label htmlFor="university" className="text-sm font-semibold">Université *</Label>
                      <Select
                        value={formData.universityId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, universityId: value }))}
                        disabled={universitiesLoading}
                      >
                        <SelectTrigger className="w-full h-11 border-2 focus:border-primary">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-green-500/10 rounded-lg flex items-center justify-center">
                              <GraduationCap className="w-3 h-3 text-green-600" />
                            </div>
                            <SelectValue placeholder={universitiesLoading ? "Chargement..." : "Sélectionnez votre université"} />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {universities?.map((university) => (
                            <SelectItem key={university.id} value={university.id} className="cursor-pointer">
                              <div className="flex items-start gap-2 py-1">
                                <span className="text-sm">{university.flag}</span>
                                <div className="flex-1">
                                  <div className="font-medium text-sm leading-tight">{university.name}</div>
                                  <div className="text-xs text-muted-foreground">{university.city}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Identifier Mode Toggle */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Identifiant de connexion *</Label>
                      
                      {/* Toggle Tabs */}
                      <div className="flex rounded-xl bg-muted p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => setIdentifierMode("email")}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                            identifierMode === "email"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </button>
                        <button
                          type="button"
                          onClick={() => setIdentifierMode("phone")}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                            identifierMode === "phone"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Phone className="w-4 h-4" />
                          WhatsApp
                        </button>
                      </div>

                      {/* Email Input */}
                      {identifierMode === "email" && (
                        <div className="space-y-2">
                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-blue-500/10 rounded-lg flex items-center justify-center">
                              <Mail className="w-3 h-3 text-blue-600" />
                            </div>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="modou.diop@university.edu"
                              value={formData.email}
                              onChange={handleChange}
                              className={`pl-12 h-11 border-2 focus:border-primary transition-all ${errors.email ? 'border-red-500' : ''}`}
                              required={identifierMode === "email"}
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
                      )}

                      {/* Phone Input with Country Code */}
                      {identifierMode === "phone" && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            {/* Country Code Selector */}
                            <Select value={countryCode} onValueChange={setCountryCode}>
                              <SelectTrigger className="w-[130px] h-11 border-2 focus:border-primary">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                {countryCodes.map((country) => (
                                  <SelectItem key={country.code} value={country.code}>
                                    <div className="flex items-center gap-2">
                                      <span>{country.flag}</span>
                                      <span className="font-medium">{country.code}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {/* Phone Number Input */}
                            <div className="relative group flex-1">
                              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-green-500/10 rounded-lg flex items-center justify-center">
                                <Phone className="w-3 h-3 text-green-600" />
                              </div>
                              <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="77 123 45 67"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`pl-12 h-11 border-2 focus:border-primary transition-all ${errors.phone ? 'border-red-500' : ''}`}
                                required={identifierMode === "phone"}
                                aria-invalid={!!errors.phone}
                                aria-describedby={errors.phone ? "phone-error" : undefined}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            Numéro WhatsApp pour recevoir les notifications
                          </p>
                          {errors.phone && (
                            <p id="phone-error" className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold">Mot de passe</Label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-orange-500/10 rounded-lg flex items-center justify-center">
                          <Lock className="w-3 h-3 text-orange-600" />
                        </div>
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 8 caractères, majuscule, chiffre, symbole"
                          value={formData.password}
                          onChange={handleChange}
                          className={`pl-12 pr-12 h-11 border-2 focus:border-primary transition-all ${errors.password ? 'border-red-500' : ''}`}
                          required
                          aria-invalid={!!errors.password}
                          aria-describedby={errors.password ? "password-error" : undefined}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirmer le mot de passe</Label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-orange-500/10 rounded-lg flex items-center justify-center">
                          <Lock className="w-3 h-3 text-orange-600" />
                        </div>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Retapez votre mot de passe"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`pl-12 pr-12 h-11 border-2 focus:border-primary transition-all ${errors.confirmPassword ? 'border-red-500' : ''}`}
                          required
                          aria-invalid={!!errors.confirmPassword}
                          aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p id="confirmPassword-error" className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.confirmPassword}
                        </p>
                      )}
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
                          Créer mon compte
                        </div>
                      )}
                    </Button>
                  </form>

                  {/* Login Link */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Vous avez déjà un compte ?{" "}
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

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              {/* Supplier Section */}
              <Card className="shadow-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 hover:shadow-2xl hover:border-primary/40 hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                onClick={() => navigate('/supplier-register')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Store className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        Vous êtes fournisseur ?
                        <Sparkles className="w-5 h-5 text-primary" />
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Créez votre espace fournisseur et commencez à vendre
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms */}
              <p className="text-xs text-center text-muted-foreground">
                En créant un compte, vous acceptez nos{" "}
                <Link to="/terms" className="underline hover:text-foreground transition-colors">
                  Conditions d'utilisation
                </Link>{" "}
                et notre{" "}
                <Link to="/privacy" className="underline hover:text-foreground transition-colors">
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