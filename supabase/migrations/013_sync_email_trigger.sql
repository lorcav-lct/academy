-- Sync profiles.email when auth.users.email changes
CREATE OR REPLACE FUNCTION sync_user_email_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_email_change ON auth.users;

CREATE TRIGGER on_user_email_change
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_email_to_profile();
