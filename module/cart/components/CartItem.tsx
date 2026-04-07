// module/cart/components/CartItem.tsx
interface CartItemProps {
  name: string;
  distance: string;
  price: number;
  qty: number;
  imageUrl: string;
  onRemove: () => void;
}

const CartItem = ({
  name,
  distance,
  price,
  qty,
  imageUrl,
  onRemove,
}: CartItemProps) => {
  return (
    <tr className="border-b border-cart-border">
      <td className="py-4 sm:py-6 pr-2 sm:pr-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded overflow-hidden bg-cart-item-bg flex items-center justify-center">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm sm:text-base text-cart-foreground leading-snug tracking-wide truncate">
              {name}
            </p>
            {/* Distance Badge */}
            <span className="block w-fit mt-1 px-2 py-0.5 text-xs bg-indigo-50 text-indigo-600 rounded-full font-medium">
              {distance}
            </span>
            <button
              onClick={onRemove}
              className="text-xs sm:text-sm text-red-500 hover:text-cart-foreground underline mt-1 transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      </td>
      <td className="py-4 sm:py-6 px-2 text-sm sm:text-base font-medium text-cart-foreground text-center hidden sm:table-cell">
        ৳{price.toFixed(2)}
      </td>
      <td className="py-4 sm:py-6 text-center">
        <div className="inline-flex items-center justify-center border border-gray-200 rounded w-10 h-10 sm:w-12 sm:h-12">
          <span className="text-sm sm:text-base font-medium text-cart-foreground">
            {qty}
          </span>
        </div>
      </td>
      <td className="py-4 sm:py-6 px-2 sm:px-3 text-cart-foreground text-right text-sm sm:text-base font-medium">
        ৳{(price * qty).toFixed(2)}
      </td>
    </tr>
  );
};

export default CartItem;
