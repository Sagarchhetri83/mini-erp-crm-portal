# Mini ERP + CRM Operations Portal

A complete Full-Stack web application built as a case study for managing Customers, Inventory, and Sales Challans with role-based access control.

## 🌟 Project Overview
This system is a simplified ERP and CRM designed to help businesses track leads, maintain inventory levels, and process sales challans. It features a robust backend API built with Node.js and an interactive frontend built with React, completely written in strict TypeScript.

### Core Modules:
1. **Authentication & Roles**: Secure JWT-based login with distinct roles (ADMIN, SALES, WAREHOUSE, ACCOUNTS).
2. **Customer CRM**: Manage Retail, Wholesale, and Distributor clients, track their lifecycle (Lead -> Active), and log follow-up notes.
3. **Product Inventory**: Track product stock, define minimum stock thresholds for low-stock alerts, and automatically maintain a ledger of all stock movements (IN/OUT).
4. **Sales Challan**: A transactional module to create sales challans. Confirming a challan automatically deducts inventory and logs the stock movement.
5. **Dashboard**: A high-level view providing key metrics, recent challans, and actionable low-stock alerts.

---

## 🛠️ Tech Stack
- **Backend**: Node.js, Express, TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Frontend**: React (Vite), TypeScript, React Router DOM
- **Styling**: Modern Vanilla CSS with CSS Variables

---

## 📂 Project Structure
The repository is set up as a monorepo containing both the frontend and backend.

```text
mini-erp-crm-portal/
├── backend/                  # Node.js + Express API
│   ├── prisma/               
│   │   ├── schema.prisma     # Database models and relationships
│   │   └── seed.ts           # Script to populate test users
│   ├── src/                  
│   │   ├── middleware/       # JWT auth and Role-based guards
│   │   ├── routes/           # Express route controllers (auth, customers, etc.)
│   │   └── index.ts          # Main Express application entry point
│   ├── .env                  # Database and JWT secrets
│   └── package.json          
│
├── frontend/                 # React + Vite UI
│   ├── src/                  
│   │   ├── components/       # Reusable UI components (Layout, Sidebar)
│   │   ├── context/          # React Context (AuthContext for global state)
│   │   ├── lib/              # Axios API client setup with interceptors
│   │   ├── pages/            # Page components (Dashboard, Customer CRUD, etc.)
│   │   ├── App.tsx           # React Router configuration
│   │   ├── index.css         # Global CSS variables and styles
│   │   └── main.tsx          # React DOM mounting point
│   └── package.json          
│
├── mini_erp_postman_collection.json  # Postman API testing suite
└── README.md
```

---

## 🗄️ Database Schema
The database uses PostgreSQL and is managed by Prisma. Key relationships:
- **User**: Has a `Role` (ADMIN, SALES, WAREHOUSE, ACCOUNTS). Creates Challans and Stock Movements.
- **Customer**: Tracks `CustomerType` (RETAIL, WHOLESALE, DISTRIBUTOR) and `CustomerStatus` (LEAD, ACTIVE, INACTIVE).
- **Product**: Holds current `stock` and `minStock`. Connected to `StockMovement` and `ChallanItem`.
- **Challan**: Linked to a Customer. Contains multiple `ChallanItem`s. Status can be DRAFT, CONFIRMED, or CANCELLED.
- **StockMovement**: A ledger table tracking every addition or deduction of stock for auditing purposes.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL running locally

### 1. Database Setup
Create a database in PostgreSQL named `mini_erp`.
Update `backend/.env` with your PostgreSQL connection string:
`DATABASE_URL="postgresql://postgres:admin@localhost:5432/mini_erp?schema=public"`

### 2. Install & Seed
From the root of the project:
```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Initialize DB and Seed Test Users
cd ../backend
npx prisma generate
npx prisma db push
npm run seed
```

*Test Users created by seed (Password for all: `Password123`):*
- admin@erp.com (Role: ADMIN)
- sales@erp.com (Role: SALES)
- warehouse@erp.com (Role: WAREHOUSE)
- accounts@erp.com (Role: ACCOUNTS)

### 3. Start the Application
You will need two terminal tabs.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
*Backend runs on http://localhost:5000*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*Frontend runs on http://localhost:5173*

---

## 📡 API Documentation
A complete Postman collection is included in the repository. Import `mini_erp_postman_collection.json` into Postman to see all available endpoints, including required headers and JSON payloads.

**Key Endpoints:**
- `POST /auth/login`: Authenticate and receive JWT.
- `GET /dashboard/stats`: Fetch high-level metrics and low-stock alerts.
- `GET /customers`: List customers with search, pagination, and status filters.
- `POST /products/:id/adjust-stock`: Manually adjust inventory levels.
- `POST /challans/:id/confirm`: Confirm a draft sales challan (automatically deducts stock via DB transaction).

---

## ☁️ Deployment
This project is ready to be deployed to standard cloud platforms.

- **Backend (e.g., Render, Heroku)**:
  - Build Command: `npm run build`
  - Start Command: `npm start`
  - Environment Variables required: `DATABASE_URL` and `JWT_SECRET`.
- **Frontend (e.g., Vercel, Netlify)**:
  - Build Command: `npm run build`
  - Output Directory: `dist`
