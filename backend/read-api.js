const https = require('https');

function request(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          } else {
            resolve(JSON.parse(body));
          }
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

const BASE_URL = 'https://mini-erp-crm-portal-production.up.railway.app';

async function run() {
  try {
    // 1. Login
    const loginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@erp.com', password: 'Password123' });
    
    const token = loginRes.token;
    const headers = { 'Authorization': `Bearer ${token}` };

    // 2. Fetch all challans
    const challansRes = await request(`${BASE_URL}/challans?limit=100`, { headers });
    const challans = challansRes.data;

    const report = [];

    // 3. For each target challan, fetch details
    for (const c of challans) {
      if (c.challanNo >= 'CHL-2026-0008' && c.challanNo <= 'CHL-2026-0017') {
        const detail = await request(`${BASE_URL}/challans/${c.id}`, { headers });
        
        let stockMovementsCount = 0;
        // 4. For each item in the challan, check if there are stock movements related to this challan
        for (const item of detail.items) {
          const movements = await request(`${BASE_URL}/products/${item.productId}/movements`, { headers });
          const related = movements.filter(m => m.reason.includes(c.challanNo));
          stockMovementsCount += related.length;
        }

        report.push({
          id: c.id,
          challanNo: c.challanNo,
          status: c.status,
          totalAmount: c.totalAmount,
          customer: c.customer.name,
          createdAt: c.createdAt,
          itemsCount: detail.items.length,
          relatedStockMovements: stockMovementsCount
        });
      }
    }

    report.sort((a, b) => a.challanNo.localeCompare(b.challanNo));
    console.log(JSON.stringify(report, null, 2));

  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
