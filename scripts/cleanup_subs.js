
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

envContent.split('\n').forEach(line => {
    const trimLine = line.trim();
    if (trimLine && !trimLine.startsWith('#')) {
        const splitIndex = trimLine.indexOf('=');
        if (splitIndex > 0) {
            const key = trimLine.substring(0, splitIndex).trim();
            const value = trimLine.substring(splitIndex + 1).trim().replace(/^"|"$/g, '');
            if (key && value) {
                process.env[key] = value;
            }
        }
    }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ORG_ID = '3bf244ef-a18e-48d1-a3c6-04d1af9a06a5';

async function cleanupSubscriptions() {
    console.log(`Cleaning up subscriptions for org: ${ORG_ID}`);

    // Get all subscriptions for this org
    const { data: subs, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', ORG_ID)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching subs:', error);
        return;
    }

    console.log(`Found ${subs.length} subscriptions.`);

    if (subs.length > 1) {
        // Keep the first one (latest), delete the rest
        const toDelete = subs.slice(1);
        const idsToDelete = toDelete.map(s => s.id);

        console.log(`Deleting ${idsToDelete.length} duplicates...`, idsToDelete);

        const { error: deleteError } = await supabase
            .from('subscriptions')
            .delete()
            .in('id', idsToDelete);

        if (deleteError) {
            console.error('Error deleting:', deleteError);
        } else {
            console.log('Successfully deleted duplicates.');
        }
    } else {
        console.log('No duplicates found.');
    }
}

cleanupSubscriptions();
