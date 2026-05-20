-- V1: Initial schema

CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(255) NOT NULL,
    role        VARCHAR(50)  NOT NULL DEFAULT 'ATTORNEY',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE cases (
    id              BIGSERIAL PRIMARY KEY,
    case_number     VARCHAR(100) NOT NULL UNIQUE,
    debtor_name     VARCHAR(255) NOT NULL,
    chapter         SMALLINT     NOT NULL,           -- 7, 11, 13
    status          VARCHAR(50)  NOT NULL DEFAULT 'OPEN',
    filing_date     DATE         NOT NULL,
    court_district  VARCHAR(255),
    judge_name      VARCHAR(255),
    trustee_name    VARCHAR(255),
    notes           TEXT,
    assigned_to_id  BIGINT REFERENCES users(id),
    created_by_id   BIGINT REFERENCES users(id),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE documents (
    id              BIGSERIAL PRIMARY KEY,
    case_id         BIGINT       NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    file_name       VARCHAR(255) NOT NULL,
    s3_key          VARCHAR(500) NOT NULL UNIQUE,
    content_type    VARCHAR(100),
    file_size_bytes BIGINT,
    uploaded_by_id  BIGINT REFERENCES users(id),
    uploaded_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_cases_status     ON cases(status);
CREATE INDEX idx_cases_chapter    ON cases(chapter);
CREATE INDEX idx_cases_filing_date ON cases(filing_date);
CREATE INDEX idx_cases_assigned   ON cases(assigned_to_id);
CREATE INDEX idx_documents_case   ON documents(case_id);
