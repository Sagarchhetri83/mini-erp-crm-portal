import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router: Router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);

/**
 * GET /search?q=...
 * Global search across Customers, Products, Challans respecting RBAC
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim().length < 2) {
      res.json({ customers: [], products: [], challans: [] });
      return;
    }

    const searchQuery = q.trim();
    const role = req.user!.role;

    const canSearchCustomers = ['ADMIN', 'SALES'].includes(role);
    const canSearchProducts = ['ADMIN', 'WAREHOUSE'].includes(role);
    const canSearchChallans = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'].includes(role);

    const [customers, products, challans] = await Promise.all([
      canSearchCustomers ? prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
            { mobile: { contains: searchQuery, mode: 'insensitive' } },
            { businessName: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 10,
        select: { id: true, name: true, email: true, mobile: true, customerType: true }
      }) : Promise.resolve([]),
      
      canSearchProducts ? prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { sku: { contains: searchQuery, mode: 'insensitive' } },
            { category: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 10,
        select: { id: true, name: true, sku: true, stock: true }
      }) : Promise.resolve([]),

      canSearchChallans ? prisma.challan.findMany({
        where: {
          OR: [
            { challanNo: { contains: searchQuery, mode: 'insensitive' } },
            { customer: { name: { contains: searchQuery, mode: 'insensitive' } } }
          ]
        },
        take: 10,
        include: { customer: { select: { name: true } } }
      }) : Promise.resolve([])
    ]);

    res.json({ customers, products, challans });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed.' });
  }
});

export default router;
