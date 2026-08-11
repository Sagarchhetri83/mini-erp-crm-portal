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
    const loginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@erp.com', password: 'Password123' });
    
    const token = loginRes.token;
    const headers = { 'Authorization': `Bearer ${token}` };

    const customersRes = await request(`${BASE_URL}/customers?limit=100`, { headers });
    const customers = customersRes.data;

    const challansRes = await request(`${BASE_URL}/challans?limit=100`, { headers });
    const challans = challansRes.data;

    const report = [];

    // Filter target customers
    for (const c of customers) {
      if (c.name.includes('Postman Test Customer')) {
        const customerChallans = challans.filter(ch => ch.customerId === c.id);
        
        report.push({
          id: c.id,
          name: c.name,
          email: c.email,
          mobile: c.mobile,
          businessName: c.businessName,
          referencedByChallansCount: customerChallans.length,
          referencedByChallans: customerChallans.map(ch => ch.challanNo)
        });
      }
    }

    console.log(JSON.stringify(report, null, 2));

  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
