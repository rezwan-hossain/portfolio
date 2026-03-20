import CartPage from "@/module/cart/pages/CartPage";
import { getPackageWithEvent } from "../actions/cart";
import { redirect } from "next/navigation";

type SearchParams = Promise<{
  package?: string;
  qty?: string;
  event?: string;
}>;

export default async function page({ searchParams }: { searchParams: SearchParams }) {

  const params = await searchParams
  const packageId = params.package ? Number(params.package) : null;
  const quantity = params.qty ? Number(params.qty) : 1;
  const eventSlug = params.event ?? "";

   // No package selected → show empty cart
  if (!packageId) {
    return <CartPage items={[]} />;
  }

  const { package: pkg, error } = await getPackageWithEvent(packageId);

   if (!pkg || error) {
    redirect("/events");
  }

  // Build cart item from package data
  const cartItems = [
    {
      id: pkg.id,
      packageId: pkg.id,
      eventId: pkg.event.id,
      eventSlug: pkg.event.slug,
      eventName: pkg.event.name,
      packageName: pkg.name,
      distance: pkg.distance,
      price: pkg.price,
      qty: quantity,
      availableSlots: pkg.availableSlots - pkg.usedSlots,
      bannerImage: pkg.event.bannerImage,
    },
  ];

  return <CartPage items={cartItems}/>;
}
