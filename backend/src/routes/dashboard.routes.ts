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

      allCustomersWithFollowUp,
      customerTypeGroup,
      customerStatusGroup,
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
      prisma.customer.findMany({
        where: { followUpDate: { not: null } },
        select: { followUpDate: true }
      }),
      prisma.customer.groupBy({
        by: ['customerType'],
        _count: { _all: true }
      }),
      prisma.customer.groupBy({
        by: ['status'],
        _count: { _all: true }
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

    const customerTypeDistribution = {
      RETAIL: customerTypeGroup.find(c => c.customerType === 'RETAIL')?._count._all || 0,
      WHOLESALE: customerTypeGroup.find(c => c.customerType === 'WHOLESALE')?._count._all || 0,
      DISTRIBUTOR: customerTypeGroup.find(c => c.customerType === 'DISTRIBUTOR')?._count._all || 0,
    };

    const customerStatusDistribution = {
      LEAD: customerStatusGroup.find(c => c.status === 'LEAD')?._count._all || 0,
      ACTIVE: customerStatusGroup.find(c => c.status === 'ACTIVE')?._count._all || 0,
      INACTIVE: customerStatusGroup.find(c => c.status === 'INACTIVE')?._count._all || 0,
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let followUpOverdue = 0;
    let followUpToday = 0;
    let followUpUpcoming = 0;

    allCustomersWithFollowUp.forEach(c => {
      const date = new Date(c.followUpDate!);
      if (date < today) followUpOverdue++;
      else if (date >= today && date < tomorrow) followUpToday++;
      else followUpUpcoming++;
    });

    res.json({
      metrics: {
        totalCustomers,
        totalProducts,
        totalChallans,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: allProducts.filter(p => p.stock === 0).length,
        inStockCount: allProducts.filter(p => p.stock > p.minStock).length,
        confirmedSalesValue,
        confirmedCount,
        averageChallanValue,
        statusDistribution,
        customerTypeDistribution,
        customerStatusDistribution,
        followUps: {
          overdue: followUpOverdue,
          today: followUpToday,
          upcoming: followUpUpcoming,
          total: allCustomersWithFollowUp.length
        }
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
