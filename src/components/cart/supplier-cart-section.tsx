import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Plus, Minus, Trash2, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { slugify } from "@/lib/utils";

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    original_price?: number;
    image_url?: string;
    stock_quantity?: number;
    suppliers?: {
      id: string;
      business_name: string;
      contact_whatsapp?: string;
    };
    categories?: {
      name: string;
    };
  };
}

interface SupplierCartSectionProps {
  supplierName: string;
  supplierId: string;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onOrder: () => void;
}

export const SupplierCartSection = ({
  supplierName,
  supplierId,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onOrder
}: SupplierCartSectionProps) => {
  const navigate = useNavigate();

  const sectionTotal = items.reduce((sum, item) => 
    sum + (item.products.price * item.quantity), 0
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Store className="w-5 h-5 text-primary" />
            {supplierName}
            <Badge variant="secondary" className="ml-2">
              {totalItems} article{totalItems > 1 ? 's' : ''}
            </Badge>
          </CardTitle>
          <Button
            onClick={onOrder}
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Commander
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y">
        {items.map((item) => {
          const product = item.products;
          if (!product) return null;

          const discount = product.original_price
            ? Math.round((1 - product.price / product.original_price) * 100)
            : 0;

          return (
            <div key={item.id} className="flex gap-4 p-4">
              {/* Product Image */}
              <div 
                className="relative w-20 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/products/${slugify(product.name)}`)}
              >
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {discount > 0 && (
                  <Badge variant="destructive" className="absolute top-1 left-1 text-xs px-1">
                    -{discount}%
                  </Badge>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <h3
                  className="font-semibold text-sm hover:text-primary cursor-pointer transition-colors truncate"
                  onClick={() => navigate(`/products/${slugify(product.name)}`)}
                >
                  {product.name}
                </h3>
                
                {product.categories && (
                  <Badge variant="outline" className="text-xs">
                    {product.categories.name}
                  </Badge>
                )}

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="font-bold">{product.price.toLocaleString()} CFA</span>
                  {product.original_price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {product.original_price.toLocaleString()} CFA
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Controls & Delete */}
              <div className="flex flex-col items-end justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 -mr-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center font-medium text-sm">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= (product.stock_quantity || 99)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                <span className="font-semibold text-sm">
                  {(product.price * item.quantity).toLocaleString()} CFA
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>

      {/* Section Total */}
      <div className="px-4 py-3 bg-muted/30 flex items-center justify-between border-t">
        <span className="text-sm text-muted-foreground">Sous-total {supplierName}</span>
        <span className="font-bold">{sectionTotal.toLocaleString()} CFA</span>
      </div>
    </Card>
  );
};