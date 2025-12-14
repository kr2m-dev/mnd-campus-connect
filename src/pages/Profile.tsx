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
import { useOrders, useSupplierOrders } from "@/hooks/use-orders";
import { useCurrentSupplier } from "@/hooks/use-supplier";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { supabase } from "@/integrations/supabase/client";
import { useUniversities, getUniversityById } from "@/hooks/use-universities";
import { userTypes } from "@/data/universities";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  ShoppingBag,
  TrendingUp,
  Award,
  Lock,
  Shield,
  CheckCircle2,
  Store,
  BarChart3
} from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const { data: supplier, isLoading: supplierLoading } = useCurrentSupplier();
  const { data: universities, isLoading: universitiesLoading } = useUniversities();

  // Récupérer les commandes selon le type d'utilisateur
  const { data: customerOrders, isLoading: customerOrdersLoading } = useOrders();
  const { data: supplierOrders, isLoading: supplierOrdersLoading } = useSupplierOrders();

  const isSupplier = !!supplier;
  const orders = isSupplier ? supplierOrders : customerOrders;
  const ordersLoading = isSupplier ? supplierOrdersLoading : customerOrdersLoading;

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
    phone: "",
    userType: "",
    universityId: "",
    universityName: "",
    avatarUrl: "",
  });

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    userType: "",
    universityId: "",
  });

  const [avatarUrl, setAvatarUrl] = useState("");
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  useEffect(() => {
    // Don't redirect if auth is still loading
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    // Load user data from profiles table and metadata
    const loadProfileData = async () => {
      // Load from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, avatar_url, university')
        .eq('user_id', user.id)
        .single();

      const userData = {
        firstName: profile?.first_name || user.user_metadata?.first_name || "",
        lastName: profile?.last_name || user.user_metadata?.last_name || "",
        email: user.email || "",
        phone: profile?.phone || "",
        userType: user.user_metadata?.user_type || "",
        universityId: user.user_metadata?.university_id || "",
        universityName: profile?.university || user.user_metadata?.university_name || "",
        avatarUrl: profile?.avatar_url || "",
      };

      setProfileData(userData);
      setEditForm({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        userType: userData.userType,
        universityId: userData.universityId,
      });

      if (profile?.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }
    };

    loadProfileData();
  }, [user, authLoading, navigate]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      userType: profileData.userType,
      universityId: profileData.universityId,
    });
  };

  const handleSave = async () => {
    if (!editForm.firstName || !editForm.lastName || !editForm.userType || !editForm.universityId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedUniversity = getUniversityById(universities, editForm.universityId);

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          phone: editForm.phone,
          user_type: editForm.userType,
          university_id: editForm.universityId,
          university_name: selectedUniversity?.name || "",
        }
      });

      if (authError) throw authError;

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          phone: editForm.phone,
          university: selectedUniversity?.name || "",
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      // Update local state
      const updatedData = {
        ...profileData,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
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

  const handleAvatarUpload = async (url: string, path: string) => {
    try {
      // Update avatar in profiles table
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          avatar_url: url,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setAvatarUrl(url);
      setProfileData(prev => ({ ...prev, avatarUrl: url }));
      setShowAvatarUpload(false);

      toast({
        title: "Photo de profil mise à jour",
        description: "Votre photo de profil a été mise à jour avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la photo de profil",
        variant: "destructive",
      });
    }
  };

  const handleAvatarDelete = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user?.id);

      if (error) throw error;

      setAvatarUrl("");
      setProfileData(prev => ({ ...prev, avatarUrl: "" }));

      toast({
        title: "Photo supprimée",
        description: "Votre photo de profil a été supprimée",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la photo de profil",
        variant: "destructive",
      });
    }
  };

  const userUniversity = getUniversityById(universities, profileData.universityId);
  const userTypeLabel = userTypes.find(type => type.value === profileData.userType)?.label;

  // Show loading while authentication is being checked
  if (authLoading || (!user && authLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onUniversityChange={handleUniversityChange}
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
      />
      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">

        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/5 rounded-3xl -z-10" />

          <Card className="border-none shadow-2xl bg-gradient-to-br from-background/95 to-background backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar Section */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-primary/20 ring-4 ring-primary/10 transition-transform group-hover:scale-105">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Photo de profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                        <User className="w-16 h-16 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAvatarUpload(!showAvatarUpload)}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-xl hover:bg-primary/90 transition-all hover:scale-110"
                    title="Changer la photo de profil"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      {profileData.firstName} {profileData.lastName}
                    </h1>
                    {isSupplier && (
                      <Badge className={`${supplier?.is_verified ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'} text-white px-3 py-1`}>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {supplier?.is_verified ? 'Fournisseur Vérifié' : 'En attente de vérification'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mb-4">
                    <Mail className="w-4 h-4" />
                    {profileData.email}
                  </p>

                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    {isSupplier ? (
                      <>
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                          <Store className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Fournisseur</span>
                        </div>
                        <button
                          onClick={() => navigate('/supplier')}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-primary-foreground rounded-full hover:shadow-lg transition-all"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span className="text-sm font-medium">Dashboard</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {userTypeLabel && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full">
                            <Building className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">{userTypeLabel}</span>
                          </div>
                        )}
                        {userUniversity && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full">
                            <GraduationCap className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">{userUniversity.name}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        Depuis {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {showAvatarUpload && (
                <div className="mt-6 pt-6 border-t">
                  <ImageUpload
                    bucket="avatars"
                    currentImageUrl={avatarUrl}
                    onUploadSuccess={handleAvatarUpload}
                    onDelete={handleAvatarDelete}
                    userId={user?.id}
                    label="Changer la photo de profil"
                    maxSizeMB={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Affichage conditionnel : Tabs pour clients, contenu direct pour fournisseurs */}
        {isSupplier ? (
          /* Fournisseurs : Affichage direct sans tabs */
          <div className="w-full space-y-6">
            {/* Quick Stats for Suppliers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total Commandes</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                        {orders?.length || 0}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                      <ShoppingBag className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Statut</p>
                      <p className="text-lg font-bold text-green-900 dark:text-green-100">
                        {supplier?.is_verified ? 'Vérifié' : 'En attente'}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
                      <Award className="w-7 h-7 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Entreprise</p>
                      <p className="text-lg font-bold text-purple-900 dark:text-purple-100 truncate max-w-[150px]">
                        {supplier?.business_name || 'N/A'}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                      <Store className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Information */}
            <Card className="shadow-lg border-border/50 hover:shadow-xl transition-shadow">
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

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={editForm.phone}
                      onChange={handleChange}
                      placeholder="77 123 45 67"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* User Type - Hidden for suppliers */}
                {!isSupplier && (
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
                )}

                {/* University - Hidden for suppliers */}
                {!isSupplier && (
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
                        {universities?.map((university) => (
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
                )}

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
                  <div className="group">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Prénom</Label>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10 group-hover:border-primary/30 transition-all">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-lg">{profileData.firstName}</span>
                    </div>
                  </div>
                  <div className="group">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Nom</Label>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10 group-hover:border-primary/30 transition-all">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-lg">{profileData.lastName}</span>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Email</Label>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-500/5 to-blue-500/10 rounded-xl border border-blue-500/10 group-hover:border-blue-500/30 transition-all">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium">{profileData.email}</span>
                  </div>
                </div>

                {/* Phone */}
                {profileData.phone && (
                  <div className="group">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Téléphone</Label>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-500/5 to-green-500/10 rounded-xl border border-green-500/10 group-hover:border-green-500/30 transition-all">
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="font-medium">{profileData.phone}</span>
                    </div>
                  </div>
                )}

                {/* User Type - Hidden for suppliers */}
                {!isSupplier && (
                  <div className="group">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Type de compte</Label>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-500/5 to-purple-500/10 rounded-xl border border-purple-500/10 group-hover:border-purple-500/30 transition-all">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-purple-600" />
                      </div>
                      <Badge className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-1.5">{userTypeLabel}</Badge>
                    </div>
                  </div>
                )}

                {/* University - Hidden for suppliers */}
                {!isSupplier && userUniversity && (
                  <div className="group">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Université</Label>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-500/5 to-green-500/10 rounded-xl border border-green-500/10 group-hover:border-green-500/30 transition-all">
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-2xl mr-2">{userUniversity.flag}</span>
                      <div>
                        <div className="font-semibold">{userUniversity.name}</div>
                        <div className="text-sm text-muted-foreground">{userUniversity.city}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Info */}
                <div className="group">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Membre depuis</Label>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-500/5 to-orange-500/10 rounded-xl border border-orange-500/10 group-hover:border-orange-500/30 transition-all">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="font-medium">{user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

            {/* Security & Actions */}
            <Card className="shadow-lg border-border/50 hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Sécurité & Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-12 hover:bg-primary/5 hover:border-primary hover:text-primary transition-colors"
                    onClick={() => {
                      toast({
                        title: "Fonctionnalité à venir",
                        description: "La modification du mot de passe sera bientôt disponible",
                      });
                    }}
                  >
                    <Lock className="w-4 h-4" />
                    <span>Changer le mot de passe</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="w-full justify-start gap-2 h-12 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Se déconnecter</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Clients : Affichage direct sans tabs */
          <div className="w-full space-y-6">
              {/* Quick Stats for Customers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Mes Commandes</p>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                          {orders?.length || 0}
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                        <ShoppingBag className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Total Dépensé</p>
                        <p className="text-xl font-bold text-green-900 dark:text-green-100">
                          {orders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0).toLocaleString()} CFA
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-7 h-7 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Statut</p>
                        <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                          Actif
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Information */}
              <Card className="shadow-lg border-border/50 hover:shadow-xl transition-shadow">
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

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={editForm.phone}
                        onChange={handleChange}
                        placeholder="77 123 45 67"
                        className="pl-10"
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
                        {universities?.map((university) => (
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

                  {/* Phone */}
                  {profileData.phone && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Téléphone</Label>
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{profileData.phone}</span>
                      </div>
                    </div>
                  )}

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

              {/* Security & Actions */}
              <Card className="shadow-lg border-border/50 hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Sécurité & Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 h-12 hover:bg-primary/5 hover:border-primary hover:text-primary transition-colors"
                      onClick={() => {
                        toast({
                          title: "Fonctionnalité à venir",
                          description: "La modification du mot de passe sera bientôt disponible",
                        });
                      }}
                    >
                      <Lock className="w-4 h-4" />
                      <span>Changer le mot de passe</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={logout}
                      className="w-full justify-start gap-2 h-12 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
          </div>
        )}

      </div>
        <Footer />
    </div>
  );
}