# Mini ERP + CRM Operations Portal

A modern, full-stack Business-to-Business (B2B) Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM) application. Designed for small-to-medium Indian distributors, wholesalers, and electronics retailers, this portal centralizes inventory management, sales challans, and customer follow-ups into a unified, premium SaaS dashboard.

---

## 1. Project Overview

The **Mini ERP + CRM** is built to solve operational bottlenecks for trading businesses by providing real-time inventory tracking, role-based access control, and dynamic CRM capabilities. The platform strictly enforces business rules (e.g., atomic stock deductions upon challan confirmation) and visualizes data through a comprehensive analytics dashboard.

## 2. Core Features

- **Role-Based Access Control (RBAC):** Distinct workspaces and permissions for `ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS`.
- **Customer CRM:** Manage Retail, Wholesale, and Distributor clients with lead tracking and follow-up scheduling.
- **Inventory & Stock Management:** Track IN/OUT stock movements, low-stock alerts, and minimum stock enforcement.
- **Sales Challans (Invoicing):** Create Draft challans and Confirm them to automatically and atomically deduct inventory.
- **Business Analytics:** Real-time metrics, dynamic CSS distribution bars, and recent activity feeds.
- **Global Search & Notifications:** Instantly search across customers, products, and challans. Receive real-time alerts for low stock.
- **Printable Documents:** Generate professional, A4-formatted printable challans natively from the browser.

## 3. Tech Stack

- **Frontend:** React 18, Vite, TypeScript, React Router, Tailwind-inspired custom Vanilla CSS, Axios
- **Backend:** Node.js, Express.js, TypeScript, JSON Web Tokens (JWT), bcrypt
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Hosting / Deployment:** Vercel (Frontend), Railway (Backend API & Managed PostgreSQL)

## 4. Architecture

```text
GitHub Repository
       ↓
Railway Managed PostgreSQL Database (Production Data)
       ↓
Railway Node.js API (Express, Prisma, JWT Auth, CORS configured)
       ↓
Vercel Frontend (React SPA, Vite, React Router Rewrites)
```

## 5. Folder Structure

```text
/
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── components/        # Reusable UI components (Sidebar, Header, etc.)
│   │   ├── context/           # AuthContext (JWT state management)
│   │   ├── lib/               # api.ts (Axios configuration)
│   │   ├── pages/             # Route-based views (Dashboard, Customers, etc.)
│   │   └── App.tsx            # React Router setup
│   └── vercel.json            # Vercel SPA routing configuration
│
└── backend/                   # Node.js + Express + Prisma API
    ├── prisma/
    │   ├── schema.prisma      # PostgreSQL Database Schema
    │   ├── seed.ts            # Idempotent Indian demo data seeder
    │   └── migrations/        # Production migration history
    └── src/
        ├── middleware/        # JWT & RBAC validation
        ├── routes/            # Express route controllers
        └── index.ts           # Server entry point
```

## 6. Prisma / PostgreSQL Schema

- **Users:** `id`, `name`, `email`, `password`, `role`
- **Customers:** `id`, `name`, `mobile`, `customerType`, `status`, `address`, `gstNumber`
- **Products:** `id`, `name`, `sku`, `price`, `stock`, `minStock`, `category`
- **Challans & Items:** `challanNo`, `status`, `totalAmount`, linked to `Customer` and `Product`
- **Stock Movements:** Log of every `IN` and `OUT` transaction.

## 7. Authentication & Security

- Stateless authentication using securely signed **JSON Web Tokens (JWT)**.
- Passwords hashed using **bcrypt** (10 salt rounds).
- Global API intercepts automatically log users out if a `401 Unauthorized` is detected.
- `FRONTEND_URL` CORS protection ensures the backend only accepts requests from trusted domains.

## 8. Role-Based Access Control (RBAC) Matrix

| Feature | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| **Analytics Dashboard** | ✅ | ❌ | ❌ | ❌ |
| **Manage Customers** | ✅ | ✅ | ❌ | ❌ |
| **Manage Inventory** | ✅ | ❌ | ✅ | ❌ |
| **Create Challans** | ✅ | ✅ | ❌ | ❌ |
| **View Financials** | ✅ | ❌ | ❌ | ✅ |

## 9. Business Rules & Logic

1. **Atomic Stock Deductions:** A challan in `DRAFT` status does not affect inventory. When a challan is `CONFIRMED`, the exact quantity of products is atomically deducted from the `products` table, and an `OUT` record is written to the `stock_movements` table.
2. **Insufficient Stock Protection:** If a user attempts to confirm a challan that requires more stock than currently available, the backend rejects the transaction, preventing negative stock.
3. **Idempotent Seeding:** Running the database seed script uses `upsert` and unique keys (e.g., SKU, ChallanNo, Email) to ensure no duplicate records are ever created during server restarts.

---

## 10. Local Development Setup

### Requirements
- Node.js (v18+)
- PostgreSQL (running locally on port 5432/5433)

### Backend
```bash
cd backend
npm install
# Configure your local .env file
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Configure your local .env file
npm run dev
```

## 11. Environment Variables

**`backend/.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mini_erp"
JWT_SECRET="your-secure-random-secret"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

**`frontend/.env`**
```env
VITE_API_URL="http://localhost:5000"
```

## 12. Production Deployment

### Database Migrations
**DO NOT** use `npx prisma db push` in production.
The backend startup sequence is explicitly defined in `package.json` to handle safe migrations automatically:
```json
"start": "npx prisma migrate deploy && npm run seed && node dist/index.js"
```
This guarantees the Railway database tables are generated and seeded before the API listens for traffic.

### Railway (Backend & Database)
1. Provision a PostgreSQL instance on Railway.
2. Deploy the `backend/` folder to a Railway Node.js service.
3. Set the environment variables (`DATABASE_URL`, `JWT_SECRET`, `PORT`, `FRONTEND_URL`).
4. The deployment will automatically run `npm run build` followed by the safe `start` script.

### Vercel (Frontend)
1. Import the `frontend/` folder into Vercel.
2. Framework: **Vite**.
3. Build Command: `npm run build` | Output Directory: `dist`
4. Set the `VITE_API_URL` environment variable to your Railway domain.
5. The included `vercel.json` ensures React Router SPA refresh behaviors work flawlessly.

## 13. Production URLs & Test Credentials

**Backend API:** `https://mini-erp-crm-portal-production.up.railway.app`
*(Frontend URL provided by Vercel)*

**Demo Accounts (Password for all: `Password123`):**
- `admin@erp.com`
- `sales@erp.com`
- `warehouse@erp.com`
- `accounts@erp.com`

## 14. API Collection & Postman
A Postman collection is maintained alongside this repository. Ensure `baseUrl` is set to the Railway production URL when testing endpoints externally. All endpoints (except `/auth/login`) require the `Authorization: Bearer <token>` header.

## 15. Known Limitations & Future Improvements
- **No File Uploads:** Product images and manual document attachments are currently unsupported.
- **Email Notifications:** Follow-up and low-stock notifications are natively handled in the UI via polling; SMTP email alerts are a future enhancement.
- **Multi-currency:** All calculations and reports are hardcoded to Indian Rupees (₹). 
- **Pagination:** Stock movement history currently fetches the latest 50-100 records natively without strict cursor-based pagination.
