import { Router, Request, Response } from 'express';
import { PrismaClient, ChallanStatus, StockMovementType } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);

/**
 * Helper to generate Challan Number
 */
async function generateChallanNo(): Promise<string> {
  const prefix = 'CHL-' + new Date().getFullYear() + '-';
  const lastChallan = await prisma.challan.findFirst({
    where: { challanNo: { startsWith: prefix } },
    orderBy: { challanNo: 'desc' },
  });

  if (!lastChallan) {
    return prefix + '0001';
  }

  const lastNum = parseInt(lastChallan.challanNo.replace(prefix, ''), 10);
  const nextNum = (lastNum + 1).toString().padStart(4, '0');
  return prefix + nextNum;
}

/**
 * POST /challans — Create a new DRAFT challan
 * Body: { customerId: string, items: [{ productId, qty }] }
 */
router.post('/', requireRole('ADMIN', 'SALES'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId, items } = req.body;

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Customer ID and at least one item are required.' });
      return;
    }

    // Verify Customer
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      res.status(404).json({ error: 'Customer not found.' });
      return;
    }

    // Process items and calculate totals
    let totalAmount = 0;
    const challanItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        res.status(400).json({ error: `Product with ID ${item.productId} not found.` });
        return;
      }
      
      const qty = parseInt(item.qty);
      if (isNaN(qty) || qty <= 0) {
        res.status(400).json({ error: `Invalid quantity for product ${product.name}.` });
        return;
      }

      // We do not check stock here since it's just a DRAFT.
      // Stock is checked and deducted upon CONFIRMATION.

      const lineTotal = product.price * qty;
      totalAmount += lineTotal;

      challanItemsData.push({
        productId: product.id,
        productName: product.name, // snapshot
        priceSnapshot: product.price,
        qty: qty,
        lineTotal: lineTotal,
      });
    }

    const challanNo = await generateChallanNo();

    const challan = await prisma.challan.create({
      data: {
        challanNo,
        customerId,
        totalAmount,
        status: 'DRAFT',
        createdById: req.user!.id,
        items: {
          create: challanItemsData,
        },
      },
      include: { items: true, customer: { select: { name: true } } },
    });

    res.status(201).json(challan);
  } catch (err) {
    console.error('Create challan error:', err);
    res.status(500).json({ error: 'Failed to create challan.' });
  }
});

/**
 * GET /challans — List challans
 * Query: ?page=1, ?limit=10, ?search= (challanNo or customer name), ?status=
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const search = (req.query.search as string) || '';
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { challanNo: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status && ['DRAFT', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, mobile: true } },
          createdBy: { select: { name: true } },
        },
      }),
      prisma.challan.count({ where }),
    ]);

    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('List challans error:', err);
    res.status(500).json({ error: 'Failed to fetch challans.' });
  }
});

/**
 * GET /challans/:id — Get challan details
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const challan = await prisma.challan.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        customer: true,
        createdBy: { select: { name: true } },
      },
    });

    if (!challan) {
      res.status(404).json({ error: 'Challan not found.' });
      return;
    }

    res.json(challan);
  } catch (err) {
    console.error('Get challan error:', err);
    res.status(500).json({ error: 'Failed to fetch challan.' });
  }
});

/**
 * POST /challans/:id/confirm — Confirm challan and deduct stock
 */
router.post('/:id/confirm', requireRole('ADMIN', 'SALES', 'WAREHOUSE'), async (req: Request, res: Response): Promise<void> => {
  try {
    const challan = await prisma.challan.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!challan) {
      res.status(404).json({ error: 'Challan not found.' });
      return;
    }

    if (challan.status !== 'DRAFT') {
      res.status(400).json({ error: `Cannot confirm challan. Status is already ${challan.status}.` });
      return;
    }

    // Verify stock for all items
    for (const item of challan.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        res.status(400).json({ error: `Product ${item.productName} no longer exists.` });
        return;
      }
      if (product.stock < item.qty) {
        res.status(400).json({ error: `Insufficient stock for ${item.productName}. Required: ${item.qty}, Available: ${product.stock}.` });
        return;
      }
    }

    // Perform transaction: deduct stock, create movements, update challan status
    const updatedChallan = await prisma.$transaction(async (tx) => {
      for (const item of challan.items) {
        // Deduct stock
        const p = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } },
        });

        // Log movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            qty: item.qty,
            reason: `Sales Challan ${challan.challanNo}`,
            createdById: req.user!.id,
          },
        });
      }

      // Update status
      return tx.challan.update({
        where: { id: challan.id },
        data: { status: 'CONFIRMED' },
        include: { items: true, customer: { select: { name: true } } },
      });
    });

    res.json(updatedChallan);
  } catch (err) {
    console.error('Confirm challan error:', err);
    res.status(500).json({ error: 'Failed to confirm challan.' });
  }
});

/**
 * DELETE /challans/:id — Cancel a DRAFT challan
 */
router.delete('/:id', requireRole('ADMIN', 'SALES'), async (req: Request, res: Response): Promise<void> => {
  try {
    const challan = await prisma.challan.findUnique({ where: { id: req.params.id } });
    if (!challan) {
      res.status(404).json({ error: 'Challan not found.' });
      return;
    }

    if (challan.status !== 'DRAFT') {
      res.status(400).json({ error: `Cannot cancel challan in ${challan.status} status. Only DRAFT challans can be cancelled.` });
      return;
    }

    const cancelled = await prisma.challan.update({
      where: { id: challan.id },
      data: { status: 'CANCELLED' },
    });

    res.json(cancelled);
  } catch (err) {
    console.error('Cancel challan error:', err);
    res.status(500).json({ error: 'Failed to cancel challan.' });
  }
});

export default router;
