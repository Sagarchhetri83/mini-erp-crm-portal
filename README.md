# Mini ERP + CRM Operations Portal

This is a Full Stack Developer case study project. It is a monorepo containing a Node.js/TypeScript + Express backend and a React (Vite) frontend.

## Tech Stack
- **Backend**: Node.js, Express, TypeScript, Prisma (PostgreSQL), JWT Authentication.
- **Frontend**: React, Vite, TypeScript, React Router.

## Current Progress

- **Phase 0 (Foundation)**: Scaffolded backend and frontend. Set up Prisma schema with correct enums and fields (CustomerType, CustomerStatus, Product minStock, etc.). Implemented JWT role-based authentication middleware and routes. Seeded the database with test users.
- **Phase 1 (Customer CRUD)**: Implemented Customer API endpoints (Create, List with pagination/search/filters, Update, Follow-up notes). Built frontend pages (`CustomerList`, `CustomerForm`, `CustomerDetail`).

## How to Run Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL running locally

### Setup

1. **Install Dependencies** (from project root):
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Database Setup**:
   Create a database named `mini_erp`.
   Update `backend/.env` with your PostgreSQL connection string.
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   npm run seed
   ```
   *Test Users created by seed:*
   - admin@erp.com / Password123
   - sales@erp.com / Password123
   - warehouse@erp.com / Password123
   - accounts@erp.com / Password123

3. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   *Runs on http://localhost:5000*

4. **Start Frontend Dev Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Runs on http://localhost:5173*
