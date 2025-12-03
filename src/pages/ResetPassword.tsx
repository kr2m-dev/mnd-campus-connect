import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => {};

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Parse URL hash for Supabase tokens (they come after the # in the URL)
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));

        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        console.log('URL Hash:', hash);
        console.log('Access Token:', accessToken ? 'Present' : 'Missing');
        console.log('Type:', type);

        if (accessToken && refreshToken && type === 'recovery') {
          // Set the session from URL hash parameters
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            toast({
              title: "Lien invalide",
              description: "Le lien de réinitialisation est invalide ou a expiré",
              variant: "destructive",
            });
            navigate("/login");
            return;
          }

          if (data.user) {
            setIsValidSession(true);
            // Clear the hash from URL for security
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else {
          // Check if user is already authenticated (for cases where session is already set)
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setIsValidSession(true);
          } else {
            toast({
              title: "Accès non autorisé",
              description: "Vous devez utiliser le lien envoyé par email",
              variant: "destructive",
            });
            navigate("/login");
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la vérification",
          variant: "destructive",
        });
        navigate("/login");
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

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

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) throw error;

      toast({
        title: "Mot de passe mis à jour !",
        description: "Votre mot de passe a été changé avec succès",
      });

      // Sign out and redirect to login
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onUniversityChange={handleUniversityChange}
        />
        <div className="flex items-center justify-center pt-20 h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Vérification du lien...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onUniversityChange={handleUniversityChange}
        />
        <div className="flex items-center justify-center p-4 pt-20">
          <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <ArrowLeft className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Lien invalide</h1>
            <p className="text-muted-foreground mt-2">
              Le lien de réinitialisation est invalide ou a expiré
            </p>
          </div>
          <Button onClick={() => navigate("/login")} className="bg-gradient-primary">
            Retour à la connexion
          </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onUniversityChange={handleUniversityChange}
      />
      <div className="flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-md space-y-6">

        {/* Logo and Brand */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-elegant">
              <span className="text-primary-foreground font-bold text-lg">MND</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
            <p className="text-muted-foreground">Choisissez un mot de passe sécurisé</p>
          </div>
        </div>

        {/* Reset Password Form */}
        <Card className="shadow-card border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Réinitialisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p className="font-medium mb-1">Exigences du mot de passe :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Au moins 6 caractères</li>
                  <li>Recommandé : majuscules, minuscules, chiffres</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Pour votre sécurité, vous serez déconnecté après la mise à jour
          </p>
        </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}