import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: string;
  universityId: string;
  universityName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            user_type: data.userType,
            university_id: data.universityId,
            university_name: data.universityName,
          }
        }
      });

      if (error) throw error;

      if (authData.user) {
        toast({
          title: "Inscription réussie !",
          description: "Vérifiez votre email pour confirmer votre compte",
        });
        return { success: true, user: authData.user };
      }

      return { success: false, error: "Erreur lors de l'inscription" };
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      if (authData.user) {
        // Vérifier si l'utilisateur est un fournisseur
        const userType = authData.user.user_metadata?.user_type;
        
        // Vérifier si c'est un fournisseur et s'il a un profil fournisseur
        if (userType === 'fournisseur') {
          // Vérifier si le profil fournisseur existe
          const { data: supplierProfile } = await supabase
            .from("suppliers")
            .select("id")
            .eq("user_id", authData.user.id)
            .maybeSingle();
          
          toast({
            title: "Connexion réussie !",
            description: "Bienvenue sur votre espace fournisseur",
          });
          navigate('/supplier');
        } else {
          toast({
            title: "Connexion réussie !",
            description: "Vous êtes maintenant connecté",
          });
          navigate('/');
        }

        return { success: true, user: authData.user };
      }

      return { success: false, error: "Erreur lors de la connexion" };
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Email ou mot de passe incorrect",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte email pour réinitialiser votre mot de passe",
      });
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'envoi de l'email",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    loading,
    register,
    login,
    logout,
    resetPassword,
    isAuthenticated: !!user,
  };
};