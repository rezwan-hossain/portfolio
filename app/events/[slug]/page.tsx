import { getEventBySlug } from "@/app/actions/event";
import EventDetailPage from "@/module/event/pages/EventDetailPage";
import { notFound } from "next/navigation";


type Params = Promise<{ slug: string }>;

export default async function page({ params }: { params: Params }) {

  const { slug } = await params;
  const { event, error } = await getEventBySlug(slug);

   if (!event || error) {
    notFound();
  }

  return <EventDetailPage event={event}/>;
}
