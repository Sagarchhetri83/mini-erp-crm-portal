import { Router, Request, Response } from 'express';
import { PrismaClient, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { requireAuth, requireRole } from '../middleware/auth';

const router: Router = Router();
const prisma = new PrismaClient();

// Enforce Admin Authentication for all user management routes
router.use(requireAuth);
router.use(requireRole(Role.ADMIN));

/**
 * GET /users
 * Query params: q (search name/email), role, status
 * Returns: { users, summary }
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, role, status } = req.query;

    const whereClause: any = {};

    if (q && typeof q === 'string') {
      const searchStr = q.trim();
      whereClause.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { email: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    if (role && typeof role === 'string' && Object.values(Role).includes(role as Role)) {
      whereClause.role = role as Role;
    }

    if (status && typeof status === 'string' && Object.values(UserStatus).includes(status.toUpperCase() as UserStatus)) {
      whereClause.status = status.toUpperCase() as UserStatus;
    }

    const [users, total, active, inactive, adminCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      prisma.user.count({ where: { status: UserStatus.INACTIVE } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
    ]);

    res.json({
      users,
      summary: {
        total,
        active,
        inactive,
        admin: adminCount,
      },
    });
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

/**
 * GET /users/:id
 * Get details for a single user
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error('Fetch user detail error:', err);
    res.status(500).json({ error: 'Failed to fetch user details.' });
  }
});

/**
 * POST /users
 * Create a new ERP user
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, status } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'Full name, email, password, and role are required.' });
      return;
    }

    if (!Object.values(Role).includes(role)) {
      res.status(400).json({ error: 'Invalid role specified.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: 'A user with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: role as Role,
        status: status && Object.values(UserStatus).includes(status.toUpperCase()) ? (status.toUpperCase() as UserStatus) : UserStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    res.status(201).json({ user: newUser, message: 'User created successfully.' });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

/**
 * PUT /users/:id
 * Update an existing user's profile, role, or status
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, email, role, status } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // Self-Protection Guard: Prevent admin from deactivating or demoting their own logged-in account
    if (req.user && req.user.id === id) {
      if (status === 'INACTIVE' || (role && role !== Role.ADMIN)) {
        res.status(400).json({ error: 'You cannot modify or demote your own administrator account.' });
        return;
      }
    }

    if (email && email !== existingUser.email) {
      const emailCheck = await prisma.user.findUnique({ where: { email } });
      if (emailCheck) {
        res.status(400).json({ error: 'Another user is already using this email address.' });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && Object.values(Role).includes(role) && { role: role as Role }),
        ...(status && Object.values(UserStatus).includes(status.toUpperCase()) && { status: status.toUpperCase() as UserStatus }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ user: updatedUser, message: 'User updated successfully.' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

/**
 * POST /users/:id/reset-password
 * Reset password for a specific user
 */
router.post('/:id/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { password } = req.body;

    if (!password || password.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id },
      data: { password: passwordHash },
    });

    res.json({ success: true, message: 'User password reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset user password.' });
  }
});

/**
 * DELETE /users/:id
 * Delete a user from the system
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    // Self-Protection Guard: Prevent admin from deleting their own account
    if (req.user && req.user.id === id) {
      res.status(400).json({ error: 'You cannot delete your own administrator account.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { challans: true, stockMovements: true }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    if (user._count.challans > 0 || user._count.stockMovements > 0) {
      res.status(400).json({ 
        error: 'Cannot delete user with existing orders or stock movement logs. Please set the user status to INACTIVE instead.' 
      });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

export default router;
