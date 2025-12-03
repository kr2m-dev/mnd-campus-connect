import { useState } from "react";
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
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, GraduationCap, Building, Store, ArrowRight, Sparkles, CheckCircle } from "lucide-react";

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
    universityId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    if (!formData.universityId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner votre université",
        variant: "destructive",
      });
      return;
    }

    const selectedUniversity = getUniversityById(universities, formData.universityId);

    const result = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      userType: "client", // Par défaut, les inscriptions depuis /register sont des clients
      universityId: formData.universityId,
      universityName: selectedUniversity?.name || "",
    });

    if (result.success) {
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

      <div className="flex items-center justify-center p-4 pt-10 pb-10">
        <div className="w-full max-w-md space-y-6">

        {/* Logo and Brand */}
        <div className="text-center space-y-4">
          
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Créer un compte
            </h1>
            <p className="text-muted-foreground">Rejoignez votre université sur CampusLink</p>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="shadow-2xl border-none bg-gradient-to-br from-background/95 to-background backdrop-blur-xl">
          
          <CardContent>
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
                      className="pl-12 h-11 border-2 focus:border-primary transition-all"
                      required
                    />
                  </div>
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
                      className="pl-12 h-11 border-2 focus:border-primary transition-all"
                      required
                    />
                  </div>
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
                    className="pl-12 h-11 border-2 focus:border-primary transition-all"
                    required
                  />
                </div>
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
                    placeholder="Minimum 6 caractères"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-12 pr-12 h-11 border-2 focus:border-primary transition-all"
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
                    className="pl-12 pr-12 h-11 border-2 focus:border-primary transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
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
        <Card className="shadow-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 hover:shadow-2xl hover:border-primary/40 transition-all duration-300 cursor-pointer group"
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
          <Link to="/terms" className="underline hover:text-foreground">
            Conditions d'utilisation
          </Link>{" "}
          et notre{" "}
          <Link to="/privacy" className="underline hover:text-foreground">
            Politique de confidentialité
          </Link>
        </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}