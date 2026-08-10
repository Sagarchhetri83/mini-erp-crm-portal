import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router: Router = Router();
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
      allProducts,
      statusGroup,
      confirmedSalesAggr,
      followUpCount,
      recentMovements
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
      }),
      prisma.challan.groupBy({
        by: ['status'],
        _count: { _all: true }
      }),
      prisma.challan.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { totalAmount: true },
        _count: { _all: true }
      }),
      prisma.customer.count({
        where: { followUpDate: { not: null } }
      }),
      prisma.stockMovement.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { name: true } } }
      })
    ]);

    // Calculate low stock products based on per-product minStock
    const lowStockProducts = allProducts.filter(p => p.stock <= p.minStock);

    const statusDistribution = {
      DRAFT: statusGroup.find(s => s.status === 'DRAFT')?._count._all || 0,
      CONFIRMED: statusGroup.find(s => s.status === 'CONFIRMED')?._count._all || 0,
      CANCELLED: statusGroup.find(s => s.status === 'CANCELLED')?._count._all || 0,
    };

    const confirmedSalesValue = confirmedSalesAggr._sum.totalAmount || 0;
    const confirmedCount = confirmedSalesAggr._count._all || 0;
    const averageChallanValue = confirmedCount > 0 ? confirmedSalesValue / confirmedCount : 0;

    res.json({
      metrics: {
        totalCustomers,
        totalProducts,
        totalChallans,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: allProducts.filter(p => p.stock === 0).length,
        confirmedSalesValue,
        confirmedCount,
        averageChallanValue,
        statusDistribution,
        followUpCount
      },
      lowStockProducts: lowStockProducts.slice(0, 10), // return top 10 low stock items for dashboard
      recentChallans,
      recentMovements,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
});

export default router;
