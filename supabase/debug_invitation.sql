-- RUN THIS IN THE SUPABASE SQL EDITOR TO TEST OR FIX A USER
-- This script manually sets an employee's password to their employee_id

-- 1. Find the user and set their password
-- NOTE: You usually can't hash passwords manually easily in SQL that Supabase Auth understands
-- But you can use the Supabase Admin API which we updated in the app.

-- To check if an employee has the correct metadata:
SELECT 
    id, email, raw_user_meta_data->>'employee_id' as emp_id,
    last_sign_in_at, created_at
FROM auth.users
WHERE email = 'okloelvito@gmail.com'; -- Change this to the email you want to check

-- To check password length requirements in your project:
-- Go to Authentication -> Settings -> Password Protection in Supabase Dashboard.
-- Default is usually 6 characters. If your Employee ID is "EMP01", it will fail.
