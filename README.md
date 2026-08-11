# Mini ERP + CRM Operations Portal

## 1. Project Overview
The Mini ERP + CRM Operations Portal is a modern, full-stack Business-to-Business (B2B) Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM) application. It is designed to solve operational bottlenecks for businesses by providing centralized real-time inventory tracking, role-based access control, customer management, and sales challans (invoicing) within a unified, premium SaaS dashboard.

## 2. Assignment Coverage

| Requirement | Implementation Status |
| :--- | :--- |
| Authentication & Roles | Completed |
| Customer CRM | Completed |
| Product & Inventory | Completed |
| Sales Challan | Completed |
| REST APIs | Completed |
| React Frontend | Completed |
| Deployment | Completed |
| Postman Testing | Completed |
| Documentation | Completed |

## 3. Core Features
- **JWT authentication:** Secure, stateless login using JSON Web Tokens.
- **RBAC (Role-Based Access Control):** Dedicated views and protected routes for ADMIN, SALES, WAREHOUSE, and ACCOUNTS roles.
- **Customer CRM:** Manage retail, wholesale, and distributor clients with lead status tracking and detailed billing info.
- **Product & Inventory Management:** Full CRUD for inventory including minimum stock thresholds and SKUs.
- **Stock Movement:** Complete logging of IN and OUT stock movements with timestamps and reasons.
- **Sales Challans:** End-to-end sales workflow for creating, viewing, and confirming challans.
- **Automatic Challan Numbering:** Auto-generating sequential document numbers (e.g., CHL-YYYY-0001).
- **Draft/Confirmed Workflow:** Challans begin as drafts, allowing for edits or cancellations before finalization.
- **Stock Deduction:** Atomic stock deductions strictly upon confirmation of a draft challan.
- **Insufficient Stock Protection:** Prevents confirming challans if the required quantities exceed available stock.
- **Search:** Global search capabilities across customers, products, and challan records.
- **Analytics/Dashboard:** Role-based analytics screens detailing performance, recent activities, and key metrics.
- **Notifications:** In-app notification system to alert users of low stock and challan state changes.

## 4. Bonus Features
- **PDF/Printable Document Generation (OPTIONAL/BONUS):** Native capability to generate professional, A4-formatted printable invoices/challans directly from the browser for physical distribution or saving as PDF.

## 5. Tech Stack

**Frontend:**
- React
- Vite
- TypeScript
- React Router
- Axios
- Custom Vanilla CSS (Tailwind-inspired utility classes)

**Backend:**
- Node.js
- Express.js
- TypeScript
- JWT
- bcrypt
- Prisma

**Database:**
- PostgreSQL

**Deployment:**
- Vercel (Frontend)
- Railway (Backend API & PostgreSQL Database)

## 6. Architecture

```text
GitHub
↓
Railway PostgreSQL
↓
Railway Express API
↓
Vercel React Frontend
```

- **Frontend (Vercel):** A React Single Page Application (SPA) responsible for rendering the UI, managing client-side routing, and securely storing the JWT token.
- **Backend (Railway):** A Node.js/Express REST API responsible for handling business logic, validating payloads, enforcing Role-Based Access Control, and orchestrating database transactions.
- **Database (Railway PostgreSQL):** The persistent storage layer holding structured relational data.
- **Prisma (ORM):** Bridges the Express API and PostgreSQL, providing type-safe database queries, schema migrations, and transaction management.

## 7. Project Structure

```text
frontend/                            # React + Vite application
backend/                             # Node.js + Express + Prisma API
mini_erp_postman_collection.json     # 53-test Postman API testing suite
README.md                            # Project documentation
```

## 8. Database Design

The application utilizes a relational database with the following Prisma models:
- **Users:** Stores authentication credentials, roles, and statuses.
- **Customers:** Manages client details, lead status, business names, and GST info.
- **Products:** Stores inventory catalog, SKUs, pricing, and current stock levels.
- **Challans:** The parent invoice records holding statuses, totals, and customer references.
- **Challan Items:** The child line-items storing product snapshots (names, prices) and quantities.
- **Stock Movements:** An append-only ledger tracking all IN and OUT inventory changes.
- **Notifications:** In-app alerts for system events directed at specific users.

## 9. Authentication & RBAC

| Role | Main Access |
| :--- | :--- |
| **ADMIN** | Full system access: Analytics, Customers, Inventory, Challans, User Management. |
| **SALES** | Manage Customers, Create Draft Challans, Confirm Challans. |
| **WAREHOUSE** | View Inventory, Add Stock, Log Stock Movements. |
| **ACCOUNTS** | View Analytics, View Financials, View Challans. |

## 10. Business Rules

- **Draft challans do not reduce stock:** Drafts act as pending orders and do not impact available inventory.
- **Confirmed challans reduce stock:** Confirming a challan initiates an atomic transaction that deducts inventory and writes to the stock movement ledger permanently.
- **Stock cannot become negative:** The system explicitly prevents operations that would drop inventory below zero.
- **Insufficient stock returns an appropriate error:** The backend validates stock levels, and the frontend visually disables the confirmation button while displaying shortage warnings.
- **Product snapshot is stored in challan items:** The product name and price at the time of order creation are copied into the `ChallanItem` to preserve historical integrity even if the master product is later modified.
- **Automatic challan number generation:** Sequential, conflict-free numbering.

## 11. API Overview

The REST API implements standard HTTP verbs with proper status codes. Key endpoints include:

- `POST /auth/login` - Authenticate and receive JWT
- `GET /users` - List system users (Admin only)
- `GET /customers` - List customers with search/pagination
- `POST /customers` - Create a new customer
- `GET /products` - List inventory products
- `POST /products` - Create a new product
- `GET /challans` - List sales challans
- `POST /challans` - Create a new DRAFT challan
- `GET /challans/:id` - Get specific challan details
- `POST /challans/:id/confirm` - Finalize challan and deduct stock
- `DELETE /challans/:id` - Cancel a DRAFT challan
- `GET /analytics/:role` - Fetch role-specific dashboard metrics

## 12. Postman API Testing

### Test Result
- **53 total tests**
- **53 passed**
- **0 failed**
- **0 errors**
- **0 skipped**

The comprehensive Postman collection covers:
- Authentication & Authorization validation
- Customers CRUD operations
- Products & Inventory management
- Sales Challans workflows
- Users & RBAC enforcement
- Negative tests (e.g., unauthorized access, invalid payloads)
- Insufficient stock transaction rejections

The test suite is included in the root directory: `mini_erp_postman_collection.json`.

## 13. Local Development Setup

### Backend
```bash
cd backend
npm install
# Configure your local .env file based on .env.example
npx prisma migrate dev
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Configure your local .env file based on .env.example
npm run dev
```

## 14. Environment Variables

*Note: Create `.env` files locally. Never commit secrets to version control.*

**Backend:**
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `FRONTEND_URL`

**Frontend:**
- `VITE_API_URL`

## 15. Production Deployment

### Backend & Database (Railway)
1. Provision a PostgreSQL instance on Railway.
2. Deploy the `backend/` directory to a Railway Node.js service.
3. Supply the environment variables in Railway's dashboard.
4. The deployment process automatically runs `npm run build`.
5. The explicit start command `npx prisma migrate deploy && npm run seed && node dist/index.js` guarantees that migrations are applied and the database is seeded before the server listens.

### Frontend (Vercel)
1. Import the `frontend/` directory into Vercel.
2. Select **Vite** as the framework.
3. Build command: `tsc -b && vite build`.
4. Output directory: `dist`.
5. Provide the `VITE_API_URL` environment variable pointing to the backend.
6. The `vercel.json` file ensures that React Router Single Page Application (SPA) routing resolves correctly.

## 16. Production URLs

- **Backend:** https://mini-erp-crm-portal-production.up.railway.app
- **Frontend:** https://mini-erp-crm-portal-vert.vercel.app

## 17. Demo Credentials

*(Note: The following are DEMO credentials populated by the database seeder.)*

- admin@erp.com
- sales@erp.com
- warehouse@erp.com
- accounts@erp.com

**Password for all demo accounts:** `Password123`

## 18. Known Limitations

- No product image uploads natively integrated.
- No email notifications; all alerts are managed via the in-app polling UI.
- All monetary values and calculations are fixed to Indian Rupees (INR).
- Limited stock movement pagination (currently fetches a fixed batch of recent records).

## 19. Assignment Submission Checklist

- [x] GitHub repository
- [x] Backend deployed
- [x] Frontend deployed
- [x] PostgreSQL database
- [x] Authentication
- [x] RBAC
- [x] Customer CRM
- [x] Product & Inventory
- [x] Sales Challan
- [x] Postman collection
- [x] API testing
- [x] README
- [ ] Screen recording
- [ ] Final submission

## 20. Future Improvements

- Docker containerization for standardized local setups
- GitHub Actions for CI/CD pipelines
- S3 integration for product images and attachments
- SMTP Email notifications for customer follow-ups and invoices
- Advanced cursor-based pagination across all data grids
- Enhanced Invoice PDF exports utilizing server-side PDF generation libraries
