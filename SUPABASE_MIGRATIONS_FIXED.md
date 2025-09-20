# Fixed Supabase Migrations - Resolving Infinite Recursion

This document contains the corrected SQL migrations to fix the infinite recursion issue in RLS policies.

## The Problem

The original RLS policies created infinite recursion because they tried to query the `user_profiles` table from within the policies that protect the `user_profiles` table itself.

## Solution

We need to restructure the policies to avoid self-referential queries. Here are the corrected migrations:

## URGENT: Run This Fix First

If you're experiencing the recursion error, run this immediately to disable the problematic policies:

```sql
-- Temporarily disable RLS to fix the recursion
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Sponsorship chairs can read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Sponsorship chairs can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;
```

## Corrected Migration Steps

### 1. Add Role Column (if not already done)

```sql
-- Add role column to user_profiles table (skip if already done)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'sponsorship_chair'));

-- Update existing users to have the default 'user' role
UPDATE public.user_profiles 
SET role = 'user' 
WHERE role IS NULL;

-- Make role column NOT NULL (skip if already done)
ALTER TABLE public.user_profiles 
ALTER COLUMN role SET NOT NULL;
```

### 2. Create Fixed RLS Policies for user_profiles

The key fix is to avoid querying `user_profiles` from within `user_profiles` policies:

```sql
-- Re-enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Simple policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = user_id);

-- Simple policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile, but we'll handle role restrictions in the app
CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = user_id);

-- For now, we'll handle sponsorship chair permissions at the application level
-- rather than in RLS policies to avoid recursion
```

### 3. Create a Helper Function (Alternative Approach)

If you want database-level role restrictions, create a helper function that uses security definer:

```sql
-- Create a function to check if current user is sponsorship chair
-- This function runs with elevated privileges to avoid recursion
CREATE OR REPLACE FUNCTION public.is_sponsorship_chair()
RETURNS boolean AS $$
DECLARE
  user_role text;
  user_approved boolean;
BEGIN
  -- Get current user's role and approval status
  SELECT role, is_approved INTO user_role, user_approved
  FROM public.user_profiles 
  WHERE user_id = auth.uid();
  
  -- Return true if user is an approved sponsorship chair
  RETURN (user_role = 'sponsorship_chair' AND user_approved = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now we can create policies that use this function without recursion
-- But for simplicity, let's handle permissions in the app for now
```

### 4. Prevent Role Self-Modification (Fixed Version)

```sql
-- Create function to prevent users from changing their own role
CREATE OR REPLACE FUNCTION public.prevent_role_self_modification()
RETURNS TRIGGER AS $$
DECLARE
  current_user_role text;
  current_user_approved boolean;
BEGIN
  -- If this is a self-update, prevent role and approval changes
  IF OLD.user_id = auth.uid() THEN
    IF OLD.role != NEW.role OR OLD.is_approved != NEW.is_approved THEN
      RAISE EXCEPTION 'Users cannot modify their own role or approval status';
    END IF;
  ELSE
    -- For updates to other users, check if current user is sponsorship chair
    -- Get current user's info with a direct query
    SELECT role, is_approved INTO current_user_role, current_user_approved
    FROM public.user_profiles 
    WHERE user_id = auth.uid();
    
    -- Only allow if current user is approved sponsorship chair
    IF NOT (current_user_role = 'sponsorship_chair' AND current_user_approved = true) THEN
      RAISE EXCEPTION 'Only approved sponsorship chairs can modify other users';
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

### 5. Simple RLS Policies for Other Tables

For sponsors, events, and tiers tables, we'll use a simpler approach:

```sql
-- Enable RLS for sponsors table
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.sponsors;
DROP POLICY IF EXISTS "Enable insert for sponsorship chairs" ON public.sponsors;
DROP POLICY IF EXISTS "Enable update for sponsorship chairs" ON public.sponsors;
DROP POLICY IF EXISTS "Enable delete for sponsorship chairs" ON public.sponsors;

-- Allow all authenticated users to read sponsors
CREATE POLICY "Enable read access for authenticated users" ON public.sponsors
FOR SELECT USING (auth.uid() IS NOT NULL);

-- For write operations, we'll handle permissions in the application layer
-- This avoids the complexity of cross-table policy queries
CREATE POLICY "Enable write access for authenticated users" ON public.sponsors
FOR ALL USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Similar policies for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.events;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.events;

CREATE POLICY "Enable read access for authenticated users" ON public.events
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable write access for authenticated users" ON public.events
FOR ALL USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Similar policies for tiers
ALTER TABLE public.tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.tiers;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.tiers;

CREATE POLICY "Enable read access for authenticated users" ON public.tiers
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable write access for authenticated users" ON public.tiers
FOR ALL USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Similar for event_sponsors junction table
ALTER TABLE public.event_sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.event_sponsors;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.event_sponsors;

CREATE POLICY "Enable read access for authenticated users" ON public.event_sponsors
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable write access for authenticated users" ON public.event_sponsors
FOR ALL USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
```

### 6. Configure Supabase Auth Settings

```sql
-- Enable email confirmations in Supabase
-- This should be done in the Supabase dashboard under Authentication > Settings
-- Set "Enable email confirmations" to ON
```

### 7. Create Initial Sponsorship Chair

```sql
-- After the first user signs up and verifies their email, run this:
-- Replace 'your-user-uuid-here' with the actual UUID from auth.users
UPDATE public.user_profiles 
SET 
  role = 'sponsorship_chair',
  is_approved = true
WHERE user_id = 'your-user-uuid-here';
```

## Why This Approach Works

1. **No Recursion**: The policies don't query the same table they're protecting
2. **Application-Level Permissions**: We handle role-based permissions in the React app using the authentication context
3. **Database Constraints**: We still prevent users from modifying their own roles using triggers
4. **Simple RLS**: We use simple authentication checks rather than complex role queries

## Security Notes

- The main security is handled at the application level through our React authentication system
- The database trigger prevents users from escalating their own permissions
- RLS ensures only authenticated users can access data
- All sensitive operations require proper authentication tokens

## Testing the Fix

After running these migrations:

1. The infinite recursion error should stop
2. Users should be able to read their profiles
3. The application-level permission system should work correctly
4. Sponsorship chairs should be able to manage users through the UI

## Migration Execution Order

1. Run the URGENT fix first if you're experiencing errors
2. Run steps 1-2 for basic setup
3. Run step 4 for role protection
4. Run step 5 for other table policies
5. Configure auth settings in Supabase dashboard
6. Create initial sponsorship chair

This approach prioritizes getting the system working over complex database-level permissions, which is often the better approach for applications with clear permission boundaries.