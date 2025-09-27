import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Package,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Settings,
  Check,
  X,
  Filter
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface Notification {
  id: string;
  type: "order" | "product" | "system" | "promotion";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isImportant?: boolean;
  actionUrl?: string;
  actionText?: string;
  icon?: React.ElementType;
}

const sampleNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "Commande expédiée",
    message: "Votre commande #CMD-2024-001 a été expédiée et arrivera dans 2-3 jours ouvrables.",
    timestamp: "2024-01-15T10:30:00Z",
    isRead: false,
    actionUrl: "/orders/CMD-2024-001",
    actionText: "Suivre la commande",
    icon: Package
  },
  {
    id: "2",
    type: "promotion",
    title: "Offre spéciale : -30% sur les parfums",
    message: "Profitez de notre promotion exceptionnelle sur tous les parfums jusqu'au 20 janvier.",
    timestamp: "2024-01-14T14:15:00Z",
    isRead: false,
    isImportant: true,
    actionUrl: "/products?category=parfums",
    actionText: "Voir les offres",
    icon: AlertCircle
  },
  {
    id: "3",
    type: "product",
    title: "Produit de retour en stock",
    message: "Le savon antibactérien Dettol que vous suivez est de nouveau disponible.",
    timestamp: "2024-01-14T09:45:00Z",
    isRead: true,
    actionUrl: "/products/savon-dettol",
    actionText: "Voir le produit",
    icon: Package
  },
  {
    id: "4",
    type: "system",
    title: "Mise à jour de votre profil",
    message: "Votre profil a été mis à jour avec succès. Vérifiez vos informations.",
    timestamp: "2024-01-13T16:20:00Z",
    isRead: true,
    icon: CheckCircle
  },
  {
    id: "5",
    type: "order",
    title: "Commande confirmée",
    message: "Votre commande #CMD-2024-002 a été confirmée et est en cours de préparation.",
    timestamp: "2024-01-13T11:10:00Z",
    isRead: true,
    actionUrl: "/orders/CMD-2024-002",
    actionText: "Voir les détails",
    icon: ShoppingCart
  },
  {
    id: "6",
    type: "promotion",
    title: "Nouveaux produits disponibles",
    message: "Découvrez notre nouvelle collection de produits d'hygiène sur votre campus.",
    timestamp: "2024-01-12T08:00:00Z",
    isRead: true,
    actionUrl: "/products?filter=new",
    actionText: "Découvrir",
    icon: Package
  }
];

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [activeTab, setActiveTab] = useState("all");

  // Dummy handlers for Header component
  const handleUniversityChange = () => {};
  const handleSupplierAccess = () => navigate('/supplier');
  const handleStudentExchange = () => {};

  // Redirect if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order":
        return ShoppingCart;
      case "product":
        return Package;
      case "system":
        return Settings;
      case "promotion":
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-blue-500";
      case "product":
        return "bg-green-500";
      case "system":
        return "bg-gray-500";
      case "promotion":
        return "bg-orange-500";
      default:
        return "bg-primary";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "À l'instant";
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.isRead;
    if (activeTab === "important") return notification.isImportant;
    return notification.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const importantCount = notifications.filter(n => n.isImportant).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: false } : n)
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onUniversityChange={handleUniversityChange}
        onSupplierAccess={handleSupplierAccess}
        onStudentExchange={handleStudentExchange}
      />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">
                Restez informé de vos commandes et des nouveautés
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCircle className="w-4 h-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{notifications.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{unreadCount}</div>
              <div className="text-sm text-muted-foreground">Non lues</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{importantCount}</div>
              <div className="text-sm text-muted-foreground">Importantes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">
                {notifications.filter(n => n.type === "order").length}
              </div>
              <div className="text-sm text-muted-foreground">Commandes</div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtrer les notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="unread">
                  Non lues {unreadCount > 0 && <Badge className="ml-1">{unreadCount}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="important">
                  Importantes {importantCount > 0 && <Badge className="ml-1">{importantCount}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="order">Commandes</TabsTrigger>
                <TabsTrigger value="product">Produits</TabsTrigger>
                <TabsTrigger value="promotion">Promotions</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
                    <p className="text-muted-foreground">
                      {activeTab === "all"
                        ? "Vous n'avez aucune notification pour le moment."
                        : `Aucune notification dans la catégorie "${activeTab}".`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => {
                      const TypeIcon = notification.icon || getTypeIcon(notification.type);

                      return (
                        <Card
                          key={notification.id}
                          className={`transition-all duration-200 hover:shadow-md ${
                            !notification.isRead ? "border-l-4 border-l-primary bg-primary/5" : ""
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Icon */}
                              <div className={`w-10 h-10 ${getTypeColor(notification.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                                <TypeIcon className="w-5 h-5 text-white" />
                              </div>

                              {/* Content */}
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h3 className={`font-semibold ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                                        {notification.title}
                                      </h3>
                                      {notification.isImportant && (
                                        <Badge variant="destructive" className="text-xs">
                                          Important
                                        </Badge>
                                      )}
                                      {!notification.isRead && (
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      {formatTimestamp(notification.timestamp)}
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1">
                                    {!notification.isRead ? (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => markAsRead(notification.id)}
                                        title="Marquer comme lu"
                                      >
                                        <Check className="w-4 h-4" />
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => markAsUnread(notification.id)}
                                        title="Marquer comme non lu"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => deleteNotification(notification.id)}
                                      title="Supprimer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Action Button */}
                                {notification.actionUrl && notification.actionText && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      markAsRead(notification.id);
                                      navigate(notification.actionUrl!);
                                    }}
                                  >
                                    {notification.actionText}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}