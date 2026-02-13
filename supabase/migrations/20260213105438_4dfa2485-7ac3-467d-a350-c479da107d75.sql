-- Fix RLS policies on users table
DROP POLICY IF EXISTS "Anyone can create users" ON public.users;
DROP POLICY IF EXISTS "Anyone can delete users" ON public.users;
DROP POLICY IF EXISTS "Anyone can update users" ON public.users;
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;

CREATE POLICY "Authenticated users can view users"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create users"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update users"
  ON public.users FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete users"
  ON public.users FOR DELETE
  TO authenticated
  USING (true);

-- Fix RLS policies on meetings table
DROP POLICY IF EXISTS "Anyone can create meetings" ON public.meetings;
DROP POLICY IF EXISTS "Anyone can delete meetings" ON public.meetings;
DROP POLICY IF EXISTS "Anyone can update meetings" ON public.meetings;
DROP POLICY IF EXISTS "Anyone can view meetings" ON public.meetings;

CREATE POLICY "Authenticated users can view meetings"
  ON public.meetings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create meetings"
  ON public.meetings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update meetings"
  ON public.meetings FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete meetings"
  ON public.meetings FOR DELETE
  TO authenticated
  USING (true);