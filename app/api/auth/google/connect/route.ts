import { googleCalendarService } from "@/lib/google/calendar"
import { redirect } from "next/navigation"

export async function GET() {
    const url = googleCalendarService.getAuthUrl()
    redirect(url)
}
