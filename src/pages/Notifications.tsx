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
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  type NotificationType
} from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  // Use real data from database
  const { data: notifications = [] } = useNotifications(user?.id);
  const { data: unreadCount = 0 } = useUnreadNotificationsCount(user?.id);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

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
      case "message":
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
      case "message":
        return "bg-purple-500";
      default:
        return "bg-primary";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: fr,
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.is_read;
    return notification.type === activeTab;
  });

  const handleMarkAsRead = (id: string) => {
    if (!user?.id) return;
    markAsRead.mutate({ notificationId: id, userId: user.id });
  };

  const handleDeleteNotification = (id: string) => {
    if (!user?.id) return;
    deleteNotification.mutate({ notificationId: id, userId: user.id });
  };

  const handleMarkAllAsRead = () => {
    if (!user?.id) return;
    markAllAsRead.mutate(user.id);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read && user?.id) {
      markAsRead.mutate({ notificationId: notification.id, userId: user.id });
    }

    // Navigate if link exists
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onUniversityChange={handleUniversityChange}
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
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <CheckCircle className="w-4 h-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="unread">
                  Non lues {unreadCount > 0 && <Badge className="ml-1">{unreadCount}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="order">Commandes</TabsTrigger>
                <TabsTrigger value="product">Produits</TabsTrigger>
                <TabsTrigger value="message">Messages</TabsTrigger>
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
                      const TypeIcon = getTypeIcon(notification.type);

                      return (
                        <Card
                          key={notification.id}
                          className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                            !notification.is_read ? "border-l-4 border-l-primary bg-primary/5" : ""
                          }`}
                          onClick={() => handleNotificationClick(notification)}
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
                                      <h3 className={`font-semibold ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                                        {notification.title}
                                      </h3>
                                      {!notification.is_read && (
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      {formatTimestamp(notification.created_at)}
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1">
                                    {!notification.is_read ? (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMarkAsRead(notification.id);
                                        }}
                                        title="Marquer comme lu"
                                      >
                                        <Check className="w-4 h-4" />
                                      </Button>
                                    ) : null}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNotification(notification.id);
                                      }}
                                      title="Supprimer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Link indication */}
                                {notification.link && (
                                  <p className="text-xs text-primary">
                                    Cliquer pour voir les détails →
                                  </p>
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