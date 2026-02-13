
-- Add validation trigger for users table
CREATE OR REPLACE FUNCTION public.validate_user_input()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF length(NEW.name) = 0 OR length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Name must be between 1 and 100 characters';
  END IF;
  IF NEW.email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  IF length(NEW.email) > 255 THEN
    RAISE EXCEPTION 'Email must be less than 255 characters';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_user_before_insert_update
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_input();

-- Add validation trigger for meetings table
CREATE OR REPLACE FUNCTION public.validate_meeting_input()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF length(NEW.title) = 0 OR length(NEW.title) > 200 THEN
    RAISE EXCEPTION 'Title must be between 1 and 200 characters';
  END IF;
  IF NEW.start_time >= NEW.end_time THEN
    RAISE EXCEPTION 'Start time must be before end time';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_meeting_before_insert_update
  BEFORE INSERT OR UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_meeting_input();
