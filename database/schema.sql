-- ============================================================
-- Online Banking System - Database Schema
-- PostgreSQL / Neon PostgreSQL
-- ============================================================

-- Run this file FIRST, then run seed.sql.

-- ------------------------------------------------------------
-- CUSTOMERS
-- ------------------------------------------------------------
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS customers;
DROP SEQUENCE IF EXISTS seq_customer_code;
DROP SEQUENCE IF EXISTS seq_account_number;
DROP SEQUENCE IF EXISTS seq_transaction_reference;

CREATE SEQUENCE seq_customer_code START 1;

CREATE TABLE customers (
    id            SERIAL PRIMARY KEY,
    customer_code VARCHAR(20)  NOT NULL UNIQUE,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
    phone         VARCHAR(20)  NOT NULL CHECK (phone ~ '^[0-9+\-\s]{7,20}$'),
    address       VARCHAR(255),
    city          VARCHAR(100) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_customer_code ON customers (customer_code);
CREATE INDEX idx_customers_email        ON customers (email);

-- ------------------------------------------------------------
-- ACCOUNTS
-- ------------------------------------------------------------
CREATE SEQUENCE seq_account_number START 100001;

CREATE TABLE accounts (
    id            SERIAL PRIMARY KEY,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    customer_id    INT         NOT NULL,
    account_type   VARCHAR(20) NOT NULL CHECK (account_type IN ('Savings', 'Current', 'Salary')),
    balance        NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    status         VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Closed')),
    opened_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_accounts_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers (id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_accounts_account_number ON accounts (account_number);
CREATE INDEX idx_accounts_customer_id   ON accounts (customer_id);

-- ------------------------------------------------------------
-- TRANSACTIONS
-- ------------------------------------------------------------
CREATE SEQUENCE seq_transaction_reference START 1;

CREATE TABLE transactions (
    id                        SERIAL PRIMARY KEY,
    account_id                INT           NOT NULL,
    transaction_reference     VARCHAR(30)   NOT NULL UNIQUE,
    transaction_type          VARCHAR(10)   NOT NULL CHECK (transaction_type IN ('CREDIT', 'DEBIT')),
    amount                    NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    description               VARCHAR(255),
    transaction_date          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    balance_after_transaction NUMERIC(15, 2) NOT NULL CHECK (balance_after_transaction >= 0),
    CONSTRAINT fk_transactions_account
        FOREIGN KEY (account_id)
        REFERENCES accounts (id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_transactions_account_id       ON transactions (account_id);
CREATE INDEX idx_transactions_transaction_date ON transactions (transaction_date);