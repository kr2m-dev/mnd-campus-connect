import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, User, MapPin, Phone, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { logger } from "@/lib/logger";
import { createWhatsAppLink } from "@/lib/phone-utils";
import { useCreateWhatsAppOrder } from "@/hooks/use-whatsapp-orders";

interface WhatsAppOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product?: {
    id?: string;
    name: string;
    price: number;
    supplier_id?: string;
    suppliers?: {
      business_name: string;
      contact_whatsapp?: string;
    };
  };
  cartItems?: Array<{
    quantity: number;
    products: {
      id?: string;
      name: string;
      price: number;
      supplier_id?: string;
      suppliers?: {
        business_name: string;
        contact_whatsapp?: string;
      };
    };
  }>;
}

export const WhatsAppOrderDialog = ({
  isOpen,
  onClose,
  product,
  cartItems
}: WhatsAppOrderDialogProps) => {
  const { user } = useAuth();
  const createOrder = useCreateWhatsAppOrder();

  const meta = user?.user_metadata ?? {};
  const isConnected = !!user;

  const [formData, setFormData] = useState({
    firstName: meta.first_name ?? "",
    lastName: meta.last_name ?? "",
    location: "",
    phone: meta.phone ?? "",
  });

  // Resync si l'utilisateur change (ex: connexion pendant que le dialog est ouvert)
  useEffect(() => {
    if (isConnected) {
      setFormData(prev => ({
        ...prev,
        firstName: meta.first_name ?? prev.firstName,
        lastName: meta.last_name ?? prev.lastName,
        phone: meta.phone ?? prev.phone,
      }));
    }
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let message = "";
    let whatsappNumber = "";

    if (product) {
      whatsappNumber = product.suppliers?.contact_whatsapp || "";
      message = `Bonjour,\n\nJe souhaite commander:\n\n*Produit:* ${product.name}\n*Prix:* ${product.price} CFA\n\n*Mes informations:*\n- Nom: ${formData.firstName} ${formData.lastName}\n- Lieu: ${formData.location}\n- Téléphone: ${formData.phone}\n\nMerci!`;
    } else if (cartItems && cartItems.length > 0) {
      whatsappNumber = cartItems[0]?.products?.suppliers?.contact_whatsapp || "";

      const itemsText = cartItems
        .map(item => `- ${item.products.name} (x${item.quantity}) - ${item.products.price * item.quantity} CFA`)
        .join('\n');

      const total = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);

      message = `Bonjour,\n\nJe souhaite commander:\n\n${itemsText}\n\n*Total:* ${total} CFA\n\n*Mes informations:*\n- Nom: ${formData.firstName} ${formData.lastName}\n- Lieu: ${formData.location}\n- Téléphone: ${formData.phone}\n\nMerci!`;
    }

    if (!whatsappNumber) {
      logger.error("WhatsApp number is missing for this order");
      alert("Le numéro WhatsApp du fournisseur n'est pas disponible. Veuillez contacter le support.");
      return;
    }

    const whatsappUrl = createWhatsAppLink(whatsappNumber, message);
    if (!whatsappUrl) {
      logger.error("Failed to create WhatsApp link");
      alert("Impossible de créer le lien WhatsApp. Veuillez réessayer.");
      return;
    }

    // Ouvrir WhatsApp
    window.open(whatsappUrl, "_blank");

    // Enregistrer la commande en base
    try {
      if (product && product.supplier_id) {
        await createOrder.mutateAsync({
          supplier_id: product.supplier_id,
          product_id: product.id || null,
          product_name: product.name,
          product_price: product.price,
          quantity: 1,
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_phone: formData.phone,
          customer_location: formData.location,
          user_id: user?.id || null,
        });
      } else if (cartItems && cartItems.length > 0) {
        // Enregistrer chaque article du panier
        for (const item of cartItems) {
          if (item.products.supplier_id) {
            await createOrder.mutateAsync({
              supplier_id: item.products.supplier_id,
              product_id: item.products.id || null,
              product_name: item.products.name,
              product_price: item.products.price,
              quantity: item.quantity,
              customer_name: `${formData.firstName} ${formData.lastName}`,
              customer_phone: formData.phone,
              customer_location: formData.location,
              user_id: user?.id || null,
            });
          }
        }
      }
    } catch (err) {
      // On ne bloque pas l'utilisateur si l'enregistrement échoue
      logger.error("Erreur enregistrement commande WhatsApp", err);
    }

    onClose();
  };

  const isFormValid = formData.firstName && formData.lastName && formData.location && formData.phone;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            Commander via WhatsApp
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Infos identité */}
          {isConnected ? (
            <div className="bg-muted/60 rounded-lg px-4 py-3 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                <Lock className="w-3 h-3" />
                Informations récupérées depuis votre compte
              </p>
              <p className="text-sm font-medium">{formData.firstName} {formData.lastName}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {formData.phone || "Téléphone non renseigné"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Prénom
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Votre prénom"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    placeholder="Votre nom"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Votre numéro
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="77 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          {/* Lieu de livraison — toujours demandé */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Lieu de livraison
            </Label>
            <Input
              id="location"
              placeholder="Ex: Grand Campus Pavillon A"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
            <p className="font-medium">Commande via WhatsApp</p>
            <p className="text-muted-foreground">
              En cliquant sur le bouton ci-dessous, vous serez redirigé vers WhatsApp avec un message pré-rempli pour finaliser votre commande directement avec le fournisseur.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || createOrder.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Ouvrir WhatsApp
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
