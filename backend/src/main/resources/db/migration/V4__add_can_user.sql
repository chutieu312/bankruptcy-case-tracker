-- V4: Add Can Nguyen personal account (password: demo1234)
INSERT INTO users (email, password, full_name, role)
VALUES ('cannguyen312@gmail.com', '$2b$12$a6GK.NyFuxcaGF9Xs/gYx.7E8NkGT8Dm3xD5EAG5mI.QhGOWH/lnW', 'Can Nguyen', 'ATTORNEY')
ON CONFLICT (email) DO NOTHING;
