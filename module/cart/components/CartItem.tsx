import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface CartItemProps {
  name: string;
  price: number;
  initialQty: number;
  imageUrl: string;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
}

const CartItem = ({
  name,
  price,
  initialQty,
  imageUrl,
  onQuantityChange,
  onRemove,
}: CartItemProps) => {
  const [qty, setQty] = useState(initialQty);

  const updateQty = (newQty: number) => {
    if (newQty < 1) return;
    setQty(newQty);
    onQuantityChange(newQty);
  };

  return (
    <tr className="border-b border-cart-border">
      <td className="py-6 pr-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-cart-item-bg flex items-center justify-center">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-base  text-cart-foreground leading-snug tracking-wide">
              {name}
            </p>
            <button
              onClick={onRemove}
              className="text-sm text-red-500 hover:text-cart-foreground underline mt-1 transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      </td>
      <td className="py-6 text-base font-medium text-cart-foreground text-center hidden sm:table-cell">
        ${price.toFixed(2)}
      </td>
      <td className="py-6 text-center">
        <div className="inline-flex items-center border border-gray-200 rounded">
          <button
            onClick={() => updateQty(qty - 1)}
            className="w-10 h-10 flex items-center justify-center text-cart-muted hover:text-cart-foreground transition-colors cursor-pointer"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 h-10 flex items-center justify-center text-base font-medium text-cart-foreground border-x border-gray-200">
            {qty}
          </span>
          <button
            onClick={() => updateQty(qty + 1)}
            className="w-10 h-10 flex items-center justify-center text-cart-muted hover:text-cart-foreground transition-colors cursor-pointer"
          >
            <Plus size={14} />
          </button>
        </div>
      </td>
      <td className="py-6  text-cart-foreground text-right text-base font-medium">
        ${(price * qty).toFixed(2)}
      </td>
    </tr>
  );
};

export default CartItem;
