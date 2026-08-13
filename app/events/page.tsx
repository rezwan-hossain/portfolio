import EventPage from "@/module/event/pages/EventPage";
import { getAllEvents } from "../actions/event";
import { getUpcomingEvents, getPreviousEvents } from "../actions/event";

export default async function page() {
  // const { events, error } = await getAllEvents();
  const [
    { events: upcomingEvents = [], error: upcomingError },
    { events: previousEvents = [], error: previousError },
  ] = await Promise.all([getUpcomingEvents(6), getPreviousEvents(6)]);

  // return <EventPage events={events} error={error} />;
  return (
    <EventPage
      upcomingEvents={upcomingEvents}
      previousEvents={previousEvents}
      error={upcomingError || previousError}
    />
  );
}
