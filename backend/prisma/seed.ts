import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Users
  const passwordHash = await bcrypt.hash('Password123', 10);
  const users = [
    { name: 'Admin User',     email: 'admin@erp.com',     role: 'ADMIN'     as const },
    { name: 'Sales User',     email: 'sales@erp.com',     role: 'SALES'     as const },
    { name: 'Warehouse User', email: 'warehouse@erp.com', role: 'WAREHOUSE' as const },
    { name: 'Accounts User',  email: 'accounts@erp.com',  role: 'ACCOUNTS'  as const },
  ];

  let adminUserId = '';
  for (const user of users) {
    const upserted = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: passwordHash,
        role: user.role,
      },
    });
    if (user.role === 'ADMIN') adminUserId = upserted.id;
    console.log(`  ✅ User: ${user.role}`);
  }

  // 2. Customers
  const customers = [
    { id: 'seed-cust-1', name: 'John Doe', businessName: 'Tech Innovators', email: 'john@techinnovators.com', mobile: '9876543210', customerType: 'WHOLESALE' as const, status: 'ACTIVE' as const, address: '123 Tech Park, Bangalore', gstNumber: '29ABCDE1234F1Z5' },
    { id: 'seed-cust-2', name: 'Jane Smith', businessName: 'Global Retailers', email: 'jane@globalretail.com', mobile: '9876543211', customerType: 'DISTRIBUTOR' as const, status: 'ACTIVE' as const, address: '456 Business Rd, Mumbai', gstNumber: '27XYZDE1234F1Z5' },
    { id: 'seed-cust-3', name: 'Sam Wilson', businessName: 'Local Shop', email: 'sam@localshop.com', mobile: '9876543212', customerType: 'RETAIL' as const, status: 'LEAD' as const, address: '789 Market St, Delhi' },
    { id: 'seed-cust-4', name: 'Alice Brown', businessName: 'Brown Supplies', email: 'alice@brownsupplies.com', mobile: '9876543213', customerType: 'WHOLESALE' as const, status: 'INACTIVE' as const, address: '101 Industrial Area, Chennai' },
    { id: 'seed-cust-5', name: 'Bob Green', businessName: 'Green Logistics', email: 'bob@greenlogistics.com', mobile: '9876543214', customerType: 'DISTRIBUTOR' as const, status: 'ACTIVE' as const, address: '202 Transport Hub, Hyderabad', gstNumber: '36PQRST1234F1Z5' },
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: {},
      create: { ...c },
    });
  }
  console.log(`  ✅ Seeded ${customers.length} Customers`);

  // 3. Products
  const products = [
    { sku: 'SKU-001', name: 'Wireless Mouse', price: 850, stock: 150, minStock: 20, category: 'Electronics', description: 'Ergonomic wireless mouse' },
    { sku: 'SKU-002', name: 'Mechanical Keyboard', price: 3200, stock: 85, minStock: 15, category: 'Electronics', description: 'RGB mechanical keyboard with blue switches' },
    { sku: 'SKU-003', name: '27-inch Monitor', price: 14500, stock: 30, minStock: 10, category: 'Electronics', description: '4K UHD Monitor' },
    { sku: 'SKU-004', name: 'USB-C Hub', price: 1200, stock: 200, minStock: 50, category: 'Accessories', description: '7-in-1 USB-C Hub' },
    { sku: 'SKU-005', name: 'Laptop Stand', price: 950, stock: 120, minStock: 30, category: 'Accessories', description: 'Adjustable aluminum laptop stand' },
    { sku: 'SKU-006', name: 'Noise Cancelling Headphones', price: 5400, stock: 45, minStock: 10, category: 'Electronics', description: 'Over-ear ANC headphones' },
    { sku: 'SKU-007', name: 'Webcam 1080p', price: 2100, stock: 8, minStock: 15, category: 'Electronics', description: 'HD Webcam with microphone' },
    { sku: 'SKU-008', name: 'Mouse Pad', price: 350, stock: 300, minStock: 50, category: 'Accessories', description: 'Large gaming mouse pad' },
    { sku: 'SKU-009', name: 'Ethernet Cable 5m', price: 250, stock: 500, minStock: 100, category: 'Cables', description: 'Cat6 Ethernet Cable' },
    { sku: 'SKU-010', name: 'HDMI Cable 2m', price: 400, stock: 4, minStock: 20, category: 'Cables', description: 'High-speed HDMI 2.0 cable' },
  ];

  const dbProducts = [];
  for (const p of products) {
    const upserted = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: { ...p },
    });
    dbProducts.push(upserted);
  }
  console.log(`  ✅ Seeded ${products.length} Products`);

  // 4. Challans
  // Challan 1
  const p1 = dbProducts.find(p => p.sku === 'SKU-001')!;
  const p2 = dbProducts.find(p => p.sku === 'SKU-002')!;
  const ch1Total = (p1.price * 10) + (p2.price * 5);
  
  await prisma.challan.upsert({
    where: { challanNo: 'CHL-2026-0001' },
    update: {},
    create: {
      challanNo: 'CHL-2026-0001',
      customerId: 'seed-cust-1',
      status: 'CONFIRMED',
      totalAmount: ch1Total,
      createdById: adminUserId,
      items: {
        create: [
          { productId: p1.id, productName: p1.name, priceSnapshot: p1.price, qty: 10, lineTotal: p1.price * 10 },
          { productId: p2.id, productName: p2.name, priceSnapshot: p2.price, qty: 5, lineTotal: p2.price * 5 },
        ]
      }
    }
  });

  // Challan 2
  const p3 = dbProducts.find(p => p.sku === 'SKU-003')!;
  const p4 = dbProducts.find(p => p.sku === 'SKU-004')!;
  const ch2Total = (p3.price * 2) + (p4.price * 10);
  
  await prisma.challan.upsert({
    where: { challanNo: 'CHL-2026-0002' },
    update: {},
    create: {
      challanNo: 'CHL-2026-0002',
      customerId: 'seed-cust-2',
      status: 'DRAFT',
      totalAmount: ch2Total,
      createdById: adminUserId,
      items: {
        create: [
          { productId: p3.id, productName: p3.name, priceSnapshot: p3.price, qty: 2, lineTotal: p3.price * 2 },
          { productId: p4.id, productName: p4.name, priceSnapshot: p4.price, qty: 10, lineTotal: p4.price * 10 },
        ]
      }
    }
  });

  // Challan 3
  const p5 = dbProducts.find(p => p.sku === 'SKU-006')!;
  const p6 = dbProducts.find(p => p.sku === 'SKU-007')!;
  const p7 = dbProducts.find(p => p.sku === 'SKU-008')!;
  const ch3Total = (p5.price * 3) + (p6.price * 2) + (p7.price * 5);

  await prisma.challan.upsert({
    where: { challanNo: 'CHL-2026-0003' },
    update: {},
    create: {
      challanNo: 'CHL-2026-0003',
      customerId: 'seed-cust-5',
      status: 'CONFIRMED',
      totalAmount: ch3Total,
      createdById: adminUserId,
      items: {
        create: [
          { productId: p5.id, productName: p5.name, priceSnapshot: p5.price, qty: 3, lineTotal: p5.price * 3 },
          { productId: p6.id, productName: p6.name, priceSnapshot: p6.price, qty: 2, lineTotal: p6.price * 2 },
          { productId: p7.id, productName: p7.name, priceSnapshot: p7.price, qty: 5, lineTotal: p7.price * 5 },
        ]
      }
    }
  });
  console.log(`  ✅ Seeded 3 Sales Challans`);

  // 5. Some Stock Movements
  await prisma.stockMovement.upsert({
    where: { id: 'seed-mov-1' },
    update: {},
    create: { id: 'seed-mov-1', productId: p1.id, type: 'IN', qty: 160, reason: 'Initial Stock', createdById: adminUserId }
  });
  await prisma.stockMovement.upsert({
    where: { id: 'seed-mov-2' },
    update: {},
    create: { id: 'seed-mov-2', productId: p1.id, type: 'OUT', qty: 10, reason: 'Challan CHL-2026-0001', createdById: adminUserId }
  });
  await prisma.stockMovement.upsert({
    where: { id: 'seed-mov-3' },
    update: {},
    create: { id: 'seed-mov-3', productId: p7.id, type: 'IN', qty: 10, reason: 'Manual Adjustment', createdById: adminUserId }
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
