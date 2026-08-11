import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export async function notifyRoles(roles: Role[], title: string, message: string) {
  try {
    const users = await prisma.user.findMany({ where: { role: { in: roles } } });
    const notifications = users.map(user => ({
      userId: user.id,
      title,
      message
    }));
    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }
  } catch (err) {
    console.error('Failed to notify roles:', err);
  }
}

export async function notifyUser(userId: string, title: string, message: string) {
  try {
    await prisma.notification.create({
      data: { userId, title, message }
    });
  } catch (err) {
    console.error('Failed to notify user:', err);
  }
}
