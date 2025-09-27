import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { supabase } from "@/integrations/supabase/client";
import { senegalUniversities, userTypes, getUniversityById } from "@/data/universities";
import {
  ArrowLeft,
  User,
  Mail,
  GraduationCap,
  Building,
  Calendar,
  Edit,
  Save,
  X
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => {};

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    userType: "",
    universityId: "",
    universityName: "",
  });

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    userType: "",
    universityId: "",
  });

  useEffect(() => {
    // Don't redirect if auth is still loading
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    // Load user data from metadata
    const userData = {
      firstName: user.user_metadata?.first_name || "",
      lastName: user.user_metadata?.last_name || "",
      email: user.email || "",
      userType: user.user_metadata?.user_type || "",
      universityId: user.user_metadata?.university_id || "",
      universityName: user.user_metadata?.university_name || "",
    };

    setProfileData(userData);
    setEditForm({
      firstName: userData.firstName,
      lastName: userData.lastName,
      userType: userData.userType,
      universityId: userData.universityId,
    });
  }, [user, authLoading, navigate]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      userType: profileData.userType,
      universityId: profileData.universityId,
    });
  };

  const handleSave = async () => {
    if (!editForm.firstName || !editForm.lastName || !editForm.userType || !editForm.universityId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedUniversity = getUniversityById(editForm.universityId);

      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          user_type: editForm.userType,
          university_id: editForm.universityId,
          university_name: selectedUniversity?.name || "",
        }
      });

      if (error) throw error;

      // Update local state
      const updatedData = {
        ...profileData,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        userType: editForm.userType,
        universityId: editForm.universityId,
        universityName: selectedUniversity?.name || "",
      };

      setProfileData(updatedData);
      setEditing(false);

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès",
      });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const userUniversity = getUniversityById(profileData.universityId);
  const userTypeLabel = userTypes.find(type => type.value === profileData.userType)?.label;

  // Show loading while authentication is being checked
  if (authLoading || (!user && authLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onUniversityChange={handleUniversityChange}
          onSupplierAccess={handleSupplierAccess}
          onStudentExchange={handleStudentExchange}
        />
        <div className="flex items-center justify-center pt-20 h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  // If not loading and no user, the useEffect will handle redirect
  if (!authLoading && !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onUniversityChange={handleUniversityChange}
        onSupplierAccess={handleSupplierAccess}
        onStudentExchange={handleStudentExchange}
      />
      <div className="container mx-auto px-4 py-8 pt-24 max-w-2xl">

        {/* Profile Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-elegant">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mon Profil</h1>
            <p className="text-muted-foreground">Gérez vos informations personnelles</p>
          </div>
        </div>

        {/* Profile Information */}
        <Card className="shadow-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations personnelles
            </CardTitle>
            {!editing && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {editing ? (
              /* Edit Mode */
              <div className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={editForm.firstName}
                      onChange={handleChange}
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={editForm.lastName}
                      onChange={handleChange}
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                {/* User Type */}
                <div className="space-y-2">
                  <Label>Type de compte</Label>
                  <Select
                    value={editForm.userType}
                    onValueChange={(value) => setEditForm(prev => ({...prev, userType: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre type de compte" />
                    </SelectTrigger>
                    <SelectContent>
                      {userTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* University */}
                <div className="space-y-2">
                  <Label>Université</Label>
                  <Select
                    value={editForm.universityId}
                    onValueChange={(value) => setEditForm(prev => ({...prev, universityId: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre université" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {senegalUniversities.map((university) => (
                        <SelectItem key={university.id} value={university.id}>
                          <div className="flex items-center gap-2">
                            <span>{university.flag}</span>
                            <span>{university.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-gradient-primary flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Sauvegarde..." : "Sauvegarder"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-4">
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Prénom</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{profileData.firstName}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Nom</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{profileData.lastName}</span>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{profileData.email}</span>
                  </div>
                </div>

                {/* User Type */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Type de compte</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <Badge variant="secondary">{userTypeLabel}</Badge>
                  </div>
                </div>

                {/* University */}
                {userUniversity && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Université</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span className="mr-2">{userUniversity.flag}</span>
                      <div>
                        <div className="font-medium">{userUniversity.name}</div>
                        <div className="text-sm text-muted-foreground">{userUniversity.city}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Info */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Membre depuis</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={logout} className="text-destructive hover:bg-destructive/10">
            Se déconnecter
          </Button>
        </div>

      </div>
        <Footer />
    </div>
  );
}