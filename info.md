# Screen Recording Demo Plan: Mini ERP + CRM Operations Portal

**Estimated Duration:** 15–18 minutes

## Pre-Recording Checklist & Safety Rules:

- [ ] Ensure all local `.env` files and environment variable settings in Vercel/Railway are hidden or closed.
- [ ] Verify you have a safe customer and product set up for testing (e.g., a product with 43 stock for the negative test).
- [ ] Log in with an ADMIN account to show all modules, but be ready to mention role restrictions.
- [ ] Have VS Code open to the project root.
- [ ] Have the production app open in the browser.
- [ ] Have Postman, GitHub Actions, Vercel, and Railway tabs ready but safely navigated away from raw secrets.

---

## PART 1 — INTRODUCTION (0:00 - 0:45)
**Screen:** Production Application Login Screen (https://mini-erp-crm-portal-vert.vercel.app)

**Narration:** "Hi, I'm Sagar Chhetri. Today I’ll be walking you through the Mini ERP and CRM Operations Portal, a technical case study I developed based on business requirements provided by Fundsroom.

I approached this project as an end-to-end business operations system rather than just a collection of CRUD pages. The core business problem was that customer data, physical inventory, and sales orders were typically disjointed. I needed to build a unified platform that connects customer management directly to a strict inventory ledger through a sales challan workflow.

The system consists of a React frontend, a Node.js Express backend, and a PostgreSQL database, all secured with role-based access control."

---

## PART 2 — PROBLEM UNDERSTANDING (0:45 - 1:45)
**Screen:** VS Code showing the repository root and `README.md`.

**Narration:** "To solve the disjointed data problem, I broke the system down into distinct operational modules.

First, we have employees with different responsibilities—sales shouldn't manage warehouse inventory, and the warehouse shouldn't view financial analytics. So, a strict role-based access system was mandatory.

Second, the sales team needs a CRM to track customers and follow-ups.

Third, the business needs a reliable inventory system. Not just a current stock number, but a verifiable history of how stock moved in and out.

Finally, these tie together in the Sales Challan workflow, where an order is drafted and eventually confirmed, acting as the exact trigger that securely deducts physical inventory.

Let's quickly look at the technical architecture I designed to support this."

---

## PART 3 — ARCHITECTURE (1:45 - 3:00)
**Screen:** Open the Architecture Mermaid Diagram in the `README.md` file (or a rendered view of it).

**Narration:** "I designed a decoupled client-server architecture.

At the top, users interact with a React and TypeScript frontend, deployed on Vercel. The client communicates via HTTPS and Axios to our Node.js and Express REST API, deployed on Railway.

Every incoming API request hits my authentication and Role-Based Access Control middleware first. Only if the JWT is valid and the user's role has permission does the request proceed to the business logic layer.

The business logic then uses Prisma ORM to interact with our PostgreSQL database, which is also hosted on Railway.

On the operational side, I use Postman for API testing and GitHub Actions for continuous integration to validate every push before it goes live."

---

## PART 4 — DATABASE DESIGN (3:00 - 4:00)
**Screen:** VS Code showing `backend/prisma/schema.prisma`.

**Narration:** "Looking at the database design, I used Prisma to structure a highly normalized relational model.

The core models are User for authentication, Customer for the CRM, and Product for the master inventory.

The most critical relationship is the Sales Challan. I separated Challan, which holds the customer reference and status, from ChallanItem, which holds the individual products.

Notice that ChallanItem stores a priceSnapshot and productName. I designed it this way so that if the master product catalog changes its pricing in the future, historical challans remain completely accurate.

Finally, instead of just updating a product's stock integer, I created a StockMovement ledger that tracks every single IN and OUT transaction, ensuring complete accountability."

---

## PART 5 — AUTHENTICATION + RBAC (4:00 - 5:00)
**Screen:** Production Application Login Screen -> Transition to Dashboard.

**Narration:** "Let's look at the implementation. Authentication is entirely stateless. When I log in, the backend securely compares my password against a bcrypt hash and generates a JSON Web Token.

*(Perform Login)*

The frontend stores this token and attaches it to every API request. The backend middleware decodes it to verify my identity and role.

The system enforces four roles: Admin, Sales, Warehouse, and Accounts. Because I logged in as an Admin, the React context allows me to see all modules in the sidebar. If I were a Sales user, the backend would actively block requests to warehouse routes with a 403 Forbidden error, and the frontend would hide those navigation links."

---

## PART 6 — DASHBOARD (5:00 - 5:45)
**Screen:** Production Application Dashboard.

**Narration:** "Here on the dashboard, we get an immediate operational overview. It pulls real-time analytics from the backend—total revenue, active customers, low-stock warnings, and pending draft challans.

Rather than clicking through multiple pages, administrators and department heads can use this view to understand the current state of the business at a glance."

---

## PART 7 — CUSTOMER CRM (5:45 - 6:45)
**Screen:** Click on the "Customers" tab. Briefly open a Customer Detail view.

**Narration:** "Moving to the CRM module, this is where the sales team operates.

It's not just a contact list; it tracks business names, GST information, customer types—like Retail or Distributor—and their current lead status.

Because the database is fully relational, this CRM ties directly to the sales workflow. When you view a customer, you can track their complete history of sales challans, ensuring the sales team has total context before making follow-up calls."

---

## PART 8 — PRODUCTS + INVENTORY (6:45 - 8:15)
**Screen:** Click on the "Products" tab, then click on "Stock Movements".

**Narration:** "In the inventory module, we maintain the product master data. This tracks SKUs, base pricing, and the minimum stock thresholds.

But the real engineering happens in the Stock Movements ledger.

*(Switch to Stock Movements screen)*

I intentionally designed the system so that users cannot just arbitrarily overwrite a product's stock number. Instead, physical stock is managed by logging an 'IN' or 'OUT' movement with a specific quantity and reason.

When the warehouse receives new items, they log an IN movement. As we'll see next, confirming a sales challan automatically creates an OUT movement. This guarantees that current stock levels are always perfectly traceable."

---

## PART 9 — SALES CHALLAN WORKFLOW (8:15 - 10:15)
**Screen:** Click on "Challans" tab. Click "Create Challan".

**Narration:** "Now for the core business workflow: Sales Challans.

*(Select a customer, add a product, enter a quantity, and save as Draft)*

I'll create a new challan. Notice that it saves as a 'DRAFT'. I intentionally separated creation and confirmation because drafting an order should never prematurely modify physical inventory. The stock hasn't changed yet.

*(Open the Draft Challan, click Confirm)*

Now, I'll confirm the challan. When this happens, the backend receives the request and validates that we actually have enough physical stock. Because we do, the backend deducts the stock, writes an OUT record to the stock ledger, and finalizes the challan.

*(Show the Confirmed status, then click Print)*

Once confirmed, the user can generate a formatted, printable browser-based invoice for the customer."

---

## PART 10 — INSUFFICIENT STOCK TEST (10:15 - 11:15)
**Screen:** Create another Challan. Select a product with known low stock (e.g., 43 available). Enter quantity 999999. Click Confirm.

**Narration:** "Handling failures is just as important as the happy path. Let's test the negative inventory protection.

I'll create a draft challan and request an absurdly high quantity—more than we have in stock.

*(Attempt to Confirm)*

When I try to confirm this, the backend compares the requested amount against the available stock. It immediately rejects the transaction with a 400 Bad Request error.

Crucially, because of how I structured the logic, the challan remains a Draft and the physical inventory remains completely untouched. This business rule prevents the system from ever reaching a negative stock state."

---

## PART 11 — POSTMAN (11:15 - 12:45)
**Screen:** Open Postman. Show `mini_erp_postman_collection.json`.

**Narration:** "To guarantee these business rules are strictly enforced, I built a comprehensive API testing suite in Postman.

The collection is organized by module: Auth, Customers, Products, and Challans.

*(Show the test run summary if available, or just scroll through the requests)*

It includes 53 tests, all passing with zero errors. I tested not just successful CRUD operations, but specifically targeted failure cases—missing JWT tokens, attempting to bypass role restrictions, and the insufficient-stock validation we just saw.

This ensures that the API behaves predictably regardless of what the frontend sends."

---

## PART 12 — GITHUB ACTIONS (12:45 - 13:30)
**Screen:** GitHub Repository -> Actions Tab. Click on the latest successful CI workflow.

**Narration:** "For continuous integration, I implemented GitHub Actions.

This workflow automatically triggers on every push to the main branch. It spins up an Ubuntu environment, cleanly installs dependencies, and runs parallel jobs to type-check and build both the React frontend and the Express backend.

This acts as a strict validation pipeline. It ensures that no syntax errors or breaking TypeScript changes can accidentally make their way into the production deployment."

---

## PART 13 — VERCEL (13:30 - 14:15)
**Screen:** Vercel Dashboard showing the Mini ERP frontend project.

**Narration:** "Speaking of deployment, the frontend is deployed independently on Vercel.

Vercel is hooked directly to the GitHub repository. Whenever a safe commit lands, Vercel pulls the code, executes the Vite build process, and deploys the static React SPA to its edge network.

The application uses SPA routing configured via `vercel.json` and communicates with the production backend using the `VITE_API_URL` environment variable."

---

## PART 14 — RAILWAY (14:15 - 15:15)
**Screen:** Railway Dashboard showing the API and PostgreSQL services.

**Narration:** "The backend API and the database are hosted on Railway.

The Express API runs in a Node.js environment here. During the deployment phase, the build script is configured to safely execute Prisma migrations before starting the Express server. This guarantees the database schema is always in sync with the codebase before accepting traffic.

Again, environment variables are securely injected here, meaning no database URLs or JWT secrets are ever exposed in the source code."

---

## PART 15 — POSTGRESQL (15:15 - 16:00)
**Screen:** Railway PostgreSQL service overview (Safe view, no credentials).

**Narration:** "This is the managed PostgreSQL service provisioned within Railway's private network.

It acts as the single source of truth for the application's persistent state. By utilizing a strictly relational database rather than NoSQL, I can leverage strict foreign key constraints and transactional integrity—which is absolutely vital for an ERP handling financial and inventory data."

---

## PART 16 — DESIGN DECISIONS (16:00 - 17:00)
**Screen:** VS Code showing `backend/src/routes/challan.routes.ts` (specifically around the confirmation logic).

**Narration:** "Before summarizing, I want to highlight a few key engineering decisions I made:

First, choosing React with TypeScript. In a complex dashboard, TypeScript eliminates an entire class of runtime bugs by enforcing data shapes across the client and server.

Second, separating the Stock Movement ledger from the Product catalog. Instead of just mutating a number, creating an append-only ledger ensures the business has a verifiable audit trail of exactly when and why stock changed.

Third, using Prisma `$transaction` blocks for challan confirmation. When confirming a challan, we must deduct stock AND update the challan status. By wrapping these in a database transaction, if the stock deduction fails, the status update automatically rolls back, preventing data corruption."

---

## PART 17 — CHALLENGES AND SOLUTIONS (17:00 - 17:45)
**Screen:** Keep VS Code open on the backend logic, or show the production app dashboard.

**Narration:** "One of the main challenges I encountered was ensuring atomicity during that exact confirmation process.

The challenge was: what happens if a user confirms an order, the stock deducts, but a network failure prevents the invoice status from updating? The business would lose physical stock without a record of the finalized sale.

The solution was strictly enforcing database-level transactions in Prisma and returning explicit 400-level HTTP errors to the frontend. As a result, the backend is highly resilient to partial failures, and inventory remains 100% accurate."

---

## PART 18 — FINAL DEMO SUMMARY (17:45 - 18:15)
**Screen:** Production Application Dashboard.

**Narration:** "To summarize, this project is much more than a user interface.

It is a complete, full-stack operational workflow where the React frontend, the Express API, the relational database, strict business rules, automated API testing, and cloud deployments all work seamlessly together to solve a real business problem for Fundsroom.

Both the frontend and backend are live in production right now. Thank you for watching my technical walkthrough."

---

## Final Checklist Before Recording

- [ ] Introduction
- [ ] Problem/approach
- [ ] Architecture
- [ ] Database
- [ ] Authentication/RBAC
- [ ] Dashboard
- [ ] CRM
- [ ] Inventory
- [ ] Challan workflow
- [ ] Stock validation
- [ ] Postman
- [ ] GitHub Actions
- [ ] Vercel
- [ ] Railway
- [ ] PostgreSQL
- [ ] Challenges/solutions
- [ ] Final summary this one
