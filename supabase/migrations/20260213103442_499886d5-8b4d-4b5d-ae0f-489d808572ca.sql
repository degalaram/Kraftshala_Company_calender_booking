
-- Create users table
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique index on email
CREATE UNIQUE INDEX idx_users_email ON public.users (email);

-- Create meetings table
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_meetings_user_start ON public.meetings (user_id, start_time);
CREATE INDEX idx_meetings_time_range ON public.meetings (start_time, end_time);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Users RLS: public access (no auth required)
CREATE POLICY "Anyone can create users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Anyone can update users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete users" ON public.users FOR DELETE USING (true);

-- Meetings RLS: public access
CREATE POLICY "Anyone can create meetings" ON public.meetings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view meetings" ON public.meetings FOR SELECT USING (true);
CREATE POLICY "Anyone can update meetings" ON public.meetings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete meetings" ON public.meetings FOR DELETE USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Validation trigger: startTime must be before endTime
CREATE OR REPLACE FUNCTION public.validate_meeting_times()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_time >= NEW.end_time THEN
    RAISE EXCEPTION 'startTime must be before endTime';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_meeting_times_trigger
  BEFORE INSERT OR UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.validate_meeting_times();

-- Conflict prevention trigger: no overlapping meetings per user
CREATE OR REPLACE FUNCTION public.check_meeting_overlap()
RETURNS TRIGGER AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM public.meetings
  WHERE user_id = NEW.user_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND start_time < NEW.end_time
    AND end_time > NEW.start_time;
  
  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'Time slot already booked';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER check_meeting_overlap_trigger
  BEFORE INSERT OR UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.check_meeting_overlap();
