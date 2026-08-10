import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import productRoutes from './routes/product.routes';
import challanRoutes from './routes/challan.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app: express.Express = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());

// ── Health Check ────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/challans', challanRoutes);
app.use('/dashboard', dashboardRoutes);

// ── 404 Handler ─────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start Server ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Mini ERP Backend running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});

export default app;
