-- V2: Seed demo data

INSERT INTO users (email, password, full_name, role) VALUES
  ('admin@strettodemo.com',  '$2a$12$K1zIveIFBnHOmJwdQlx/5.1hzMB8NqMXAaGYSyRVQMNhGjbsTr6tW', 'Admin User',    'ADMIN'),
  ('attorney@strettodemo.com','$2a$12$K1zIveIFBnHOmJwdQlx/5.1hzMB8NqMXAaGYSyRVQMNhGjbsTr6tW', 'Jane Attorney', 'ATTORNEY'),
  ('trustee@strettodemo.com', '$2a$12$K1zIveIFBnHOmJwdQlx/5.1hzMB8NqMXAaGYSyRVQMNhGjbsTr6tW', 'Bob Trustee',   'TRUSTEE');
-- All demo passwords are: demo1234

INSERT INTO cases (case_number, debtor_name, chapter, status, filing_date, court_district, judge_name, trustee_name, assigned_to_id, created_by_id) VALUES
  ('2024-BK-00001', 'Acme Corp',          11, 'OPEN',       '2024-01-15', 'D. Del.', 'Hon. Smith',   'Bob Trustee', 2, 1),
  ('2024-BK-00002', 'John Doe',            7, 'OPEN',       '2024-02-20', 'S.D.N.Y.','Hon. Jones',   'Bob Trustee', 2, 1),
  ('2024-BK-00003', 'Retail Holdings LLC', 11, 'CLOSED',    '2023-11-01', 'D. Del.', 'Hon. Williams','Bob Trustee', 2, 1),
  ('2024-BK-00004', 'Jane Smith',          13, 'OPEN',       '2024-03-10', 'N.D. Cal.','Hon. Brown',  NULL,          2, 2),
  ('2024-BK-00005', 'Tech Startup Inc',   11, 'DISMISSED',  '2024-04-05', 'D. Del.', 'Hon. Davis',   NULL,          3, 1);
