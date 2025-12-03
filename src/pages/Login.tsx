import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Store, ArrowRight, Sparkles } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login, resetPassword, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => {};

  const [formData, setFormData] = useState({
    email: "",
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

    if (!formData.email || !formData.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    await login({
      email: formData.email,
      password: formData.password,
    });
    // La redirection est gérée automatiquement dans le hook useAuth
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
                  className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
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

      <div className="flex items-center justify-center p-4 pt-10">
        <div className="w-full max-w-md space-y-6">

        {/* Logo and Brand */}
        <div className="text-center space-y-1">
          
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Bon retour !
            </h1>
            <p className="text-muted-foreground">Connectez-vous à votre compte</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl border-none bg-gradient-to-br from-background/95 to-background backdrop-blur-xl">
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
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
                    required
                  />
                </div>
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
                className="w-full h-12 bg-gradient-primary hover:shadow-glow transition-all duration-300 text-base font-semibold"
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
                  Créez votre espace fournisseur
                </p>
              </div>
              <div className="flex-shrink-0">
                <ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </CardContent>
        </Card>

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
      <Footer />
    </div>
  );
}