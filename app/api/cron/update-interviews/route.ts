import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Interview, Application } from '@/models/Recruitment';
import { User, Organization } from '@/models/User';
import { mailService } from '@/lib/mail/mailService';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        await connectToDatabase();
        const now = new Date();
        const bufferMinutes = 15;
        const checkTime = new Date(now.getTime() - bufferMinutes * 60000);

        // 1. Fetch scheduled interviews that should have ended
        // Note: Adding 1 hour default duration if end_time not present (based on previous schema)
        // In the new model, it's just 'scheduledAt' and 'duration'

        const interviews = await Interview.find({
            status: 'scheduled',
            scheduledAt: { $lte: checkTime }
        }).populate("applicationId").populate("roleId");

        if (!interviews || interviews.length === 0) {
            return NextResponse.json({ message: 'No interviews to update' });
        }

        const results = [];

        for (const interview of interviews) {
            try {
                // Update Interview & Application status
                interview.status = 'completed';
                await interview.save();

                const application = await Application.findById(interview.applicationId);
                if (application) {
                    application.currentStage = 'Interview Completed';
                    application.status = 'interviewed';
                    await application.save();
                }

                // Notify Interviewer (Organizer)
                const organizer = await User.findById(interview.organizerId);
                const org = await Organization.findById(interview.organizationId);

                if (organizer && application) {
                    await mailService.sendFeedbackRequestEmail(
                        organizer.email,
                        organizer.fullName || 'Interviewer',
                        application.applicantName,
                        (interview.roleId as any).title || 'Job Position',
                        org?.name || 'OrgFlow'
                    );
                }

                results.push({ id: interview._id, action: 'completed' });
            } catch (innerError: any) {
                console.error(`Error processing interview ${interview._id}:`, innerError);
                results.push({ id: interview._id, error: innerError.message });
            }
        }

        return NextResponse.json({ processed: results.length, details: results });
    } catch (error: any) {
        console.error('Cron job failed:', error);
        return new NextResponse(error.message, { status: 500 });
    }
}
