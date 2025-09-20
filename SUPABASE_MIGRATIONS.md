# Supabase Migrations for Enhanced Authentication System

This document contains the SQL migrations needed to implement the new role-based authentication system with email verification and sponsorship chair permissions.

## Migration Overview

The new authentication system introduces:
- Email verification requirement
- Role-based permissions (`user` and `sponsorship_chair`)
- Enhanced user approval workflow
- Proper RLS (Row Level Security) policies

## Required Migrations

### 1. Add Role Column to user_profiles Table

```sql
-- Add role column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN role text DEFAULT 'user' CHECK (role IN ('user', 'sponsorship_chair'));

-- Update existing users to have the default 'user' role
UPDATE public.user_profiles 
SET role = 'user' 
WHERE role IS NULL;

-- Make role column NOT NULL
ALTER TABLE public.user_profiles 
ALTER COLUMN role SET NOT NULL;
```

### 2. Create or Update RLS Policies

```sql
-- Enable RLS on user_profiles if not already enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Sponsorship chairs can read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Sponsorship chairs can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own profile (excluding role and is_approved)
CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Allow sponsorship chairs to read all profiles
CREATE POLICY "Sponsorship chairs can read all profiles" ON public.user_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'sponsorship_chair' 
    AND is_approved = true
  )
);

-- Allow sponsorship chairs to update all profiles
CREATE POLICY "Sponsorship chairs can update all profiles" ON public.user_profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'sponsorship_chair' 
    AND is_approved = true
  )
);

-- Allow authenticated users to insert their profile
CREATE POLICY "Enable insert for authenticated users only" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 3. Create Function to Prevent Role Self-Modification

```sql
-- Create function to prevent users from changing their own role
CREATE OR REPLACE FUNCTION public.prevent_role_self_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow sponsorship chairs to update other users
  IF EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'sponsorship_chair' 
    AND is_approved = true
    AND user_id != NEW.user_id
  ) THEN
    RETURN NEW;
  END IF;

  -- For self-updates, prevent role and is_approved changes
  IF OLD.user_id = auth.uid() THEN
    IF OLD.role != NEW.role OR OLD.is_approved != NEW.is_approved THEN
      RAISE EXCEPTION 'Users cannot modify their own role or approval status';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for the function
DROP TRIGGER IF EXISTS prevent_role_self_modification_trigger ON public.user_profiles;
CREATE TRIGGER prevent_role_self_modification_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_modification();
```

### 4. Update RLS Policies for Other Tables (Optional)

If you want to restrict editing of sponsors and events to sponsorship chairs only:

```sql
-- Update sponsors table policies
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.sponsors;
DROP POLICY IF EXISTS "Enable insert for sponsorship chairs" ON public.sponsors;
DROP POLICY IF EXISTS "Enable update for sponsorship chairs" ON public.sponsors;
DROP POLICY IF EXISTS "Enable delete for sponsorship chairs" ON public.sponsors;

-- Allow all authenticated users to read sponsors
CREATE POLICY "Enable read access for authenticated users" ON public.sponsors
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only sponsorship chairs can insert sponsors
CREATE POLICY "Enable insert for sponsorship chairs" ON public.sponsors
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'sponsorship_chair' 
    AND is_approved = true
  )
);

-- Only sponsorship chairs can update sponsors
CREATE POLICY "Enable update for sponsorship chairs" ON public.sponsors
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'sponsorship_chair' 
    AND is_approved = true
  )
);

-- Only sponsorship chairs can delete sponsors
CREATE POLICY "Enable delete for sponsorship chairs" ON public.sponsors
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'sponsorship_chair' 
    AND is_approved = true
  )
);

-- Similar policies for events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.events;
DROP POLICY IF EXISTS "Enable insert for sponsorship chairs" ON public.events;
DROP POLICY IF EXISTS "Enable update for sponsorship chairs" ON public.events;
DROP POLICY IF EXISTS "Enable delete for sponsorship chairs" ON public.events;

CREATE POLICY "Enable read access for authenticated users" ON public.events
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for sponsorship chairs" ON public.events
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'sponsorship_chair' 
    AND is_approved = true
  )
);

CREATE POLICY "Enable update for sponsorship chairs" ON public.events
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'sponsorship_chair' 
    AND is_approved = true
  )
);

CREATE POLICY "Enable delete for sponsorship chairs" ON public.events
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'sponsorship_chair' 
    AND is_approved = true
  )
);

-- Similar policies for tiers table
ALTER TABLE public.tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.tiers;
DROP POLICY IF EXISTS "Enable insert for sponsorship chairs" ON public.tiers;
DROP POLICY IF EXISTS "Enable update for sponsorship chairs" ON public.tiers;
DROP POLICY IF EXISTS "Enable delete for sponsorship chairs" ON public.tiers;

CREATE POLICY "Enable read access for authenticated users" ON public.tiers
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for sponsorship chairs" ON public.tiers
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'sponsorship_chair' 
    AND is_approved = true
  )
);

CREATE POLICY "Enable update for sponsorship chairs" ON public.tiers
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'sponsorship_chair' 
    AND is_approved = true
  )
);

CREATE POLICY "Enable delete for sponsorship chairs" ON public.tiers
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'sponsorship_chair' 
    AND is_approved = true
  )
);
```

### 5. Configure Supabase Auth Settings

In your Supabase dashboard, make sure to configure the following auth settings:

1. **Email Settings**:
   - Enable email confirmations for signup
   - Configure email templates for confirmation
   - Set up proper SMTP settings

2. **Auth Configuration**:
   ```sql
   -- Update auth settings (run in SQL editor)
   UPDATE auth.config 
   SET 
     enable_signup = true,
     enable_confirmations = true
   WHERE id = 1;
   ```

### 6. Create Initial Sponsorship Chair (Optional)

If you need to create an initial sponsorship chair account:

```sql
-- This should be run AFTER the first user signs up and verifies their email
-- Replace 'user-uuid-here' with the actual UUID of the user
UPDATE public.user_profiles 
SET 
  role = 'sponsorship_chair',
  is_approved = true
WHERE user_id = 'user-uuid-here';
```

## Migration Execution Order

1. Run migration #1 (Add role column)
2. Run migration #2 (Create/Update RLS policies)
3. Run migration #3 (Create role modification prevention)
4. Run migration #4 (Optional - restrict other tables)
5. Configure auth settings in Supabase dashboard
6. Create initial sponsorship chair if needed

## Testing the Migration

After running these migrations:

1. Sign up a new user and verify the email verification flow works
2. Check that new users have `role = 'user'` and `is_approved = false`
3. Promote a user to sponsorship chair using the SQL editor
4. Test that sponsorship chairs can access user management
5. Test that regular users cannot access restricted features

## Rollback (if needed)

If you need to rollback these changes:

```sql
-- Remove the role column
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS role;

-- Drop the custom function and trigger
DROP TRIGGER IF EXISTS prevent_role_self_modification_trigger ON public.user_profiles;
DROP FUNCTION IF EXISTS public.prevent_role_self_modification();

-- Revert to simpler RLS policies (adjust as needed for your original setup)
-- You'll need to recreate your original policies here
```

## Notes

- Make sure to backup your database before running these migrations
- Test thoroughly in a development environment first
- The RLS policies assume that users need to be both approved AND have the sponsorship_chair role to perform administrative actions
- Email verification is handled by Supabase Auth automatically once enabled
- Consider setting up proper email templates for a better user experience

## Citation

These migrations implement the role-based authentication system designed for the Sponsorship Platform application.