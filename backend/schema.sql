-- Run this once against your Oracle schema before starting the app

CREATE TABLE tasks (
    id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title        VARCHAR2(200)   NOT NULL,
    description  VARCHAR2(1000),
    status       VARCHAR2(20)    DEFAULT 'PENDING' NOT NULL,
    created_at   TIMESTAMP       DEFAULT SYSTIMESTAMP,
    updated_at   TIMESTAMP       DEFAULT SYSTIMESTAMP
);

-- Optional: keep updated_at fresh automatically
CREATE OR REPLACE TRIGGER trg_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
BEGIN
    :NEW.updated_at := SYSTIMESTAMP;
END;
/
