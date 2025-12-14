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
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, GraduationCap, Building, Store, ArrowRight, Sparkles, CheckCircle, Phone, AlertCircle } from "lucide-react";
import { validateRegistration, getPasswordStrength, type RegistrationData } from "@/lib/validation";

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const { data: universities, isLoading: universitiesLoading } = useUniversities();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => {};

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

    // Comprehensive validation
    const validationResult = validateRegistration(formData as RegistrationData);

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

    const selectedUniversity = getUniversityById(universities, formData.universityId);

    // Use sanitized data
    const result = await register({
      email: validationResult.sanitized!.email,
      password: formData.password, // Password is not sanitized, only validated
      firstName: validationResult.sanitized!.firstName,
      lastName: validationResult.sanitized!.lastName,
      phone: validationResult.sanitized!.phone,
      userType: "client", // Par défaut, les inscriptions depuis /register sont des clients
      universityId: formData.universityId,
      universityName: selectedUniversity?.name || "",
    });

    if (result.success) {
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Veuillez vous connecter.",
      });
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
              <img
                src={authImage}
                alt="Illustration d'inscription"
                className="w-full h-auto object-contain drop-shadow-2xl"
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

            {/* Logo and Brand */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Créer un compte
              </h1>
              <p className="text-muted-foreground text-base">Rejoignez votre université sur CampusLink</p>
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
                  onValueChange={(value) => setFormData(prev => ({...prev, universityId: value}))}
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

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
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

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold">Téléphone</Label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-3 h-3 text-green-600" />
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+221771234567 ou 771234567"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`pl-12 h-11 border-2 focus:border-primary transition-all ${errors.phone ? 'border-red-500' : ''}`}
                    required
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                  />
                </div>
                {errors.phone && (
                  <p id="phone-error" className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone}
                  </p>
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