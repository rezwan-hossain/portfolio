
import EventPage from "@/module/event/pages/EventPage";
import { getAllEvents } from "../actions/event";

export default async function page() {
  const { events, error } = await getAllEvents();
  

  return <EventPage events={events} error={error} />;
}
