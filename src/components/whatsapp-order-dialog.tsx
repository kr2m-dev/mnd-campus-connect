import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, User, MapPin, Phone } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface WhatsAppOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product?: {
    name: string;
    price: number;
    suppliers?: {
      business_name: string;
      contact_whatsapp?: string;
    };
  };
  cartItems?: Array<{
    quantity: number;
    products: {
      name: string;
      price: number;
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
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    location: "",
    phone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let message = "";
    let whatsappNumber = "";

    if (product) {
      // Single product order
      whatsappNumber = product.suppliers?.contact_whatsapp || "";
      message = `Bonjour,\n\nJe souhaite commander:\n\n*Produit:* ${product.name}\n*Prix:* ${product.price} CFA\n\n*Mes informations:*\n- Nom: ${formData.firstName} ${formData.lastName}\n- Lieu: ${formData.location}\n- Téléphone: ${formData.phone}\n\nMerci!`;
    } else if (cartItems && cartItems.length > 0) {
      // Cart order - use first supplier's WhatsApp
      whatsappNumber = cartItems[0]?.products?.suppliers?.contact_whatsapp || "";
      
      const itemsText = cartItems
        .map(item => `- ${item.products.name} (x${item.quantity}) - ${item.products.price * item.quantity} CFA`)
        .join('\n');
      
      const total = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
      
      message = `Bonjour,\n\nJe souhaite commander:\n\n${itemsText}\n\n*Total:* ${total} CFA\n\n*Mes informations:*\n- Nom: ${formData.firstName} ${formData.lastName}\n- Lieu: ${formData.location}\n- Téléphone: ${formData.phone}\n\nMerci!`;
    }

    // Format phone number (remove spaces, dashes, and add country code if needed)
    let formattedPhone = whatsappNumber.replace(/[\s-]/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+221' + formattedPhone; // Senegal country code
    }

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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

          <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
            <p className="font-medium">📱 Commande via WhatsApp</p>
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
              disabled={!isFormValid}
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