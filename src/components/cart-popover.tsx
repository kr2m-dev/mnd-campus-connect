import { useNavigate } from "react-router-dom";
import { useCart, useRemoveFromCart } from "@/hooks/use-cart";
import { ShoppingCart, X, ArrowRight, Package, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { slugify } from "@/lib/utils";

interface CartPopoverProps {
  userId: string;
}

export const CartPopover = ({ userId }: CartPopoverProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: cartItems = [] } = useCart(userId);
  const removeFromCart = useRemoveFromCart();

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const total = cartItems.reduce(
    (sum, item) => sum + (item.products?.price ?? 0) * item.quantity,
    0
  );

  const handleGoToCart = () => {
    setOpen(false);
    navigate("/cart");
  };

  return (
    <div className="relative">
      {/* Bouton panier */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <ShoppingCart className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </button>

      {/* Overlay fermeture */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <span className="font-semibold text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Mon panier
              {cartCount > 0 && (
                <Badge variant="secondary" className="text-xs">{cartCount}</Badge>
              )}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Liste des articles */}
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
              <Package className="w-10 h-10 opacity-30" />
              <p className="text-sm">Votre panier est vide</p>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => { setOpen(false); navigate("/products"); }}
              >
                Voir les produits
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-y-auto max-h-72 divide-y divide-border/50">
                {cartItems.map((item) => {
                  const product = item.products;
                  if (!product) return null;
                  const image = product.image_url;

                  return (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors group">
                      {/* Image */}
                      <div
                        className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0 cursor-pointer"
                        onClick={() => { setOpen(false); navigate(`/products/${slugify(product.name)}`); }}
                      >
                        {image ? (
                          <img src={image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => { setOpen(false); navigate(`/products/${slugify(product.name)}`); }}
                        >
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                          <span className="text-sm font-semibold text-primary">
                            {(product.price * item.quantity).toLocaleString()} CFA
                          </span>
                        </div>
                      </div>

                      {/* Supprimer */}
                      <button
                        onClick={() => removeFromCart.mutate({ cartItemId: item.id, userId })}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Footer : total + bouton */}
              <div className="px-4 py-3 border-t border-border/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-base font-bold">{total.toLocaleString()} CFA</span>
                </div>
                <Button
                  className="w-full rounded-full bg-primary hover:bg-primary/90 font-semibold"
                  onClick={handleGoToCart}
                >
                  Voir le panier complet
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
