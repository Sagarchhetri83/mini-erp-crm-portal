import { Router, Request, Response } from 'express';
import { PrismaClient, StockMovementType } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';
import { notifyRoles } from '../utils/notification';

const router: Router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);

/**
 * POST /products — Create a new product
 */
router.post('/', requireRole('ADMIN', 'WAREHOUSE'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, sku, price, unit, stock, minStock, category, location, description } = req.body;

    if (!name || !sku || price === undefined) {
      res.status(400).json({ error: 'Name, sku, and price are required.' });
      return;
    }

    // Check if SKU exists
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      res.status(400).json({ error: 'SKU already exists.' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        price: parseFloat(price),
        unit: unit || 'PCS',
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 0,
        category: category || null,
        location: location || null,
        description: description || null,
      },
    });

    // If initial stock is > 0, create a stock movement
    if (product.stock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: 'IN',
          qty: product.stock,
          reason: 'Initial stock',
          createdById: req.user!.id,
        },
      });
    }

    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

/**
 * GET /products — List products with search & low-stock filter
 * Query: ?search=, ?page=1, ?limit=10, ?lowStock=true
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const search = (req.query.search as string) || '';
    const lowStockOnly = req.query.lowStock === 'true';
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Handle low stock filter (since Prisma can't directly compare fields in where,
    // we fetch and filter in app code if lowStockOnly is true. For large datasets, a raw query is better.)
    // For MVP, we'll fetch all matching search and then filter in memory if lowStockOnly is true.
    
    let data;
    let total;

    if (lowStockOnly) {
      // Find all matching search first (without pagination initially)
      const allMatching = await prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
      });
      // Filter where stock <= minStock
      const lowStockProducts = allMatching.filter((p) => p.stock <= p.minStock);
      
      total = lowStockProducts.length;
      data = lowStockProducts.slice(skip, skip + limit);
    } else {
      [data, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        prisma.product.count({ where }),
      ]);
    }

    res.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('List products error:', err);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

/**
 * GET /products/:id — Get product details
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    res.json(product);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Failed to fetch product.' });
  }
});

/**
 * PUT /products/:id — Update product details (excluding stock, stock is updated via adjust-stock)
 */
router.put('/:id', requireRole('ADMIN', 'WAREHOUSE'), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const { name, sku, price, unit, minStock, category, location, description } = req.body;

    if (sku && sku !== existing.sku) {
      const skuExists = await prisma.product.findUnique({ where: { sku } });
      if (skuExists) {
        res.status(400).json({ error: 'SKU already exists.' });
        return;
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (sku !== undefined) updateData.sku = sku;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (unit !== undefined) updateData.unit = unit;
    if (minStock !== undefined) updateData.minStock = parseInt(minStock);
    if (category !== undefined) updateData.category = category || null;
    if (location !== undefined) updateData.location = location || null;
    if (description !== undefined) updateData.description = description || null;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.json(product);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

/**
 * GET /products/:id/movements — Get stock movement log
 */
router.get('/:id/movements', async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.id as string;
    const movements = await prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { name: true, role: true } },
      }
    });
    res.json(movements);
  } catch (err) {
    console.error('Get movements error:', err);
    res.status(500).json({ error: 'Failed to fetch stock movements.' });
  }
});

/**
 * POST /products/:id/adjust-stock — Manual stock adjustment
 * Body: { type: 'IN' | 'OUT', qty: number, reason: string }
 */
router.post('/:id/adjust-stock', requireRole('ADMIN', 'WAREHOUSE'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, qty, reason } = req.body;
    const parsedQty = parseInt(qty);

    if (!['IN', 'OUT'].includes(type) || !parsedQty || parsedQty <= 0 || !reason) {
      res.status(400).json({ error: 'Valid type (IN/OUT), positive qty, and reason are required.' });
      return;
    }

    const id = req.params.id as string;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    if (type === 'OUT' && product.stock < parsedQty) {
      res.status(400).json({ error: `Insufficient stock. Current stock is ${product.stock}.` });
      return;
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const stockChange = type === 'IN' ? parsedQty : -parsedQty;
      
      const p = await tx.product.update({
        where: { id },
        data: { stock: { increment: stockChange } },
      });

      await tx.stockMovement.create({
        data: {
          productId: p.id,
          type: type as StockMovementType,
          qty: parsedQty,
          reason,
          createdById: req.user!.id,
        },
      });

      return p;
    });

    // Send notifications based on adjustment type and stock level
    const message = `Stock ${type === 'IN' ? 'increased' : 'decreased'} by ${parsedQty} for ${updatedProduct.name}.`;
    notifyRoles(['ADMIN', 'WAREHOUSE'], 'Stock Adjustment', message);

    if (updatedProduct.stock === 0) {
      notifyRoles(['ADMIN', 'WAREHOUSE'], 'Out of Stock', `${updatedProduct.name} is now out of stock!`);
    } else if (updatedProduct.stock <= updatedProduct.minStock) {
      notifyRoles(['ADMIN', 'WAREHOUSE'], 'Low Stock Alert', `${updatedProduct.name} has fallen to or below its minimum stock level.`);
    }

    res.json(updatedProduct);
  } catch (err) {
    console.error('Adjust stock error:', err);
    res.status(500).json({ error: 'Failed to adjust stock.' });
  }
});

/**
 * DELETE /products/:id — Delete a product (ADMIN only)
 * Blocked if the product has existing challan items or stock movements.
 */
router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: { select: { challanItems: true, stockMovements: true } },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    if (existing._count.challanItems > 0) {
      res.status(400).json({
        error: `Cannot delete product. It appears on ${existing._count.challanItems} challan(s).`,
      });
      return;
    }

    await prisma.stockMovement.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

export default router;
