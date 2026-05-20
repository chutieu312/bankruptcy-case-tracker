-- V3: Fix demo user passwords (BCrypt cost 12 hash for "demo1234")
UPDATE users SET password = '$2b$12$a6GK.NyFuxcaGF9Xs/gYx.7E8NkGT8Dm3xD5EAG5mI.QhGOWH/lnW'
WHERE email IN ('admin@strettodemo.com', 'attorney@strettodemo.com', 'trustee@strettodemo.com');
