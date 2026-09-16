-- ============================================================
-- Online Banking System - Seed Data
-- PostgreSQL / Neon PostgreSQL
-- 10 customers, 13 accounts, balanced transaction history
-- ============================================================

-- Run this file AFTER schema.sql.
-- Can be run safely more than once: customers/accounts/transactions are cleared first.

TRUNCATE transactions, accounts, customers RESTART IDENTITY CASCADE;

-- ------------------------------------------------------------
-- CUSTOMERS
-- ------------------------------------------------------------
INSERT INTO customers (customer_code, first_name, last_name, email, phone, address, city, created_at) VALUES
('CUST001', 'Ananya', 'Iyer',  'ananya.iyer@example.com',    '9123456780', 'B-12 Marine Drive',             'Mumbai',    '2025-11-02 10:15:00+00'),
('CUST002', 'Rohan',  'Mehta', 'rohan.mehta@example.com',    '9234567801', '48 Hill Road, Bandra West',     'Mumbai',    '2025-11-14 09:40:00+00'),
('CUST003', 'Sania',  'Khan',  'sania.khan@example.com',     '9345678012', '221 Park Street',              'Kolkata',   '2025-12-03 13:05:00+00'),
('CUST004', 'Arjun',  'Nair',  'arjun.nair@example.com',     '9456780123', 'Sector 5, HSR Layout',         'Bengaluru', '2025-12-18 11:30:00+00'),
('CUST005', 'Priya',  'Deshmukh', 'priya.deshmukh@example.com', '9567801234', 'Flat 901, Amar Residency',    'Pune',      '2026-01-09 16:20:00+00'),
('CUST006', 'Vikram', 'Singh', 'vikram.singh@example.com',   '9678012345', '12 Civil Lines',               'Lucknow',   '2026-01-22 10:00:00+00'),
('CUST007', 'Meera',  'Krishnan', 'meera.krishnan@example.com', '9780123456', '7 Tidel Park Road',        'Chennai',   '2026-02-05 12:45:00+00'),
('CUST008', 'Karan',  'Malhotra', 'karan.malhotra@example.com', '9890123457', 'C-14 Connaught Place',     'New Delhi', '2026-02-19 15:10:00+00'),
('CUST009', 'Divya',  'Raghavan', 'divya.raghavan@example.com', '9012345678', 'Suite 305, Jubilee Hills', 'Hyderabad', '2026-03-11 09:55:00+00'),
('CUST010', 'Amitabh','Bose',  'amitabh.bose@example.com',    '8876543210', 'P-34 Salt Lake Sector 1',      'Kolkata',   '2026-04-02 14:35:00+00');

-- ------------------------------------------------------------
-- ACCOUNTS
-- ------------------------------------------------------------
INSERT INTO accounts (account_number, customer_id, account_type, balance, status, opened_at) VALUES
('ACC100001', (SELECT id FROM customers WHERE customer_code = 'CUST001'), 'Savings',  75200.50,  'Active',   '2025-11-02 10:20:00+00'),
('ACC100002', (SELECT id FROM customers WHERE customer_code = 'CUST002'), 'Current',  150000.00, 'Active',   '2025-11-14 09:45:00+00'),
('ACC100003', (SELECT id FROM customers WHERE customer_code = 'CUST003'), 'Savings',  64250.10,  'Active',   '2025-12-03 13:10:00+00'),
('ACC100004', (SELECT id FROM customers WHERE customer_code = 'CUST004'), 'Salary',   87300.00,  'Active',   '2025-12-18 11:35:00+00'),
('ACC100005', (SELECT id FROM customers WHERE customer_code = 'CUST005'), 'Current',  210000.00, 'Active',   '2026-01-09 16:25:00+00'),
('ACC100006', (SELECT id FROM customers WHERE customer_code = 'CUST006'), 'Savings',  93120.40,  'Active',   '2026-01-22 10:05:00+00'),
('ACC100007', (SELECT id FROM customers WHERE customer_code = 'CUST007'), 'Salary',   67480.30,  'Active',   '2026-02-05 12:50:00+00'),
('ACC100008', (SELECT id FROM customers WHERE customer_code = 'CUST008'), 'Current',  185500.25, 'Active',   '2026-02-19 15:15:00+00'),
('ACC100009', (SELECT id FROM customers WHERE customer_code = 'CUST009'), 'Savings',  45210.75,  'Inactive', '2026-03-11 10:00:00+00'),
('ACC100010', (SELECT id FROM customers WHERE customer_code = 'CUST010'), 'Salary',   121500.60, 'Active',   '2026-04-02 14:40:00+00'),
('ACC100011', (SELECT id FROM customers WHERE customer_code = 'CUST002'), 'Savings',  45890.90,  'Active',   '2026-04-15 11:15:00+00'),
('ACC100012', (SELECT id FROM customers WHERE customer_code = 'CUST005'), 'Salary',   76100.00,  'Active',   '2026-05-20 09:30:00+00'),
('ACC100013', (SELECT id FROM customers WHERE customer_code = 'CUST008'), 'Savings',  58340.55,  'Closed',   '2025-03-10 12:00:00+00');

-- ------------------------------------------------------------
-- TRANSACTIONS
-- balance_after_transaction is kept logically consistent per account.
-- ------------------------------------------------------------
INSERT INTO transactions
    (account_id, transaction_reference, transaction_type, amount, description, transaction_date, balance_after_transaction)
VALUES
-- ACC100001 (Savings - Ananya Iyer) final 75200.50
((SELECT id FROM accounts WHERE account_number='ACC100001'), 'TXN-00000001', 'CREDIT', 50000.00, 'Account Opening Deposit',  '2025-11-02 10:25:00+00', 50000.00),
((SELECT id FROM accounts WHERE account_number='ACC100001'), 'TXN-00000002', 'CREDIT', 42000.00, 'Salary Credit',           '2025-12-01 09:00:00+00', 92000.00),
((SELECT id FROM accounts WHERE account_number='ACC100001'), 'TXN-00000003', 'DEBIT',  5000.00, 'ATM Withdrawal',           '2026-01-10 18:30:00+00', 87000.00),
((SELECT id FROM accounts WHERE account_number='ACC100001'), 'TXN-00000004', 'DEBIT',  8500.00, 'UPI Payment',              '2026-02-14 12:45:00+00', 78500.00),
((SELECT id FROM accounts WHERE account_number='ACC100001'), 'TXN-00000005', 'CREDIT',  700.50, 'Interest Credit',          '2026-03-31 23:59:00+00', 79200.50),
((SELECT id FROM accounts WHERE account_number='ACC100001'), 'TXN-00000006', 'DEBIT',  4000.00, 'Utility Bill Payment',     '2026-04-10 11:20:00+00', 75200.50),

-- ACC100002 (Current - Rohan Mehta) final 150000.00
((SELECT id FROM accounts WHERE account_number='ACC100002'), 'TXN-00000007', 'CREDIT', 100000.00, 'Account Opening Deposit', '2025-11-14 09:50:00+00', 100000.00),
((SELECT id FROM accounts WHERE account_number='ACC100002'), 'TXN-00000008', 'CREDIT',  60000.00, 'Cash Deposit',            '2026-01-05 10:00:00+00', 160000.00),
((SELECT id FROM accounts WHERE account_number='ACC100002'), 'TXN-00000009', 'DEBIT',   25000.00, 'Online Transfer',         '2026-02-20 15:40:00+00', 135000.00),
((SELECT id FROM accounts WHERE account_number='ACC100002'), 'TXN-00000010', 'DEBIT',    8000.00, 'Merchant Payment',        '2026-03-16 13:10:00+00', 127000.00),
((SELECT id FROM accounts WHERE account_number='ACC100002'), 'TXN-00000011', 'CREDIT',  30000.00, 'Cash Deposit',            '2026-05-08 11:35:00+00', 157000.00),
((SELECT id FROM accounts WHERE account_number='ACC100002'), 'TXN-00000012', 'DEBIT',    7000.00, 'UPI Payment',             '2026-06-12 19:25:00+00', 150000.00),

-- ACC100003 (Savings - Sania Khan) final 64250.10
((SELECT id FROM accounts WHERE account_number='ACC100003'), 'TXN-00000013', 'CREDIT', 45000.00, 'Account Opening Deposit', '2025-12-03 13:15:00+00', 45000.00),
((SELECT id FROM accounts WHERE account_number='ACC100003'), 'TXN-00000014', 'CREDIT', 35000.00, 'Salary Credit',           '2026-01-01 09:00:00+00', 80000.00),
((SELECT id FROM accounts WHERE account_number='ACC100003'), 'TXN-00000015', 'DEBIT',  10000.00, 'ATM Withdrawal',          '2026-02-08 17:55:00+00', 70000.00),
((SELECT id FROM accounts WHERE account_number='ACC100003'), 'TXN-00000016', 'DEBIT',   6000.00, 'UPI Payment',             '2026-04-21 20:10:00+00', 64000.00),
((SELECT id FROM accounts WHERE account_number='ACC100003'), 'TXN-00000017', 'CREDIT',   250.10, 'Interest Credit',         '2026-06-30 23:59:00+00', 64250.10),

-- ACC100004 (Salary - Arjun Nair) final 87300.00
((SELECT id FROM accounts WHERE account_number='ACC100004'), 'TXN-00000018', 'CREDIT', 25000.00, 'Account Opening Deposit', '2025-12-18 11:40:00+00', 25000.00),
((SELECT id FROM accounts WHERE account_number='ACC100004'), 'TXN-00000019', 'CREDIT', 68000.00, 'Salary Credit',           '2026-02-01 09:00:00+00', 93000.00),
((SELECT id FROM accounts WHERE account_number='ACC100004'), 'TXN-00000020', 'DEBIT',  12000.00, 'ATM Withdrawal',          '2026-03-06 18:20:00+00', 81000.00),
((SELECT id FROM accounts WHERE account_number='ACC100004'), 'TXN-00000021', 'DEBIT',   4500.00, 'Merchant Payment',        '2026-04-19 14:30:00+00', 76500.00),
((SELECT id FROM accounts WHERE account_number='ACC100004'), 'TXN-00000022', 'CREDIT', 20000.00, 'Cash Deposit',            '2026-05-25 10:45:00+00', 96500.00),
((SELECT id FROM accounts WHERE account_number='ACC100004'), 'TXN-00000023', 'DEBIT',   9200.00, 'Utility Bill Payment',    '2026-07-12 16:00:00+00', 87300.00),

-- ACC100005 (Current - Priya Deshmukh) final 210000.00
((SELECT id FROM accounts WHERE account_number='ACC100005'), 'TXN-00000024', 'CREDIT', 150000.00, 'Account Opening Deposit', '2026-01-09 16:30:00+00', 150000.00),
((SELECT id FROM accounts WHERE account_number='ACC100005'), 'TXN-00000025', 'CREDIT',  80000.00, 'Cash Deposit',            '2026-02-11 12:15:00+00', 230000.00),
((SELECT id FROM accounts WHERE account_number='ACC100005'), 'TXN-00000026', 'DEBIT',   50000.00, 'Online Transfer',         '2026-03-18 10:50:00+00', 180000.00),
((SELECT id FROM accounts WHERE account_number='ACC100005'), 'TXN-00000027', 'DEBIT',   15000.00, 'Merchant Payment',        '2026-04-30 16:40:00+00', 165000.00),
((SELECT id FROM accounts WHERE account_number='ACC100005'), 'TXN-00000028', 'CREDIT',  60000.00, 'Cash Deposit',            '2026-06-15 11:20:00+00', 225000.00),
((SELECT id FROM accounts WHERE account_number='ACC100005'), 'TXN-00000029', 'DEBIT',   15000.00, 'UPI Payment',             '2026-08-05 21:05:00+00', 210000.00),

-- ACC100006 (Savings - Vikram Singh) final 93120.40
((SELECT id FROM accounts WHERE account_number='ACC100006'), 'TXN-00000030', 'CREDIT', 60000.00, 'Account Opening Deposit', '2026-01-22 10:10:00+00', 60000.00),
((SELECT id FROM accounts WHERE account_number='ACC100006'), 'TXN-00000031', 'CREDIT', 25000.00, 'Cash Deposit',            '2026-03-10 13:25:00+00', 85000.00),
((SELECT id FROM accounts WHERE account_number='ACC100006'), 'TXN-00000032', 'CREDIT',  3120.40, 'Interest Credit',         '2026-04-01 23:59:00+00', 88120.40),
((SELECT id FROM accounts WHERE account_number='ACC100006'), 'TXN-00000033', 'DEBIT',   8000.00, 'ATM Withdrawal',          '2026-05-14 19:30:00+00', 80120.40),
((SELECT id FROM accounts WHERE account_number='ACC100006'), 'TXN-00000034', 'CREDIT', 30000.00, 'Salary Credit',           '2026-07-01 09:00:00+00', 110120.40),
((SELECT id FROM accounts WHERE account_number='ACC100006'), 'TXN-00000035', 'DEBIT',  17000.00, 'UPI Payment',             '2026-08-20 20:15:00+00', 93120.40),

-- ACC100007 (Salary - Meera Krishnan) final 67480.30
((SELECT id FROM accounts WHERE account_number='ACC100007'), 'TXN-00000036', 'CREDIT', 20000.00, 'Account Opening Deposit', '2026-02-05 12:55:00+00', 20000.00),
((SELECT id FROM accounts WHERE account_number='ACC100007'), 'TXN-00000037', 'CREDIT', 55000.00, 'Salary Credit',           '2026-03-01 09:00:00+00', 75000.00),
((SELECT id FROM accounts WHERE account_number='ACC100007'), 'TXN-00000038', 'DEBIT',  15000.00, 'ATM Withdrawal',          '2026-04-08 18:45:00+00', 60000.00),
((SELECT id FROM accounts WHERE account_number='ACC100007'), 'TXN-00000039', 'DEBIT',   3200.00, 'Utility Bill Payment',    '2026-05-19 10:30:00+00', 56800.00),
((SELECT id FROM accounts WHERE account_number='ACC100007'), 'TXN-00000040', 'CREDIT',   480.30, 'Interest Credit',         '2026-06-30 23:59:00+00', 57280.30),
((SELECT id FROM accounts WHERE account_number='ACC100007'), 'TXN-00000041', 'CREDIT', 15000.00, 'Salary Credit',           '2026-08-01 09:00:00+00', 72280.30),
((SELECT id FROM accounts WHERE account_number='ACC100007'), 'TXN-00000042', 'DEBIT',   4800.00, 'Online Transfer',         '2026-09-05 15:10:00+00', 67480.30),

-- ACC100008 (Current - Karan Malhotra) final 185500.25
((SELECT id FROM accounts WHERE account_number='ACC100008'), 'TXN-00000043', 'CREDIT', 120000.00, 'Account Opening Deposit', '2026-02-19 15:20:00+00', 120000.00),
((SELECT id FROM accounts WHERE account_number='ACC100008'), 'TXN-00000044', 'CREDIT',  75000.00, 'Cash Deposit',            '2026-03-25 12:00:00+00', 195000.00),
((SELECT id FROM accounts WHERE account_number='ACC100008'), 'TXN-00000045', 'DEBIT',   22000.00, 'Merchant Payment',        '2026-04-22 14:20:00+00', 173000.00),
((SELECT id FROM accounts WHERE account_number='ACC100008'), 'TXN-00000046', 'DEBIT',   10000.00, 'Online Transfer',         '2026-05-30 17:45:00+00', 163000.00),
((SELECT id FROM accounts WHERE account_number='ACC100008'), 'TXN-00000047', 'CREDIT',  30000.00, 'Cash Deposit',            '2026-07-18 10:35:00+00', 193000.00),
((SELECT id FROM accounts WHERE account_number='ACC100008'), 'TXN-00000048', 'DEBIT',    7500.00, 'ATM Withdrawal',          '2026-08-25 19:05:00+00', 185500.00),
((SELECT id FROM accounts WHERE account_number='ACC100008'), 'TXN-00000049', 'CREDIT',     0.25, 'Rounding / Interest',     '2026-08-26 00:01:00+00', 185500.25),

-- ACC100009 (Savings - Divya Raghavan) final 45210.75
((SELECT id FROM accounts WHERE account_number='ACC100009'), 'TXN-00000050', 'CREDIT', 30000.00, 'Account Opening Deposit', '2026-03-11 10:05:00+00', 30000.00),
((SELECT id FROM accounts WHERE account_number='ACC100009'), 'TXN-00000051', 'CREDIT', 15000.00, 'Cash Deposit',            '2026-04-14 11:30:00+00', 45000.00),
((SELECT id FROM accounts WHERE account_number='ACC100009'), 'TXN-00000052', 'CREDIT',   210.75, 'Interest Credit',         '2026-05-01 23:59:00+00', 45210.75),
((SELECT id FROM accounts WHERE account_number='ACC100009'), 'TXN-00000053', 'DEBIT',   5000.00, 'ATM Withdrawal',          '2026-06-10 18:15:00+00', 40210.75),
((SELECT id FROM accounts WHERE account_number='ACC100009'), 'TXN-00000054', 'DEBIT',   3000.00, 'UPI Payment',             '2026-07-22 21:40:00+00', 37210.75),
((SELECT id FROM accounts WHERE account_number='ACC100009'), 'TXN-00000055', 'CREDIT', 15000.00, 'Salary Credit',           '2026-08-15 09:00:00+00', 52210.75),
((SELECT id FROM accounts WHERE account_number='ACC100009'), 'TXN-00000056', 'DEBIT',   7000.00, 'Online Transfer',         '2026-09-01 14:25:00+00', 45210.75),

-- ACC100010 (Salary - Amitabh Bose) final 121500.60
((SELECT id FROM accounts WHERE account_number='ACC100010'), 'TXN-00000057', 'CREDIT', 40000.00, 'Account Opening Deposit', '2026-04-02 14:45:00+00', 40000.00),
((SELECT id FROM accounts WHERE account_number='ACC100010'), 'TXN-00000058', 'CREDIT', 95000.00, 'Salary Credit',           '2026-05-01 09:00:00+00', 135000.00),
((SELECT id FROM accounts WHERE account_number='ACC100010'), 'TXN-00000059', 'DEBIT',  12000.00, 'UPI Payment',             '2026-06-06 20:05:00+00', 123000.00),
((SELECT id FROM accounts WHERE account_number='ACC100010'), 'TXN-00000060', 'CREDIT', 15000.00, 'Cash Deposit',            '2026-07-16 10:50:00+00', 138000.00),
((SELECT id FROM accounts WHERE account_number='ACC100010'), 'TXN-00000061', 'DEBIT',  18000.00, 'ATM Withdrawal',          '2026-08-21 17:35:00+00', 120000.00),
((SELECT id FROM accounts WHERE account_number='ACC100010'), 'TXN-00000062', 'CREDIT',  1500.60, 'Interest Credit',         '2026-08-31 23:59:00+00', 121500.60),

-- ACC100011 (Savings - Rohan Mehta) final 45890.90
((SELECT id FROM accounts WHERE account_number='ACC100011'), 'TXN-00000063', 'CREDIT', 38000.00, 'Account Opening Deposit', '2026-04-15 11:20:00+00', 38000.00),
((SELECT id FROM accounts WHERE account_number='ACC100011'), 'TXN-00000064', 'CREDIT', 12000.00, 'Cash Deposit',            '2026-06-20 12:30:00+00', 50000.00),
((SELECT id FROM accounts WHERE account_number='ACC100011'), 'TXN-00000065', 'CREDIT',   390.90, 'Interest Credit',         '2026-07-01 23:59:00+00', 50390.90),
((SELECT id FROM accounts WHERE account_number='ACC100011'), 'TXN-00000066', 'DEBIT',   4500.00, 'ATM Withdrawal',          '2026-08-11 18:50:00+00', 45890.90),

-- ACC100012 (Salary - Priya Deshmukh) final 76100.00
((SELECT id FROM accounts WHERE account_number='ACC100012'), 'TXN-00000067', 'CREDIT', 15000.00, 'Account Opening Deposit', '2026-05-20 09:35:00+00', 15000.00),
((SELECT id FROM accounts WHERE account_number='ACC100012'), 'TXN-00000068', 'CREDIT', 35000.00, 'Salary Credit',           '2026-06-01 09:00:00+00', 50000.00),
((SELECT id FROM accounts WHERE account_number='ACC100012'), 'TXN-00000069', 'CREDIT', 30000.00, 'Cash Deposit',            '2026-07-15 11:10:00+00', 80000.00),
((SELECT id FROM accounts WHERE account_number='ACC100012'), 'TXN-00000070', 'DEBIT',   9000.00, 'Online Transfer',         '2026-08-19 14:15:00+00', 71000.00),
((SELECT id FROM accounts WHERE account_number='ACC100012'), 'TXN-00000071', 'CREDIT',  5100.00, 'Cash Deposit',            '2026-09-04 12:40:00+00', 76100.00),

-- ACC100013 (Savings - Karan Malhotra, Closed) final 58340.55
((SELECT id FROM accounts WHERE account_number='ACC100013'), 'TXN-00000072', 'CREDIT', 50000.00, 'Account Opening Deposit', '2025-03-10 12:05:00+00', 50000.00),
((SELECT id FROM accounts WHERE account_number='ACC100013'), 'TXN-00000073', 'CREDIT',   340.55, 'Interest Credit',         '2025-04-01 23:59:00+00', 50340.55),
((SELECT id FROM accounts WHERE account_number='ACC100013'), 'TXN-00000074', 'CREDIT', 12000.00, 'Salary Credit',           '2025-05-01 09:00:00+00', 62340.55),
((SELECT id FROM accounts WHERE account_number='ACC100013'), 'TXN-00000075', 'DEBIT',   4000.00, 'UPI Payment',             '2025-06-10 20:20:00+00', 58340.55);

-- ------------------------------------------------------------
-- Synchronise auto-created IDs/numbers after all inserts
-- ------------------------------------------------------------
SELECT setval('seq_customer_code', GREATEST((SELECT COUNT(*) FROM customers), 1), true);
SELECT setval('seq_account_number', GREATEST((SELECT COUNT(*) FROM accounts), 1) + 100000, true);
SELECT setval('seq_transaction_reference', GREATEST((SELECT COUNT(*) FROM transactions), 1), true);