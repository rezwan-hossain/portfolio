// module/profile/components/admin/AdminEventsPanel.tsx
"use client";

import { useState } from "react";
import type { AdminEvent, AdminOrganizer } from "@/types/profile";
import { EventForm } from "./EventForm";
import { Plus, ArrowLeft } from "lucide-react";
import { EventsList } from "./EventsList";

type AdminEventsPanelProps = {
  initialEvents: AdminEvent[];
  initialOrganizers: AdminOrganizer[];
};

type View = "list" | "create" | "edit";

export function AdminEventsPanel({
  initialEvents,
  initialOrganizers,
}: AdminEventsPanelProps) {
  const [view, setView] = useState<View>("list");
  const [events, setEvents] = useState(initialEvents);
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);

  const handleCreate = () => {
    setEditingEvent(null);
    setView("create");
  };

  const handleEdit = (event: AdminEvent) => {
    setEditingEvent(event);
    setView("edit");
  };

  const handleBack = () => {
    setView("list");
    setEditingEvent(null);
  };

  const handleSuccess = (updatedEvents: AdminEvent[]) => {
    setEvents(updatedEvents);
    setView("list");
    setEditingEvent(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {view === "list" ? (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manage Events</h2>
              <p className="text-sm text-gray-500 mt-1">
                {events.length} event{events.length !== 1 ? "s" : ""} total
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-gray-900 text-white font-bold uppercase tracking-wider text-xs rounded-lg px-5 py-3 hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              Create Event
            </button>
          </>
        ) : (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Events
          </button>
        )}
      </div>

      {/* Content */}
      {view === "list" && (
        <EventsList
          events={events}
          onEdit={handleEdit}
          onRefresh={handleSuccess}
        />
      )}

      {(view === "create" || view === "edit") && (
        <EventForm
          event={editingEvent}
          organizers={initialOrganizers}
          onSuccess={handleSuccess}
          onCancel={handleBack}
        />
      )}
    </div>
  );
}
