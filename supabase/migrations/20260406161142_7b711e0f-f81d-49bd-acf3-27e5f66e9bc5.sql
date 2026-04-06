
UPDATE user_restrictions SET status = 'active', deadline = NOW() + INTERVAL '12 hours' WHERE id = '19998e74-981a-449e-88f6-d05ec05d51fb';
UPDATE profiles SET is_suspended = false WHERE id = '15b145d9-e61e-44e6-92b8-99c7cd151eea';
