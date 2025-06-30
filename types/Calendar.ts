type CalendarEntry = {
    id: string;
    title: string;
    description: string | null;
    from: Date;
    to: Date | null;
    location: string | null;
    attendees: string[];
    organizer: string;
    isAllDay: boolean;
    isRecurring: boolean;
}

export type { CalendarEntry };