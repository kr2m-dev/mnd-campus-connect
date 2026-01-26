import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, User, MapPin, Phone, X, Store } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createWhatsAppLink } from "@/lib/phone-utils";

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    suppliers?: {
      id: string;
      business_name: string;
      contact_whatsapp?: string;
    };
  };
}

interface SupplierOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  supplierWhatsapp?: string;
  items: CartItem[];
}

export const SupplierOrderDialog = ({
  isOpen,
  onClose,
  supplierName,
  supplierWhatsapp,
  items
}: SupplierOrderDialogProps) => {
  const { user } = useAuth();
  
  // Track which items are excluded from this order (but stay in cart)
  const [excludedItemIds, setExcludedItemIds] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    location: "",
    phone: ""
  });

  // Items that will be ordered (not excluded)
  const orderItems = useMemo(() => 
    items.filter(item => !excludedItemIds.has(item.id)),
    [items, excludedItemIds]
  );

  // Calculate total for items being ordered
  const orderTotal = useMemo(() => 
    orderItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0),
    [orderItems]
  );

  const handleExcludeItem = (itemId: string) => {
    setExcludedItemIds(prev => new Set([...prev, itemId]));
  };

  const handleIncludeItem = (itemId: string) => {
    setExcludedItemIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orderItems.length === 0) return;

    // Build WhatsApp message
    const itemsText = orderItems
      .map(item => `• ${item.products.name} (x${item.quantity}) - ${(item.products.price * item.quantity).toLocaleString()} CFA`)
      .join('\n');
    
    const message = `Bonjour *${supplierName}*,

Je souhaite commander les produits suivants :

${itemsText}

*Total : ${orderTotal.toLocaleString()} CFA*

*Mes informations :*
- Nom : ${formData.firstName} ${formData.lastName}
- Lieu de livraison : ${formData.location}
- Téléphone : ${formData.phone}

Merci !`;

    const whatsappUrl = createWhatsAppLink(supplierWhatsapp, message);
    if (!whatsappUrl) return;
    window.open(whatsappUrl, "_blank");
    
    // Reset excluded items when closing
    setExcludedItemIds(new Set());
    onClose();
  };

  const handleClose = () => {
    setExcludedItemIds(new Set());
    onClose();
  };

  const isFormValid = formData.firstName && formData.lastName && formData.location && formData.phone && orderItems.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            Commander chez {supplierName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Products list */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Produits à commander ({orderItems.length}/{items.length})
            </h4>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((item) => {
                const isExcluded = excludedItemIds.has(item.id);
                return (
                  <div 
                    key={item.id} 
                    className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${
                      isExcluded ? 'bg-muted/50 opacity-60' : 'bg-card'
                    }`}
                  >
                    {/* Product image */}
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={item.products.image_url || "/placeholder.svg"} 
                        alt={item.products.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${isExcluded ? 'line-through' : ''}`}>
                        {item.products.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.products.price.toLocaleString()} CFA × {item.quantity}
                      </p>
                    </div>
                    
                    {/* Price */}
                    <p className={`font-semibold text-sm whitespace-nowrap ${isExcluded ? 'line-through text-muted-foreground' : ''}`}>
                      {(item.products.price * item.quantity).toLocaleString()} CFA
                    </p>
                    
                    {/* Exclude/Include button */}
                    {isExcluded ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleIncludeItem(item.id)}
                        className="text-primary hover:text-primary"
                      >
                        Ajouter
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExcludeItem(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {excludedItemIds.size > 0 && (
              <p className="text-xs text-muted-foreground">
                💡 {excludedItemIds.size} produit(s) exclu(s) de cette commande (restent dans votre panier)
              </p>
            )}
          </div>

          <Separator />

          {/* Order total */}
          <div className="flex justify-between items-center py-2 px-3 bg-primary/10 rounded-lg">
            <span className="font-medium">Total de la commande</span>
            <span className="text-lg font-bold text-primary">{orderTotal.toLocaleString()} CFA</span>
          </div>

          <Separator />

          {/* Contact form */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Vos informations</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="flex items-center gap-1.5 text-xs">
                  <User className="w-3 h-3" />
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

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs">Nom</Label>
                <Input
                  id="lastName"
                  placeholder="Votre nom"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location" className="flex items-center gap-1.5 text-xs">
                <MapPin className="w-3 h-3" />
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

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs">
                <Phone className="w-3 h-3" />
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
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
              Passer la commande
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};