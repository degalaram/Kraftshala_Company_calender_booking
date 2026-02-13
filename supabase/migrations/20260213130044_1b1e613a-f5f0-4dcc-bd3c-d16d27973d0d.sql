
-- 1. Add auth_user_id column to users table
ALTER TABLE public.users ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE;

-- 2. Create trigger to auto-create a user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 3. Drop old permissive RLS policies on users
DROP POLICY IF EXISTS "Authenticated users can view users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can create users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can update users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can delete users" ON public.users;
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;
DROP POLICY IF EXISTS "Anyone can create users" ON public.users;
DROP POLICY IF EXISTS "Anyone can update users" ON public.users;
DROP POLICY IF EXISTS "Anyone can delete users" ON public.users;

-- 4. Create owner-based RLS policies on users
CREATE POLICY "Users can view own record"
  ON public.users FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "System creates user on signup"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can delete own record"
  ON public.users FOR DELETE TO authenticated
  USING (auth.uid() = auth_user_id);

-- 5. Drop old permissive RLS policies on meetings
DROP POLICY IF EXISTS "Authenticated users can view meetings" ON public.meetings;
DROP POLICY IF EXISTS "Authenticated users can create meetings" ON public.meetings;
DROP POLICY IF EXISTS "Authenticated users can update meetings" ON public.meetings;
DROP POLICY IF EXISTS "Authenticated users can delete meetings" ON public.meetings;
DROP POLICY IF EXISTS "Anyone can view meetings" ON public.meetings;
DROP POLICY IF EXISTS "Anyone can create meetings" ON public.meetings;
DROP POLICY IF EXISTS "Anyone can update meetings" ON public.meetings;
DROP POLICY IF EXISTS "Anyone can delete meetings" ON public.meetings;

-- 6. Create owner-based RLS policies on meetings (via user_id -> users.auth_user_id)
CREATE POLICY "Users can view own meetings"
  ON public.meetings FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can create own meetings"
  ON public.meetings FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own meetings"
  ON public.meetings FOR UPDATE TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete own meetings"
  ON public.meetings FOR DELETE TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- 7. Allow the trigger function (SECURITY DEFINER) to insert without RLS check
-- The handle_new_auth_user runs as SECURITY DEFINER so it bypasses RLS
