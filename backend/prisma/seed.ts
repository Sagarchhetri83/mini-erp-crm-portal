import { PrismaClient, Role, UserStatus, CustomerType, CustomerStatus, ChallanStatus, StockMovementType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Users
  const passwordHash = await bcrypt.hash('Password123', 10);
  const users = [
    { name: 'Admin User',     email: 'admin@erp.com',     role: Role.ADMIN, status: UserStatus.ACTIVE },
    { name: 'Sales User',     email: 'sales@erp.com',     role: Role.SALES, status: UserStatus.ACTIVE },
    { name: 'Warehouse User', email: 'warehouse@erp.com', role: Role.WAREHOUSE, status: UserStatus.ACTIVE },
    { name: 'Accounts User',  email: 'accounts@erp.com',  role: Role.ACCOUNTS, status: UserStatus.ACTIVE },
  ];

  let adminUserId = '';
  for (const user of users) {
    const upserted = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: passwordHash,
        role: user.role,
        status: user.status,
      },
      create: {
        name: user.name,
        email: user.email,
        password: passwordHash,
        role: user.role,
        status: user.status,
      },
    });
    if (user.role === Role.ADMIN) adminUserId = upserted.id;
    console.log(`  ✅ User: ${user.role}`);
  }

  // --- SAFE LEGACY DATA CLEANUP ---
  // Safely remove legacy generic seed data so it doesn't clutter production.
  const legacyProductSkus = ['SKU-001', 'SKU-002', 'SKU-003', 'SKU-004', 'SKU-005', 'SKU-006', 'SKU-007', 'SKU-008', 'SKU-009', 'SKU-010'];
  const legacyChallanNos = ['CHL-2026-0001', 'CHL-2026-0002', 'CHL-2026-0003'];

  // Delete legacy Challan Items manually to avoid foreign key restrict errors
  await prisma.challanItem.deleteMany({
    where: { challan: { challanNo: { in: legacyChallanNos } } }
  });

  // Delete legacy Challans
  await prisma.challan.deleteMany({
    where: { challanNo: { in: legacyChallanNos } }
  });

  // Delete legacy Stock Movements
  await prisma.stockMovement.deleteMany({
    where: { OR: [
      { id: { startsWith: 'seed-mov-' } },
      { product: { sku: { in: legacyProductSkus } } }
    ]}
  });

  // Delete legacy Products
  await prisma.product.deleteMany({
    where: { sku: { in: legacyProductSkus } }
  });
  console.log(`  ✅ Cleaned up legacy demo data`);

  // 2. Customers
  const customers = [
    { id: 'seed-cust-1', name: 'Rajesh Sharma', businessName: 'Sharma Electronics', email: 'rajesh@sharmaelectronics.in', mobile: '9876543210', customerType: CustomerType.RETAIL, status: CustomerStatus.ACTIVE, address: 'Ahmedabad, Gujarat', gstNumber: '24ABCDE1234F1Z5' },
    { id: 'seed-cust-2', name: 'Priya Mehta', businessName: 'Mehta Computer Solutions', email: 'priya@mehtacomputers.in', mobile: '9876543211', customerType: CustomerType.WHOLESALE, status: CustomerStatus.ACTIVE, address: 'Vadodara, Gujarat', gstNumber: '24XYZDE1234F1Z5' },
    { id: 'seed-cust-3', name: 'Amit Patel', businessName: 'Patel IT Distributors', email: 'amit@patelit.in', mobile: '9876543212', customerType: CustomerType.DISTRIBUTOR, status: CustomerStatus.ACTIVE, address: 'Surat, Gujarat', gstNumber: '24PQRST1234F1Z5' },
    { id: 'seed-cust-4', name: 'Neha Shah', businessName: 'Shah Office Systems', email: 'neha@shahofficesys.in', mobile: '9876543213', customerType: CustomerType.WHOLESALE, status: CustomerStatus.LEAD, address: 'Mumbai, Maharashtra', gstNumber: '27LMNOP1234F1Z5' },
    { id: 'seed-cust-5', name: 'Vikram Singh', businessName: 'Singh Digital Store', email: 'vikram@singhdigital.in', mobile: '9876543214', customerType: CustomerType.RETAIL, status: CustomerStatus.INACTIVE, address: 'Pune, Maharashtra', gstNumber: '27UVWXY1234F1Z5' },
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        businessName: c.businessName,
        email: c.email,
        mobile: c.mobile,
        customerType: c.customerType,
        status: c.status,
        address: c.address,
        gstNumber: c.gstNumber,
      },
      create: { ...c },
    });
  }
  console.log(`  ✅ Seeded ${customers.length} Indian Customers`);

  // 3. Products
  const products = [
    { sku: 'DELL-INS-15', name: 'Dell Inspiron 15 Laptop', price: 58999, stock: 45, minStock: 10, category: 'Laptops', description: 'Intel Core i5, 8GB RAM, 512GB SSD', location: 'Warehouse A' },
    { sku: 'HP-LJ-PRO', name: 'HP LaserJet Pro Printer', price: 18499, stock: 12, minStock: 15, category: 'Printers', description: 'Wireless Monochrome Laser Printer', location: 'Warehouse A' }, // Low Stock
    { sku: 'LOG-MK270', name: 'Logitech MK270 Wireless Combo', price: 2199, stock: 150, minStock: 50, category: 'Accessories', description: 'Wireless Keyboard and Mouse Combo', location: 'Warehouse B' },
    { sku: 'TPL-ARCH-C6', name: 'TP-Link Archer C6 Wi-Fi Router', price: 3299, stock: 0, minStock: 20, category: 'Networking', description: 'AC1200 MU-MIMO Gigabit Router', location: 'Warehouse B' }, // Out of Stock
    { sku: 'SAM-MON-24', name: 'Samsung 24-inch LED Monitor', price: 8999, stock: 35, minStock: 10, category: 'Monitors', description: 'FHD IPS Panel with 75Hz refresh rate', location: 'Warehouse A' },
    { sku: 'HIK-CCTV-2MP', name: 'Hikvision 2MP CCTV Camera', price: 1450, stock: 200, minStock: 50, category: 'Security', description: '1080p Bullet Camera', location: 'Warehouse C' },
    { sku: 'DLK-GSW-8P', name: 'D-Link 8-Port Gigabit Switch', price: 1250, stock: 60, minStock: 15, category: 'Networking', description: 'Desktop Gigabit Ethernet Switch', location: 'Warehouse B' },
    { sku: 'SND-USB-128', name: 'SanDisk 128GB USB 3.0 Pen Drive', price: 899, stock: 500, minStock: 100, category: 'Storage', description: 'Cruzer Glide USB Flash Drive', location: 'Warehouse C' },
    { sku: 'BLK-HDMI-2M', name: 'Belkin HDMI Cable 2m', price: 499, stock: 300, minStock: 50, category: 'Cables', description: 'High-Speed HDMI 2.0 Cable', location: 'Warehouse C' },
    { sku: 'LEN-USBC-DCK', name: 'Lenovo USB-C Dock', price: 12999, stock: 8, minStock: 10, category: 'Accessories', description: 'ThinkPad Universal USB-C Dock', location: 'Warehouse A' }, // Low Stock
  ];

  const dbProducts = [];
  for (const p of products) {
    const upserted = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        price: p.price,
        stock: p.stock,
        minStock: p.minStock,
        category: p.category,
        description: p.description,
        location: p.location
      },
      create: { ...p },
    });
    dbProducts.push(upserted);
  }
  console.log(`  ✅ Seeded ${products.length} Products`);

  // 4. Challans
  // Challan 1: Confirmed
  const p1 = dbProducts.find(p => p.sku === 'DELL-INS-15')!;
  const p2 = dbProducts.find(p => p.sku === 'SAM-MON-24')!;
  const p3 = dbProducts.find(p => p.sku === 'LOG-MK270')!;
  const ch1Total = (p1.price * 5) + (p2.price * 5) + (p3.price * 10);
  
  await prisma.challan.upsert({
    where: { challanNo: 'CHL-2026-0001' },
    update: {},
    create: {
      challanNo: 'CHL-2026-0001',
      customerId: 'seed-cust-2', // Priya Mehta (WHOLESALE)
      status: ChallanStatus.CONFIRMED,
      totalAmount: ch1Total,
      createdById: adminUserId,
      items: {
        create: [
          { productId: p1.id, productName: p1.name, priceSnapshot: p1.price, qty: 5, lineTotal: p1.price * 5 },
          { productId: p2.id, productName: p2.name, priceSnapshot: p2.price, qty: 5, lineTotal: p2.price * 5 },
          { productId: p3.id, productName: p3.name, priceSnapshot: p3.price, qty: 10, lineTotal: p3.price * 10 },
        ]
      }
    }
  });

  // Challan 2: Confirmed
  const p4 = dbProducts.find(p => p.sku === 'HIK-CCTV-2MP')!;
  const p5 = dbProducts.find(p => p.sku === 'DLK-GSW-8P')!;
  const p6 = dbProducts.find(p => p.sku === 'BLK-HDMI-2M')!;
  const ch2Total = (p4.price * 20) + (p5.price * 2) + (p6.price * 20);
  
  await prisma.challan.upsert({
    where: { challanNo: 'CHL-2026-0002' },
    update: {},
    create: {
      challanNo: 'CHL-2026-0002',
      customerId: 'seed-cust-3', // Amit Patel (DISTRIBUTOR)
      status: ChallanStatus.CONFIRMED,
      totalAmount: ch2Total,
      createdById: adminUserId,
      items: {
        create: [
          { productId: p4.id, productName: p4.name, priceSnapshot: p4.price, qty: 20, lineTotal: p4.price * 20 },
          { productId: p5.id, productName: p5.name, priceSnapshot: p5.price, qty: 2, lineTotal: p5.price * 2 },
          { productId: p6.id, productName: p6.name, priceSnapshot: p6.price, qty: 20, lineTotal: p6.price * 20 },
        ]
      }
    }
  });

  // Challan 3: Draft
  const p7 = dbProducts.find(p => p.sku === 'HP-LJ-PRO')!;
  const p8 = dbProducts.find(p => p.sku === 'SND-USB-128')!;
  const ch3Total = (p7.price * 2) + (p8.price * 15);

  await prisma.challan.upsert({
    where: { challanNo: 'CHL-2026-0003' },
    update: {},
    create: {
      challanNo: 'CHL-2026-0003',
      customerId: 'seed-cust-1', // Rajesh Sharma (RETAIL)
      status: ChallanStatus.DRAFT,
      totalAmount: ch3Total,
      createdById: adminUserId,
      items: {
        create: [
          { productId: p7.id, productName: p7.name, priceSnapshot: p7.price, qty: 2, lineTotal: p7.price * 2 },
          { productId: p8.id, productName: p8.name, priceSnapshot: p8.price, qty: 15, lineTotal: p8.price * 15 },
        ]
      }
    }
  });
  console.log(`  ✅ Seeded 3 Sales Challans`);

  // 5. Some Stock Movements
  await prisma.stockMovement.upsert({
    where: { id: 'seed-mov-1' },
    update: {},
    create: { id: 'seed-mov-1', productId: p1.id, type: StockMovementType.IN, qty: 50, reason: 'Initial Supplier Purchase', createdById: adminUserId }
  });
  await prisma.stockMovement.upsert({
    where: { id: 'seed-mov-2' },
    update: {},
    create: { id: 'seed-mov-2', productId: p1.id, type: StockMovementType.OUT, qty: 5, reason: 'Sales Challan CHL-2026-0001', createdById: adminUserId }
  });
  await prisma.stockMovement.upsert({
    where: { id: 'seed-mov-3' },
    update: {},
    create: { id: 'seed-mov-3', productId: p4.id, type: StockMovementType.IN, qty: 220, reason: 'Bulk Purchase from Hikvision', createdById: adminUserId }
  });
  await prisma.stockMovement.upsert({
    where: { id: 'seed-mov-4' },
    update: {},
    create: { id: 'seed-mov-4', productId: p4.id, type: StockMovementType.OUT, qty: 20, reason: 'Sales Challan CHL-2026-0002', createdById: adminUserId }
  });
  const tplRouter = dbProducts.find(p => p.sku === 'TPL-ARCH-C6')!;
  await prisma.stockMovement.upsert({
    where: { id: 'seed-mov-5' },
    update: {
      productId: tplRouter.id, type: StockMovementType.OUT, qty: 3, reason: 'Sales Challan CHL-2026-0004 (Archived)'
    },
    create: { id: 'seed-mov-5', productId: tplRouter.id, type: StockMovementType.OUT, qty: 3, reason: 'Sales Challan CHL-2026-0004 (Archived)', createdById: adminUserId }
  });
  console.log(`  ✅ Seeded Stock Movements`);

  console.log('\n🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
