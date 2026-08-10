import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);

/**
 * GET /dashboard/stats
 * Returns key metrics and recent data for the dashboard.
 */
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalCustomers,
      totalProducts,
      totalChallans,
      recentChallans,
      allProducts
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.challan.count(),
      prisma.challan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true } } },
      }),
      prisma.product.findMany({
        select: { id: true, name: true, sku: true, stock: true, minStock: true },
      })
    ]);

    // Calculate low stock products based on per-product minStock
    const lowStockProducts = allProducts.filter(p => p.stock <= p.minStock);

    res.json({
      metrics: {
        totalCustomers,
        totalProducts,
        totalChallans,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts: lowStockProducts.slice(0, 10), // return top 10 low stock items for dashboard
      recentChallans,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
});

export default router;
