import 'dotenv/config';
import { Client } from 'pg';

async function main() {
  const url = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  
  console.log('--- Environment Check ---');
  if (url) console.log('DATABASE_URL:', url.replace(/:([^@]+)@/, ':****@'));
  if (directUrl) console.log('DIRECT_URL:', directUrl.replace(/:([^@]+)@/, ':****@'));
  
  if (url) {
    console.log('\n--- POOLED Connection Test ---');
    await testConnection(url, 'Pooled');
  }

  if (directUrl) {
    console.log('\n--- DIRECT Connection Test ---');
    await testConnection(directUrl, 'Direct');
  }
}

async function testConnection(connectionString: string, type: string) {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }, 
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    console.log(`✅ [${type}] Connected successfully!`);
    const res = await client.query('SELECT current_user, current_database(), inet_server_addr()');
    console.log(`   User: ${res.rows[0].current_user}`);
    console.log(`   DB: ${res.rows[0].current_database}`);
    console.log(`   Server IP: ${res.rows[0].inet_server_addr}`);
    await client.end();
  } catch (e: any) {
    console.error(`❌ [${type}] Connection Failed:`, e.message);
    if (e.code === '28P01') console.error('   -> Invalid Password/Username');
    if (e.code === '28000') console.error('   -> Invalid Authorization Specification');
    if (e.message.includes('timeout')) console.error('   -> Connection Timed Out (Firewall?)');
  }
}

main();
