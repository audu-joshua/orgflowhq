# Subscription Reminder Cron Setup

To activate the daily automated checks for subscription expiration and reminders, you need to trigger the following API endpoint once every 24 hours.

## Endpoint
**Method**: `GET`
**URL**: `https://your-domain.com/api/cron/subscription-check`

(Replace `your-domain.com` with your actual production domain, e.g., `www.orgflowhq.com`)

## Setup Options

### Option 1: Vercel Cron (Recommended for Vercel Deployments)
If you are hosting on Vercel, simply add a `vercel.json` file to the root of your project:

```json
{
  "crons": [
    {
      "path": "/api/cron/subscription-check",
      "schedule": "0 0 * * *"
    }
  ]
}
```
*The schedule `0 0 * * *` means it runs every day at midnight.*

### Option 2: EasyCron or External Cron Service
1. Create an account on [EasyCron](https://www.easycron.com/) or a similar service.
2. Create a new Cron Job.
3. Enter the URL: `https://your-domain.com/api/cron/subscription-check`
4. Set the execution time to **every day**.

### Option 3: Manual / Curl
You can manually test it or run it from a server using curl:
```bash
curl https://your-domain.com/api/cron/subscription-check
```

## Security Note
Currently, the route is public to allow easy setup. For production, uncomment the security check lines in `app/api/cron/subscription-check/route.ts` and set a `CRON_SECRET` environment variable to prevent unauthorized triggers.
