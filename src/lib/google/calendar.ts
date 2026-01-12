import { google } from "googleapis";

const SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.readonly" // Optional, good for reading busy times
];

// Helper to get OAuth2 Client
const getOAuth2Client = () => {
    const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
    );
    return client;
};

export const googleCalendarService = {
    // 1. Generate Auth URL
    getAuthUrl: () => {
        const client = getOAuth2Client();
        return client.generateAuthUrl({
            access_type: "offline", // Crucial for refresh_token
            scope: SCOPES,
            prompt: "consent" // Force consent to ensure refresh_token returned
        });
    },

    // 2. Exchange Code for Tokens
    getTokens: async (code: string) => {
        const client = getOAuth2Client();
        const { tokens } = await client.getToken(code);
        return tokens;
    },

    // 3. Create Event with Meet Link
    createCalendarEvent: async (
        authTokens: { access_token: string; refresh_token?: string },
        eventDetails: {
            summary: string;
            description: string;
            start: string; // ISO string
            end: string;   // ISO string
            attendees: string[]; // Email addresses
        }
    ) => {
        const client = getOAuth2Client();

        // Use tokens
        client.setCredentials({
            access_token: authTokens.access_token,
            refresh_token: authTokens.refresh_token
        });

        // Initialize Calendar API
        const calendar = google.calendar({ version: "v3", auth: client });

        // Create Event
        const response = await calendar.events.insert({
            calendarId: "primary",
            conferenceDataVersion: 1, // Required for Meet link
            requestBody: {
                summary: eventDetails.summary,
                description: eventDetails.description,
                start: { dateTime: eventDetails.start },
                end: { dateTime: eventDetails.end },
                attendees: eventDetails.attendees.map(email => ({ email })),
                conferenceData: {
                    createRequest: {
                        requestId: Math.random().toString(36).substring(2, 11),
                        conferenceSolutionKey: { type: "hangoutsMeet" }
                    }
                }
            }
        });

        // If hangoutLink is missing, check conferenceData deep structure (sometimes it's here)
        if (!response.data.hangoutLink && response.data.conferenceData) {
            const entryPoints = response.data.conferenceData.entryPoints;
            const videoLink = entryPoints?.find(ep => ep.entryPointType === 'video')?.uri;
            if (videoLink) {
                return {
                    id: response.data.id,
                    htmlLink: response.data.htmlLink,
                    hangoutLink: videoLink
                };
            }
        }

        return {
            id: response.data.id,
            htmlLink: response.data.htmlLink,
            hangoutLink: response.data.hangoutLink
        };
    },

    // 4. Get Event Details (Status, Time)
    getEvent: async (
        eventId: string,
        authTokens: { access_token: string; refresh_token?: string; expiry_date?: number }
    ) => {
        const client = getOAuth2Client();
        client.setCredentials({
            access_token: authTokens.access_token,
            refresh_token: authTokens.refresh_token,
            expiry_date: authTokens.expiry_date
        });

        const calendar = google.calendar({ version: "v3", auth: client });
        const response = await calendar.events.get({
            calendarId: "primary",
            eventId: eventId
        });

        return response.data;
    }
};
