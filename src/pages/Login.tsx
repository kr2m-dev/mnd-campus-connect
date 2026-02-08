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
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Store, ArrowRight, Sparkles, Phone, Globe } from "lucide-react";

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

export default function Login() {
  const navigate = useNavigate();
  const { login, resetPassword, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [identifierMode, setIdentifierMode] = useState<IdentifierMode>("email");
  const [countryCode, setCountryCode] = useState("+221");

  // Dummy handlers for Header component
  const handleUniversityChange = () => { };
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => { };

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let emailToUse = formData.email;
    let alternativeEmail: string | null = null;
    
    if (identifierMode === "phone") {
      // Validate phone first
      const rawPhoneDigits = formData.phone.replace(/\D/g, '');
      if (!rawPhoneDigits || rawPhoneDigits.length < 7) {
        toast({
          title: "Erreur",
          description: "Veuillez entrer un numéro de téléphone valide (min 7 chiffres)",
          variant: "destructive",
        });
        return;
      }
      
      // Remove leading zeros to match registration format
      const phoneDigits = rawPhoneDigits.replace(/^0+/, '');
      const countryCodeDigits = countryCode.replace('+', '');
      
      // NEW format (current): phone.221XXXXXXXX@sencampuslink.com
      emailToUse = `phone.${countryCodeDigits}${phoneDigits}@sencampuslink.com`;
      
      // OLD format (legacy accounts): phoneXXXXXXXXX@temp-users.campuslink.dev
      alternativeEmail = `phone.${countryCodeDigits}${phoneDigits}@temp-users.campuslink.dev`;
      
      console.log('Login phone debug:', {
        rawInput: formData.phone,
        phoneDigits,
        countryCodeDigits,
        primaryEmail: emailToUse,
        legacyEmail: alternativeEmail
      });
    } else {
      if (!formData.email) {
        toast({
          title: "Erreur",
          description: "Veuillez entrer votre email",
          variant: "destructive",
        });
        return;
      }
    }

    if (!formData.password) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre mot de passe",
        variant: "destructive",
      });
      return;
    }

    // Try primary email format first
    let result = await login({
      email: emailToUse,
      password: formData.password,
    });
    
    // If failed and we have an alternative (legacy) email format, try that
    if (!result.success && alternativeEmail && identifierMode === "phone") {
      console.log('Primary login failed, trying legacy email format:', alternativeEmail);
      result = await login({
        email: alternativeEmail,
        password: formData.password,
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotPasswordEmail) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre adresse email",
        variant: "destructive",
      });
      return;
    }

    const result = await resetPassword(forgotPasswordEmail);
    if (result.success) {
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onUniversityChange={handleUniversityChange}
        />

        <div className="flex items-center justify-center p-4 pt-20">
          <div className="w-full max-w-md space-y-6">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => setShowForgotPassword(false)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Button>

            {/* Logo and Brand */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-elegant">
                  <span className="text-primary-foreground font-bold text-lg">MND</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
                <p className="text-muted-foreground">Réinitialisez votre mot de passe</p>
              </div>
            </div>

            {/* Forgot Password Form */}
            <Card className="shadow-card border-border/50">
              <CardHeader className="space-y-1">
                <CardTitle className="text-center text-xl">Réinitialisation</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="votre.email@university.edu"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow transition-all duration-300"
                    disabled={loading}
                  >
                    Envoyer le lien de réinitialisation
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="grid lg:grid-cols-2 gap-0 lg:gap-0 items-center min-h-[calc(100vh-200px)]">

          {/* Left Side - Image */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-full max-w-lg">
              <img
                src={authImage}
                alt="Illustration de connexion"
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md space-y-6">

            {/* Mobile Image - Visible only on mobile */}
            <div className="lg:hidden flex justify-center mb-6">
              <img
                src={authImage}
                alt="Illustration de connexion"
                className="w-64 h-auto object-contain drop-shadow-xl"
              />
            </div>

            {/* Logo and Brand */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Bon retour !
              </h1>
              <p className="text-muted-foreground text-base">Connectez-vous à votre compte</p>
            </div>

            {/* Login Form */}
            <Card className="shadow-2xl border-none bg-gradient-to-br from-background/95 to-background backdrop-blur-xl overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Identifier Mode Toggle */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Identifiant</Label>
                    
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
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Mail className="w-3 h-3 text-primary" />
                        </div>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="votre.email@university.edu"
                          value={formData.email}
                          onChange={handleChange}
                          className="pl-12 h-12 border-2 focus:border-primary transition-all"
                          required={identifierMode === "email"}
                        />
                      </div>
                    )}

                    {/* Phone Input with Country Code */}
                    {identifierMode === "phone" && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          {/* Country Code Selector */}
                          <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger className="w-[130px] h-12 border-2 focus:border-primary">
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
                              className="pl-12 h-12 border-2 focus:border-primary transition-all"
                              required={identifierMode === "phone"}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          Utilisez le numéro WhatsApp de votre inscription
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold">Mot de passe</Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Lock className="w-3 h-3 text-primary" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-12 pr-12 h-12 border-2 focus:border-primary transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow transition-all duration-300 text-base font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Connexion en cours...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Se connecter
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Register Link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Vous n'avez pas de compte ?{" "}
                    <Link
                      to="/register"
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Créer un compte
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

           

            {/* Quick Login Info */}
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Connectez-vous pour accéder aux produits de votre université
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Connexion sécurisée</span>
              </div>
            </div>
          </div>
        </div>
      </div>
</div>
      <Footer />
    </div>
  );
}