import { createClient } from "@/lib/supabase/server";
import CheckoutPage from "@/module/checkout/pages/CheckoutPage";
import { redirect } from "next/navigation";
import { getCheckoutData } from "../actions/checkout";

type SearchParams = Promise<{
  package?: string;
  event?: string;
  qty?: string;
}>;

export default async function page({ searchParams }: { searchParams: SearchParams }) {

  const supabase = await createClient();

  const { data: { user }} = await supabase.auth.getUser();

    if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const packageId = params.package ? Number(params.package) : null;
  const quantity = params.qty ? Number(params.qty) : 1;

  if (!packageId) {
    redirect("/events");
  }

   const { package: pkg, error } = await getCheckoutData(packageId);

  if (!pkg || error) {
    redirect("/events");
  }

    const checkoutItem = {
    packageId: pkg.id,
    eventId: pkg.event.id,
    eventName: pkg.event.name,
    packageName: pkg.name,
    distance: pkg.distance,
    price: pkg.price,
    qty: quantity,
  };

  // Pass user email for pre-filling
  const userEmail = user.email ?? "";
  const userName = user.user_metadata?.full_name ?? "";

  return (
    <CheckoutPage item={checkoutItem}
      userEmail={userEmail}
      userName={userName}
    />
  )
}
