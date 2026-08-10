import { Router, Request, Response } from 'express';
import { PrismaClient, CustomerType, CustomerStatus } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';

const router: Router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(requireAuth);

/**
 * POST /customers — Create a new customer
 */
router.post('/', requireRole('ADMIN', 'SALES'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, mobile, email, businessName, customerType, status, address, gstNumber, followUpDate, notes } = req.body;

    // Validate required fields
    if (!name || !mobile || !customerType) {
      res.status(400).json({ error: 'Name, mobile, and customerType are required.' });
      return;
    }

    // Validate enum values
    if (!['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'].includes(customerType)) {
      res.status(400).json({ error: 'customerType must be RETAIL, WHOLESALE, or DISTRIBUTOR.' });
      return;
    }

    if (status && !['LEAD', 'ACTIVE', 'INACTIVE'].includes(status)) {
      res.status(400).json({ error: 'status must be LEAD, ACTIVE, or INACTIVE.' });
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email: email || null,
        businessName: businessName || null,
        customerType: customerType as CustomerType,
        status: (status as CustomerStatus) || 'LEAD',
        address: address || null,
        gstNumber: gstNumber || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes: notes || null,
      },
    });

    res.status(201).json(customer);
  } catch (err: any) {
    console.error('Create customer error:', err);
    res.status(500).json({ error: 'Failed to create customer.' });
  }
});

/**
 * GET /customers — List customers with search & pagination
 * Query params: ?search=, ?page=1, ?limit=10, ?status=, ?customerType=
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const search = (req.query.search as string) || '';
    const statusFilter = req.query.status as string;
    const typeFilter = req.query.customerType as string;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search by name or mobile
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
      ];
    }

    // Filter by status
    if (statusFilter && ['LEAD', 'ACTIVE', 'INACTIVE'].includes(statusFilter)) {
      where.status = statusFilter;
    }

    // Filter by customer type
    if (typeFilter && ['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'].includes(typeFilter)) {
      where.customerType = typeFilter;
    }

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('List customers error:', err);
    res.status(500).json({ error: 'Failed to fetch customers.' });
  }
});

/**
 * GET /customers/:id — Get customer detail
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found.' });
      return;
    }

    res.json(customer);
  } catch (err) {
    console.error('Get customer error:', err);
    res.status(500).json({ error: 'Failed to fetch customer.' });
  }
});

/**
 * PUT /customers/:id — Update customer
 */
router.put('/:id', requireRole('ADMIN', 'SALES'), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Customer not found.' });
      return;
    }

    const { name, mobile, email, businessName, customerType, status, address, gstNumber, followUpDate, notes } = req.body;

    // Validate required fields if provided
    if (name !== undefined && !name) {
      res.status(400).json({ error: 'Name cannot be empty.' });
      return;
    }
    if (mobile !== undefined && !mobile) {
      res.status(400).json({ error: 'Mobile cannot be empty.' });
      return;
    }

    if (customerType && !['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'].includes(customerType)) {
      res.status(400).json({ error: 'customerType must be RETAIL, WHOLESALE, or DISTRIBUTOR.' });
      return;
    }

    if (status && !['LEAD', 'ACTIVE', 'INACTIVE'].includes(status)) {
      res.status(400).json({ error: 'status must be LEAD, ACTIVE, or INACTIVE.' });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (email !== undefined) updateData.email = email || null;
    if (businessName !== undefined) updateData.businessName = businessName || null;
    if (customerType !== undefined) updateData.customerType = customerType;
    if (status !== undefined) updateData.status = status;
    if (address !== undefined) updateData.address = address || null;
    if (gstNumber !== undefined) updateData.gstNumber = gstNumber || null;
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate ? new Date(followUpDate) : null;
    if (notes !== undefined) updateData.notes = notes || null;

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    res.json(customer);
  } catch (err) {
    console.error('Update customer error:', err);
    res.status(500).json({ error: 'Failed to update customer.' });
  }
});

/**
 * POST /customers/:id/followup — Add a follow-up (updates followUpDate and appends to notes)
 * Body: { followUpDate: "2024-01-15", note: "Called customer, interested in bulk order" }
 */
router.post('/:id/followup', requireRole('ADMIN', 'SALES'), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Customer not found.' });
      return;
    }

    const { followUpDate, note } = req.body;

    if (!followUpDate && !note) {
      res.status(400).json({ error: 'Provide followUpDate and/or note.' });
      return;
    }

    const updateData: any = {};

    // Update follow-up date
    if (followUpDate) {
      updateData.followUpDate = new Date(followUpDate);
    }

    // Append note with timestamp to existing notes
    if (note) {
      const timestamp = new Date().toISOString();
      const newEntry = `[${timestamp}] ${note}`;
      updateData.notes = existing.notes
        ? `${existing.notes}\n${newEntry}`
        : newEntry;
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    res.json(customer);
  } catch (err) {
    console.error('Follow-up error:', err);
    res.status(500).json({ error: 'Failed to add follow-up.' });
  }
});

export default router;
