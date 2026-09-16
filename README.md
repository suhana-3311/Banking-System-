# Online Banking System

A complete full-stack academic project for **Case Study 3 – Online Banking Management System**, built with two completely separate backend implementations that share one Neon PostgreSQL database:

- **Implementation A** – Native Node.js `http` module (manual routing, no Express, no Handlebars)
- **Implementation B** – Express.js + Handlebars (server-rendered templates)

Both applications expose the same features (dashboard, customers, customer details, accounts, transactions) and are independently deployable to **Render** as two separate Web Services backed by **Neon PostgreSQL**.

---

## Project Overview

The Online Banking Management System lets an administrator:

- View a banking dashboard with summary statistics
- List all customers
- View an individual customer's details and accounts
- View account details, balances and statuses
- View recent transaction history per account

The project intentionally implements the **same product twice** using different server technologies so that the assignment can demonstrate the Node.js HTTP module, manual routing, Express routing, Handlebars server-side rendering, and PostgreSQL integration all in one repository.

---

## Assignment Objective

- Build a simplified Online Banking Management System.
- Demonstrate **node:http** manual request handling and routing.
- Demonstrate **Express.js** routing and **Handlebars** view rendering.
- Use **PostgreSQL (Neon)** for persistence.
- Keep the two implementations **completely separate** — never merged.
- Produce a professional, responsive, explainable UI.
- Support deployment to Render.

---

## Case Study

**Case Study 3 – Online Banking System**

A banking organisation needs a web application to manage its customer base. Requirements:

1. Store customers (code, name, email, phone, address, city).
2. Store accounts (number, type: Savings / Current / Salary, balance, status, opened date).
3. Store transactions (reference, type CREDIT / DEBIT, amount, description, date, running balance).
4. Provide a dashboard, customer directory, customer detail, account detail and transaction history views.
5. Provide a JSON API to create customers, open accounts, and record transactions safely.

---

## Features

| Area | Details |
| --- | --- |
| Dashboard | Total customers, total accounts, total balance, total transactions, recent transactions, account-type overview, quick actions |
| Customers | Directory with code, name, email, phone, city; create customer (JSON `POST`) |
| Customer details | Customer information, all linked accounts, and **open a new account** (JSON `POST /accounts`) |
| Account details | Account number, customer, type, balance, status, opened date, recent transactions, and **record a new transaction** inline (JSON `POST /transactions`) |
| Transactions | Full per-account history with reference, date, type, description, amount, running balance |
| Health check | `GET /health` reports application and database connectivity |
| Error handling | 400, 404, 405, 413, 500 with safe, professional pages (no secrets, no stack traces) |
| Validation | Required fields, email format, phone format, valid account type, non-negative opening balance, positive amount, DEBIT ≤ available balance |
| Concurrency safety | Account creation and transaction recording each run inside `BEGIN … COMMIT / ROLLBACK` with `FOR UPDATE` locking |
| Database | Neon PostgreSQL, connection pool, parameterised queries, dedicated sequences for customer-code, account-number and transaction-reference |
| Responsive UI | Desktop, laptop, tablet, mobile |

---

## Technology Stack

| Layer | Implementation A | Implementation B |
| --- | --- | --- |
| Runtime | Node.js | Node.js |
| HTTP | Native `node:http` | Express.js |
| Templating | Handlebars **prohibited** — HTML generated manually in code | Handlebars (`express-handlebars`) |
| Database driver | `pg` | `pg` |
| Config | `dotenv` | `dotenv` |
| Database | PostgreSQL / Neon PostgreSQL | PostgreSQL / Neon PostgreSQL |
| Frontend | HTML5, CSS3, Vanilla JS | HTML5, CSS3, Vanilla JS |

**Not used:** React, Vue, Angular, Next.js, NestJS, MongoDB, SQLite, MySQL, EJS, Pug, Bootstrap, Tailwind.

---

## Architecture

### Implementation A (Native HTTP)

```
HTTP request
     ↓
Manual router (routes/router.js)
     ↓
Controller
     ↓
Service
     ↓
PostgreSQL (config/database.js pool)
     ↓
HTTP response (HTML or JSON)
```

### Implementation B (Express + Handlebars)

```
Browser
   ↓
Express route (routes/index.js)
   ↓
Controller
   ↓
Service
   ↓
PostgreSQL (config/database.js pool)
   ↓
Controller
   ↓
Handlebars view (views/*.hbs, layout + partials + helpers)
   ↓
HTML
```

### Deployment architecture

```
                 Neon PostgreSQL
                       │
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
Render Web Service A        Render Web Service B
online-banking-http         online-banking-express
Node.js HTTP                Express + Handlebars
```

Both services connect to the **same** Neon database.

---

## Project Structure

```
online-banking-system/
│
├── README.md
├── .gitignore
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── implementation-a-http/
│   ├── package.json
│   ├── .env.example
│   ├── server.js
│   ├── config/            → database.js (pg Pool)
│   ├── routes/            → router.js (manual routing, route params, static files)
│   ├── controllers/       → dashboard / customer / account / transaction / health
│   ├── services/          → data-access layer (parameterized SQL)
│   ├── utils/             → httpHelpers (sendJSON/sendHTML/sendError), validation, formatters, htmlLayout
│   └── public/
│       ├── css/           → style.css
│       ├── js/            → main.js
│       └── images/
│
└── implementation-b-express/
    ├── package.json
    ├── .env.example
    ├── server.js
    ├── config/            → database.js (pg Pool)
    ├── routes/            → index.js (Express Router)
    ├── controllers/       → dashboard / customer / account / transaction / main
    ├── services/          → data-access layer (parameterized SQL)
    ├── helpers/           → hbsHelpers.js (formatCurrency, eq, formatDate, ...)
    ├── views/
    │   ├── layouts/       → main.hbs
    │   ├── partials/      → navbar.hbs, footer.hbs
    │   ├── home.hbs
    │   ├── customers.hbs
    │   ├── customer.hbs
    │   ├── account.hbs
    │   ├── transactions.hbs
    │   ├── 404.hbs
    │   └── error.hbs
    └── public/
        ├── css/           → style.css
        ├── js/            → main.js
        └── images/
```

---

## Database Architecture

- **Neon PostgreSQL** (serverless Postgres) is the single source of truth.
- Each application owns its **own connection-pool configuration**:
  - `implementation-a-http/config/database.js`
  - `implementation-b-express/config/database.js`
- A single `pg.Pool` is created once at startup and reused for every request — a new connection is **not** created per request.
- Every query that involves user input uses **parameterized statements** (`$1`, `$2`, …).

```js
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

---

## Database Schema

Three tables with sensible constraints and indexes (see `database/schema.sql`).

### customers

| Column | Type | Constraints |
| --- | --- | --- |
| id | SERIAL | PRIMARY KEY |
| customer_code | VARCHAR(20) | NOT NULL, UNIQUE, indexed |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE, format CHECK, indexed |
| phone | VARCHAR(20) | NOT NULL, format CHECK |
| address | VARCHAR(255) | nullable |
| city | VARCHAR(100) | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### accounts

| Column | Type | Constraints |
| --- | --- | --- |
| id | SERIAL | PRIMARY KEY |
| account_number | VARCHAR(20) | NOT NULL, UNIQUE, indexed |
| customer_id | INT | NOT NULL, FOREIGN KEY → customers.id, indexed |
| account_type | VARCHAR(20) | CHECK IN (`Savings`, `Current`, `Salary`) |
| balance | NUMERIC(15,2) | DEFAULT 0, CHECK ≥ 0 |
| status | VARCHAR(20) | CHECK IN (`Active`, `Inactive`, `Closed`) |
| opened_at | TIMESTAMPTZ | DEFAULT NOW() |

### transactions

| Column | Type | Constraints |
| --- | --- | --- |
| id | SERIAL | PRIMARY KEY |
| account_id | INT | NOT NULL, FOREIGN KEY → accounts.id, indexed |
| transaction_reference | VARCHAR(30) | NOT NULL, UNIQUE |
| transaction_type | VARCHAR(10) | CHECK IN (`CREDIT`, `DEBIT`) |
| amount | NUMERIC(15,2) | CHECK > 0 |
| description | VARCHAR(255) | nullable |
| transaction_date | TIMESTAMPTZ | DEFAULT NOW(), indexed |
| balance_after_transaction | NUMERIC(15,2) | CHECK ≥ 0 |

---

## Entity Relationships

```
customers (1) ──── (N) accounts (1) ──── (N) transactions
      │                    │
   customers.id      accounts.id
        │                    │
        └──── accounts.customer_id
                   (ON DELETE RESTRICT)

accounts.id → transactions.account_id (ON DELETE RESTRICT)
```

- A customer can own many accounts.
- An account belongs to exactly one customer.
- An account can have many transactions.
- A transaction belongs to exactly one account.
- Deleting a customer with accounts, or an account with transactions, is blocked by `ON DELETE RESTRICT`.

---

## Implementation A – Node.js HTTP

`implementation-a-http/` is a fully independent Node.js application.

- It uses only the **native `http` module**, plus `fs`, `path`, `pg` and `dotenv`.
- It does **not** import or rely on Express, Handlebars, or any routing library.
- The server entry point `server.js` creates an `http.createServer` and hands every request to the manual router.
- Responses are written manually with reusable helpers: `sendJSON()`, `sendHTML()` and `sendError()` (see `utils/httpHelpers.js`).
- HTML pages are assembled in controllers using a shared page layout builder (`utils/htmlLayout.js`) and escaped with `escapeHtml()`.

### Manual Routing

`routes/router.js` is a hand-written router. For every request it resolves:

1. the HTTP **method** (`req.method`),
2. the **pathname** (`new URL(req.url, …)`),
3. **route parameters** by splitting the path into segments and comparing them against declared patterns.

```js
function matchPath(pathname, pattern) {
  const pathSegments = pathname.split("/").filter(Boolean);
  const patternSegments = pattern.split("/").filter(Boolean);
  if (pathSegments.length !== patternSegments.length) return null;

  const params = {};
  for (let i = 0; i < patternSegments.length; i += 1) {
    if (patternSegments[i].startsWith(":")) {
      params[patternSegments[i].slice(1)] = decodeURIComponent(pathSegments[i]);
    } else if (patternSegments[i] !== pathSegments[i]) {
      return null;
    }
  }
  return params;
}
```

For `/customer/10` the router extracts `id = 10`; for `/account/ACC100001` it extracts `accountNo = ACC100001`.

**Routes (Implementation A)**

| Method | Route | Behaviour |
| --- | --- | --- |
| GET | `/` | Dashboard — summary stats, account overview, recent transactions, quick navigation |
| GET | `/health` | JSON health check |
| GET | `/customers` | Customer directory |
| POST | `/customers` | Create a customer (JSON body, validated) |
| GET | `/customer/:id` | Customer details + accounts (404 if not found) |
| POST | `/accounts` | Open a new account for a customer (JSON body, validated) |
| GET | `/account/:accountNo` | Account details + recent transactions (404 if not found) |
| GET | `/transactions/:accountNo` | Full transaction history (404 if not found) |
| POST | `/transactions` | Record a CREDIT/DEBIT safely |
| static | `/css/*`, `/js/*`, `/images/*` | Files served from `public/` with correct MIME types and path-traversal protection |

### HTTP Methods

The router branches on `req.method.toUpperCase()`. Supported methods are `GET` and `POST`. JSON API endpoints expose the relevant methods, and any other method receives **405 Method Not Allowed** with the list of allowed methods:

```json
{ "error": "Method Not Allowed", "allowed": ["GET", "POST"] }
```

### HTTP Status Codes

| Code | Meaning | Used for |
| --- | --- | --- |
| 200 OK | Successful GET request | Dashboard, customers, accounts, transactions, static files |
| 201 Created | Resource created | Successful `POST /customers`, `POST /accounts`, `POST /transactions` |
| 400 Bad Request | Invalid input | Validation failures, invalid/missing JSON body |
| 404 Not Found | Missing resource / route | Unknown path, unknown customer, unknown account |
| 405 Method Not Allowed | Wrong method | e.g. `PUT /customers` |
| 413 | Payload too large | Body exceeding 1 MB |
| 500 Internal Server Error | Server/database failure | Safe generic page |

---

## Implementation B – Express.js

`implementation-b-express/` is a fully independent Express application.

- Express generates the responses; `express-handlebars` renders the views.
- Routes are declared with literal `app.get()` / `app.post()` in `routes/index.js` (`registerRoutes(app)`).
- Route parameters come from `req.params`.
- Views are rendered with `res.render()`.
- Static assets are served with `express.static()`.
- `express.json()` parses JSON bodies; `express.urlencoded()` supports form bodies.

### Express Routing

`routes/index.js` declares:

| Method | Route | Behaviour |
| --- | --- | --- |
| GET | `/` | Dashboard |
| GET | `/health` | JSON health check |
| GET | `/customers` | Customer directory |
| POST | `/customers` | Create a customer |
| GET | `/customer/:id` | Customer details (`req.params.id`) |
| POST | `/accounts` | Open a new account for a customer |
| GET | `/account/:accountNo` | Account details (`req.params.accountNo`) |
| GET | `/transactions/:accountNo` | Transaction history |
| POST | `/transactions` | Record a CREDIT/DEBIT |

```js
router.get("/customer/:id", customerController.customerDetail);

// inside the controller:
const id = req.params.id;
```

404 and error responses are handled by final Express middlewares:

- `notFound` → renders `views/404.hbs`
- `internalError` → renders `views/error.hbs`, maps body-parser errors to `400 Bad Request`, and never leaks secrets or stack traces.

### Handlebars

Configured in `server.js`:

```js
app.engine("hbs", engine({
  extname: ".hbs",
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views", "layouts"),
  partialsDir: path.join(__dirname, "views", "partials"),
  helpers: hbsHelpers
}));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
```

Every page renders through the shared layout `views/layouts/main.hbs`, which outputs the site header, navigation partial, the page body (`{{{body}}}`) and footer partial.

### {{#each}}

`{{#each}}` drives every list view, always fed from PostgreSQL:

- `customers.hbs` — `{{#each customers}}` lists customers from the database.
- `customer.hbs` — `{{#each customer.accounts}}` lists a customer's accounts.
- `home.hbs` — `{{#each stats.recentTransactions}}` and `{{#each stats.accountTypeCounts}}`.
- `account.hbs` / `transactions.hbs` — `{{#each transactions}}`.

```hbs
{{#if customers.length}}
  {{#each customers}}
    <tr>
      <td><span class="code-pill">{{this.customer_code}}</span></td>
      <td>{{this.first_name}} {{this.last_name}}</td>
      ...
    </tr>
  {{/each}}
{{else}}
  <tr><td colspan="6" class="empty-cell">No customers found.</td></tr>
{{/if}}
```

### Conditional Rendering

`{{#if}}` and `{{else}}` handle every empty/state case:

- empty customers → "No customers found."
- customer with no accounts → "No accounts found for this customer."
- account with no transactions → "No transactions found for this account."
- `Active` / `Inactive` / `Closed` badges
- `CREDIT` shown as `+ ₹amount` (green), `DEBIT` shown as `− ₹amount` (red)
- dashboard quick links always available

### Custom Helpers

Registered in `helpers/hbsHelpers.js`:

- **`formatCurrency`** → `{{formatCurrency balance}}` renders `₹75,000.00` (Indian grouping).
- **`eq`** → `{{#if (eq transaction_type "CREDIT")}}` compares values.
- `formatDate` / `formatDateTime` → human-readable dates.
- `isActive` → boolean status check.

```hbs
<td class="amount {{#if (eq this.transaction_type "CREDIT")}}credit{{else}}debit{{/if}}">
  {{#if (eq this.transaction_type "CREDIT")}}+{{else}}&minus;{{/if}}{{formatCurrency this.amount}}
</td>
```

### Static Files

```js
app.use(express.static(path.join(__dirname, "public")));
```

`public/css/style.css`, `public/js/main.js` and `public/images/` are served automatically.

---

## UI/UX

A restrained, professional banking-administration interface:

- clean typography, subtle borders, modest shadows, consistent spacing
- strong visual hierarchy and readable tables
- professional status badges (Active / Inactive / Closed), type badges (CREDIT / DEBIT)
- full page layouts generated server-side
- **no gradients, glassmorphism, giant rounded cards, animations, meaningless charts or random colors**

Responsive behaviour:

- CSS grid layouts (`stats-grid`, `quick-grid`, `detail-grid`, `form-grid`) that reflow
- horizontal scrolling contained to tables (`overflow-x: auto` inside `.table-wrap`)
- collapsible navigation via a hamburger button on smaller screens, toggled by `public/js/main.js`
- media queries at `860px` and `640px` for tablet and mobile

The customers page also demonstrates vanilla-JS `fetch()` posting JSON to `POST /customers`.

---

## Environment Variables

Create a `.env` file in each implementation directory (copy from `.env.example`). Never commit `.env`.

| Variable | Implementation A | Implementation B |
| --- | --- | --- |
| `DATABASE_URL` | Neon/PostgreSQL connection string | Neon/PostgreSQL connection string |
| `PORT` | `3000` | `3001` |
| `NODE_ENV` | `development` | `development` |

`.env.example` (both implementations):

```
DATABASE_URL="postgresql://neondb_owner:YOUR_NEW_PASSWORD@ep-dark-hill-a5nrl6g4-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
PORT=3000
NODE_ENV=development
```

The connection string is stored **only** in the environment. No `.js` file contains the credentials. The real Neon password lives only in your local `.env` file(s) and in Render's service settings.

---

## Local Setup

Prerequisites:

- Node.js 18+
- A Neon PostgreSQL project (or any reachable PostgreSQL)
- `git`

Clone the repository:

```bash
git clone <your-repository-url>
cd online-banking-system
```

---

## PostgreSQL Setup

You can use **Neon PostgreSQL** (recommended) or any PostgreSQL 13+ server. A local PostgreSQL installation is **not required** — Neon is a hosted, serverless Postgres.

Create the database schema and seed data in this order:

1. Create the tables — `database/schema.sql`
2. Populate sample data — `database/seed.sql`

> `seed.sql` starts by `TRUNCATE`-ing the three tables, so it is safe to re-run.

---

## Neon Setup

1. Go to https://neon.tech and create (or open) a project.
2. In the project dashboard choose **Connection Details** → **Pooled connection** (or Standard connection).
3. Copy the connection string, e.g.
   `postgresql://neondb_owner:YOUR_NEW_PASSWORD@ep-dark-hill-a5nrl6g4-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. Create two local `.env` files (one per implementation) and set `DATABASE_URL`.
5. Keep the password secret — never push it to GitHub.

---

## Database Schema Setup

**Option 1 – Neon SQL Editor**

1. Open your Neon project.
2. Open the **SQL Editor** tab.
3. Copy the contents of `database/schema.sql` and run it.
4. Copy the contents of `database/seed.sql` and run it.

**Option 2 – psql (Neon provides connection details)**

```bash
psql "postgresql://neondb_owner:YOUR_PASSWORD@ep-dark-hill-a5nrl6g4-pooler.us-east-2.aws.neon.tech/neondb" \
  -f database/schema.sql
psql "postgresql://neondb_owner:YOUR_PASSWORD@ep-dark-hill-a5nrl6g4-pooler.us-east-2.aws.neon.tech/neondb" \
  -f database/seed.sql
```

**Option 3 – pgAdmin / local PostgreSQL**

```bash
psql -h localhost -U postgres -d onlinebanking -f database/schema.sql
psql -h localhost -U postgres -d onlinebanking -f database/seed.sql
```

---

## Seed Data

`database/seed.sql` provides realistic, **logically consistent** demonstration data:

- **10 customers** across Mumbai, Bengaluru, Kolkata, Pune, Lucknow, Chennai, New Delhi and Hyderabad.
- **13 accounts** — Savings, Current and Salary — with `Active`, `Inactive` and `Closed` statuses.
- **75 transactions** (CREDIT and DEBIT) with a running `balance_after_transaction` that is consistent for every account (opening deposit → salary/interest credits → withdrawals/payments).

Every transaction's `balance_after_transaction` matches the account's current `balance` where expected. No hardcoded demonstration data exists in the frontend — all of it comes from PostgreSQL.

---

## Running Implementation A

```bash
cd implementation-a-http
cp .env.example .env   # then set DATABASE_URL
npm install
npm run dev            # or: npm start
```

Open http://localhost:3000

---

## Running Implementation B

```bash
cd implementation-b-express
cp .env.example .env   # then set DATABASE_URL
npm install
npm run dev            # or: npm start
```

Open http://localhost:3001

Because the implementations use **different ports** (3000 and 3001), both can run at the same time against the same database.

---

## Testing

### Implementation A — http://localhost:3000

| Test | URL / command | Expected |
| --- | --- | --- |
| Dashboard | `GET /` | 200 page with stats |
| Health | `GET /health` | `{"status":"ok",...,"database":"up"}` |
| Customers | `GET /customers` | 200 directory |
| Valid customer | `GET /customer/1` | 200 customer details |
| Invalid customer | `GET /customer/999` | 404 page |
| Valid account | `GET /account/ACC100001` | 200 account details + history |
| Invalid account | `GET /account/ACC999999` | 404 page |
| History | `GET /transactions/ACC100001` | 200 history |
| Invalid route | `GET /xyz` | 404 page |
| Invalid method | `PUT /customers` | 405 JSON |
| Create customer (valid) | `POST /customers` JSON | 201 Created |
| Create customer (invalid) | `POST /customers` bad JSON | 400 JSON |
| Open account (valid) | `POST /accounts` JSON | 201 Created |
| Open account (unknown customer) | `POST /accounts` JSON | 404 JSON |
| Create transaction | `POST /transactions` JSON | 201 Created |
| Insufficient DEBIT | `POST /transactions` over balance | 400 JSON |

curl examples:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/customer/1
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Rahul","last_name":"Sharma","email":"rahul_2@example.com","phone":"9876543210","city":"Mumbai"}'

curl -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -d '{"customer_id":1,"account_type":"Savings","initial_balance":10000}'

curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{"account_number":"ACC100001","transaction_type":"CREDIT","amount":500,"description":"Cash Deposit"}'
```

### Implementation B — http://localhost:3001

Identical route set using Express:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/customers
curl http://localhost:3001/customer/1
curl http://localhost:3001/customer/999     # 404
curl http://localhost:3001/account/ACC100001
curl http://localhost:3001/account/ACC999999  # 404
curl http://localhost:3001/transactions/ACC100001
curl http://localhost:3001/does-not-exist   # 404 page
```

---

## Render Deployment

Both implementations are deployed as **two independent Render Web Services** — they are never deployed as one application, and neither requires `npm install` at the repository root.

Prerequisites:

1. Push the project to GitHub (with `database/` included, but **without** any `.env`).
2. The Neon database must already be created and seeded (see Neon Setup above).

---

## Render Implementation A

1. Log in to [Render](https://render.com) → **New** → **Web Service**.
2. **Connect a repository** and select the project.
3. Set:
   - **Name:** `online-banking-http`
   - **Root Directory:** `implementation-a-http`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Environment** → add:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = your Neon connection string
5. Click **Create Web Service** → **Deploy**.
6. Open the generated Render URL.

Render supplies `PORT` automatically; `server.js` listens on `process.env.PORT`.

---

## Render Implementation B

Repeat the same flow with:

- **Name:** `online-banking-express`
- **Root Directory:** `implementation-b-express`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment:** `NODE_ENV=production`, `DATABASE_URL=<Neon connection string>`

Deploy, then open the generated URL. Both live services talk to the same Neon database.

---

## Production Environment Variables

| Service | Variable | Value |
| --- | --- | --- |
| both | `DATABASE_URL` | Neon pooled connection string (with real password, set only on Render) |
| both | `NODE_ENV` | `production` |
| both | `PORT` | Provided automatically by Render |

---

## Health Checks

Both applications expose `GET /health`:

```json
{
  "status": "ok",
  "service": "online-banking",
  "implementation": "http",        // or "express"
  "database": "up",                // "up" or "down"
  "timestamp": "2026-09-16T06:00:00.000Z"
}
```

The database check runs `SELECT 1` and reports connectivity **without** exposing the connection string, host, user or password. Use it to verify a Render deployment: a `200` with `"database":"up"` confirms the service boots, routes work and the database is reachable.

---

## Error Handling

- **404 – Page Not Found** → professional, safe page (Implementation A builds it manually; Implementation B renders `views/404.hbs`).
- **500 – Internal Server Error** → generic message; no stack traces, no database credentials, no connection strings.
- **400 Bad Request** → detailed JSON validation messages for API calls.
- **405 Method Not Allowed** → JSON listing allowed methods.
- **Database connection errors** → logged server-side (`console.error`) but never sent to the browser.
- **Server-level guards** → Implementation A wraps `router.handle()` in a top-level catch; every route failure produces a safe 500. Implementation B routes all failures to the central error middleware.
- The full `DATABASE_URL` is never printed to logs.

---

## Security

- Environment variables via `dotenv`; `.env` is ignored by Git (see `.gitignore`).
- No database credentials in any source file.
- **Parameterized SQL everywhere** — user input is never concatenated into SQL:

```js
// safe
await pool.query(
  "SELECT * FROM customers WHERE id = $1",
  [id]
);
```

- Request-body size limits.
- Input validation before persistence.
- HTML escaping for all dynamic values rendered into pages (Implementation A uses `escapeHtml()`; Handlebars escapes `{{value}}` output by default).
- Static-file path traversal protection in Implementation A.
- Safe, generic error responses; sensitive values never appear in logs or responses.

---

## HTTP vs Express Comparison

| Feature | Node.js HTTP | Express.js |
| --- | --- | --- |
| Routing | Manual | Declarative |
| Route parameters | Manual parsing (`matchPath`) | `req.params` |
| Middleware | Manual implementation | Built-in ecosystem |
| Request handling | More boilerplate | Simplified |
| Response handling | Manual (`end`, headers) | Express helpers |
| Template rendering | Not used (HTML built in code) | Handlebars |
| Maintainability | Requires more custom structure | Routing/middleware simplify organization |
| Scalability | Possible with proper architecture | Possible with proper architecture |

Express does **not** automatically make an application faster. Scalability depends on application architecture, database design, indexing, connection-pooling, deployment architecture (e.g. horizontal scaling on Render) and caching — the web framework is only one factor. In this project both implementations use the same pooled `pg` connection model, the same parameterized queries and the same indexes, so any performance difference would be attributable to the framework-layer overhead only.

---

## Assignment Requirement Checklist

- [x] Case Study 3 – Online Banking
- [x] Node.js HTTP module
- [x] Manual routing
- [x] Manual route parameters
- [x] HTTP methods
- [x] HTTP status codes
- [x] Request/response handling
- [x] Static routes
- [x] Dynamic routes
- [x] Express.js
- [x] Express route parameters
- [x] Handlebars
- [x] Dynamic data rendering
- [x] `{{#each}}`
- [x] `{{#if}}`
- [x] Custom Handlebars helper
- [x] PostgreSQL
- [x] Neon PostgreSQL
- [x] Professional UI
- [x] Responsive design
- [x] Validation
- [x] Error handling
- [x] Health endpoint
- [x] Separate implementations
- [x] Render deployment support
- [x] Production environment variables
- [x] Comprehensive README

---

## Future Improvements

- Authentication and authorization (admin login, sessions).
- Beneficiary management and fund transfers between internal accounts.
- Account statement export (PDF/CSV).
- Pagination for large customer and transaction tables.
- Deposit/withdrawal forms backed by the existing safe transaction route.
- Audit logging and activity tracking.
- Rate limiting and request id correlation logging.
- Automated integration tests (Jest/Supertest) against a test database.

---

## Conclusion

This project delivers the Online Banking Management System twice, on purpose. **Implementation A** shows how an HTTP server, manual router, controllers, services and a PostgreSQL pool can be assembled from the Node.js standard library — making routing, method handling, status codes, route parameters and response helpers fully transparent. **Implementation B** shows how Express and Handlebars reduce boilerplate: declarative routes, `req.params`, `res.render()`, `{{#each}}`, `{{#if}}` and custom helpers. Both share identical services, database schema, seed data and professional responsive interface, and both are ready to deploy independently to Render against the same Neon PostgreSQL database.

For a viva, the key points to explain are:

1. Why two implementations exist — to demonstrate both professional-level Node.js HTTP skills and Express/Handlebars proficiency.
2. How manual routing works (`method + pathname + route parameters`).
3. How Handlebars renders dynamic, database-driven views.
4. Why connection pooling and parameterized queries matter.
5. How the safe transaction flow (`BEGIN` / `SELECT … FOR UPDATE` / `COMMIT` / `ROLLBACK`) prevents inconsistent balances.
6. How both apps are deployed to Render with `process.env.PORT` and `DATABASE_URL` supplied as environment variables.