import { getValidAccessToken } from "@/lib/integrations/token-refresh";
import type Anthropic from "@anthropic-ai/sdk";

// Google Calendar API base URL
const CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

// Tool definitions for Claude
export const calendarToolDefinitions: Anthropic.Messages.Tool[] = [
  {
    name: "list_calendar_events",
    description:
      "List upcoming calendar events from the user's Google Calendar. Returns events within a specified time range.",
    input_schema: {
      type: "object" as const,
      properties: {
        timeMin: {
          type: "string",
          description:
            "Start time for the query in ISO 8601 format (e.g., '2024-01-15T00:00:00Z'). Defaults to now.",
        },
        timeMax: {
          type: "string",
          description:
            "End time for the query in ISO 8601 format. Defaults to 7 days from now.",
        },
        maxResults: {
          type: "number",
          description: "Maximum number of events to return (default: 10, max: 50)",
        },
        calendarId: {
          type: "string",
          description: "Calendar ID to query (default: 'primary')",
        },
      },
      required: [],
    },
  },
  {
    name: "get_calendar_event",
    description: "Get detailed information about a specific calendar event by its ID.",
    input_schema: {
      type: "object" as const,
      properties: {
        eventId: {
          type: "string",
          description: "The Google Calendar event ID",
        },
        calendarId: {
          type: "string",
          description: "Calendar ID (default: 'primary')",
        },
      },
      required: ["eventId"],
    },
  },
  {
    name: "create_calendar_event",
    description:
      "Create a new event on the user's Google Calendar. Requires at minimum a summary/title and start time.",
    input_schema: {
      type: "object" as const,
      properties: {
        summary: {
          type: "string",
          description: "Event title/summary",
        },
        description: {
          type: "string",
          description: "Event description (optional)",
        },
        location: {
          type: "string",
          description: "Event location (optional)",
        },
        startDateTime: {
          type: "string",
          description: "Start time in ISO 8601 format (e.g., '2024-01-15T10:00:00-07:00')",
        },
        endDateTime: {
          type: "string",
          description:
            "End time in ISO 8601 format. If not provided, defaults to 1 hour after start.",
        },
        attendees: {
          type: "array",
          items: { type: "string" },
          description: "List of attendee email addresses (optional)",
        },
        calendarId: {
          type: "string",
          description: "Calendar ID (default: 'primary')",
        },
      },
      required: ["summary", "startDateTime"],
    },
  },
  {
    name: "update_calendar_event",
    description:
      "Update an existing calendar event. Only provided fields will be updated.",
    input_schema: {
      type: "object" as const,
      properties: {
        eventId: {
          type: "string",
          description: "The Google Calendar event ID to update",
        },
        summary: {
          type: "string",
          description: "New event title/summary",
        },
        description: {
          type: "string",
          description: "New event description",
        },
        location: {
          type: "string",
          description: "New event location",
        },
        startDateTime: {
          type: "string",
          description: "New start time in ISO 8601 format",
        },
        endDateTime: {
          type: "string",
          description: "New end time in ISO 8601 format",
        },
        calendarId: {
          type: "string",
          description: "Calendar ID (default: 'primary')",
        },
      },
      required: ["eventId"],
    },
  },
];

// Calendar event interface
interface CalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  htmlLink?: string;
  created?: string;
  updated?: string;
  status?: string;
  organizer?: { email?: string; displayName?: string };
}

interface CalendarListResponse {
  items?: CalendarEvent[];
  nextPageToken?: string;
}

// Tool execution functions

export async function listCalendarEvents(
  userId: string,
  timeMin?: string,
  timeMax?: string,
  maxResults: number = 10,
  calendarId: string = "primary"
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(userId, "google");
    if (!accessToken) {
      return {
        success: false,
        error:
          "Google Calendar is not connected or the connection has expired. Please reconnect in settings.",
      };
    }

    const now = new Date();
    const defaultTimeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const effectiveTimeMin = timeMin || now.toISOString();
    const effectiveTimeMax = timeMax || defaultTimeMax.toISOString();
    const effectiveMaxResults = Math.min(maxResults, 50);

    const url = new URL(`${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`);
    url.searchParams.set("timeMin", effectiveTimeMin);
    url.searchParams.set("timeMax", effectiveTimeMax);
    url.searchParams.set("maxResults", effectiveMaxResults.toString());
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Calendar API error:", errorData);
      return { success: false, error: "Failed to retrieve calendar events" };
    }

    const data: CalendarListResponse = await response.json();
    const events = (data.items || []).map((event) => ({
      id: event.id,
      summary: event.summary || "(No title)",
      description: event.description,
      location: event.location,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      isAllDay: !event.start?.dateTime,
      attendees: event.attendees?.map((a) => ({
        email: a.email,
        name: a.displayName,
        status: a.responseStatus,
      })),
      link: event.htmlLink,
    }));

    return {
      success: true,
      data: {
        events,
        total: events.length,
        timeRange: { from: effectiveTimeMin, to: effectiveTimeMax },
      },
    };
  } catch (error) {
    console.error("Error listing calendar events:", error);
    return { success: false, error: "An error occurred while retrieving calendar events" };
  }
}

export async function getCalendarEvent(
  userId: string,
  eventId: string,
  calendarId: string = "primary"
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(userId, "google");
    if (!accessToken) {
      return {
        success: false,
        error:
          "Google Calendar is not connected or the connection has expired. Please reconnect in settings.",
      };
    }

    const response = await fetch(
      `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: "Event not found" };
      }
      return { success: false, error: "Failed to retrieve event" };
    }

    const event: CalendarEvent = await response.json();

    return {
      success: true,
      data: {
        id: event.id,
        summary: event.summary || "(No title)",
        description: event.description,
        location: event.location,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        isAllDay: !event.start?.dateTime,
        attendees: event.attendees?.map((a) => ({
          email: a.email,
          name: a.displayName,
          status: a.responseStatus,
        })),
        organizer: event.organizer,
        link: event.htmlLink,
        status: event.status,
        created: event.created,
        updated: event.updated,
      },
    };
  } catch (error) {
    console.error("Error getting calendar event:", error);
    return { success: false, error: "An error occurred while retrieving the event" };
  }
}

export async function createCalendarEvent(
  userId: string,
  summary: string,
  startDateTime: string,
  endDateTime?: string,
  description?: string,
  location?: string,
  attendees?: string[],
  calendarId: string = "primary"
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(userId, "google");
    if (!accessToken) {
      return {
        success: false,
        error:
          "Google Calendar is not connected or the connection has expired. Please reconnect in settings.",
      };
    }

    // Default end time to 1 hour after start if not provided
    const start = new Date(startDateTime);
    const end = endDateTime ? new Date(endDateTime) : new Date(start.getTime() + 60 * 60 * 1000);

    const eventBody: Record<string, unknown> = {
      summary,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
    };

    if (description) eventBody.description = description;
    if (location) eventBody.location = location;
    if (attendees && attendees.length > 0) {
      eventBody.attendees = attendees.map((email) => ({ email }));
    }

    const response = await fetch(
      `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Calendar create error:", errorData);
      return { success: false, error: "Failed to create calendar event" };
    }

    const event: CalendarEvent = await response.json();

    return {
      success: true,
      data: {
        id: event.id,
        summary: event.summary,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        link: event.htmlLink,
        message: `Event "${summary}" created successfully`,
      },
    };
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return { success: false, error: "An error occurred while creating the event" };
  }
}

export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  updates: {
    summary?: string;
    description?: string;
    location?: string;
    startDateTime?: string;
    endDateTime?: string;
  },
  calendarId: string = "primary"
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(userId, "google");
    if (!accessToken) {
      return {
        success: false,
        error:
          "Google Calendar is not connected or the connection has expired. Please reconnect in settings.",
      };
    }

    // First, get the current event
    const getResponse = await fetch(
      `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!getResponse.ok) {
      if (getResponse.status === 404) {
        return { success: false, error: "Event not found" };
      }
      return { success: false, error: "Failed to retrieve event for update" };
    }

    const currentEvent: CalendarEvent = await getResponse.json();

    // Build update body
    const updateBody: Record<string, unknown> = {
      summary: updates.summary || currentEvent.summary,
      description: updates.description !== undefined ? updates.description : currentEvent.description,
      location: updates.location !== undefined ? updates.location : currentEvent.location,
      start: updates.startDateTime
        ? { dateTime: new Date(updates.startDateTime).toISOString() }
        : currentEvent.start,
      end: updates.endDateTime
        ? { dateTime: new Date(updates.endDateTime).toISOString() }
        : currentEvent.end,
    };

    const response = await fetch(
      `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Calendar update error:", errorData);
      return { success: false, error: "Failed to update calendar event" };
    }

    const event: CalendarEvent = await response.json();

    return {
      success: true,
      data: {
        id: event.id,
        summary: event.summary,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        link: event.htmlLink,
        message: `Event "${event.summary}" updated successfully`,
      },
    };
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return { success: false, error: "An error occurred while updating the event" };
  }
}

// Tool handler function
export async function handleCalendarTool(
  userId: string,
  toolName: string,
  input: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  switch (toolName) {
    case "list_calendar_events":
      return listCalendarEvents(
        userId,
        input.timeMin as string | undefined,
        input.timeMax as string | undefined,
        input.maxResults as number | undefined,
        input.calendarId as string | undefined
      );

    case "get_calendar_event":
      return getCalendarEvent(
        userId,
        input.eventId as string,
        input.calendarId as string | undefined
      );

    case "create_calendar_event":
      return createCalendarEvent(
        userId,
        input.summary as string,
        input.startDateTime as string,
        input.endDateTime as string | undefined,
        input.description as string | undefined,
        input.location as string | undefined,
        input.attendees as string[] | undefined,
        input.calendarId as string | undefined
      );

    case "update_calendar_event":
      return updateCalendarEvent(
        userId,
        input.eventId as string,
        {
          summary: input.summary as string | undefined,
          description: input.description as string | undefined,
          location: input.location as string | undefined,
          startDateTime: input.startDateTime as string | undefined,
          endDateTime: input.endDateTime as string | undefined,
        },
        input.calendarId as string | undefined
      );

    default:
      return { success: false, error: `Unknown Calendar tool: ${toolName}` };
  }
}
