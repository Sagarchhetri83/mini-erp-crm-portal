# Mini ERP + CRM Operations Portal

A production-grade, role-based ERP and CRM web application built for B2B operations. Manages customers, products, inventory stock, and sales challans across four distinct user roles.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Features](#3-features)
4. [Tech Stack](#4-tech-stack)
5. [Architecture](#5-architecture)
6. [Frontend Structure](#6-frontend-structure)
7. [Backend Structure](#7-backend-structure)
8. [Database & Prisma Schema](#8-database--prisma-schema)
9. [Authentication](#9-authentication)
10. [Role-Based Access Control (RBAC)](#10-role-based-access-control-rbac)
11. [Customer CRM](#11-customer-crm)
12. [Product & Inventory](#12-product--inventory)
13. [Stock Movement Log](#13-stock-movement-log)
14. [Sales Challans](#14-sales-challans)
15. [Analytics](#15-analytics)
16. [REST API Summary](#16-rest-api-summary)
17. [Environment Variables](#17-environment-variables)
18. [Local Setup](#18-local-setup)
19. [Database Setup](#19-database-setup)
20. [Backend Startup](#20-backend-startup)
21. [Frontend Startup](#21-frontend-startup)
22. [Postman Collection](#22-postman-collection)
23. [Test Credentials](#23-test-credentials)
24. [Deployment](#24-deployment)
25. [Assumptions](#25-assumptions)
26. [Known Limitations](#26-known-limitations)

---

## 1. Project Overview

The **Mini ERP + CRM Operations Portal** is a full-stack B2B operations tool designed for small-to-medium businesses. It enables Sales teams to manage customer relationships and generate sales challans, Warehouse teams to track and adjust inventory, and Accounts teams to monitor confirmed financial transactions — all under a single, unified system with strict role enforcement.

---

## 2. Problem Statement

Small businesses often manage customers, inventory, and sales through disconnected spreadsheets and manual processes. This leads to:

- No real-time visibility into current stock levels
- Accidental negative stock due to unverified sales
- No audit trail for who moved stock and why
- Shared systems with no role restrictions

This portal solves each of these by providing a role-gated, real-time ERP system backed by a relational database with atomic transactions.

---

## 3. Features

### Authentication & Access
- JWT-based login with 24-hour token expiry
- Four distinct roles: ADMIN, SALES, WAREHOUSE, ACCOUNTS
- Backend middleware enforces role access on every protected route
- Frontend enforces role-specific routing and navigation

### Customer CRM
- Add / Edit / View customers
- Fields: Name, Mobile, Email, Business Name, GST Number, Customer Type, Status, Address, Follow-Up Date, Notes
- Customer Types: RETAIL, WHOLESALE, DISTRIBUTOR
- Customer Statuses: LEAD, ACTIVE, INACTIVE
- Search by name or mobile
- Filter by status and customer type
- Follow-up notes (append-only with timestamps)

### Product & Inventory
- Add / Edit / View products
- Fields: Product Name, SKU, Category, Unit Price, Unit, Stock, Minimum Stock, Location, Description
- SKU uniqueness enforced at DB level
- Search by product name or SKU
- Low Stock filter (stock ≤ minStock)
- Per-product minimum stock threshold alerts

### Stock Movement Log
- Every stock change is recorded atomically
- Types: IN (receiving stock), OUT (sales or manual adjustment)
- Fields: Product, Type, Quantity, Reason, Created By, Timestamp
- Manual adjustments available to ADMIN and WAREHOUSE roles
- Automatic OUT movements logged when a challan is confirmed

### Sales Challans
- Create multi-item draft challans for customers
- Challan number auto-generated (format: `CHL-YYYY-NNNN`)
- Price snapshot taken at challan creation time
- Statuses: DRAFT, CONFIRMED, CANCELLED
- Draft → Confirmed: atomic stock deduction via Prisma transaction
- Draft → Cancelled: no stock change
- Insufficient stock on confirmation returns clear HTTP 400 error
- Stock can never go negative

### Analytics
- Role-scoped analytics with real data from the database
- Metrics computed via Prisma aggregations (not extrapolated from recent records)
- CSS-based proportion bars for challan status distribution
- Stock movement table for Warehouse users

---

## 4. Tech Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Frontend   | React 18, TypeScript, Vite               |
| Styling    | Vanilla CSS (custom design system)       |
| Icons      | Lucide React                             |
| HTTP       | Axios                                    |
| Routing    | React Router v6                          |
| Backend    | Node.js, Express, TypeScript             |
| ORM        | Prisma                                   |
| Database   | PostgreSQL                               |
| Auth       | JWT (jsonwebtoken), bcryptjs             |
| Fonts      | Inter (Google Fonts)                     |

---

## 5. Architecture

```
┌────────────────────────┐
│   Browser (React SPA)  │  Port 5173
│   Vite + React Router  │
└──────────┬─────────────┘
           │ HTTP (Axios)
           ▼
┌────────────────────────┐
│   Express REST API     │  Port 3001
│   TypeScript + Prisma  │
└──────────┬─────────────┘
           │ Prisma ORM
           ▼
┌────────────────────────┐
│     PostgreSQL DB      │
│     (mini_erp schema)  │
└────────────────────────┘
```

- **Frontend** is a single-page application with role-based route trees.
- **Backend** is a stateless REST API. Each request is authenticated by verifying the JWT token and looking up the user in the database.
- **Database** uses PostgreSQL with Prisma as the ORM. All schema changes are managed via `prisma db push`.

---

## 6. Frontend Structure

```
frontend/src/
├── components/
│   ├── Layout.tsx           # Shell with sidebar, header, workspace
│   ├── ProtectedRoute.tsx   # Role-gated wrapper
│   └── Sidebar.tsx          # Role-aware navigation
├── context/
│   └── AuthContext.tsx      # JWT + user state provider
├── lib/
│   └── api.ts               # Axios instance with auth interceptor
├── pages/
│   ├── Login.tsx
│   ├── Unauthorized.tsx
│   ├── analytics/
│   │   └── AnalyticsContainer.tsx
│   ├── challans/
│   │   ├── ChallanList.tsx
│   │   ├── ChallanDetail.tsx
│   │   └── NewChallan.tsx
│   ├── customers/
│   │   ├── CustomerList.tsx
│   │   ├── CustomerForm.tsx
│   │   └── CustomerDetail.tsx
│   ├── dashboard/
│   │   ├── DashboardContainer.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── SalesDashboard.tsx
│   │   ├── WarehouseDashboard.tsx
│   │   ├── AccountsDashboard.tsx
│   │   └── useDashboardStats.ts
│   └── products/
│       ├── ProductList.tsx
│       ├── ProductForm.tsx
│       └── ProductDetail.tsx
├── App.tsx
└── index.css
```

---

## 7. Backend Structure

```
backend/src/
├── middleware/
│   └── auth.ts              # requireAuth + requireRole middleware
├── routes/
│   ├── auth.routes.ts       # POST /auth/login, GET /auth/me
│   ├── customer.routes.ts   # CRUD + follow-up
│   ├── product.routes.ts    # CRUD + adjust-stock + movements
│   ├── challan.routes.ts    # CRUD + confirm + cancel
│   └── dashboard.routes.ts  # Aggregated stats
├── index.ts                 # Express app entry point
└── ...
prisma/
├── schema.prisma            # Database schema
└── seed.ts                  # Seeds 4 default users
```

---

## 8. Database & Prisma Schema

### Models

| Model          | Key Fields                                                                                              |
|----------------|---------------------------------------------------------------------------------------------------------|
| `User`         | id, name, email, password (hashed), role (ADMIN/SALES/WAREHOUSE/ACCOUNTS)                             |
| `Customer`     | id, name, mobile, email, businessName, customerType, status, address, gstNumber, followUpDate, notes  |
| `Product`      | id, name, sku (unique), price, unit, stock, minStock, category, location, description                  |
| `Challan`      | id, challanNo (unique), customerId, status, totalAmount, createdById                                   |
| `ChallanItem`  | id, challanId, productId, productName (snapshot), priceSnapshot, qty, lineTotal                        |
| `StockMovement`| id, productId, type (IN/OUT), qty, reason, createdById                                                 |

### Enums

| Enum              | Values                             |
|-------------------|------------------------------------|
| `Role`            | ADMIN, SALES, WAREHOUSE, ACCOUNTS  |
| `CustomerType`    | RETAIL, WHOLESALE, DISTRIBUTOR     |
| `CustomerStatus`  | LEAD, ACTIVE, INACTIVE             |
| `ChallanStatus`   | DRAFT, CONFIRMED, CANCELLED        |
| `StockMovementType` | IN, OUT                          |

---

## 9. Authentication

- **Login**: `POST /auth/login` with `{ email, password }` returns `{ token, user }`
- JWT is signed with `JWT_SECRET` from `.env` and expires in 24 hours
- Token is stored in `localStorage` on the frontend
- Every API request includes the header: `Authorization: Bearer <token>`
- The `requireAuth` middleware verifies the token and fetches the user record from the database on each request
- Passwords are hashed with **bcrypt** (salt rounds: 10)
- Passwords are never returned in any API response

---

## 10. Role-Based Access Control (RBAC)

### Frontend Routing

| Route prefix | Allowed Role |
|--------------|-------------|
| `/admin/*`   | ADMIN only  |
| `/sales/*`   | SALES only  |
| `/warehouse/*` | WAREHOUSE only |
| `/accounts/*` | ACCOUNTS only |

The `<ProtectedRoute>` component checks the user's role against the allowed roles. Unauthorized access redirects to `/unauthorized`.

### Backend Enforcement

The `requireRole(...roles)` middleware is applied directly to mutating routes:

| Route                          | Required Role(s)              |
|--------------------------------|-------------------------------|
| `POST /customers`              | ADMIN, SALES                  |
| `PUT /customers/:id`           | ADMIN, SALES                  |
| `POST /customers/:id/followup` | ADMIN, SALES                  |
| `POST /products`               | ADMIN, WAREHOUSE              |
| `PUT /products/:id`            | ADMIN, WAREHOUSE              |
| `POST /products/:id/adjust-stock` | ADMIN, WAREHOUSE           |
| `POST /challans`               | ADMIN, SALES                  |
| `POST /challans/:id/confirm`   | ADMIN, SALES, WAREHOUSE       |
| `DELETE /challans/:id`         | ADMIN, SALES                  |

All read endpoints (`GET`) are accessible to any authenticated user.

### Role Capabilities Summary

| Capability                   | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|------------------------------|-------|-------|-----------|----------|
| View Dashboard & Analytics   | ✅    | ✅    | ✅        | ✅       |
| Manage Customers             | ✅    | ✅    | —         | —        |
| View Customers               | ✅    | ✅    | —         | —        |
| Manage Products              | ✅    | —     | ✅        | —        |
| View Products                | ✅    | —     | ✅        | —        |
| Adjust Stock                 | ✅    | —     | ✅        | —        |
| Create Challan               | ✅    | ✅    | —         | —        |
| Confirm Challan              | ✅    | ✅    | ✅        | —        |
| Cancel Challan               | ✅    | ✅    | —         | —        |
| View Challans                | ✅    | ✅    | ✅        | ✅       |
| User Management              | ✅    | —     | —         | —        |

---

## 11. Customer CRM

### Endpoints

| Method | Path                          | Description                           |
|--------|-------------------------------|---------------------------------------|
| GET    | `/customers`                  | List with search, status, type filter |
| POST   | `/customers`                  | Create customer                       |
| GET    | `/customers/:id`              | Get customer detail                   |
| PUT    | `/customers/:id`              | Update customer                       |
| POST   | `/customers/:id/followup`     | Add follow-up note + date             |

### Query Parameters (GET /customers)
- `search`: name or mobile match
- `status`: LEAD | ACTIVE | INACTIVE
- `customerType`: RETAIL | WHOLESALE | DISTRIBUTOR
- `page`, `limit`: pagination

---

## 12. Product & Inventory

### Endpoints

| Method | Path                             | Description                       |
|--------|----------------------------------|-----------------------------------|
| GET    | `/products`                      | List with search, low-stock filter |
| POST   | `/products`                      | Create product                    |
| GET    | `/products/:id`                  | Get product detail                |
| PUT    | `/products/:id`                  | Update product (not stock)        |
| POST   | `/products/:id/adjust-stock`     | Manual stock IN or OUT            |
| GET    | `/products/:id/movements`        | Stock movement history            |

### Query Parameters (GET /products)
- `search`: name or SKU match
- `lowStock=true`: filter products where `stock <= minStock`
- `page`, `limit`: pagination

---

## 13. Stock Movement Log

Every stock change is permanently recorded in the `stock_movements` table. Each record contains:

- `type`: IN or OUT
- `qty`: units changed
- `reason`: free text (e.g. "Sales Challan CHL-2024-0001", "Initial stock", "Damaged goods")
- `createdBy`: user who triggered the change
- `createdAt`: timestamp

Movements are created:
- On manual stock adjustment via `POST /products/:id/adjust-stock`
- On initial stock when a product is created with stock > 0
- Automatically (OUT) when a challan is confirmed

---

## 14. Sales Challans

### Workflow

```
Create (DRAFT)
    │
    ├─→ [Cancel] → CANCELLED (no stock change)
    │
    └─→ [Confirm] → CONFIRMED
                         │
                         └─→ Stock deducted atomically
                         └─→ StockMovement (OUT) created per item
```

### Business Rules

1. A DRAFT challan does **not** affect stock levels.
2. Confirming a challan:
   - Pre-checks stock for all line items **before** any change
   - If any item has insufficient stock → returns `HTTP 400` with specific error message
   - If all items pass → executes a Prisma `$transaction` to atomically deduct stock and create OUT movements
3. Stock can **never** go negative.
4. Only DRAFT challans can be confirmed or cancelled.
5. Challan number format: `CHL-YYYY-NNNN` (auto-incremented per year).
6. Product name and price are **snapshotted** at challan creation time.

---

## 15. Analytics

Analytics are served from `GET /dashboard/stats` using Prisma aggregations over the complete dataset.

| Metric                  | Source                                         |
|-------------------------|------------------------------------------------|
| Total Customers         | `prisma.customer.count()`                      |
| Total Products          | `prisma.product.count()`                       |
| Total Challans          | `prisma.challan.count()`                       |
| Low Stock Count         | In-memory filter: `stock <= minStock`          |
| Out of Stock Count      | In-memory filter: `stock === 0`                |
| Confirmed Sales Value   | `prisma.challan.aggregate({ _sum: totalAmount })` where `CONFIRMED` |
| Average Challan Value   | `confirmedSalesValue / confirmedCount` (0 if none) |
| Status Distribution     | `prisma.challan.groupBy({ by: ['status'] })`   |
| Follow-up Count         | `prisma.customer.count({ where: { followUpDate: { not: null } } })` |
| Recent Stock Movements  | `prisma.stockMovement.findMany({ take: 10 })`  |

---

## 16. REST API Summary

Base URL: `http://localhost:3001/api`

| Method | Path                              | Auth Required | Role Restriction         |
|--------|-----------------------------------|---------------|--------------------------|
| POST   | /auth/login                       | No            | —                        |
| GET    | /auth/me                          | Yes           | Any                      |
| GET    | /dashboard/stats                  | Yes           | Any                      |
| GET    | /customers                        | Yes           | Any                      |
| POST   | /customers                        | Yes           | ADMIN, SALES             |
| GET    | /customers/:id                    | Yes           | Any                      |
| PUT    | /customers/:id                    | Yes           | ADMIN, SALES             |
| POST   | /customers/:id/followup           | Yes           | ADMIN, SALES             |
| GET    | /products                         | Yes           | Any                      |
| POST   | /products                         | Yes           | ADMIN, WAREHOUSE         |
| GET    | /products/:id                     | Yes           | Any                      |
| PUT    | /products/:id                     | Yes           | ADMIN, WAREHOUSE         |
| POST   | /products/:id/adjust-stock        | Yes           | ADMIN, WAREHOUSE         |
| GET    | /products/:id/movements           | Yes           | Any                      |
| GET    | /challans                         | Yes           | Any                      |
| POST   | /challans                         | Yes           | ADMIN, SALES             |
| GET    | /challans/:id                     | Yes           | Any                      |
| POST   | /challans/:id/confirm             | Yes           | ADMIN, SALES, WAREHOUSE  |
| DELETE | /challans/:id                     | Yes           | ADMIN, SALES             |

### Response Format

All errors return:
```json
{ "error": "Human-readable error message." }
```

Status codes used:
- `200 OK` — success
- `201 Created` — resource created
- `400 Bad Request` — validation error or business rule violation
- `401 Unauthorized` — missing or invalid token
- `403 Forbidden` — authenticated but insufficient role
- `404 Not Found` — resource does not exist
- `500 Internal Server Error` — unhandled server error

---

## 17. Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your-strong-secret-key-here
PORT=3001
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

Refer to `backend/.env.example` and `frontend/.env.example` for templates.

---

## 18. Local Setup

### Prerequisites

- Node.js v18+
- PostgreSQL v14+
- npm v9+

### Clone the Repository

```bash
git clone https://github.com/Sagarchhetri83/mini-erp-crm-portal.git
cd mini-erp-crm-portal
```

---

## 19. Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE mini_erp;
```

2. Set up your `.env` in the `backend/` directory:

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials
```

3. Push the Prisma schema to the database:

```bash
cd backend
npx prisma db push
```

4. Seed the default users:

```bash
npx prisma db seed
```

---

## 20. Backend Startup

```bash
cd backend
npm install
npm run dev
```

The API server will start at `http://localhost:3001`.

---

## 21. Frontend Startup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173`.

Open your browser to `http://localhost:5173` and log in with any of the test credentials below.

---

## 22. Postman Collection

A Postman collection is included at the root of the project:

```
mini_erp_postman_collection.json
```

Import this file into Postman. The collection includes pre-configured requests for all endpoints with environment variable support for `{{base_url}}` and `{{token}}`.

**How to use:**
1. Import the collection in Postman
2. Create a Postman environment with `base_url = http://localhost:3001/api`
3. Run the Login request — copy the `token` from the response
4. Set `token` in your environment
5. All other requests will automatically include the Bearer token

---

## 23. Test Credentials

All test users have the same password: `Password123`

| Role      | Email                  | Password      |
|-----------|------------------------|---------------|
| ADMIN     | admin@erp.com          | Password123   |
| SALES     | sales@erp.com          | Password123   |
| WAREHOUSE | warehouse@erp.com      | Password123   |
| ACCOUNTS  | accounts@erp.com       | Password123   |

---

## 24. Deployment

### Recommended Stack

| Component   | Service                             |
|-------------|-------------------------------------|
| Frontend    | Vercel or Netlify                   |
| Backend     | Render or Railway                   |
| Database    | Neon (serverless PostgreSQL) or Render PostgreSQL |

### Step-by-Step

#### 1. Deploy Database (Neon / Render)

- Create a PostgreSQL database on your chosen platform
- Copy the connection string (format: `postgresql://user:pass@host:5432/dbname`)

#### 2. Deploy Backend (Render / Railway)

1. Create a new Web Service
2. Set root directory to `backend/`
3. Build command: `npm install && npm run build`
4. Start command: `node dist/index.js`
5. Set environment variables:
   ```
   DATABASE_URL=<your cloud database URL>
   JWT_SECRET=<strong random secret>
   PORT=3001
   ```
6. After deployment, run the Prisma schema push and seed via a one-time job or Render shell:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

#### 3. Deploy Frontend (Vercel / Netlify)

1. Set root directory to `frontend/`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com/api
   ```

> **Note:** AWS EC2/RDS and Docker are optional enhancements. The application is fully deployable without them.

---

## 25. Assumptions

1. Challan cancellation is only supported for DRAFT status. There is no reversal for CONFIRMED challans.
2. Product price at challan creation is snapshotted and does not change if the product price is later updated.
3. All monetary values are in Indian Rupees (₹).
4. Challan numbers are sequential per year and are not recycled.
5. A customer's mobile number is not enforced to be unique.
6. Customer follow-up notes are append-only (each new note is timestamped and appended, not replaced).
7. The application assumes a single-region, single-timezone deployment. Dates are stored in UTC.

---

## 26. Known Limitations

1. **No file uploads**: Product images or documents are not supported in this version.
2. **No email notifications**: Follow-up date reminders are visual only — no email/SMS integration.
3. **No pagination on movements**: Stock movement history for a product loads all records without pagination.
4. **No invoice PDF generation**: The print button triggers the browser's native print dialog.
5. **No multi-currency support**: All amounts are fixed to Indian Rupees.
6. **No advanced user management UI**: Admin can see a placeholder for User Management. Creating/editing users requires direct database access or the Prisma seed script.
7. **Docker support**: Not included in the base submission. Can be added as a bonus item.
