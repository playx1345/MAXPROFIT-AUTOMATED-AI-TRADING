-- Temporarily drop the trigger
DROP TRIGGER IF EXISTS validate_profile_update_trigger ON profiles;

-- Update the balance
UPDATE profiles 
SET balance_usdt = 532674.00
WHERE id = '4a93cf5f-c1f2-4c2a-b1d7-cb8ad6c635a0';

-- Recreate the trigger
CREATE TRIGGER validate_profile_update_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_update();