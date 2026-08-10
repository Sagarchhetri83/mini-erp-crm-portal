# Mini ERP + CRM Operations Portal

This is a Full Stack Developer case study project. It is a monorepo containing a Node.js/TypeScript + Express backend and a React (Vite) frontend.

## Features Completed
- **Role-Based Access Control**: JWT authentication with ADMIN, SALES, WAREHOUSE, and ACCOUNTS roles.
- **Customer CRM**: Manage customers (Retail, Wholesale, Distributor), track status (Lead, Active, Inactive), and log follow-up notes.
- **Product Inventory**: Track products with unique SKUs. Includes automated low-stock alerts based on per-product `minStock` thresholds.
- **Stock Movements**: Detailed ledger of stock IN/OUT adjustments with user attribution.
- **Sales Challan**: Create draft challans and dynamically add products. Confirming a challan executes a database transaction to deduct stock and record movements automatically.
- **Dashboard**: Real-time metrics and alerts for low inventory.

## Tech Stack
- **Backend**: Node.js, Express, TypeScript, Prisma (PostgreSQL).
- **Frontend**: React, Vite, TypeScript, React Router.

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
   *Test Users created by seed (Password for all: `Password123`):*
   - admin@erp.com
   - sales@erp.com
   - warehouse@erp.com
   - accounts@erp.com

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

## API Testing
A Postman collection is included in the root directory: `mini_erp_postman_collection.json`. Import this into Postman to test all endpoints.

## Deployment
- **Backend (Render / Vercel / Heroku)**: 
  - Build command: `npm run build`
  - Start command: `npm start` (Make sure to set `DATABASE_URL` and `JWT_SECRET` in environment variables).
- **Frontend (Vercel / Netlify)**:
  - Build command: `npm run build`
  - Publish directory: `dist`
