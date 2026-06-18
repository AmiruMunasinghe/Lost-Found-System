-- Admin Seed Script
-- ============================================================
-- OPTION A: Promote an existing registered user to ADMIN
-- ============================================================
-- 1. Register a user normally via POST /auth/register/
-- 2. Run the UPDATE below (replace 'your_username' with the actual username):

-- UPDATE users SET role = 'ADMIN' WHERE username = 'your_username';

-- ============================================================
-- OPTION B: Insert a new admin directly (requires a BCrypt hash)
-- ============================================================
-- Generate a BCrypt hash (strength 10) for your chosen password using:
--   - Online: https://bcrypt-generator.com  (strength = 10)
--   - Or run in Java: new BCryptPasswordEncoder().encode("YourPassword")
-- Then replace REPLACE_WITH_BCRYPT_HASH below and run:

-- INSERT INTO users (username, email, password_hash, role, created_at)
-- VALUES (
--     'admin',
--     'admin@lostfound.edu',
--     'REPLACE_WITH_BCRYPT_HASH',
--     'ADMIN',
--     NOW()
-- )
-- ON CONFLICT (username) DO NOTHING;
